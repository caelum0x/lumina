# Navigation Test Checklist

## Date: 2025-11-29

## How to Test

1. Open browser to `http://localhost:9001`
2. Click through each link below
3. Mark ✅ if page loads without errors
4. Mark ❌ if page crashes or shows errors

## Main Navigation (Top Menu)

- [ ] **Home** - `/` → Should redirect to `/explorer/public`
- [ ] **Explorer** - `/explorer/public`
- [ ] **Assets** - `/explorer/public/asset`
- [ ] **Markets** - `/explorer/public/market`
- [ ] **Liquidity Pools** - `/explorer/public/liquidity-pool`
- [ ] **Network Activity** - `/explorer/public/network-activity`
- [ ] **3D Graph** - `/graph/3d/public`
- [ ] **Directory** - `/directory`

## Core Detail Pages

### From Homepage
- [ ] Click on a **ledger number** → Should go to `/explorer/public/ledger/:sequence`
- [ ] Click on a **transaction hash** → Should go to `/explorer/public/tx/:hash`
- [ ] Click on an **account address** → Should go to `/explorer/public/account/:address`

### From Assets Page
- [ ] Click on an **asset** → Should go to `/explorer/public/asset/:asset`

### From Markets Page
- [ ] Click on a **market pair** → Should go to `/explorer/public/market/:selling/:buying`

### From Liquidity Pools Page
- [ ] Click on a **pool** → Should go to `/explorer/public/liquidity-pool/:id`

## Search Functionality

- [ ] Search for **account address** (e.g., `GABC...`)
- [ ] Search for **transaction hash** (e.g., `abc123...`)
- [ ] Search for **ledger sequence** (e.g., `60072113`)
- [ ] Search for **asset** (e.g., `USDC`)

## Error Handling

- [ ] Navigate to invalid URL → Should show 404 page
- [ ] Navigate to non-existent account → Should show error message with retry
- [ ] Navigate to non-existent transaction → Should show error message with retry
- [ ] Disconnect internet and reload → Should show error with retry button

## 3D Graph Page

- [ ] Page loads without errors
- [ ] 3D visualization renders
- [ ] Transactions appear as spheres
- [ ] Can rotate/zoom the view
- [ ] Connection status shows "connected"

## Mobile Responsiveness (Optional)

- [ ] Homepage looks good on mobile
- [ ] Tables are scrollable on mobile
- [ ] Navigation menu works on mobile
- [ ] 3D graph works on mobile (or shows fallback)

## Performance

- [ ] Homepage loads in < 2 seconds
- [ ] No console errors on any page
- [ ] API requests complete in < 500ms
- [ ] No memory leaks after 5 minutes of browsing

## Expected Results

All pages should:
1. Load without console errors
2. Show loading states while fetching data
3. Show error messages with retry buttons if data fails to load
4. Be navigable via browser back/forward buttons
5. Have proper page titles

## Known Issues

None currently - all endpoints returning proper data.

## Quick Test Commands

```bash
# Test API endpoints
curl http://localhost:3000/explorer/public/ledger/recent?limit=1
curl http://localhost:3000/explorer/public/tx/recent?limit=1
curl http://localhost:3000/explorer/public/liquidity-pool?limit=1
curl http://localhost:3000/explorer/public/network/stats

# Check frontend is running
curl http://localhost:9001

# Check for console errors (open browser console)
# Should see no red errors
```

## Automated Test (Quick Check)

```bash
# Test that all main pages return 200
for path in "/" "/explorer/public" "/explorer/public/asset" "/explorer/public/market" "/explorer/public/liquidity-pool" "/graph/3d/public"; do
  echo "Testing $path..."
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:9001$path"
  echo ""
done
```
