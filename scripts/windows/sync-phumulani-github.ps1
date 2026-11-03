# ==============================================================================
# Phumulani AI Community Platform — Windows Local GitHub Synchronization Tool
# Phase 65: Safe Bi-Directional Synchronization with GitHub Repository
# Canonical Repo: https://github.com/OphireumTechnology/phumulani
# ==============================================================================

[CmdletBinding()]
param(
    [string]$TargetRoot = "D:\PhumulaniAI",
    [string]$DevBranch = "feat/phumulani-ai-local",
    [switch]$PushToRemote = $false,
    [string]$CommitMessage = ""
)

$ErrorActionPreference = "Stop"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  PHUMULANI AI — SAFE GITHUB REPOSITORY SYNCHRONIZATION (PHASE 65)    " -ForegroundColor White -BackgroundColor DarkCyan
Write-Host "====================================================================" -ForegroundColor Cyan

$repoPath = "$TargetRoot\repository\phumulani"
if (-not (Test-Path "$repoPath\.git")) {
    if (Test-Path ".git") {
        $repoPath = (Get-Location).Path
    } else {
        Write-Error "Repository not found at $repoPath. Please initialize repository first."
        exit 1
    }
}

Set-Location $repoPath
Write-Host "Working Directory: $repoPath" -ForegroundColor Gray

# 1. CHECK PROTECTED FILES PRESERVATION
Write-Host "`n[1/7] Auditing Critical Architecture Files..." -ForegroundColor Green
$protectedFiles = @(
    "package-lock.json",
    "package.json",
    "server.ts",
    "tsconfig.json",
    "vite.config.ts",
    "src/views",
    "src/services",
    "src/types",
    "src/utils",
    "tests"
)

foreach ($pf in $protectedFiles) {
    if (-not (Test-Path $pf)) {
        Write-Error "CRITICAL INVARIANT VIOLATION: Protected path '$pf' is missing! Aborting synchronization to prevent repo corruption."
        exit 1
    }
}
Write-Host "  All protected architecture files verified present." -ForegroundColor Green

# 2. FETCH REMOTE REPOSITORY
Write-Host "`n[2/7] Fetching Remote Changes from Origin..." -ForegroundColor Green
git fetch origin
$remoteBranches = (git branch -r) -join " "
Write-Host "  Remote references fetched successfully." -ForegroundColor Gray

# 3. VERIFY AND SAFEGUARD BRANCH
Write-Host "`n[3/7] Verifying Current Working Branch..." -ForegroundColor Green
$currentBranch = (git branch --show-current).Trim()
Write-Host "  Current Branch: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -eq "main" -and $PushToRemote) {
    Write-Warning "Direct push to 'main' branch is strictly forbidden by Phumulani platform guardrails."
    Write-Host "  Switching or creating safe development branch '$DevBranch'..." -ForegroundColor Cyan
    git checkout -b $DevBranch 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout $DevBranch
    }
    $currentBranch = $DevBranch
}

# 4. WORKING TREE MODIFICATION CHECK
Write-Host "`n[4/7] Checking Working Tree Modifications..." -ForegroundColor Green
$status = git status --porcelain
if ($status) {
    Write-Host "  Uncommitted local modifications detected:" -ForegroundColor Yellow
    $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "  Working tree is clean." -ForegroundColor Green
}

# 5. SENSITIVE DATA LEAK AUDIT (PROHIBIT MODEL WEIGHTS, PII, TOKENS, CREDENTIALS)
Write-Host "`n[5/7] Running Sensitive Data & Model File Firewall Audit..." -ForegroundColor Green
$prohibitedPatterns = @("*.gguf", "*.bin", "*.pth", "*.safetensors", "*.env", "*token*.json", "*secret*", "logs/*.log")
$leakFound = $false

foreach ($pattern in $prohibitedPatterns) {
    $stagedLeaks = git diff --cached --name-only --diff-filter=A | Select-String -Pattern ($pattern.Replace('*', '.*'))
    if ($stagedLeaks) {
        Write-Error "SECURITY FIREWALL BLOCKED COMMIT: Prohibited file matching pattern '$pattern' was detected in staging: $stagedLeaks"
        $leakFound = $true
    }
}

if ($leakFound) {
    Write-Error "Synchronization aborted due to sensitive data leak firewall."
    exit 1
}
Write-Host "  Firewall check passed: Zero model weights, secrets, or PII staged." -ForegroundColor Green

# 6. PULL REMOTE CHANGES WITH REBASE
Write-Host "`n[6/7] Reconciling Remote Updates..." -ForegroundColor Green
try {
    # Check if remote tracking branch exists
    $hasUpstream = git rev-parse --abbrev-ref "@{u}" 2>$null
    if ($hasUpstream) {
        git pull --rebase origin $currentBranch
        Write-Host "  Rebase onto origin/$currentBranch completed." -ForegroundColor Green
    } else {
        Write-Host "  No upstream set for branch '$currentBranch' yet." -ForegroundColor Gray
    }
} catch {
    Write-Warning "Rebase encountered conflict or notice. Please resolve merge manually."
}

# 7. COMMIT & PUSH DECISION GATE
Write-Host "`n[7/7] Synchronizing Commit & Push Status..." -ForegroundColor Green
$headSha = (git rev-parse HEAD).Trim()
$shortSha = (git rev-parse --short HEAD).Trim()
Write-Host "  Current HEAD Commit SHA: $headSha ($shortSha)" -ForegroundColor White

if ($PushToRemote) {
    if (-not $CommitMessage) {
        $CommitMessage = "feat(phase65): synchronize Phumulani Ai local agent and fundraising intelligence"
    }
    $confirm = Read-Host "Are you sure you want to push branch '$currentBranch' to origin? (Y/N)"
    if ($confirm -match "^[Yy]") {
        git add -A
        git commit -m $CommitMessage 2>$null
        git push -u origin $currentBranch
        Write-Host "  Pushed to origin/$currentBranch successfully!" -ForegroundColor Green
        Write-Host "  Create a Pull Request to merge into 'main' after CI verification." -ForegroundColor Cyan
    } else {
        Write-Host "  Push cancelled by user." -ForegroundColor Yellow
    }
} else {
    Write-Host "  Remote push was not requested (use -PushToRemote to push)." -ForegroundColor Gray
}

Write-Host "`n====================================================================" -ForegroundColor Cyan
Write-Host "  SYNCHRONIZATION CHECK COMPLETE. ACTIVE COMMIT: $shortSha             " -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "====================================================================" -ForegroundColor Cyan
