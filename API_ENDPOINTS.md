# LUMINA API ENDPOINTS - Complete Reference

Base URL: `http://localhost:3000/explorer/:network`

Networks: `public`, `testnet`

---

## 📊 LEDGERS

```bash
GET /explorer/:network/ledger/recent?limit=20&cursor=
GET /explorer/:network/ledger/last
GET /explorer/:network/ledger/:sequence
```

---

## 💳 TRANSACTIONS

```bash
GET /explorer/:network/tx/recent?limit=50&cursor=
GET /explorer/:network/tx/:hash
```

---

## 👤 ACCOUNTS

```bash
# Account Details
GET /explorer/:network/account/:address/details

# Account Activity
GET /explorer/:network/account/:address/transactions?limit=50&cursor=
GET /explorer/:network/account/:address/operations?limit=50&cursor=
GET /explorer/:network/account/:address/payments?limit=50&cursor=
GET /explorer/:network/account/:address/effects?limit=50&cursor=

# Account Trading
GET /explorer/:network/account/:address/offers?limit=50&cursor=
GET /explorer/:network/account/:address/trades?limit=50&cursor=

# Account Data
GET /explorer/:network/account/:address/data?key=

# List Accounts (with filters)
GET /explorer/:network/account/list?signer=&asset=&sponsor=&liquidity_pool=&limit=10
```

---

## 💎 ASSETS

```bash
# List Assets
GET /explorer/:network/asset/horizon/list?limit=50&cursor=
GET /explorer/:network/asset/horizon/list?asset_code=USDC&limit=10
GET /explorer/:network/asset/horizon/list?asset_code=USDC&asset_issuer=GA...

# Single Asset
GET /explorer/:network/asset/horizon/:code/:issuer
```

---

## 💰 PAYMENTS

```bash
GET /explorer/:network/payments/recent?limit=50&cursor=
```

---

## ⚡ EFFECTS

```bash
GET /explorer/:network/effects/recent?limit=50&cursor=
```

---

## 📋 OFFERS

```bash
# List Offers
GET /explorer/:network/offers/list?limit=50&cursor=
GET /explorer/:network/offers/list?seller=GA...&limit=10
GET /explorer/:network/offers/list?selling=ASSET&buying=ASSET

# Single Offer
GET /explorer/:network/offers/:offerId
```

---

## 📈 ORDERBOOK & TRADES

```bash
# Orderbook
GET /explorer/:network/orderbook?selling=ASSET&buying=ASSET

# Trade Aggregations (OHLCV)
GET /explorer/:network/trade-aggregations?base=ASSET&counter=ASSET&start_time=&end_time=&resolution=
```

---

## 🔀 PATHS

```bash
# Strict Receive (find paths to receive exact amount)
GET /explorer/:network/paths/strict-receive?source=GA...&destination=GB...&destination_asset=ASSET&destination_amount=100

# Strict Send (find paths to send exact amount)
GET /explorer/:network/paths/strict-send?source_asset=ASSET&source_amount=100&destination=GB...
```

---

## 💧 LIQUIDITY POOLS

```bash
# List Pools
GET /explorer/:network/liquidity-pools/list?limit=50&cursor=

# Single Pool
GET /explorer/:network/liquidity-pools/:poolId
```

---

## 🎁 CLAIMABLE BALANCES

```bash
# List Claimable Balances
GET /explorer/:network/claimable-balances/list?limit=50&cursor=
GET /explorer/:network/claimable-balances/list?claimant=GA...
GET /explorer/:network/claimable-balances/list?asset=ASSET&sponsor=GA...

# Single Claimable Balance
GET /explorer/:network/claimable-balances/:balanceId
```

---

## 💸 FEE STATS

```bash
GET /explorer/:network/fee-stats
```

Returns current network fee statistics.

---

## 🔴 STREAMING (Server-Sent Events)

```bash
# Live Transactions
GET /stream/transactions/:network

# Live Ledgers
GET /stream/ledgers/:network
```

Use with EventSource in browser or curl -N for continuous streaming.

---

## 📝 EXAMPLES

### Get Latest Ledgers
```bash
curl "http://localhost:3000/explorer/public/ledger/recent?limit=5" | jq '.'
```

### Get Account Details
```bash
curl "http://localhost:3000/explorer/public/account/GAAZI4TCR3TY5OJHCTJC2A4QM6OQGR2O5HFZZEDC2LGDCWNLMXYPVUQZ/details" | jq '.account_id'
```

### Get Account Transactions
```bash
curl "http://localhost:3000/explorer/public/account/GAAZI4TCR3TY5OJHCTJC2A4QM6OQGR2O5HFZZEDC2LGDCWNLMXYPVUQZ/transactions?limit=10" | jq '.records | length'
```

### List Assets
```bash
curl "http://localhost:3000/explorer/public/asset/horizon/list?limit=20" | jq '.records[0]'
```

### Get Fee Stats
```bash
curl "http://localhost:3000/explorer/public/fee-stats" | jq '.'
```

### Stream Live Transactions
```bash
curl -N "http://localhost:3000/stream/transactions/public"
```

---

## 🔧 COMMON PARAMETERS

All list endpoints support:
- `limit` - Max records (1-200, default varies)
- `cursor` - Pagination cursor
- `order` - `asc` or `desc` (default `desc`)

---

## ✅ RESPONSE FORMAT

All endpoints return JSON:

```json
{
  "records": [...],  // For list endpoints
  "_links": {...}    // Pagination links (if applicable)
}
```

Or single object for detail endpoints.

---

## 🚨 ERROR RESPONSES

```json
{
  "error": "Error message",
  "status": 500
}
```

Common status codes:
- `200` - Success
- `404` - Not found
- `500` - Internal server error

---

**All endpoints fetch live data from Stellar Horizon API** ✨
