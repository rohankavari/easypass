// Storage utility for EasyPass
const fs = require('fs');
const path = require('path');
const os = require('os');

class PasswordStorage {
    constructor() {
        this.storageKey = 'sshPasswords';
        this.settingsKey = 'sshPasswordsSettings';
        this.dataDir = this.getDataDirectory();
        this.passwordsFile = path.join(this.dataDir, 'passwords.json');
        this.settingsFile = path.join(this.dataDir, 'settings.json');
        this.ensureDataDirectory();
    }

    // Get the appropriate data directory for the platform
    getDataDirectory() {
        const appName = 'easypass';
        
        switch (process.platform) {
            case 'linux':
                return path.join(os.homedir(), '.config', appName);
            case 'darwin':
                return path.join(os.homedir(), 'Library', 'Application Support', appName);
            case 'win32':
                return path.join(os.homedir(), 'AppData', 'Roaming', appName);
            default:
                return path.join(os.homedir(), '.config', appName);
        }
    }

    // Ensure data directory exists
    ensureDataDirectory() {
        try {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
            }
        } catch (error) {
            console.error('Error creating data directory:', error);
        }
    }

    // Load passwords from file storage
    async loadPasswords() {
        try {
            // First try to load from file storage
            if (fs.existsSync(this.passwordsFile)) {
                const data = fs.readFileSync(this.passwordsFile, 'utf8');
                const passwords = JSON.parse(data);
                return this.validatePasswords(passwords);
            }
            
            // Fallback to localStorage for migration
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const passwords = JSON.parse(stored);
                const validatedPasswords = this.validatePasswords(passwords);
                // Migrate to file storage
                await this.savePasswords(validatedPasswords);
                return validatedPasswords;
            }
            
            return [];
        } catch (error) {
            console.error('Error loading passwords:', error);
            return [];
        }
    }

    // Save passwords to file storage
    async savePasswords(passwords) {
        try {
            const validatedPasswords = this.validatePasswords(passwords);
            
            // Save to file storage
            fs.writeFileSync(this.passwordsFile, JSON.stringify(validatedPasswords, null, 2));
            
            // Also save to localStorage for backward compatibility
            localStorage.setItem(this.storageKey, JSON.stringify(validatedPasswords));
            
            return true;
        } catch (error) {
            console.error('Error saving passwords:', error);
            return false;
        }
    }

    // Validate password data structure
    validatePasswords(passwords) {
        if (!Array.isArray(passwords)) {
            return [];
        }

        return passwords.filter(password => {
            return (
                password &&
                typeof password.id === 'number' &&
                typeof password.name === 'string' &&
                typeof password.password === 'string' &&
                password.name.trim() !== '' &&
                password.password !== ''
            );
        }).map(password => ({
            id: password.id,
            name: password.name.trim(),
            password: password.password,
            description: password.description ? password.description.trim() : ''
        }));
    }

    // Load application settings
    async loadSettings() {
        try {
            // First try to load from file storage
            if (fs.existsSync(this.settingsFile)) {
                const data = fs.readFileSync(this.settingsFile, 'utf8');
                return JSON.parse(data);
            }
            
            // Fallback to localStorage for migration
            const stored = localStorage.getItem(this.settingsKey);
            if (stored) {
                const settings = JSON.parse(stored);
                // Migrate to file storage
                await this.saveSettings(settings);
                return settings;
            }
            
            return this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    // Save application settings
    async saveSettings(settings) {
        try {
            // Save to file storage
            fs.writeFileSync(this.settingsFile, JSON.stringify(settings, null, 2));
            
            // Also save to localStorage for backward compatibility
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    // Get default settings
    getDefaultSettings() {
        return {
            clearClipboardAfter: 20, // seconds
            showDescriptions: true,
            confirmDelete: true,
            theme: 'light',
            autoLock: false,
            autoLockTimeout: 5 // minutes
        };
    }

    // Export passwords to JSON
    async exportPasswords(passwords) {
        try {
            const exportData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                passwords: this.validatePasswords(passwords)
            };
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting passwords:', error);
            return null;
        }
    }

    // Import passwords from JSON
    async importPasswords(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.passwords || !Array.isArray(importData.passwords)) {
                throw new Error('Invalid import data format');
            }

            return this.validatePasswords(importData.passwords);
        } catch (error) {
            console.error('Error importing passwords:', error);
            return null;
        }
    }

    // Clear all data
    async clearAllData() {
        try {
            // Clear file storage
            if (fs.existsSync(this.passwordsFile)) {
                fs.unlinkSync(this.passwordsFile);
            }
            if (fs.existsSync(this.settingsFile)) {
                fs.unlinkSync(this.settingsFile);
            }
            
            // Clear localStorage
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.settingsKey);
            
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // Get storage statistics
    getStorageStats() {
        try {
            let passwordsSize = 0;
            let settingsSize = 0;
            
            // Check file storage
            if (fs.existsSync(this.passwordsFile)) {
                const stats = fs.statSync(this.passwordsFile);
                passwordsSize = stats.size;
            }
            
            if (fs.existsSync(this.settingsFile)) {
                const stats = fs.statSync(this.settingsFile);
                settingsSize = stats.size;
            }
            
            return {
                passwordsSize,
                settingsSize,
                totalSize: passwordsSize + settingsSize,
                lastModified: new Date().toISOString(),
                storageType: 'file'
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }

    // Get data directory path for user reference
    getDataDirectoryPath() {
        return this.dataDir;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordStorage;
} else {
    window.PasswordStorage = PasswordStorage;
}
