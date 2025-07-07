// EasyPass - Password Manager - Renderer Process
class SSHPasswordManager {
    constructor() {
        this.passwords = [];
        this.currentEditId = null;
        this.copyTimeout = null;
        this.draggedElement = null;
        this.dragStartIndex = -1;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadPasswords();
    }

    initializeElements() {
        // Main elements
        this.passwordList = document.getElementById('passwordList');
        this.addNewEntryBtn = document.getElementById('addNewEntryBtn');
        this.statusMessage = document.getElementById('statusMessage');
        
        // Modal elements
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalClose = document.getElementById('modalClose');
        this.entryForm = document.getElementById('entryForm');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        
        // Form inputs
        this.serverNameInput = document.getElementById('serverName');
        this.passwordInput = document.getElementById('password');
        this.descriptionInput = document.getElementById('description');
    }

    attachEventListeners() {
        // Add new entry button
        this.addNewEntryBtn.addEventListener('click', () => this.openModal());
        
        // Modal controls
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
        
        // Form submission
        this.entryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    async loadPasswords() {
        try {
            // Clear any existing sample data for fresh start
            if (!localStorage.getItem('userDataInitialized')) {
                localStorage.removeItem('sshPasswords');
                localStorage.setItem('userDataInitialized', 'true');
            }
            
            // Try to load from storage first
            const stored = localStorage.getItem('sshPasswords');
            if (stored) {
                this.passwords = JSON.parse(stored);
            } else {
                // Start with empty array - no sample data
                this.passwords = [];
            }
        } catch (error) {
            console.error('Error loading passwords:', error);
            this.passwords = [];
        }
        
        this.renderPasswordList();
    }

    savePasswords() {
        try {
            localStorage.setItem('sshPasswords', JSON.stringify(this.passwords));
        } catch (error) {
            console.error('Error saving passwords:', error);
            this.showStatusMessage('Error saving passwords', 'error');
        }
    }

    renderPasswordList() {
        if (this.passwords.length === 0) {
            this.passwordList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔐</div>
                    <h3>No SSH passwords saved</h3>
                    <p>Click "Add New Entry" to store your first SSH password</p>
                </div>
            `;
            return;
        }

        this.passwordList.innerHTML = this.passwords.map((password, index) => `
            <div class="password-item" data-id="${password.id}" draggable="true">
                <div class="password-info">
                    <div class="password-name">${this.escapeHtml(password.name)}</div>
                    ${password.description ? `<div class="password-description">${this.escapeHtml(password.description)}</div>` : ''}
                </div>
                <div class="password-actions">
                    <button class="copy-btn" tabindex="0" onclick="passwordManager.copyPassword(${password.id})">Copy</button>
                    <button class="edit-btn" tabindex="-1" onclick="passwordManager.editPassword(${password.id})" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="delete-btn" tabindex="-1" onclick="passwordManager.deletePassword(${password.id})" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        // Add drag and drop event listeners
        this.attachDragAndDropListeners();
    }

    openModal(editId = null) {
        this.currentEditId = editId;
        
        if (editId) {
            const password = this.passwords.find(p => p.id === editId);
            if (password) {
                this.modalTitle.textContent = 'Edit Entry';
                this.serverNameInput.value = password.name;
                this.passwordInput.value = password.password;
                this.descriptionInput.value = password.description || '';
            }
        } else {
            this.modalTitle.textContent = 'Add New Entry';
            this.entryForm.reset();
        }
        
        this.modalOverlay.classList.add('show');
        setTimeout(() => this.serverNameInput.focus(), 100);
    }

    closeModal() {
        this.modalOverlay.classList.remove('show');
        this.currentEditId = null;
        this.entryForm.reset();
    }

    saveEntry() {
        const name = this.serverNameInput.value.trim();
        const password = this.passwordInput.value;
        const description = this.descriptionInput.value.trim();

        if (!name || !password) {
            this.showStatusMessage('Server name and password are required', 'error');
            return;
        }

        // Check for duplicate names (excluding current entry if editing)
        const existingEntry = this.passwords.find(p => 
            p.name.toLowerCase() === name.toLowerCase() && p.id !== this.currentEditId
        );
        
        if (existingEntry) {
            this.showStatusMessage('A server with this name already exists', 'error');
            return;
        }

        if (this.currentEditId) {
            // Update existing entry
            const index = this.passwords.findIndex(p => p.id === this.currentEditId);
            if (index !== -1) {
                this.passwords[index] = {
                    ...this.passwords[index],
                    name,
                    password,
                    description
                };
                this.showStatusMessage('Entry updated successfully', 'success');
            }
        } else {
            // Add new entry
            const newId = Math.max(0, ...this.passwords.map(p => p.id)) + 1;
            this.passwords.push({
                id: newId,
                name,
                password,
                description
            });
            this.showStatusMessage('Entry added successfully', 'success');
        }

        this.savePasswords();
        this.renderPasswordList();
        this.closeModal();
    }

    editPassword(id) {
        this.openModal(id);
    }

    deletePassword(id) {
        const password = this.passwords.find(p => p.id === id);
        if (!password) return;

        if (confirm(`Are you sure you want to delete "${password.name}"?`)) {
            this.passwords = this.passwords.filter(p => p.id !== id);
            this.savePasswords();
            this.renderPasswordList();
            this.showStatusMessage('Entry deleted successfully', 'success');
        }
    }

    async copyPassword(id) {
        const password = this.passwords.find(p => p.id === id);
        if (!password) return;

        try {
            await navigator.clipboard.writeText(password.password);
            
            // Update button state
            const copyBtn = document.querySelector(`[data-id="${id}"] .copy-btn`);
            if (copyBtn) {
                copyBtn.classList.add('copied');
                copyBtn.textContent = 'Copied';
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.textContent = 'Copy';
                }, 2000);
            }
            
            this.showStatusMessage('Password copied. Will clear in 20 seconds.', 'success');
            
            // Clear clipboard after 20 seconds
            if (this.copyTimeout) {
                clearTimeout(this.copyTimeout);
            }
            
            this.copyTimeout = setTimeout(async () => {
                try {
                    await navigator.clipboard.writeText('');
                } catch (e) {
                    // Ignore errors when clearing clipboard
                }
            }, 20000);
            
        } catch (error) {
            console.error('Failed to copy password:', error);
            this.showStatusMessage('Failed to copy password', 'error');
        }
    }

