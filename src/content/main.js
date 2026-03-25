/**
 * @fileoverview Main content script logic
 */
(function() {
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

    document.addEventListener('mouseup', (e) => {
        const sel = window.getSelection().toString().trim();
        if (sel) {
            const range = window.getSelection().getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const ctx = ContextExtractor.getContext(range);
            UIRenderer.positionBtn(rect, settings.buttonPosition);
            UIRenderer.btn.dataset.text = sel;
            UIRenderer.btn.dataset.context = ctx;
        } else {
            UIRenderer.hideAll();
        }
    });

    UIRenderer.btn.addEventListener('click', async () => {
        const text = UIRenderer.btn.dataset.text;
        const context = UIRenderer.btn.dataset.context;
        if (!text) return;

        try {
            UIRenderer.showLoading();
            const res = await chrome.runtime.sendMessage({
                type: 'translate',
                text,
                context,
                targetLanguage: settings.targetLanguage,
            });
            if (!res.success || res.error) {
                UIRenderer.showError(res.error || 'Translation failed');
            } else {
                UIRenderer.showResult(res.translatedText, res.confidence, res.notes);
            }
        } catch {
            UIRenderer.showError('Translation failed. Please try again.');
        }
    });

    document.addEventListener('click', (e) => {
        if (!UIRenderer.shadowHost.contains(e.target)) {
            UIRenderer.hidePopup();
        }
    });
})();