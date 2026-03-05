"""
ContextDic Pro — Translation API (Flask)

This is the main application entry-point.  Business logic is
delegated to sub-modules under ``backend/services/`` and
``backend/middleware/`` for maintainability and testability.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from concurrent.futures import ThreadPoolExecutor, TimeoutError
import os
import json
import time
from dotenv import load_dotenv

from backend.services.prompt_builder import build_translation_prompt
from backend.services.sanitizer import sanitize
from backend.services.rate_limiter import check_rate_limit
from backend.middleware.auth import require_api_secret

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

app = Flask(__name__)

# CORS — restrict by env var; default allows Chrome extensions & localhost
_cors_origins = os.getenv('CORS_ORIGINS', 'chrome-extension://*,http://localhost:*')
CORS(app, origins=[o.strip() for o in _cors_origins.split(',')])

# Shared secret for request authentication
API_SECRET = os.getenv('API_SECRET', '')

# Rate limiting
RATE_LIMIT_REQUESTS = int(os.getenv('RATE_LIMIT_PER_MINUTE', '60'))

# Gemini
REQUEST_TIMEOUT_SECONDS = int(os.getenv('REQUEST_TIMEOUT_SECONDS', '15'))
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')

_executor = ThreadPoolExecutor(max_workers=4)

if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
    genai.configure(api_key=GEMINI_API_KEY)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _categorize_error(msg: str) -> str:
    """Map an error message to a client-friendly error type string."""
    low = msg.lower()
    if 'api' in low and 'key' in low:
        return 'AUTH_ERROR'
    if 'quota' in low or 'limit' in low:
        return 'RATE_LIMIT_ERROR'
    if 'network' in low or 'connection' in low:
        return 'NETWORK_ERROR'
    if 'permission' in low:
        return 'PERMISSION_ERROR'
    return 'UNKNOWN_ERROR'


def _parse_gemini_response(text: str) -> tuple[str, float, str]:
    """Extract translation, confidence, and notes from the model output.

    Handles both well-formed JSON and plain-text fallback.
    """
    stripped = text.strip()
    try:
        if stripped.startswith('{') and stripped.endswith('}'):
            data = json.loads(stripped)
            return (
                data.get('translation', stripped),
                data.get('confidence', 0.9),
                data.get('notes', ''),
            )
    except json.JSONDecodeError:
        pass
    return stripped, 0.95, 'Direct translation'


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    """Lightweight liveness probe (no auth required)."""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'ContextDic Pro Backend',
        'version': '1.2.0',
        'timestamp': str(int(time.time())),
    })


@app.route('/api/status', methods=['GET'])
def status_check():
    """Readiness probe — reports whether the Gemini key is configured."""
    return jsonify({
        'success': True,
        'backend_running': True,
        'api_key_configured': bool(
            GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here'
        ),
        'service': 'ContextDic Pro Backend',
        'timestamp': str(int(time.time())),
    })


@app.route('/api/translate', methods=['POST'])
@require_api_secret(API_SECRET)
def translate():
    """Accept a translation request and return the Gemini result."""
    try:
        data = request.json or {}
        text = data.get('text')
        target_language = data.get('targetLanguage')
        context = data.get('context', '')

        # --- Validate input -------------------------------------------------
        if not text or not target_language:
            return jsonify({
                'success': False,
                'error': 'Missing required parameters: text and targetLanguage',
            }), 400

        if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
            return jsonify({
                'success': False,
                'error': ('API key not configured on the server. '
                          'Please set GEMINI_API_KEY in the backend .env file.'),
                'errorType': 'AUTH_ERROR',
            }), 401

        # --- Rate limit ------------------------------------------------------
        ip = request.remote_addr or 'unknown'
        if not check_rate_limit(ip, RATE_LIMIT_REQUESTS):
            return jsonify({
                'success': False,
                'error': 'Rate limit exceeded. Please wait and try again.',
                'errorType': 'RATE_LIMIT_ERROR',
            }), 429

        # --- Build & send prompt --------------------------------------------
        prompt = build_translation_prompt(
            sanitize(text),
            target_language,
            sanitize(context),
        )

        model = genai.GenerativeModel(GEMINI_MODEL)
        try:
            response = _executor.submit(
                model.generate_content, prompt,
            ).result(timeout=REQUEST_TIMEOUT_SECONDS)
        except TimeoutError:
            return jsonify({
                'success': False,
                'error': f'Model timed out after {REQUEST_TIMEOUT_SECONDS}s',
                'errorType': 'TIMEOUT_ERROR',
            }), 504

        # --- Parse response -------------------------------------------------
        raw = getattr(response, 'text', '') or ''
        translated, confidence, notes = _parse_gemini_response(raw)

        return jsonify({
            'success': True,
            'translatedText': translated,
            'sourceLanguage': 'auto-detected',
            'targetLanguage': target_language,
            'confidence': confidence,
            'notes': notes or 'Translation completed successfully',
            'timestamp': str(int(time.time())),
        })

    except Exception as exc:
        msg = str(exc)
        code = 500
        if 'API_KEY' in msg or 'authentication' in msg.lower():
            code = 401
        elif 'quota' in msg.lower() or 'limit' in msg.lower():
            code = 429
        elif 'network' in msg.lower() or 'connection' in msg.lower():
            code = 503
        return jsonify({
            'success': False,
            'error': msg,
            'errorType': _categorize_error(msg),
            'timestamp': str(int(time.time())),
        }), code


# ---------------------------------------------------------------------------
# Entry-point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)