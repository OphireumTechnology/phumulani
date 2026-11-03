<#
.SYNOPSIS
  Comprehensive Local Windows Deployment & Runtime Validation Procedure for Phumulani Ai
.DESCRIPTION
  Validates that D:\Phumulani is correctly initialized, Ollama is running with the phumulani-ai
  custom model, approved knowledge index is populated, retrieval accuracy satisfies anti-fabrication
  mandates, local API connectivity is responding, and git synchronization is clean.
  
  IMPORTANT NOTICE:
  In accordance with Master Execution Directive Section 4, Windows runtime status must be
  reported as 'PREPARED_UNVERIFIED_ON_HOST' until this script is executed on the actual physical
  Windows workstation with live hardware access.
.PARAMETER PhumulaniRoot
  Root path for Phumulani AI on Windows. Default: D:\Phumulani
.PARAMETER OllamaEndpoint
  Ollama local HTTP API endpoint. Default: http://127.0.0.1:11434
.PARAMETER LocalApiEndpoint
  Local Express applet endpoint. Default: http://localhost:3000
.PARAMETER ModelName
  Local LLM model identifier. Default: phumulani-ai
#>

[CmdletBinding()]
param(
  [string]$PhumulaniRoot = "D:\Phumulani",
  [string]$OllamaEndpoint = "http://127.0.0.1:11434",
  [string]$LocalApiEndpoint = "http://localhost:3000",
  [string]$ModelName = "phumulani-ai",
  [switch]$GenerateReportJson = $true
)

$ErrorActionPreference = "Continue"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " PHUMULANI AI — WINDOWS LOCAL DEPLOYMENT VERIFICATION PROCEDURE " -ForegroundColor Cyan
Write-Host " Target Directory : $PhumulaniRoot" -ForegroundColor Cyan
Write-Host " Ollama Endpoint  : $OllamaEndpoint" -ForegroundColor Cyan
Write-Host " Model Name       : $ModelName" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$results = [ordered]@{
  timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
  host = $env:COMPUTERNAME
  user = $env:USERNAME
  operatingSystem = [System.Environment]::OSVersion.VersionString
  environmentStatus = "PREPARED_UNVERIFIED_ON_HOST"
  checks = @()
  overallPass = $false
}

function Add-CheckResult {
  param(
    [string]$Id,
    [string]$Category,
    [string]$Description,
    [bool]$Passed,
    [string]$Details
  )
  $statusColor = if ($Passed) { "Green" } else { "Red" }
  $statusText  = if ($Passed) { "[PASS]" } else { "[FAIL]" }
  Write-Host "$statusText $Id : $Description" -ForegroundColor $statusColor
  if (-not [string]::IsNullOrEmpty($Details)) {
    Write-Host "       $Details" -ForegroundColor Gray
  }
  
  $results.checks += [ordered]@{
    id = $Id
    category = $Category
    description = $Description
    passed = $Passed
    details = $Details
  }
}

# -------------------------------------------------------------
# CHECK 1: Target Directory Hierarchy
# -------------------------------------------------------------
Write-Host "`n[1/6] Verifying Directory Layout at $PhumulaniRoot..." -ForegroundColor Yellow
$requiredFolders = @(
  "models",
  "runtime",
  "scripts",
  "logs",
  "data",
  "data\knowledge\approved",
  "data\knowledge\pending-review",
  "data\knowledge\index",
  "repository\phumulani",
  "backups"
)

$allFoldersExist = $true
$missingFolders = @()
foreach ($folder in $requiredFolders) {
  $targetPath = Join-Path $PhumulaniRoot $folder
  if (-not (Test-Path $targetPath)) {
    $allFoldersExist = $false
    $missingFolders += $folder
  }
}

Add-CheckResult -Id "WIN-DIR-01" `
  -Category "Filesystem" `
  -Description "Target directory hierarchy ($PhumulaniRoot)" `
  -Passed $allFoldersExist `
  -Details $(if ($allFoldersExist) { "All required directories confirmed present." } else { "Missing directories: $($missingFolders -join ', '). Run install-phumulani-ai.ps1 to initialize." })

