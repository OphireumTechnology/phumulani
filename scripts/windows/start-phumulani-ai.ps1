# ==============================================================================
# Phumulani AI Community Platform — Windows Local Startup Script
# Phase 65: Phumulani Ai Autonomous Fundraising Agent & Server Bootstrap
# Target Root: D:\PhumulaniAI
# ==============================================================================

[CmdletBinding()]
param(
    [string]$TargetRoot = "D:\Phumulani",
    [string]$Model = "phumulani-ai",
    [int]$AppPort = 3000
)

$ErrorActionPreference = "Stop"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  PHUMULANI AI — STARTING LOCAL RUNTIME & APPLICATION SERVICES        " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "====================================================================" -ForegroundColor Cyan

$repoPath = "$TargetRoot\repository\phumulani"
if (-not (Test-Path $repoPath)) {
    # If run inside the repository directly
    if (Test-Path "package.json") {
        $repoPath = (Get-Location).Path
    } else {
        Write-Error "Repository not found at $repoPath. Please run install-phumulani-ai.ps1 first."
        exit 1
    }
}

# 1. VERIFY OR START OLLAMA
Write-Host "`n[1/4] Checking Local Inference Engine (Ollama)..." -ForegroundColor Green
$ollamaRunning = $false
try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($res) {
        $ollamaRunning = $true
        Write-Host "  Ollama inference service is already active on port 11434." -ForegroundColor Green
    }
} catch {
    $ollamaRunning = $false
}

if (-not $ollamaRunning) {
    Write-Host "  Starting Ollama daemon in background..." -ForegroundColor Yellow
    try {
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "  Ollama daemon started." -ForegroundColor Green
    } catch {
        Write-Warning "Could not start Ollama automatically. Operating with deterministic fallback engine."
    }
}

# 2. VERIFY MODEL AVAILABILITY
Write-Host "`n[2/4] Verifying Model Availability..." -ForegroundColor Green
try {
    $models = (ollama list 2>&1)
    if ($models -match $Model.Split(':')[0]) {
        Write-Host "  Model '$Model' verified in local catalog." -ForegroundColor Green
    } else {
        Write-Warning "Model '$Model' not listed. Run 'ollama pull $Model' if desired."
    }
} catch {
    Write-Host "  Local model listing deferred." -ForegroundColor Gray
}

# 3. START APPLICATION BACKEND
Write-Host "`n[3/4] Launching Phumulani AI Platform on http://localhost:$AppPort..." -ForegroundColor Green
Set-Location $repoPath
$env:PORT = $AppPort
$env:LOCAL_LLM_ENDPOINT = "http://127.0.0.1:11434"
$env:LOCAL_LLM_MODEL = $Model

$nodeProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -PassThru -NoNewWindow

Write-Host "  Waiting for web server on port $AppPort..." -ForegroundColor Yellow
$serverReady = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $testRes = Invoke-WebRequest -Uri "http://localhost:$AppPort" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($testRes.StatusCode -eq 200) {
            $serverReady = $true
            break
        }
    } catch {}
}

# 4. HEALTH CHECK & DASHBOARD STATUS
Write-Host "`n[4/4] Verifying Phumulani AI Health..." -ForegroundColor Green
if ($serverReady) {
    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host "  PHUMULANI AI PLATFORM IS RUNNING!                                " -ForegroundColor White -BackgroundColor DarkGreen
    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host "  Web Dashboard:           http://localhost:$AppPort" -ForegroundColor Cyan
    Write-Host "  Email Command Center:    http://localhost:$AppPort/admin/master/email" -ForegroundColor Cyan
    Write-Host "  Phumulani AI Health API: http://localhost:$AppPort/api/phumulani-ai/health" -ForegroundColor Cyan
    Write-Host "  Local Ollama Engine:     http://127.0.0.1:11434" -ForegroundColor Cyan
    Write-Host "  Configured Model:        $Model" -ForegroundColor Yellow
    Write-Host "`nPress Ctrl+C to terminate or run stop-phumulani-ai.ps1." -ForegroundColor Gray
    
    # Keep process attached
    Wait-Process -Id $nodeProcess.Id
} else {
    Write-Warning "Server did not respond within 15 seconds. Please check console logs."
}
