from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import time
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API (will be reconfigured per request if API key provided)
if os.getenv('GEMINI_API_KEY'):
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'ContextDic Pro Backend',
        'version': '1.0.0',
        'timestamp': str(int(time.time()))
    })

@app.route('/api/status', methods=['GET'])
def status_check():
    """Status check with API key validation"""
    env_api_key = os.getenv('GEMINI_API_KEY')
    has_env_key = env_api_key and env_api_key != 'your_gemini_api_key_here'
    
    return jsonify({
        'success': True,
        'backend_running': True,
        'api_key_configured': has_env_key,
        'accepts_request_api_key': True,
        'service': 'ContextDic Pro Backend',
        'timestamp': str(int(time.time()))
    })

@app.route('/api/translate', methods=['POST'])
def translate():
    try:
        data = request.json
        text = data.get('text')
        target_language = data.get('targetLanguage')
        context = data.get('context', '')
        api_key = data.get('apiKey', '')

        if not text or not target_language:
            return jsonify({
                'success': False,
                'error': 'Missing required parameters: text and targetLanguage'
            }), 400

        # Use API key from request if provided, otherwise use environment
        effective_api_key = api_key if api_key else os.getenv('GEMINI_API_KEY')
        
        if not effective_api_key or effective_api_key == 'your_gemini_api_key_here':
            return jsonify({
                'success': False,
                'error': 'API key not configured. Please set your Gemini API key.',
                'errorType': 'AUTH_ERROR'
            }), 401

        # Configure Gemini with the effective API key
        genai.configure(api_key=effective_api_key)
        
        # Initialize the model for this request
        model = genai.GenerativeModel('gemini-pro')

        # Build the translation prompt
        prompt = build_translation_prompt(text, target_language, context)

        # Generate translation
        response = model.generate_content(prompt)
        
        # Parse the response - handle both JSON and plain text responses
        translated_text, confidence, notes = parse_gemini_response(response.text.strip())

        return jsonify({
            'success': True,
            'translatedText': translated_text,
            'sourceLanguage': 'auto-detected',
            'targetLanguage': target_language,
            'confidence': confidence,
            'notes': notes if notes else 'Translation completed successfully',
            'timestamp': str(int(time.time()))
        })

    except Exception as e:
        error_msg = str(e)
        status_code = 500
        
        # Categorize errors for better client handling
        if 'API_KEY' in error_msg or 'authentication' in error_msg.lower():
            status_code = 401
        elif 'quota' in error_msg.lower() or 'limit' in error_msg.lower():
            status_code = 429
        elif 'network' in error_msg.lower() or 'connection' in error_msg.lower():
            status_code = 503
            
        return jsonify({
            'success': False,
            'error': error_msg,
            'errorType': categorize_error(error_msg),
            'timestamp': str(int(time.time()))
        }), status_code

def parse_gemini_response(response_text):
    """Parse Gemini response - handle both JSON and plain text formats"""
    try:
        # Try to parse as JSON first
        if response_text.strip().startswith('{') and response_text.strip().endswith('}'):
            data = json.loads(response_text)
            return (
                data.get('translation', response_text),
                data.get('confidence', 0.9),
                data.get('notes', '')
            )
    except json.JSONDecodeError:
        pass
    
    # If not JSON, treat as plain text translation
    return response_text, 0.95, 'Direct translation'

def categorize_error(error_msg):
    """Categorize errors for better client handling"""
    error_msg_lower = error_msg.lower()
    
    if 'api' in error_msg_lower and 'key' in error_msg_lower:
        return 'AUTH_ERROR'
    elif 'quota' in error_msg_lower or 'limit' in error_msg_lower:
        return 'RATE_LIMIT_ERROR'
    elif 'network' in error_msg_lower or 'connection' in error_msg_lower:
        return 'NETWORK_ERROR'
    elif 'permission' in error_msg_lower:
        return 'PERMISSION_ERROR'
    else:
        return 'UNKNOWN_ERROR'

def build_translation_prompt(text, target_language, context):
    language_map = {
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

    target_language_name = language_map.get(target_language, target_language)
    
    prompt = f"""You are a professional translator. Translate the following text to {target_language_name}.

Context (for better translation accuracy):
{context}

Text to translate:
{text}

Please provide the translation in JSON format:
{{
    "translation": "translated text here",
    "confidence": 0.95,
    "notes": "any relevant notes about the translation"
}}"""

    return prompt

if __name__ == '__main__':
    app.run(debug=True, port=5000) 