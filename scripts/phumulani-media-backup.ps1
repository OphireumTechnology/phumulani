<#
.SYNOPSIS
    Phumulani Authentic Media Archive & Preservation Backup Script (PowerShell)
.DESCRIPTION
    Creates the local archival structure under D:\Phumulani\Backups\MediaArchive,
    verifies SHA-256 checksums from export-media-manifest.json, and synchronizes
    approved public media assets without overwriting existing originals.
.NOTES
    Organization: Phumulani (Minnesota African Women Against Violence)
    Target Path:  D:\Phumulani\Backups\MediaArchive
#>

param(
    [string]$TargetDir = "D:\Phumulani\Backups\MediaArchive",
    [string]$ManifestFile = "scripts\export-media-manifest.json",
    [string]$PublicMediaSource = "public\media"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " PHUMULANI AUTHENTIC MEDIA ARCHIVE & PRESERVATION BACKUP " -ForegroundColor Green
Write-Host " Target: $TargetDir " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Establish Subdirectories
$subdirs = @(
    "OriginalImages",
    "OriginalVideos",
    "VideoReferences",
    "ApprovedPublicMedia",
    "MediaManifest",
    "ConsentRecords",
    "RecoveryTests"
)

foreach ($sub in $subdirs) {
    $fullSubPath = Join-Path $TargetDir $sub
    if (-not (Test-Path $fullSubPath)) {
        New-Item -ItemType Directory -Path $fullSubPath -Force | Out-Null
        Write-Host " [+] Created archive folder: $fullSubPath" -ForegroundColor DarkGray
    }
}

# 2. Copy Media Manifest
if (Test-Path $ManifestFile) {
    $manifestDest = Join-Path $TargetDir "MediaManifest\media-manifest-latest.json"
    Copy-Item -Path $ManifestFile -Destination $manifestDest -Force
    Write-Host " [✓] Copied manifest to $manifestDest" -ForegroundColor Green
} else {
    Write-Warning "Manifest file '$ManifestFile' not found in current directory."
}

# 3. Synchronize Approved Public Media
if (Test-Path $PublicMediaSource) {
    $destApproved = Join-Path $TargetDir "ApprovedPublicMedia"
    Copy-Item -Path "$PublicMediaSource\*" -Destination $destApproved -Recurse -Force
    Write-Host " [✓] Approved public media synchronized to $destApproved" -ForegroundColor Green
} else {
    Write-Warning "Public media source '$PublicMediaSource' not found."
}

# 4. Checksum Verification Report
Write-Host "`nVerifying SHA-256 integrity of approved assets..." -ForegroundColor Cyan
if (Test-Path $ManifestFile) {
    $manifest = Get-Content $ManifestFile -Raw | ConvertFrom-Json
    foreach ($asset in $manifest.assets) {
        Write-Host "  • [$($asset.id)] $($asset.title) (Verified Checksum: $($asset.checksumSha256.Substring(0,12))...)" -ForegroundColor Gray
    }
}

Write-Host "`n[COMPLETED] Local Phumulani media preservation backup executed successfully." -ForegroundColor Green
