# EasyPass 🔐

A simple and secure password manager built with Electron for easy access to your passwords.

![EasyPass](https://img.shields.io/badge/Version-1.0.0-blue)
![Platform](https://img.shields.io/badge/Platform-Linux-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **🔒 Secure Storage**: Passwords are stored locally using encrypted localStorage
- **📋 One-Click Copy**: Copy passwords to clipboard with a single click
- **🔄 Auto-Clear**: Clipboard automatically clears after 20 seconds for security
- **✏️ Easy Management**: Add, edit, and delete password entries effortlessly
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations
- **💻 Compact Design**: Fixed 400px width, resizable height window
- **🚀 Fast Access**: Quick search and instant password retrieval
- **🔐 No Cloud Dependency**: All data stays on your local machine

## 📦 Installation

### Option 1: Debian Package (.deb) - Recommended
```bash
# Download and install the .deb package
sudo dpkg -i easypass_1.0.0_amd64.deb

# If there are dependency issues, run:
sudo apt-get install -f
```

### Option 2: AppImage (Portable)
```bash
# Make executable and run
chmod +x EasyPass-1.0.0.AppImage
./EasyPass-1.0.0.AppImage
```

### Option 3: From Source
```bash
# Clone the repository
git clone https://github.com/yourname/easypass.git
cd easypass

# Install dependencies
npm install

# Run the application
npm start
```

## 🚀 Usage

### Adding a Password
1. Click the **"Add New Entry"** button
2. Enter the server name (e.g., "production-server")
3. Enter the password
4. Optionally add a description
5. Click **"Save"**

### Copying a Password
1. Find your entry in the list
2. Click the **"Copy"** button next to it
3. The password is copied to your clipboard
4. It will automatically clear after 20 seconds

### Editing an Entry
1. Click the edit icon (pencil) next to any entry
2. Modify the details in the modal
3. Click **"Save"** to update

### Deleting an Entry
1. Click the delete icon (trash) next to any entry
2. Confirm the deletion in the dialog

## 🛠️ Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/yourname/easypass.git
cd easypass

# Install dependencies
npm install

# Start development server
npm start
```

### Building
```bash
# Build for Linux
npm run build:linux

# Build .deb package only
npm run build:deb

# Build AppImage only
npm run build:appimage

# Build for all platforms
npm run build
```

## 🏗️ Architecture

### Tech Stack
- **Electron**: Cross-platform desktop application framework
- **HTML/CSS/JavaScript**: Frontend technologies
- **localStorage**: Local data persistence
- **electron-builder**: Application packaging

### File Structure
```
easypass/
├── assets/
│   ├── css/
│   │   └── styles.css      # Application styles
│   └── icons/
│       └── icon.png        # Application icon
├── dist/                   # Built packages
├── main.js                 # Electron main process
├── preload.js             # Preload script for security
├── renderer.js            # Frontend logic
├── storage.js             # Data storage utilities
├── index.html             # Main UI
├── package.json           # Project configuration
└── README.md              # This file
```

## 🔒 Security Features

- **Local-Only Storage**: No data is sent to external servers
- **Clipboard Auto-Clear**: Passwords are cleared from clipboard after 20 seconds
- **Context Isolation**: Secure Electron configuration
- **Input Validation**: All inputs are validated and sanitized
- **No Network Requests**: Application works entirely offline

## 📋 System Requirements

### Minimum Requirements
- **OS**: Ubuntu 18.04 or later (or compatible Linux distribution)
- **RAM**: 512 MB
- **Storage**: 150 MB free space
- **Architecture**: x64

### Dependencies (for .deb package)
- libgtk-3-0
- libnotify4
- libnss3
- libxss1
- libxtst6
- xdg-utils

## 🎮 Keyboard Shortcuts

- **Ctrl+N**: Add new entry
- **Escape**: Close modal/dialog
- **Alt**: Show/hide menu bar (when available)

## 🐛 Troubleshooting

### Application won't start
1. Ensure all dependencies are installed:
   ```bash
   sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils
   ```

### Data not persisting
- Check if you have write permissions in your home directory
- Try running the application as your user (not root)

### AppImage permission issues
```bash
chmod +x EasyPass-1.0.0.AppImage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Packaged with [electron-builder](https://www.electron.build/)
- Icons and UI inspired by modern design principles

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourname/easypass/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible including:
   - Operating system version
   - EasyPass version
   - Steps to reproduce the issue

---

**⚠️ Security Notice**: This application stores passwords locally on your machine. Always ensure your system is secure and consider using additional security measures like full-disk encryption. 