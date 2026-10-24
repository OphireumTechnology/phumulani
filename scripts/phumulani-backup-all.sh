#!/usr/bin/env bash
# ==============================================================================
# Phumulani Enterprise Master Disaster Recovery Backup (POSIX Shell)
# Organization: Phumulani (Minnesota African Women Against Violence)
# ==============================================================================

set -euo pipefail

BACKUP_ROOT="${1:-/tmp/phumulani_backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "=========================================================="
echo " PHUMULANI ENTERPRISE MASTER DISASTER RECOVERY BACKUP "
echo " Target Root: ${BACKUP_ROOT}"
echo " Timestamp:   ${TIMESTAMP}"
echo "=========================================================="

mkdir -p "${BACKUP_ROOT}/MediaArchive"
mkdir -p "${BACKUP_ROOT}/Database/Schema"
mkdir -p "${BACKUP_ROOT}/CodeCheckpoints"

# 1. Media Archive
if [ -f "scripts/phumulani-media-backup.sh" ]; then
    echo ">>> [1/3] Synchronizing Authentic Media Archive..."
    bash scripts/phumulani-media-backup.sh "${BACKUP_ROOT}/MediaArchive"
fi

# 2. Database Schema
if [ -f "src/db/schema.sql" ]; then
    echo ">>> [2/3] Archiving PostgreSQL Schema..."
    cp "src/db/schema.sql" "${BACKUP_ROOT}/Database/Schema/schema-latest.sql"
    cp "src/db/schema.sql" "${BACKUP_ROOT}/Database/Schema/schema-${TIMESTAMP}.sql"
    sha256sum "${BACKUP_ROOT}/Database/Schema/schema-latest.sql"
fi

# 3. Source Snapshot
echo ">>> [3/3] Creating Source Archive..."
tar --exclude="node_modules" --exclude=".git" -czf "${BACKUP_ROOT}/CodeCheckpoints/phumulani-${TIMESTAMP}.tar.gz" src public scripts package.json tsconfig.json vite.config.ts metadata.json index.html

echo "=========================================================="
echo " BACKUP COMPLETE: ${BACKUP_ROOT}"
echo "=========================================================="
