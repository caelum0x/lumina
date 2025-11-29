# Comprehensive Search Enhancement

## Current Search Capabilities ✅

### Supported Search Types

1. **Accounts** ✅
   - G... addresses (56 chars)
   - Federation addresses (name*domain.com)
   - Soroban domains (.xlm)

2. **Assets** ✅
   - Native (XLM, native, lumen)
   - Asset codes (USDC, AQUA, etc.)
   - Asset code:issuer format

3. **Transactions** ✅
   - Transaction hashes (64 hex chars)
   - Transaction IDs (numeric)

4. **Contracts** ✅
   - C... addresses (56 chars)
   - Contract IDs

5. **Ledgers** ✅
   - Ledger sequences (numeric)

6. **Operations** ✅
   - Operation IDs (numeric)

7. **Offers** ✅
   - Offer IDs (numeric)

---

## Enhanced Search Features to Add

### 1. Fuzzy Asset Search
Search assets by partial name:
- "USD" → finds USDC, USDT, etc.
- "aqua" → finds AQUA token
- "yxlm" → finds yXLM

### 2. Multi-Asset Search
Search multiple assets at once:
- "USDC,AQUA,yXLM" → returns all three

### 3. Account Name Search
Search by account name/domain:
- "stellar.org" → finds Stellar Development Foundation
- "lobstr" → finds LOBSTR accounts

### 4. Transaction Amount Search
Search transactions by amount:
- "amount:>1000" → transactions over 1000 XLM
- "amount:100-500" → transactions between 100-500 XLM

### 5. Date Range Search
Search by date:
- "date:2024-01-01" → transactions on specific date
- "date:2024-01-01..2024-01-31" → date range

### 6. Operation Type Search
Search by operation type:
- "type:payment" → all payments
- "type:create_account" → account creations
- "type:invoke_host_function" → Soroban invocations

### 7. Memo Search
Search by transaction memo:
- "memo:invoice123" → transactions with specific memo

---

## Implementation Plan

### Phase 1: Enhanced Asset Search (30 min)

**File**: `api/api/routes/search-routes.js`

```javascript
// Add fuzzy asset search
async function searchAssetsByName(network, query) {
    const assets = await horizonAdapter.getAssets(network, 200)
    return assets.filter(a => 
        a.asset_code.toLowerCase().includes(query.toLowerCase())
    )
}
```

### Phase 2: Advanced Filters (45 min)

**File**: `api/api/routes/search-routes.js`

```javascript
// Parse advanced search queries
function parseAdvancedQuery(query) {
    const filters = {
        type: null,
        amount: null,
        date: null,
        memo: null
    }
    
    // type:payment
    const typeMatch = query.match(/type:(\w+)/)
    if (typeMatch) filters.type = typeMatch[1]
    
    // amount:>1000
    const amountMatch = query.match(/amount:([><]=?)(\d+)/)
    if (amountMatch) filters.amount = {op: amountMatch[1], value: amountMatch[2]}
    
    // date:2024-01-01
    const dateMatch = query.match(/date:(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) filters.date = dateMatch[1]
    
    // memo:text
    const memoMatch = query.match(/memo:(.+)/)
    if (memoMatch) filters.memo = memoMatch[1]
    
    return filters
}
```

### Phase 3: Search Suggestions (30 min)

**File**: `ui/views/explorer/search/search-suggestions-view.js`

```javascript
// Real-time search suggestions
function getSuggestions(query) {
    const suggestions = []
    
    if (query.length >= 2) {
        // Suggest popular assets
        if (/^[a-z]+$/i.test(query)) {
            suggestions.push({
                type: 'asset',
                text: `Search for ${query.toUpperCase()} asset`,
                query: query.toUpperCase()
            })
        }
        
        // Suggest search filters
        if (query.includes(':')) {
            suggestions.push({
                type: 'filter',
                text: 'Advanced search filters available',
                examples: ['type:payment', 'amount:>1000', 'date:2024-01-01']
            })
        }
    }
    
    return suggestions
}
```

---

## Data Sources Available

