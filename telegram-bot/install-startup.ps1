$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$node = Get-Command node -ErrorAction Stop
$botScript = Join-Path $PSScriptRoot "index.mjs"
$envFile = Join-Path $projectRoot ".env"
$taskName = "WordsTelegramBot"

if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Сначала создайте $envFile и заполните TELEGRAM_BOT_TOKEN и TELEGRAM_ALLOWED_USER_IDS."
}

$arguments = "--env-file-if-exists=`"$envFile`" `"$botScript`""
$action = New-ScheduledTaskAction -Execute $node.Source -Argument $arguments -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Days 3650) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Start-ScheduledTask -TaskName $taskName

Write-Output "Telegram-бот установлен в автозапуск и запущен. Задача Windows: $taskName"
