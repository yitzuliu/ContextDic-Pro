import { GeminiProvider } from './providers/gemini-provider.js';
import { OpenAIProvider } from './providers/openai-provider.js';
import { ClaudeProvider } from './providers/claude-provider.js';
import { GrokProvider } from './providers/grok-provider.js';

export class AIServiceFactory {
    /**
     * @param {string} providerName - 'gemini', 'openai', 'claude', or 'grok'
     * @param {string} apiKey - The corresponding API key
     * @returns {import('./providers/base-provider.js').AIProvider}
     */
    static createProvider(providerName, apiKey) {
        switch (providerName) {
            case 'openai':
                return new OpenAIProvider(apiKey);
            case 'claude':
                return new ClaudeProvider(apiKey);
            case 'grok':
                return new GrokProvider(apiKey);
            case 'gemini':
            default:
                return new GeminiProvider(apiKey);
        }
    }
}