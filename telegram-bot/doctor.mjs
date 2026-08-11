import { loadConfig } from "./config.mjs";
import { checkCodex } from "./codex.mjs";
import { getGitStatus } from "./git.mjs";
import { TelegramClient } from "./telegram.mjs";

try {
  const config = loadConfig();
  const codexVersion = checkCodex();
  const telegram = new TelegramClient(config.token);
  const bot = await telegram.call("getMe");
  const gitStatus = await getGitStatus(config.projectRoot);

  console.log("✅ Конфигурация Telegram корректна");
  console.log(`✅ Бот: @${bot.username}`);
  console.log(`✅ ${codexVersion}`);
  console.log(`✅ Разрешённых Telegram ID: ${config.allowedUserIds.size}`);
  console.log(
    config.fullAccess
      ? "⚠️ Codex full access включён для Telegram-задач"
      : "✅ Codex работает в ограниченном workspace-write",
  );
  console.log(`✅ ${gitStatus.split("\n")[0]}`);
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
}
