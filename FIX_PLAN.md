# LUMINA FIX PLAN - Critical Issues Resolution

## Date: 2025-11-29
## Status: CRITICAL - Multiple Systems Failing

---

## 🔴 CRITICAL ISSUES IDENTIFIED

### 1. API Keeps Crashing
**Symptoms:**
- API starts, then stops after 10-30 seconds
- No error messages in logs
- Frontend gets no data

**Root Causes:**
- Ingestion service causing crashes
- Unhandled promise rejections
- Memory issues or infinite loops

**Fix Priority:** 🔴 CRITICAL - Fix First

### 2. Frontend Shows "No Data Found"
**Symptoms:**
- "No ledgers found"
- "No transactions found"  
- "No pools found"
- Charts have no lines

**Root Causes:**
- API not responding (crashes)
- Wrong response format (missing `_embedded`)
- Frontend expecting different data structure
- CORS issues

**Fix Priority:** 🔴 CRITICAL

### 3. Runtime Errors on Navigation
**Symptoms:**
- Error when returning from 3D page
- "Cannot read properties of undefined"
- Page crashes

**Root Causes:**
- Memory leaks in 3D components
- State not cleaning up
- Event listeners not removed

**Fix Priority:** 🟡 HIGH

### 4. Asset Format Errors
**Symptoms:**
- "Invalid asset name: GDEUQ2MX..."
- Pools page crashes

**Root Causes:**
- API returning wrong asset format
- Frontend expecting `CODE:ISSUER` format
- AssetDescriptor parsing fails

**Fix Priority:** 🟡 HIGH

---

## 🎯 FIX STRATEGY (Step by Step)

### Phase 1: Stabilize API (30 minutes)

#### Step 1.1: Disable Ingestion Temporarily
**Why:** Ingestion is crashing the API
**Action:**
```javascript
// In api/api.js - Comment out ingestion
// const startIngestion = require('./services/start-ingestion')
// startIngestion()
```

#### Step 1.2: Add Request Logging
**Why:** See what frontend is requesting
**Action:**
```javascript
// In api/api.js - Add middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})
```

#### Step 1.3: Test API Stability
**Action:**
```bash
# Start API
node api.js

# Test for 2 minutes
watch -n 5 'curl -s http://localhost:3000/explorer/public/network/stats'
```

**Expected:** API stays running, responds consistently

---

### Phase 2: Fix Data Endpoints (45 minutes)

#### Step 2.1: Fix Ledger Recent Endpoint
**Current Issue:** Returns wrong format or crashes

**Check:**
```bash
curl http://localhost:3000/explorer/public/ledger/recent?limit=5
```

**Expected Response:**
```json
{
  "_embedded": {
    "records": [
      {
        "sequence": 60072615,
        "ts": 1764427200000,
        "tx_count": 150,
        "op_count": 400,
        "hash": "abc123..."
      }
    ]
  }
}
```

**Fix Location:** `api/api/routes/ledger-explorer-routes.js`

#### Step 2.2: Fix Transaction List Endpoint
**Check:**
```bash
curl http://localhost:3000/explorer/public/tx/recent?limit=5
```

**Expected:** Same `_embedded.records` format

**Fix Location:** `api/api/routes/tx-routes.js`

#### Step 2.3: Fix Pools Endpoint
**Already Fixed:** Returns `_embedded.records`

**Verify:**
```bash
curl http://localhost:3000/explorer/public/liquidity-pools/top
```

#### Step 2.4: Fix Chart Endpoints
**Check:**
```bash
curl http://localhost:3000/explorer/public/chart/transactions
curl http://localhost:3000/explorer/public/chart/volume
```

**Expected:**
```json
{
  "data": [
    {"time": 1764427200, "value": 150},
    {"time": 1764427100, "value": 145}
  ]
}
```

**Fix Location:** `api/api/routes/chart-routes.js`

---

### Phase 3: Fix Frontend Issues (30 minutes)

#### Step 3.1: Fix retrieveLedgerInfo Error
**Current:** Crashes when `xdr` is undefined

**Already Fixed:** Created `ui/business-logic/ledger-info-helper.js`

**Verify:** Check if all imports updated

#### Step 3.2: Fix 3D Page Memory Leak
**Issue:** Crashes when navigating away

**Fix:**
```javascript
// In 3D component useEffect cleanup
return () => {
  // Dispose Three.js objects
  scene.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) obj.material.dispose()
  })
  renderer.dispose()
}
```

