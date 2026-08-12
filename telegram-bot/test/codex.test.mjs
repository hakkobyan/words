import assert from "node:assert/strict";
import test from "node:test";

import { buildCodexExecArgs } from "../codex.mjs";

test("new Codex sessions receive Telegram images", () => {
  assert.deepEqual(
    buildCodexExecArgs({
      prefixArgs: ["codex.js"],
      commonArgs: ["--json"],
      sandboxMode: "workspace-write",
      imagePaths: ["C:\\Temp\\photo.jpg"],
    }),
    [
      "codex.js",
      "exec",
      "--json",
      "--image",
      "C:\\Temp\\photo.jpg",
      "--sandbox",
      "workspace-write",
      "-",
    ],
  );
});

test("resumed Codex sessions receive Telegram images", () => {
  const args = buildCodexExecArgs({
    commonArgs: ["--json"],
    sandboxMode: "danger-full-access",
    threadId: "thread-id",
    imagePaths: ["C:\\Temp\\photo.png"],
  });

  assert.deepEqual(args.slice(0, 6), [
    "exec",
    "resume",
    "--json",
    "--image",
    "C:\\Temp\\photo.png",
    "-c",
  ]);
  assert.deepEqual(args.slice(-2), ["thread-id", "-"]);
});
