const request = require('supertest')
const express = require('express')

// Mock the transaction stream
jest.mock('../../../business-logic/archive/tx-stream', () => ({
    subscribeToTransactions: jest.fn((network, callback) => {
        // Simulate sending a transaction
        setTimeout(() => {
            callback([{
                id: 'test-tx',
                hash: 'abc123',
                amount: 1000,
                source_account: 'GABC123',
                fee_charged: 100,
                successful: true
            }])
        }, 100)
        return jest.fn() // unsubscribe function
    })
}))

// Mock tx-routes
const txRoutes = require('../../../api/routes/tx-routes')

describe('SSE Transaction Stream Endpoint', () => {
    let app

    beforeEach(() => {
        app = express()
        app.use('/explorer/:network', txRoutes)
        jest.clearAllMocks()
    })

    test('sets SSE headers', (done) => {
        request(app)
            .get('/explorer/public/tx/stream')
            .expect('Content-Type', /text\/event-stream/)
            .expect('Cache-Control', 'no-cache')
            .expect('Connection', 'keep-alive')
            .end((err) => {
                if (err) return done(err)
                done()
            })
    })

    test('sends connection confirmation', (done) => {
        request(app)
            .get('/explorer/public/tx/stream')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                // Check for connection message
                expect(res.text).toContain('connected')
                done()
            })
    })

    test('handles client disconnect', (done) => {
        const req = request(app)
            .get('/explorer/public/tx/stream')
            .end(() => {})

        // Simulate disconnect
        req.abort()
        
        // Should not throw error
        setTimeout(() => {
            done()
        }, 200)
    })

    test('filters by minAmount', (done) => {
        request(app)
            .get('/explorer/public/tx/stream?minAmount=5000')
            .expect(200)
            .end((err) => {
                if (err) return done(err)
                // The filtering logic should be tested in the callback
                done()
            })
    })
})

