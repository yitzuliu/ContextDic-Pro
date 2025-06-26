/**
 * ContextDic Pro - Content Script
 * Handles text selection and translation functionality
 */

// Create and inject the translation button
const translationButton = document.createElement('div');
translationButton.id = 'contextdic-translation-button';
translationButton.style.display = 'none';
document.body.appendChild(translationButton);

// Create and inject the translation popup
const translationPopup = document.createElement('div');
translationPopup.id = 'contextdic-translation-popup';
translationPopup.style.display = 'none';
document.body.appendChild(translationPopup);

// Load settings from storage
let settings = {
    apiKey: '',
    sourceLanguage: 'auto',
    targetLanguage: 'en',
    contextLength: '150',
    buttonPosition: 'right',
    popupPosition: 'bottom'
};

// Load settings when the content script starts
chrome.storage.local.get(null, function(items) {
    settings = { ...settings, ...items };
});

// Listen for settings updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsUpdated') {
        settings = { ...settings, ...message.settings };
    }
});

// Handle text selection
document.addEventListener('mouseup', function(e) {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Get context around the selection
        const context = getContextAroundSelection(range, parseInt(settings.contextLength));
        
        // Position and show the translation button
        positionTranslationButton(rect);
        
        // Store the selected text and context for translation
        translationButton.dataset.text = selectedText;
        translationButton.dataset.context = context;
    } else {
        hideTranslationButton();
        hideTranslationPopup();
    }
});

// Handle translation button click
translationButton.addEventListener('click', async function() {
    const text = this.dataset.text;
    const context = this.dataset.context;
    
    if (!text) return;
    
    try {
        // Show loading state
        showLoadingState();
        
        // Request translation from background script
        const response = await chrome.runtime.sendMessage({
            type: 'translate',
            text: text,
            context: context,
            targetLanguage: settings.targetLanguage
        });
        
        if (!response.success || response.error) {
            showError(response.error || 'Translation failed');
        } else {
            showTranslation(response.translatedText, response.confidence, response.notes);
        }
    } catch (error) {
        showError('Translation failed. Please try again.');
    }
});

// Handle clicks outside the popup to close it
document.addEventListener('click', function(e) {
    if (!translationPopup.contains(e.target) && e.target !== translationButton) {
        hideTranslationPopup();
    }
});

/**
 * Get context around the selected text
 * @param {Range} range - The selection range
 * @param {number} contextLength - Maximum context length
 * @returns {string} The context text
 */
function getContextAroundSelection(range, contextLength) {
    const container = range.commonAncestorContainer;
    const text = container.textContent || '';
    const start = Math.max(0, range.startOffset - contextLength);
    const end = Math.min(text.length, range.endOffset + contextLength);
    
    return text.substring(start, end).trim();
}

/**
 * Position the translation button relative to the selection
 * @param {DOMRect} rect - The selection's bounding rectangle
 */
function positionTranslationButton(rect) {
    const buttonSize = 32; // Size of the translation button
    const padding = 10; // Padding from the selection
    
    let left, top;
    
    if (settings.buttonPosition === 'right') {
        left = rect.right + padding;
        top = rect.top + (rect.height - buttonSize) / 2;
    } else {
        left = rect.left - buttonSize - padding;
        top = rect.top + (rect.height - buttonSize) / 2;
    }
    
    translationButton.style.left = `${left + window.scrollX}px`;
    translationButton.style.top = `${top + window.scrollY}px`;
    translationButton.style.display = 'block';
}

/**
 * Show the translation popup with the translated text
 * @param {string} translatedText - The translated text to display
 * @param {number} confidence - Translation confidence score
 * @param {string} notes - Additional notes about the translation
 */
