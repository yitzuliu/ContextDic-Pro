# ContextDic Pro - User Guide

## 🎯 **Complete Feature Overview**

ContextDic Pro provides three main ways to translate text with AI-powered accuracy and context awareness.

---

## 📖 **Method 1: Text Selection Translation**

### **How to Use:**
1. **Browse any website** - The extension works on all websites
2. **Select text** - Highlight any text you want to translate
3. **Click the translation button** - A blue button appears next to your selection
4. **View translation** - See the result in an elegant popup with confidence indicators

### **Features:**
- **Smart Selection**: Automatically detects sentence boundaries
- **Context Awareness**: Uses surrounding text for better accuracy
- **Confidence Indicators**: Visual bars show translation reliability
- **Copy Functionality**: One-click copy with visual feedback
- **Translation Notes**: Additional context and insights

### **Pro Tips:**
- Select complete sentences for best results
- Include punctuation for better context detection
- The confidence score helps gauge translation quality

---

## 🚀 **Method 2: Extension Popup**

### **How to Access:**
1. **Click the ContextDic Pro icon** in your Chrome toolbar
2. **Type or paste text** in the quick translate box
3. **Select target language** from the dropdown
4. **Click "Translate"** or press Ctrl+Enter

### **Features:**
- **Quick Translation**: Fast translation without leaving your current page
- **Real-time Status**: Monitor backend connectivity and API status
- **Language Selection**: Choose from 11+ supported languages
- **Keyboard Shortcuts**: Ctrl+Enter for quick translation
- **Auto-resize**: Text box grows with your content

### **Status Indicators:**
- **Backend Status**: Shows "Connected" when API is available
- **API Key Status**: Shows "Configured" when properly set up
- **Premium Status**: Displays account type and features

---

## ⚙️ **Method 3: Settings Management**

### **How to Access:**
1. **Click the ContextDic Pro icon** → **Settings**
2. **Or right-click the extension icon** → **Options**

### **Configuration Options:**

#### **API Key Setup**
- **Option 1**: Configure in backend `.env` file
- **Option 2**: Set directly in extension settings
- **Flexible Support**: Extension automatically detects configuration method

#### **Language Preferences**
- **Source Language**: Auto-detect or specify (11 languages supported)
- **Target Language**: Choose your preferred translation language
- **Real-time Validation**: Settings tested immediately

#### **Advanced Settings**
- **Translation Context**: Enable/disable context awareness
- **UI Preferences**: Customize popup appearance
- **Premium Features**: Access ad-free experience and advanced features

---

## 🌍 **Supported Languages**

| Language | Code | Quality | Best Use Cases |
|----------|------|---------|----------------|
| **English** | `en` | ⭐⭐⭐⭐⭐ | Global communication |
| **Chinese (Simplified)** | `zh` | ⭐⭐⭐⭐⭐ | Business, travel |
| **Chinese (Traditional)** | `zh-TW` | ⭐⭐⭐⭐⭐ | Traditional content |
| **Japanese** | `ja` | ⭐⭐⭐⭐⭐ | Technical, cultural |
| **Korean** | `ko` | ⭐⭐⭐⭐⭐ | Business, entertainment |
| **French** | `fr` | ⭐⭐⭐⭐⭐ | Academic, diplomatic |
| **German** | `de` | ⭐⭐⭐⭐⭐ | Technical, business |
| **Spanish** | `es` | ⭐⭐⭐⭐⭐ | Global communication |
| **Italian** | `it` | ⭐⭐⭐⭐ | Cultural, artistic |
| **Portuguese** | `pt` | ⭐⭐⭐⭐ | Business, travel |
| **Russian** | `ru` | ⭐⭐⭐⭐ | Technical, political |

---

## 💡 **Advanced Features**

### **Translation Confidence Scoring**
- **Score Range**: 0.0 - 1.0 (higher = more confident)
- **Visual Indicators**: Color-coded progress bars
- **Interpretation**: 
  - 🟢 0.8-1.0: Excellent translation
  - 🟡 0.6-0.8: Good translation
  - 🟠 0.4-0.6: Fair translation
  - 🔴 0.0-0.4: Requires caution

### **Translation Notes**
- **Context Insights**: Why specific translations were chosen
- **Cultural Notes**: Important cultural considerations
- **Alternative Options**: Other possible translations
- **Usage Examples**: How to use translated terms

### **Copy & Share Features**
- **One-click Copy**: Copy translations to clipboard
- **Visual Feedback**: Confirmation when copied successfully
- **Format Preservation**: Maintains text formatting when possible

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **"No translation button appears"**
- ✅ Refresh the webpage after installing the extension
- ✅ Make sure the extension is enabled in Chrome
- ✅ Try selecting text more precisely

#### **"Backend disconnected" message**
- ✅ Start the backend service: `cd backend && python app.py`
- ✅ Check if backend is running on localhost:5000
- ✅ Verify Python virtual environment is activated

#### **"API Key not configured"**
- ✅ Add your Gemini API key to `backend/.env` file
- ✅ Or set it in extension settings
- ✅ Restart the backend after adding the key

#### **"Translation failed" errors**
- ✅ Check your internet connection
- ✅ Verify API key is valid and has quota remaining
- ✅ Try translating shorter text segments

### **Getting Help:**
- **Documentation**: Check [docs/](../docs/) for detailed guides
- **API Reference**: See [API Reference](./api-reference.md) for technical details
- **Development**: See [Development Guide](./development.md) for setup help

---

## 🚀 **Premium Features**

### **Available with Premium Subscription:**
- **Ad-free Experience**: No advertisements in popup or settings
- **Unlimited Translations**: No rate limiting restrictions
- **Translation History**: Save and access previous translations
- **Advanced Context**: Enhanced context awareness algorithms
- **Priority Support**: Faster response to support requests
- **Custom Themes**: Personalize the extension appearance

### **How to Upgrade:**
1. Click "🚀 Go Premium" in the extension popup
2. Choose monthly ($2.99) or yearly ($19.99) plan
3. Complete secure payment process
4. Enjoy premium features immediately

---

## 📊 **Usage Statistics**

### **Performance Tips:**
- **Optimal Text Length**: 10-200 words for best results
- **Context Matters**: Include surrounding sentences when possible
- **Language Detection**: Auto-detection works well for most languages
- **Translation Speed**: Most translations complete in 1-3 seconds

### **Quality Guidelines:**
- **Technical Text**: May require manual review for accuracy
- **Creative Content**: Consider cultural context in translations
- **Formal Documents**: Verify important translations independently
- **Slang/Colloquialisms**: May not translate perfectly

---

**Your powerful AI translation assistant is ready to help with any text, anywhere on the web! 🌐** 