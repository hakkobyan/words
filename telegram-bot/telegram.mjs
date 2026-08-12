import { writeFile } from "node:fs/promises";
import path from "node:path";

import { chunkText } from "./utils.mjs";

export const MAX_TELEGRAM_IMAGE_BYTES = 20 * 1024 * 1024;

export class TelegramClient {
  constructor(token) {
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.fileBaseUrl = `https://api.telegram.org/file/bot${token}`;
  }

  async call(method, payload = {}, timeoutMs = 15_000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/${method}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.description || `Telegram API вернул HTTP ${response.status}`);
      }
      return data.result;
    } finally {
      clearTimeout(timeout);
    }
  }

  getUpdates(offset) {
    return this.call(
      "getUpdates",
      {
        ...(offset ? { offset } : {}),
        timeout: 25,
        allowed_updates: ["message"],
      },
      35_000,
    );
  }

  async downloadImage(fileId, directory) {
    const file = await this.call("getFile", { file_id: fileId });
    if (!file?.file_path) throw new Error("Телеграм не вернул путь к фотографии.");

    const extension = path.extname(file.file_path).toLowerCase() || ".jpg";
    const destination = path.join(directory, `telegram-image${extension}`);
    const encodedPath = file.file_path.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(`${this.fileBaseUrl}/${encodedPath}`);
    if (!response.ok) {
      throw new Error(`Не удалось скачать фотографию: HTTP ${response.status}.`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_TELEGRAM_IMAGE_BYTES) {
      throw new Error("Фотография больше 20 МБ и не может быть обработана.");
    }
    await writeFile(destination, bytes);
    return destination;
  }

  sendMessage(chatId, text, replyToMessageId) {
    return this.call("sendMessage", {
      chat_id: chatId,
      text,
      link_preview_options: { is_disabled: true },
      ...(replyToMessageId
        ? { reply_parameters: { message_id: replyToMessageId, allow_sending_without_reply: true } }
        : {}),
    });
  }

  editMessage(chatId, messageId, text) {
    return this.call("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      link_preview_options: { is_disabled: true },
    });
  }

  async sendLongMessage(chatId, text, replyToMessageId) {
    const chunks = chunkText(text);
    for (let index = 0; index < chunks.length; index += 1) {
      await this.sendMessage(chatId, chunks[index], index === 0 ? replyToMessageId : undefined);
    }
  }
}
