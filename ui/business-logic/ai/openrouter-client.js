/**
 * OpenRouter API Client
 * Provides AI-powered analysis using OpenRouter (access to multiple AI models)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet' // Can be changed to any OpenRouter model

class OpenRouterClient {
    constructor() {
        this.apiKey = null
        this.model = DEFAULT_MODEL
        this.cache = new Map()
        this.cacheTimeout = 60000 // 1 minute cache
    }

    /**
     * Initialize with API key
     * @param {string} apiKey - OpenRouter API key
     * @param {string} model - Model to use (optional)
     */
    init(apiKey = null, model = null) {
        // Try to get API key from various sources
        this.apiKey = apiKey || 
                      (typeof process !== 'undefined' && process.env && process.env.REACT_APP_OPENROUTER_API_KEY) || 
                      (typeof window !== 'undefined' && window.OPENROUTER_API_KEY) ||
                      null
        
        if (model) {
            this.model = model
        } else if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_OPENROUTER_MODEL) {
            this.model = process.env.REACT_APP_OPENROUTER_MODEL
        }
        
        return !!this.apiKey
    }

    /**
     * Analyze transactions using AI
     * @param {Array} transactions - Array of transaction objects
     * @param {Object} options - Analysis options
     * @return {Promise<Object>} AI analysis results
     */
    async analyzeTransactions(transactions, options = {}) {
        if (!this.apiKey) {
            console.warn('OpenRouter API key not set. Falling back to rule-based analysis.')
            return this.fallbackAnalysis(transactions)
        }

        // Check cache
        const cacheKey = this.getCacheKey(transactions)
        const cached = this.cache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data
        }

        try {
            // Prepare transaction summary for AI
            const summary = this.prepareTransactionSummary(transactions)
            
            const prompt = this.buildAnalysisPrompt(summary, options)
            
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Lumina 3D Stellar Explorer'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert blockchain analyst specializing in the Stellar network. 
                            Analyze transaction patterns and provide insights about:
                            - Whale movements (large transactions)
                            - Arbitrage opportunities
                            - Unusual patterns or anomalies
                            - Network health indicators
                            - Market trends
                            
                            Respond in JSON format with the following structure:
                            {
                                "whaleMovements": [...],
                                "arbitrageOpportunities": [...],
                                "unusualPatterns": [...],
                                "networkHealth": {
                                    "healthScore": 0-100,
                                    "status": "healthy|degraded|unhealthy",
                                    "recommendations": [...]
                                },
                                "insights": [...]
                            }`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            })

            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response from OpenRouter API')
            }

            const content = data.choices[0].message.content
            
            // Parse JSON response
            let analysis
            try {
                // Extract JSON from markdown code blocks if present
                const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                                 content.match(/(\{[\s\S]*\})/)
                const jsonStr = jsonMatch ? jsonMatch[1] : content
                analysis = JSON.parse(jsonStr)
            } catch (parseError) {
                console.error('Failed to parse AI response:', parseError, content)
                return this.fallbackAnalysis(transactions)
            }

            // Add source indicator
            analysis.source = 'ai-openrouter'

            // Cache the result
            this.cache.set(cacheKey, {
                data: analysis,
                timestamp: Date.now()
            })

            return analysis

        } catch (error) {
            console.error('OpenRouter API error:', error)
            // Fallback to rule-based analysis
            return this.fallbackAnalysis(transactions)
        }
    }

    /**
     * Prepare transaction summary for AI analysis
     */
    prepareTransactionSummary(transactions) {
        if (!transactions || transactions.length === 0) {
            return { count: 0, transactions: [] }
        }

        // Limit to most recent/relevant transactions
        const recentTxs = transactions.slice(-100).map(tx => ({
            id: tx.id || tx.hash,
            amount: parseFloat(tx.amount || 0),
            fee: parseInt(tx.fee_charged || tx.fee_paid || 0, 10),
            source: tx.source_account || tx.source,
            destination: tx.destination || tx.operations?.[0]?.destination,
            timestamp: tx.timestamp || tx.created_at,
            successful: tx.successful !== false,
            isSoroban: tx.isSoroban || (tx.source_account || '').startsWith('C'),
            type: tx.type || 'payment'
        }))

        // Calculate statistics
        const stats = {
            total: recentTxs.length,
            totalAmount: recentTxs.reduce((sum, tx) => sum + tx.amount, 0),
            averageAmount: recentTxs.length > 0 
                ? recentTxs.reduce((sum, tx) => sum + tx.amount, 0) / recentTxs.length 
                : 0,
            successRate: recentTxs.length > 0
                ? (recentTxs.filter(tx => tx.successful).length / recentTxs.length) * 100
                : 0,
            whaleCount: recentTxs.filter(tx => tx.amount > 50000).length,
            sorobanCount: recentTxs.filter(tx => tx.isSoroban).length,
            uniqueAccounts: new Set(recentTxs.map(tx => tx.source)).size
        }

        return {
            stats,
            sampleTransactions: recentTxs.slice(0, 20), // Send sample for context
            timeRange: {
                start: recentTxs[0]?.timestamp,
                end: recentTxs[recentTxs.length - 1]?.timestamp
            }
        }
    }

    /**
     * Build analysis prompt
     */
    buildAnalysisPrompt(summary, options) {
        return `Analyze the following Stellar network transaction data:

Statistics:
- Total Transactions: ${summary.stats.total}
- Total Volume: ${(summary.stats.totalAmount / 1000000).toFixed(2)} XLM
- Average Amount: ${(summary.stats.averageAmount / 1000000).toFixed(6)} XLM
- Success Rate: ${summary.stats.successRate.toFixed(2)}%
- Whale Transactions (>50k XLM): ${summary.stats.whaleCount}
- Soroban Transactions: ${summary.stats.sorobanCount}
- Unique Accounts: ${summary.stats.uniqueAccounts}

Sample Transactions:
${JSON.stringify(summary.sampleTransactions, null, 2)}

Time Range: ${summary.timeRange.start} to ${summary.timeRange.end}

Please provide:
1. Whale movement analysis (large transactions and their patterns)
2. Arbitrage opportunities (price differences, trading patterns)
3. Unusual patterns (rapid transactions, spam, anomalies)
4. Network health assessment (0-100 score with status)
5. Actionable insights and recommendations

Respond in JSON format only.`
    }

    /**
     * Fallback to rule-based analysis if AI fails
     */
    fallbackAnalysis(transactions) {
        // Import the rule-based analyzer as fallback
        try {
            const ruleBasedAnalyzer = require('./transaction-pattern-analyzer').default
            const patterns = ruleBasedAnalyzer.analyzePatternsRuleBased(transactions)
            const insights = ruleBasedAnalyzer.generateInsights(transactions, patterns)
            
            return {
                ...patterns,
                insights,
                source: 'rule-based-fallback'
            }
        } catch (e) {
            console.error('Fallback analysis failed:', e)
            return {
                whaleMovements: [],
                arbitrageOpportunities: [],
                unusualPatterns: [],
                networkHealth: {
                    healthScore: 0,
                    status: 'unhealthy',
                    recommendations: []
                },
                insights: [],
                source: 'error'
            }
        }
    }

    /**
     * Generate cache key from transactions
     */
    getCacheKey(transactions) {
        if (!transactions || transactions.length === 0) return 'empty'
        const ids = transactions.slice(-50).map(tx => tx.id || tx.hash).join(',')
        return ids.substring(0, 100) // Limit key length
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear()
    }
}

export default new OpenRouterClient()

