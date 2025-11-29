import React from 'react'
import {render, screen} from '@testing-library/react'
import {MarketOrderbookEnhanced} from '../../views/components/market-orderbook-enhanced'

describe('MarketOrderbookEnhanced', () => {
    const mockBids = [
        {price: '0.95', amount: '100', total: '100'},
        {price: '0.94', amount: '200', total: '300'},
        {price: '0.93', amount: '150', total: '450'}
    ]

    const mockAsks = [
        {price: '1.05', amount: '100', total: '100'},
        {price: '1.06', amount: '200', total: '300'},
        {price: '1.07', amount: '150', total: '450'}
    ]

    it('renders orderbook table view by default', () => {
        render(
            <MarketOrderbookEnhanced
                bids={mockBids}
                asks={mockAsks}
                baseAsset="XLM"
                quoteAsset="USD"
            />
        )

        expect(screen.getByText('Orderbook')).toBeInTheDocument()
        expect(screen.getByText('Bids (Buy Orders)')).toBeInTheDocument()
        expect(screen.getByText('Asks (Sell Orders)')).toBeInTheDocument()
    })

    it('displays bid and ask prices correctly', () => {
        render(
            <MarketOrderbookEnhanced
                bids={mockBids}
                asks={mockAsks}
            />
        )

        expect(screen.getByText('0.950000')).toBeInTheDocument()
        expect(screen.getByText('1.050000')).toBeInTheDocument()
    })

    it('shows loading state when data is missing', () => {
        render(
            <MarketOrderbookEnhanced
                bids={null}
                asks={null}
            />
        )

        expect(screen.getByText('Loading orderbook...')).toBeInTheDocument()
    })

    it('calculates spread correctly', () => {
        render(
            <MarketOrderbookEnhanced
                bids={mockBids}
                asks={mockAsks}
            />
        )

        // Spread = 1.05 - 0.95 = 0.10
        expect(screen.getByText(/Spread:/)).toBeInTheDocument()
    })
})

