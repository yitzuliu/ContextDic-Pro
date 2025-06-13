# ContextDic Pro - Backend Service

This is the Python backend service for ContextDic Pro, handling Gemini API calls and providing a REST API for the Chrome extension.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Add your Gemini API key to the `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

## Running the Service

Start the Flask development server:
```bash
python app.py
```

The server will run on `http://localhost:5000`.

## API Endpoints

### POST /api/translate

Translates text using Gemini AI.

Request body:
```json
{
    "text": "Text to translate",
    "targetLanguage": "en",
    "context": "Optional context for better translation"
}
```

Response:
```json
{
    "translatedText": "Translated text",
    "sourceLanguage": "auto-detected",
    "targetLanguage": "en",
    "confidence": 1.0
}
```

## Development

The backend service uses:
- Flask for the web server
- Flask-CORS for handling CORS
- google-generativeai for Gemini API integration
- python-dotenv for environment variable management

## Error Handling

The service returns appropriate HTTP status codes and error messages:
- 400: Bad Request (missing parameters)
- 401/403: Unauthorized (invalid API key)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error 