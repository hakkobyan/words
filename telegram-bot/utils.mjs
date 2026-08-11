export const TELEGRAM_TEXT_LIMIT = 3900;

export function chunkText(value, limit = TELEGRAM_TEXT_LIMIT) {
  const text = String(value ?? "").trim();
  if (!text) return [];

  const chunks = [];
  let rest = text;

  while (rest.length > limit) {
    let cut = rest.lastIndexOf("\n", limit);
    if (cut < Math.floor(limit * 0.55)) cut = rest.lastIndexOf(" ", limit);
    if (cut < Math.floor(limit * 0.55)) cut = limit;
    chunks.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }

  if (rest) chunks.push(rest);
  return chunks;
}

export function parseCommand(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed.startsWith("/")) return null;

  const firstSpace = trimmed.search(/\s/);
  const token = (firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace))
    .slice(1)
    .split("@")[0]
    .toLowerCase();
  const argument = firstSpace === -1 ? "" : trimmed.slice(firstSpace).trim();

  return { name: token, argument };
}

export function shorten(value, limit = 1800) {
  const text = String(value ?? "").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}
