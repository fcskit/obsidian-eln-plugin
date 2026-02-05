#!/bin/bash

# Automated backup script for obsidian-eln-plugin
# Runs every hour to create timestamped backups

PROJECT_DIR="/Users/gc9830/Documents/GitHub/obsidian-eln-plugin"
BACKUP_DIR="$PROJECT_DIR/backup"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_NAME="src-$TIMESTAMP"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create backup of src directory
if [ -d "$PROJECT_DIR/src" ]; then
    echo "Creating backup: $BACKUP_NAME"
    cp -r "$PROJECT_DIR/src" "$BACKUP_DIR/$BACKUP_NAME"
    
    # Compress the backup to save space
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    echo "Backup completed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
    
    # Keep only the last 24 backups (1 day worth)
    ls -t "$BACKUP_DIR"/src-*.tar.gz | tail -n +25 | xargs -r rm
    
    # Log the backup
    echo "$(date): Backup created - $BACKUP_NAME.tar.gz" >> "$BACKUP_DIR/backup.log"
else
    echo "Error: Source directory not found: $PROJECT_DIR/src"
    exit 1
fi
