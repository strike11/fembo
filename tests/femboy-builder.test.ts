import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_FEMBOY_LOOK,
  describeLook,
  femboyAvatarMarkup,
  femboyLookSchema,
  parseLookLock,
  spriteToExpression,
  stringifyLookLock,
} from "../src/lib/femboy-look";

test("femboy look round-trips through lookLock JSON", () => {
  const raw = stringifyLookLock(DEFAULT_FEMBOY_LOOK);
  assert.deepEqual(parseLookLock(raw), DEFAULT_FEMBOY_LOOK);
});

test("femboy avatar markup is SFW svg", () => {
  const svg = femboyAvatarMarkup(DEFAULT_FEMBOY_LOOK, "blushy", { animated: true });
  assert.match(svg, /^<svg/);
  assert.doesNotMatch(svg, /nude|horny|nsfw/i);
});

test("describeLook summarizes customization for prompts", () => {
  const text = describeLook(DEFAULT_FEMBOY_LOOK);
  assert.match(text, /hair/i);
  assert.match(text, /hoodie|outfit/i);
});

test("spriteToExpression maps chat tags to preview expressions", () => {
  assert.equal(spriteToExpression("[blushy] hi"), "blushy");
  assert.equal(spriteToExpression("plain hello"), "smile");
});

test("studio look schema rejects invalid colors", () => {
  const result = femboyLookSchema.safeParse({
    ...DEFAULT_FEMBOY_LOOK,
    hairColor: "pink",
  });
  assert.equal(result.success, false);
});
