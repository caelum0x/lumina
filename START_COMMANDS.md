# 🚀 Startup Commands - Corrected

## ✅ Corrected Commands

### Step 1: Start Databases
```bash
cd /Users/arhansubasi/lumina/lumina
docker-compose up mongodb mongodb-archive elasticsearch redis -d
```

**Note:** Added `redis` and `-d` flag (detached mode)

---

### Step 2: Start API (New Terminal)
```bash
cd /Users/arhansubasi/lumina/lumina/api
npm start
```

---

### Step 3: Start UI (New Terminal)
```bash
cd /Users/arhansubasi/lumina/lumina/ui
DISABLE_HTTPS=true pnpm dev-server
```

**Note:** Added `DISABLE_HTTPS=true` to avoid SSL certificate issues

---

## 🎯 Quick Script

Or use the startup script:
```bash
cd /Users/arhansubasi/lumina/lumina
./start-dev.sh
```

This will start databases and show you the commands for API and UI.

---

## 🌐 Access

- **UI**: http://localhost:9001
- **3D View**: http://localhost:9001/graph/3d/public
- **API**: http://localhost:3000

---

## 📋 What Changed

**Original commands:**
```bash
docker-compose up mongodb mongodb-archive elasticsearch  # Missing redis and -d
cd ui && pnpm dev-server  # Missing DISABLE_HTTPS
```

**Corrected:**
```bash
docker-compose up mongodb mongodb-archive elasticsearch redis -d  # Added redis and -d
cd ui && DISABLE_HTTPS=true pnpm dev-server  # Added DISABLE_HTTPS
```

