#!/bin/bash

# Filesystem health check for obsidian-eln-plugin
# Detects corruption and potential issues

PROJECT_DIR="/Users/gc9830/Documents/GitHub/obsidian-eln-plugin"
LOG_FILE="$PROJECT_DIR/scripts/health-check.log"

echo "========================================" >> "$LOG_FILE"
echo "Health check started: $(date)" >> "$LOG_FILE"

# Check for zero-byte files
echo "Checking for zero-byte files..." >> "$LOG_FILE"
ZERO_BYTE_FILES=$(find "$PROJECT_DIR/src" -name "*.ts" -size 0 2>/dev/null | wc -l)
if [ "$ZERO_BYTE_FILES" -gt 0 ]; then
    echo "WARNING: Found $ZERO_BYTE_FILES zero-byte TypeScript files!" >> "$LOG_FILE"
    find "$PROJECT_DIR/src" -name "*.ts" -size 0 >> "$LOG_FILE"
fi

# Check for files modified in the last minute (potential corruption indicator)
RECENT_CHANGES=$(find "$PROJECT_DIR/src" -name "*.ts" -newermt "1 minute ago" 2>/dev/null | wc -l)
if [ "$RECENT_CHANGES" -gt 20 ]; then
    echo "WARNING: $RECENT_CHANGES files modified in the last minute - potential mass corruption!" >> "$LOG_FILE"
fi

# Check disk space
DISK_USAGE=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "WARNING: Disk usage is $DISK_USAGE% - low space may cause corruption!" >> "$LOG_FILE"
fi

# Check for old folder structures that shouldn't exist
OLD_FOLDERS=("$PROJECT_DIR/src/renderer" "$PROJECT_DIR/src/api" "$PROJECT_DIR/src/templates")
for folder in "${OLD_FOLDERS[@]}"; do
    if [ -d "$folder" ]; then
        echo "WARNING: Old folder structure detected: $folder" >> "$LOG_FILE"
    fi
done

# Check critical files exist and have reasonable sizes
CRITICAL_FILES=(
    "src/main.ts:200"
    "src/ui/modals/components/EditableObjectInput.ts:7000"
    "src/ui/modals/components/EnhancedObjectListInput.ts:12000"
    "src/core/api/ELNApi.ts:200"
)

for file_check in "${CRITICAL_FILES[@]}"; do
    file_path=$(echo "$file_check" | cut -d: -f1)
    min_size=$(echo "$file_check" | cut -d: -f2)
    
    if [ -f "$PROJECT_DIR/$file_path" ]; then
        actual_size=$(stat -f%z "$PROJECT_DIR/$file_path" 2>/dev/null || echo "0")
        if [ "$actual_size" -lt "$min_size" ]; then
            echo "WARNING: $file_path is only $actual_size bytes (expected >$min_size)" >> "$LOG_FILE"
        fi
    else
        echo "ERROR: Critical file missing: $file_path" >> "$LOG_FILE"
    fi
done

echo "Health check completed: $(date)" >> "$LOG_FILE"

# If any warnings or errors were found, display them
if grep -q "WARNING\|ERROR" "$LOG_FILE"; then
    echo "⚠️  Health check found issues - check $LOG_FILE"
    tail -20 "$LOG_FILE"
else
    echo "✅ Health check passed - no issues detected"
fi
