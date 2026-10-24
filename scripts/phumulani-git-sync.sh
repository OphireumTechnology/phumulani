#!/usr/bin/env bash
# ==============================================================================
# Phumulani Git Enterprise Synchronization Script (POSIX / Bash)
# Organization: Phumulani (Minnesota African Women Against Violence)
# Repository: OphireumTechnology/phumulani
# Target Branch: feature/phumulani-phase6-enterprise-integration
# ==============================================================================

set -eo pipefail

TARGET_BRANCH="feature/phumulani-phase6-enterprise-integration"
EXPECTED_REMOTE="OphireumTechnology/phumulani"

echo "=========================================================="
echo " PHUMULANI GIT SYNCHRONIZATION & BRANCH AUDITOR (POSIX)   "
echo " Target Branch: $TARGET_BRANCH"
echo " Expected Remote: $EXPECTED_REMOTE"
echo "=========================================================="

if ! command -v git &> /dev/null; then
    echo "[-] Error: Git is not installed or not in PATH."
    exit 1
fi

echo "[✓] Git binary detected: $(git --version)"

# Check if inside git worktree
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "[!] Not currently in an initialized git repository."
    echo "    Initializing repository and setting remote..."
    git init -b "$TARGET_BRANCH"
    git remote add origin "https://github.com/OphireumTechnology/phumulani.git" 2>/dev/null || true
fi

echo ""
echo ">>> [Remotes Configured]:"
git remote -v || true

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
echo ""
echo ">>> Current Branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    echo "[*] Notice: Current branch is '$CURRENT_BRANCH'."
    echo "    To checkout Phase 6 integration branch safely:"
    echo "    git checkout -b $TARGET_BRANCH"
else
    echo "[✓] Active on verified Phase 6 integration branch: $TARGET_BRANCH"
fi

echo ""
echo ">>> Working Tree Status:"
git status --short || true

echo ""
echo "=========================================================="
echo " ENTERPRISE SAFETY CONSTRAINTS:"
echo "  [!] Force-pushing is strictly prohibited: 'git push --force' will be rejected."
echo "  [!] Overwriting main branch without PR approval is prohibited."
echo "  [!] All media assets are tracked via export-media-manifest.json with SHA-256."
echo "=========================================================="
