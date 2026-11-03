# ==============================================================================
# Phumulani AI Community Platform — Windows Local Shutdown Script
# Phase 65: Phumulani Ai Autonomous Fundraising Agent & Server Termination
# ==============================================================================

[CmdletBinding()]
param(
    [int]$AppPort = 3000,
    [switch]$StopOllama = $false
)

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  PHUMULANI AI — STOPPING LOCAL APPLICATION SERVICES                   " -ForegroundColor White -BackgroundColor DarkRed
Write-Host "====================================================================" -ForegroundColor Cyan

# 1. Stop Node.js processes running Phumulani on AppPort
Write-Host "`n[1/2] Terminating Node.js processes listening on port $AppPort..." -ForegroundColor Yellow
try {
    $connections = Get-NetTCPConnection -LocalPort $AppPort -ErrorAction SilentlyContinue
    if ($connections) {
        $pidsToKill = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($p in $pidsToKill) {
            Write-Host "  Stopping process PID $p..." -ForegroundColor Gray
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  Port $AppPort released successfully." -ForegroundColor Green
    } else {
        Write-Host "  No active listeners detected on port $AppPort." -ForegroundColor Gray
    }
} catch {
    Write-Warning "Failed to query port $AppPort listeners. Attempting process name match..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

# 2. Optionally Stop Ollama
if ($StopOllama) {
    Write-Host "`n[2/2] Stopping Ollama inference process..." -ForegroundColor Yellow
    Get-Process -Name "ollama" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  Ollama stopped." -ForegroundColor Green
} else {
    Write-Host "`n[2/2] Preserving Ollama daemon in memory for subsequent inference calls." -ForegroundColor Gray
}

Write-Host "`nPhumulani AI application has been stopped." -ForegroundColor Green
