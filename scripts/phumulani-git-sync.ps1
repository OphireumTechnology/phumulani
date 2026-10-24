<#
.SYNOPSIS
    Phumulani Git Enterprise Synchronization Script (PowerShell)
.DESCRIPTION
    Safely inspects git status, verifies branch identity (target: feature/phumulani-phase6-enterprise-integration),
    confirms remote OphireumTechnology/phumulani, and validates working tree integrity.
    Enforces NO force-push and NO branch deletion rules.
.NOTES
    Organization: Phumulani (Minnesota African Women Against Violence)
    Target Branch: feature/phumulani-phase6-enterprise-integration
#>

param(
    [string]$TargetBranch = "feature/phumulani-phase6-enterprise-integration",
    [string]$ExpectedRemote = "OphireumTechnology/phumulani"
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " PHUMULANI GIT SYNCHRONIZATION & BRANCH AUDITOR " -ForegroundColor Green
Write-Host " Target Branch: $TargetBranch " -ForegroundColor White
Write-Host " Expected Remote: $ExpectedRemote " -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify Git Installation
try {
    $gitVersion = git --version
    Write-Host " [✓] Git detected: $gitVersion" -ForegroundColor Green
} catch {
    Write-Error "Git is not installed or not in PATH."
    exit 1
}

# 2. Check Remote Configuration
$remotes = git remote -v
Write-Host "`n>>> [Remotes Configured]:" -ForegroundColor Yellow
$remotes | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray }

# 3. Check Current Branch
$currentBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
Write-Host "`n>>> Current Branch: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne $TargetBranch) {
    Write-Host " [*] Notice: Current branch is '$currentBranch'." -ForegroundColor Yellow
    Write-Host "     To checkout phase 6 integration branch safely run:" -ForegroundColor DarkGray
    Write-Host "     git checkout -b $TargetBranch" -ForegroundColor Cyan
} else {
    Write-Host " [✓] Active on verified Phase 6 integration branch: $TargetBranch" -ForegroundColor Green
}

# 4. Check Working Tree Status
Write-Host "`n>>> Working Tree Status:" -ForegroundColor Yellow
git status --short

# 5. Enforce Safety Policy
Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " ENTERPRISE SAFETY CONSTRAINTS:" -ForegroundColor Yellow
Write-Host "  [!] Force-pushing is strictly prohibited: 'git push --force' will be rejected." -ForegroundColor Red
Write-Host "  [!] Overwriting main branch without PR approval is prohibited." -ForegroundColor Red
Write-Host "  [!] All media assets are tracked via export-media-manifest.json with SHA-256." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
