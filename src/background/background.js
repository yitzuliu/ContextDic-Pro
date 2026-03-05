/**
 * @fileoverview ContextDic Pro — Background Service Worker
 *
 * Routes translation requests to {@link module:services/gemini-service}
 * and manages settings synchronisation.
 *
 * @module background
 */

import GeminiService from '../services/gemini-service.js';

// ── Settings ──────────────────────────────────────────────────────────────

/** @type {Object} */
let settings = {
    mode: 'byok',
    apiKey: '',
    targetLanguage: 'en',
    backendUrl: 'http://localhost:5000',
    apiSecret: '',
};

chrome.storage.local.get(null, (items) => {
    settings = { ...settings, ...items };
    _syncService();
});

/** Push current settings into GeminiService. */
function _syncService() {
    GeminiService.configure({
        mode: settings.mode,
        apiKey: settings.apiKey,
        backendUrl: settings.backendUrl,
        apiSecret: settings.apiSecret,
    });
}

// ── Message handler ───────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    switch (msg.type) {
        case 'translate':
            _handleTranslate(msg, sendResponse);
            return true;

        case 'settingsUpdated':
            settings = { ...settings, ...msg.settings };
            _syncService();
            break;
    }
});

/**
 * @param {Object}   msg
 * @param {Function} sendResponse
 */
async function _handleTranslate(msg, sendResponse) {
    try {
        const result = await GeminiService.translate(
            msg.text,
            msg.targetLanguage || settings.targetLanguage,
            msg.context || '',
        );
        sendResponse({
            success: true,
            translatedText: result.translatedText,
            confidence: result.confidence,
            notes: result.notes,
        });
    } catch (err) {
        sendResponse({ success: false, error: err.message || 'Translation failed.' });
    }
}

// ── Install hook ──────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') chrome.runtime.openOptionsPage();
});