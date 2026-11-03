# ==============================================================================
# Phumulani AI Community Platform — Windows Local LLM & Application Installer
# Phase 65: Phumulani Ai Autonomous Fundraising Agent & Local Runtime Environment
# Target Root: D:\Phumulani
# ==============================================================================

[CmdletBinding()]
param(
    [string]$TargetRoot = "D:\Phumulani",
    [string]$RepoUrl = "https://github.com/OphireumTechnology/phumulani.git",
    [string]$Branch = "main",
    [string]$PreferredModel = "phumulani-ai",
    [string]$BaseModel = "llama3.2:3b",
    [switch]$SkipModelDownload = $false
)

$ErrorActionPreference = "Stop"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  PHUMULANI AI — LOCAL LLM & PLATFORM INSTALLATION WIZARD (PHASE 65)  " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "Target Root Directory: $TargetRoot" -ForegroundColor Yellow

# ------------------------------------------------------------------------------
# STEP 1: VERIFY DRIVE D: AND DISK CAPACITY
# ------------------------------------------------------------------------------
Write-Host "`n[1/13] Verifying Drive and Storage Capacity..." -ForegroundColor Green
$targetDrive = [System.IO.Path]::GetPathRoot($TargetRoot)
if (-not (Test-Path $targetDrive)) {
    Write-Warning "Target drive $targetDrive was not found on this system."
    $altDrive = "C:\PhumulaniAI"
    $response = Read-Host "Would you like to install to fallback location [$altDrive]? (Y/N)"
    if ($response -match "^[Yy]") {
        $TargetRoot = $altDrive
        $targetDrive = [System.IO.Path]::GetPathRoot($TargetRoot)
    } else {
        Write-Error "Installation aborted: Target drive $targetDrive does not exist."
        exit 1
    }
}

