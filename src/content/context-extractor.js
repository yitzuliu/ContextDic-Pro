/**
 * @fileoverview Context extraction module
 */
const ContextExtractor = (function() {
    const CONTEXT_CAP = 50;
    const BLOCK_TAGS = new Set(['P', 'LI', 'TD', 'TH', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'ARTICLE', 'SECTION', 'FIGCAPTION', 'DD', 'DT', 'PRE', 'CAPTION']);
    const ABBREVIATIONS = new Set(['Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Jr', 'Sr', 'St', 'vs', 'etc', 'Inc', 'Ltd', 'Corp', 'Co', 'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

    function _findBlock(node) {
        let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        while (el && el !== document.body) {
            if (BLOCK_TAGS.has(el.tagName)) return el;
            if (el.tagName === 'DIV' && el.textContent.length > 20) return el;
            el = el.parentElement;
        }
        return document.body;
    }

    function _textOffset(blockEl, targetNode, targetOffset) {
        const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
        let offset = 0;
        while (walker.nextNode()) {
            if (walker.currentNode === targetNode) return offset + targetOffset;
            offset += walker.currentNode.length;
        }
        return offset;
    }

    function _isSentenceEnd(text, i) {
        const ch = text[i];
        if (ch === '。' || ch === '！' || ch === '？') return true;
        if (ch === '!' || ch === '?') return i === text.length - 1 || /\s/.test(text[i + 1]);
        if (ch === '.') {
            if (i < text.length - 1 && !/\s/.test(text[i + 1])) return false;
            let wordStart = i - 1;
            while (wordStart >= 0 && /[A-Za-z]/.test(text[wordStart])) wordStart--;
            const word = text.substring(wordStart + 1, i);
            if (ABBREVIATIONS.has(word)) return false;
            if (word.length === 1 && /[A-Z]/.test(word)) return false;
            if (wordStart >= 0 && /\d/.test(text[wordStart])) return false;
            return true;
        }
        return false;
    }

    function _sentenceStart(text, from) {
        for (let i = from - 1; i >= 0; i--) {
            if (_isSentenceEnd(text, i)) {
                let j = i + 1;
                while (j < text.length && /\s/.test(text[j])) j++;
                return j;
            }
        }
        return 0;
    }

    function _sentenceEnd(text, from) {
        for (let i = from; i < text.length; i++) {
            if (_isSentenceEnd(text, i)) return i + 1;
        }
        return text.length;
    }

    function getContext(range) {
        const block = _findBlock(range.commonAncestorContainer);
        const fullText = block.textContent || '';
        if (!fullText) return '';

        const selStart = _textOffset(block, range.startContainer, range.startOffset);
        const selEnd = _textOffset(block, range.endContainer, range.endOffset);

        const curSentStart = _sentenceStart(fullText, selStart);
        const curSentEnd = _sentenceEnd(fullText, selEnd);

        const prevSentStart = _sentenceStart(fullText, curSentStart);
        const nextSentEnd = _sentenceEnd(fullText, curSentEnd);

        const ctxStart = Math.max(prevSentStart, selStart - CONTEXT_CAP);
        const ctxEnd = Math.min(nextSentEnd, selEnd + CONTEXT_CAP);

        return fullText.substring(ctxStart, ctxEnd).trim();
    }

    return { getContext };
})();