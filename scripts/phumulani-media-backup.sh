#!/usr/bin/env bash
# Phumulani Authentic Media Archive & Preservation Backup Script (Bash)
# Target: D:\Phumulani\Backups\MediaArchive (or /var/backups/phumulani on Unix)

TARGET_DIR="${1:-./backups/MediaArchive}"
MANIFEST_FILE="${2:-./scripts/export-media-manifest.json}"
PUBLIC_MEDIA_SOURCE="${3:-./public/media}"

echo "=========================================================="
echo " PHUMULANI AUTHENTIC MEDIA ARCHIVE & PRESERVATION BACKUP "
echo " Target: ${TARGET_DIR} "
echo "=========================================================="

mkdir -p "${TARGET_DIR}/OriginalImages" \
         "${TARGET_DIR}/OriginalVideos" \
         "${TARGET_DIR}/VideoReferences" \
         "${TARGET_DIR}/ApprovedPublicMedia" \
         "${TARGET_DIR}/MediaManifest" \
         "${TARGET_DIR}/ConsentRecords" \
         "${TARGET_DIR}/RecoveryTests"

if [ -f "${MANIFEST_FILE}" ]; then
  cp "${MANIFEST_FILE}" "${TARGET_DIR}/MediaManifest/media-manifest-latest.json"
  echo "[✓] Copied manifest to ${TARGET_DIR}/MediaManifest/media-manifest-latest.json"
fi

if [ -d "${PUBLIC_MEDIA_SOURCE}" ]; then
  cp -r "${PUBLIC_MEDIA_SOURCE}/"* "${TARGET_DIR}/ApprovedPublicMedia/"
  echo "[✓] Approved public media synchronized to ${TARGET_DIR}/ApprovedPublicMedia/"
fi

echo "[COMPLETED] Phumulani media preservation backup executed successfully."
