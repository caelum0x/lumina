# LUMINA - QUICK START GUIDE

## 🚀 Start Everything (3 Commands)

```bash
# Terminal 1 - API Server
cd /Users/arhansubasi/lumina/lumina/api && node api.js

# Terminal 2 - Frontend Dev Server  
cd /Users/arhansubasi/lumina/lumina/ui && pnpm dev-server

# Terminal 3 - Test API
curl "http://localhost:3000/explorer/public/ledger/recent?limit=1" | jq '.'
```

## 🌐 Open in Browser

- **Homepage:** http://localhost:9001
- **3D Explorer:** http://localhost:9001/graph/3d/public
- **Assets:** http://localhost:9001/explorer/public/asset
- **Markets:** http://localhost:9001/explorer/public/market

## 🧪 Test API Endpoints

```bash
# Latest ledgers
curl "http://localhost:3000/explorer/public/ledger/recent?limit=5"

# Latest transactions
curl "http://localhost:3000/explorer/public/tx/recent?limit=5"

# Account details (use any Stellar address)
curl "http://localhost:3000/explorer/public/account/GAAZI4TCR3TY5OJHCTJC2A4QM6OQGR2O5HFZZEDC2LGDCWNLMXYPVUQZ/details"

# Account transactions
curl "http://localhost:3000/explorer/public/account/GAAZI4TCR3TY5OJHCTJC2A4QM6OQGR2O5HFZZEDC2LGDCWNLMXYPVUQZ/transactions?limit=10"

# Live transaction stream (Ctrl+C to stop)
curl -N "http://localhost:3000/stream/transactions/public"
```

## 🐛 Troubleshooting

### API won't start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill if needed
kill -9 <PID>
```

### Frontend won't start
```bash
# Check if port 9001 is in use
lsof -i :9001
# Kill if needed
kill -9 <PID>
```

### API returns errors
```bash
# Check logs
tail -50 /tmp/lumina-api.log
```

### Frontend shows blank page
1. Check browser console (F12)
2. Verify API is running: `curl http://localhost:3000/explorer/public/ledger/recent`
3. Clear browser cache (Cmd+Shift+R on Mac)

## 📊 What Should Work Now

✅ Homepage shows latest ledgers
✅ API returns live data from Horizon
✅ Account pages work
✅ Transaction history works
✅ 3D page connects to stream
✅ Navigation doesn't crash

## 📖 Read More

- `COMPREHENSIVE_PLAN.md` - Full 6-week roadmap
- `IMPLEMENTATION_DONE.md` - What we built
- `STATUS.md` - Current status
- `IMMEDIATE_ACTIONS.md` - Next steps

## 🆘 Need Help?

Check these files in order:
1. `STATUS.md` - Current state
2. `IMPLEMENTATION_DONE.md` - What's implemented
3. `COMPREHENSIVE_PLAN.md` - Future plans
