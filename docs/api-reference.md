# ContextDic Pro - API Reference

## 📚 Complete API Documentation

This document provides comprehensive reference for ContextDic Pro's backend API and Chrome extension integration.

---

## 🌐 Base URL

```
Development: http://localhost:5000
Production: https://your-domain.com
```

---

## 🔐 Authentication

### API Key Configuration
ContextDic Pro supports **flexible API key management**:

1. **Environment Variable** (Backend): Set `GEMINI_API_KEY` in `.env` file
2. **Request Header** (Extension): Pass `apiKey` in request body
3. **Fallback Logic**: Uses environment key if request doesn't provide one

---

## 📡 API Endpoints

### 🔍 **GET /api/health**
**Service health check endpoint**

#### Response
```json
{
    "success": true,
    "status": "healthy",
    "service": "ContextDic Pro Backend",
    "version": "1.0.0",
    "timestamp": "1234567890"
}
```

#### Status Codes
- `200 OK`: Service is healthy

---

### 📊 **GET /api/status**
**Detailed status with configuration info**

#### Response
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

#### Status Codes
- `200 OK`: Status retrieved successfully

---

### 🔤 **POST /api/translate**
**Primary translation endpoint with advanced features**

#### Request Body
```json
{
    "text": "Text to translate",
    "targetLanguage": "en",
    "context": "Optional context for better translation",
    "apiKey": "Optional API key (overrides environment)"
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | ✅ Yes | Text to translate |
| `targetLanguage` | string | ✅ Yes | Target language code |
| `context` | string | ❌ No | Additional context for better translation |
| `apiKey` | string | ❌ No | API key (overrides environment configuration) |

#### Success Response (200 OK)
```json
{
    "success": true,
    "translatedText": "Translated content",
    "sourceLanguage": "auto-detected",
    "targetLanguage": "en",
    "confidence": 0.95,
    "notes": "Direct translation",
    "timestamp": "1234567890"
}
```

#### Error Response
```json
{
    "success": false,
    "error": "Error description",
    "errorType": "AUTH_ERROR",
    "timestamp": "1234567890"
}
```

#### Status Codes
- `200 OK`: Translation successful
- `400 Bad Request`: Missing required parameters
- `401 Unauthorized`: Invalid/missing API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Processing error
- `503 Service Unavailable`: Network/connection issues

---

## 🌍 Supported Languages

| Language | Code | Full Name |
|----------|------|-----------|
| English | `en` | English |
| Chinese (Simplified) | `zh` | Chinese (Simplified) |
| Chinese (Simplified) | `zh-CN` | Chinese (Simplified) |
| Chinese (Traditional) | `zh-TW` | Chinese (Traditional) |
| Japanese | `ja` | Japanese |
| Korean | `ko` | Korean |
| French | `fr` | French |
| German | `de` | German |
| Spanish | `es` | Spanish |
| Italian | `it` | Italian |
| Portuguese | `pt` | Portuguese |
| Russian | `ru` | Russian |

---

## 🛡️ Error Handling

### Error Categories
| Error Type | Description | Common Causes |
|------------|-------------|---------------|
| `AUTH_ERROR` | Authentication issues | Invalid/missing API key |
| `RATE_LIMIT_ERROR` | Rate limiting | Quota exceeded, too many requests |
| `NETWORK_ERROR` | Network problems | Connection issues, timeouts |
| `PERMISSION_ERROR` | Access restrictions | Insufficient permissions |
| `UNKNOWN_ERROR` | Unexpected issues | Internal server errors |

### HTTP Status Code Guide
- **2xx Success**: Request processed successfully
- **4xx Client Error**: Problem with request (missing params, auth, etc.)
- **5xx Server Error**: Problem with server processing

---

## 🔧 Chrome Extension Integration

### Extension → Backend Communication Flow

```
Content Script → Background Script → Gemini Service → Backend API → Gemini AI
```

### Key Extension Components

#### 1. **Content Script** (`content/content.js`)
- Handles text selection detection
- Shows translation UI (button + popup)
- Manages user interactions

#### 2. **Background Script** (`background/background.js`)
- Mediates API communication
- Manages settings and API keys
- Handles message passing

#### 3. **Popup Interface** (`popup/popup.js`)
- Quick translation functionality
- Real-time status monitoring
- Settings access

#### 4. **Settings Page** (`settings/settings.js`)
- API key configuration
- Language preferences
- Storage management

### Extension API Usage

#### Translation Request
```javascript
// From content script or popup
const response = await chrome.runtime.sendMessage({
    type: 'translate',
    text: selectedText,
    targetLanguage: 'en',
    context: contextText
});
```

#### Settings Management
```javascript
// Save settings
await chrome.storage.local.set({
    apiKey: 'your-api-key',
    targetLanguage: 'en',
    sourceLanguage: 'zh'
});

