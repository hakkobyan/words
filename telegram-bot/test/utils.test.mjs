import assert from "node:assert/strict";
import test from "node:test";

import { chunkText, parseCommand, shorten } from "../utils.mjs";

test("chunkText preserves content while respecting the limit", () => {
  const chunks = chunkText("alpha beta gamma delta", 10);
  assert.deepEqual(chunks, ["alpha beta", "gamma", "delta"]);
  assert(chunks.every((chunk) => chunk.length <= 10));
});

test("parseCommand handles bot suffix and argument", () => {
  assert.deepEqual(parseCommand("/read@words_bot проверь проект"), {
    name: "read",
    argument: "проверь проект",
  });
  assert.equal(parseCommand("обычная задача"), null);
});

test("shorten truncates long diagnostics", () => {
  assert.equal(shorten("abcdef", 5), "abcd…");
  assert.equal(shorten("abc", 5), "abc");
});