### 1. Horizon API ✅
- **Endpoint**: https://horizon.stellar.org
- **Data**: Real-time ledgers, transactions, operations, accounts, assets
- **Rate Limit**: ~100 requests/minute
- **Usage**: Primary data source for live data

### 2. MongoDB ✅
- **Collections**: assets, ledgers, transactions, accounts, contracts
- **Data**: Historical data (200+ records each)
- **Usage**: Fast queries for historical data

### 3. StellarExpert API
- **Endpoint**: https://api.stellar.expert
- **Data**: Asset ratings, statistics, metadata
- **Usage**: Enhanced asset information

### 4. Soroban Domains
- **Endpoint**: https://sorobandomains-query.lightsail.network
- **Data**: .xlm domain resolution
- **Usage**: Resolve .xlm domains to addresses

### 5. Federation Servers
- **Protocol**: Stellar Federation
- **Data**: name*domain.com resolution
- **Usage**: Resolve federation addresses

---

## Enhanced Search Examples

### Basic Searches
```
XLM                    → Native asset
USDC                   → USDC asset
GXXXXXX...             → Account
CXXXXXX...             → Contract
abc123...              → Transaction hash
12345                  → Ledger sequence
```

### Advanced Searches
```
type:payment           → All payment operations
amount:>1000           → Transactions over 1000 XLM
date:2024-01-01        → Transactions on date
memo:invoice           → Transactions with memo
USDC type:payment      → USDC payments
```

### Multi-Entity Searches
```
USDC,AQUA,yXLM         → Multiple assets
stellar.org            → Accounts with domain
.xlm                   → Soroban domains
```

---

## Implementation Priority

### High Priority (Do Now)
1. ✅ Basic search (already working)
2. 🔄 Fuzzy asset search
3. 🔄 Better error messages
4. 🔄 Search suggestions

### Medium Priority (Next)
1. Advanced filters (type, amount, date)
2. Multi-entity search
3. Search history
4. Saved searches

### Low Priority (Future)
1. Natural language search
2. AI-powered search
3. Search analytics
4. Export search results

---

## Testing Checklist

### Basic Search
- [ ] Search "XLM" → finds native asset
- [ ] Search "USDC" → finds USDC asset
- [ ] Search account address → finds account
- [ ] Search tx hash → finds transaction
- [ ] Search ledger number → finds ledger
- [ ] Search contract address → finds contract

### Advanced Search
- [ ] Search "USD" → finds all USD assets
- [ ] Search "type:payment" → finds payments
- [ ] Search "amount:>1000" → finds large txs
- [ ] Search federation address → resolves
- [ ] Search .xlm domain → resolves

### Error Handling
- [ ] Empty search → shows error
- [ ] Invalid address → shows error
- [ ] Not found → shows "no results"
- [ ] Network error → shows retry option

---

## Quick Wins (Implement Now)

### 1. Better Asset Search (10 min)
```javascript
// Search assets by partial code
if (query.length >= 2 && /^[a-z0-9]+$/i.test(query)) {
    const assets = await horizonAdapter.getAssets(network, 200)
    const matches = assets.filter(a => 
        a.asset_code.toLowerCase().includes(query.toLowerCase())
    )
    results.assets.push(...matches)
}
```

### 2. Search Suggestions (15 min)
```javascript
// Show suggestions as user types
const suggestions = []
if (query.length >= 2) {
    suggestions.push(`Search for ${query.toUpperCase()} asset`)
    suggestions.push(`Search accounts containing "${query}"`)
}
```

### 3. Better Error Messages (5 min)
```javascript
// Provide helpful error messages
if (results.accounts.length === 0 && searchTypes.includes('account')) {
    results.suggestions = [
        'Check if the address is correct (should start with G)',
        'Try searching by federation address (name*domain.com)',
        'Try searching by .xlm domain'
    ]
}
```

---

## Next Steps

1. Implement fuzzy asset search
2. Add search suggestions
3. Improve error messages
4. Add advanced filters
5. Test thoroughly

Ready to implement these enhancements?
