# ContextDic Pro

A **professional Chrome extension** that provides context-aware translations using Google's Gemini AI with enterprise-grade features and monetization capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0+-red.svg)](https://flask.palletsprojects.com/)

---

## 🚀 **Quick Start**

**Get up and running in 10 minutes:**

1. **Get Gemini API key**: [Get API Key](https://makersuite.google.com/app/apikey)
2. **Configure backend**:
   ```bash
   cd backend && cp .env.example .env
   # Add your API key to .env file
   ```
3. **Start backend**: `python app.py`
4. **Load extension**: Chrome → Extensions → Load unpacked
5. **Start translating**: Select text on any webpage!

👉 **[Complete Quick Start Guide](./docs/quick-start.md)**

---

## ✨ **Key Features**

### 🎯 **Core Translation**
- **Smart text selection** with intelligent sentence boundary detection
- **Context-aware translations** for improved accuracy  
- **Multi-language support** (11+ languages)
- **Real-time translation** with floating UI elements
- **Confidence indicators** with visual feedback
- **Professional popup interface** for quick translations

### 💰 **Monetization Ready**
- **Google AdSense integration** with non-intrusive ads
- **Premium subscription system** ($2.99/month, $19.99/year)
- **Ad-free premium experience** with advanced features
- **Revenue optimization** with strategic ad placement
- **Chrome Web Store compliant** monetization

### 🛠️ **Enterprise Features**
- **Flexible API key management** (environment OR extension settings)
- **Real-time status monitoring** with health checks
- **Robust error handling** with categorized error types
- **Professional UI/UX** with loading states and animations
- **Secure architecture** with minimal permissions

---

## 📁 **Project Structure**

```
ContextDic Pro/
├── 📚 docs/                    # Complete documentation suite
│   ├── README.md              # Documentation index
│   ├── quick-start.md         # 10-minute setup guide
│   ├── user-guide.md          # Feature usage guide
│   ├── development.md         # Technical development guide
│   ├── api-reference.md       # Complete API documentation
│   ├── architecture.md        # System design overview
│   ├── monetization.md        # Revenue strategies
│   ├── adsense-setup.md       # AdSense configuration
│   ├── contributing.md        # Contribution guidelines
│   └── changelog.md           # Version history
├── 🔧 src/                     # Extension source code
│   ├── background/            # Background service worker
│   ├── content/              # Content scripts & styles
│   ├── popup/                # Extension popup interface
│   ├── settings/             # Settings configuration page
│   └── services/             # Service modules (Gemini, Ads)
├── 🐍 backend/                 # Python Flask API service
├── 🎨 assets/                  # Static assets (icons, etc.)
├── 🔨 scripts/                 # Build and utility scripts
├── manifest.json             # Chrome extension manifest
└── package.json              # Node.js dependencies
```

---

## 🌍 **Supported Languages**

| Language | Code | Quality | Language | Code | Quality |
|----------|------|---------|----------|------|---------|
| English | `en` | ⭐⭐⭐⭐⭐ | French | `fr` | ⭐⭐⭐⭐⭐ |
| Chinese (Simplified) | `zh` | ⭐⭐⭐⭐⭐ | German | `de` | ⭐⭐⭐⭐⭐ |
| Chinese (Traditional) | `zh-TW` | ⭐⭐⭐⭐⭐ | Spanish | `es` | ⭐⭐⭐⭐⭐ |
| Japanese | `ja` | ⭐⭐⭐⭐⭐ | Italian | `it` | ⭐⭐⭐⭐ |
| Korean | `ko` | ⭐⭐⭐⭐⭐ | Portuguese | `pt` | ⭐⭐⭐⭐ |
| Russian | `ru` | ⭐⭐⭐⭐ | | | |

---

## 📚 **Documentation Navigation**

### 👥 **For Users**
- **[Quick Start Guide](./docs/quick-start.md)** - Get running in 10 minutes
- **[User Guide](./docs/user-guide.md)** - Learn all features and capabilities
- **[Troubleshooting](./docs/user-guide.md#troubleshooting)** - Common issues and solutions

### 👩‍💻 **For Developers**
- **[Development Guide](./docs/development.md)** - Technical implementation details
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Architecture](./docs/architecture.md)** - System design and components
- **[Contributing](./docs/contributing.md)** - How to contribute to the project

### 💰 **For Monetization**
- **[Monetization Guide](./docs/monetization.md)** - Revenue strategies and implementation
- **[AdSense Setup](./docs/adsense-setup.md)** - Step-by-step AdSense configuration
- **[Revenue Optimization](./docs/monetization.md#revenue-optimization)** - Maximize earnings

### 📋 **Project Management**
- **[Roadmap](./docs/roadmap.md)** - Future development plans and phases
- **[Changelog](./docs/changelog.md)** - Version history and updates

---

## 🔧 **Technology Stack**

### **Frontend**
- **JavaScript ES6+** with async/await
- **Chrome Extensions API** (Manifest v3)
- **CSS3** with modern layouts and animations
- **HTML5** with semantic markup

### **Backend**
- **Python 3.8+** with type hints
- **Flask 3.0.0** lightweight web framework
- **Google Generative AI** (Gemini API)
- **Flask-CORS** for cross-origin support

### **Development Tools**
- **Node.js** for build scripts and tooling
- **Sharp** for image processing and icon generation
- **Git** for version control

---

## 📊 **Current Status**

| Component | Status | Completion |
|-----------|--------|------------|
| **Core Features** | ✅ Complete | 100% |
| **API Integration** | ✅ Complete | 100% |
| **User Experience** | ✅ Well Implemented | 90% |
| **Monetization** | ✅ Fully Implemented | 100% |
| **Documentation** | ✅ Comprehensive | 95% |
| **Production Ready** | ✅ Near Complete | 80% |

---

## 🚀 **Revenue Potential**

### **Estimated Monthly Revenue**
- **100 daily users**: $5-15/month
- **500 daily users**: $25-75/month  
- **1,000 daily users**: $50-150/month
- **5,000 daily users**: $250-750/month

### **Monetization Features**
- ✅ Google AdSense integration
- ✅ Premium subscription tiers
- ✅ Non-intrusive ad placement
- ✅ Chrome Web Store compliance
- ✅ Revenue optimization strategies

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details on:

- Setting up the development environment
- Code style guidelines
- Pull request process
- Testing procedures

---

## 📞 **Support & Resources**

- **Documentation**: [docs/](./docs/) directory
- **Issues**: [GitHub Issues](https://github.com/yourusername/contextdic-pro/issues)
- **API Help**: [Backend README](./backend/README.md)
- **Quick Setup**: [Quick Start Guide](./docs/quick-start.md)

---

**Made with ❤️ using Google's Gemini AI**

**🎉 Ready to start translating? Begin with the [Quick Start Guide](./docs/quick-start.md)!**

## 🔒 Security Notes

- Do not commit secrets (API keys, credentials) into this repository. Use `backend/.env.example` as a template and create a local `backend/.env` which must be added to `.gitignore`.
- If secrets are accidentally committed, rotate the keys immediately and purge them from git history (see `backend/README.md` for commands).
- Review `docs/` for privacy and data-retention policies before enabling analytics or production telemetry.