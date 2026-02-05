#!/bin/bash

# Quick recovery script for file corruption
# Restores from the most recent backup

PROJECT_DIR="/Users/gc9830/Documents/GitHub/obsidian-eln-plugin"
BACKUP_DIR="$PROJECT_DIR/backup"

echo "🚨 CORRUPTION RECOVERY MODE"
echo "This will restore your src/ folder from the most recent backup."
echo "Current src/ will be moved to src-corrupted-$(date +%Y%m%d-%H%M%S)"
echo ""

# Find the most recent backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/src-*.tar.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backups found in $BACKUP_DIR"
    exit 1
fi

echo "Latest backup: $(basename "$LATEST_BACKUP")"
echo ""
read -p "Do you want to proceed with recovery? (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "Recovery cancelled."
    exit 0
fi

# Move current src to corrupted folder
if [ -d "$PROJECT_DIR/src" ]; then
    mv "$PROJECT_DIR/src" "$PROJECT_DIR/src-corrupted-$(date +%Y%m%d-%H%M%S)"
    echo "✅ Moved corrupted src/ folder"
fi

# Extract backup
cd "$PROJECT_DIR"
tar -xzf "$LATEST_BACKUP"
mv "backup/$(basename "$LATEST_BACKUP" .tar.gz)" src/
echo "✅ Restored src/ from backup"

# Run health check
echo "Running health check..."
./scripts/health-check.sh

echo ""
echo "🎉 Recovery completed!"
echo "⚠️  Remember to check if any recent work needs to be manually restored."
