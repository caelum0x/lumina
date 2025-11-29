import React from 'react'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import {SmartSearch} from '../../views/components/smart-search'
import {BrowserRouter} from 'react-router-dom'

// Mock the smart search business logic
jest.mock('../../business-logic/ai/smart-search', () => ({
    parseQuery: jest.fn((query) => {
        if (query.includes('G')) {
            return {
                type: 'account',
                entities: {
                    accounts: [query],
                    transactions: [],
                    amounts: []
                },
                filters: {}
            }
        }
        return {
            type: 'general',
            entities: {
                accounts: [],
                transactions: [],
                amounts: []
            },
            filters: {}
        }
    }),
    generateSuggestions: jest.fn(() => [
        {type: 'history', value: 'test query'},
        {type: 'account', value: 'GABC123...'}
    ])
}))

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
}
global.localStorage = localStorageMock

describe('SmartSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockReturnValue(null)
    })

    const renderWithRouter = (component) => {
        return render(<BrowserRouter>{component}</BrowserRouter>)
    }

    test('renders search input', () => {
        renderWithRouter(<SmartSearch />)
        const input = screen.getByPlaceholderText(/paste an asset code/i)
        expect(input).toBeInTheDocument()
    })

    test('shows suggestions when typing', async () => {
        renderWithRouter(<SmartSearch />)
        const input = screen.getByPlaceholderText(/paste an asset code/i)
        
        fireEvent.change(input, {target: {value: 'test'}})
        fireEvent.focus(input)

        await waitFor(() => {
            expect(screen.getByText('test query')).toBeInTheDocument()
        })
    })

    test('handles search on Enter key', () => {
        const mockHistory = {
            push: jest.fn()
        }
        jest.spyOn(require('react-router-dom'), 'useHistory').mockReturnValue(mockHistory)

        renderWithRouter(<SmartSearch />)
        const input = screen.getByPlaceholderText(/paste an asset code/i)
        
        fireEvent.change(input, {target: {value: 'GABC123'}})
        fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'})

        expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    test('clears input on Escape key', () => {
        renderWithRouter(<SmartSearch />)
        const input = screen.getByPlaceholderText(/paste an asset code/i)
        
        fireEvent.change(input, {target: {value: 'test'}})
        fireEvent.keyDown(input, {key: 'Escape', code: 'Escape'})

        expect(input.value).toBe('')
    })

    test('saves search to history', () => {
        const mockHistory = {
            push: jest.fn()
        }
        jest.spyOn(require('react-router-dom'), 'useHistory').mockReturnValue(mockHistory)

        renderWithRouter(<SmartSearch />)
        const input = screen.getByPlaceholderText(/paste an asset code/i)
        const button = screen.getByTitle('Search')
        
        fireEvent.change(input, {target: {value: 'test query'}})
        fireEvent.click(button)

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'lumina_search_history',
            expect.stringContaining('test query')
        )
    })
})

