# Deployment

## Docker Compose (Recommended)

```bash
docker compose up --build
```

This starts PostgreSQL, the MailE API, and the frontend (served via nginx).

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Session signing secret | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `MAIL_ENCRYPTION_MASTER_KEY` | Master encryption key (32+ bytes hex) | Yes |
| `CLIENT_URL` | Frontend origin for CORS | No |
| `PORT` | API port (default 4000) | No |
| `NODE_ENV` | `development` or `production` | No |

Generate secrets:
```bash
openssl rand -hex 32   # SESSION_SECRET, JWT_SECRET, MAIL_ENCRYPTION_MASTER_KEY
```

## Backups

```bash
docker compose exec postgres pg_dump -U maile maile > backup.sql
```

Restore:
```bash
cat backup.sql | docker compose exec -T postgres psql -U maile maile
```

## OAuth2

For Gmail/Outlook integration, configure OAuth2 credentials in the Google Cloud Console and Azure Portal, then set the appropriate env variables. The app supports IMAP/SMTP as a fallback for other providers.
