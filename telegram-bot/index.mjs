import { loadConfig } from "./config.mjs";
import { checkCodex, CodexRunner } from "./codex.mjs";
import { getGitDiff, getGitLog, getGitStatus } from "./git.mjs";
import { loadState, saveState } from "./state.mjs";
import { createGitTask, createPublishTask } from "./tasks.mjs";
import { TelegramClient } from "./telegram.mjs";
import { parseCommand, shorten } from "./utils.mjs";

const HELP = `Управление проектом words

Отправьте обычное текстовое сообщение или /edit задача — Codex изменит только проект words, проверит результат и вернёт отчёт.

/edit задача — изменить код, дизайн или данные проекта
/read задача — только изучить проект, без изменений
/git задача — выполнить указанную Git/GitHub-операцию
/publish описание — проверить изменения, сделать commit, push, PR и merge после зелёных checks
/status — текущая ветка и изменённые файлы
/diff — посмотреть локальные изменения
/log — последние 10 коммитов
/new — начать новый контекст Codex
/stop — остановить текущую задачу и очистить очередь
/help — эта справка

Бот принимает команды только от разрешённого Telegram ID. Raw shell недоступен. Force push, reset и удаление файлов не выполняются без точной явной просьбы.`;

const config = loadConfig();
checkCodex();

const telegram = new TelegramClient(config.token);
const codex = new CodexRunner(config);
const state = await loadState(config.stateFile);
const pending = [];
let draining = false;
let closing = false;
let stateWrite = Promise.resolve();

async function persistState() {
  const snapshot = { ...state };
  stateWrite = stateWrite.catch(() => {}).then(() => saveState(config.stateFile, snapshot));
  await stateWrite;
}

function updateProgress(chatId, messageId, event, progress) {
  if (progress.finished) return;
  const now = Date.now();
  if (now - progress.lastUpdate < 5_000) return;

  let label = null;
  if (event.type === "item.started" && event.item?.type === "command_execution") {
    label = "🔧 Запускаю проверку или команду…";
  } else if (event.type === "item.completed" && event.item?.type === "file_change") {
    label = "✏️ Изменяю файлы проекта…";
  } else if (event.type === "item.started" && event.item?.type === "web_search") {
    label = "🔎 Проверяю источники…";
  }

  if (!label || label === progress.label) return;
  progress.label = label;
  progress.lastUpdate = now;
  progress.pending = progress.pending.then(() =>
    telegram.editMessage(chatId, messageId, label).catch(() => {}),
  );
}

async function executeTask(job) {
  const startLabels = {
    edit: "✏️ Изменяю проект words…",
    git: "🌿 Выполняю Git/GitHub-задачу…",
    publish: "🚀 Проверяю и публикую изменения…",
    read: "🔎 Изучаю проект…",
  };
  const progressMessage = await telegram.sendMessage(
    job.chatId,
    startLabels[job.kind] || "⏳ Работаю над проектом…",
    job.messageId,
  );
  const progress = { label: "", lastUpdate: 0, finished: false, pending: Promise.resolve() };

  try {
    const result = await codex.run({
      task: job.task,
      threadId: job.readOnly ? null : state.threadId,
      readOnly: job.readOnly,
      onEvent: (event) => {
        updateProgress(job.chatId, progressMessage.message_id, event, progress);
      },
    });
    if (!job.readOnly) {
      state.threadId = result.threadId;
      await persistState();
    }
    progress.finished = true;
    await progress.pending;
    await telegram.editMessage(job.chatId, progressMessage.message_id, "✅ Готово").catch(() => {});
    await telegram.sendLongMessage(job.chatId, result.finalMessage, job.messageId);
    if (!job.readOnly) {
      const gitStatus = await getGitStatus(config.projectRoot).catch(() => null);
      if (gitStatus) await telegram.sendLongMessage(job.chatId, `Текущий Git-статус:\n${gitStatus}`);
    }
  } catch (error) {
    const stopped = error?.code === "STOPPED";
    progress.finished = true;
    await progress.pending;
    await telegram
      .editMessage(
        job.chatId,
        progressMessage.message_id,
        stopped ? "⏹ Задача остановлена." : "❌ Не удалось завершить задачу.",
      )
      .catch(() => {});
    if (!stopped) {
      await telegram.sendLongMessage(job.chatId, `Ошибка: ${shorten(error.message)}`, job.messageId);
    }
  }
}

async function drainQueue() {
  if (draining) return;
  draining = true;
  try {
    while (pending.length && !closing) {
      try {
        await executeTask(pending.shift());
      } catch (error) {
        console.error("Ошибка очереди Telegram-задач:", error.message);
      }
    }
  } finally {
    draining = false;
  }
}

