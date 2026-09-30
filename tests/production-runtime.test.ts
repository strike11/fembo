import assert from "node:assert/strict";
import test from "node:test";
import {
  fallbackChatProviderId,
  resolveChatModel,
  resolveChatProviderId,
} from "../src/lib/chat-provider";
import {
  DEFAULT_OPENROUTER_MODEL,
  isAllowedOpenRouterModel,
  OPENROUTER_MODEL_ALLOWLIST,
} from "../src/lib/chat-provider/model-allowlist";
import { productionEnvErrors } from "../src/lib/env";
import { getPublicUrl, resolveAssetUrl } from "../src/lib/storage";

const validProductionEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://app:secret@db.example.com:5432/fembo",
  BETTER_AUTH_SECRET: "a-production-secret-with-32-characters",
  BETTER_AUTH_URL: "https://fembo.example.com",
  CHAT_PROVIDER: "openrouter",
  OPENROUTER_API_KEY: "openrouter-secret",
  OPENROUTER_MODEL: DEFAULT_OPENROUTER_MODEL,
  PAYMENT_PROVIDER: "stripe",
  STRIPE_SECRET_KEY: "stripe-secret",
  STRIPE_WEBHOOK_SECRET: "webhook-secret",
  STORAGE_ENDPOINT: "https://objects.example.com",
  STORAGE_PUBLIC_URL: "https://cdn.example.com/fembo",
  STORAGE_BUCKET: "fembo",
  STORAGE_ACCESS_KEY_ID: "storage-access",
  STORAGE_SECRET_ACCESS_KEY: "storage-secret",
};

test("provider selection defaults to openrouter in production when key is set", () => {
  assert.equal(
    resolveChatProviderId({
      NODE_ENV: "production",
      OPENROUTER_API_KEY: "secret",
    }),
    "openrouter",
  );
  assert.equal(
    resolveChatProviderId({
      NODE_ENV: "development",
      CHAT_PROVIDER: "ollama",
    }),
    "ollama",
  );
});

test("provider fallback is dev-only", () => {
  assert.equal(
    fallbackChatProviderId("ollama", {
      NODE_ENV: "development",
      OPENROUTER_API_KEY: "secret",
    }),
    "openrouter",
  );
  assert.equal(
    fallbackChatProviderId("ollama", {
      NODE_ENV: "production",
      OPENROUTER_API_KEY: "secret",
    }),
    null,
  );
});

test("openrouter model allowlist rejects unknown models", () => {
  assert.ok(isAllowedOpenRouterModel(DEFAULT_OPENROUTER_MODEL));
  assert.ok(!isAllowedOpenRouterModel("vendor/unknown-model"));
  assert.ok(OPENROUTER_MODEL_ALLOWLIST.length >= 3);
  assert.throws(
    () =>
      resolveChatModel({
        NODE_ENV: "test",
        CHAT_PROVIDER: "openrouter",
        OPENROUTER_MODEL: "vendor/unknown-model",
      } as NodeJS.ProcessEnv),
    /allowlist/,
  );
});

test("production environment contract requires openrouter chat settings", () => {
  assert.deepEqual(productionEnvErrors(validProductionEnv), []);
  const errors = productionEnvErrors({
    ...validProductionEnv,
    CHAT_PROVIDER: "ollama",
    OPENROUTER_MODEL: "vendor/unknown-model",
    STORAGE_PUBLIC_URL: "http://cdn.example.com",
  });
  assert.ok(errors.includes("CHAT_PROVIDER must be openrouter in production"));
  assert.ok(errors.includes("OPENROUTER_MODEL must be in the server allowlist"));
  assert.ok(errors.includes("STORAGE_PUBLIC_URL must use https"));
});

test("resolveAssetUrl maps custom and storage keys to public URLs", () => {
  const env = {
    NODE_ENV: "test",
    STORAGE_ENDPOINT: "https://objects.example.com",
    STORAGE_PUBLIC_URL: "https://cdn.example.com/fembo",
    STORAGE_BUCKET: "fembo",
    STORAGE_ACCESS_KEY_ID: "key",
    STORAGE_SECRET_ACCESS_KEY: "secret",
  } as NodeJS.ProcessEnv;

  assert.equal(
    resolveAssetUrl("/custom/aki/smile.png", env),
    "https://cdn.example.com/fembo/custom/aki/smile.png",
  );
  assert.equal(
    resolveAssetUrl("s3://fembo/custom/aki/smile.png", env),
    "https://cdn.example.com/fembo/custom/aki/smile.png",
  );
  assert.equal(
    resolveAssetUrl("custom/aki/smile.png", env),
    "https://cdn.example.com/fembo/custom/aki/smile.png",
  );
  assert.equal(resolveAssetUrl("/companions/aki.png", env), "/companions/aki.png");
  assert.equal(
    getPublicUrl("custom/aki/smile.png", env),
    "https://cdn.example.com/fembo/custom/aki/smile.png",
  );
});
