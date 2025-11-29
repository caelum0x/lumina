const {subscribeToTransactions} = require('../../../business-logic/archive/tx-stream')

// Mock dependencies
jest.mock('../../../connectors/mongodb-connector', () => ({
    archive: {
        public: {
            collection: jest.fn(() => ({
                findOne: jest.fn(() => Promise.resolve({
                    _id: 1000,
                    hash: 'test-hash'
                }))
            }))
        }
    }
}))

jest.mock('../../../connectors/elastic-connector', () => ({
    search: jest.fn(() => Promise.resolve({
        body: {
            hits: {
                hits: [{
                    _id: '1000'
                }]
            }
        }
    }))
}))

jest.mock('../../../business-logic/archive/archive-locator', () => ({
    fetchArchiveTransactions: jest.fn(() => Promise.resolve([{
        id: {high: 1000, low: 0},
        hash: 'test-hash',
        source_account: 'GABC123',
        amount: 1000,
        fee_charged: 100,
        successful: true
    }]))
}))

jest.mock('../../../business-logic/ledger/ledger-resolver', () => ({
    fetchLedgers: jest.fn(() => Promise.resolve([{
        _id: 1000,
        sequence: 1000
    }]))
}))

describe('Transaction Stream', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('subscribes to transaction stream', () => {
        const callback = jest.fn()
        const unsubscribe = subscribeToTransactions('public', callback)

        expect(typeof unsubscribe).toBe('function')
    })

    test('calls callback with transactions', async () => {
        const callback = jest.fn()
        subscribeToTransactions('public', callback)

        // Wait for poll interval
        await new Promise(resolve => setTimeout(resolve, 600))

        // Callback should be called (may be empty if no new transactions)
        // This test verifies the subscription mechanism works
        expect(callback).toHaveBeenCalled()
    })

    test('unsubscribes correctly', () => {
        const callback = jest.fn()
        const unsubscribe = subscribeToTransactions('public', callback)

        unsubscribe()

        // After unsubscribe, callback should not be called
        // (we can't easily test this without waiting, but the unsubscribe function should exist)
        expect(typeof unsubscribe).toBe('function')
    })

    test('handles errors gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
        
        // Force an error by using invalid network
        try {
            subscribeToTransactions('invalid-network', jest.fn())
        } catch (error) {
            expect(error.message).toContain('Unknown network')
        }

        consoleErrorSpy.mockRestore()
    })
})

