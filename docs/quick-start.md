# ContextDic Pro - Quick Start Guide

## 🚀 Get Extension Working (10 minutes)

✅ **All setup files are already created and ready!**

### Step 1: Get Your API Key (2 min)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account  
3. Click "Create API Key"
4. Copy the generated key (starts with `AIza...`)

### Step 2: Configure Backend (3 min)
```bash
cd backend
cp .env.example .env
# Edit .env file and replace 'your_gemini_api_key_here' with your actual API key
nano .env  # or use any text editor
```

### Step 3: Start Backend (3 min)
```bash
# Install dependencies (first time only)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the backend service
python app.py
```
✅ **You should see**: `Running on http://127.0.0.1:5000`

### Step 4: Load Extension (2 min)
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked" 
4. Select your **project root directory**
5. ✅ ContextDic Pro should appear in your extensions!

### Step 5: Test Everything! (2 min)
**Method 1: Text Selection**
1. Go to any webpage
2. Select some text
3. Click the blue translation button
4. ✅ See translation with confidence indicator!

**Method 2: Extension Popup**  
1. Click ContextDic Pro icon in toolbar
2. Type text in quick translate box
3. ✅ See real-time status indicators!

**Method 3: Check Status**
- Backend status should show "Connected" 
- API Key status should show "Configured"

---

## ⚡ Development Workflow

### Daily Development Cycle
1. **Start Backend**: `cd backend && python app.py`
2. **Reload Extension**: `chrome://extensions/` → Reload button
3. **Test on Website**: Select text → Check translation
4. **Check Console**: F12 → Console tab for errors

### Quick Testing Commands
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test backend status  
curl http://localhost:5000/api/status

# Test translation API
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","targetLanguage":"zh"}'
```

### Troubleshooting Guide
- **Backend won't start**: Check if Python virtual environment is activated
- **"API Key not configured"**: Verify API key is correctly added to `.env` file
- **Extension not loading**: Check Chrome extensions page for error messages
- **No translation button**: Refresh webpage after loading extension
- **Popup shows "Disconnected"**: Make sure backend is running on localhost:5000

---

## 🎉 **Next Steps**

✅ **Your ContextDic Pro extension is now fully functional!**

**Ready for:**
- Testing and refinement
- Chrome Web Store submission
- AdSense monetization setup
- Production deployment

**For more details, see:**
- [User Guide](./user-guide.md) - Learn all features
- [Development Guide](./development.md) - Technical details
- [Monetization Guide](./monetization.md) - Start earning revenue 