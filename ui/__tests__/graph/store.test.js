import {useStore} from '../../views/graph/store'

describe('3D Galaxy Store', () => {
    beforeEach(() => {
        // Clear store before each test
        useStore.getState().clear()
    })

    test('initializes with empty state', () => {
        const state = useStore.getState()
        expect(state.transactions).toEqual([])
        expect(state.connections).toEqual([])
        expect(state.selectedTransaction).toBeNull()
        expect(state.stats.totalTransactions).toBe(0)
    })

    test('adds transaction correctly', () => {
        const mockTx = {
            id: 'test-tx-1',
            hash: 'abc123',
            amount: 1000,
            source_account: 'GABC123',
            fee_charged: 100,
            successful: true,
            created_at: new Date().toISOString()
        }

        useStore.getState().addTransaction(mockTx)
        const state = useStore.getState()

        expect(state.transactions).toHaveLength(1)
        expect(state.transactions[0].id).toBe('test-tx-1')
        expect(state.stats.totalTransactions).toBe(1)
    })

    test('identifies whale transactions', () => {
        const whaleTx = {
            id: 'whale-tx',
            amount: 60000, // Above 50k threshold
            source_account: 'GWHALE',
            fee_charged: 100,
            successful: true
        }

        useStore.getState().addTransaction(whaleTx)
        const state = useStore.getState()

        expect(state.transactions[0].isWhale).toBe(true)
        expect(state.stats.whaleCount).toBe(1)
    })

    test('identifies high fee transactions', () => {
        const highFeeTx = {
            id: 'high-fee-tx',
            amount: 1000,
            source_account: 'GFEE',
            fee_charged: 20000000, // Above 0.1 XLM threshold
            successful: true
        }

        useStore.getState().addTransaction(highFeeTx)
        const state = useStore.getState()

        expect(state.transactions[0].highFee).toBe(true)
    })

    test('identifies Soroban transactions', () => {
        const sorobanTx = {
            id: 'soroban-tx',
            amount: 1000,
            source_account: 'CABC123', // Starts with C
            fee_charged: 100,
            successful: true
        }

        useStore.getState().addTransaction(sorobanTx)
        const state = useStore.getState()

        expect(state.transactions[0].isSoroban).toBe(true)
        expect(state.stats.sorobanCount).toBe(1)
    })

    test('filters transactions correctly', () => {
        const regularTx = {
            id: 'regular',
            amount: 100,
            source_account: 'GREGULAR',
            fee_charged: 100,
            successful: true
        }

        const whaleTx = {
            id: 'whale',
            amount: 60000,
            source_account: 'GWHALE',
            fee_charged: 100,
            successful: true
        }

        useStore.getState().addTransaction(regularTx)
        useStore.getState().addTransaction(whaleTx)

        // Hide whales
        useStore.getState().setFilter('showWhales', false)
        const filtered = useStore.getState().getFilteredTransactions()

        expect(filtered).toHaveLength(1)
        expect(filtered[0].id).toBe('regular')
    })

    test('clears all transactions', () => {
        useStore.getState().addTransaction({
            id: 'test',
            amount: 1000,
            source_account: 'GTEST',
            fee_charged: 100,
            successful: true
        })

        useStore.getState().clear()
        const state = useStore.getState()

        expect(state.transactions).toEqual([])
        expect(state.connections).toEqual([])
        expect(state.stats.totalTransactions).toBe(0)
    })

    test('sets selected transaction', () => {
        const tx = {
            id: 'selected',
            amount: 1000,
            source_account: 'GSELECT',
            fee_charged: 100,
            successful: true
        }

        useStore.getState().addTransaction(tx)
        useStore.getState().setSelected(tx)
        const state = useStore.getState()

        expect(state.selectedTransaction).toEqual(tx)
    })

    test('sets view mode', () => {
        useStore.getState().setViewMode('topology')
        expect(useStore.getState().viewMode).toBe('topology')

        useStore.getState().setViewMode('galaxy')
        expect(useStore.getState().viewMode).toBe('galaxy')
    })

    test('limits transaction history', () => {
        // Add more than 2000 transactions
        for (let i = 0; i < 2100; i++) {
            useStore.getState().addTransaction({
                id: `tx-${i}`,
                amount: 100,
                source_account: 'GTEST',
                fee_charged: 100,
                successful: true
            })
        }

        const state = useStore.getState()
        expect(state.transactions.length).toBeLessThanOrEqual(2000)
    })
})

