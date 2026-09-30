import assert from "node:assert/strict";
import test from "node:test";
import { productionEnvErrors } from "../src/lib/env";
import { canDevUnlock } from "../src/lib/plus";

const validProductionEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://app:secret@db.example.com:5432/fembo",
  BETTER_AUTH_SECRET: "a-production-secret-with-32-characters",
  BETTER_AUTH_URL: "https://fembo.example.com",
  CHAT_PROVIDER: "openrouter",
  OPENROUTER_API_KEY: "openrouter-secret",
  OPENROUTER_MODEL: "google/gemma-2-9b-it:free",
  PAYMENT_PROVIDER: "stripe",
  STRIPE_SECRET_KEY: "stripe-secret",
  STRIPE_WEBHOOK_SECRET: "webhook-secret",
  STORAGE_ENDPOINT: "https://objects.example.com",
  STORAGE_PUBLIC_URL: "https://cdn.example.com/fembo",
  STORAGE_BUCKET: "fembo",
  STORAGE_ACCESS_KEY_ID: "storage-access",
  STORAGE_SECRET_ACCESS_KEY: "storage-secret",
};

test("production dev unlock is always disabled", () => {
  const mutableEnv = process.env as Record<string, string | undefined>;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousStripeKey = process.env.STRIPE_SECRET_KEY;
  try {
    mutableEnv.NODE_ENV = "production";
    delete mutableEnv.STRIPE_SECRET_KEY;
    assert.equal(canDevUnlock(), false);

    mutableEnv.NODE_ENV = "development";
    assert.equal(canDevUnlock(), true);
  } finally {
    if (previousNodeEnv === undefined) delete mutableEnv.NODE_ENV;
    else mutableEnv.NODE_ENV = previousNodeEnv;
    if (previousStripeKey === undefined) delete mutableEnv.STRIPE_SECRET_KEY;
    else mutableEnv.STRIPE_SECRET_KEY = previousStripeKey;
  }
});

test("production environment contract accepts complete configuration", () => {
  assert.deepEqual(productionEnvErrors(validProductionEnv), []);
});

test("production environment contract rejects local-only infrastructure", () => {
  const errors = productionEnvErrors({
    ...validProductionEnv,
    DATABASE_URL: "file:./dev.db",
    BETTER_AUTH_URL: "http://localhost:3000",
    CHAT_PROVIDER: "ollama",
    OPENROUTER_API_KEY: "",
    OPENROUTER_MODEL: "vendor/unknown-model",
    PAYMENT_PROVIDER: "dev",
    STORAGE_ENDPOINT: "",
    STORAGE_PUBLIC_URL: "",
  });

  assert.ok(errors.some((error) => error.startsWith("DATABASE_URL")));
  assert.ok(errors.includes("BETTER_AUTH_URL must use https"));
  assert.ok(errors.includes("BETTER_AUTH_URL must use a public hostname"));
  assert.ok(errors.includes("CHAT_PROVIDER must be openrouter in production"));
  assert.ok(errors.some((error) => error.startsWith("PAYMENT_PROVIDER")));
  assert.ok(errors.includes("STORAGE_ENDPOINT is required"));
});
