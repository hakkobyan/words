import assert from "node:assert/strict";
import test from "node:test";

import { createGitTask, createPublishTask } from "../tasks.mjs";

test("createGitTask keeps the requested operation and protects local secrets", () => {
  const prompt = createGitTask("создай ветку codex/fix-menu");
  assert.match(prompt, /codex\/fix-menu/);
  assert.match(prompt, /\.env/);
  assert.match(prompt, /force push/);
});

test("createPublishTask defines the complete guarded PR workflow", () => {
  const prompt = createPublishTask("исправление мобильного меню");
  assert.match(prompt, /исправление мобильного меню/);
  assert.match(prompt, /создай ровно один готовый PR/);
  assert.match(prompt, /зелёных checks/);
  assert.match(prompt, /не merge/);
});
