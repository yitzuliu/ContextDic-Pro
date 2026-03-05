/**
 * @fileoverview ContextDic Pro — Content Script
 *
 * Injected into every page to handle text selection and display a floating
 * translation button + popup.  All UI is rendered inside a **closed Shadow
 * DOM** so host-page CSS cannot interfere with the extension's styling.
 *
 * @module content
 */

// ==========================================================================
// Shadow DOM setup
// ==========================================================================

/** @type {HTMLDivElement} Host element for the shadow root. */
const shadowHost = document.createElement('div');
shadowHost.id = 'contextdic-shadow-host';
shadowHost.style.cssText =
    'position:absolute;top:0;left:0;z-index:999999;pointer-events:none;';
document.body.appendChild(shadowHost);

/** @type {ShadowRoot} Closed shadow root — invisible to host page scripts. */
const shadow = shadowHost.attachShadow({ mode: 'closed' });

// Inject minimal styles into the shadow root
const style = document.createElement('style');
style.textContent = `
:host { all: initial; }

.cd-btn {
  position: absolute;
  width: 32px; height: 32px;
  background: #4285f4;
  border-radius: 50%;
  cursor: pointer;
  z-index: 999999;
  box-shadow: 0 2px 5px rgba(0,0,0,.2);
  transition: transform .2s, background .2s;
  display: flex; align-items: center; justify-content: center;
  pointer-events: auto;
}
.cd-btn:hover { transform: scale(1.1); background: #3367d6; }
.cd-btn::before {
  content: '';
  width: 16px; height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
}

.cd-popup {
  position: absolute;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,.1);
  z-index: 999999;
  min-width: 200px; max-width: 400px;
  padding: 12px;
  pointer-events: auto;
  font-family: system-ui, -apple-system, sans-serif;
}
.cd-popup-inner { position: relative; }
.cd-text {
  font-size: 14px; line-height: 1.5; color: #333;
  margin-bottom: 8px; white-space: pre-wrap; word-break: break-word;
}
.cd-copy {
  position: absolute; top: 0; right: 0;
  background: #f1f3f4; border: none; border-radius: 4px;
  padding: 4px 8px; font-size: 12px; color: #5f6368;
  cursor: pointer; transition: background .2s;
}
.cd-copy:hover { background: #e8eaed; }
.cd-loading {
  font-size: 14px; color: #666; text-align: center; padding: 20px;
}
.cd-loading::after {
  content: ''; display: inline-block;
  width: 12px; height: 12px; margin-left: 8px;
  border: 2px solid #4285f4; border-radius: 50%;
  border-top-color: transparent;
  animation: cd-spin 1s linear infinite;
}
.cd-error { font-size: 14px; color: #d93025; text-align: center; padding: 20px; }
.cd-conf { margin: 8px 0 4px; height: 3px; background: #f1f3f4; border-radius: 2px; overflow: hidden; }
.cd-conf-bar { height: 100%; background: linear-gradient(90deg,#ea4335 0%,#fbbc04 30%,#34a853 60%); border-radius: 2px; transition: width .3s; }
.cd-notes { font-size: 11px; color: #666; font-style: italic; margin: 4px 0; padding: 4px 0; border-top: 1px solid #f1f3f4; }
@keyframes cd-spin { to { transform: rotate(360deg); } }
`;
shadow.appendChild(style);

// UI elements live inside the shadow root
const btn = document.createElement('div');
btn.className = 'cd-btn';
btn.style.display = 'none';
shadow.appendChild(btn);

const popup = document.createElement('div');
popup.className = 'cd-popup';
popup.style.display = 'none';
shadow.appendChild(popup);

// ==========================================================================
// Settings
// ==========================================================================

/** @type {Object} Extension settings (synced from chrome.storage). */
let settings = {
    targetLanguage: 'en',
    buttonPosition: 'right',
    popupPosition: 'bottom',
};

chrome.storage.local.get(null, (items) => {
    settings = { ...settings, ...items };
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'settingsUpdated') {
        settings = { ...settings, ...msg.settings };
    }
});

// ==========================================================================
// Text selection handler
// ==========================================================================

document.addEventListener('mouseup', (e) => {
    const sel = window.getSelection().toString().trim();
    if (sel) {
        const range = window.getSelection().getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const ctx = _getContext(range);
        _positionBtn(rect);
        btn.dataset.text = sel;
        btn.dataset.context = ctx;
    } else {
        _hide(btn);
        _hide(popup);
    }
});

btn.addEventListener('click', async () => {
    const text = btn.dataset.text;
    const context = btn.dataset.context;
    if (!text) return;

    try {
        _showLoading();
        const res = await chrome.runtime.sendMessage({
            type: 'translate',
            text,
            context,
            targetLanguage: settings.targetLanguage,
        });
        if (!res.success || res.error) {
            _showError(res.error || 'Translation failed');
        } else {
            _showResult(res.translatedText, res.confidence, res.notes);
        }
    } catch {
        _showError('Translation failed. Please try again.');
    }
});

