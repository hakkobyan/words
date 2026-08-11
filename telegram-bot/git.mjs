import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function git(projectRoot, args) {
  const { stdout } = await execFileAsync("git", args, {
    cwd: projectRoot,
    encoding: "utf8",
    timeout: 12_000,
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

export async function getGitStatus(projectRoot) {
  const [branch, status] = await Promise.all([
    git(projectRoot, ["branch", "--show-current"]),
    git(projectRoot, ["status", "--short"]),
  ]);
  return `Ветка: ${branch || "detached HEAD"}\n\n${status || "Рабочая папка чистая."}`;
}

export async function getGitDiff(projectRoot) {
  const [status, stat, diff] = await Promise.all([
    git(projectRoot, ["status", "--short"]),
    git(projectRoot, ["diff", "--stat"]),
    git(projectRoot, ["diff", "--", ":(exclude)package-lock.json"]),
  ]);

  if (!status) return "Изменений нет.";
  const rawDetails = diff || "В diff нет отслеживаемых изменений; возможно, добавлены только новые файлы.";
  const details =
    rawDetails.length > 15_000
      ? `${rawDetails.slice(0, 15_000)}\n\n…diff сокращён. Полная версия доступна локально через git diff.`
      : rawDetails;
  return `Файлы:\n${status}\n\nСтатистика:\n${stat || "—"}\n\nDiff:\n${details}`;
}

export function getGitLog(projectRoot) {
  return git(projectRoot, ["log", "--oneline", "--decorate", "-10"]);
}
