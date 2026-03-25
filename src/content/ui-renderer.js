/**
 * @fileoverview UI Renderer module
 */
const UIRenderer = (function() {
    const shadowHost = document.createElement('div');
    shadowHost.id = 'contextdic-shadow-host';
    shadowHost.style.cssText = 'position:absolute;top:0;left:0;z-index:999999;pointer-events:none;';
    document.body.appendChild(shadowHost);

    const shadow = shadowHost.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
    :host { all: initial; }
    .cd-btn {
      position: absolute; width: 32px; height: 32px;
      background: #4285f4; border-radius: 50%; cursor: pointer;
      z-index: 999999; box-shadow: 0 2px 5px rgba(0,0,0,.2);
      transition: transform .2s, background .2s;
      display: flex; align-items: center; justify-content: center;
      pointer-events: auto;
    }
    .cd-btn:hover { transform: scale(1.1); background: #3367d6; }
    .cd-btn::before {
      content: ''; width: 16px; height: 16px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>');
      background-size: contain; background-repeat: no-repeat;
    }
    .cd-popup {
      position: absolute; background: #fff; border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,.1); z-index: 999999;
      min-width: 200px; max-width: 400px; padding: 12px;
      pointer-events: auto; font-family: system-ui, -apple-system, sans-serif;
    }
    .cd-popup-inner { position: relative; }
    .cd-text { font-size: 14px; line-height: 1.5; color: #333; margin-bottom: 8px; white-space: pre-wrap; word-break: break-word; }
    .cd-copy { position: absolute; top: 0; right: 0; background: #f1f3f4; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #5f6368; cursor: pointer; transition: background .2s; }
    .cd-copy:hover { background: #e8eaed; }
    .cd-loading { font-size: 14px; color: #666; text-align: center; padding: 20px; }
    .cd-loading::after { content: ''; display: inline-block; width: 12px; height: 12px; margin-left: 8px; border: 2px solid #4285f4; border-radius: 50%; border-top-color: transparent; animation: cd-spin 1s linear infinite; }
    .cd-error { font-size: 14px; color: #d93025; text-align: center; padding: 20px; }
    .cd-conf { margin: 8px 0 4px; height: 3px; background: #f1f3f4; border-radius: 2px; overflow: hidden; }
    .cd-conf-bar { height: 100%; background: linear-gradient(90deg,#ea4335 0%,#fbbc04 30%,#34a853 60%); border-radius: 2px; transition: width .3s; }
    .cd-notes { font-size: 11px; color: #666; font-style: italic; margin: 4px 0; padding: 4px 0; border-top: 1px solid #f1f3f4; }
    @keyframes cd-spin { to { transform: rotate(360deg); } }
    `;
    shadow.appendChild(style);

    const btn = document.createElement('div');
    btn.className = 'cd-btn';
    btn.style.display = 'none';
    shadow.appendChild(btn);

    const popup = document.createElement('div');
    popup.className = 'cd-popup';
    popup.style.display = 'none';
    shadow.appendChild(popup);

    function positionBtn(rect, positionPref) {
        const sz = 32; const pad = 10;
        const left = positionPref === 'right' ? rect.right + pad : rect.left - sz - pad;
        const top = rect.top + (rect.height - sz) / 2;
        btn.style.left = `${left + window.scrollX}px`;
        btn.style.top = `${top + window.scrollY}px`;
        btn.style.display = 'flex';
    }

    function positionPopup() {
        const r = btn.getBoundingClientRect();
        popup.style.top = `${r.bottom + window.scrollY + 10}px`;
        popup.style.left = `${r.left + window.scrollX}px`;
        popup.style.display = 'block';
    }

    function showResult(translatedText, confidence = 0.9, notes = '') {
        popup.innerHTML = '';
        const inner = document.createElement('div');
        inner.className = 'cd-popup-inner';

        const textEl = document.createElement('div');
        textEl.className = 'cd-text';
        textEl.textContent = translatedText;
        inner.appendChild(textEl);

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

        if (notes) {
            const n = document.createElement('div');
            n.className = 'cd-notes';
            n.textContent = notes;
            inner.appendChild(n);
        }

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
        positionPopup();
    }

    function showLoading() {
        popup.innerHTML = '';
        const el = document.createElement('div');
        el.className = 'cd-loading';
        el.textContent = 'Translating…';
        popup.appendChild(el);
        positionPopup();
    }

    function showError(msg) {
        popup.innerHTML = '';
        const el = document.createElement('div');
        el.className = 'cd-error';
        el.textContent = msg;
        popup.appendChild(el);
        positionPopup();
    }

    function hide(el) { el.style.display = 'none'; }
    function hideAll() { hide(btn); hide(popup); }
    function hidePopup() { hide(popup); }
    
    return { btn, popup, shadowHost, positionBtn, showResult, showLoading, showError, hideAll, hidePopup };
})();