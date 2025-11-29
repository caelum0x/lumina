/**
 * AI-powered transaction pattern analyzer
 * Uses OpenRouter for AI analysis with rule-based fallback
 */

// Lazy load OpenRouter client to avoid circular dependencies
let openRouterClient = null
function getOpenRouterClient() {
    if (!openRouterClient && typeof window !== 'undefined') {
        try {
            // Dynamic import to avoid circular dependencies
            const module = require('./openrouter-client')
            openRouterClient = module.default || module
        } catch (e) {
            // OpenRouter not available, will use rule-based only
            return null
        }
    }
    return openRouterClient
}

class TransactionPatternAnalyzer {
    constructor() {
        this.patterns = new Map()
        this.anomalies = []
        this.insights = []
    }

    /**
     * Analyze transaction patterns using AI (OpenRouter) with fallback
     */
    async analyzePatterns(transactions, timeWindow = 3600000, useAI = true) {
        // Try AI analysis first if enabled and API key is available
        if (useAI) {
            const client = getOpenRouterClient()
            if (client && client.apiKey) {
                try {
                    const aiAnalysis = await client.analyzeTransactions(transactions, { timeWindow })
                    if (aiAnalysis && aiAnalysis.source !== 'rule-based-fallback') {
                        return aiAnalysis
                    }
                } catch (error) {
                    console.warn('AI analysis failed, falling back to rule-based:', error)
                }
            }
        }

        // Fallback to rule-based analysis
        return this.analyzePatternsRuleBased(transactions, timeWindow)
    }

    /**
     * Rule-based pattern analysis (fallback)
     */
    analyzePatternsRuleBased(transactions, timeWindow = 3600000) {
        if (!transactions || transactions.length === 0) {
            return {
                whaleMovements: [],
                arbitrageOpportunities: [],
                unusualPatterns: [],
                networkHealth: {
                    totalTransactions: 0,
                    successfulTransactions: 0,
                    failedTransactions: 0,
                    averageFee: 0,
                    averageAmount: 0,
                    uniqueAccountsCount: 0,
                    sorobanTransactions: 0,
                    successRate: 0,
                    healthScore: 0,
                    status: 'unhealthy',
                    recommendations: []
                }
            }
        }

        const now = Date.now()
        const recentTxs = transactions.filter(tx => {
            if (!tx) return false
            const txTime = tx.timestamp || tx.created_at
            if (!txTime) return true // Include transactions without timestamp
            try {
                return (now - new Date(txTime).getTime()) < timeWindow
            } catch (e) {
                return true // Include if timestamp parsing fails
            }
        })

        const patterns = {
            whaleMovements: this.detectWhaleMovements(recentTxs),
            arbitrageOpportunities: this.detectArbitrage(recentTxs),
            unusualPatterns: this.detectUnusualPatterns(recentTxs),
            networkHealth: this.analyzeNetworkHealth(recentTxs)
        }

        return patterns
    }

    /**
     * Detect whale movements (large transactions)
     */
    detectWhaleMovements(transactions) {
        const WHALE_THRESHOLD = 50000 // XLM
        const whales = transactions.filter(tx => {
            const amount = parseFloat(tx.amount || 0)
            return amount >= WHALE_THRESHOLD
        })

        // Group by source/destination
        const movements = new Map()
        whales.forEach(tx => {
            const key = `${tx.source_account || tx.source}->${tx.destination || 'unknown'}`
            if (!movements.has(key)) {
                movements.set(key, {
                    count: 0,
                    totalAmount: 0,
                    accounts: new Set()
                })
            }
            const movement = movements.get(key)
            movement.count++
            movement.totalAmount += parseFloat(tx.amount || 0)
            movement.accounts.add(tx.source_account || tx.source)
        })

        return Array.from(movements.entries()).map(([key, data]) => ({
            path: key,
            count: data.count,
            totalAmount: data.totalAmount,
            accounts: Array.from(data.accounts)
        }))
    }

