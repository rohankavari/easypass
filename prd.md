# Product Requirements Document: SSHPassPad (MVP)

## 1. Overview

SSHPassPad is a minimal Electron-based desktop application for Linux that helps developers quickly access and copy server passwords used for SSH or VSCode Remote sessions. It displays a list of saved passwords (name-password pairs) and provides a one-click "Copy" button to place the password into the clipboard.

---

## 2. Tech Stack

### Frontend
- **Electron**: Main framework for desktop app
- **HTML/CSS**: UI markup and styling (optionally Tailwind)
- **JavaScript**: UI logic (using plain JS or optionally a light framework)

### Backend
- **Node.js** (bundled with Electron): Used for file I/O and clipboard access

### Storage
- **Local JSON file** (`passwords.json`) in the user's app data directory
- No encryption or master password

#### Example structure:
```json
[
  {
    "name": "dev-server",
    "password": "password123"
  },
  {
    "name": "prod-db",
    "password": "secure456"
  }
]
```

---

## 3. Features

### 3.1 Password List View
- Displays password entries from `passwords.json`
- Each row shows:
  - Entry name (e.g., `dev-server`)
  - Copy button (📋 icon or "Copy" label)

### 3.2 Copy to Clipboard
- Clicking the copy button:
  - Copies the corresponding password to clipboard
  - Shows a small toast: “Copied! Will clear in 20s”
  - Auto-clears the clipboard after 20 seconds using `setTimeout`

### 3.3 Add New Entry
- Button labeled “+ Add New” at the bottom
- Opens a modal or inline form:
  - Input fields: `name` and `password`
  - Saves the entry to `passwords.json`
  - Refreshes the list without requiring a restart

### 3.4 (Optional for MVP) Edit/Delete
- Basic editing or deletion of existing entries
- Optional for v0.1
- Can be added in v0.2 for better management

---

## 4. File/Folder Structure

```
sshpasspad/
├── main.js              # Electron main process
├── preload.js           # Safe API bridge to expose clipboard and storage functions
├── renderer.js          # Handles frontend interaction
├── index.html           # UI layout
├── storage.js           # Handles reading/writing JSON
├── passwords.json       # Password database (plaintext for now)
├── package.json         # Project config and scripts
└── assets/              # Icons, CSS, etc.
```

---

## 5. Clipboard Management

Uses Electron clipboard API:  
```js
clipboard.writeText(password);
```

Auto-clear after 20 seconds:
```js
setTimeout(() => clipboard.clear(), 20000);
```

---

## 6. UI Design Description

- **Window Size:** 400px × 500px (fixed)

### Layout:
- **Header:** “🔐 SSHPassPad” (centered)
- **Password List:** Scrollable list of entries
- **Each Row:**
  - Left: Entry name
  - Right: [📋 Copy] button
- **Bottom Bar:** “+ Add New” button
- **Toast Notification:** Bottom-center, disappears after a few seconds

### Styling:
- Light mode
- Rounded buttons
- Clean look (Roboto/system font)

---

## 7. Testing

### Manual Testing
- Run: `npm start`
- Validate UI loads and buttons function
- Test clipboard copy and auto-clear behavior
- Validate new entries are saved and rendered

---

## 8. Future Enhancements (Post-MVP)

- Master password + AES encryption
- Import/export JSON
- System tray integration
- Dark mode toggle
- Search bar for filtering entries
- Entry tagging or grouping

---

## 9. Development Setup

```bash
# Setup
npm init -y
npm install electron --save-dev

# Add to package.json
"scripts": {
  "start": "electron ."
}

# Run the app
npm start
```

---

## 10. Example `passwords.json` Content

```json
[
  {
    "name": "dev-server",
    "password": "password123"
  },
  {
    "name": "prod-db",
    "password": "secure456"
  }
]
```