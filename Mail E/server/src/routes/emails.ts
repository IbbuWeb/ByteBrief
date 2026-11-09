import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { query } from "../db/index";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const { accountId, folder = "inbox", limit = 50, offset = 0 } = req.query;
  const params: unknown[] = [req.userId];
  let accountFilter = "";
  if (accountId) {
    params.push(accountId);
    accountFilter = `AND e.account_id = $${params.length}`;
  }
  params.push(folder, limit, offset);
  const result = await query(
    `SELECT e.id, e.message_id, e.thread_id, e.subject, e.from_name, e.from_email,
            e.to_emails, e.cc_emails, e.body_text, e.body_html, e.snippet,
            e.is_read, e.is_flagged, e.is_draft, e.is_spam, e.is_trashed,
            e.folder, e.received_at, e.sent_at, e.created_at,
            a.email as account_email, a.provider
     FROM emails e
     JOIN accounts a ON a.id = e.account_id
     WHERE a.user_id = $1 ${accountFilter} AND e.folder = $${params.length - 2}
     ORDER BY e.received_at DESC NULLS LAST
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  res.json({ emails: result.rows });
});

router.get("/:id", authenticate, async (req, res) => {
  const result = await query(
    `SELECT e.*, a.email as account_email
     FROM emails e JOIN accounts a ON a.id = e.account_id
     WHERE e.id = $1 AND a.user_id = $2`,
    [req.params.id, req.userId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Email not found" });
  }
  res.json({ email: result.rows[0] });
});

router.patch("/:id/read", authenticate, async (req, res) => {
  const { id } = req.params;
  await query(
    `UPDATE emails e SET is_read = TRUE, updated_at = NOW()
     FROM accounts a WHERE a.id = e.account_id AND e.id = $1 AND a.user_id = $2`,
    [id, req.userId]
  );
  res.json({ ok: true });
});

router.patch("/:id/trash", authenticate, async (req, res) => {
  const { id } = req.params;
  await query(
    `UPDATE emails e SET is_trashed = TRUE, folder = 'trash', updated_at = NOW()
     FROM accounts a WHERE a.id = e.account_id AND e.id = $1 AND a.user_id = $2`,
    [id, req.userId]
  );
  res.json({ ok: true });
});

router.patch("/:id/archive", authenticate, async (req, res) => {
  const { id } = req.params;
  await query(
    `UPDATE emails e SET folder = 'archive', updated_at = NOW()
     FROM accounts a WHERE a.id = e.account_id AND e.id = $1 AND a.user_id = $2`,
    [id, req.userId]
  );
  res.json({ ok: true });
});

export { router as emailsRouter };
