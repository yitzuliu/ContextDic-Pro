import { AIProvider } from './base-provider.js';
import PromptBuilder from '../prompt-builder.js';

export class GrokProvider extends AIProvider {
    async translate(text, targetLanguage, context) {
        // xAI uses an OpenAI-compatible endpoint
        const url = 'https://api.x.ai/v1/chat/completions';
        const systemPrompt = "You are an expert context-aware translator. You must respond ONLY with a valid JSON object containing exactly these keys: 'translatedText' (string), 'confidence' (number 0.0-1.0), and 'notes' (string).";
        const userPrompt = PromptBuilder.buildPrompt(text, targetLanguage, context);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            })
        });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Grok API Error (${res.status}): ${errBody}`);
        }

        const data = await res.json();
        const rawText = data.choices?.[0]?.message?.content || '';
        return this._parseJSONResponse(rawText);
    }
}