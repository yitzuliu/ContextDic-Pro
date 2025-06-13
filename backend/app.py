from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize the model
model = genai.GenerativeModel('gemini-pro')

@app.route('/api/translate', methods=['POST'])
def translate():
    try:
        data = request.json
        text = data.get('text')
        target_language = data.get('targetLanguage')
        context = data.get('context', '')

        if not text or not target_language:
            return jsonify({
                'error': 'Missing required parameters: text and targetLanguage'
            }), 400

        # Build the translation prompt
        prompt = build_translation_prompt(text, target_language, context)

        # Generate translation
        response = model.generate_content(prompt)
        
        # Parse the response
        translated_text = response.text.strip()

        return jsonify({
            'translatedText': translated_text,
            'sourceLanguage': 'auto-detected',
            'targetLanguage': target_language,
            'confidence': 1.0
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

def build_translation_prompt(text, target_language, context):
    language_map = {
        'en': 'English',
        'zh-CN': 'Simplified Chinese',
        'zh-TW': 'Traditional Chinese',
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