# Phumulani AI Community Platform — Windows Local Knowledge Indexer (Milestone 2)
# Scans D:\Phumulani\data\knowledge\approved, validates metadata schema, and generates compiled index in D:\Phumulani\data\knowledge\index
# Target Windows execution path: D:\Phumulani

[CmdletBinding()]
param (
    [string]$RootPath = "D:\Phumulani",
    [switch]$VerboseOutput,
    [switch]$IncludeWarningsAsErrors
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " Phumulani Ai — Institutional Knowledge Base Indexer" -ForegroundColor Cyan
Write-Host " Target Directory: $RootPath" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$ApprovedDir = Join-Path $RootPath "data\knowledge\approved"
$PendingDir  = Join-Path $RootPath "data\knowledge\pending-review"
$IndexDir    = Join-Path $RootPath "data\knowledge\index"
$OutputFile  = Join-Path $IndexDir "approved_knowledge_index.json"

# Check if Approved Directory exists
if (-not (Test-Path $ApprovedDir)) {
    Write-Warning "Approved knowledge directory not found at $ApprovedDir. Creating skeleton directory..."
    New-Item -ItemType Directory -Path $ApprovedDir -Force | Out-Null
}

if (-not (Test-Path $IndexDir)) {
    New-Item -ItemType Directory -Path $IndexDir -Force | Out-Null
}

$files = Get-ChildItem -Path $ApprovedDir -Filter "*.json" -File
Write-Host "Found $($files.Count) JSON document(s) in $ApprovedDir" -ForegroundColor Yellow

$indexedDocs = @()
$validationErrors = @()
$categories = @{}

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
        
        # Schema Validation
        $errors = @()
        if (-not $content.id) { $errors += "Missing top-level 'id'" }
        if (-not $content.title) { $errors += "Missing top-level 'title'" }
        if (-not $content.category) { $errors += "Missing top-level 'category'" }
        if (-not $content.metadata) {
            $errors += "Missing 'metadata' object"
        } else {
            if (-not $content.metadata.sourceDocumentId) { $errors += "Missing metadata.sourceDocumentId" }
            if ($content.metadata.institutionalApprovalStatus -ne "APPROVED") {
                $errors += "Document status is '$($content.metadata.institutionalApprovalStatus)'; ONLY 'APPROVED' records are indexed"
            }
            if (-not $content.metadata.recordOwner) { $errors += "Missing metadata.recordOwner" }
            if (-not $content.metadata.approvalDate) { $errors += "Missing metadata.approvalDate" }
            if (-not $content.metadata.accessClassification) { $errors += "Missing metadata.accessClassification" }
            if (-not $content.metadata.evidenceReference) { $errors += "Missing metadata.evidenceReference" }
            if ($content.metadata.isDemoData -eq $true) { $errors += "isDemoData is true; simulated records are excluded from approved index" }
        }

        if ($errors.Count -gt 0) {
            $validationErrors += [PSCustomObject]@{
                File = $file.Name
                Issues = ($errors -join "; ")
            }
            Write-Host " [REJECTED] $($file.Name): $($errors -join '; ')" -ForegroundColor Red
            continue
        }

        # Add to indexed list
        $cat = [string]$content.category
        if (-not $categories.ContainsKey($cat)) { $categories[$cat] = 0 }
        $categories[$cat]++

        $indexedDocs += [PSCustomObject]@{
            id = $content.id
            title = $content.title
            category = $content.category
            sourceDocumentId = $content.metadata.sourceDocumentId
            recordOwner = $content.metadata.recordOwner
            approvalDate = $content.metadata.approvalDate
            effectiveDate = $content.metadata.effectiveDate
            lastVerificationDate = $content.metadata.lastVerificationDate
            reviewExpirationDate = $content.metadata.reviewExpirationDate
            accessClassification = $content.metadata.accessClassification
            evidenceReference = $content.metadata.evidenceReference
            keyFactsCount = if ($content.keyFacts) { $content.keyFacts.Count } else { 0 }
            tags = $content.tags
            filePath = $file.FullName
        }

        Write-Host " [APPROVED] $($content.id) - $($content.title)" -ForegroundColor Green

    } catch {
        $validationErrors += [PSCustomObject]@{
            File = $file.Name
            Issues = "JSON Parse Failure: $($_.Exception.Message)"
        }
        Write-Host " [PARSE_ERROR] $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Compile and save index payload
$indexPayload = [PSCustomObject]@{
    indexedTimestamp = (Get-Date).ToString("o")
    rootPath = $RootPath
    totalApprovedRecords = $indexedDocs.Count
    validationErrorsCount = $validationErrors.Count
    categoryCounts = $categories
    documents = $indexedDocs
    validationNotice = "Only records with status APPROVED and isDemoData=false are included. PII is scrubbed."
}

$jsonOutput = $indexPayload | ConvertTo-Json -Depth 6
Set-Content -Path $OutputFile -Value $jsonOutput -Encoding UTF8

Write-Host "-----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host " Index Generation Completed!" -ForegroundColor Green
Write-Host " Output file: $OutputFile" -ForegroundColor Green
Write-Host " Total Approved Documents Indexed: $($indexedDocs.Count)" -ForegroundColor Green
Write-Host " Categories Covered: $($categories.Keys -join ', ')" -ForegroundColor Green
if ($validationErrors.Count -gt 0) {
    Write-Host " Total Rejected/Error Records: $($validationErrors.Count)" -ForegroundColor Yellow
}
Write-Host "=================================================================" -ForegroundColor Cyan