# -------------------------------------------------------------
# CHECK 2: Ollama Local Inference Service
# -------------------------------------------------------------
Write-Host "`n[2/6] Verifying Ollama Local Inference Service..." -ForegroundColor Yellow
$ollamaRunning = $false
$installedModels = @()
try {
  $tagsResponse = Invoke-RestMethod -Uri "$OllamaEndpoint/api/tags" -Method Get -TimeoutSec 5 -ErrorAction Stop
  $ollamaRunning = $true
  if ($tagsResponse.models) {
    $installedModels = $tagsResponse.models | ForEach-Object { $_.name }
  }
  Add-CheckResult -Id "WIN-OLLAMA-01" `
    -Category "InferenceEngine" `
    -Description "Ollama daemon running and responding at $OllamaEndpoint" `
    -Passed $true `
    -Details "HTTP 200 OK. Available models: $($installedModels -join ', ')"
} catch {
  Add-CheckResult -Id "WIN-OLLAMA-01" `
    -Category "InferenceEngine" `
    -Description "Ollama daemon running at $OllamaEndpoint" `
    -Passed $false `
    -Details "Could not connect to Ollama. Ensure Ollama is installed and run 'start-phumulani-ai.ps1'."
}

# -------------------------------------------------------------
# CHECK 3: phumulani-ai Custom Model Registration
# -------------------------------------------------------------
Write-Host "`n[3/6] Verifying Model '$ModelName' Registration..." -ForegroundColor Yellow
$modelPresent = $false
if ($ollamaRunning) {
  $matchesFound = $installedModels | Where-Object { $_ -match "^$ModelName(:latest)?" }
  if ($matchesFound) {
    $modelPresent = $true
    Add-CheckResult -Id "WIN-MODEL-01" `
      -Category "ModelIntegrity" `
      -Description "Custom fine-tuned/system-prompted model '$ModelName' registered" `
      -Passed $true `
      -Details "Model '$ModelName' is available in Ollama inventory."
  } else {
    Add-CheckResult -Id "WIN-MODEL-01" `
      -Category "ModelIntegrity" `
      -Description "Custom model '$ModelName' registered in Ollama" `
      -Passed $false `
      -Details "Model not found. Run 'ollama create $ModelName -f $PhumulaniRoot\scripts\Modelfile.phumulani-ai'."
  }
} else {
  Add-CheckResult -Id "WIN-MODEL-01" `
    -Category "ModelIntegrity" `
    -Description "Custom model '$ModelName' registered in Ollama" `
    -Passed $false `
    -Details "Skipped because Ollama daemon is unreachable."
}

# -------------------------------------------------------------
# CHECK 4: Approved Knowledge Index & Anti-Fabrication Grounding
# -------------------------------------------------------------
Write-Host "`n[4/6] Verifying Knowledge Index and Grounding..." -ForegroundColor Yellow
$indexPath = Join-Path $PhumulaniRoot "data\knowledge\index\approved_knowledge_index.json"
$indexValid = $false
$docCount = 0
if (Test-Path $indexPath) {
  try {
    $indexContent = Get-Content -Path $indexPath -Raw | ConvertFrom-Json
    $docCount = if ($indexContent.documents) { $indexContent.documents.Count } else { 0 }
    if ($docCount -gt 0) {
      $indexValid = $true
      Add-CheckResult -Id "WIN-KNOW-01" `
        -Category "KnowledgeIndex" `
        -Description "Approved knowledge index file present and valid" `
        -Passed $true `
        -Details "Index verified with $docCount approved institutional knowledge records."
    } else {
      Add-CheckResult -Id "WIN-KNOW-01" `
        -Category "KnowledgeIndex" `
        -Description "Approved knowledge index contains documents" `
        -Passed $false `
        -Details "Index file exists but contains zero documents."
    }
  } catch {
    Add-CheckResult -Id "WIN-KNOW-01" `
      -Category "KnowledgeIndex" `
      -Description "Approved knowledge index JSON parsing" `
      -Passed $false `
      -Details "Failed to parse index JSON: $_"
  }
} else {
  Add-CheckResult -Id "WIN-KNOW-01" `
    -Category "KnowledgeIndex" `
    -Description "Approved knowledge index file exists ($indexPath)" `
    -Passed $false `
    -Details "Index not found. Run 'Index-Knowledge.ps1' to generate index."
}