// Close popup on outside click
document.addEventListener('click', (e) => {
    if (!shadowHost.contains(e.target)) _hide(popup);
});

// ==========================================================================
// Smart context extraction (sentence boundary detection)
// ==========================================================================

/** Max characters of context before / after the selection. */
const CONTEXT_CAP = 50;

/** Block-level element tag names used as context boundaries. */
const BLOCK_TAGS = new Set([
    'P', 'LI', 'TD', 'TH', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'BLOCKQUOTE', 'ARTICLE', 'SECTION', 'FIGCAPTION', 'DD', 'DT',
    'PRE', 'CAPTION',
]);

/** Common abbreviations whose trailing '.' should not be treated as a sentence end. */
const ABBREVIATIONS = new Set([
    'Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Jr', 'Sr', 'St',
    'vs', 'etc', 'Inc', 'Ltd', 'Corp', 'Co', 'Jan', 'Feb',
    'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]);

/**
 * Find the nearest block-level ancestor element to use as the text
 * source for sentence boundary detection.
 *
 * @param {Node} node - Any DOM node (typically a text node).
 * @returns {HTMLElement}
 */
function _findBlock(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== document.body) {
        if (BLOCK_TAGS.has(el.tagName)) return el;
        // Accept a <div> only when it contains enough text to be meaningful.
        if (el.tagName === 'DIV' && el.textContent.length > 20) return el;
        el = el.parentElement;
    }
    return document.body;
}

/**
 * Calculate the character offset of *targetNode:targetOffset* within
 * the concatenated textContent of *blockEl*.
 *
 * Uses a TreeWalker so the result is exact even when the selection
 * spans multiple inline elements (``<em>``, ``<a>``, ``<strong>``…).
 *
 * @param {HTMLElement} blockEl
 * @param {Node}        targetNode
 * @param {number}      targetOffset
 * @returns {number}
 */
function _textOffset(blockEl, targetNode, targetOffset) {
    const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
    let offset = 0;
    while (walker.nextNode()) {
        if (walker.currentNode === targetNode) return offset + targetOffset;
        offset += walker.currentNode.length;
    }
    return offset; // fallback
}

/**
 * Test whether position *i* in *text* is a real sentence end.
 *
 * A sentence end is defined as one of ``.  !  ?  。 ！ ？`` followed by
 * whitespace or the end of the string, **excluding** common abbreviations
 * such as "Dr.", "Mr.", "etc.".
 *
 * @param {string} text
 * @param {number} i    - Index of the punctuation character.
 * @returns {boolean}
 */
function _isSentenceEnd(text, i) {
    const ch = text[i];

    // CJK sentence-ending punctuation — always a real sentence end.
    if (ch === '。' || ch === '！' || ch === '？') return true;

    // English ! and ? — treat as sentence end when followed by space/EOL.
    if (ch === '!' || ch === '?') {
        return i === text.length - 1 || /\s/.test(text[i + 1]);
    }

    // Period '.' — the most ambiguous; apply heuristics.
    if (ch === '.') {
        // Must be followed by whitespace or be at the end.
        if (i < text.length - 1 && !/\s/.test(text[i + 1])) return false;

        // Check for common abbreviation: grab the word before the dot.
        let wordStart = i - 1;
        while (wordStart >= 0 && /[A-Za-z]/.test(text[wordStart])) wordStart--;
        const word = text.substring(wordStart + 1, i);
        if (ABBREVIATIONS.has(word)) return false;

        // Single uppercase letter + dot (e.g. "U." in "U.S.") → not a sentence end.
        if (word.length === 1 && /[A-Z]/.test(word)) return false;

        // Digit before dot (e.g. "3.14") → not a sentence end.
        if (wordStart >= 0 && /\d/.test(text[wordStart])) return false;

        return true;
    }

    return false;
}

/**
 * Walk backwards from *from* to find the start of the current sentence.
 * Returns the index of the first character of the sentence.
 *
 * @param {string} text
 * @param {number} from
 * @returns {number}
 */
function _sentenceStart(text, from) {
    for (let i = from - 1; i >= 0; i--) {
        if (_isSentenceEnd(text, i)) {
            // Skip whitespace after the punctuation to reach the next sentence's first char.
            let j = i + 1;
            while (j < text.length && /\s/.test(text[j])) j++;
            return j;
        }
    }
    return 0; // no boundary found → start of text
}

/**
 * Walk forwards from *from* to find the end of the current sentence.
 * Returns the index **after** the last character (exclusive).
 *
 * @param {string} text
 * @param {number} from
 * @returns {number}
 */
function _sentenceEnd(text, from) {
    for (let i = from; i < text.length; i++) {
        if (_isSentenceEnd(text, i)) return i + 1;
    }
    return text.length; // no boundary found → end of text
}

/**
 * Extract semantically meaningful context around the user's selection.
 *
 * Strategy:
 * 1. Walk up the DOM to find the nearest block-level parent.
 * 2. Use TreeWalker to compute the precise character offsets of the
 *    selection within the block's ``textContent``.
 * 3. Expand outward to the nearest sentence boundaries.
 * 4. Extend by one additional sentence before and after for context.
 * 5. Cap the result at {@link CONTEXT_CAP} characters on each side of
 *    the selection to keep payloads small.
 *
 * @param {Range} range - The user's selection range.
 * @returns {string} Context string to send alongside the selected text.
 */
function _getContext(range) {
    // 1. Find the block-level parent and its full text.
    const block = _findBlock(range.commonAncestorContainer);
    const fullText = block.textContent || '';
    if (!fullText) return '';

    // 2. Precise offsets via TreeWalker.
    const selStart = _textOffset(block, range.startContainer, range.startOffset);
    const selEnd = _textOffset(block, range.endContainer, range.endOffset);

    // 3. Find the sentence containing the selection.
    const curSentStart = _sentenceStart(fullText, selStart);
    const curSentEnd = _sentenceEnd(fullText, selEnd);

    // 4. Extend by one sentence before and one after.
    const prevSentStart = _sentenceStart(fullText, curSentStart);
    const nextSentEnd = _sentenceEnd(fullText, curSentEnd);

    // 5. Apply the safety cap (CONTEXT_CAP chars each side of selection).
    const ctxStart = Math.max(prevSentStart, selStart - CONTEXT_CAP);
    const ctxEnd = Math.min(nextSentEnd, selEnd + CONTEXT_CAP);

    return fullText.substring(ctxStart, ctxEnd).trim();
}

// ==========================================================================
// UI helpers (XSS-safe — use textContent, not innerHTML for user data)
// ==========================================================================

/**
 * Position the floating translate button next to the selection.
 * @param {DOMRect} rect
 */
function _positionBtn(rect) {
    const sz = 32;
    const pad = 10;
    const left = settings.buttonPosition === 'right'
        ? rect.right + pad
        : rect.left - sz - pad;
    const top = rect.top + (rect.height - sz) / 2;
    btn.style.left = `${left + window.scrollX}px`;
    btn.style.top = `${top + window.scrollY}px`;
    btn.style.display = 'flex';
}

/**
 * Render translation result (XSS-safe via textContent).
 * @param {string} translatedText
 * @param {number} [confidence=0.9]
 * @param {string} [notes='']
 */
function _showResult(translatedText, confidence = 0.9, notes = '') {
    popup.innerHTML = ''; // clear

    const inner = document.createElement('div');
    inner.className = 'cd-popup-inner';

    // Translation text (safe)
    const textEl = document.createElement('div');
    textEl.className = 'cd-text';
    textEl.textContent = translatedText;
    inner.appendChild(textEl);

    // Confidence bar
    if (confidence) {
        const conf = document.createElement('div');
        conf.className = 'cd-conf';
        conf.title = `Confidence: ${Math.round(confidence * 100)}%`;
        const bar = document.createElement('div');
        bar.className = 'cd-conf-bar';
        bar.style.width = `${confidence * 100}%`;
        conf.appendChild(bar);
        inner.appendChild(conf);
    }

    // Notes (safe)
    if (notes) {
        const n = document.createElement('div');
        n.className = 'cd-notes';
        n.textContent = notes;
        inner.appendChild(n);
    }

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'cd-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(translatedText).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        });
    });
    inner.appendChild(copyBtn);

    popup.appendChild(inner);
    _positionPopup();
}

/** Show a loading spinner inside the popup. */
function _showLoading() {
    popup.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'cd-loading';
    el.textContent = 'Translating…';
    popup.appendChild(el);
    _positionPopup();
}

/**
 * Show an error message inside the popup (XSS-safe via textContent).
 * @param {string} msg
 */
function _showError(msg) {
    popup.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'cd-error';
    el.textContent = msg;
    popup.appendChild(el);
    _positionPopup();
}

/** Position the popup relative to the translate button. */
function _positionPopup() {
    const r = btn.getBoundingClientRect();
    popup.style.top = `${r.bottom + window.scrollY + 10}px`;
    popup.style.left = `${r.left + window.scrollX}px`;
    popup.style.display = 'block';
}

/**
 * Hide a DOM element.
 * @param {HTMLElement} el
 */
function _hide(el) {
    el.style.display = 'none';
}