$driveInfo = Get-PSDrive -Name ($targetDrive.TrimEnd(':\'))
$freeGb = [math]::Round($driveInfo.Free / 1GB, 2)
Write-Host "  Drive $targetDrive free space: $freeGb GB" -ForegroundColor Gray
if ($freeGb -lt 20) {
    Write-Warning "Disk space is under 20 GB. Local model weights and npm dependencies require at least 15–20 GB free."
} else {
    Write-Host "  Storage capacity check: PASSED (>= 20 GB available)" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# STEP 2: VERIFY PREREQUISITE RUNTIMES (NODE.JS, NPM, GIT)
# ------------------------------------------------------------------------------
Write-Host "`n[2/13] Checking Core Tooling Prerequisites..." -ForegroundColor Green

# Node.js
try {
    $nodeVer = (node -v).Trim()
    $nodeMajor = [int]($nodeVer -replace '^v(\d+)\..*', '$1')
    Write-Host "  Node.js detected: $nodeVer" -ForegroundColor Gray
    if ($nodeMajor -lt 20) {
        Write-Error "Node.js version 20+ (recommended Node 22) is required. Found $nodeVer."
        exit 1
    }
} catch {
    Write-Error "Node.js is not installed or not in PATH. Please install Node.js 22 LTS from https://nodejs.org/"
    exit 1
}

# npm
try {
    $npmVer = (npm -v).Trim()
    Write-Host "  npm detected: $npmVer" -ForegroundColor Gray
} catch {
    Write-Error "npm is not installed or not in PATH."
    exit 1
}

# Git
try {
    $gitVer = (git --version).Trim()
    Write-Host "  Git detected: $gitVer" -ForegroundColor Gray
} catch {
    Write-Error "Git is not installed or not in PATH. Please install Git from https://git-scm.com/"
    exit 1
}

# ------------------------------------------------------------------------------
# STEP 3: CHECK LOCAL INFERENCE RUNTIME (OLLAMA)
# ------------------------------------------------------------------------------
Write-Host "`n[3/13] Checking Local LLM Inference Engine (Ollama)..." -ForegroundColor Green
$hasOllama = $false
try {
    $ollamaVer = (ollama --version).Trim()
    Write-Host "  Ollama detected: $ollamaVer" -ForegroundColor Gray
    $hasOllama = $true
} catch {
    Write-Warning "Ollama is not installed or not in PATH."
    Write-Host "  You can download and install Ollama from: https://ollama.com/download/windows" -ForegroundColor Yellow
    Write-Host "  The Phumulani platform will automatically operate via fallback mode until Ollama is installed." -ForegroundColor Yellow
}

# ------------------------------------------------------------------------------
# STEP 4: CREATE DIRECTORY STRUCTURE
# ------------------------------------------------------------------------------
Write-Host "`n[4/13] Creating Local Directory Architecture..." -ForegroundColor Green
$directories = @(
    "$TargetRoot",
    "$TargetRoot\repository",
    "$TargetRoot\models",
    "$TargetRoot\runtime",
    "$TargetRoot\scripts",
    "$TargetRoot\config",
    "$TargetRoot\logs",
    "$TargetRoot\data",
    "$TargetRoot\backups"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    } else {
        Write-Host "  Exists:  $dir" -ForegroundColor Gray
    }
}

# ------------------------------------------------------------------------------
# STEP 5: CLONE OR UPDATE GITHUB REPOSITORY
# ------------------------------------------------------------------------------
Write-Host "`n[5/13] Setting Up Phumulani Repository..." -ForegroundColor Green
$repoPath = "$TargetRoot\repository\phumulani"
if (-not (Test-Path "$repoPath\.git")) {
    Write-Host "  Cloning $RepoUrl into $repoPath..." -ForegroundColor Yellow
    git clone $RepoUrl $repoPath
    Set-Location $repoPath
    git checkout $Branch
} else {
    Write-Host "  Existing repository detected. Fetching latest remote changes..." -ForegroundColor Yellow
    Set-Location $repoPath
    git fetch origin
    $status = git status --porcelain
    if ($status) {
        Write-Warning "Working tree has uncommitted local modifications. Skipping git pull to preserve local edits."
    } else {
        git pull origin $Branch
    }
}

# ------------------------------------------------------------------------------
# STEP 6: INSTALL NPM DEPENDENCIES
# ------------------------------------------------------------------------------
Write-Host "`n[6/13] Installing Application Dependencies with npm ci..." -ForegroundColor Green
Set-Location $repoPath
if (Test-Path "package-lock.json") {
    npm ci
} else {
    npm install
}

# ------------------------------------------------------------------------------
# STEP 7: CONFIGURE LOCAL ENVIRONMENT TEMPLATE (.env)
# ------------------------------------------------------------------------------
Write-Host "`n[7/13] Generating Safe Local Environment Configuration..." -ForegroundColor Green
$envPath = "$repoPath\.env"
$envTemplate = @"
# Phumulani AI Community Platform — Windows Local Configuration (Phase 65)
PORT=3000
BASE_PATH=/
NODE_ENV=development
PHUMULANI_OPERATIONAL_MODE=local_windows

# Local LLM Inference Engine Configuration
LOCAL_LLM_BACKEND=ollama
LOCAL_LLM_ENDPOINT=http://127.0.0.1:11434
LOCAL_LLM_MODEL=$PreferredModel
LOCAL_LLM_TIMEOUT_MS=35000

# Local Storage Directory Roots
LOCAL_DATA_DIR=$TargetRoot\data
LOCAL_LOGS_DIR=$TargetRoot\logs
LOCAL_BACKUPS_DIR=$TargetRoot\backups

# Hybrid Inference Fallback (Leave blank to keep 100% offline local)
GEMINI_API_KEY=
DISABLE_HMR=true
"@

if (-not (Test-Path $envPath)) {
    Set-Content -Path $envPath -Value $envTemplate -Encoding UTF8
    Write-Host "  Created $envPath" -ForegroundColor Gray
} else {
    Write-Host "  Existing .env preserved." -ForegroundColor Gray
}

# ------------------------------------------------------------------------------
# STEP 8: DETECT OR DOWNLOAD RECOMMENDED LOCAL LLM MODEL
# ------------------------------------------------------------------------------
Write-Host "`n[8/13] Checking Local LLM Model ($PreferredModel)..." -ForegroundColor Green
if ($hasOllama -and -not $SkipModelDownload) {
    $existingModels = ollama list 2>&1
    if ($existingModels -match "phumulani-ai") {
        Write-Host "  Model phumulani-ai is already created and ready in Ollama!" -ForegroundColor Green
    } else {
        Write-Host "  Base Model Profile: Meta Llama 3.2 3B Instruct ($BaseModel)" -ForegroundColor White
        Write-Host "  Download Size: ~2.0 GB | Recommended RAM: 6–8 GB | License: Llama 3.2 Community" -ForegroundColor Gray
        $pullResponse = Read-Host "  Would you like to pull $BaseModel and create $PreferredModel now via Ollama? (Y/N)"
        if ($pullResponse -match "^[Yy]") {
            Write-Host "  Pulling $BaseModel from Ollama library..." -ForegroundColor Cyan
            ollama pull $BaseModel
            Write-Host "  Base model download completed successfully!" -ForegroundColor Green

            $modelfile = "$repoPath\scripts\windows\Modelfile.phumulani-ai"
            if (Test-Path $modelfile) {
                Write-Host "  Creating custom agent model: $PreferredModel from Modelfile..." -ForegroundColor Cyan
                ollama create $PreferredModel -f $modelfile
                Write-Host "  Model $PreferredModel created successfully!" -ForegroundColor Green
            }
        } else {
            Write-Host "  Model download skipped. You can create it at any time with:" -ForegroundColor Yellow
            Write-Host "  ollama pull $BaseModel; ollama create phumulani-ai -f `"$repoPath\scripts\windows\Modelfile.phumulani-ai`"" -ForegroundColor Gray
        }
    }
}

# ------------------------------------------------------------------------------
# STEP 9: COMPILE AND LINT VALIDATION
# ------------------------------------------------------------------------------
Write-Host "`n[9/13] Running TypeScript Compilation Verification..." -ForegroundColor Green
Set-Location $repoPath
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "  TypeScript type-check: PASSED (0 errors)" -ForegroundColor Green
} else {
    Write-Warning "TypeScript compilation reported warnings or errors. Check console logs."
}

# ------------------------------------------------------------------------------
# STEP 10: COPY WINDOWS MANAGEMENT SCRIPTS TO $TargetRoot\scripts
# ------------------------------------------------------------------------------
Write-Host "`n[10/13] Staging Control Scripts to $TargetRoot\scripts..." -ForegroundColor Green
Copy-Item -Path "$repoPath\scripts\windows\*" -Destination "$TargetRoot\scripts\" -Recurse -Force
Write-Host "  Management scripts staged to $TargetRoot\scripts" -ForegroundColor Gray

# ------------------------------------------------------------------------------
# STEP 11: SUMMARY & HANDOVER
# ------------------------------------------------------------------------------
Write-Host "`n====================================================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION AND PREPARATION COMPLETED SUCCESSFULLY!              " -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "To start the Phumulani AI system on Windows:" -ForegroundColor White
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$TargetRoot\scripts\start-phumulani-ai.ps1`"" -ForegroundColor Yellow
Write-Host "`nTo chat or test tasks in the Phumulani CLI shell:" -ForegroundColor White
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$TargetRoot\scripts\Ask-Phumulani.ps1`" -Interactive" -ForegroundColor Yellow
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$TargetRoot\scripts\Ask-Phumulani.ps1`" -Task `"Analyze a donor reply`"" -ForegroundColor Yellow
Write-Host "`nTo check system status & diagnostics:" -ForegroundColor White
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$TargetRoot\scripts\check-phumulani-ai.ps1`"" -ForegroundColor Yellow
Write-Host "`nTo synchronize code with GitHub safely:" -ForegroundColor White
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$TargetRoot\scripts\Sync-Phumulani.ps1`"" -ForegroundColor Yellow

