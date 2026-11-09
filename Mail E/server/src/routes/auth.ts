import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/auth";
import { query } from "../db/index";
import { hashPassword, verifyPassword } from "../services/encryption";
import { JWT_SECRET, SESSION_SECRET } from "../config";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Email and password (min 8 chars) required" });
  }

  const existing = await query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );
  if ((existing.rowCount ?? 0) > 0) {
    return res.status(409).json({ error: "User already exists" });
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const masterKey = require("crypto").randomBytes(32).toString("hex");
  const { encrypt } = require("../services/encryption");
  const masterKeyEncrypted = await encrypt(masterKey, password);

  await query(
    "INSERT INTO users (id, email, password_hash, master_key_encrypted) VALUES ($1, $2, $3, $4)",
    [userId, email, passwordHash, masterKeyEncrypted]
  );

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ userId, email });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rowCount === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const user = result.rows[0];
  const valid = await verifyPassword(user.password_hash, password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ userId: user.id, email: user.email });
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", authenticate, async (req, res) => {
  const result = await query(
    "SELECT id, email, created_at FROM users WHERE id = $1",
    [req.userId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(result.rows[0]);
});

export { router as authRouter };
