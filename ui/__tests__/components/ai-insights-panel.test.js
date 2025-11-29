import React from 'react'
import {render, screen, waitFor, fireEvent} from '@testing-library/react'
import {AIInsightsPanel} from '../../views/components/ai-insights-panel'

// Mock the store
const mockStore = {
    transactions: [],
    setTransactions: jest.fn()
}

jest.mock('../../views/graph/store', () => ({
    useStore: (selector) => {
        if (selector.toString().includes('transactions')) {
            return mockStore.transactions
        }
        return mockStore
    }
}))

// Mock transaction analyzer
jest.mock('../../business-logic/ai/transaction-pattern-analyzer', () => ({
    analyzePatterns: jest.fn(() => ({
        whaleMovements: [],
        arbitrageOpportunities: [],
        unusualPatterns: [],
        networkHealth: {
            healthScore: 85,
            status: 'healthy',
            recommendations: []
        }
    })),
    generateInsights: jest.fn(() => [
        {type: 'whale', message: 'Large transaction detected', severity: 'high'},
        {type: 'arbitrage', message: 'Arbitrage opportunity found', severity: 'medium'}
    ])
}))

describe('AIInsightsPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStore.transactions = []
    })

    test('renders AI Insights panel', () => {
        render(<AIInsightsPanel />)
        expect(screen.getByText(/AI Insights/i)).toBeInTheDocument()
    })

    test('shows tabs for Insights, Patterns, and Health', () => {
        render(<AIInsightsPanel />)
        expect(screen.getByText('Insights')).toBeInTheDocument()
        expect(screen.getByText('Patterns')).toBeInTheDocument()
        expect(screen.getByText('Health')).toBeInTheDocument()
    })

    test('displays insights when transactions are available', async () => {
        mockStore.transactions = [
            {
                id: '1',
                amount: 60000,
                isWhale: true,
                source: 'GABC123'
            }
        ]

        render(<AIInsightsPanel />)
        
        await waitFor(() => {
            expect(screen.getByText(/Large transaction detected/i)).toBeInTheDocument()
        })
    })

    test('shows empty state when no transactions', () => {
        render(<AIInsightsPanel />)
        expect(screen.getByText(/No transactions to analyze/i)).toBeInTheDocument()
    })

    test('switches between tabs', () => {
        render(<AIInsightsPanel />)
        const patternsTab = screen.getByText('Patterns')
        
        fireEvent.click(patternsTab)
        expect(patternsTab.closest('button')).toHaveClass('active')
    })
})

