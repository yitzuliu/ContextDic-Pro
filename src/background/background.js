/**
 * @fileoverview ContextDic Pro — Background Service Worker
 *
 * Routes translation requests to {@link module:services/gemini-service}
 * and manages settings synchronisation.
 *
 * @module background
 */

import { AIServiceFactory } from '../services/ai-service-factory.js';

// ── Settings ──────────────────────────────────────────────────────────────

/** @type {Object} */
let settings = {
    mode: 'byok',
    aiProvider: 'gemini', // 'gemini', 'openai', 'claude', 'grok'
    apiKey: '',
    targetLanguage: 'en',
    backendUrl: 'http://localhost:5000',
    apiSecret: '',
};

chrome.storage.local.get(null, (items) => {
    settings = { ...settings, ...items };
});

// ── Message handler ───────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    switch (msg.type) {
        case 'translate':
            _handleTranslate(msg, sendResponse);
            return true;

        case 'settingsUpdated':
            settings = { ...settings, ...msg.settings };
            break;
    }
});

/**
 * @param {Object}   msg
 * @param {Function} sendResponse
 */
async function _handleTranslate(msg, sendResponse) {
    try {
        let result;
        if (settings.mode === 'byok') {
            const provider = AIServiceFactory.createProvider(settings.aiProvider, settings.apiKey);
            result = await provider.translate(
                msg.text,
                msg.targetLanguage || settings.targetLanguage,
                msg.context || ''
            );
        } else {
            // Backend mode logic...
            result = await _translateViaBackend(msg.text, msg.targetLanguage || settings.targetLanguage, msg.context || '');
        }

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

async function _translateViaBackend(text, targetLanguage, context) {
    const res = await fetch(`${settings.backendUrl}/api/translate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Secret': settings.apiSecret
        },
        body: JSON.stringify({ text, targetLanguage, context })
    });
    
    if (!res.ok) throw new Error(`Backend Error: ${res.statusText}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
}

// ── Install hook ──────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') chrome.runtime.openOptionsPage();
});