/**
 * @fileoverview ContextDic Pro — Settings Page
 *
 * Dual-mode settings: BYOK (user's own Gemini key, default) or
 * Backend (self-hosted server).  No ads.
 *
 * @module settings
 */

// ── Defaults ──────────────────────────────────────────────────────────────

const DEFAULTS = {
    mode: 'byok',
    sourceLanguage: 'zh',
    targetLanguage: 'en',
    apiKey: '',
    backendUrl: 'http://localhost:5000',
    apiSecret: '',
};

// ── Bootstrap ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    _loadSettings();
    _bindEvents();
});

// ── Settings I/O ──────────────────────────────────────────────────────────

function _loadSettings() {
    chrome.storage.local.get(DEFAULTS, (s) => {
        _val('sourceLanguage', s.sourceLanguage);
        _val('targetLanguage', s.targetLanguage);
        _val('apiKey', s.apiKey);
        _val('backendUrl', s.backendUrl);
        _val('apiSecret', s.apiSecret);
        _setMode(s.mode);
    });
}

function _saveSettings() {
    if (!_validateLanguages()) return;

    const s = {
        mode: _currentMode(),
        sourceLanguage: _val('sourceLanguage'),
        targetLanguage: _val('targetLanguage'),
        apiKey: _val('apiKey'),
        backendUrl: _val('backendUrl') || DEFAULTS.backendUrl,
        apiSecret: _val('apiSecret'),
    };

    chrome.storage.local.set(s, () => {
        _toast('Settings saved successfully!', 'success');
        chrome.runtime.sendMessage({ type: 'settingsUpdated', settings: s });
    });
}

// ── Mode toggle ───────────────────────────────────────────────────────────

function _currentMode() {
    return document.getElementById('mode-byok').classList.contains('active')
        ? 'byok'
        : 'backend';
}

/** @param {'byok'|'backend'} mode */
function _setMode(mode) {
    const byokBtn = document.getElementById('mode-byok');
    const backendBtn = document.getElementById('mode-backend');
    const byokSec = document.getElementById('section-byok');
    const backendSec = document.getElementById('section-backend');

    if (mode === 'backend') {
        byokBtn.classList.remove('active');
        backendBtn.classList.add('active');
        byokSec.classList.remove('active');
        backendSec.classList.add('active');
    } else {
        byokBtn.classList.add('active');
        backendBtn.classList.remove('active');
        byokSec.classList.add('active');
        backendSec.classList.remove('active');
    }
}

// ── Validation ────────────────────────────────────────────────────────────

function _validateLanguages() {
    if (_val('sourceLanguage') === _val('targetLanguage')) {
        _toast('Source and target languages cannot be the same', 'error');
        return false;
    }
    return true;
}

// ── Event wiring ──────────────────────────────────────────────────────────

function _bindEvents() {
    document.getElementById('saveButton').addEventListener('click', _saveSettings);
    document.getElementById('resetButton').addEventListener('click', () => {
        chrome.storage.local.set(DEFAULTS, () => {
            _loadSettings();
            _toast('Settings reset to default', 'success');
        });
    });

    // Mode toggle buttons
    document.querySelectorAll('.mode-toggle button').forEach((btn) => {
        btn.addEventListener('click', () => _setMode(btn.dataset.mode));
    });

    // Language validation
    document.getElementById('sourceLanguage').addEventListener('change', _validateLanguages);
    document.getElementById('targetLanguage').addEventListener('change', _validateLanguages);
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Get or set a form element's value.
 * @param {string}  id
 * @param {string} [newValue]
 * @returns {string}
 */
function _val(id, newValue) {
    const el = document.getElementById(id);
    if (newValue !== undefined) el.value = newValue;
    return el.value;
}

/** @param {string} msg  @param {'success'|'error'} type */
function _toast(msg, type) {
    const el = document.getElementById('statusMessage');
    el.textContent = msg;
    el.className = `status-msg ${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}