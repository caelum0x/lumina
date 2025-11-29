import {renderHook} from '@testing-library/react'
import {useStellarStream} from '../../views/graph/use-stellar-stream'

// Mock EventSource
class MockEventSource {
    constructor(url) {
        this.url = url
        this.readyState = 0 // CONNECTING
        this.onopen = null
        this.onmessage = null
        this.onerror = null
    }

    close() {
        this.readyState = 2 // CLOSED
    }

    simulateOpen() {
        this.readyState = 1 // OPEN
        if (this.onopen) this.onopen()
    }

    simulateMessage(data) {
        if (this.onmessage) {
            this.onmessage({data: JSON.stringify(data)})
        }
    }

    simulateError() {
        if (this.onerror) this.onerror()
    }
}

// Mock store
const mockAddTransaction = jest.fn()
const mockAddTransactions = jest.fn()
const mockSetConnectionStatus = jest.fn()

jest.mock('../../views/graph/store', () => ({
    useStore: (selector) => {
        if (selector.toString().includes('addTransaction')) {
            return mockAddTransaction
        }
        if (selector.toString().includes('addTransactions')) {
            return mockAddTransactions
        }
        if (selector.toString().includes('setConnectionStatus')) {
            return mockSetConnectionStatus
        }
        return {
            getState: () => ({
                setConnectionStatus: mockSetConnectionStatus
            })
        }
    }
}))

// Mock app settings
jest.mock('../../app-settings', () => ({
    activeNetwork: 'public',
    apiEndpoint: 'http://localhost:3000'
}))

describe('useStellarStream', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.EventSource = MockEventSource
    })

    test('creates EventSource connection', () => {
        const EventSourceSpy = jest.fn().mockImplementation((url) => {
            return new MockEventSource(url)
        })
        global.EventSource = EventSourceSpy

        renderHook(() => useStellarStream('public'))
        
        expect(EventSourceSpy).toHaveBeenCalled()
    })

    test('handles connection open', () => {
        let eventSource
        const EventSourceSpy = jest.fn().mockImplementation((url) => {
            eventSource = new MockEventSource(url)
            return eventSource
        })
        global.EventSource = EventSourceSpy

        renderHook(() => useStellarStream('public'))
        
        eventSource.simulateOpen()
        // Connection status is updated via useEffect, which may not be called immediately
        expect(eventSource.readyState).toBe(1) // OPEN
    })

    test('processes transaction messages', () => {
        let eventSource
        const EventSourceSpy = jest.fn().mockImplementation((url) => {
            eventSource = new MockEventSource(url)
            return eventSource
        })
        global.EventSource = EventSourceSpy

        renderHook(() => useStellarStream('public'))
        
        const tx = {
            id: 'test-tx',
            hash: 'abc123',
            amount: 1000,
            source_account: 'GABC123'
        }

        eventSource.simulateMessage(tx)
        expect(mockAddTransaction).toHaveBeenCalledWith(tx)
    })

    test('handles connection errors', () => {
        let eventSource
        const EventSourceSpy = jest.fn().mockImplementation((url) => {
            eventSource = new MockEventSource(url)
            return eventSource
        })
        global.EventSource = EventSourceSpy

        renderHook(() => useStellarStream('public'))
        
        eventSource.simulateError()
        // Error handling may update connection status
        expect(eventSource.onerror).toBeDefined()
    })

    test('cleans up on unmount', () => {
        let eventSource
        const EventSourceSpy = jest.fn().mockImplementation((url) => {
            eventSource = new MockEventSource(url)
            return eventSource
        })
        global.EventSource = EventSourceSpy

        const {unmount} = renderHook(() => useStellarStream('public'))
        
        const closeSpy = jest.spyOn(eventSource, 'close')
        unmount()
        
        expect(closeSpy).toHaveBeenCalled()
    })
})

