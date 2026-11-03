# Phumulani AI Community Platform — Windows Local Knowledge Search CLI (Milestone 2)
# Queries D:\Phumulani\data\knowledge\index\approved_knowledge_index.json and formats citations
# Target Windows execution path: D:\Phumulani

[CmdletBinding()]
param (
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Query,

    [string]$RootPath = "D:\Phumulani",
    [string]$Category,
    [int]$Limit = 3
)

$ErrorActionPreference = "Stop"

$IndexFile = Join-Path $RootPath "data\knowledge\index\approved_knowledge_index.json"

if (-not (Test-Path $IndexFile)) {
    Write-Error "Knowledge index not found at $IndexFile. Please run .\scripts\windows\Index-Knowledge.ps1 first."
    exit 1
}

$index = Get-Content -Path $IndexFile -Raw | ConvertFrom-Json
$docs = $index.documents

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " Phumulani Ai — Institutional Knowledge Search" -ForegroundColor Cyan
Write-Host " Query: '$Query'" -ForegroundColor Yellow
Write-Host " Indexed Pool: $($docs.Count) approved documents" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan

$searchTerms = $Query.ToLower().Split(" ") | Where-Object { $_.Length -gt 2 }

$matches = @()
foreach ($doc in $docs) {
    if ($Category -and $doc.category -ne $Category) {
        continue
    }

    $score = 0
    $haystack = "$($doc.title) $($doc.category) $($doc.sourceDocumentId) $($doc.tags -join ' ') $($doc.evidenceReference)".ToLower()

    foreach ($term in $searchTerms) {
        if ($doc.title.ToLower().Contains($term)) { $score += 10 }
        if ($doc.tags -and ($doc.tags -join ' ').ToLower().Contains($term)) { $score += 8 }
        if ($haystack.Contains($term)) { $score += 3 }
    }

    if ($score -gt 0) {
        $matches += [PSCustomObject]@{
            Score = $score
            Doc = $doc
        }
    }
}

$sorted = $matches | Sort-Object -Property Score -Descending | Select-Object -First $Limit

if ($sorted.Count -eq 0) {
    Write-Host "`n[NOTICE] No approved institutional documents matched your query." -ForegroundColor Yellow
    Write-Host "MANDATE: State that verified institutional information is absent rather than estimating or fabricating facts.`n" -ForegroundColor DarkYellow
    exit 0
}

Write-Host "`nFound $($sorted.Count) verified document(s):`n" -ForegroundColor Green

foreach ($m in $sorted) {
    $d = $m.Doc
    Write-Host "[$($d.sourceDocumentId)] $($d.title)" -ForegroundColor White
    Write-Host "  Category:       $($d.category)" -ForegroundColor Gray
    Write-Host "  Approved By:    $($d.recordOwner) on $($d.approvalDate)" -ForegroundColor Gray
    Write-Host "  Classification: $($d.accessClassification)" -ForegroundColor Gray
    Write-Host "  Evidence Ref:   $($d.evidenceReference)" -ForegroundColor Cyan
    Write-Host "  Tags:           $($d.tags -join ', ')" -ForegroundColor DarkGray
    Write-Host "  Match Score:    $($m.Score)" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------------------" -ForegroundColor DarkGray
}
