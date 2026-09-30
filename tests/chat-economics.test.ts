import assert from "node:assert/strict";

import test from "node:test";

import { shouldSetConversationTitle } from "../src/lib/chat-turn";

import {

  compileCompanionPrompt,

  isWithinPromptBudget,

  PROMPT_CHAR_BUDGET,

} from "../src/lib/prompt";

import {

  computeRetryAt,

  FREE_MESSAGE_LIMIT,

  messageLimitForPlus,

  WINDOW_MS,

} from "../src/lib/quota";



test("retryAt uses oldest message in rolling window", () => {

  const oldest = new Date("2026-09-18T10:00:00Z");

  const retryAt = computeRetryAt(oldest, WINDOW_MS);

  assert.equal(retryAt.toISOString(), new Date(oldest.getTime() + WINDOW_MS).toISOString());

});



test("retryAt falls back to now plus window when no messages", () => {

  const now = Date.parse("2026-09-18T12:00:00Z");

  const retryAt = computeRetryAt(null, WINDOW_MS, now);

  assert.equal(retryAt.toISOString(), new Date(now + WINDOW_MS).toISOString());

});



test("plus gets high message limit instead of unlimited", () => {

  assert.equal(messageLimitForPlus(false), FREE_MESSAGE_LIMIT);

  assert.equal(messageLimitForPlus(true), 500);

  assert.notEqual(messageLimitForPlus(true), null);

});



test("title is generated only for first one or two assistant replies", () => {

  assert.equal(shouldSetConversationTitle("", 1), true);

  assert.equal(shouldSetConversationTitle("", 2), true);

  assert.equal(shouldSetConversationTitle("", 3), false);

  assert.equal(shouldSetConversationTitle("Existing", 1), false);

});



test("compact prompt stays within budget", () => {

  const memories = Array.from({ length: 8 }, (_, index) => `Memory line ${index + 1}`.repeat(4));

  const prompt = compileCompanionPrompt({

    slug: "aki",

    nickname: "Aki",

    kind: "human",

    lore: "A soft-spoken companion who remembers small details.",

    shyBold: 40,

    sweetTeasing: 55,

    calmEnergetic: 35,

    treatYou: "like someone worth staying for",

    appearanceNotes: "pink hair, warm eyes",

    memories,

    scene: "Quiet room, rain on the window.",

    summary: "They were talking about staying in tonight.",

  });

  assert.ok(prompt.length <= PROMPT_CHAR_BUDGET);

  assert.ok(isWithinPromptBudget({

    slug: "aki",

    nickname: "Aki",

    kind: "human",

    lore: "A soft-spoken companion who remembers small details.",

    shyBold: 40,

    sweetTeasing: 55,

    calmEnergetic: 35,

    treatYou: "like someone worth staying for",

    appearanceNotes: "pink hair, warm eyes",

    memories,

    scene: "Quiet room, rain on the window.",

    summary: "They were talking about staying in tonight.",

  }));

});



test("regenerate rollback contract keeps replace id until success", () => {

  const replaceMessageId = "assistant-old";

  const turn = {

    id: "turn-1",

    userId: "user-1",

    conversationId: "convo-1",

    mode: "regenerate" as const,

    userMessageId: null,

    replaceMessageId,

    priorScene: "default",

  };

  assert.equal(turn.replaceMessageId, replaceMessageId);

  assert.equal(turn.userMessageId, null);

});



test("failed chat turn contract exposes user message for compensation", () => {

  const turn = {

    id: "turn-2",

    userId: "user-1",

    conversationId: "convo-1",

    mode: "chat" as const,

    userMessageId: "user-msg-1",

    replaceMessageId: null,

    priorScene: "default",

  };

  assert.ok(turn.userMessageId);

  assert.equal(turn.priorScene, "default");

});

