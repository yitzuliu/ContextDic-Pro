const CONTEXT_CAP = 50;
const ABBREVIATIONS = new Set(['Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Jr', 'Sr', 'St', 'vs', 'etc', 'Inc', 'Ltd', 'Corp', 'Co']);

function _isSentenceEnd(text, i) {
    const ch = text[i];
    if (ch === '\u3002' || ch === '\uff01' || ch === '\uff1f') return true;
    if (ch === '!' || ch === '?') return i === text.length - 1 || /\s/.test(text[i + 1]);
    if (ch === '.') {
        if (i < text.length - 1 && !/\s/.test(text[i + 1])) return false;
        let ws = i - 1;
        while (ws >= 0 && /[A-Za-z]/.test(text[ws])) ws--;
        const word = text.substring(ws + 1, i);
        if (ABBREVIATIONS.has(word)) return false;
        if (word.length === 1 && /[A-Z]/.test(word)) return false;
        if (ws >= 0 && /\d/.test(text[ws])) return false;
        return true;
    }
    return false;
}
function _sentenceStart(text, from) {
    for (let i = from - 1; i >= 0; i--) {
        if (_isSentenceEnd(text, i)) { let j = i + 1; while (j < text.length && /\s/.test(text[j])) j++; return j; }
    }
    return 0;
}
function _sentenceEnd(text, from) {
    for (let i = from; i < text.length; i++) { if (_isSentenceEnd(text, i)) return i + 1; }
    return text.length;
}

const text = 'What a surprise! The results are in. Let us celebrate.';
const selStart = 21;
const selEnd = 28;
const curSentStart = _sentenceStart(text, selStart);
const curSentEnd = _sentenceEnd(text, selEnd);
const prevSentStart = _sentenceStart(text, curSentStart);
const nextSentEnd = _sentenceEnd(text, curSentEnd);
const ctxStart = Math.max(prevSentStart, selStart - CONTEXT_CAP);
const ctxEnd = Math.min(nextSentEnd, selEnd + CONTEXT_CAP);
console.log('curSent:', JSON.stringify(text.substring(curSentStart, curSentEnd)));
console.log('prevSentStart:', prevSentStart, 'nextSentEnd:', nextSentEnd);
console.log('ctxStart:', ctxStart, 'ctxEnd:', ctxEnd);
console.log('RESULT:', JSON.stringify(text.substring(ctxStart, ctxEnd)));
