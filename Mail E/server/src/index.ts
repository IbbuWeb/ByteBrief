import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/error";
import { authRouter } from "./routes/auth";
import { vaultRouter } from "./routes/vault";
import { accountsRouter } from "./routes/accounts";
import { emailsRouter } from "./routes/emails";
import { searchRouter } from "./routes/search";
import { runMigrations } from "./db/migrate";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "maile-server" });
});

app.use("/api/auth", authRouter);
app.use("/api/vault", vaultRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/emails", emailsRouter);
app.use("/api/search", searchRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
  await runMigrations();
  console.log(`MailE server listening on http://localhost:${PORT}`);
});
