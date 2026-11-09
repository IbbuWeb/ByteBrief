import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DB_LOG === "true") {
    console.log("executed query", { text, duration, rows: res.rowCount });
  }
  return res;
}

export async function closePool() {
  await pool.end();
}
