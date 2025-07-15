// Settings Management Utility
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.listeners = [];
    }

    // Load settings from localStorage
    loadSettings() {
        const defaultSettings = {
            // Profile Settings
            profile: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                profilePicture: '',
                privacy: {
                    profileVisibility: true,
                    emailNotifications: true,
                    twoFactorAuth: false
                }
            },
            
            // Task Settings
            task: {
                defaultPriority: 'Medium',
                defaultCategory: 'General',
                defaultDeadline: 'none',
                defaultReminder: '1hour',
                showCompletedTasks: true,
                showTaskNumbers: true,
                showCreationTimestamps: false,
                tasksPerPage: 20,
                autoArchiveCompleted: false,
                enableDragDrop: true,
                autoSaveDrafts: true,
                autoSaveInterval: 2
            },
            
            // Interface Settings
            interface: {
                theme: 'light',
                primaryColor: '#45b7d1',
                accentColor: '#96c93d',
                taskLayout: 'detailed',
                sidePanelWidth: 'medium',
                fontSize: 'medium',
                enableAnimations: true,
                hoverEffects: true,
                animationSpeed: 'normal'
            },
            
            // Progress Settings
            progress: {
                enabledMetrics: ['completion', 'time', 'goals', 'trends', 'achievements', 'calendar'],
                dailyGoal: 5,
                weeklyGoal: 25,
                monthlyGoal: 100,
                goalReminders: true,
                achievementAlerts: true,
                weeklyReports: false,
                reportFrequency: 'weekly'
            },
            
            // Quick Actions
            quickActions: {
                enableShortcuts: true,
                enableTemplates: true,
                enableBulkOperations: true,
                quickAddText: '',
                quickAddPriority: 'Medium',
                oneClickCreation: false
            },
            
            // Security Settings
            security: {
                securityLevel: 'basic',
                twoFactorAuth: false,
                rememberLogin: true,
                sessionTimeout: 30,
                autoLogout: true,
                multipleDeviceLogin: true,
                dataCollection: true,
                personalizedAds: false,
                locationServices: false,
                dataRetention: 90
            }
        };

        const savedSettings = localStorage.getItem('taskManagerSettings');
        return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('taskManagerSettings', JSON.stringify(this.settings));
        this.notifyListeners();
    }

    // Get a specific setting
    getSetting(category, key) {
        return this.settings[category]?.[key];
    }

    // Set a specific setting
    setSetting(category, key, value) {
        if (!this.settings[category]) {
            this.settings[category] = {};
        }
        this.settings[category][key] = value;
        this.saveSettings();
    }

    // Get all settings for a category
    getCategorySettings(category) {
        return this.settings[category] || {};
    }

    // Set all settings for a category
    setCategorySettings(category, settings) {
        this.settings[category] = { ...this.settings[category], ...settings };
        this.saveSettings();
    }

    // Apply settings to the current page
    applySettings() {
        this.applyThemeSettings();
        this.applyTaskSettings();
        this.applyInterfaceSettings();
        this.applyProgressSettings();
        this.applyQuickActionSettings();
        this.applySecuritySettings();
    }

    // Apply theme settings
    applyThemeSettings() {
        const theme = this.getSetting('interface', 'theme');
        const primaryColor = this.getSetting('interface', 'primaryColor');
        const accentColor = this.getSetting('interface', 'accentColor');
        const fontSize = this.getSetting('interface', 'fontSize');
        const enableAnimations = this.getSetting('interface', 'enableAnimations');

        // Apply theme
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        // Apply colors
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--accent-color', accentColor);

        // Apply font size
        const fontSizeMap = {
            'small': '12px',
            'medium': '14px',
            'large': '16px',
            'xlarge': '18px'
        };
        document.body.style.fontSize = fontSizeMap[fontSize] || '14px';

        // Apply animations
        if (!enableAnimations) {
            document.body.style.setProperty('--animation-duration', '0s');
        } else {
            const speed = this.getSetting('interface', 'animationSpeed');
            const speedMap = {
                'slow': '0.5s',
                'normal': '0.3s',
                'fast': '0.1s',
                'instant': '0s'
            };
            document.body.style.setProperty('--animation-duration', speedMap[speed] || '0.3s');
        }
    }

    // Apply task settings
    applyTaskSettings() {
        const showCompletedTasks = this.getSetting('task', 'showCompletedTasks');
        const showTaskNumbers = this.getSetting('task', 'showTaskNumbers');
        const showCreationTimestamps = this.getSetting('task', 'showCreationTimestamps');
        const enableDragDrop = this.getSetting('task', 'enableDragDrop');

        // Apply task display settings
        const tasks = document.querySelectorAll('.task');
        tasks.forEach(task => {
            const isCompleted = task.classList.contains('done');
            
            if (!showCompletedTasks && isCompleted) {
                task.style.display = 'none';
            } else {
                task.style.display = 'block';
            }

            // Show/hide task numbers
            const taskNumber = task.querySelector('.task-number');
            if (taskNumber) {
                taskNumber.style.display = showTaskNumbers ? 'block' : 'none';
            }

            // Show/hide creation timestamps
            const timestamp = task.querySelector('.text-xs.text-gray-500');
            if (timestamp) {
                timestamp.style.display = showCreationTimestamps ? 'block' : 'none';
            }

            // Enable/disable drag and drop
            if (enableDragDrop) {
                task.setAttribute('draggable', 'true');
            } else {
                task.setAttribute('draggable', 'false');
            }
        });
    }

    // Apply interface settings
    applyInterfaceSettings() {
        const taskLayout = this.getSetting('interface', 'taskLayout');
        const sidePanelWidth = this.getSetting('interface', 'sidePanelWidth');
        const hoverEffects = this.getSetting('interface', 'hoverEffects');

        // Apply task layout
        const taskList = document.getElementById('taskList');
        if (taskList) {
            taskList.className = `space-y-4 mt-6 layout-${taskLayout}`;
        }

        // Apply side panel width only when panels are active
        const sidePanel = document.getElementById('sidePanel');
        const leftPanel = document.getElementById('leftPanel');
        const widthMap = {
            'narrow': '250px',
            'medium': '300px',
            'wide': '350px'
        };
        
        if (sidePanel) {
            // Only set width if panel is active, otherwise keep it at 0
            if (sidePanel.classList.contains('active')) {
                sidePanel.style.width = widthMap[sidePanelWidth] || '300px';
            } else {
                sidePanel.style.width = '0';
            }
        }
        if (leftPanel) {
            // Only set width if panel is active, otherwise keep it at 0
            if (leftPanel.classList.contains('active')) {
                leftPanel.style.width = widthMap[sidePanelWidth] || '300px';
            } else {
                leftPanel.style.width = '0';
            }
        }

        // Apply hover effects
        if (!hoverEffects) {
            document.body.classList.add('no-hover-effects');
        } else {
            document.body.classList.remove('no-hover-effects');
        }
    }

    // Apply progress settings
    applyProgressSettings() {
        const enabledMetrics = this.getSetting('progress', 'enabledMetrics');
        const goalReminders = this.getSetting('progress', 'goalReminders');
        const achievementAlerts = this.getSetting('progress', 'achievementAlerts');

        // Apply progress tracking visibility
        const progressElements = document.querySelectorAll('[data-progress-metric]');
        progressElements.forEach(element => {
            const metric = element.getAttribute('data-progress-metric');
            if (enabledMetrics.includes(metric)) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    // Apply quick action settings
    applyQuickActionSettings() {
        const enableShortcuts = this.getSetting('quickActions', 'enableShortcuts');
        const enableTemplates = this.getSetting('quickActions', 'enableTemplates');
        const oneClickCreation = this.getSetting('quickActions', 'oneClickCreation');

        // Apply keyboard shortcuts
        if (enableShortcuts) {
            this.setupKeyboardShortcuts();
        } else {
            this.removeKeyboardShortcuts();
        }

        // Apply template functionality
        const templateButtons = document.querySelectorAll('[data-template]');
        templateButtons.forEach(button => {
            button.style.display = enableTemplates ? 'block' : 'none';
        });

        // Apply one-click creation
        if (oneClickCreation) {
            document.body.classList.add('one-click-mode');
        } else {
            document.body.classList.remove('one-click-mode');
        }
    }

    // Apply security settings
    applySecuritySettings() {
        const sessionTimeout = this.getSetting('security', 'sessionTimeout');
        const autoLogout = this.getSetting('security', 'autoLogout');
        const multipleDeviceLogin = this.getSetting('security', 'multipleDeviceLogin');

        // Set up session timeout
        if (autoLogout && sessionTimeout !== 'never') {
            const timeoutMs = sessionTimeout * 60 * 1000; // Convert minutes to milliseconds
            this.setupSessionTimeout(timeoutMs);
        }

        // Apply device login restrictions
        if (!multipleDeviceLogin) {
            this.enforceSingleDeviceLogin();
        }
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        const shortcuts = {
            'Ctrl+N': () => this.quickAddTask(),
            'Ctrl+Enter': () => this.markTaskComplete(),
            'Delete': () => this.deleteSelectedTask(),
            'Ctrl+E': () => this.editSelectedTask(),
            'Ctrl+S': () => this.toggleSidePanel(),
            'Ctrl+F': () => this.openSearch(),
            'Ctrl+P': () => this.filterByPriority(),
            'Ctrl+C': () => this.filterByCategory()
        };

        this.keyboardShortcuts = shortcuts;
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    // Remove keyboard shortcuts
    removeKeyboardShortcuts() {
        if (this.keyboardShortcuts) {
            document.removeEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
            this.keyboardShortcuts = null;
        }
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(event) {
        const key = `${event.ctrlKey ? 'Ctrl+' : ''}${event.key}`;
        if (this.keyboardShortcuts && this.keyboardShortcuts[key]) {
            event.preventDefault();
            this.keyboardShortcuts[key]();
        }
    }

    // Setup session timeout
    setupSessionTimeout(timeoutMs) {
        let timeoutId;
        
        const resetTimeout = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                alert('Session expired due to inactivity. Please log in again.');
                window.location.href = '../index.html';
            }, timeoutMs);
        };

        // Reset timeout on user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout, true);
        });

        resetTimeout();
    }

    // Enforce single device login
    enforceSingleDeviceLogin() {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            localStorage.setItem('sessionId', Date.now().toString());
        }
    }

    // Quick action methods
    quickAddTask() {
        const sidePanel = document.getElementById('sidePanel');
        if (sidePanel) {
            sidePanel.classList.add('active');
            // Apply the correct width from settings
            const sidePanelWidth = this.getSetting('interface', 'sidePanelWidth');
            const widthMap = {
                'narrow': '250px',
                'medium': '300px',
                'wide': '350px'
            };
            sidePanel.style.width = widthMap[sidePanelWidth] || '300px';
        }
    }

    markTaskComplete() {
        const selectedTask = document.querySelector('.task.selected');
        if (selectedTask) {
            const markDoneBtn = selectedTask.querySelector('.markDone');
            if (markDoneBtn) {
                markDoneBtn.click();
            }
        }
    }

    deleteSelectedTask() {
        const selectedTask = document.querySelector('.task.selected');
        if (selectedTask) {
            const deleteBtn = selectedTask.querySelector('.deleteTask');
            if (deleteBtn) {
                deleteBtn.click();
            }
        }
    }

    editSelectedTask() {
        const selectedTask = document.querySelector('.task.selected');
        if (selectedTask) {
            const editBtn = selectedTask.querySelector('.editTask');
            if (editBtn) {
                editBtn.click();
            }
        }
    }

    toggleSidePanel() {
        const sidePanel = document.getElementById('sidePanel');
        if (sidePanel) {
            sidePanel.classList.toggle('active');
        }
    }

    openSearch() {
        // Implement search functionality
        console.log('Opening search...');
    }

    filterByPriority() {
        const filterBtn = document.getElementById('filterPriority');
        if (filterBtn) {
            filterBtn.click();
        }
    }

    filterByCategory() {
        const filterBtn = document.getElementById('filterCategory');
        if (filterBtn) {
            filterBtn.click();
        }
    }

    // Add listener for settings changes
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remove listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.settings));
    }

    // Export settings
    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'task-manager-settings.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    // Import settings
    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    this.settings = { ...this.settings, ...importedSettings };
                    this.saveSettings();
                    this.applySettings();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
}

// Create global settings manager instance
window.settingsManager = new SettingsManager();

// Auto-apply settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.settingsManager) {
        window.settingsManager.applySettings();
    }
}); 