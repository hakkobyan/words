import assert from "node:assert/strict";
import test from "node:test";

import { loadConfig, parseAllowedUserIds, parseBoolean, projectRoot } from "../config.mjs";

test("parseAllowedUserIds accepts one or multiple numeric IDs", () => {
  assert.deepEqual([...parseAllowedUserIds("123, 456")], ["123", "456"]);
});

test("parseAllowedUserIds rejects missing and non-numeric IDs", () => {
  assert.throws(() => parseAllowedUserIds(""), /TELEGRAM_ALLOWED_USER_IDS/);
  assert.throws(() => parseAllowedUserIds("123, user"), /TELEGRAM_ALLOWED_USER_IDS/);
});

test("parseBoolean accepts explicit env-style values", () => {
  assert.equal(parseBoolean("true"), true);
  assert.equal(parseBoolean("1"), true);
  assert.equal(parseBoolean("false", true), false);
  assert.equal(parseBoolean("", true), true);
  assert.throws(() => parseBoolean("maybe"), /логическое значение/);
});

test("loadConfig validates token and returns project root", () => {
  const config = loadConfig({
    TELEGRAM_BOT_TOKEN: ["123456789", "a".repeat(32)].join(":"),
    TELEGRAM_ALLOWED_USER_IDS: "42",
    TELEGRAM_CODEX_FULL_ACCESS: "true",
  });
  assert.equal(config.projectRoot, projectRoot);
  assert.equal(config.model, null);
  assert.equal(config.fullAccess, true);
  assert(config.allowedUserIds.has("42"));
});

test("loadConfig rejects malformed token", () => {
  assert.throws(
    () => loadConfig({ TELEGRAM_BOT_TOKEN: "secret", TELEGRAM_ALLOWED_USER_IDS: "42" }),
    /TELEGRAM_BOT_TOKEN/,
  );
});
