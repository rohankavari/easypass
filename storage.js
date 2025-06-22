// Storage utility for EasyPass
class PasswordStorage {
    constructor() {
        this.storageKey = 'sshPasswords';
        this.settingsKey = 'sshPasswordsSettings';
    }

    // Load passwords from localStorage
    async loadPasswords() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const passwords = JSON.parse(stored);
                return this.validatePasswords(passwords);
            }
            return [];
        } catch (error) {
            console.error('Error loading passwords:', error);
            return [];
        }
    }

    // Save passwords to localStorage
    async savePasswords(passwords) {
        try {
            const validatedPasswords = this.validatePasswords(passwords);
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
            const stored = localStorage.getItem(this.settingsKey);
            if (stored) {
                return JSON.parse(stored);
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
            const passwordsData = localStorage.getItem(this.storageKey);
            const settingsData = localStorage.getItem(this.settingsKey);
            
            return {
                passwordsSize: passwordsData ? passwordsData.length : 0,
                settingsSize: settingsData ? settingsData.length : 0,
                totalSize: (passwordsData ? passwordsData.length : 0) + (settingsData ? settingsData.length : 0),
                lastModified: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordStorage;
} else {
    window.PasswordStorage = PasswordStorage;
}
