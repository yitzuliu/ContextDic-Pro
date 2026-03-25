import { AIProvider } from './base-provider.js';
import PromptBuilder from '../prompt-builder.js';

export class GeminiProvider extends AIProvider {
    async translate(text, targetLanguage, context) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
        
        const systemPrompt = "You are an expert context-aware translator. Respond ONLY with a JSON object containing 'translatedText', 'confidence' (0.0-1.0), and 'notes'.";
        const userPrompt = PromptBuilder.buildPrompt(text, targetLanguage, context);

        const payload = {
            system_instruction: {
                parts: { text: systemPrompt }
            },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Gemini API Error (${res.status}): ${errBody}`);
        }

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return this._parseJSONResponse(rawText);
    }
}