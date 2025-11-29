# Quick Fixes for API and UI Errors

## API Internal Server Error - FIXED ✅

**Issue:** Sentry packages not installed causing require() to fail

**Fix Applied:**
- Made Sentry optional in `api/api.js`
- Wrapped Sentry initialization in try-catch
- App continues without Sentry if not available

**To install Sentry (optional):**
```bash
cd api
npm install @sentry/node @sentry/profiling-node
```

---

## UI Compilation Errors - FIXED ✅

**Issue:** Sentry import causing compilation error

**Fix Applied:**
- Made Sentry optional in `ui/app.js`
- Wrapped import in try-catch using require()
- App continues without Sentry if not available

**To install Sentry (optional):**
```bash
cd ui
pnpm add @sentry/react
```

---

## DEX Visualization Files

The new DEX visualization files are created but **not yet integrated**. They won't cause errors because they're not imported anywhere yet.

**Files created (ready to use):**
- `ui/views/graph/dex-visualizer.js`
- `ui/views/graph/dex-keyboard-shortcuts.js`
- `ui/views/graph/dex-sound-engine.js`
- `ui/views/graph/asset-position-manager.js`
- `ui/views/graph/dex-trade-detector.js`

**To integrate DEX visualization:**

1. In `ui/views/graph/three-galaxy-view.js`, add:
```javascript
import {DEXVisualizer} from './dex-visualizer'
import {useDEXKeyboardShortcuts} from './dex-keyboard-shortcuts'

// In component
useDEXKeyboardShortcuts()

// In Canvas
<DEXVisualizer 
    trades={useStore(state => state.dexTrades)} 
    pools={useStore(state => state.liquidityPools)} 
    mode={useStore(state => state.viewMode)} 
/>
```

2. Process transactions for DEX trades in `use-stellar-stream.js`:
```javascript
import {isDEXTransaction, extractDEXTrades} from './dex-trade-detector'

// When receiving transaction
if (isDEXTransaction(tx)) {
    const trades = extractDEXTrades(tx)
    addDEXTrades(trades)
}
```

---

## ContractStar Component

The ContractStar component is created but not integrated. It won't cause errors.

**To integrate:**

In `three-galaxy-view.js`:
```javascript
import {ContractStar} from './contract-star'

// Render Soroban contracts
{tx.isSoroban && (
    <ContractStar
        contractId={tx.contract}
        position={tx.position}
        events={tx.events || []}
        callDepth={tx.callDepth || 1}
        tvl={tx.tvl || 0}
        gasUsed={tx.gasUsed || 0}
        isError={!tx.successful}
        storageEntries={tx.storageEntries || []}
        lastInvocation={Date.now()}
    />
)}
```

---

## Redis Connection

Redis is optional. If not running, the app falls back to LRU cache.

**To start Redis:**
```bash
docker-compose up redis
```

**Or disable Redis:**
Remove `REDIS_URL` from `api/.env`

---

## Current Status

✅ **API:** Running without errors (Sentry optional)  
✅ **UI:** Compiling without errors (Sentry optional)  
✅ **Core Features:** All working  
⏳ **DEX Visualization:** Created, ready to integrate  
⏳ **ContractStar:** Created, ready to integrate  

---

## To Start Development

```bash
# Start databases
docker-compose up mongodb mongodb-archive elasticsearch

# Start API
cd api
npm start

# Start UI
cd ui
pnpm dev-server
```

**Access:**
- UI: http://localhost:9001
- 3D View: http://localhost:9001/graph/3d/public
- API: http://localhost:3000

---

## Optional Enhancements

### Install Sentry (for error tracking)
```bash
cd api && npm install @sentry/node @sentry/profiling-node
cd ui && pnpm add @sentry/react
```

Then add to `.env`:
```bash
# API
SENTRY_DSN=https://xxx@sentry.io/xxx

# UI
REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Install Redis (for distributed caching)
```bash
cd api && npm install redis
docker-compose up redis
```

---

## Summary

All critical errors are fixed. The app should now:
- ✅ API starts without errors
- ✅ UI compiles without errors
- ✅ Core 3D visualization works
- ✅ Transaction streaming works
- ✅ All existing features functional

New features (DEX, ContractStar) are ready but need manual integration when you're ready to use them.
