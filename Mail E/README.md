# MailE

Private email management application. Manage Gmail, Outlook, and IMAP/SMTP accounts from one unified inbox.

## Architecture

- `server/` — Node.js + Express + TypeScript backend API + PostgreSQL
- `client/` — React + TypeScript + Vite + Tailwind CSS frontend
- `docker/` — Dockerfiles and nginx config
- `docker-compose.yml` — Self-hosted stack (PostgreSQL + API + frontend)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for self-hosting)
- PostgreSQL (for local dev without Docker)

## Local Development

### Backend
```bash
cd server
cp .env.example .env
# edit .env with your secrets
npm install
npm run migrate      # run DB migrations (requires PostgreSQL)
npm run dev          # start on http://localhost:4000
```

### Frontend
```bash
cd client
npm install
npm run dev          # start on http://localhost:5173
```

The frontend proxies `/api` to `http://localhost:4000` via Vite.

## Self-Hosting (Docker)

```bash
cp server/.env.example .env   # at repo root, or edit docker-compose env
docker compose up --build
```

Services:
- PostgreSQL: port 5432
- API: port 4000
- Frontend (nginx): port 80

## Features

- Multi-account Gmail / Outlook / IMAP
- Unified inbox
- Encrypted credential vault (Argon2id + AES-256-GCM)
- Master password
- Send / reply / delete / archive
- Search across accounts
- Dark & light themes
- Docker Compose self-hosting

## Security

- Never stores passwords in plaintext
- OAuth2 where supported
- AES-256-GCM encryption at rest
- Argon2id key derivation
- HttpOnly, SameSite session cookies

See `docs/` for deployment details.
