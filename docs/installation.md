# ContextDic Pro - Installation Guide

This comprehensive guide covers all installation methods and setup scenarios for ContextDic Pro.

---

## 🚀 **Method 1: Quick Installation (Recommended)**

**⏱️ Setup Time: 10 minutes**

### **Step 1: Prerequisites**
- **Chrome Browser** (version 88 or later)
- **Python 3.8+** installed on your system
- **Internet connection** for API key setup

### **Step 2: Get Gemini API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key (format: `AIza...`)
5. **Save it securely** - you'll need it in Step 4

### **Step 3: Download and Setup**
```bash
# Clone the repository
git clone https://github.com/yourusername/contextdic-pro.git
cd contextdic-pro

# Setup backend environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### **Step 4: Configure API Key**
```bash
# Create environment file
cp .env.example .env

# Edit .env file and add your API key
nano .env  # or use any text editor
```

**Add this line to `.env`:**
```
GEMINI_API_KEY=your_actual_api_key_here
```

### **Step 5: Start Backend Service**
```bash
python app.py
```
✅ **Success indicator**: You should see `Running on http://127.0.0.1:5000`

### **Step 6: Load Chrome Extension**
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select the **ContextDic Pro project root directory**
6. ✅ Extension should appear in your extensions list

### **Step 7: Test Installation**
1. Go to any webpage (e.g., Wikipedia)
2. Select some text
3. Look for a blue translation button
4. Click it to test translation

**🎉 Installation Complete!**

---

## 🔧 **Method 2: Developer Installation**

**For contributors and developers who need full development setup.**

### **Additional Prerequisites**
- **Node.js 14+** for build tools
- **Git** for version control
- **Text Editor** (VSCode recommended)

### **Complete Development Setup**
```bash
# Clone and setup
git clone https://github.com/yourusername/contextdic-pro.git
cd contextdic-pro

# Install frontend dependencies
npm install

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Add your API key to .env

# Generate icons (if needed)
cd ..
npm run generate-icons
```

### **Development Workflow**
```bash
# Start backend (Terminal 1)
cd backend
source venv/bin/activate
python app.py

# Monitor changes (Terminal 2)
# No build process needed - reload extension in Chrome
```

---

## 🔑 **Method 3: Extension-Only Setup**

**Use extension settings instead of backend .env file.**

### **When to Use:**
- You prefer GUI configuration
- Backend environment setup is challenging
- You want portable configuration

### **Setup Steps:**
1. **Skip backend .env configuration**
2. **Load extension** (Steps 6-7 from Method 1)
3. **Start backend** without API key: `python app.py`
4. **Configure via extension**:
   - Click ContextDic Pro icon → Settings
   - Enter your Gemini API key
   - Select preferred languages
   - Click "Save Settings"

### **Benefits:**
- ✅ No backend file editing required
- ✅ Settings travel with extension
- ✅ Easy to update API key
- ✅ Visual configuration interface

---

## 🐍 **Method 4: Production Backend Setup**

**For hosting the backend service on a server.**

### **Server Requirements**
- **Python 3.8+**
- **HTTPS support** (required for extension communication)
- **Domain name** or static IP
- **Port 5000** (or custom port)

### **Production Setup**
```bash
# On your server
git clone https://github.com/yourusername/contextdic-pro.git
cd contextdic-pro/backend

# Create production environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure for production
cp .env.example .env
# Add your API key and production settings
```

### **Production Environment Variables**
```bash
# .env file for production
GEMINI_API_KEY=your_api_key_here
FLASK_ENV=production
CORS_ORIGINS=chrome-extension://*
PORT=5000
HOST=0.0.0.0
```

### **Start Production Service**
```bash
# Using gunicorn (recommended)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or using Flask development server
python app.py
```

### **Update Extension Configuration**
Edit `src/services/gemini-service.js`:
```javascript
// Change API_BASE_URL to your production server
const API_BASE_URL = 'https://your-domain.com:5000';
```

---

## 🛠️ **Troubleshooting Installation**

### **Common Issues:**

#### **"Backend won't start"**
```bash
# Check Python version
python --version  # Should be 3.8+

# Check virtual environment
which python  # Should point to venv/bin/python

# Check dependencies
pip list | grep -i flask  # Should show Flask 3.0+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### **"Extension won't load"**
- ✅ Check Chrome version (88+)
- ✅ Enable Developer mode in extensions
- ✅ Select the correct directory (project root)
- ✅ Look for error messages in extensions page
- ✅ Check manifest.json syntax

#### **"API Key not working"**
```bash
# Test API key directly
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### **"Translation button doesn't appear"**
- ✅ Refresh webpage after loading extension
- ✅ Try selecting text more precisely
- ✅ Check if extension is enabled
- ✅ Look for console errors (F12 → Console)

#### **"Backend shows disconnected"**
```bash
# Test backend health
curl http://localhost:5000/api/health

# Check if backend is running
ps aux | grep python  # Look for app.py process

# Check port availability
lsof -i :5000  # Should show Python process
```

---

## 🔧 **Advanced Configuration**

### **Custom Backend Port**
```bash
# In backend/.env
PORT=8080

# Update extension service
# Edit src/services/gemini-service.js
const API_BASE_URL = 'http://localhost:8080';
```

### **CORS Configuration**
```bash
# In backend/.env
CORS_ORIGINS=chrome-extension://*,http://localhost:*,https://yourdomain.com
```

### **Rate Limiting**
```bash
# In backend/.env
RATE_LIMIT_PER_MINUTE=100
```

---

## 📋 **Installation Verification**

### **Checklist:**
- [ ] Python backend starts without errors
- [ ] Chrome extension loads successfully  
- [ ] API key is configured (backend OR extension)
- [ ] Translation button appears on text selection
- [ ] Popup interface shows "Connected" status
- [ ] Test translation works end-to-end
- [ ] Settings page is accessible
- [ ] No console errors in browser

### **Test Commands:**
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test status endpoint
curl http://localhost:5000/api/status

# Test translation
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","targetLanguage":"zh"}'
```

### **Expected Responses:**
- **Health**: `{"success": true, "status": "healthy"}`
- **Status**: `{"success": true, "backend_running": true}`
- **Translation**: Valid JSON with translated text

---

## 📞 **Getting Help**

### **If you're stuck:**
1. **Check our guides**:
   - [Quick Start Guide](./quick-start.md) - Fastest setup method
   - [User Guide](./user-guide.md) - How to use features
   - [Development Guide](./development.md) - Technical details

2. **Common solutions**:
   - Restart backend service
   - Reload Chrome extension
   - Check API key validity
   - Clear browser cache

3. **Contact support**:
   - GitHub Issues for bug reports
   - Documentation for guides
   - API Reference for technical details

---

**🚀 Ready to start translating? Your ContextDic Pro extension should now be fully functional!** 