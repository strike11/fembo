import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function storageConfig(env: NodeJS.ProcessEnv = process.env) {
  const endpoint = env.STORAGE_ENDPOINT?.trim();
  const bucket = env.STORAGE_BUCKET?.trim();
  const accessKeyId = env.STORAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.STORAGE_SECRET_ACCESS_KEY?.trim();
  const publicUrl = env.STORAGE_PUBLIC_URL?.trim();
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }
  return { endpoint, bucket, accessKeyId, secretAccessKey, publicUrl };
}

function getClient(env: NodeJS.ProcessEnv = process.env) {
  const config = storageConfig(env);
  if (!config) return null;
  if (!client) {
    client = new S3Client({
      endpoint: config.endpoint,
      region: "auto",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return { client, ...config };
}

export function getPublicUrl(key: string, env: NodeJS.ProcessEnv = process.env) {
  const config = storageConfig(env);
  if (!config) return key;
  const normalized = key.replace(/^\/+/, "");
  if (config.publicUrl) {
    return `${config.publicUrl.replace(/\/+$/, "")}/${normalized}`;
  }
  return `${config.endpoint.replace(/\/+$/, "")}/${config.bucket}/${normalized}`;
}

export function resolveAssetUrl(path: string, env: NodeJS.ProcessEnv = process.env) {
  const trimmed = path.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("s3://")) {
    const key = trimmed.slice("s3://".length).replace(/^[^/]+\//, "");
    return getPublicUrl(key, env);
  }
  if (trimmed.startsWith("/custom/")) {
    const key = trimmed.replace(/^\/custom\//, "custom/");
    return getPublicUrl(key, env);
  }
  if (!trimmed.startsWith("/") && !trimmed.includes("://")) {
    return getPublicUrl(trimmed, env);
  }
  return trimmed;
}

export function resolveAssetDir(path: string, env: NodeJS.ProcessEnv = process.env) {
  const resolved = resolveAssetUrl(path, env);
  return resolved.replace(/\/[^/?#]+$/, "");
}

export async function uploadAsset(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  env: NodeJS.ProcessEnv = process.env,
) {
  const runtime = getClient(env);
  if (!runtime) {
    throw new Error("Object storage is not configured");
  }
  const normalized = key.replace(/^\/+/, "");
  await runtime.client.send(
    new PutObjectCommand({
      Bucket: runtime.bucket,
      Key: normalized,
      Body: body,
      ContentType: contentType,
    }),
  );
  return getPublicUrl(normalized, env);
}

export async function deleteAsset(key: string, env: NodeJS.ProcessEnv = process.env) {
  const runtime = getClient(env);
  if (!runtime) {
    throw new Error("Object storage is not configured");
  }
  const normalized = key.replace(/^\/+/, "");
  await runtime.client.send(
    new DeleteObjectCommand({
      Bucket: runtime.bucket,
      Key: normalized,
    }),
  );
}
