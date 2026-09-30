# Postgres runbook

Fembo uses PostgreSQL in all environments. Local development runs Postgres through Docker Compose.

## Local setup

```bash
npm run db:up
cp .env.example .env
npm run db:migrate
npm run db:seed
```

Default connection string:

```env
DATABASE_URL="postgresql://fembo:fembo@localhost:5432/fembo"
```

## Production migration

Apply the baseline migration on a fresh database:

```bash
npm run db:migrate:prod
npm run db:seed
```

For an existing SQLite deployment, export data separately and import into Postgres before cutover. The baseline migration creates the full schema; it does not migrate SQLite file contents automatically.

## Backup

Requires `pg_dump` on your PATH and a PostgreSQL `DATABASE_URL`.

```bash
npm run db:backup
# or with a custom output path
node scripts/db-backup.mjs ./backups/manual.sql
```

Backups are plain SQL files suitable for `psql` restore.

## Restore

Restore into an empty or disposable database:

```bash
npm run db:restore -- ./backups/fembo-2026-09-18.sql
```

Verify the app against the restored database before routing production traffic.

## Rollback checklist

1. Put the app in maintenance mode (`MAINTENANCE_MODE=1`).
2. Restore the latest backup with `npm run db:restore`.
3. Redeploy the previous application version if schema drifted.
4. Smoke-test auth, chat, and billing webhooks.
5. Clear maintenance mode.
