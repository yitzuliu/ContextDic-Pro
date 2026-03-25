import { AIProvider } from './base-provider.js';
import PromptBuilder from '../prompt-builder.js';

export class ClaudeProvider extends AIProvider {
    async translate(text, targetLanguage, context) {
        const url = 'https://api.anthropic.com/v1/messages';
        const systemPrompt = "You are an expert context-aware translator. You must respond ONLY with a valid JSON object containing exactly these keys: 'translatedText' (string), 'confidence' (number 0.0-1.0), and 'notes' (string). Do not include any conversational text before or after the JSON.";
        const userPrompt = PromptBuilder.buildPrompt(text, targetLanguage, context);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerously-allow-browser': 'true' // Required for client-side calls
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1024,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.2
            })
        });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Claude API Error (${res.status}): ${errBody}`);
        }

        const data = await res.json();
        const rawText = data.content?.[0]?.text || '';
        return this._parseJSONResponse(rawText);
    }
}