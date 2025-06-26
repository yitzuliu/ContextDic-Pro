# Contributing to ContextDic Pro

We welcome contributions to ContextDic Pro! This guide will help you get started with contributing to our Chrome extension project.

## 🚀 **Getting Started**

### **Prerequisites**
- **Chrome Browser** (latest version)
- **Python 3.8+** for backend development
- **Node.js 14+** for build tools
- **Git** for version control
- **Gemini API Key** for testing

### **Development Setup**
1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/contextdic-pro.git
   cd contextdic-pro
   ```
3. **Set up backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Add your API key to .env
   ```
4. **Install frontend dependencies**:
   ```bash
   npm install
   ```

---

## 📁 **Project Structure**

```
ContextDic Pro/
├── docs/                    # 📚 Documentation
├── src/                     # 🔧 Extension source code
│   ├── background/         # Background service worker
│   ├── content/           # Content scripts
│   ├── popup/             # Extension popup
│   ├── settings/          # Settings page
│   └── services/          # Service modules
├── backend/                 # 🐍 Python backend API
├── assets/                  # 🎨 Static assets
└── scripts/                 # 🔨 Build scripts
```

---

## 🛠️ **Development Workflow**

### **Daily Development**
1. **Start backend**: `cd backend && python app.py`
2. **Load extension**: Chrome → Extensions → Load unpacked
3. **Make changes**: Edit source files
4. **Test changes**: Reload extension and test functionality
5. **Check console**: F12 → Console for any errors

### **Testing Changes**
1. **Reload extension**: Click reload button in Chrome extensions
2. **Test text selection**: Try on various websites
3. **Test popup**: Click extension icon and test features
4. **Test settings**: Verify configuration changes work
5. **Test API**: Use curl commands to test backend endpoints

---

## 🎯 **How to Contribute**

### **Types of Contributions**
- 🐛 **Bug Fixes**: Fix issues in existing functionality
- ✨ **New Features**: Add new capabilities to the extension
- 📚 **Documentation**: Improve guides and API documentation
- 🎨 **UI/UX**: Enhance user interface and experience
- ⚡ **Performance**: Optimize code and improve speed
- 🧪 **Testing**: Add test cases and improve coverage

### **Contribution Process**
1. **Check Issues**: Look for existing issues or create a new one
2. **Create Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Implement your changes with tests
4. **Commit Changes**: Use clear, descriptive commit messages
5. **Push Branch**: `git push origin feature/your-feature-name`
6. **Create PR**: Submit a pull request with description

---

## 📝 **Coding Guidelines**

### **JavaScript Style**
- **ES6+ Features**: Use modern JavaScript (async/await, arrow functions)
- **Naming**: Use camelCase for variables and functions
- **Comments**: Add JSDoc comments for functions
- **Error Handling**: Always include try/catch blocks
- **Chrome APIs**: Use chrome.* APIs consistently

### **Example Code Style**:
```javascript
/**
 * Translates text using the Gemini API
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<object>} Translation result
 */
async function translateText(text, targetLanguage) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'translate',
            text,
            targetLanguage
        });
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        return response;
    } catch (error) {
        console.error('Translation failed:', error);
        throw error;
    }
}
```

### **Python Style**
- **PEP 8**: Follow Python style guidelines
- **Type Hints**: Use type annotations where appropriate
- **Docstrings**: Add docstrings for functions and classes
- **Error Handling**: Use appropriate exception handling
- **Flask Patterns**: Follow Flask best practices

### **Example Python Style**:
```python
from typing import Dict, Any
from flask import request, jsonify

def handle_translation_request() -> Dict[str, Any]:
    """
    Handle translation API request with validation
    
    Returns:
        Dict containing translation result or error
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return {'error': 'Missing required field: text'}, 400
            
        # Process translation...
        return {'success': True, 'translatedText': result}
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return {'error': 'Translation failed'}, 500
```

---

## 🧪 **Testing Guidelines**

### **Manual Testing Checklist**
- [ ] Extension loads without errors
- [ ] Text selection translation works
- [ ] Popup interface functions correctly
- [ ] Settings save and load properly
- [ ] Backend API responds correctly
- [ ] Error handling works as expected

### **API Testing**
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test translation endpoint
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","targetLanguage":"zh"}'
```

### **Browser Testing**
- **Chrome**: Primary development browser
- **Edge**: Secondary compatibility testing
- **Different Websites**: Test on various sites (Wikipedia, news sites, etc.)
- **Different Text Types**: Test with various languages and content types

---

## 📋 **Pull Request Guidelines**

### **PR Title Format**
- `feat: add translation caching functionality`
- `fix: resolve popup positioning issue`
- `docs: update API reference documentation`
- `style: improve button hover animations`

### **PR Description Template**
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Style/UI improvement
- [ ] Performance optimization

## Testing
- [ ] Manual testing completed
- [ ] API endpoints tested
- [ ] Cross-browser testing done
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## 🔍 **Code Review Process**

### **What Reviewers Look For**
- **Functionality**: Does the code work as intended?
- **Style**: Does it follow project conventions?
- **Performance**: Is it efficient and optimized?
- **Security**: Are there any security concerns?
- **Documentation**: Is it properly documented?
- **Testing**: Is it adequately tested?

### **Addressing Review Comments**
1. **Read carefully**: Understand the feedback
2. **Ask questions**: Clarify if something is unclear
3. **Make changes**: Address all feedback points
4. **Update PR**: Push new commits to the same branch
5. **Respond**: Comment when you've addressed feedback

---

## 📚 **Resources**

### **Documentation**
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Google Gemini API](https://ai.google.dev/docs)

### **Project Documentation**
- [Quick Start Guide](./quick-start.md)
- [Development Guide](./development.md)
- [API Reference](./api-reference.md)
- [Architecture Overview](./architecture.md)

### **Useful Tools**
- **Chrome DevTools**: Extension debugging
- **Postman**: API testing
- **VSCode**: Recommended editor with Chrome extension support

---

## 🏆 **Recognition**

Contributors will be:
- **Listed in CONTRIBUTORS.md**: Recognition for all contributions
- **Mentioned in releases**: Credit in release notes
- **Badge eligibility**: Special contributor badges
- **Community recognition**: Featured in project communications

---

## 📞 **Getting Help**

### **Communication Channels**
- **GitHub Issues**: Technical questions and bug reports
- **GitHub Discussions**: General questions and ideas
- **Code Reviews**: Feedback on pull requests

### **Contact Information**
- **Project Maintainer**: [Your contact information]
- **Issue Tracker**: GitHub Issues
- **Documentation**: This docs/ directory

---

**Thank you for contributing to ContextDic Pro! Together we can build an amazing translation tool! 🚀** 