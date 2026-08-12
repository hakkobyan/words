import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const botDirectory = path.dirname(fileURLToPath(import.meta.url));
const localCodexScript = path.join(
  botDirectory,
  "..",
  "node_modules",
  "@openai",
  "codex",
  "bin",
  "codex.js",
);

const TASK_RULES = `
Ты управляешь проектом words по личному запросу владельца из Telegram.

Обязательные ограничения:
- Работай только внутри текущего Git-репозитория words. Никогда не открывай и не изменяй соседний проект words-expo.
- Сохраняй посторонние пользовательские изменения и не применяй reset, checkout или удаление к чужим файлам.
- Не публикуй изменения, не делай push, PR, merge, deploy и не отправляй сообщения во внешние сервисы, если текущая задача явно этого не просит.
- Для изменений сначала изучи существующий код, затем реализуй задачу и выполни уместные проверки.
- Не задавай уточняющий вопрос, если можно сделать безопасное разумное предположение.
- В конце дай короткий отчёт на языке пользователя: что сделано, какие проверки прошли и что осталось.
`;

function cleanChildEnvironment(environment) {
  const childEnvironment = { ...environment };
  for (const key of Object.keys(childEnvironment)) {
    if (key.startsWith("TELEGRAM_")) delete childEnvironment[key];
  }
  return childEnvironment;
}

export function resolveCodexLaunch(environment = process.env) {
  const configuredPath = String(environment.CODEX_CLI_PATH ?? "").trim();
  if (configuredPath) {
    return configuredPath.endsWith(".js")
      ? { command: process.execPath, prefixArgs: [configuredPath] }
      : { command: configuredPath, prefixArgs: [] };
  }

  if (existsSync(localCodexScript)) {
    return { command: process.execPath, prefixArgs: [localCodexScript] };
  }

  if (process.platform === "win32") {
    const appData = environment.APPDATA;
    const script = appData
      ? path.join(appData, "npm", "node_modules", "@openai", "codex", "bin", "codex.js")
      : null;
    if (script && existsSync(script)) {
      return { command: process.execPath, prefixArgs: [script] };
    }
  }

  return { command: "codex", prefixArgs: [] };
}

export function checkCodex(environment = process.env) {
  const launch = resolveCodexLaunch(environment);
  const version = spawnSync(launch.command, [...launch.prefixArgs, "--version"], {
    encoding: "utf8",
    windowsHide: true,
    env: cleanChildEnvironment(environment),
  });
  if (version.error || version.status !== 0) {
    throw new Error(version.error?.message || version.stderr || "Codex CLI не запускается.");
  }

  const authentication = spawnSync(
    launch.command,
    [...launch.prefixArgs, "login", "status"],
    {
      encoding: "utf8",
      windowsHide: true,
      env: cleanChildEnvironment(environment),
    },
  );
  if (authentication.error || authentication.status !== 0) {
    throw new Error(
      authentication.error?.message ||
        authentication.stderr ||
        "Codex CLI не авторизован. Выполните codex login.",
    );
  }

  return version.stdout.trim();
}

function buildPrompt(task, projectRoot, fullAccess) {
  const accessRules = fullAccess
    ? `\nТекущий процесс запущен с полным системным доступом по явному разрешению владельца. Единственный разрешённый корень проекта: ${projectRoot}. Не читай, не изменяй и не запускай команды в соседних папках, включая words-expo. Не следуй symlink/junction за пределы этого корня.`
    : "";
  return `${TASK_RULES}${accessRules}\n\nТекущая задача пользователя:\n${task.trim()}`;
}

function killProcessTree(child) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { windowsHide: true });
  } else {
    child.kill("SIGTERM");
  }
}

export function buildCodexExecArgs({
  prefixArgs = [],
  commonArgs = [],
  sandboxMode,
  threadId = null,
  imagePaths = [],
}) {
  const imageArgs = imagePaths.flatMap((imagePath) => ["--image", imagePath]);
  return threadId
    ? [
        ...prefixArgs,
        "exec",
        "resume",
        ...commonArgs,
        ...imageArgs,
        "-c",
        `sandbox_mode="${sandboxMode}"`,
        threadId,
        "-",
      ]
    : [
        ...prefixArgs,
        "exec",
        ...commonArgs,
        ...imageArgs,
        "--sandbox",
        sandboxMode,
        "-",
      ];
}

