# IMMEDIATE ACTIONS - Next 2 Hours
## Make Lumina Navigable and Show Live Data

**Current Time:** 2025-11-29 15:05
**Goal:** Fix critical issues so users can navigate and see live data

---

## ✅ TASK 1: Create Universal Horizon Adapter (30 min)

**File:** `api/connectors/horizon-adapter.js`

**Purpose:** Single source of truth for all Horizon API calls

**Methods to implement:**
- `getLedgers(network, limit, cursor)` - Get recent ledgers
- `getTransactions(network, limit, cursor)` - Get recent transactions  
- `getTransaction(network, hash)` - Get single transaction
- `getAccount(network, address)` - Get account details
- `getAssets(network, limit, cursor)` - Get asset list
- `getAsset(network, code, issuer)` - Get single asset
- `getOperations(network, txHash)` - Get operations for transaction

**Implementation:** Use `@stellar/stellar-sdk` Server class with proper error handling

---

## ✅ TASK 2: Fix Homepage to Show Live Data (30 min)

**File:** `ui/views/explorer/pages/explorer-home-page-view.js`

**Changes:**
1. Remove broken charts temporarily
2. Add "Latest Ledgers" table component
3. Add "Latest Transactions" table component  
4. Add network stats cards (TPS, total txs, active accounts)
5. Keep search bar prominent

**New Components to Create:**
- `ui/views/explorer/ledger/latest-ledgers-table.js`
- `ui/views/explorer/transaction/latest-transactions-table.js`
- `ui/views/explorer/dashboard/network-stats-cards.js`

---

## ✅ TASK 3: Fix API Endpoints to Use Horizon (30 min)

**Files to modify:**
- `api/business-logic/ledger/ledger-stats.js` - Use Horizon adapter
- `api/business-logic/asset/asset-list.js` - Already has fallback, ensure it works
- `api/business-logic/asset/asset-stats-list.js` - Use Horizon adapter

**Changes:**
- Replace MongoDB queries with Horizon adapter calls
- Add proper error handling
- Add response caching (5-60 seconds)

---

## ✅ TASK 4: Create SSE Stream Endpoint (20 min)

**File:** `api/api/routes/stream-routes.js`

**Endpoint:** `GET /stream/transactions/:network`

**Implementation:**
- Use Horizon streaming API
- Convert to Server-Sent Events format
- Send transaction data every time new ledger closes

**Connect to:** `ui/views/graph/use-stellar-stream.js`

---

## ✅ TASK 5: Fix 3D Page Layout (10 min)

**File:** `ui/views/graph/three-galaxy.scss`

**Changes:**
- Fix z-index issues causing overlap
- Ensure overlay is positioned correctly
- Add proper container constraints
- Test on different screen sizes

---

## 🔧 DETAILED IMPLEMENTATION

### Task 1: Horizon Adapter

```javascript
// api/connectors/horizon-adapter.js
const {Server, Networks} = require('@stellar/stellar-sdk')

const servers = {
    public: new Server('https://horizon.stellar.lobstr.co'),
    testnet: new Server('https://horizon-testnet.stellar.org')
}

async function getLedgers(network, limit = 20) {
    const server = servers[network]
    const ledgers = await server.ledgers()
        .order('desc')
        .limit(limit)
        .call()
    return ledgers.records
}

async function getTransactions(network, limit = 50) {
    const server = servers[network]
    const txs = await server.transactions()
        .order('desc')
        .limit(limit)
        .call()
    return txs.records
}

// ... more methods
```

### Task 2: Latest Ledgers Table

```javascript
// ui/views/explorer/ledger/latest-ledgers-table.js
import React, {useEffect, useState} from 'react'
import {apiCall} from '../../../models/api'

export default function LatestLedgersTable() {
    const [ledgers, setLedgers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiCall('ledger/recent')
            .then(data => {
                setLedgers(data.records || [])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading...</div>

    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Ledger</th>
                    <th>Time</th>
                    <th>Transactions</th>
                    <th>Operations</th>
                </tr>
            </thead>
            <tbody>
                {ledgers.map(ledger => (
                    <tr key={ledger.sequence}>
                        <td><a href={`/ledger/${ledger.sequence}`}>{ledger.sequence}</a></td>
                        <td>{timeAgo(ledger.closed_at)}</td>
                        <td>{ledger.successful_transaction_count}</td>
                        <td>{ledger.operation_count}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
```