    showStatusMessage(message, type = 'success') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type} show`;
        
        setTimeout(() => {
            this.statusMessage.classList.remove('show');
        }, 3000);
    }

    openSettings() {
        // Placeholder for settings functionality
        this.showStatusMessage('Settings coming soon!', 'success');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    attachDragAndDropListeners() {
        const passwordItems = this.passwordList.querySelectorAll('.password-item');
        
        passwordItems.forEach((item, index) => {
            // Drag start
            item.addEventListener('dragstart', (e) => {
                this.draggedElement = item;
                this.dragStartIndex = index;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
            });

            // Drag end
            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                this.clearDragOverStates();
                this.draggedElement = null;
                this.dragStartIndex = -1;
            });

            // Drag over
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (this.draggedElement && this.draggedElement !== item) {
                    const rect = item.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    const mouseY = e.clientY;
                    
                    // Clear previous states
                    item.classList.remove('drag-over-above', 'drag-over-below');
                    
                    if (mouseY < midY) {
                        item.classList.add('drag-over-above');
                    } else {
                        item.classList.add('drag-over-below');
                    }
                }
            });

            // Drag leave
            item.addEventListener('dragleave', (e) => {
                if (!item.contains(e.relatedTarget)) {
                    item.classList.remove('drag-over-above', 'drag-over-below');
                }
            });

            // Drop
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                
                if (this.draggedElement && this.draggedElement !== item) {
                    const draggedId = parseInt(this.draggedElement.getAttribute('data-id'));
                    const targetId = parseInt(item.getAttribute('data-id'));
                    
                    this.reorderPasswords(draggedId, targetId, e.clientY);
                }
                
                this.clearDragOverStates();
            });
        });

        // Add keyboard event listeners for copy buttons
        const copyButtons = this.passwordList.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const passwordId = parseInt(button.closest('.password-item').getAttribute('data-id'));
                    this.copyPassword(passwordId);
                }
            });
        });
    }

    clearDragOverStates() {
        const passwordItems = this.passwordList.querySelectorAll('.password-item');
        passwordItems.forEach(item => {
            item.classList.remove('drag-over-above', 'drag-over-below');
        });
    }

    reorderPasswords(draggedId, targetId, mouseY) {
        const draggedIndex = this.passwords.findIndex(p => p.id === draggedId);
        const targetIndex = this.passwords.findIndex(p => p.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        const draggedItem = this.passwords[draggedIndex];
        const targetItem = this.passwords[targetIndex];
        const targetRect = this.passwordList.querySelector(`[data-id="${targetId}"]`).getBoundingClientRect();
        const midY = targetRect.top + targetRect.height / 2;
        
        // Remove the dragged item
        this.passwords.splice(draggedIndex, 1);
        
        // Determine insert position
        let newIndex;
        if (mouseY < midY) {
            // Insert above the target
            newIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
        } else {
            // Insert below the target
            newIndex = targetIndex > draggedIndex ? targetIndex : targetIndex + 1;
        }
        
        // Insert the dragged item at the new position
        this.passwords.splice(newIndex, 0, draggedItem);
        
        // Save and re-render
        this.savePasswords();
        this.renderPasswordList();
        this.showStatusMessage('Password order updated', 'success');
    }
}

// Initialize the password manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.passwordManager = new SSHPasswordManager();
});

// Handle window controls for Electron
window.addEventListener('beforeunload', () => {
    // Save any pending changes
    if (window.passwordManager) {
        window.passwordManager.savePasswords();
    }
});
