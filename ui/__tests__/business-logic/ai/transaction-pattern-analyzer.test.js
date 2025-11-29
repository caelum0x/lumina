import transactionAnalyzer from '../../../../business-logic/ai/transaction-pattern-analyzer'

describe('Transaction Pattern Analyzer', () => {
    const mockTransactions = [
        {
            id: 'tx1',
            amount: 60000,
            source_account: 'GWHALE1',
            destination: 'GWHALE2',
            timestamp: new Date().toISOString(),
            successful: true
        },
        {
            id: 'tx2',
            amount: 100,
            source_account: 'GNORMAL',
            destination: 'GNORMAL2',
            timestamp: new Date().toISOString(),
            successful: true
        },
        {
            id: 'tx3',
            amount: 50000,
            source_account: 'CSOROBAN',
            destination: 'GSOROBAN2',
            timestamp: new Date().toISOString(),
            successful: true,
            isSoroban: true
        }
    ]

    test('analyzes patterns correctly', () => {
        const patterns = transactionAnalyzer.analyzePatterns(mockTransactions)

        expect(patterns).toHaveProperty('whaleMovements')
        expect(patterns).toHaveProperty('arbitrageOpportunities')
        expect(patterns).toHaveProperty('unusualPatterns')
        expect(patterns).toHaveProperty('networkHealth')
    })

    test('detects whale movements', () => {
        const patterns = transactionAnalyzer.analyzePatterns(mockTransactions)

        expect(patterns.whaleMovements.length).toBeGreaterThan(0)
        expect(patterns.whaleMovements[0]).toHaveProperty('count')
        expect(patterns.whaleMovements[0]).toHaveProperty('totalAmount')
    })

    test('calculates network health', () => {
        const patterns = transactionAnalyzer.analyzePatterns(mockTransactions)

        expect(patterns.networkHealth).toHaveProperty('healthScore')
        expect(patterns.networkHealth).toHaveProperty('status')
        expect(patterns.networkHealth).toHaveProperty('recommendations')
        expect(typeof patterns.networkHealth.healthScore).toBe('number')
    })

    test('generates insights', () => {
        const patterns = transactionAnalyzer.analyzePatterns(mockTransactions)
        const insights = transactionAnalyzer.generateInsights(mockTransactions, patterns)

        expect(Array.isArray(insights)).toBe(true)
        if (insights.length > 0) {
            expect(insights[0]).toHaveProperty('type')
            expect(insights[0]).toHaveProperty('message')
        }
    })

    test('handles empty transaction array', () => {
        const patterns = transactionAnalyzer.analyzePatterns([])

        expect(patterns.whaleMovements).toEqual([])
        expect(patterns.networkHealth.healthScore).toBe(0)
    })

    test('handles transactions without timestamps', () => {
        const txsWithoutTime = mockTransactions.map(tx => ({
            ...tx,
            timestamp: undefined
        }))

        const patterns = transactionAnalyzer.analyzePatterns(txsWithoutTime)
        expect(patterns).toBeDefined()
    })
})

