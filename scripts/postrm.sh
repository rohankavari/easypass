#!/bin/sh

# EasyPass Post-Removal Script
# This script preserves user data during uninstallation

set -e

# Get the real user (not root)
REAL_USER=${SUDO_USER:-$USER}

if [ -n "$REAL_USER" ]; then
    USER_HOME=$(eval echo ~$REAL_USER)
    DATA_DIR="$USER_HOME/.config/easypass"
    
    # Check if this is a complete removal (not just an upgrade)
    if [ "$1" = "remove" ] || [ "$1" = "purge" ]; then
        echo "EasyPass has been uninstalled."
        echo "Your password data is preserved in: $DATA_DIR"
        echo "To completely remove your data, manually delete: $DATA_DIR"
    else
        echo "EasyPass has been upgraded. Your data is preserved."
    fi
else
    echo "EasyPass has been uninstalled. User data may be preserved in ~/.config/easypass"
fi

# Remove desktop file entry if it exists
if [ -f /usr/share/applications/easypass.desktop ]; then
    rm -f /usr/share/applications/easypass.desktop
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi

exit 0 