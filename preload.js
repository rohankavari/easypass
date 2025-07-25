const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // App info
    getAppVersion: () => ipcRenderer.invoke('app-version'),
    
    // Updates
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // File operations (if needed for export/import)
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    
    // Storage operations
    loadPasswords: () => ipcRenderer.invoke('load-passwords'),
    savePasswords: (passwords) => ipcRenderer.invoke('save-passwords', passwords),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    getDataDirectory: () => ipcRenderer.invoke('get-data-directory'),
    getStorageStats: () => ipcRenderer.invoke('get-storage-stats'),
    
    // Listen for menu events
    onMenuAction: (callback) => {
        ipcRenderer.on('add-new-entry', callback);
    },
    
    // Remove listeners
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// Security: Remove Node.js integration from renderer
delete window.require;
delete window.exports;
delete window.module;
