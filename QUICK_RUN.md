# ⚡ Quick Run Guide

## 🚨 Current Issue: Docker Not Running

**Status:** Docker is installed but Docker Desktop is not running.

---

## ✅ Quick Fix

### Start Docker Desktop

**macOS:**
```bash
# Option 1: Open Docker Desktop app
open -a Docker

# Option 2: Via Applications folder
open /Applications/Docker.app
```

**Wait for Docker to start:**
- Look for Docker whale icon in menu bar (top right)
- Wait until it shows "Docker Desktop is running"
- This may take 30-60 seconds

**Verify Docker is running:**
```bash
docker ps
# Should show containers or empty list (not an error)
```

---

## 🚀 Then Run the App

Once Docker is running:

```bash
# Start all services
docker-compose up

# Or in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access:**
- UI: http://localhost:9001
- 3D View: http://localhost:9001/graph/3d/public
- API: http://localhost:3000

---

## 🔄 Alternative: Run Without Docker

If you prefer not to use Docker:

### Step 1: Start Databases Only (Optional)

If you have MongoDB/Elasticsearch running locally, skip this.

Otherwise, start only databases with Docker:
```bash
# Start just databases
docker-compose up mongodb mongodb-archive elasticsearch redis -d
```

### Step 2: Run API and UI Manually

**Terminal 1 - API:**
```bash
cd api
npm start
```

**Terminal 2 - UI:**
```bash
cd ui
pnpm dev-server
```

---

## ✅ Fixed Issues

1. ✅ **Docker Compose version warning** - Removed obsolete `version: '3.8'` from docker-compose.yml
2. ⚠️ **Docker daemon** - Need to start Docker Desktop manually

---

## 📋 Checklist

- [ ] Docker Desktop is running (check menu bar icon)
- [ ] `docker ps` command works
- [ ] Run `docker-compose up`
- [ ] Access http://localhost:9001

---

**See `DOCKER_TROUBLESHOOTING.md` for more help.**

