"""
ContextDic Pro — Translation API (FastAPI)
"""

from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import time
from dotenv import load_dotenv

from backend.services.sanitizer import sanitize
from backend.services.rate_limiter import check_rate_limit_fastapi
from backend.middleware.auth import verify_api_secret
from backend.agents.orchestrator import Orchestrator

load_dotenv()

app = FastAPI(title="ContextDic Pro Backend", version="2.0.0")

_cors_origins = os.getenv('CORS_ORIGINS', 'chrome-extension://*,http://localhost:*')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins.split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_PER_MINUTE', '60'))
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')

if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
    genai.configure(api_key=GEMINI_API_KEY)

orchestrator = Orchestrator(model_name=GEMINI_MODEL)

class TranslateRequest(BaseModel):
    text: str
    targetLanguage: str
    context: str = ""

def rate_limit_dependency(request: Request):
    check_rate_limit_fastapi(request, RATE_LIMIT_REQUESTS)

@app.get("/api/health")
async def health_check():
    return {
        'success': True,
        'status': 'healthy',
        'service': 'ContextDic Pro Backend',
        'version': '2.0.0',
        'timestamp': str(int(time.time())),
    }

@app.get("/api/status")
async def status_check():
    return {
        'success': True,
        'backend_running': True,
        'api_key_configured': bool(GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here'),
        'service': 'ContextDic Pro Backend',
        'timestamp': str(int(time.time())),
    }

@app.post("/api/translate", dependencies=[Depends(verify_api_secret), Depends(rate_limit_dependency)])
async def translate(request: TranslateRequest):
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        return {
            'success': False,
            'error': 'API key not configured on the server. Please set GEMINI_API_KEY in the backend .env file.',
            'errorType': 'AUTH_ERROR',
            'timestamp': str(int(time.time())),
        }
    
    text = sanitize(request.text)
    context = sanitize(request.context)
    
    if not text:
        return {
            'success': False,
            'error': 'Missing required parameters: text',
            'errorType': 'VALIDATION_ERROR',
            'timestamp': str(int(time.time())),
        }

    try:
        result = await orchestrator.translate(text, request.targetLanguage, context)
        return {
            'success': True,
            'translatedText': result.translatedText,
            'sourceLanguage': 'auto-detected',
            'targetLanguage': request.targetLanguage,
            'confidence': result.confidence,
            'notes': result.notes,
            'timestamp': str(int(time.time())),
        }
    except HTTPException as e:
        return {
            'success': False,
            'error': e.detail,
            'errorType': 'HTTP_ERROR',
            'timestamp': str(int(time.time())),
        }
    except Exception as exc:
        msg = str(exc)
        error_type = 'UNKNOWN_ERROR'
        if 'API_KEY' in msg or 'authentication' in msg.lower() or '401' in msg:
            error_type = 'AUTH_ERROR'
        elif 'quota' in msg.lower() or 'limit' in msg.lower() or '429' in msg:
            error_type = 'RATE_LIMIT_ERROR'
        elif 'network' in msg.lower() or 'connection' in msg.lower() or '503' in msg:
            error_type = 'NETWORK_ERROR'
            
        return {
            'success': False,
            'error': msg,
            'errorType': error_type,
            'timestamp': str(int(time.time())),
        }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=5000, reload=True)