async function enqueueTask(job) {
  if (job.task.length > 12_000) {
    await telegram.sendMessage(job.chatId, "Задача слишком длинная. Максимум — 12 000 символов.", job.messageId);
    return;
  }
  pending.push(job);
  if (draining) {
    await telegram.sendMessage(job.chatId, `Задача добавлена в очередь. Позиция: ${pending.length}.`, job.messageId);
  }
  void drainQueue();
}

async function handleAuthorizedMessage(message) {
  const chatId = message.chat.id;
  const text = String(message.text ?? "").trim();
  const command = parseCommand(text);

  if (!text) {
    await telegram.sendMessage(chatId, "Сейчас бот принимает только текстовые задачи.", message.message_id);
    return;
  }

  if (!command) {
    await enqueueTask({
      chatId,
      messageId: message.message_id,
      task: text,
      readOnly: false,
      kind: "edit",
    });
    return;
  }

  if (["start", "help"].includes(command.name)) {
    await telegram.sendMessage(chatId, HELP, message.message_id);
  } else if (command.name === "status") {
    await telegram.sendLongMessage(chatId, await getGitStatus(config.projectRoot), message.message_id);
  } else if (command.name === "diff") {
    await telegram.sendLongMessage(chatId, await getGitDiff(config.projectRoot), message.message_id);
  } else if (command.name === "log") {
    await telegram.sendLongMessage(chatId, await getGitLog(config.projectRoot), message.message_id);
  } else if (command.name === "read") {
    if (!command.argument) {
      await telegram.sendMessage(chatId, "Напишите задачу после /read.", message.message_id);
    } else {
      await enqueueTask({
        chatId,
        messageId: message.message_id,
        task: command.argument,
        readOnly: true,
        kind: "read",
      });
    }
  } else if (command.name === "edit") {
    if (!command.argument) {
      await telegram.sendMessage(chatId, "Напишите задачу после /edit.", message.message_id);
    } else {
      await enqueueTask({
        chatId,
        messageId: message.message_id,
        task: command.argument,
        readOnly: false,
        kind: "edit",
      });
    }
  } else if (command.name === "git") {
    if (!command.argument) {
      await telegram.sendMessage(
        chatId,
        "Напишите Git-задачу после /git, например: /git создай ветку codex/fix-menu и закоммить изменения.",
        message.message_id,
      );
    } else {
      await enqueueTask({
        chatId,
        messageId: message.message_id,
        task: createGitTask(command.argument),
        readOnly: false,
        kind: "git",
      });
    }
  } else if (command.name === "publish") {
    await enqueueTask({
      chatId,
      messageId: message.message_id,
      task: createPublishTask(command.argument),
      readOnly: false,
      kind: "publish",
    });
  } else if (command.name === "new") {
    if (codex.isRunning || pending.length) {
      await telegram.sendMessage(chatId, "Сначала остановите текущую работу командой /stop.", message.message_id);
    } else {
      state.threadId = null;
      await persistState();
      await telegram.sendMessage(chatId, "Новый контекст создан. Файлы проекта не изменены.", message.message_id);
    }
  } else if (command.name === "stop") {
    const queued = pending.splice(0).length;
    const stopped = codex.stop();
    await telegram.sendMessage(
      chatId,
      stopped || queued
        ? `Останавливаю текущую задачу. Удалено из очереди: ${queued}.`
        : "Сейчас активных задач нет.",
      message.message_id,
    );
  } else {
    await telegram.sendMessage(chatId, "Неизвестная команда. Используйте /help.", message.message_id);
  }
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message || message.from?.is_bot) return;

  const userId = String(message.from?.id ?? "");
  const isAllowed = config.allowedUserIds.has(userId);
  const isPrivate = message.chat?.type === "private";

  if (!isAllowed || !isPrivate) {
    if (message.chat?.id) {
      await telegram.sendMessage(message.chat.id, "Доступ запрещён. Этот бот работает только для владельца.");
    }
    return;
  }

  await handleAuthorizedMessage(message);
}

function shutdown() {
  closing = true;
  codex.stop();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const identity = await telegram.call("getMe");
console.log(`Telegram-бот @${identity.username} запущен для проекта ${config.projectRoot}`);

while (!closing) {
  try {
    const updates = await telegram.getUpdates(state.nextUpdateId);
    for (const update of updates) {
      state.nextUpdateId = update.update_id + 1;
      await persistState();
      void handleUpdate(update).catch((error) => {
        console.error("Ошибка обработки Telegram update:", error.message);
        if (update.message?.chat?.id) {
          void telegram
            .sendMessage(
              update.message.chat.id,
              `Не удалось обработать команду: ${shorten(error.message)}`,
              update.message.message_id,
            )
            .catch(() => {});
        }
      });
    }
  } catch (error) {
    if (!closing) {
      console.error("Ошибка Telegram long polling:", error.message);
      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
  }
}
