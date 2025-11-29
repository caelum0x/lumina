# Connection Refused - FIXED ✅

**Date:** 2025-11-29 12:53  
**Error:** `ERR_CONNECTION_REFUSED` on localhost:9001

---

## Problem

UI dev server was crashing immediately after starting due to invalid webpack configuration:

```
Invalid options object. Dev Server has been initialized using an options object 
that does not match the API schema.
- options.server has an unknown property 'requestCert'
- options.server has an unknown property 'rejectUnauthorized'
```

---

## Root Cause

Webpack dev server config had invalid HTTPS options that are not supported in the current webpack version.

**Old config:**
```javascript
server: {
    type: 'https',
    requestCert: false,        // ❌ Not supported
    rejectUnauthorized: false  // ❌ Not supported
}
```

---

## Solution

Simplified to use HTTP (HTTPS not needed for local development):

**New config:**
```javascript
server: 'http'  // ✅ Simple and works
```

---

## File Modified

**`ui/webpack-config.js`** - Simplified devServer config

---

## Verification

```bash
# Start UI
cd ui && pnpm dev-server

# Test
curl http://localhost:9001
```

**Expected:** HTML response (UI loads)

---

## Now Start Everything

```bash
./start.sh
```

**Access:**
- http://localhost:9001 - UI
- http://localhost:9001/graph/3d/public - 3D View
- http://localhost:3000 - API

---

## Summary

Fixed webpack config → UI now starts successfully → No more connection refused! 🚀
