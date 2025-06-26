# ContextDic Pro - Backend API Service

This is the **enterprise-grade Python backend service** for ContextDic Pro, providing a robust REST API with advanced features including health monitoring, flexible API key management, and intelligent error handling.

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

## 🚀 API Endpoints

### POST /api/translate
**Primary translation endpoint with advanced features**

#### Request Body:
```json
{
    "text": "Text to translate",
    "targetLanguage": "en", 
    "context": "Optional context for better translation",
    "apiKey": "Optional API key (overrides environment)"
}
```

#### Success Response:
```json
{
    "success": true,
    "translatedText": "Translated text",
    "sourceLanguage": "auto-detected",
    "targetLanguage": "en",
    "confidence": 0.95,
    "notes": "Direct translation",
    "timestamp": "1234567890"
}
```

#### Error Response:
```json
{
    "success": false,
    "error": "Error message",
    "errorType": "AUTH_ERROR",
    "timestamp": "1234567890"
}
```

### GET /api/health
**Service health check endpoint**

#### Response:
```json
{
    "success": true,
    "status": "healthy",
    "service": "ContextDic Pro Backend",
    "version": "1.0.0",
    "timestamp": "1234567890"
}
```

### GET /api/status
**Detailed status with API key validation**

#### Response:
```json
{
    "success": true,
    "backend_running": true,
    "api_key_configured": true,
    "accepts_request_api_key": true,
    "service": "ContextDic Pro Backend", 
    "timestamp": "1234567890"
}
```

## 🛠️ Technical Architecture

### Dependencies
- **Flask 3.0.0**: Web framework
- **Flask-CORS 4.0.0**: Cross-origin resource sharing
- **google-generativeai 0.3.2**: Gemini AI integration
- **python-dotenv 1.0.0**: Environment management

### Key Features
- **Flexible API Key Support**: Environment variables OR request headers
- **Smart Response Parsing**: Handles both JSON and plain text from Gemini
- **Categorized Error Handling**: AUTH_ERROR, RATE_LIMIT_ERROR, NETWORK_ERROR
- **Health Monitoring**: Built-in status and health check endpoints
- **Request Validation**: Comprehensive input validation and sanitization

## 🔧 Advanced Configuration

### Environment Variables (.env)
```bash
# Required
GEMINI_API_KEY=your_api_key_here

# Optional Configuration  
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGINS=chrome-extension://*,http://localhost:*
RATE_LIMIT_PER_MINUTE=60
LOG_LEVEL=INFO
```

### Supported Languages
```python
{
    'en': 'English',
    'zh': 'Chinese (Simplified)', 
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'fr': 'French', 
    'de': 'German',
    'es': 'Spanish',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian'
}
```

## 🛡️ Error Handling

### HTTP Status Codes
| Code | Type | Description |
|------|------|-------------|
| 200 | Success | Translation completed |
| 400 | Bad Request | Missing required parameters |
| 401 | Unauthorized | Invalid/missing API key |
| 429 | Rate Limited | Quota exceeded |
| 500 | Server Error | Internal processing error |
| 503 | Service Unavailable | Network/connection issues |

### Error Categories
- **AUTH_ERROR**: API key issues
- **RATE_LIMIT_ERROR**: Quota/rate limiting  
- **NETWORK_ERROR**: Connection problems
- **PERMISSION_ERROR**: Access restrictions
- **UNKNOWN_ERROR**: Unexpected issues 