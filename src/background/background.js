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
            context,
            settings.apiKey
        );
        
        sendResponse({
            success: true,
            translatedText: result.translatedText,
            confidence: result.confidence,
            notes: result.notes
        });
    } catch (error) {
        console.error('Translation error:', error);
        
        // Provide more specific error messages based on error type
        let errorMessage = error.message || 'Translation failed. Please try again.';
        let errorType = 'UNKNOWN_ERROR';
        
        if (errorMessage.includes('API key')) {
            errorType = 'AUTH_ERROR';
            errorMessage = 'Please configure your Gemini API key in settings.';
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
            errorType = 'RATE_LIMIT_ERROR';
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            errorType = 'NETWORK_ERROR';
            errorMessage = 'Network error. Please check your internet connection and ensure the backend is running.';
        }
        
        sendResponse({
            success: false,
            error: errorMessage,
            errorType: errorType
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