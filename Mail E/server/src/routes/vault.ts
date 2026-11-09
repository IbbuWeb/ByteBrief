import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { query } from "../db/index";
import { encrypt, decrypt } from "../services/encryption";

const router = Router();

router.get("/credentials", authenticate, async (req, res) => {
  const userId = req.userId;
  const accounts = await query(
    `SELECT id, provider, email, imap_host, imap_port, smtp_host, smtp_port, is_active
     FROM accounts WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  res.json({ credentials: accounts.rows });
});

router.post("/credentials", authenticate, async (req, res) => {
  const { provider, email, password, imapHost, imapPort, smtpHost, smtpPort } = req.body;
  if (!provider || !email || !password) {
    return res.status(400).json({ error: "Provider, email, and password required" });
  }

  const userId = req.userId;
  const userResult = await query(
    "SELECT master_key_encrypted FROM users WHERE id = $1",
    [userId]
  );
  if (userResult.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const { masterKeyEncrypted } = userResult.rows[0];
  // The client provides the decrypted master key via header for this request
  const masterKey = req.headers["x-master-key"] as string;
  if (!masterKey) {
    return res.status(400).json({ error: "Master key required" });
  }

  const passwordEncrypted = await encrypt(password, masterKey);
  const accountId = require("crypto").randomUUID();
  await query(
    `INSERT INTO accounts (id, user_id, provider, email, access_token_encrypted, imap_host, imap_port, smtp_host, smtp_port)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [accountId, userId, provider, email, passwordEncrypted, imapHost || null, imapPort || null, smtpHost || null, smtpPort || null]
  );
  res.json({ id: accountId, provider, email });
});

export { router as vaultRouter };