function showTranslation(translatedText, confidence = 0.9, notes = '') {
    const buttonRect = translationButton.getBoundingClientRect();
    
    const confidenceBar = confidence ? `
        <div class="contextdic-confidence" title="Translation confidence: ${Math.round(confidence * 100)}%">
            <div class="contextdic-confidence-bar" style="width: ${confidence * 100}%"></div>
        </div>
    ` : '';
    
    const notesSection = notes ? `<div class="contextdic-notes">${notes}</div>` : '';
    
    translationPopup.innerHTML = `
        <div class="contextdic-popup-content">
            <div class="contextdic-popup-text">${translatedText}</div>
            ${confidenceBar}
            ${notesSection}
            <button class="contextdic-copy-button">Copy</button>
        </div>
    `;
    
    // Position the popup
    if (settings.popupPosition === 'bottom') {
        translationPopup.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
        translationPopup.style.left = `${buttonRect.left + window.scrollX}px`;
    } else {
        translationPopup.style.bottom = `${window.innerHeight - buttonRect.top + window.scrollY + 10}px`;
        translationPopup.style.left = `${buttonRect.left + window.scrollX}px`;
    }
    
    translationPopup.style.display = 'block';
    
    // Add copy functionality
    const copyButton = translationPopup.querySelector('.contextdic-copy-button');
    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(translatedText).then(() => {
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = 'Copy';
            }, 2000);
        });
    });
}

/**
 * Show loading state in the popup
 */
function showLoadingState() {
    translationPopup.innerHTML = `
        <div class="contextdic-popup-content">
            <div class="contextdic-loading">Translating...</div>
        </div>
    `;
    
    const buttonRect = translationButton.getBoundingClientRect();
    translationPopup.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
    translationPopup.style.left = `${buttonRect.left + window.scrollX}px`;
    translationPopup.style.display = 'block';
}

/**
 * Show error message in the popup
 * @param {string} error - The error message to display
 */
function showError(error) {
    translationPopup.innerHTML = `
        <div class="contextdic-popup-content">
            <div class="contextdic-error">${error}</div>
        </div>
    `;
    
    const buttonRect = translationButton.getBoundingClientRect();
    translationPopup.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
    translationPopup.style.left = `${buttonRect.left + window.scrollX}px`;
    translationPopup.style.display = 'block';
}

/**
 * Hide the translation button
 */
function hideTranslationButton() {
    translationButton.style.display = 'none';
}

/**
 * Hide the translation popup
 */
function hideTranslationPopup() {
    translationPopup.style.display = 'none';
}

/**
 * Finds the complete sentence containing the selected text
 * @param {string} selectedText - The text selected by the user
 * @param {Node} container - The container element containing the text
 * @returns {string} The complete sentence
 */
function findCompleteSentence(selectedText, container) {
    // Get the text content of the container
    const text = container.textContent;
    
    // Find the position of the selected text in the container
    const startPos = text.indexOf(selectedText);
    if (startPos === -1) return selectedText;
    
    // Define sentence boundaries
    const sentenceEndings = ['.', '!', '?', '。', '！', '？'];
    const sentenceStartings = [' ', '\n', '\t', '　'];
    
    // Find the start of the sentence
    let sentenceStart = startPos;
    while (sentenceStart > 0) {
        const char = text[sentenceStart - 1];
        if (sentenceStartings.includes(char)) {
            break;
        }
        sentenceStart--;
    }
    
    // Find the end of the sentence
    let sentenceEnd = startPos + selectedText.length;
    while (sentenceEnd < text.length) {
        const char = text[sentenceEnd];
        if (sentenceEndings.includes(char)) {
            sentenceEnd++;
            break;
        }
        sentenceEnd++;
    }
    
    // Extract the complete sentence
    const completeSentence = text.slice(sentenceStart, sentenceEnd).trim();
    
    // If the sentence is too long (more than 1000 characters), return just the selected text
    if (completeSentence.length > 1000) {
        return selectedText;
    }
    
    return completeSentence;
}

// Update the handleTextSelection function to use findCompleteSentence
function handleTextSelection(event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText) {
        // Get the container element (usually the closest paragraph or div)
        const container = selection.anchorNode.parentElement;
        
        // Find the complete sentence
        const completeSentence = findCompleteSentence(selectedText, container);
        
        // Show translation popup with the complete sentence
        showTranslationPopup(completeSentence, event);
    }
} 