// Load settings
const settings = await chrome.storage.local.get([
    'apiKey', 'targetLanguage', 'sourceLanguage'
]);
```

---

## 📈 Response Features

### Translation Confidence
- **Range**: 0.0 - 1.0
- **Display**: Color-coded progress bar
- **Interpretation**: Higher values indicate more confident translations

### Translation Notes
- **Context**: Additional insights about the translation
- **Examples**: "Direct translation", "Idiomatic expression", "Cultural context"
- **Usage**: Helps users understand translation nuances

### Timestamps
- **Format**: Unix timestamp (seconds since epoch)
- **Usage**: Request tracking, debugging, caching

---

## 🚀 Usage Examples

### Basic Translation
```bash
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "targetLanguage": "zh"
  }'
```

### Translation with Context
```bash
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bank",
    "targetLanguage": "zh",
    "context": "financial institution where people deposit money"
  }'
```

### Translation with API Key
```bash
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Good morning",
    "targetLanguage": "ja",
    "apiKey": "AIza...your-api-key"
  }'
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Status Check
```bash
curl http://localhost:5000/api/status
```

---

## 🛠️ Development & Testing

### Testing Endpoints
Use these commands to test your local development setup:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test status endpoint  
curl http://localhost:5000/api/status

# Test translation with simple text
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"test","targetLanguage":"zh"}'

# Test translation with context
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"bank","targetLanguage":"zh","context":"financial institution"}'
```

### Extension Testing
1. Load extension in Chrome developer mode
2. Check popup interface for status indicators
3. Test text selection on various websites
4. Verify error handling with invalid inputs
5. Monitor Chrome DevTools console for logs

---

## 📝 Response Examples

### Successful Translation
```json
{
    "success": true,
    "translatedText": "你好，你好吗？",
    "sourceLanguage": "en",
    "targetLanguage": "zh",
    "confidence": 0.97,
    "notes": "Informal greeting translation",
    "timestamp": "1703123456"
}
```

### Authentication Error
```json
{
    "success": false,
    "error": "API key not configured. Please set your Gemini API key.",
    "errorType": "AUTH_ERROR",
    "timestamp": "1703123456"
}
```

### Rate Limit Error
```json
{
    "success": false,
    "error": "Rate limit exceeded. Please wait a moment and try again.",
    "errorType": "RATE_LIMIT_ERROR",
    "timestamp": "1703123456"
}
```

---

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Complete API implementation
- ✅ Health and status endpoints
- ✅ Flexible API key management
- ✅ Comprehensive error handling
- ✅ Translation confidence scoring
- ✅ Context-aware translations
- ✅ Chrome extension integration

---

## 📞 Support & Resources

- **Documentation**: See [README.md](README.md) for setup instructions
- **Development Guide**: See [DEVELOPMENT.md](DEVELOPMENT.md) for technical details
- **Quick Start**: See [QUICK_START.md](QUICK_START.md) for immediate setup
- **Backend Setup**: See [backend/README.md](backend/README.md) for API details

---

**Made with ❤️ using Google's Gemini AI** 