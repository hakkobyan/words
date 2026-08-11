import { readFile, rename, writeFile } from "node:fs/promises";

const emptyState = Object.freeze({ nextUpdateId: 0, threadId: null });

export async function loadState(file) {
  try {
    const value = JSON.parse(await readFile(file, "utf8"));
    return {
      nextUpdateId: Number.isSafeInteger(value.nextUpdateId) ? value.nextUpdateId : 0,
      threadId:
        typeof value.threadId === "string" && /^[0-9a-f-]{36}$/i.test(value.threadId)
          ? value.threadId
          : null,
    };
  } catch (error) {
    if (error?.code === "ENOENT") return { ...emptyState };
    throw new Error(`Не удалось прочитать состояние Telegram-бота: ${error.message}`);
  }
}

export async function saveState(file, state) {
  const temporaryFile = `${file}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(temporaryFile, file);
}
