/**
 * @fileoverview ContextDic Pro — Gemini Translation Service (Dual Mode)
 *
 * Supports two operation modes:
 *
 * - **BYOK (default)** — User supplies their own Gemini API key via
 *   the Settings page.  The extension calls the Gemini REST API
 *   directly from the service worker.  No backend needed.
 *
 * - **Backend** — The extension calls a self-hosted backend that holds
 *   the API key server-side.  Authenticated via ``X-API-Secret``.
 *
 * @module services/gemini-service
 */

import { buildTranslationPrompt } from './prompt-builder.js';

/** Gemini REST endpoint template (key is appended as query param). */
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

class GeminiService {
    constructor() {
        // ── Mode ────────────────────────────────────────────────
        /** @type {'byok'|'backend'} */
        this.mode = 'byok';

        // ── BYOK settings ──────────────────────────────────────
        /** @type {string} User-supplied Gemini API key. */
        this.apiKey = '';
        /** @type {string} Gemini model name. */
        this.model = 'gemini-2.0-flash';

        // ── Backend settings ───────────────────────────────────
        /** @type {string} Backend base URL (includes ``/api``). */
        this.backendUrl = 'http://localhost:5000/api';
        /** @type {string} Shared secret for ``X-API-Secret`` header. */
        this.apiSecret = '';

        // ── Shared ─────────────────────────────────────────────
        /** @type {number} Fetch timeout in ms. */
        this.timeoutMs = 15_000;
        /** @type {number} */
        this.maxAttempts = 3;
        /** @private */
        this._lastReqTime = 0;
    }

    // =====================================================================
    // Public API
    // =====================================================================

    /**
     * Apply user settings from ``chrome.storage``.
     *
     * @param {Object}  opts
     * @param {'byok'|'backend'} [opts.mode]
     * @param {string}  [opts.apiKey]      BYOK mode key.
     * @param {string}  [opts.geminiModel] e.g. ``'gemini-2.0-flash'``.
     * @param {string}  [opts.backendUrl]  Backend base URL.
     * @param {string}  [opts.apiSecret]   Backend shared secret.
     */
    configure({ mode, apiKey, geminiModel, backendUrl, apiSecret } = {}) {
        if (mode) this.mode = mode;
        if (apiKey !== undefined) this.apiKey = apiKey;
        if (geminiModel) this.model = geminiModel;
        if (backendUrl) {
            const base = backendUrl.replace(/\/+$/, '');
            this.backendUrl = base.endsWith('/api') ? base : `${base}/api`;
        }
        if (apiSecret !== undefined) this.apiSecret = apiSecret;
    }

    /**
     * Translate text.
     *
     * @param {string}  text
     * @param {string}  targetLanguage  ISO 639-1 code.
     * @param {string} [context='']     Surrounding text.
     * @returns {Promise<TranslationResult>}
     */
    async translate(text, targetLanguage, context = '') {
        if (!text || !targetLanguage) {
            throw new Error('Invalid translation parameters');
        }
        await this._throttle();

        return this.mode === 'byok'
            ? this._translateByok(text, targetLanguage, context)
            : this._translateBackend(text, targetLanguage, context);
    }

    // =====================================================================
    // BYOK mode — direct Gemini REST calls
    // =====================================================================