    /**
     * Detect arbitrage opportunities
     */
    detectArbitrage(transactions) {
        // Look for rapid buy/sell patterns on same asset
        const assetTrades = new Map()
        
        transactions.forEach(tx => {
            if (tx.type === 'trade' || tx.operations?.some(op => op.type === 'manageSellOffer' || op.type === 'manageBuyOffer')) {
                const asset = tx.asset || tx.selling_asset || tx.buying_asset
                if (asset) {
                    if (!assetTrades.has(asset)) {
                        assetTrades.set(asset, [])
                    }
                    assetTrades.get(asset).push({
                        timestamp: tx.timestamp || tx.created_at,
                        price: tx.price,
                        amount: tx.amount,
                        type: tx.type
                    })
                }
            }
        })

        const opportunities = []
        assetTrades.forEach((trades, asset) => {
            // Sort by timestamp
            trades.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            
            // Look for price differences within short time window
            for (let i = 0; i < trades.length - 1; i++) {
                const current = trades[i]
                const next = trades[i + 1]
                const timeDiff = new Date(next.timestamp) - new Date(current.timestamp)
                
                if (timeDiff < 60000 && current.price && next.price) { // Within 1 minute
                    const priceDiff = Math.abs(parseFloat(next.price) - parseFloat(current.price))
                    const priceChangePercent = (priceDiff / parseFloat(current.price)) * 100
                    
                    if (priceChangePercent > 1) { // More than 1% price difference
                        opportunities.push({
                            asset,
                            opportunity: priceChangePercent > 0 ? 'buy_low_sell_high' : 'sell_high_buy_low',
                            priceChange: priceChangePercent,
                            timeWindow: timeDiff,
                            buyPrice: current.price,
                            sellPrice: next.price
                        })
                    }
                }
            }
        })

        return opportunities
    }

    /**
     * Detect unusual transaction patterns
     */
    detectUnusualPatterns(transactions) {
        const patterns = []

        // Rapid transactions from same account
        const accountFrequency = new Map()
        transactions.forEach(tx => {
            const account = tx.source_account || tx.source
            if (!accountFrequency.has(account)) {
                accountFrequency.set(account, [])
            }
            accountFrequency.get(account).push(tx.timestamp || tx.created_at)
        })

        accountFrequency.forEach((timestamps, account) => {
            if (timestamps.length > 10) {
                // Check if transactions are very rapid
                const sorted = timestamps.sort()
                const rapidCount = sorted.filter((ts, i) => {
                    if (i === 0) return false
                    const diff = new Date(ts) - new Date(sorted[i - 1])
                    return diff < 1000 // Less than 1 second apart
                }).length

                if (rapidCount > 5) {
                    patterns.push({
                        type: 'rapid_transactions',
                        account,
                        count: timestamps.length,
                        rapidCount,
                        severity: 'medium'
                    })
                }
            }
        })

        // Small amount spam
        const smallAmountSpam = transactions.filter(tx => {
            const amount = parseFloat(tx.amount || 0)
            return amount > 0 && amount < 0.1 // Very small amounts
        })

        if (smallAmountSpam.length > 50) {
            patterns.push({
                type: 'small_amount_spam',
                count: smallAmountSpam.length,
                severity: 'low'
            })
        }

        return patterns
    }

    /**
     * Analyze network health
     */
    analyzeNetworkHealth(transactions) {
        const stats = {
            totalTransactions: transactions.length,
            successfulTransactions: transactions.filter(tx => tx.successful !== false).length,
            failedTransactions: transactions.filter(tx => tx.successful === false).length,
            averageFee: 0,
            averageAmount: 0,
            uniqueAccounts: new Set(),
            sorobanTransactions: 0
        }

        let totalFees = 0
        let totalAmount = 0

        transactions.forEach(tx => {
            if (tx.fee_charged) {
                totalFees += parseFloat(tx.fee_charged)
            }
            if (tx.amount) {
                totalAmount += parseFloat(tx.amount)
            }
            if (tx.source_account) {
                stats.uniqueAccounts.add(tx.source_account)
            }
            if (tx.isSoroban || tx.source_account?.startsWith('C')) {
                stats.sorobanTransactions++
            }
        })

        stats.averageFee = stats.totalTransactions > 0 ? totalFees / stats.totalTransactions : 0
        stats.averageAmount = stats.totalTransactions > 0 ? totalAmount / stats.totalTransactions : 0
        stats.uniqueAccountsCount = stats.uniqueAccounts.size
        stats.successRate = stats.totalTransactions > 0 
            ? (stats.successfulTransactions / stats.totalTransactions) * 100 
            : 0

        // Health score (0-100)
        const healthScore = this.calculateHealthScore(stats)

        return {
            ...stats,
            healthScore,
            status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'unhealthy',
            recommendations: this.generateHealthRecommendations(stats)
        }
    }

