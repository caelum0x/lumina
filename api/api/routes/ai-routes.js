const express = require('express')
const router = express.Router()

router.post('/ai/analyze', async (req, res) => {
    try {
        const {query, results, context} = req.body
        const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
        
        if (!apiKey) {
            return res.json({
                insights: 'AI analysis not configured. Add OPENROUTER_API_KEY to environment.',
                summary: 'Configure AI to enable insights.',
                recommendations: []
            })
        }

        const prompt = `Analyze this Stellar blockchain search query and results:

Query: ${query}
Results: ${JSON.stringify(results, null, 2)}
Context: ${context || 'General search'}

Provide:
1. Brief summary of what was found
2. Key insights about the account/transaction/asset
3. Risk assessment if applicable
4. 2-3 actionable recommendations

Keep response concise and technical.`

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3.5-sonnet',
                messages: [{role: 'user', content: prompt}],
                max_tokens: 500
            })
        })

        const data = await response.json()
        const analysis = data.choices?.[0]?.message?.content || 'Analysis unavailable'

        res.json({
            insights: analysis,
            summary: analysis.split('\n')[0],
            recommendations: analysis.split('\n').filter(l => l.match(/^\d\.|^-/)).slice(0, 3)
        })
    } catch (e) {
        console.error('AI analysis error:', e)
        res.json({
            insights: 'Analysis temporarily unavailable',
            summary: 'Please try again',
            recommendations: []
        })
    }
})

module.exports = router
