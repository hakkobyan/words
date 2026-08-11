$ErrorActionPreference = "Stop"
$taskName = "WordsTelegramBot"

$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($null -eq $task) {
    Write-Output "Задача автозапуска $taskName не найдена."
    exit 0
}

Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
Write-Output "Автозапуск Telegram-бота удалён."
