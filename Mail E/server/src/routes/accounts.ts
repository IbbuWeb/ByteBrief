import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { query } from "../db/index";
import { syncAccountEmails } from "../services/imap";
import { decrypt } from "../services/encryption";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const result = await query(
    `SELECT id, provider, email, imap_host, imap_port, smtp_host, smtp_port, is_active, created_at
     FROM accounts WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.userId]
  );
  res.json({ accounts: result.rows });
});

router.patch("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  await query(
    "UPDATE accounts SET is_active = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
    [isActive, id, req.userId]
  );
  res.json({ ok: true });
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  await query("DELETE FROM accounts WHERE id = $1 AND user_id = $2", [
    id,
    req.userId,
  ]);
  res.json({ ok: true });
});

router.post("/sync", authenticate, async (req, res) => {
  const masterKey = req.headers["x-master-key"] as string;
  if (!masterKey) {
    return res.status(400).json({ error: "Master key required" });
  }

  const result = await query(
    `SELECT id, email, imap_host, imap_port, access_token_encrypted
     FROM accounts WHERE user_id = $1 AND is_active = TRUE`,
    [req.userId]
  );

  let totalStored = 0;
  let totalEmails = 0;
  const errors: string[] = [];

  for (const row of result.rows) {
    try {
      const password = row.access_token_encrypted
        ? await decrypt(row.access_token_encrypted, masterKey)
        : "";
      const account = {
        id: row.id,
        email: row.email,
        accessTokenEncrypted: row.access_token_encrypted,
        imapHost: row.imap_host,
        imapPort: row.imap_port,
      };
      const result2 = await syncAccountEmails(account, masterKey);
      totalStored += result2.stored;
      totalEmails += result2.total;
    } catch (err: any) {
      errors.push(`${row.email}: ${err.message}`);
    }
  }

  res.json({ synced: totalStored, total: totalEmails, errors });
});

export { router as accountsRouter };
