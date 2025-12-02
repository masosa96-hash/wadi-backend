# Groq LLM Provider Migration Guide

## ✅ Migration Complete

WADI has been successfully migrated from OpenAI to **Groq** as the primary LLM provider.

## 🚀 Why Groq?

- **Faster inference**: Groq provides extremely fast response times
- **Cost-effective**: Much cheaper than OpenAI for similar quality
- **Open models**: Uses Llama and other open-source models
- **OpenAI-compatible API**: Drop-in replacement with minimal code changes

## 📝 Changes Made

### 1. Environment Variables

**New Required Variables:**

- `GROQ_API_KEY` - Your Groq API key (get it from console.groq.com)
- `GROQ_DEFAULT_MODEL` - Default: `llama-3.1-8b-instant`

**Now Optional (Fallback):**

- `OPENAI_API_KEY` - Only needed for embeddings and image analysis
- `OPENAI_DEFAULT_MODEL` - Default: `gpt-3.5-turbo`

### 2. Supported Groq Models

**Recommended for Production:**

- `llama-3.1-8b-instant` - Fast, cheap, good quality (default)
- `llama-3.3-70b-versatile` - Higher quality, slower, more expensive

**Also Available:**

- `mixtral-8x7b-32768` - Long context window
- `gemma-7b-it` - Smaller, faster model

### 3. Architecture Changes

**Files Modified:**

- `.env.example` - Added Groq variables
- `apps/api/src/config/env-validator.ts` - Groq now required, OpenAI optional
- `apps/api/src/services/openai.ts` - Renamed to LLM client, uses Groq baseURL
- `apps/api/src/services/vector-memory.ts` - Uses OpenAI client for embeddings
- `apps/api/src/services/ai-tools/image-tool.ts` - Uses OpenAI client for vision
- `apps/api/src/index.ts` - Updated health check comments

**Key Implementation Details:**

```typescript
// Primary LLM client (Groq)
const llmClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Secondary client for OpenAI-specific features (optional)
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
```

### 4. What Still Uses OpenAI?

- **Embeddings** (`text-embedding-3-small`) - Groq doesn't support embeddings yet
- **Image Analysis** (GPT-4 Vision) - Groq doesn't support vision models yet

These features will gracefully degrade if `OPENAI_API_KEY` is not set.

## 🔧 Setup Instructions

### Local Development

1. **Get a Groq API Key:**
   - Visit https://console.groq.com
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key

2. **Update your `.env` file:**

   ```env
   # Required
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_DEFAULT_MODEL=llama-3.1-8b-instant

   # Optional (for embeddings & image analysis)
   OPENAI_API_KEY=sk-your_openai_key_here
   OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
   ```

3. **Test locally:**

   ```bash
   pnpm dev:api

   # Test health check
   curl http://localhost:4000/api/health

   # Expected response:
   # {
   #   "status": "ok",
   #   "supabase": "connected",
   #   "openai": "connected",  // Actually checking Groq now
   #   "timestamp": "..."
   # }
   ```

### Railway Deployment

1. **Set Environment Variables in Railway:**
   - Go to your Railway project
   - Select the API service
   - Navigate to Variables tab
   - Add the following:

   ```
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_DEFAULT_MODEL=llama-3.1-8b-instant
   ```

2. **Optional OpenAI Variables:**
   If you want embeddings and image analysis to work:

   ```
   OPENAI_API_KEY=sk_your_openai_key_here
   OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
   ```

3. **Redeploy:**
   - Push your changes to trigger automatic deployment
   - OR click "Deploy" in Railway dashboard

4. **Verify Deployment:**
   ```bash
   curl https://your-railway-app.railway.app/api/health
   ```

## 🧪 Testing

### Quick Smoke Test

```bash
# Health check
curl http://localhost:4000/api/health

# Test chat endpoint (requires authentication)
curl -X POST http://localhost:4000/api/chat/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hello, testing Groq!",
    "workspaceId": "YOUR_WORKSPACE_ID"
  }'
```

### Expected Behavior

✅ **Chat responses** - Now powered by Groq (faster, cheaper)
✅ **Streaming** - Works identically with Groq
✅ **Health check** - Shows "connected" for both Supabase and LLM
⚠️ **Embeddings** - Require OPENAI_API_KEY
⚠️ **Image analysis** - Requires OPENAI_API_KEY

## 📊 Performance Comparison

| Feature    | OpenAI (GPT-3.5) | Groq (Llama 3.1) |
| ---------- | ---------------- | ---------------- |
| Speed      | ~2-4s            | ~0.5-1s          |
| Cost       | $0.50/1M tokens  | $0.05/1M tokens  |
| Quality    | Excellent        | Very Good        |
| Max Tokens | 4096             | 8192             |

## 🔒 Security Notes

- **Never commit API keys** to the repository
- Keys are in `.env` (which is `.gitignore`d)
- Use Railway's environment variables for production
- Rotate keys regularly
- Monitor usage at console.groq.com

## 🐛 Troubleshooting

### "Missing Groq API key" error

- Check your `.env` file has `GROQ_API_KEY`
- Verify the key is valid at console.groq.com
- In Railway, check Variables tab

### Health check shows "degraded"

- Check Railway logs for specific errors
- Verify `GROQ_API_KEY` is set correctly
- Test with `curl` to see full error response

### Embeddings not working

- Add `OPENAI_API_KEY` to your environment
- Groq doesn't support embeddings yet
- This is expected if only using Groq

## 📚 Resources

- **Groq Console**: https://console.groq.com
- **Groq Docs**: https://console.groq.com/docs
- **API Compatibility**: https://console.groq.com/docs/openai
- **Model Playground**: https://console.groq.com/playground

## 🎯 Next Steps

1. ✅ Get Groq API key from console.groq.com
2. ✅ Update local `.env` with `GROQ_API_KEY`
3. ✅ Test locally with `pnpm dev:api`
4. ✅ Set Railway environment variables
5. ✅ Deploy and verify health check
6. ✅ Test chat functionality
7. 📊 Monitor costs and performance

## 💡 Tips

- Start with `llama-3.1-8b-instant` for development
- Upgrade to `llama-3.3-70b-versatile` if you need better quality
- Keep `OPENAI_API_KEY` for advanced features (embeddings, vision)
- Monitor your usage at console.groq.com
- Groq's free tier is very generous for testing

---

**Migration completed**: November 2024
**Primary LLM**: Groq (Llama 3.1)
**Fallback**: OpenAI (for embeddings & vision only)
