/**
 * @fileoverview Base class for all AI Providers in BYOK mode.
 */

export class AIProvider {
    /**
     * @param {string} apiKey - The user's API key.
     */
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error(`API Key is required for BYOK mode.`);
        }
        this.apiKey = apiKey;
    }

    /**
     * Translates text. Must be implemented by subclasses.
     * @param {string} text 
     * @param {string} targetLanguage 
     * @param {string} context 
     * @returns {Promise<{translatedText: string, confidence: number, notes: string}>}
     */
    async translate(text, targetLanguage, context) {
        throw new Error('Not implemented');
    }

    /**
     * Helper to safely parse JSON from AI models that might wrap output in markdown.
     */
    _parseJSONResponse(rawText) {
        let stripped = rawText.trim();
        if (stripped.startsWith('```json')) stripped = stripped.substring(7);
        else if (stripped.startsWith('```')) stripped = stripped.substring(3);
        
        if (stripped.endsWith('```')) stripped = stripped.substring(0, stripped.length - 3);
        
        try {
            const data = JSON.parse(stripped.trim());
            return {
                translatedText: data.translatedText || data.translation || stripped,
                confidence: parseFloat(data.confidence || 0.9),
                notes: data.notes || ''
            };
        } catch (e) {
            return {
                translatedText: stripped,
                confidence: 0.5,
                notes: 'Fallback: JSON parsing failed.'
            };
        }
    }
}