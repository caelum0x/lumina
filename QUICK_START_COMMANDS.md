# ⚡ Quick Start Commands

## 🎯 Fastest Way to Start

### Option 1: Docker Compose (All-in-One)
```bash
cd /Users/arhansubasi/lumina/lumina
./start.sh
```

Or manually:
```bash
cd /Users/arhansubasi/lumina/lumina
docker-compose up
```

**Access:**
- UI: https://localhost:9001
- 3D View: https://localhost:9001/graph/3d/public
- API: http://localhost:3000

---

## 🔧 Manual Start (For Development)

### Terminal 1: Databases
```bash
cd /Users/arhansubasi/lumina/lumina
docker-compose up mongodb mongodb-archive elasticsearch redis -d
```

### Terminal 2: API
```bash
cd /Users/arhansubasi/lumina/lumina/api
npm install  # First time only
npm start
```

### Terminal 3: UI
```bash
cd /Users/arhansubasi/lumina/lumina/ui
pnpm install  # First time only

# Option A: HTTPS (accept certificate warning)
pnpm dev-server
# Access: https://localhost:9001

# Option B: HTTP (no certificate)
DISABLE_HTTPS=true pnpm dev-server
# Access: http://localhost:9001
```

---

## ✅ Verify Installation

```bash
# Check Docker
docker ps

# Test API
curl http://localhost:3000/explorer/public/ledger/last

# Test UI
curl -k https://localhost:9001
```

---

## 🛑 Stop Services

```bash
# Stop Docker Compose
docker-compose down

# Or press Ctrl+C in the terminal running docker-compose
```

---

## 📚 Full Documentation

- **Startup Guide**: `START_APP.md`
- **Build Fixes**: `BUILD_FIXES.md`
- **Docker Help**: `DOCKER_TROUBLESHOOTING.md`
- **Run Guide**: `RUN_APP.md`

