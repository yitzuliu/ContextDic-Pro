# ContextDic Pro Development Guide

## Project Structure

### Core Files
- `manifest.json` - Extension configuration
- `services/gemini-service.js` - Gemini API integration
- `content-scripts/content.js` - Main content script
- `background-scripts/background.js` - Background service worker
- `popup/popup.html` - Extension popup UI
- `popup/popup.js` - Popup functionality
- `settings/settings.html` - Settings UI
- `settings/settings.js` - Settings management
- `styles/popup.css` - Popup styles
- `styles/content.css` - Content script styles
- `icons/icon.svg` - Extension icon source
- `icons/icon16.png` - 16x16 icon
- `icons/icon32.png` - 32x32 icon
- `icons/icon48.png` - 48x48 icon
- `icons/icon128.png` - 128x128 icon
- `backend/app.py` - Python backend service
- `backend/requirements.txt` - Python dependencies
- `backend/.env` - Environment variables

### Key Components
1. **Content Script**
   - Text selection detection
   - Smart sentence detection
     - Multi-language sentence boundaries
     - Context-aware sentence extraction
     - Length limit protection
   - Context extraction
   - Translation UI
   - Copy functionality

2. **Background Service**
   - API key management
   - Settings synchronization
   - Rate limiting
   - Error handling

3. **Settings Interface**
   - API key configuration
   - Language preferences
   - Context settings
   - UI customization

4. **Backend Service**
   - Gemini API integration
   - JSON response formatting
   - Error handling
   - Rate limiting

## Implementation Status

### Core Features
- [x] Text selection detection
- [x] Smart sentence detection
  - [x] Multi-language support (English, Japanese)
  - [x] Sentence boundary detection
  - [x] Length limit protection
- [x] Context extraction
- [x] Translation UI
- [x] Copy functionality
- [x] Language settings
  - [x] Source language selection
  - [x] Target language selection
  - [x] Language validation
  - [x] Settings persistence
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Settings management
- [ ] API key storage
- [ ] Rate limiting
- [ ] Backend service
- [ ] JSON response formatting

### Gemini API Integration
- [ ] API service implementation
- [ ] Context-aware prompts
- [ ] Error handling
- [ ] Rate limiting
- [ ] Settings integration
- [ ] Backend service
- [ ] JSON response formatting

### User Experience
- [ ] Clean UI design
- [ ] Loading states
- [ ] Error messages
- [ ] Copy functionality
- [ ] Responsive design
- [ ] Settings interface
- [ ] Language preferences
- [ ] Context settings
- [ ] UI customization

## Next Steps

### Testing
1. **Unit Testing**
   - [ ] Test Gemini service
   - [ ] Test sentence detection
     - [ ] Test different languages
     - [ ] Test boundary cases
     - [ ] Test length limits
   - [ ] Test context extraction
   - [ ] Test settings management
   - [ ] Test error handling

2. **Integration Testing**
   - [ ] Test content script
   - [ ] Test backend communication
   - [ ] Test settings sync
   - [ ] Test UI interactions

3. **End-to-End Testing**
   - [ ] Test complete flow
   - [ ] Test cross-browser
   - [ ] Test performance
   - [ ] Test error recovery

### Documentation
1. **User Guide**
   - [ ] Installation steps
   - [ ] Usage instructions
   - [ ] Troubleshooting
   - [ ] FAQ section

2. **API Documentation**
   - [ ] Backend API
   - [ ] Response formats
   - [ ] Error codes
   - [ ] Rate limits

3. **Development Guide**
   - [ ] Setup instructions
   - [ ] Code structure
   - [ ] Testing procedures
   - [ ] Deployment guide

### Performance Optimization
1. **Caching**
   - [ ] Translation cache
   - [ ] Cache invalidation
   - [ ] Storage management

2. **API Optimization**
   - [ ] Batch requests
   - [ ] Rate limiting
   - [ ] Error retry

## Requirements

### Development
- Chrome browser
- Python 3.8+
- Node.js 14+
- Gemini API key
- Git

### Production
- Chrome Web Store account
- Gemini API key
- Python hosting
- SSL certificate

## Installation

### Development Setup
1. Clone repository:
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

### Production Setup
1. Build extension:
   ```bash
   npm run build
   ```

2. Deploy backend:
   ```bash
   # Deploy to your preferred hosting service
   ```

3. Update API endpoint:
   - Update `services/gemini-service.js` with production URL
   - Update CORS settings in `backend/app.py`

4. Submit to Chrome Web Store:
   - Create developer account
   - Prepare store listing
   - Upload extension
   - Submit for review

## Development Guidelines

### Code Style
- Use ESLint for JavaScript
- Use Black for Python
- Follow Chrome extension best practices
- Write clear comments

### Testing
- Write unit tests
- Test cross-browser
- Test error cases
- Test performance

### Security
- Secure API key storage
- Use HTTPS
- Validate inputs
- Handle errors

### Performance
- Optimize API calls
- Use caching
- Minimize DOM operations
- Monitor memory usage

## Troubleshooting

### Common Issues
1. API Key Issues
   - Check key validity
   - Verify storage
   - Check permissions

2. Translation Issues
   - Check sentence detection
   - Check context
   - Verify language
   - Check API limits

3. UI Issues
   - Check CSS
   - Verify events
   - Test responsiveness

### Debugging
1. Chrome DevTools
   - Console logs
   - Network tab
   - Sources tab

2. Backend Logs
   - Check server logs
   - Monitor API calls
   - Track errors

## Contributing

### Setup
1. Fork repository
2. Create branch
3. Make changes
4. Run tests
5. Submit PR

### Guidelines
- Follow style guide
- Write tests
- Update docs
- Be descriptive

## License
MIT License - See LICENSE file 