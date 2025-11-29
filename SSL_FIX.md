# 🔒 SSL Certificate Fix

## Problem
When accessing `https://localhost:9001`, you see:
- "Your connection is not private" (Turkish: "Bağlantınız özel değil")
- `net::ERR_CERT_AUTHORITY_INVALID`

This is because webpack-dev-server uses a **self-signed SSL certificate** for HTTPS in development.

---

## ✅ Solutions

### Option 1: Accept the Certificate (Recommended for Development)

**Chrome/Edge:**
1. Click "Advanced" (Gelişmiş)
2. Click "Proceed to localhost (unsafe)" (localhost'a devam et)

**Firefox:**
1. Click "Advanced" (Gelişmiş)
2. Click "Accept the Risk and Continue" (Riski kabul et ve devam et)

**Safari:**
1. Click "Show Details" (Ayrıntıları göster)
2. Click "visit this website" (bu web sitesini ziyaret et)

---

### Option 2: Use HTTP Instead of HTTPS

**Start UI with HTTP:**
```bash
cd ui
DISABLE_HTTPS=true pnpm dev-server
```

Then access: **http://localhost:9001** (note: `http` not `https`)

---

### Option 3: Add Certificate Exception (Permanent Fix)

**Chrome:**
1. Visit `https://localhost:9001`
2. Click the lock icon in address bar
3. Click "Certificate" (Sertifika)
4. Click "Install Certificate" (Sertifikayı yükle)
5. Choose "Current User" (Mevcut kullanıcı)
6. Select "Trusted Root Certification Authorities" (Güvenilen kök sertifika yetkilileri)

---

## 🔧 Quick Fix Commands

### Use HTTP (Easiest)
```bash
# Terminal 3: UI with HTTP
cd /Users/arhansubasi/lumina/lumina/ui
DISABLE_HTTPS=true pnpm dev-server
```

Access: **http://localhost:9001**

### Or Accept Certificate Once
Just click "Advanced" → "Proceed to localhost" when you see the warning.

---

## 📝 Updated Startup Commands

### Option A: HTTPS (with certificate warning)
```bash
cd /Users/arhansubasi/lumina/lumina/ui
pnpm dev-server
# Access: https://localhost:9001 (accept certificate warning)
```

### Option B: HTTP (no certificate needed)
```bash
cd /Users/arhansubasi/lumina/lumina/ui
DISABLE_HTTPS=true pnpm dev-server
# Access: http://localhost:9001
```

---

## ⚠️ Note

The self-signed certificate is **safe for local development**. It's only used on `localhost` and cannot be used by attackers to intercept your traffic.

