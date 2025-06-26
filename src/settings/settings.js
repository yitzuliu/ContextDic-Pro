/**
 * ContextDic Pro - Settings
 * Handles user settings page, settings storage, and premium features
 */

import AdsService from '../services/ads-service.js';

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

document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    setupEventListeners();
    await initializeMonetization();
});

// Load settings from storage
function loadSettings() {
    chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
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

    chrome.storage.local.set(settings, () => {
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
    chrome.storage.local.set(DEFAULT_SETTINGS, () => {
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

// Initialize monetization features
async function initializeMonetization() {
    try {
        // Initialize ads service
        await AdsService.initialize();
        
        // Check premium status and update UI
        await updatePremiumStatus();
        
        // Set up premium-related event listeners
        setupPremiumEventListeners();
        
        // Show ads for non-premium users
        if (!(await AdsService.isPremiumUser())) {
            showSettingsAds();
        }
        
    } catch (error) {
        console.error('Monetization initialization failed:', error);
    }
}

// Update premium status display
async function updatePremiumStatus() {
    const isPremium = await AdsService.isPremiumUser();
    
    if (isPremium) {
        document.body.classList.add('premium-user');
        document.getElementById('premium-user-section').style.display = 'block';
        document.getElementById('free-user-section').style.display = 'none';
    } else {
        document.body.classList.remove('premium-user');
        document.getElementById('premium-user-section').style.display = 'none';
        document.getElementById('free-user-section').style.display = 'block';
    }
}

// Set up premium-related event listeners
function setupPremiumEventListeners() {
    // Premium upgrade buttons
    const upgradeButtons = document.querySelectorAll('.premium-upgrade-btn');
    upgradeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const plan = button.dataset.plan;
            handlePremiumUpgrade(plan);
        });
    });
    
    // Premium testing button (development only)
    const testButton = document.getElementById('toggle-premium-test');
    if (testButton) {
        testButton.addEventListener('click', togglePremiumForTesting);
    }
    
    // Premium management buttons
    const manageButton = document.getElementById('manage-subscription');
    if (manageButton) {
        manageButton.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://your-website.com/manage-subscription' });
        });
    }
    
    const supportButton = document.getElementById('premium-support');
    if (supportButton) {
        supportButton.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://your-website.com/premium-support' });
        });
    }
}

// Handle premium upgrade
function handlePremiumUpgrade(plan) {
    // Track the upgrade attempt
    AdsService.trackEvent('premium_upgrade_click', { 
        plan: plan, 
        location: 'settings_page' 
    });
    
    // Open premium upgrade page
    const upgradeUrl = `https://your-website.com/premium?plan=${plan}&source=settings`;
    chrome.tabs.create({ url: upgradeUrl });
}

// Show ads in settings page
function showSettingsAds() {
    const adContainer = document.getElementById('settings-ad-container');
    if (adContainer) {
        const bannerAd = AdsService.createBannerAd(728, 90); // Leaderboard banner
        if (bannerAd) {
            adContainer.appendChild(bannerAd);
            
            // Track ad impression
            AdsService.trackEvent('ad_impression', { location: 'settings_page' });
        }
    }
}

// Toggle premium status for testing (development only)
async function togglePremiumForTesting() {
    const currentStatus = await AdsService.isPremiumUser();
    await AdsService.setPremiumStatus(!currentStatus);
    
    // Update UI
    await updatePremiumStatus();
    
    // Reload to reflect changes
    showStatus(`Premium status toggled to: ${!currentStatus ? 'Premium' : 'Free'}`, 'success');
    
    // Refresh ads
    if (!currentStatus) {
        // User became premium - hide ads
        const ads = document.querySelectorAll('.contextdic-ad-container, .contextdic-banner-ad');
        ads.forEach(ad => ad.style.display = 'none');
    } else {
        // User became free - show ads
        showSettingsAds();
    }
}

// Enhanced save settings to include premium features
const originalSaveSettings = saveSettings;
saveSettings = async function() {
    // Call original save function
    originalSaveSettings();
    
    // Track settings save for analytics
    AdsService.trackEvent('settings_saved');
}; 