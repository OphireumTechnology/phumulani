# Phumulani AI Community Platform — Windows Scheduled Task for Knowledge Indexing
# Registers or triggers an hourly background scheduled task to refresh the knowledge index
# Target Windows execution path: D:\Phumulani

[CmdletBinding()]
param (
    [string]$RootPath = "D:\Phumulani",
    [string]$TaskName = "PhumulaniAiKnowledgeIndex",
    [switch]$RunOnceNow,
    [switch]$Unregister
)

$ErrorActionPreference = "Stop"

if ($Unregister) {
    Write-Host "Unregistering scheduled task '$TaskName'..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Task '$TaskName' unregistered." -ForegroundColor Green
    exit 0
}

$ScriptPath = Join-Path $RootPath "scripts\windows\Index-Knowledge.ps1"
if (-not (Test-Path $ScriptPath)) {
    # Fallback to repository location
    $ScriptPath = Join-Path $RootPath "repository\phumulani\scripts\windows\Index-Knowledge.ps1"
}

if ($RunOnceNow) {
    Write-Host "Executing immediate one-time knowledge indexing..." -ForegroundColor Cyan
    & powershell.exe -ExecutionPolicy Bypass -File $ScriptPath -RootPath $RootPath
    exit 0
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " Registering Windows Scheduled Task: $TaskName" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`" -RootPath `"$RootPath`""
$Trigger = New-ScheduledTaskTrigger -Daily -At 3:00AM
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Hourly indexer for Phumulani AI approved institutional documents" -Force | Out-Null

Write-Host "Scheduled task '$TaskName' successfully registered." -ForegroundColor Green
Write-Host "Trigger: Daily at 3:00 AM (and available on repository changes)." -ForegroundColor Gray
Write-Host "To run manually anytime: powershell -ExecutionPolicy Bypass -File $ScriptPath" -ForegroundColor Yellow
