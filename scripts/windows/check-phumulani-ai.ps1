# ==============================================================================
# Phumulani AI Community Platform — Windows Local Diagnostics & Health Check
# Phase 65: Comprehensive Verification of Local LLM Runtime, Hardware, Ports & Git
# ==============================================================================

[CmdletBinding()]
param(
    [string]$TargetRoot = "D:\Phumulani",
    [int]$AppPort = 3000
)

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  PHUMULANI AI — SYSTEM DIAGNOSTICS & RUNTIME VERIFICATION (PHASE 65)  " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "====================================================================" -ForegroundColor Cyan

# 1. Hardware & System Resources
Write-Host "`n--- HARDWARE & HOST SYSTEM ---" -ForegroundColor White
$os = Get-CimInstance Win32_OperatingSystem
$totalRamGb = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeRamGb = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
Write-Host "  OS Version:        $($os.Caption) ($($os.Version))" -ForegroundColor Gray
Write-Host "  Total System RAM:  $totalRamGb GB (Free: $freeRamGb GB)" -ForegroundColor Gray

# Check GPU
try {
    $gpus = Get-CimInstance Win32_VideoController
    foreach ($gpu in $gpus) {
        Write-Host "  Detected GPU:      $($gpu.Name) (Driver: $($gpu.DriverVersion))" -ForegroundColor Gray
    }
} catch {
    Write-Host "  GPU Query:         Direct query unavailable." -ForegroundColor Gray
}

# 2. Disk Storage Check
Write-Host "`n--- DISK STORAGE (D: DRIVE) ---" -ForegroundColor White
$targetDrive = [System.IO.Path]::GetPathRoot($TargetRoot)
if (Test-Path $targetDrive) {
    $driveInfo = Get-PSDrive -Name ($targetDrive.TrimEnd(':\'))
    $freeGb = [math]::Round($driveInfo.Free / 1GB, 2)
    Write-Host "  Drive Path:        $targetDrive" -ForegroundColor Gray
    Write-Host "  Free Capacity:     $freeGb GB" -ForegroundColor ($freeGb -ge 20 ? "Green" : "Yellow")
} else {
    Write-Host "  Drive Path:        $targetDrive NOT FOUND" -ForegroundColor Red
}

# 3. Local Runtime Engine (Ollama) Check
Write-Host "`n--- LOCAL LLM INFERENCE ENGINE (OLLAMA) ---" -ForegroundColor White
try {
    $tagsRes = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -Method Get -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  Ollama Endpoint:   http://127.0.0.1:11434 (ONLINE)" -ForegroundColor Green
    if ($tagsRes.models) {
        Write-Host "  Installed Models:  $($tagsRes.models.name -join ', ')" -ForegroundColor Green
    } else {
        Write-Host "  Installed Models:  (None yet installed. Run 'ollama pull llama3.2:3b')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Ollama Endpoint:   http://127.0.0.1:11434 (OFFLINE or NOT RUNNING)" -ForegroundColor Yellow
    Write-Host "  Status:            Deterministic expert rules active as fallback." -ForegroundColor Gray
}

# 4. Phumulani Application Server Check
Write-Host "`n--- PHUMULANI APPLICATION SERVER ---" -ForegroundColor White
try {
    $appRes = Invoke-RestMethod -Uri "http://localhost:$AppPort/api/phumulani-ai/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  App Server Status: ONLINE at http://localhost:$AppPort" -ForegroundColor Green
    Write-Host "  AI Health Status:  $($appRes.health.status)" -ForegroundColor ($appRes.health.status -eq 'healthy' ? "Green" : "Yellow")
    Write-Host "  AI Model Used:     $($appRes.health.modelId)" -ForegroundColor Gray
    Write-Host "  AI Engine Backend: $($appRes.health.backend)" -ForegroundColor Gray
} catch {
    Write-Host "  App Server Status: OFFLINE on port $AppPort" -ForegroundColor Yellow
}

# 5. Git Repository Check
Write-Host "`n--- GITHUB SOURCE CONTROL ---" -ForegroundColor White
$repoPath = "$TargetRoot\repository\phumulani"
if (Test-Path "$repoPath\.git") {
    Push-Location $repoPath
    $branch = (git branch --show-current).Trim()
    $commit = (git rev-parse --short HEAD).Trim()
    $status = git status --porcelain
    Pop-Location
    Write-Host "  Repository Path:   $repoPath" -ForegroundColor Gray
    Write-Host "  Current Branch:    $branch" -ForegroundColor Green
    Write-Host "  Commit SHA:        $commit" -ForegroundColor Gray
    Write-Host "  Working Tree:      $($status ? 'DIRTY (Uncommitted modifications present)' : 'CLEAN')" -ForegroundColor ($status ? "Yellow" : "Green")
} else {
    Write-Host "  Repository Path:   Not cloned yet at $repoPath" -ForegroundColor Yellow
}

Write-Host "`n====================================================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTICS COMPLETE                                               " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "====================================================================" -ForegroundColor Cyan
