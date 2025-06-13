/**
 * ContextDic Pro - Background Script
 * Handles translation requests and settings management
 */

import GeminiService from '../services/gemini-service.js';

// Initialize settings
let settings = {
    apiKey: '',
    sourceLanguage: 'auto',
    targetLanguage: 'en',
    contextLength: '150',
    buttonPosition: 'right',
    popupPosition: 'bottom'
};

// Load settings when the extension starts
chrome.storage.local.get(null, function(items) {
    settings = { ...settings, ...items };
    if (settings.apiKey) {
        GeminiService.initialize(settings.apiKey);
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'translate') {
        handleTranslation(message, sendResponse);
        return true; // Keep the message channel open for async response
    }
});

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsUpdated') {
        settings = { ...settings, ...message.settings };
        if (settings.apiKey) {
            GeminiService.initialize(settings.apiKey);
        }
    }
});

/**
 * Handle translation requests
 * @param {Object} message - The message containing translation request
 * @param {Function} sendResponse - Function to send response back to content script
 */
async function handleTranslation(message, sendResponse) {
    try {
        if (!settings.apiKey) {
            sendResponse({
                error: 'Please configure your Gemini API key in the extension settings.'
            });
            return;
        }

        const { text, context, targetLanguage } = message;
        
        const result = await GeminiService.translate(
            text,
            targetLanguage || settings.targetLanguage,
            context
        );
        
        sendResponse({
            translatedText: result.translatedText
        });
    } catch (error) {
        console.error('Translation error:', error);
        sendResponse({
            error: error.message || 'Translation failed. Please try again.'
        });
    }
}

// Handle extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Open settings page on first install
        chrome.runtime.openOptionsPage();
    }
}); 