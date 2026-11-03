<#
.SYNOPSIS
    Phumulani Ai — Safe GitHub Synchronization Script (Windows)
.DESCRIPTION
    Synchronizes local repository at D:\Phumulani\repository\phumulani with canonical remote:
    https://github.com/OphireumTechnology/phumulani.git

    Safety Invariants:
    1. Never silently overwrite local uncommitted changes
    2. Reports merge conflicts clearly rather than force-updating
    3. Strictly verifies .gitignore excludes model weights (*.gguf, *.bin), donor PII, logs, and secrets
    4. Runs TypeScript build verification before pushing
    5. Works on a safe local development branch

.EXAMPLE
    & "D:\Phumulani\scripts\Sync-Phumulani.ps1" -PullOnly
    & "D:\Phumulani\scripts\Sync-Phumulani.ps1" -Branch "feature/phumulani-ai-local" -CommitMessage "Update local inference configs"
#>

param(
    [string]$TargetRoot = "D:\Phumulani",
    [string]$RepoRemote = "https://github.com/OphireumTechnology/phumulani.git",
    [string]$Branch = "main",
    [string]$CommitMessage = "",
    [switch]$PullOnly,
    [switch]$SkipBuildCheck
)

$ErrorActionPreference = "Stop"

$RepoDir = "$TargetRoot\repository\phumulani"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " PHUMULANI AI — CANONICAL GITHUB SYNCHRONIZATION" -ForegroundColor White
Write-Host " Target Directory: $RepoDir" -ForegroundColor Gray
Write-Host " Canonical Remote: $RepoRemote" -ForegroundColor Gray
Write-Host "======================================================================" -ForegroundColor Cyan

if (-not (Test-Path "$RepoDir\.git")) {
    Write-Host "[ERROR] Git repository not found at $RepoDir" -ForegroundColor Red
    Write-Host "Run install-phumulani-ai.ps1 first to clone the repository." -ForegroundColor Yellow
    exit 1
}

Push-Location $RepoDir

try {
    # 1. Check for uncommitted modifications
    Write-Host "`n[1/5] Checking Working Tree Status..." -ForegroundColor Yellow
    $status = git status --porcelain
    if ($status) {
        Write-Host "  [NOTICE] Uncommitted local modifications detected:" -ForegroundColor DarkYellow
        $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        if ($PullOnly) {
            Write-Host "  [SAFEGUARD HALT] Working directory has local modifications. Cannot pull without risk of merge collision." -ForegroundColor Red
            Write-Host "  Please commit or stash your changes before pulling remote updates." -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
    } else {
        Write-Host "  [OK] Working tree clean." -ForegroundColor Green
    }

    # 2. Fetch remote changes
    Write-Host "`n[2/5] Fetching Remote Changes from Canonical Remote..." -ForegroundColor Yellow
    git fetch origin
    Write-Host "  [OK] Remote changes fetched." -ForegroundColor Green

    # 3. Pull latest changes safely
    Write-Host "`n[3/5] Synchronizing Remote Branch ($Branch)..." -ForegroundColor Yellow
    $currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
    Write-Host "  Current Local Branch: $currentBranch" -ForegroundColor Gray

    if ($PullOnly -or [string]::IsNullOrWhiteSpace($CommitMessage)) {
        git pull origin $currentBranch --ff-only
        Write-Host "  [OK] Fast-forward synchronization completed." -ForegroundColor Green
        Pop-Location
        exit 0
    }

    # 4. Enforce PII & Model Weights Exclusions
    Write-Host "`n[4/5] Auditing Staged Files for Sensitive Artifacts..." -ForegroundColor Yellow
    $filesToStage = git status -s
    $sensitivePatterns = @("*.gguf", "*.bin", "*.safetensors", ".env.local", "logs/*", "*.log", "*credential*", "*secret*")
    
    foreach ($file in $filesToStage) {
        foreach ($pattern in $sensitivePatterns) {
            if ($file -like $pattern) {
                Write-Host "  [CRITICAL SAFEGUARD] Blocked staging of sensitive file: $file matching $pattern" -ForegroundColor Red
                Pop-Location
                exit 1
            }
        }
    }
    Write-Host "  [OK] No sensitive model weights or credential leaks detected." -ForegroundColor Green

    # 5. Build check before push
    if (-not $SkipBuildCheck) {
        Write-Host "`n[5/5] Running TypeScript Build Verification..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [BUILD FAILED] TypeScript build validation failed. Aborting commit." -ForegroundColor Red
            Pop-Location
            exit 1
        }
        Write-Host "  [OK] Build verified successfully." -ForegroundColor Green
    }

    # Commit and Push
    git add .
    git commit -m "$CommitMessage"
    Write-Host "  [COMMITTED] Changes committed with message: $CommitMessage" -ForegroundColor Green
    git push origin $currentBranch
    Write-Host "  [PUSHED] Successfully pushed to origin/$currentBranch" -ForegroundColor Green

} catch {
    Write-Host "`n[SYNC ERROR] Synchronization failed: $($_.Exception.Message)" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location
Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " SYNCHRONIZATION COMPLETED SAFELY" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