### Task 3: Fix Ledger Stats

```javascript
// api/business-logic/ledger/ledger-stats.js
const horizonAdapter = require('../../connectors/horizon-adapter')

async function queryLedgerStats(network) {
    try {
        // Try MongoDB first
        const dbStats = await queryFromDatabase(network)
        if (dbStats) return dbStats
    } catch (e) {
        console.log('DB query failed, using Horizon')
    }

    // Fallback to Horizon
    const ledgers = await horizonAdapter.getLedgers(network, 100)
    
    // Calculate stats from recent ledgers
    const stats = {
        totalLedgers: ledgers[0].sequence,
        avgTxPerLedger: calculateAverage(ledgers, 'successful_transaction_count'),
        avgOpsPerLedger: calculateAverage(ledgers, 'operation_count'),
        avgCloseTime: calculateAverage(ledgers, 'close_time'),
        // ... more stats
    }
    
    return stats
}
```

### Task 4: SSE Stream

```javascript
// api/api/routes/stream-routes.js
const {Server} = require('@stellar/stellar-sdk')

module.exports = function(app) {
    app.get('/stream/transactions/:network', (req, res) => {
        const {network} = req.params
        
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        
        const server = new Server(getHorizonUrl(network))
        
        const stream = server.transactions()
            .cursor('now')
            .stream({
                onmessage: (tx) => {
                    res.write(`data: ${JSON.stringify(tx)}\n\n`)
                },
                onerror: (err) => {
                    console.error('Stream error:', err)
                }
            })
        
        req.on('close', () => {
            stream()
        })
    })
}
```

### Task 5: Fix 3D CSS

```scss
// ui/views/graph/three-galaxy.scss
.three-graph-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.three-galaxy-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
    
    > * {
        pointer-events: auto;
    }
}

canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}
```

---

## 🎯 SUCCESS CRITERIA

After completing these 5 tasks:

✅ Homepage shows live ledgers and transactions
✅ All navbar links are clickable (even if some pages are empty)
✅ Search bar works for basic queries
✅ 3D page doesn't have overlapping components
✅ 3D page shows "Connecting..." or live transaction stream
✅ No critical console errors
✅ Users can navigate between pages

---

## 🚀 EXECUTION ORDER

1. **Start with Task 1** - Everything depends on Horizon adapter
2. **Then Task 3** - Fix API endpoints to use adapter
3. **Then Task 2** - Update homepage with new components
4. **Then Task 4** - Add SSE stream for 3D
5. **Finally Task 5** - Polish 3D page layout

**Estimated time:** 2 hours
**Impact:** Platform becomes usable

---

## 📝 TESTING CHECKLIST

After implementation:

- [ ] Visit http://localhost:9001 - Homepage loads
- [ ] See latest ledgers table with data
- [ ] See latest transactions table with data
- [ ] Click "Assets" in navbar - Page loads (even if empty)
- [ ] Click "Markets" in navbar - Page loads
- [ ] Click "3D Explorer" - Page loads without overlap
- [ ] Search for account address - Results show
- [ ] No red errors in browser console
- [ ] API server logs show no critical errors

---

## 🔄 NEXT STEPS (After 2 Hours)

Once these immediate fixes are done:

1. **Add more API endpoints** - Transaction detail, account detail
2. **Improve homepage** - Add charts, stats cards
3. **Fix asset list** - Show top assets from Horizon
4. **Add loading states** - Better UX for all pages
5. **Start data ingestion** - Background service to populate MongoDB

**Goal:** By end of day, have a functional explorer that shows live data for all core features.

---

*Focus on making it work first, then make it pretty, then make it fast.*
