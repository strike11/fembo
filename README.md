<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/logo-white.png">
    <img src="public/images/logo-black.png" alt="Fembo" width="280">
  </picture>
</p>

<p align="center">
  A cute, gentle place to talk with supportive femboy companions.<br>
  Replies arrive as text and as speech in the same thread.
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white">
  <img alt="PostgreSQL 16" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white">
</p>

<p align="center">
  <b>16+ · SFW only</b>
</p>

---

Fembo is a small companion house. Pick someone, tune how shy or bold they are, then stay in one thread for chat and voice calls. Registration asks for a date of birth and an explicit confirmation. Plus can create a custom companion.

## The house

| | | |
| --- | --- | --- |
| **Chat** | One thread that keeps going until you reset it. | Pin a memory, or say “remember …” |
| **Calls** | They pick up, speak in short lines, and listen again. | Piper runs in the browser |
| **Your femboy** | Five portraits, or a custom one with Plus. | Shy or bold, a voice, a name for you |

<p align="center">
  <img src="public/companions/aki.png" alt="Aki" width="132">
  <img src="public/companions/ren.png" alt="Ren" width="132">
  <img src="public/companions/miko.png" alt="Miko" width="132">
  <img src="public/companions/nico.png" alt="Nico" width="132">
  <img src="public/companions/mint.png" alt="Mint" width="132">
</p>

<p align="center">
  <sub><b>Aki</b> · shy &nbsp;&nbsp; <b>Ren</b> · teasing &nbsp;&nbsp; <b>Miko</b> · sleepy &nbsp;&nbsp; <b>Nico</b> · fox &nbsp;&nbsp; <b>Mint</b> · cat</sub>
</p>

## Run it locally

You need:

- [Node.js](https://nodejs.org) 20.9 or newer
- [Docker](https://www.docker.com) with Compose, for Postgres
- [Ollama](https://ollama.com), for local chat

### 1. Install dependencies

```bash
npm install
```

That also copies the in-browser speech assets.

### 2. Create `.env`

macOS, Linux, and PowerShell:

```bash
cp .env.example .env
```

Command Prompt:

```bat
copy .env.example .env
```

Open `.env` and replace `BETTER_AUTH_SECRET` with a long random value:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Local chat already points at Ollama on `http://127.0.0.1:11434` with the `tinydolphin` model. Leave the commented production keys alone.

### 3. Start Postgres

```bash
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:seed
```

The database from `.env.example` is:

```env
DATABASE_URL="postgresql://fembo:fembo@localhost:5432/fembo"
```

Backup and restore steps live in [docs/postgres-runbook.md](docs/postgres-runbook.md).

### 4. Pull the chat model

Start Ollama, then:

```bash
ollama pull tinydolphin
```

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Voices

Piper voices download in the browser the first time you use them. On a companion’s configure page you can pick a catalog voice, type another Piper voice id, or keep your own `.onnx` and `.json` files on this machine. Skipping the download leaves the thread on text.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run test` | Node test runner |
| `npm run db:up` | Start Postgres in Docker |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Apply migrations in development |
| `npm run db:seed` | Seed companions |
| `npm run tts:assets` | Copy Piper and ONNX files into `public/` |
