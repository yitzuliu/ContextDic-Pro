// Gemini API Service Implementation
class GeminiService {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
        this.rateLimit = {
            requestsPerMinute: 60,
            lastRequestTime: 0
        };
        this.errorMessages = {
            NO_API_KEY: 'API key not initialized. Please configure your Gemini API key in the extension settings.',
            INVALID_API_KEY: 'Invalid API key. Please check your Gemini API key in the extension settings.',
            RATE_LIMIT: 'Rate limit exceeded. Please wait a moment before trying again.',
            NETWORK_ERROR: 'Network error occurred. Please check your internet connection.',
            INVALID_RESPONSE: 'Invalid response from translation service.',
            UNKNOWN_ERROR: 'An unexpected error occurred.'
        };
    }

    async initialize(apiKey) {
        if (!apiKey) {
            throw new Error(this.errorMessages.NO_API_KEY);
        }
        return true;
    }

    async translate(text, targetLanguage, context = '') {
        if (!text || !targetLanguage) {
            throw new Error('Invalid translation parameters');
        }

        await this.checkRateLimit();
        
        try {
            const response = await fetch(`${this.baseUrl}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    targetLanguage,
                    context
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(this.errorMessages.RATE_LIMIT);
                }
                if (response.status === 401 || response.status === 403) {
                    throw new Error(this.errorMessages.INVALID_API_KEY);
                }
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            return {
                translatedText: data.translatedText,
                sourceLanguage: data.sourceLanguage,
                targetLanguage: data.targetLanguage,
                confidence: data.confidence
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(this.errorMessages.NETWORK_ERROR);
            }
            throw error;
        }
    }

    async checkRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.rateLimit.lastRequestTime;
        
        if (timeSinceLastRequest < (60000 / this.rateLimit.requestsPerMinute)) {
            const waitTime = (60000 / this.rateLimit.requestsPerMinute) - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.rateLimit.lastRequestTime = Date.now();
    }
}

// Export the service
export default new GeminiService(); 