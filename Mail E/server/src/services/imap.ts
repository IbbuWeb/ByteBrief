import Imap from "node-imap";
import { simpleParser } from "mailparser";
import { query } from "../db/index";
import { decrypt } from "./encryption";

interface ImapAccount {
  id: string;
  email: string;
  accessTokenEncrypted?: string | null;
  imapHost?: string | null;
  imapPort?: number | null;
}

function imapConfig(account: ImapAccount, password: string) {
  return {
    user: account.email,
    password,
    host: account.imapHost || "imap.gmail.com",
    port: account.imapPort || 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  };
}

function parseFlags(flags: string[]) {
  const isRead = flags.includes("\\Seen");
  const isFlagged = flags.includes("\\Flagged");
  return { isRead, isFlagged };
}

export async function syncAccountEmails(account: ImapAccount, masterKey: string) {
  const password = account.accessTokenEncrypted
    ? await decrypt(account.accessTokenEncrypted, masterKey)
    : "";

  const config = imapConfig(account, password);
  const imap = new Imap(config as any);

  await new Promise<void>((resolve, reject) => {
    imap.once("ready", resolve as () => void);
    imap.once("error", reject);
    imap.connect();
  });

  const emails: any[] = await new Promise((resolve, reject) => {
    imap.openBox("inbox", false, (err: any) => {
      if (err) return reject(err);
      imap.search(["ALL"], (err: any, results: number[]) => {
        if (err) return reject(err);
        if (!results || results.length === 0) {
          imap.end();
          return resolve([]);
        }
        const fetch = imap.fetch(results, { bodies: [], struct: true });
        const collected: any[] = [];
        fetch.on("message", (msg: any) => {
          const parts: any = {};
          msg.on("body", (stream: any, info: any) => {
            let buffer = "";
            stream.on("data", (chunk: any) => (buffer += chunk.toString("utf8")));
            stream.on("end", () => {
              parts[info.which] = buffer;
            });
          });
          msg.on("attributes", (attrs: any) => {
            const { isRead, isFlagged } = parseFlags(attrs.flags || []);
            parts.flags = { isRead, isFlagged };
            parts.uid = attrs.uid;
          });
          msg.on("end", () => collected.push(parts));
        });
        fetch.on("end", () => {
          imap.end();
          resolve(collected);
        });
        fetch.on("error", reject);
      });
    });
  });

  let stored = 0;
  for (const raw of emails) {
    try {
      const parsed = await simpleParser(raw.body?.["header.text"] || raw.body || "");
      const messageId = parsed.messageId || `imap-${Date.now()}-${Math.random()}`;
      const subject = parsed.subject || "";
      const from = (parsed.from as any)?.value?.[0] || {};
      const to = (parsed.to as any)?.value?.map((a: any) => a.address) || [];
      const bodyText = parsed.text || "";
      const bodyHtml = parsed.html || "";
      const snippet = (bodyText || bodyHtml || "").slice(0, 200);
      const receivedAt = parsed.date ? new Date(parsed.date) : new Date();

      const existing = await query(
        "SELECT id FROM emails WHERE account_id = $1 AND message_id = $2",
        [account.id, messageId]
      );
      if ((existing.rowCount ?? 0) > 0) continue;

      await query(
        `INSERT INTO emails (account_id, message_id, subject, from_name, from_email, to_emails, body_text, body_html, snippet, is_read, is_flagged, folder, received_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'inbox',$12)`,
        [
          account.id,
          messageId,
          subject,
          (from as any).name || "",
          (from as any).address || "",
          to,
          bodyText,
          bodyHtml,
          snippet,
          raw.flags?.isRead ?? false,
          raw.flags?.isFlagged ?? false,
          receivedAt,
        ]
      );
      stored++;
    } catch {
      continue;
    }
  }

  return { stored, total: emails.length };
}
