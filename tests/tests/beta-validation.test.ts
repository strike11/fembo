import assert from "node:assert/strict";
import test from "node:test";
import {
  ANALYTICS_EVENTS,
  canViewAdminMetrics,
  isAnalyticsEventName,
  sanitizeAnalyticsMetadata,
} from "../../src/lib/analytics";

test("analytics event names match beta plan", () => {
  const expected = [
    "signup",
    "first_chat",
    "10_messages",
    "visual_open",
    "call_start",
    "d1_return",
    "d7_return",
    "quota_hit",
    "checkout_start",
    "paid",
    "cancel",
    "provider_error",
  ];
  assert.deepEqual([...ANALYTICS_EVENTS], expected);
  for (const name of expected) {
    assert.equal(isAnalyticsEventName(name), true);
  }
  assert.equal(isAnalyticsEventName("message_sent"), false);
});

test("sanitizeAnalyticsMetadata strips message-like fields", () => {
  const sanitized = sanitizeAnalyticsMetadata({
    slug: "aki",
    content: "secret user message",
    message: "another secret",
    nested: {
      text: "hidden transcript",
      count: 3,
    },
    history: [{ role: "user", content: "hello" }],
    provider: "openrouter",
  });

  assert.deepEqual(sanitized, {
    slug: "aki",
    nested: { count: 3 },
    provider: "openrouter",
  });
  assert.equal("content" in sanitized, false);
  assert.equal("message" in sanitized, false);
  assert.equal("history" in sanitized, false);
});

test("sanitizeAnalyticsMetadata truncates long strings", () => {
  const long = "x".repeat(400);
  const sanitized = sanitizeAnalyticsMetadata({ code: long });
  assert.equal(typeof sanitized.code, "string");
  assert.equal((sanitized.code as string).length, 200);
});

test("canViewAdminMetrics allows dev and ADMIN_EMAILS in production", () => {
  assert.equal(canViewAdminMetrics("anyone@example.com", { NODE_ENV: "development" }), true);

  const prodEnv = {
    NODE_ENV: "production",
    ADMIN_EMAILS: "ops@fembo.test, admin@fembo.test",
  };
  assert.equal(canViewAdminMetrics("ops@fembo.test", prodEnv), true);
  assert.equal(canViewAdminMetrics("stranger@example.com", prodEnv), false);
  assert.equal(canViewAdminMetrics(undefined, prodEnv), false);
  assert.equal(canViewAdminMetrics("ops@fembo.test", { NODE_ENV: "production", ADMIN_EMAILS: "" }), false);
});
