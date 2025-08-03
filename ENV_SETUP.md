# Academia Nexus - Environment Configuration

## Quick Setup

### 1. Configure Gemini AI (Optional but Recommended)

Copy the example environment file:
```bash
cp .env.example .env
```

Then edit `.env` file and replace `your_gemini_api_key_here` with your actual API key:
```env
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Get Your Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in your `.env` file

### 3. Run the Server

#### Option A: Using Setup Script (Recommended)
```bash
python setup_gemini_study.py
```

#### Option B: Direct Run
```bash
python unified_study_server.py
```

#### Option C: Check Configuration
```bash
python config.py
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | None | Your Gemini AI API key for unlimited topics |
| `SERVER_HOST` | 0.0.0.0 | Server host address |
| `SERVER_PORT` | 8081 | Server port number |
| `FALLBACK_ENABLED` | true | Enable fallback knowledge base |
| `LOG_LEVEL` | INFO | Logging level (DEBUG, INFO, WARNING, ERROR) |

## Server Status

### With AI Enabled (Gemini API Key Set)
✅ **Unlimited Topics**: AI can explain any academic subject  
✅ **Real-time Examples**: Current, relevant examples  
✅ **High Accuracy**: Advanced AI reasoning  
✅ **Fallback Support**: Always works even if AI fails  

### Without AI (Fallback Only)
📚 **5 Core Topics**: machine learning, data science, calculus, quantum physics, biology  
📚 **Reliable**: Always available, no API dependencies  
📚 **Fast**: Instant responses from knowledge base  

## Security Notes

- ✅ `.env` file is already in `.gitignore` - won't be committed to version control
- ✅ API keys are never logged or exposed in responses
- ✅ Configuration is loaded securely at startup
- ✅ Environment variables take precedence over `.env` file

## Troubleshooting

### "Gemini API key not found"
1. Check your `.env` file exists in the project root
2. Verify `GEMINI_API_KEY` is set correctly (no quotes needed)
3. Make sure you're running from the correct directory

### "AI service error"
1. Verify your API key is valid at https://aistudio.google.com/app/apikey
2. Check your internet connection
3. Server will automatically fall back to knowledge base

### Server won't start
1. Check if port 8081 is available: `netstat -ano | findstr :8081`
2. Try a different port: `python unified_study_server.py --port 8082`
3. Check Python dependencies are installed

## Files Structure

```
.env.example          # Template environment file
.env                  # Your actual environment file (not in git)
config.py             # Configuration management
unified_study_server.py  # Main server file
setup_gemini_study.py    # Interactive setup script
```

## Your React App

Your React study page will work immediately with or without AI:
- With AI: Unlimited topic coverage
- Without AI: 5 core topics with detailed explanations

The server automatically handles both cases seamlessly!
