#!/bin/sh

# EasyPass Post-Installation Script
# This script ensures proper data directory setup and data retention

set -e

# Get the real user (not root)
REAL_USER=${SUDO_USER:-$USER}

# Create data directory with proper permissions
if [ -n "$REAL_USER" ]; then
    USER_HOME=$(eval echo ~$REAL_USER)
    DATA_DIR="$USER_HOME/.config/easypass"
    
    # Create directory if it doesn't exist
    if [ ! -d "$DATA_DIR" ]; then
        mkdir -p "$DATA_DIR"
        echo "Created data directory: $DATA_DIR"
    fi
    
    # Set proper ownership
    chown "$REAL_USER:$REAL_USER" "$DATA_DIR" 2>/dev/null || true
    
    # Set secure permissions (700 = user read/write/execute only)
    chmod 700 "$DATA_DIR" 2>/dev/null || true
    
    # Set secure permissions for existing data files (600 = user read/write only)
    if [ -d "$DATA_DIR" ]; then
        find "$DATA_DIR" -type f -name "*.json" -exec chmod 600 {} \; 2>/dev/null || true
    fi
    
    echo "EasyPass data directory configured: $DATA_DIR"
else
    echo "Warning: Could not determine real user for data directory setup"
fi

# Create desktop file entry if needed
if [ -f /usr/share/applications/easypass.desktop ]; then
    # Update desktop database
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi

echo "EasyPass installation completed successfully"
exit 0 