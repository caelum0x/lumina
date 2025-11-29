/**
 * AI-powered smart search
 * Provides natural language search and intelligent query understanding
 */

class SmartSearch {
    constructor() {
        this.searchHistory = []
        this.searchPatterns = new Map()
    }

    /**
     * Parse natural language search query
     */
    parseQuery(query) {
        const lowerQuery = query.toLowerCase().trim()

        // Detect search type
        const searchType = this.detectSearchType(lowerQuery)

        // Extract entities
        const entities = this.extractEntities(lowerQuery)

        // Extract filters
        const filters = this.extractFilters(lowerQuery)

        return {
            type: searchType,
            entities,
            filters,
            originalQuery: query
        }
    }

    /**
     * Detect search type from query
     */
    detectSearchType(query) {
        // Account search patterns
        if (query.match(/account|address|wallet|user/)) {
            return 'account'
        }

        // Transaction search patterns
        if (query.match(/transaction|tx|payment|transfer|sent|received/)) {
            return 'transaction'
        }

        // Asset search patterns
        if (query.match(/asset|token|coin|currency|usdc|usdt|xlm/)) {
            return 'asset'
        }

        // Ledger search patterns
        if (query.match(/ledger|block|sequence/)) {
            return 'ledger'
        }

        // Contract search patterns
        if (query.match(/contract|soroban|smart contract|function/)) {
            return 'contract'
        }

        // Default to general search
        return 'general'
    }

    /**
     * Extract entities from query
     */
    extractEntities(query) {
        const entities = {
            accounts: [],
            assets: [],
            amounts: [],
            dates: []
        }

        // Extract account addresses (Stellar format: G...)
        const accountMatches = query.match(/G[A-Z0-9]{55}/g)
        if (accountMatches) {
            entities.accounts = accountMatches
        }

        // Extract contract addresses (C...)
        const contractMatches = query.match(/C[A-Z0-9]{55}/g)
        if (contractMatches) {
            entities.contracts = contractMatches
        }

        // Extract amounts
        const amountMatches = query.match(/(\d+\.?\d*)\s*(xlm|usd|usdc|usdt)/gi)
        if (amountMatches) {
            entities.amounts = amountMatches.map(match => {
                const [value, unit] = match.split(/\s+/)
                return {value: parseFloat(value), unit: unit.toUpperCase()}
            })
        }

        // Extract dates
        const datePatterns = [
            /(today|yesterday)/i,
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
            /(\d{4})-(\d{2})-(\d{2})/,
            /last\s+(\d+)\s+(day|week|month|year)s?/i
        ]

        datePatterns.forEach(pattern => {
            const match = query.match(pattern)
            if (match) {
                entities.dates.push(match[0])
            }
        })

        return entities
    }

    /**
     * Extract filters from query
     */
    extractFilters(query) {
        const filters = {}

        // Amount filters
        if (query.match(/more than|greater than|above|over/)) {
            filters.minAmount = this.extractAmount(query)
        }
        if (query.match(/less than|below|under/)) {
            filters.maxAmount = this.extractAmount(query)
        }

        // Date filters
        if (query.match(/since|after|from/)) {
            filters.fromDate = this.extractDate(query)
        }
        if (query.match(/until|before|to/)) {
            filters.toDate = this.extractDate(query)
        }

        // Type filters
        if (query.match(/whale|large/)) {
            filters.type = 'whale'
        }
        if (query.match(/soroban|contract/)) {
            filters.type = 'soroban'
        }
        if (query.match(/failed|error/)) {
            filters.successful = false
        }

        return filters
    }

    /**
     * Extract amount from query
     */
    extractAmount(query) {
        const match = query.match(/(\d+\.?\d*)\s*(xlm|usd)/i)
        if (match) {
            return {
                value: parseFloat(match[1]),
                unit: match[2].toUpperCase()
            }
        }
        return null
    }

    /**
     * Extract date from query
     */
    extractDate(query) {
        // Simple date extraction - can be enhanced
        const today = new Date()
        if (query.match(/today/i)) {
            return today
        }
        if (query.match(/yesterday/i)) {
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            return yesterday
        }
        // Add more date parsing logic
        return null
    }

    /**
     * Generate search suggestions
     */
    generateSuggestions(query, history = []) {
        const suggestions = []

        // Add history suggestions
        history
            .filter(h => h.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .forEach(h => suggestions.push({type: 'history', value: h}))

        // Add type-based suggestions
        if (query.length > 0) {
            suggestions.push({type: 'account', value: `Search account: ${query}`})
            suggestions.push({type: 'transaction', value: `Search transaction: ${query}`})
            suggestions.push({type: 'asset', value: `Search asset: ${query}`})
        }

        return suggestions.slice(0, 10)
    }

    /**
     * Get search suggestions as simple strings
     */
    getSuggestions(query) {
        if (!query || query.trim().length === 0) {
            return []
        }

        const parsed = this.parseQuery(query)
        const suggestions = []

        // Based on detected type, suggest related searches
        if (parsed.type === 'account') {
            suggestions.push(`account ${query}`)
            suggestions.push(`transactions from ${query}`)
            suggestions.push(`assets held by ${query}`)
        } else if (parsed.type === 'transaction') {
            suggestions.push(`transaction ${query}`)
            suggestions.push(`payment ${query}`)
        } else if (parsed.type === 'asset') {
            suggestions.push(`asset ${query}`)
            suggestions.push(`markets for ${query}`)
            suggestions.push(`holders of ${query}`)
        } else if (parsed.type === 'ledger') {
            suggestions.push(`ledger ${query}`)
            suggestions.push(`transactions in ledger ${query}`)
        } else {
            // General suggestions
            suggestions.push(`account ${query}`)
            suggestions.push(`transaction ${query}`)
            suggestions.push(`asset ${query}`)
        }

        // Add from search history
        const history = JSON.parse(localStorage.getItem('lumina_search_history') || '[]')
        history
            .filter(h => h.toLowerCase().includes(query.toLowerCase()) && h !== query)
            .slice(0, 3)
            .forEach(h => suggestions.push(h))

        return [...new Set(suggestions)].slice(0, 5) // Remove duplicates and limit
    }

    /**
     * Learn from search patterns
     */
    learnPattern(query, results) {
        const pattern = this.parseQuery(query)
        const success = results.length > 0

        if (!this.searchPatterns.has(pattern.type)) {
            this.searchPatterns.set(pattern.type, {
                successful: 0,
                failed: 0,
                commonTerms: new Map()
            })
        }

        const patternData = this.searchPatterns.get(pattern.type)
        if (success) {
            patternData.successful++
        } else {
            patternData.failed++
        }

        // Track common terms
        query.split(/\s+/).forEach(term => {
            if (term.length > 2) {
                const count = patternData.commonTerms.get(term) || 0
                patternData.commonTerms.set(term, count + 1)
            }
        })
    }
}

export default new SmartSearch()

