/**
 * ContextDic Pro - Settings
 * Handles user settings page and settings storage
 */

// Default settings
const DEFAULT_SETTINGS = {
    sourceLanguage: 'zh',
    targetLanguage: 'en',
    apiKey: ''
};

// Language codes and names mapping
const LANGUAGES = {
    'zh': 'Chinese',
    'en': 'English',
    'ja': 'Japanese',
    'ko': 'Korean',
    'fr': 'French',
    'de': 'German',
    'es': 'Spanish',
    'it': 'Italian',
    'ru': 'Russian',
    'pt': 'Portuguese'
};

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
        document.getElementById('sourceLanguage').value = settings.sourceLanguage;
        document.getElementById('targetLanguage').value = settings.targetLanguage;
        document.getElementById('apiKey').value = settings.apiKey;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Save button click handler
    document.getElementById('saveButton').addEventListener('click', saveSettings);

    // Prevent same language selection
    document.getElementById('sourceLanguage').addEventListener('change', validateLanguageSelection);
    document.getElementById('targetLanguage').addEventListener('change', validateLanguageSelection);
}

// Validate language selection
function validateLanguageSelection() {
    const sourceLang = document.getElementById('sourceLanguage').value;
    const targetLang = document.getElementById('targetLanguage').value;

    if (sourceLang === targetLang) {
        showStatus('Source and target languages cannot be the same', 'error');
        return false;
    }
    return true;
}

// Save settings to storage
function saveSettings() {
    if (!validateLanguageSelection()) {
        return;
    }

    const settings = {
        sourceLanguage: document.getElementById('sourceLanguage').value,
        targetLanguage: document.getElementById('targetLanguage').value,
        apiKey: document.getElementById('apiKey').value
    };

    chrome.storage.sync.set(settings, () => {
        showStatus('Settings saved successfully!', 'success');
    });
}

// Show status message
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';

    // Hide the message after 3 seconds
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 3000);
}

// Reset settings to default
document.getElementById('reset-btn').addEventListener('click', () => {
    chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
        loadSettings();
        showStatus('Settings reset to default', 'success');
    });
});

// Set up show/hide API key toggle buttons
const toggleButtons = document.querySelectorAll('.toggle-visibility');
toggleButtons.forEach(button => {
  button.addEventListener('click', function() {
    const targetId = this.dataset.target;
    const targetInput = document.getElementById(targetId);
    
    if (targetInput.type === 'password') {
      targetInput.type = 'text';
      this.textContent = 'Hide';
    } else {
      targetInput.type = 'password';
      this.textContent = 'Show';
    }
  });
}); 