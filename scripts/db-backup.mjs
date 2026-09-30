#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl || !/^postgres(ql)?:\/\//.test(databaseUrl)) {
  console.error("DATABASE_URL must be a PostgreSQL URL");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = process.argv[2] ?? join(root, "backups", `fembo-${stamp}.sql`);
mkdirSync(dirname(output), { recursive: true });

const result = spawnSync("pg_dump", ["--no-owner", "--no-acl", "--format=plain", databaseUrl], {
  encoding: "buffer",
  stdio: ["ignore", "pipe", "inherit"],
});

if (result.status !== 0) {
  console.error("pg_dump failed");
  process.exit(result.status ?? 1);
}

writeFileSync(output, result.stdout);
console.log(`Backup written to ${output}`);
