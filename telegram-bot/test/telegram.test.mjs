import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { TelegramClient } from "../telegram.mjs";

test("downloadImage saves the Telegram photo with its extension", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "words-telegram-test-"));
  const originalFetch = globalThis.fetch;
  const client = new TelegramClient("1234567890:test_token_for_unit_tests");
  client.call = async () => ({ file_path: "photos/photo_42.jpg" });

  let requestedUrl = "";
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return new Response(new Uint8Array([255, 216, 255, 217]), { status: 200 });
  };

  try {
    const filePath = await client.downloadImage("file-id", directory);
    assert.equal(path.extname(filePath), ".jpg");
    assert.deepEqual(await readFile(filePath), Buffer.from([255, 216, 255, 217]));
    assert.match(requestedUrl, /\/file\/bot1234567890:test_token_for_unit_tests\/photos\/photo_42\.jpg$/);
  } finally {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  }
});
