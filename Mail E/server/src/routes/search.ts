import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { query } from "../db/index";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ results: [] });
  }
  const searchTerm = `%${q}%`;
  const result = await query(
    `SELECT e.id, e.subject, e.from_name, e.from_email, e.snippet, e.folder,
            e.received_at, a.email as account_email
     FROM emails e JOIN accounts a ON a.id = e.account_id
     WHERE a.user_id = $1
       AND (e.subject ILIKE $2 OR e.from_email ILIKE $2 OR e.body_text ILIKE $2)
       AND e.is_trashed = FALSE
     ORDER BY e.received_at DESC NULLS LAST
     LIMIT 50`,
    [req.userId, searchTerm]
  );
  res.json({ results: result.rows });
});

export { router as searchRouter };