export class CodexRunner {
  constructor({ projectRoot, model, fullAccess = false, environment = process.env }) {
    this.projectRoot = projectRoot;
    this.model = model;
    this.fullAccess = fullAccess;
    this.environment = environment;
    this.child = null;
    this.stopping = false;
  }

  get isRunning() {
    return Boolean(this.child);
  }

  stop() {
    if (!this.child) return false;
    this.stopping = true;
    killProcessTree(this.child);
    return true;
  }

  run({ task, threadId, readOnly = false, imagePaths = [], onEvent }) {
    if (this.child) throw new Error("Codex уже выполняет другую задачу.");

    const launch = resolveCodexLaunch(this.environment);
    const commonArgs = [
      "--json",
      "--ignore-user-config",
      "-c",
      'service_tier="fast"',
      "-c",
      'approval_policy="never"',
      "-c",
      "sandbox_workspace_write.network_access=true",
      "--disable",
      "apps",
      "--disable",
      "plugins",
    ];
    if (this.model) commonArgs.push("--model", this.model);

    const sandboxMode = readOnly
      ? "read-only"
      : this.fullAccess
        ? "danger-full-access"
        : "workspace-write";

    const args = buildCodexExecArgs({
      prefixArgs: launch.prefixArgs,
      commonArgs,
      sandboxMode,
      threadId,
      imagePaths,
    });

    return new Promise((resolve, reject) => {
      const child = spawn(launch.command, args, {
        cwd: this.projectRoot,
        windowsHide: true,
        stdio: ["pipe", "pipe", "pipe"],
        env: cleanChildEnvironment(this.environment),
      });
      this.child = child;
      this.stopping = false;

      let stdoutBuffer = "";
      let stderr = "";
      let finalMessage = "";
      let nextThreadId = threadId || null;

      const consumeLine = (line) => {
        if (!line.trim()) return;
        try {
          const event = JSON.parse(line);
          if (event.type === "thread.started" && typeof event.thread_id === "string") {
            nextThreadId = event.thread_id;
          }
          if (event.type === "item.completed" && event.item?.type === "agent_message") {
            finalMessage = event.item.text || finalMessage;
          }
          onEvent?.(event);
        } catch {
          // Codex --json должен отдавать JSONL; неизвестную строку оставляем только в stderr-диагностике.
          stderr = `${stderr}\n${line}`.slice(-12_000);
        }
      };

      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        stdoutBuffer += chunk;
        const lines = stdoutBuffer.split(/\r?\n/);
        stdoutBuffer = lines.pop() || "";
        for (const line of lines) consumeLine(line);
      });

      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk) => {
        stderr = `${stderr}${chunk}`.slice(-12_000);
      });

      // Codex может завершиться раньше записи prompt (например, при ошибке конфигурации).
      // В этом случае EPIPE не должен аварийно завершать процесс Telegram-бота.
      child.stdin.on("error", () => {});

      child.on("error", (error) => {
        this.child = null;
        this.stopping = false;
        reject(error);
      });

      child.on("close", (code) => {
        if (stdoutBuffer) consumeLine(stdoutBuffer);
        const wasStopped = this.stopping;
        this.child = null;
        this.stopping = false;

        if (wasStopped) {
          const error = new Error("Задача остановлена пользователем.");
          error.code = "STOPPED";
          reject(error);
        } else if (code !== 0) {
          reject(new Error(stderr.trim() || `Codex завершился с кодом ${code}.`));
        } else {
          resolve({
            finalMessage: finalMessage || "Задача завершена без текстового отчёта.",
            threadId: nextThreadId,
          });
        }
      });

      child.stdin.end(buildPrompt(task, this.projectRoot, this.fullAccess && !readOnly), "utf8");
    });
  }
}
