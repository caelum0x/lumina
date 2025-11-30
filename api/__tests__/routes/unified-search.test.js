const request = require('supertest')
const express = require('express')
const unifiedSearch = require('../../api/routes/unified-search')

describe('Unified Search', () => {
    let app

    beforeAll(() => {
        app = express()
        unifiedSearch(app)
    })

    it('should return suggestions for empty query', async () => {
        const res = await request(app).get('/explorer/public/search/unified?q=')
        expect(res.status).toBe(200)
        expect(res.body.suggestions).toBeDefined()
        expect(res.body.suggestions.length).toBeGreaterThan(0)
    })

    it('should detect account type', async () => {
        const res = await request(app).get('/explorer/public/search/unified?q=GABC123456789012345678901234567890123456789012345678')
        expect(res.status).toBe(200)
        expect(res.body._meta.type).toBe('account')
    })

    it('should detect transaction type', async () => {
        const res = await request(app).get('/explorer/public/search/unified?q=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
        expect(res.status).toBe(200)
        expect(res.body._meta.type).toBe('transaction')
    })

    it('should detect ledger type', async () => {
        const res = await request(app).get('/explorer/public/search/unified?q=12345678')
        expect(res.status).toBe(200)
        expect(res.body._meta.type).toBe('ledger')
    })

    it('should detect asset type', async () => {
        const res = await request(app).get('/explorer/public/search/unified?q=USDC')
        expect(res.status).toBe(200)
        expect(res.body._meta.type).toBe('asset')
    })

    it('should detect contract type', async () => {
        const res = await request(app).get('/explorer/public/search/unified?q=CABC123456789012345678901234567890123456789012345678')
        expect(res.status).toBe(200)
        expect(res.body._meta.type).toBe('contract')
    })

    it('should support limit parameter', async () => {
        const res = await request(app).get('/explorer/public/search/unified?q=XLM&limit=5')
        expect(res.status).toBe(200)
        expect(res.body.records.length).toBeLessThanOrEqual(5)
    })
})
