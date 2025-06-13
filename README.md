# ContextDic Pro

A Chrome extension that provides context-aware translations using Google's Gemini AI.

## Features

- Smart text selection with sentence detection
- Multi-language support
- Context-aware translations
- Clean and intuitive user interface
- Customizable settings

## Supported Languages

- Chinese (zh)
- English (en)
- Japanese (ja)
- Korean (ko)
- French (fr)
- German (de)
- Spanish (es)
- Italian (it)
- Russian (ru)
- Portuguese (pt)

## Installation

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/contextdic-pro.git
   cd contextdic-pro
   ```

2. Install Python dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your Gemini API key
   ```

4. Start backend service:
   ```bash
   python app.py
   ```

5. Load extension in Chrome:
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

## Usage

1. Select text on any webpage
2. Click the translation button that appears
3. View the translation in the popup
4. Copy the translation if needed

## Configuration

Access the settings page to:
- Set source and target languages
- Configure API key
- Customize translation preferences

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development information.

## License

MIT License - See [LICENSE](LICENSE) file