#### Step 3.3: Fix Asset Parsing
**Already Fixed:** API returns proper format

**Verify:** Frontend can parse `native` and `CODE:ISSUER`

---

### Phase 4: Test Everything (15 minutes)

#### Test Checklist:
- [ ] API stays running for 5+ minutes
- [ ] Homepage shows ledgers
- [ ] Homepage shows transactions
- [ ] Charts display lines
- [ ] Pools page works
- [ ] Can navigate to 3D page and back
- [ ] No runtime errors
- [ ] No console errors

---

## 🔧 IMMEDIATE ACTIONS (Next 10 Minutes)

### Action 1: Disable Ingestion
```bash
cd /Users/arhansubasi/lumina/lumina/api
# Edit api.js - comment out ingestion
```

### Action 2: Add Logging
```javascript
// Add to api.js after app creation
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})
```

### Action 3: Restart and Monitor
```bash
# Kill existing
pkill -f "node.*api.js"

# Start with logging
node api.js | tee /tmp/lumina-api-debug.log
```

### Action 4: Test from Frontend
```bash
# Open browser console
# Check Network tab for failed requests
# Note exact URLs being called
```

---

## 📋 ROOT CAUSE ANALYSIS

### Why API Crashes:
1. **Ingestion Service** - Interval callbacks throwing errors
2. **Horizon Adapter** - Rate limiting or connection issues
3. **MongoDB** - Connection drops or query timeouts
4. **Memory** - Leaks from continuous operations

### Why Frontend Shows No Data:
1. **API Crashes** - No response = no data
2. **Wrong Format** - Frontend expects `_embedded.records`
3. **CORS** - Requests blocked (unlikely, but check)
4. **Caching** - Old failed responses cached

### Why Charts Empty:
1. **No Data Points** - API returns empty array
2. **Wrong Format** - Chart library expects different structure
3. **Horizon Fallback** - Not working when MongoDB empty

---

## 🎯 SUCCESS CRITERIA

### API Stability:
- ✅ Runs for 10+ minutes without crashing
- ✅ Responds to all requests < 500ms
- ✅ Logs all requests
- ✅ No unhandled errors

### Data Display:
- ✅ Homepage shows 20 recent ledgers
- ✅ Homepage shows 20 recent transactions
- ✅ Charts show data lines
- ✅ Pools page shows 20 pools
- ✅ Network stats update

### Navigation:
- ✅ Can visit all pages
- ✅ Can return from 3D page
- ✅ No runtime errors
- ✅ No memory leaks

---

## 🚀 EXECUTION PLAN

### Step 1: Stabilize (30 min)
1. Disable ingestion
2. Add logging
3. Test API stability
4. Identify crash cause

### Step 2: Fix Endpoints (45 min)
1. Fix ledger/recent format
2. Fix tx/recent format
3. Verify pools format
4. Fix chart data format

### Step 3: Fix Frontend (30 min)
1. Verify retrieveLedgerInfo fix
2. Add 3D cleanup
3. Test navigation

### Step 4: Re-enable Features (15 min)
1. Re-enable ingestion with fixes
2. Test full system
3. Monitor for 10 minutes

**Total Time: 2 hours**

---

## 📝 DEBUGGING COMMANDS

### Check API Status:
```bash
ps aux | grep "node.*api.js"
tail -f /tmp/lumina-api.log
```

### Test Endpoints:
```bash
# Ledgers
curl -s http://localhost:3000/explorer/public/ledger/recent?limit=3 | jq

# Transactions  
curl -s http://localhost:3000/explorer/public/tx/recent?limit=3 | jq

# Pools
curl -s http://localhost:3000/explorer/public/liquidity-pools/top | jq

# Charts
curl -s http://localhost:3000/explorer/public/chart/transactions | jq

# Stats
curl -s http://localhost:3000/explorer/public/network/stats | jq
```

### Monitor Requests:
```bash
# Watch API logs
tail -f /tmp/lumina-api-debug.log | grep -E "(GET|POST|Error)"
```

---

## 🎯 NEXT STEPS

1. **Execute Phase 1** - Stabilize API (disable ingestion)
2. **Identify Crash** - Find exact cause
3. **Fix Endpoints** - Ensure proper format
4. **Test Frontend** - Verify data displays
5. **Re-enable** - Turn features back on with fixes

**Let's start with Phase 1: Stabilizing the API**

Ready to execute? Say "START FIX" and I'll begin with Phase 1.
