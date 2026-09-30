import assert from "node:assert/strict";
import test from "node:test";
import {
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
  PRIVACY_CONTACT,
  SUPPORT_EMAIL as PRIVACY_SUPPORT_EMAIL,
} from "../src/app/privacy/page";
import {
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
  SUPPORT_EMAIL as TERMS_SUPPORT_EMAIL,
} from "../src/app/terms/page";
import { productionEnvErrors } from "../src/lib/env";
import {
  PAYMENT_PROVIDER_IDS,
  claimWebhookEvent,
  createMemoryWebhookEventStore,
  paymentProviderEnvErrors,
  resetWebhookEventStore,
  resolvePaymentProviderId,
  setWebhookEventStore,
  webhookEventDedupeKey,
} from "../src/lib/payments";
import { DEFAULT_OPENROUTER_MODEL } from "../src/lib/chat-provider/model-allowlist";
import {
  PROHIBITED_CONTENT_CATEGORIES,
  preModelModerationCheck,
} from "../src/lib/moderation";

function env(overrides: Record<string, string | undefined> = {}) {
  return { NODE_ENV: "test", ...overrides } as NodeJS.ProcessEnv;
}

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

test("payment provider resolution supports stripe default and explicit ids", () => {
  assert.equal(resolvePaymentProviderId(env({ PAYMENT_PROVIDER: "stripe" })), "stripe");
  assert.equal(resolvePaymentProviderId(env({ PAYMENT_PROVIDER: "ccbill" })), "ccbill");
  assert.equal(resolvePaymentProviderId(env({ STRIPE_SECRET_KEY: "secret" })), "stripe");
  assert.deepEqual(PAYMENT_PROVIDER_IDS, ["stripe", "ccbill", "segpay"]);
});

test("payment provider env validation is provider-specific", () => {
  assert.deepEqual(paymentProviderEnvErrors(env({ PAYMENT_PROVIDER: "stripe" })), [
    "STRIPE_SECRET_KEY is required when PAYMENT_PROVIDER=stripe",
    "STRIPE_WEBHOOK_SECRET is required when PAYMENT_PROVIDER=stripe",
  ]);
  assert.deepEqual(
    paymentProviderEnvErrors(
      env({
        PAYMENT_PROVIDER: "stripe",
        STRIPE_SECRET_KEY: "secret",
        STRIPE_WEBHOOK_SECRET: "whsec",
      }),
    ),
    [],
  );
  assert.ok(
    paymentProviderEnvErrors(env({ PAYMENT_PROVIDER: "ccbill" })).some((error) =>
      error.includes("CCBILL_ACCOUNT_NUMBER"),
    ),
  );
  assert.ok(
    paymentProviderEnvErrors(env({ PAYMENT_PROVIDER: "segpay" })).some((error) =>
      error.includes("SEGPAY_MERCHANT_ID"),
    ),
  );
  assert.ok(
    paymentProviderEnvErrors(env({ PAYMENT_PROVIDER: "ccbill" })).some((error) =>
      error.includes("not implemented"),
    ),
  );
});

test("production env contract includes payment provider abstraction", () => {
  assert.deepEqual(productionEnvErrors(validProductionEnv), []);
  const errors = productionEnvErrors({
    ...validProductionEnv,
    PAYMENT_PROVIDER: "ccbill",
    CCBILL_ACCOUNT_NUMBER: "123",
    CCBILL_SUB_ACCOUNT: "0001",
    CCBILL_WEBHOOK_SECRET: "secret",
  });
  assert.ok(errors.some((error) => error.includes("not implemented")));
});

test("webhook idempotency claim contract deduplicates by provider and event id", async () => {
  setWebhookEventStore(createMemoryWebhookEventStore());
  try {
    assert.equal(webhookEventDedupeKey("stripe", "evt_test_123"), "stripe:evt_test_123");

    const first = await claimWebhookEvent("stripe", "evt_test_123", "checkout.session.completed");
    const second = await claimWebhookEvent("stripe", "evt_test_123", "checkout.session.completed");
    const otherProvider = await claimWebhookEvent("ccbill", "evt_test_123", "NewSaleSuccess");

    assert.equal(first.claimed, true);
    assert.equal(second.claimed, false);
    assert.equal(otherProvider.claimed, true);
  } finally {
    resetWebhookEventStore();
  }
});

test("terms page exports production policy metadata", () => {
  assert.equal(TERMS_SUPPORT_EMAIL, "support@example.com");
  assert.ok(TERMS_LAST_UPDATED.length >= 10);
  assert.ok(TERMS_SECTIONS.includes("AI-generated content"));
  assert.ok(TERMS_SECTIONS.includes("Subscriptions, billing, and refunds"));
  assert.ok(TERMS_SECTIONS.includes("Moderation and enforcement"));
  assert.ok(TERMS_SECTIONS.length >= 8);
});

test("privacy page exports production policy metadata", () => {
  assert.equal(PRIVACY_SUPPORT_EMAIL, "support@example.com");
  assert.equal(PRIVACY_CONTACT, "privacy@example.com");
  assert.ok(PRIVACY_LAST_UPDATED.length >= 10);
  assert.ok(PRIVACY_SECTIONS.includes("AI providers and inference"));
  assert.ok(PRIVACY_SECTIONS.includes("Retention"));
  assert.ok(PRIVACY_SECTIONS.includes("Deletion and export"));
  assert.ok(PRIVACY_SECTIONS.includes("Payment processors"));
  assert.ok(PRIVACY_SECTIONS.length >= 10);
});

test("moderation stubs define prohibited categories and block age-play cues", () => {
  assert.ok(PROHIBITED_CONTENT_CATEGORIES.includes("minors_or_age_play"));
  assert.ok(PROHIBITED_CONTENT_CATEGORIES.includes("non_consensual_content"));
  assert.equal(preModelModerationCheck("hello companion").blocked, false);
  assert.equal(preModelModerationCheck("age-play scene").blocked, true);
});
