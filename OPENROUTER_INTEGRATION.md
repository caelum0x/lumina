# OpenRouter AI Integration

## Overview

Lumina 3D Modern Stellar Explorer now uses **OpenRouter** for AI-powered transaction analysis and insights. OpenRouter provides access to multiple AI models (Claude, GPT-4, Gemini, Llama, etc.) through a single API.

## How It Works

### Architecture

1. **OpenRouter Client** (`ui/business-logic/ai/openrouter-client.js`)
   - Handles API communication with OpenRouter
   - Manages API key and model selection
   - Implements caching (1-minute cache)
   - Provides fallback to rule-based analysis

2. **Transaction Pattern Analyzer** (`ui/business-logic/ai/transaction-pattern-analyzer.js`)
   - Tries AI analysis first (if API key available)
   - Falls back to rule-based analysis if AI fails or unavailable
   - Seamlessly switches between AI and rule-based modes

3. **AI Insights Panel** (`ui/views/components/ai-insights-panel.js`)
   - Displays AI-generated insights
   - Shows indicator when AI is active vs rule-based
   - Updates in real-time as transactions stream in

## Setup

### Option 1: Environment Variable (Recommended for Production)

Add to `ui/.env`:
```bash
REACT_APP_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
REACT_APP_OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

### Option 2: User Settings (Recommended for Development)

1. Navigate to `/settings` in the app
2. Scroll to "AI Configuration" section
3. Enter your OpenRouter API key
4. Select your preferred AI model
5. Click "Save Configuration"

The API key is stored locally in your browser (localStorage) and never sent to our servers.

### Option 3: Global Window Variable

For development/testing, you can set it globally:
```javascript
window.OPENROUTER_API_KEY = 'sk-or-v1-your-api-key-here'
```

## Getting an API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Go to [Keys page](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

## Supported Models

OpenRouter supports 100+ AI models. Popular options:

- **anthropic/claude-3.5-sonnet** (Default) - Best balance of quality and cost
- **openai/gpt-4** - Most capable, higher cost
- **openai/gpt-3.5-turbo** - Fast and affordable
- **google/gemini-pro** - Good alternative
- **meta-llama/llama-3-70b-instruct** - Open source option

View all models at [OpenRouter Models](https://openrouter.ai/models)

## Features

### AI-Powered Analysis

When OpenRouter is configured, the AI will:

1. **Analyze Transaction Patterns**
   - Detect whale movements and large transaction clusters
   - Identify arbitrage opportunities
   - Find unusual patterns and anomalies
   - Assess network health

2. **Generate Smart Insights**
   - Contextual explanations of patterns
   - Actionable recommendations
   - Risk assessments
   - Market trend analysis

3. **Provide Natural Language Explanations**
   - Human-readable insights
   - Detailed pattern descriptions
   - Network health assessments

### Fallback Behavior

If OpenRouter is not configured or fails:

- Automatically falls back to rule-based analysis
- No functionality is lost
- Seamless user experience
- Indicator shows "Rule-Based" instead of "AI Active"

## Privacy & Security

- **API Key Storage**: Stored locally in browser localStorage (if set via UI)
- **Data Sent**: Only transaction summaries (not full transaction data)
- **No Server Storage**: API keys are never sent to our servers
- **User Control**: Users can remove API key at any time
- **Caching**: Results cached for 1 minute to reduce API calls

## Cost Considerations

OpenRouter charges per API call based on the model used:

- **Claude 3.5 Sonnet**: ~$0.003 per analysis
- **GPT-4**: ~$0.03 per analysis
- **GPT-3.5 Turbo**: ~$0.001 per analysis

**Caching**: Results are cached for 1 minute, so repeated views of the same data don't incur additional costs.

**Recommendation**: Start with Claude 3.5 Sonnet for best quality/cost balance.

## API Request Format

The system sends transaction summaries to OpenRouter:

```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert blockchain analyst..."
    },
    {
      "role": "user",
      "content": "Analyze these transactions: [summary]"
    }
  ]
}
```

## Response Format

OpenRouter returns JSON with:

```json
{
  "whaleMovements": [...],
  "arbitrageOpportunities": [...],
  "unusualPatterns": [...],
  "networkHealth": {
    "healthScore": 85,
    "status": "healthy",
    "recommendations": [...]
  },
  "insights": [...]
}
```

## Troubleshooting

### AI Not Working

1. **Check API Key**: Verify it's set correctly in settings
2. **Check Console**: Look for error messages in browser console
3. **Check Network**: Ensure OpenRouter API is accessible
4. **Check Model**: Verify the model name is correct
5. **Check Credits**: Ensure your OpenRouter account has credits

### Fallback to Rule-Based

If you see "Rule-Based" badge:
- API key not configured
- API key invalid
- Network error
- API rate limit exceeded
- Model unavailable

The system will automatically use rule-based analysis in these cases.

## Configuration in Code

### Initialize OpenRouter Client

```javascript
import openRouterClient from './business-logic/ai/openrouter-client'

// Initialize with API key
openRouterClient.init('sk-or-v1-your-key', 'anthropic/claude-3.5-sonnet')

// Use in analyzer
const analysis = await openRouterClient.analyzeTransactions(transactions)
```

### Disable AI

To force rule-based analysis only:

```javascript
// In ai-insights-panel.js
const analyzedPatterns = await transactionAnalyzer.analyzePatterns(
    transactions, 
    3600000, 
    false // Set to false to disable AI
)
```

## Future Enhancements

- [ ] Model selection per analysis type
- [ ] Cost tracking and limits
- [ ] Batch analysis for historical data
- [ ] Custom prompts for specific use cases
- [ ] Multi-model ensemble analysis
- [ ] Fine-tuned models for Stellar-specific patterns

## Support

For issues with OpenRouter:
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Discord](https://discord.gg/openrouter)

For issues with Lumina integration:
- Check browser console for errors
- Verify API key is correct
- Ensure model name is valid
- Check network connectivity

