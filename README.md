# Fembo

A cute, gentle web space for talking with supportive femboy companions. Replies arrive as text and as speech in the same thread.

Fembo is 16+ and SFW only. Registration asks for a date of birth and an explicit confirmation. Create your own custom femboy with Plus.

## Stack

- Next.js App Router
- PostgreSQL + Prisma
- better-auth (httpOnly cookies, Argon2id passwords)
- Local [Ollama](https://ollama.com) for conversation
- [Piper TTS](https://github.com/rhasspy/piper) in the browser for speech
- Web Speech API for the microphone

## Setup

1. Install [Ollama](https://ollama.com). Docker is optional.
2. Copy environment variables:

```bash
copy .env.example .env
```

3. Put a long random value in `BETTER_AUTH_SECRET`.
4. Start Postgres and apply migrations:

```bash
npm run db:up
npx prisma generate
npm run db:migrate
npm run db:seed
```

Local dev uses `DATABASE_URL=postgresql://fembo:fembo@localhost:5432/fembo` from `.env.example`. See [docs/postgres-runbook.md](docs/postgres-runbook.md) for backup and restore steps.

5. Pull the chat model:

```bash
ollama pull tinydolphin
```

6. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Voices

Piper voices download into the browser on first use. On the companion configure page you can pick a soft catalog voice, type another Piper voice id, or store your own `.onnx` + `.json` files locally.
