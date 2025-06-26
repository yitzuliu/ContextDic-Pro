# ContextDic Pro - Quick Start Checklist

## 🚀 Get Extension Working (30 minutes)

### Step 1: Environment Setup (5 min)
```bash
# 1. Create environment template
cd backend
echo "GEMINI_API_KEY=your_api_key_here" > .env.example
cp .env.example .env
# Edit .env and add your real Gemini API key

# 2. Generate missing icons
cd ..
npm install
npm run generate-icons
```

### Step 2: Fix Storage Issue (5 min)
- [ ] Edit `settings/settings.js` line 31: Change `chrome.storage.sync.get` to `chrome.storage.local.get`
- [ ] Edit `settings/settings.js` line 64: Change `chrome.storage.sync.set` to `chrome.storage.local.set`  
- [ ] Edit `settings/settings.js` line 81: Change `chrome.storage.sync.set` to `chrome.storage.local.set`

### Step 3: Test Backend (5 min)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
- Backend should start on http://localhost:5000
- Test API: `curl -X POST http://localhost:5000/api/translate -H "Content-Type: application/json" -d '{"text":"hello","targetLanguage":"zh"}'`

### Step 4: Load Extension (5 min)
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" 
4. Select your project folder
5. Check for errors in console

### Step 5: Quick Test (10 min)
1. Go to any webpage
2. Select some text
3. Click translation button
4. Check browser console for errors
5. Check if translation popup appears

---

## 🔧 Fix Critical Issues (2 hours)

### Priority 1: API Key Flow
**Problem**: Extension stores API key but backend reads from environment

**Solution Options**:
1. **Quick Fix**: Manually add API key to backend/.env
2. **Proper Fix**: Modify backend to accept API key in request headers

### Priority 2: Create Extension Popup
**Current Issue**: Popup directory is empty, no toolbar popup

**Create These Files**:
- `popup/popup.html` - Basic interface
- `popup/popup.js` - Settings link, quick translate
- `popup/popup.css` - Minimal styling

### Priority 3: Clean CSS Conflicts
**Problem**: Two different translation systems' CSS in content.css

**Fix**: Remove lines 1-176 (Woody styles), keep only ContextDic styles

---

## ⚡ Development Workflow

### Daily Development Cycle
1. **Start Backend**: `cd backend && python app.py`
2. **Reload Extension**: `chrome://extensions/` → Reload button
3. **Test on Website**: Select text → Check translation
4. **Check Console**: F12 → Console tab for errors

### Quick Testing Commands
```bash
# Test backend API
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","targetLanguage":"zh"}'

# Check extension logs
# Open Chrome DevTools on any page → Console → Filter by "contextdic"

# Regenerate icons after changes
npm run generate-icons
```

### Common Debug Points
- **No translation button**: Check content script loading
- **Button appears but no translation**: Check backend connectivity  
- **Backend errors**: Check API key in .env file
- **Settings not saving**: Check storage API calls
- **Icons not showing**: Run icon generation script

---

## 📋 Today's Action Items

**Must Do (Next 30 minutes)**:
- [ ] Create `.env` file with your Gemini API key
- [ ] Generate PNG icons from SVG
- [ ] Fix storage consistency in settings.js
- [ ] Test basic extension loading

**Should Do (Next 2 hours)**:
- [ ] Create extension popup interface
- [ ] Clean up CSS conflicts  
- [ ] Test complete translation flow
- [ ] Fix API key passing to backend

**Nice to Have (This week)**:
- [ ] Add proper error handling
- [ ] Improve UI responsiveness
- [ ] Add loading states
- [ ] Test on multiple websites

**Start with the "Must Do" items - they'll get your extension working immediately!** 