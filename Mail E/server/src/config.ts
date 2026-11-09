import crypto from "crypto";

export const MASTER_KEY = process.env.MAIL_ENCRYPTION_MASTER_KEY;
export const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
export const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";
export const PORT = parseInt(process.env.PORT || "4000", 10);

if (!MASTER_KEY || MASTER_KEY.length < 32) {
  console.warn(
    "WARNING: MAIL_ENCRYPTION_MASTER_KEY is missing or too short. Generate one with: openssl rand -hex 32"
  );
}
