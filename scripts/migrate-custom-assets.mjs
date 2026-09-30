#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const root = process.cwd();
const customRoot = join(root, "public", "custom");

function storageConfig() {
  const endpoint = process.env.STORAGE_ENDPOINT?.trim();
  const bucket = process.env.STORAGE_BUCKET?.trim();
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY?.trim();
  const publicUrl = process.env.STORAGE_PUBLIC_URL?.trim();
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("Storage env vars are required");
  }
  return { endpoint, bucket, accessKeyId, secretAccessKey, publicUrl };
}

function publicUrlFor(key) {
  const { endpoint, bucket, publicUrl } = storageConfig();
  const normalized = key.replace(/^\/+/, "");
  if (publicUrl) {
    return `${publicUrl.replace(/\/+$/, "")}/${normalized}`;
  }
  return `${endpoint.replace(/\/+$/, "")}/${bucket}/${normalized}`;
}

function walkFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walkFiles(full));
    else files.push(full);
  }
  return files;
}

function contentTypeFor(file) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

async function main() {
  const config = storageConfig();
  const client = new S3Client({
    endpoint: config.endpoint,
    region: "auto",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });

  let files = [];
  try {
    files = walkFiles(customRoot);
  } catch {
    console.log("No public/custom directory found; nothing to migrate.");
    return;
  }

  const prisma = new PrismaClient();
  const slugToPortrait = new Map();

  for (const file of files) {
    const rel = relative(customRoot, file).replace(/\\/g, "/");
    const key = `custom/${rel}`;
    const body = readFileSync(file);
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: contentTypeFor(file),
      }),
    );

    const slug = rel.split("/")[0];
    if (slug && !rel.includes("/nude-") && /(?:^|\/)smile\.png$/i.test(rel)) {
      slugToPortrait.set(slug, publicUrlFor(key));
    }
    if (slug && rel.endsWith(`${slug}.png`)) {
      slugToPortrait.set(slug, publicUrlFor(key));
    }
    console.log(`Uploaded ${key}`);
  }

  for (const [slug, url] of slugToPortrait) {
    const updated = await prisma.companionPreset.updateMany({
      where: {
        slug,
        avatarPath: { startsWith: "/custom/" },
      },
      data: { avatarPath: url },
    });
    if (updated.count > 0) {
      console.log(`Updated avatarPath for ${slug}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