    /**
     * Calculate network health score
     */
    calculateHealthScore(stats) {
        let score = 100

        // Penalize for high failure rate
        const failureRate = (stats.failedTransactions / stats.totalTransactions) * 100
        if (failureRate > 5) score -= 20
        else if (failureRate > 2) score -= 10

        // Penalize for low transaction volume
        if (stats.totalTransactions < 10) score -= 15

        // Bonus for Soroban activity
        const sorobanRatio = stats.sorobanTransactions / stats.totalTransactions
        if (sorobanRatio > 0.1) score += 5

        return Math.max(0, Math.min(100, score))
    }

    /**
     * Generate health recommendations
     */
    generateHealthRecommendations(stats) {
        const recommendations = []

        if (stats.successRate < 95) {
            recommendations.push({
                type: 'warning',
                message: `Transaction success rate is ${stats.successRate.toFixed(2)}%. Consider investigating failed transactions.`
            })
        }

        if (stats.averageFee > 10000) {
            recommendations.push({
                type: 'info',
                message: `Average fee is high (${(stats.averageFee / 1000000).toFixed(6)} XLM). Network may be experiencing congestion.`
            })
        }

        if (stats.sorobanTransactions / stats.totalTransactions > 0.2) {
            recommendations.push({
                type: 'success',
                message: `Strong Soroban activity detected (${((stats.sorobanTransactions / stats.totalTransactions) * 100).toFixed(1)}% of transactions).`
            })
        }

        return recommendations
    }

    /**
     * Generate smart insights (works with both AI and rule-based patterns)
     */
    generateInsights(transactions, patterns) {
        // If AI already provided insights, use them
        if (patterns.insights && Array.isArray(patterns.insights)) {
            return patterns.insights
        }

        // Otherwise generate from patterns
        const insights = []

        // Whale activity insight
        if (patterns.whaleMovements.length > 0) {
            const largestMovement = patterns.whaleMovements.reduce((max, m) => 
                m.totalAmount > max.totalAmount ? m : max
            , patterns.whaleMovements[0])

            insights.push({
                type: 'whale_activity',
                title: 'Large Whale Movement Detected',
                description: `${largestMovement.count} large transactions totaling ${(largestMovement.totalAmount / 1000000).toFixed(2)} XLM`,
                severity: 'high',
                timestamp: new Date().toISOString()
            })
        }

        // Arbitrage opportunity insight
        if (patterns.arbitrageOpportunities.length > 0) {
            const bestOpportunity = patterns.arbitrageOpportunities.reduce((best, opp) =>
                opp.priceChange > best.priceChange ? opp : best
            , patterns.arbitrageOpportunities[0])

            insights.push({
                type: 'arbitrage',
                title: 'Arbitrage Opportunity',
                description: `${bestOpportunity.asset} shows ${bestOpportunity.priceChange.toFixed(2)}% price difference`,
                severity: 'medium',
                timestamp: new Date().toISOString()
            })
        }

        // Network health insight
        if (patterns.networkHealth.healthScore < 70) {
            insights.push({
                type: 'network_health',
                title: 'Network Health Alert',
                description: `Network health score is ${patterns.networkHealth.healthScore}. ${patterns.networkHealth.status}`,
                severity: 'medium',
                recommendations: patterns.networkHealth.recommendations,
                timestamp: new Date().toISOString()
            })
        }

        return insights
    }
}

const analyzer = new TransactionPatternAnalyzer()

// Initialize OpenRouter on module load if API key is available
if (typeof window !== 'undefined') {
    try {
        const client = getOpenRouterClient()
        if (client) {
            const savedKey = localStorage.getItem('openrouter_api_key')
            const savedModel = localStorage.getItem('openrouter_model')
            if (savedKey) {
                client.init(savedKey, savedModel)
            }
        }
    } catch (e) {
        // OpenRouter not available, use rule-based only
    }
}

export default analyzer

