const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const PasswordStorage = require('./storage.js');

// Keep a global reference of the window object
let mainWindow;
let passwordStorage;

function createWindow() {
    // Initialize password storage
    passwordStorage = new PasswordStorage();

    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 400,
        height: 700,
        minWidth: 400,
        maxWidth: 400,
        minHeight: 500,
        resizable: true,
        maximizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icons/icon.png'), // Add icon if available
        titleBarStyle: 'default',
        show: false // Don't show until ready
    });

    // Load the app
    mainWindow.loadFile('index.html');

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Prevent navigation to external URLs
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== mainWindow.webContents.getURL().slice(0, -1)) {
            event.preventDefault();
        }
    });
}

// Set up application menu
function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Add New Entry',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('add-new-entry');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });

        // Window menu
        template[4].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
    createWindow();
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});

// IPC handlers for secure communication
ipcMain.handle('app-version', () => {
    return app.getVersion();
});

// Handle application updates (placeholder)
ipcMain.handle('check-for-updates', () => {
    // Implement auto-updater logic here
    return { hasUpdate: false };
});

// Storage IPC handlers
ipcMain.handle('load-passwords', async () => {
    try {
        return await passwordStorage.loadPasswords();
    } catch (error) {
        console.error('Error loading passwords:', error);
        return [];
    }
});

ipcMain.handle('save-passwords', async (event, passwords) => {
    try {
        return await passwordStorage.savePasswords(passwords);
    } catch (error) {
        console.error('Error saving passwords:', error);
        return false;
    }
});

ipcMain.handle('load-settings', async () => {
    try {
        return await passwordStorage.loadSettings();
    } catch (error) {
        console.error('Error loading settings:', error);
        return passwordStorage.getDefaultSettings();
    }
});

ipcMain.handle('save-settings', async (event, settings) => {
    try {
        return await passwordStorage.saveSettings(settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
});

ipcMain.handle('get-data-directory', () => {
    return passwordStorage.getDataDirectoryPath();
});

ipcMain.handle('get-storage-stats', () => {
    return passwordStorage.getStorageStats();
});
