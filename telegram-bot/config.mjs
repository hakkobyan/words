import path from "node:path";
import { fileURLToPath } from "node:url";

const botDirectory = path.dirname(fileURLToPath(import.meta.url));

export const projectRoot = path.resolve(botDirectory, "..");
export const stateFile = path.join(projectRoot, ".telegram-bot-state.json");

export function parseAllowedUserIds(value) {
  const ids = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (ids.length === 0 || ids.some((id) => !/^\d+$/.test(id))) {
    throw new Error(
      "TELEGRAM_ALLOWED_USER_IDS должен содержать числовой Telegram ID (или несколько ID через запятую).",
    );
  }

  return new Set(ids);
}

export function parseBoolean(value, fallback = false) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return fallback;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new Error(`Ожидалось логическое значение true/false, получено: ${value}`);
}

export function loadConfig(environment = process.env) {
  const token = String(environment.TELEGRAM_BOT_TOKEN ?? "").trim();
  if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(token)) {
    throw new Error("TELEGRAM_BOT_TOKEN отсутствует или имеет неверный формат.");
  }

  return {
    token,
    allowedUserIds: parseAllowedUserIds(environment.TELEGRAM_ALLOWED_USER_IDS),
    model: String(environment.TELEGRAM_CODEX_MODEL ?? "").trim() || null,
    fullAccess: parseBoolean(environment.TELEGRAM_CODEX_FULL_ACCESS, false),
    projectRoot,
    stateFile,
  };
}