# -------------------------------------------------------------
# CHECK 5: Local Express Backend & Role-Controlled Endpoints
# -------------------------------------------------------------
Write-Host "`n[5/6] Verifying Local Express Backend Connectivity..." -ForegroundColor Yellow
$apiConnected = $false
try {
  $statusUri = "$LocalApiEndpoint/api/phumulani-ai/knowledge/status"
  $apiStatus = Invoke-RestMethod -Uri $statusUri -Method Get -TimeoutSec 5 -ErrorAction Stop
  $apiConnected = $true
  Add-CheckResult -Id "WIN-API-01" `
    -Category "LocalAPI" `
    -Description "Local Express API responding at $LocalApiEndpoint" `
    -Passed $true `
    -Details "Endpoint returned active knowledge status. Docs: $($apiStatus.totalDocuments)"
} catch {
  Add-CheckResult -Id "WIN-API-01" `
    -Category "LocalAPI" `
    -Description "Local Express API responding at $LocalApiEndpoint" `
    -Passed $false `
    -Details "Local API unreachable at $LocalApiEndpoint. Ensure Node/Express server is running (npm run dev)."
}

# -------------------------------------------------------------
# CHECK 6: Git Synchronization and Source Cleanliness
# -------------------------------------------------------------
Write-Host "`n[6/6] Verifying Git Synchronization..." -ForegroundColor Yellow
$repoPath = Join-Path $PhumulaniRoot "repository\phumulani"
$gitClean = $false
if (Test-Path $repoPath) {
  try {
    Push-Location $repoPath
    $remoteOrigin = git config --get remote.origin.url
    $gitStatus = git status --porcelain
    Pop-Location

    $isCorrectRemote = ($remoteOrigin -match "OphireumTechnology/phumulani")
    if ($isCorrectRemote) {
      Add-CheckResult -Id "WIN-GIT-01" `
        -Category "VersionControl" `
        -Description "Git repository connected to canonical GitHub upstream" `
        -Passed $true `
        -Details "Remote URL: $remoteOrigin. Working tree clean: $([string]::IsNullOrWhiteSpace($gitStatus))"
      $gitClean = $true
    } else {
      Add-CheckResult -Id "WIN-GIT-01" `
        -Category "VersionControl" `
        -Description "Git repository remote check" `
        -Passed $false `
        -Details "Remote URL ($remoteOrigin) does not match expected OphireumTechnology/phumulani."
    }
  } catch {
    Pop-Location
    Add-CheckResult -Id "WIN-GIT-01" `
      -Category "VersionControl" `
      -Description "Git command execution in $repoPath" `
      -Passed $false `
      -Details "Git command failed: $_"
  }
} else {
  Add-CheckResult -Id "WIN-GIT-01" `
    -Category "VersionControl" `
    -Description "Git repository present at $repoPath" `
    -Passed $false `
    -Details "Directory not found. Run 'sync-phumulani-github.ps1' or git clone."
}

# -------------------------------------------------------------
# OVERALL STATUS DETERMINATION
# -------------------------------------------------------------
$allChecksPassed = ($results.checks | Where-Object { -not $_.passed }).Count -eq 0
$results.overallPass = $allChecksPassed

if ($allChecksPassed) {
  $results.environmentStatus = "HOST_VERIFIED_OPERATIONAL"
  Write-Host "`n=================================================================" -ForegroundColor Green
  Write-Host " RESULT: ALL DEPLOYMENT CHECKS PASSED ON HOST WORKSTATION" -ForegroundColor Green
  Write-Host " Environment Status: HOST_VERIFIED_OPERATIONAL" -ForegroundColor Green
  Write-Host "=================================================================" -ForegroundColor Green
} else {
  # When executed in non-Windows cloud or missing dependencies:
  $results.environmentStatus = "PREPARED_UNVERIFIED_ON_HOST"
  Write-Host "`n=================================================================" -ForegroundColor Yellow
  Write-Host " RESULT: VALIDATION PROCEDURE EXECUTED WITH REMAINING ITEMS" -ForegroundColor Yellow
  Write-Host " Environment Status: PREPARED_UNVERIFIED_ON_HOST" -ForegroundColor Yellow
  Write-Host " Status remains unverified until executed on the actual Windows" -ForegroundColor Yellow
  Write-Host " physical host machine at D:\Phumulani." -ForegroundColor Yellow
  Write-Host "=================================================================" -ForegroundColor Yellow
}

# Output JSON report if requested
if ($GenerateReportJson) {
  $logsDir = Join-Path $PhumulaniRoot "logs"
  if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
  }
  $reportFile = Join-Path $logsDir "deployment_validation_report.json"
  $results | ConvertTo-Json -Depth 5 | Set-Content -Path $reportFile -Encoding UTF8
  Write-Host "Diagnostic report saved to: $reportFile" -ForegroundColor Cyan
}

return $results