    /** @private */
    async _translateByok(text, targetLanguage, context) {
        if (!this.apiKey) {
            throw new Error(
                'API Key not set. Please enter your Gemini API key in ContextDic Pro Settings.'
            );
        }

        const prompt = buildTranslationPrompt(text, targetLanguage, context);
        const url = `${GEMINI_API_BASE}/${this.model}:generateContent?key=${this.apiKey}`;
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 },
        };

        const raw = await this._fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        // Parse Gemini REST response
        const candidates = raw.candidates || [];
        const genText =
            candidates[0]?.content?.parts?.[0]?.text?.trim() || '';

        if (!genText) throw new Error('Empty response from Gemini');

        const { translation, confidence, notes } = this._parseModelOutput(genText);

        return {
            success: true,
            translatedText: translation,
            sourceLanguage: 'auto-detected',
            targetLanguage,
            confidence,
            notes: notes || 'Translation completed successfully',
        };
    }

    // =====================================================================
    // Backend mode — proxy via self-hosted Flask server
    // =====================================================================

    /** @private */
    async _translateBackend(text, targetLanguage, context) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiSecret) headers['X-API-Secret'] = this.apiSecret;

        const data = await this._fetchWithRetry(`${this.backendUrl}/translate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text, targetLanguage, context }),
        });

        if (!data.success) throw new Error(data.error || 'Translation failed');

        return {
            success: true,
            translatedText: data.translatedText,
            sourceLanguage: data.sourceLanguage,
            targetLanguage: data.targetLanguage,
            confidence: data.confidence,
            notes: data.notes,
        };
    }

    // =====================================================================
    // Shared helpers
    // =====================================================================

    /**
     * Parse JSON or plain-text model output.
     * @private
     */
    _parseModelOutput(text) {
        try {
            // Try to extract JSON from markdown code fences
            const jsonMatch = text.match(/```json?\s*([\s\S]*?)```/);
            const candidate = jsonMatch ? jsonMatch[1].trim() : text.trim();

            if (candidate.startsWith('{') && candidate.endsWith('}')) {
                const obj = JSON.parse(candidate);
                return {
                    translation: obj.translation || text,
                    confidence: obj.confidence ?? 0.9,
                    notes: obj.notes || '',
                };
            }
        } catch { /* fall through */ }

        return { translation: text, confidence: 0.95, notes: 'Direct translation' };
    }

    /**
     * Fetch with exponential-backoff retry.
     * @private
     */
    async _fetchWithRetry(url, init) {
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), this.timeoutMs);

        try {
            let lastErr;
            for (let i = 0; i < this.maxAttempts; i++) {
                try {
                    const res = await fetch(url, { ...init, signal: ac.signal });

                    if (!res.ok) {
                        if (res.status === 429 && i < this.maxAttempts - 1) {
                            await this._backoff(i);
                            continue;
                        }
                        if (res.status === 401 || res.status === 403) {
                            const json = await res.json().catch(() => ({}));
                            throw new Error(
                                json.error?.message || json.error || 'Authentication failed.'
                            );
                        }
                        // Gemini API errors come in { error: { message } } format
                        const errBody = await res.json().catch(() => ({}));
                        throw new Error(
                            errBody.error?.message || `API ${res.status} ${res.statusText}`
                        );
                    }

                    return await res.json();
                } catch (err) {
                    lastErr = err;
                    if (err.name === 'AbortError') throw new Error('Request timed out');
                    if (this._isTransient(err) && i < this.maxAttempts - 1) {
                        await this._backoff(i);
                        continue;
                    }
                    break;
                }
            }
            if (lastErr?.name === 'TypeError') {
                throw new Error('Network error. Check your connection.');
            }
            throw lastErr || new Error('Unknown error');
        } finally {
            clearTimeout(timer);
        }
    }

    /** @private */
    _isTransient(err) {
        const m = (err.message || '').toLowerCase();
        return m.includes('network') || m.includes('timeout') || m.includes('429');
    }

    /** @private — exponential backoff with ≤30 % jitter. */
    async _backoff(attempt) {
        const exp = Math.min(500 * 2 ** attempt, 8000);
        await new Promise((r) => setTimeout(r, exp + Math.random() * exp * 0.3));
    }

    /** @private — simple 1-req-per-interval throttle. */
    async _throttle() {
        const interval = 1000; // 1 req/s
        const elapsed = Date.now() - this._lastReqTime;
        if (elapsed < interval) {
            await new Promise((r) => setTimeout(r, interval - elapsed));
        }
        this._lastReqTime = Date.now();
    }
}

export default new GeminiService();

/**
 * @typedef {Object} TranslationResult
 * @property {boolean} success
 * @property {string}  translatedText
 * @property {string}  sourceLanguage
 * @property {string}  targetLanguage
 * @property {number}  confidence
 * @property {string}  notes
 */