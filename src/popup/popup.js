/**
 * @fileoverview ContextDic Pro — Popup Script
 *
 * Controls the quick-translate UI and status display.
 * No ads.  No AdsService dependency.
 *
 * @module popup
 */

// ── DOM refs ──────────────────────────────────────────────────────────────
const quickText = document.getElementById('quickText');
const targetLang = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const translationResult = document.getElementById('translationResult');
const modeStatus = document.getElementById('modeStatus');
const connectionStatus = document.getElementById('connectionStatus');
const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');

// ── Bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    _loadSettings();
    _checkStatus();
    _bindEvents();
});

// ── Settings ──────────────────────────────────────────────────────────────
async function _loadSettings() {
    try {
        const s = await chrome.storage.local.get({
            targetLanguage: 'en',
            mode: 'byok',
        });
        targetLang.value = s.targetLanguage;
    } catch (e) {
        console.error('Settings load error:', e);
    }
}

// ── Events ────────────────────────────────────────────────────────────────
function _bindEvents() {
    translateBtn.addEventListener('click', _translate);
    settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
    helpBtn.addEventListener('click', _showHelp);
    quickText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) _translate();
    });
    quickText.addEventListener('input', () => {
        quickText.style.height = 'auto';
        quickText.style.height = Math.min(quickText.scrollHeight, 120) + 'px';
    });
}

// ── Translation ───────────────────────────────────────────────────────────
async function _translate() {
    const text = quickText.value.trim();
    if (!text) { _showError('Please enter text to translate'); return; }

    try {
        _showLoading();
        translateBtn.disabled = true;

        const res = await chrome.runtime.sendMessage({
            type: 'translate',
            text,
            targetLanguage: targetLang.value,
            context: '',
        });

        res.error ? _showError(res.error) : _showTranslation(res.translatedText);
    } catch {
        _showError('Translation failed. Please try again.');
    } finally {
        translateBtn.disabled = false;
    }
}

// ── Rendering (XSS-safe) ─────────────────────────────────────────────────
function _showLoading() {
    translationResult.className = 'translation-result show loading';
    translationResult.innerHTML = '<span class="loading-spinner"></span>';
    translationResult.appendChild(document.createTextNode(' Translating…'));
}

/** @param {string} text */
function _showTranslation(text) {
    translationResult.className = 'translation-result show';
    translationResult.innerHTML = '';

    const span = document.createElement('div');
    span.className = 'translated-text';
    span.textContent = text;
    translationResult.appendChild(span);

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => {
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        });
    });
    translationResult.appendChild(btn);
}

/** @param {string} msg */
function _showError(msg) {
    translationResult.className = 'translation-result show error';
    translationResult.textContent = msg;
}

// ── Status ────────────────────────────────────────────────────────────────
async function _checkStatus() {
    try {
        const s = await chrome.storage.local.get({
            mode: 'byok',
            apiKey: '',
            backendUrl: 'http://localhost:5000',
        });

        if (s.mode === 'byok') {
            modeStatus.textContent = 'BYOK (Your Key)';
            modeStatus.className = 'status-value connected';
            connectionStatus.textContent = s.apiKey ? 'Key Configured ✓' : 'Key Not Set ✗';
            connectionStatus.className = `status-value ${s.apiKey ? 'connected' : 'disconnected'}`;
        } else {
            modeStatus.textContent = 'Backend Server';
            modeStatus.className = 'status-value connected';
            try {
                const base = s.backendUrl.replace(/\/+$/, '');
                const res = await fetch(`${base}/api/health`);
                if (res.ok) {
                    const statusRes = await fetch(`${base}/api/status`);
                    const data = statusRes.ok ? await statusRes.json() : {};
                    connectionStatus.textContent = data.api_key_configured
                        ? 'Connected ✓'
                        : 'Connected (no key)';
                    connectionStatus.className = `status-value ${data.api_key_configured ? 'connected' : 'disconnected'}`;
                } else {
                    connectionStatus.textContent = 'Disconnected ✗';
                    connectionStatus.className = 'status-value disconnected';
                }
            } catch {
                connectionStatus.textContent = 'Disconnected ✗';
                connectionStatus.className = 'status-value disconnected';
            }
        }
    } catch {
        modeStatus.textContent = 'Unknown';
        connectionStatus.textContent = 'Error';
    }
}

// ── Help ──────────────────────────────────────────────────────────────────
function _showHelp() {
    translationResult.className = 'translation-result show';
    translationResult.innerHTML = `
    <strong>How to use:</strong><br>
    1. Select text on any webpage<br>
    2. Click the 🌐 button that appears<br>
    3. Or use this popup (Ctrl+Enter)<br><br>
    <strong>Setup:</strong><br>
    Open Settings → enter your Gemini API key.
  `;
}