#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const databaseUrl = process.env.DATABASE_URL?.trim();
const input = process.argv[2];

if (!databaseUrl || !/^postgres(ql)?:\/\//.test(databaseUrl)) {
  console.error("DATABASE_URL must be a PostgreSQL URL");
  process.exit(1);
}

if (!input) {
  console.error("Usage: node scripts/db-restore.mjs <backup.sql>");
  process.exit(1);
}

const sql = readFileSync(input);
const result = spawnSync("psql", [databaseUrl], {
  input: sql,
  stdio: ["pipe", "inherit", "inherit"],
});

if (result.status !== 0) {
  console.error("psql restore failed");
  process.exit(result.status ?? 1);
}

console.log(`Restored ${input}`);
