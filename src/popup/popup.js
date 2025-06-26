/**
 * ContextDic Pro - Popup Script
 * Handles popup interface functionality with ads integration
 */

import AdsService from '../services/ads-service.js';

// DOM elements
const quickText = document.getElementById('quickText');
const targetLang = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const translationResult = document.getElementById('translationResult');
const backendStatus = document.getElementById('backendStatus');
const apiKeyStatus = document.getElementById('apiKeyStatus');
const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    checkStatus();
    setupEventListeners();
    
    // Initialize ads and premium features
    await initializeMonetization();
});

// Load settings from storage
async function loadSettings() {
    try {
        const settings = await chrome.storage.local.get({
            targetLanguage: 'en',
            apiKey: ''
        });
        
        targetLang.value = settings.targetLanguage;
        
        // Update API key status
        updateApiKeyStatus(settings.apiKey);
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    translateBtn.addEventListener('click', handleTranslate);
    settingsBtn.addEventListener('click', openSettings);
    helpBtn.addEventListener('click', showHelp);
    
    // Enable translate on Enter key
    quickText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleTranslate();
        }
    });
    
    // Auto-resize textarea
    quickText.addEventListener('input', autoResize);
}

// Handle translation
async function handleTranslate() {
    const text = quickText.value.trim();
    if (!text) {
        showError('Please enter text to translate');
        return;
    }
    
    try {
        showLoading();
        translateBtn.disabled = true;
        
        // Send translation request to background script
        const response = await chrome.runtime.sendMessage({
            type: 'translate',
            text: text,
            targetLanguage: targetLang.value,
            context: ''
        });
        
        if (response.error) {
            showError(response.error);
        } else {
            showTranslation(response.translatedText);
        }
    } catch (error) {
        console.error('Translation error:', error);
        showError('Translation failed. Please try again.');
    } finally {
        translateBtn.disabled = false;
    }
}

// Show loading state
function showLoading() {
    translationResult.className = 'translation-result show loading';
    translationResult.innerHTML = `
        <span class="loading-spinner"></span>
        Translating...
    `;
}

// Show translation result
function showTranslation(text) {
    translationResult.className = 'translation-result show';
    translationResult.innerHTML = `
        <div>${text}</div>
        <button onclick="copyToClipboard('${text.replace(/'/g, "\\'")}')">Copy</button>
    `;
}

// Show error message
function showError(message) {
    translationResult.className = 'translation-result show error';
    translationResult.innerHTML = message;
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Check backend and API status
async function checkStatus() {
    // Check backend connectivity using health endpoint
    try {
        const healthResponse = await fetch('http://localhost:5000/api/health');
        if (healthResponse.ok) {
            // Check detailed status
            const statusResponse = await fetch('http://localhost:5000/api/status');
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                updateBackendStatus(true);
                
                // Update API key status based on backend configuration
                const settings = await chrome.storage.local.get(['apiKey']);
                const hasExtensionKey = settings.apiKey && settings.apiKey !== 'your_gemini_api_key_here';
                const hasBackendKey = statusData.api_key_configured;
                
                updateApiKeyStatus(hasExtensionKey || hasBackendKey ? 'configured' : '');
            } else {
                updateBackendStatus(false);
            }
        } else {
            updateBackendStatus(false);
        }
    } catch (error) {
        console.error('Status check failed:', error);
        updateBackendStatus(false);
    }
}

// Update backend status display
function updateBackendStatus(isConnected) {
    backendStatus.textContent = isConnected ? 'Connected' : 'Disconnected';
    backendStatus.className = `status-value ${isConnected ? 'connected' : 'disconnected'}`;
}

// Update API key status display
function updateApiKeyStatus(apiKey) {
    let hasKey;
    if (typeof apiKey === 'string') {
        if (apiKey === 'configured') {
            hasKey = true;
        } else {
            hasKey = apiKey && apiKey.length > 0 && apiKey !== 'your_gemini_api_key_here';
        }
    } else {
        hasKey = apiKey && apiKey.length > 0 && apiKey !== 'your_gemini_api_key_here';
    }
    
    apiKeyStatus.textContent = hasKey ? 'Configured' : 'Not Set';
    apiKeyStatus.className = `status-value ${hasKey ? 'connected' : 'disconnected'}`;
}

// Open settings page
function openSettings() {
    chrome.runtime.openOptionsPage();
}

// Show help information
function showHelp() {
    translationResult.className = 'translation-result show';
    translationResult.innerHTML = `
        <strong>How to use ContextDic Pro:</strong><br>
        1. Select text on any webpage<br>
        2. Click the translation button that appears<br>
        3. Or use this popup for quick translations<br><br>
        <strong>Keyboard shortcut:</strong><br>
        Ctrl+Enter to translate in this popup<br><br>
        <strong>Need help?</strong><br>
        Check settings to configure your API key and languages.
    `;
}

// Auto-resize textarea
function autoResize() {
    quickText.style.height = 'auto';
    quickText.style.height = Math.min(quickText.scrollHeight, 120) + 'px';
}

// Initialize monetization features
async function initializeMonetization() {
    try {
        // Initialize ads service
        await AdsService.initialize();
        
        // Check if user is premium
        const isPremium = await AdsService.isPremiumUser();
        
        if (isPremium) {
            // Show premium status
            document.body.classList.add('premium-user');
            showPremiumStatus();
        } else {
            // Show ads for free users
            await showPopupAds();
            showPremiumUpgradeOption();
        }
    } catch (error) {
        console.error('Monetization initialization failed:', error);
    }
}

// Show ads in popup
async function showPopupAds() {
    const adContainer = AdsService.createPopupAd();
    if (adContainer) {
        // Insert ad before the footer
        const footer = document.querySelector('.popup-footer');
        if (footer) {
            footer.parentNode.insertBefore(adContainer, footer);
        }
        
        // Track ad impression
        AdsService.trackEvent('ad_impression', { location: 'popup' });
    }
}

// Show premium status for premium users
function showPremiumStatus() {
    const statusSection = document.querySelector('.status-section');
    if (statusSection) {
        const premiumStatus = document.createElement('div');
        premiumStatus.className = 'premium-status';
        premiumStatus.innerHTML = `
            <div class="status-item">
                <span class="status-label">Account:</span>
                <span class="status-value premium">🚀 Premium</span>
            </div>
        `;
        statusSection.appendChild(premiumStatus);
    }
}

// Show premium upgrade option for free users
function showPremiumUpgradeOption() {
    const footer = document.querySelector('.popup-footer');
    if (footer) {
        const upgradeBtn = document.createElement('button');
        upgradeBtn.className = 'upgrade-btn';
        upgradeBtn.innerHTML = '🚀 Go Premium';
        upgradeBtn.addEventListener('click', showPremiumUpgradeModal);
        footer.appendChild(upgradeBtn);
    }
}

// Show premium upgrade modal
function showPremiumUpgradeModal() {
    const modal = AdsService.createPremiumPrompt();
    document.body.appendChild(modal);
    
    // Track upgrade prompt shown
    AdsService.trackEvent('premium_prompt_shown', { location: 'popup' });
}

// Test premium features (for development)
async function togglePremiumForTesting() {
    const isPremium = await AdsService.isPremiumUser();
    await AdsService.setPremiumStatus(!isPremium);
    location.reload(); // Reload popup to see changes
}

// Make functions globally available
window.copyToClipboard = copyToClipboard;
window.togglePremiumForTesting = togglePremiumForTesting; 