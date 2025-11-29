# 🚀 How to Run the Entire Lumina 3D App

Complete guide to running the Lumina 3D Modern Stellar Explorer application.

---

## 📋 Prerequisites

Before running the app, ensure you have:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm** - Install with `npm install -g pnpm`
- **MongoDB** - Running locally or accessible
- **Elasticsearch** - Running locally or accessible
- **Docker** (Optional) - For containerized setup

---

## 🎯 Quick Start (Recommended)

### Option 1: Docker Compose (Easiest)

If you have Docker installed, this is the simplest way:

```bash
# 1. Clone/navigate to project
cd /Users/arhansubasi/lumina/lumina

# 2. Set up environment variables
./setup-env.sh

# 3. Start all services (MongoDB, Elasticsearch, API, UI)
docker-compose up

# 4. Open in browser
# API: http://localhost:3000
# UI: http://localhost:9001
# 3D View: http://localhost:9001/graph/3d/public
```

**What this starts:**
- MongoDB on port `27087`
- MongoDB Archive on port `40217`
- Elasticsearch on port `9201`
- API server on port `3000`
- UI dev server on port `9001`

---

### Option 2: Manual Setup (Development)

For development with hot-reload:

#### Step 1: Install Dependencies

```bash
# Install API dependencies
cd api
npm install

# Install UI dependencies
cd ../ui
pnpm install
```

#### Step 2: Set Up Environment Variables

```bash
# Run setup script (creates .env files)
cd ..
./setup-env.sh

# Or manually create .env files:

# api/.env
cat > api/.env << EOF
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/stellar_explorer
MONGODB_ARCHIVE_URI=mongodb://127.0.0.1:27017/stellar_archive
ELASTICSEARCH_URL=http://localhost:9200
HORIZON_URL_PUBLIC=https://horizon.stellar.org
HORIZON_URL_TESTNET=https://horizon-testnet.stellar.org
ENABLE_3D_STREAM=true
ENABLE_SSE_STREAMING=true
EOF

# ui/.env
cat > ui/.env << EOF
REACT_APP_API_ENDPOINT=http://localhost:3000
REACT_APP_DEFAULT_NETWORK=public
REACT_APP_ENABLE_3D_VIEW=true
REACT_APP_ENABLE_SSE_STREAMING=true
EOF
```

#### Step 3: Start Databases

**Option A: Using Docker (Recommended)**
```bash
# Start only databases
docker-compose up mongodb mongodb-archive elasticsearch -d
```

**Option B: Local Installation**
- Start MongoDB: `mongod --port 27017`
- Start Elasticsearch: `elasticsearch` (or via service)

#### Step 4: Start API Server

```bash
# Terminal 1
cd api
npm start

# Or with verbose logging:
MODE=development npm start

# API will be available at http://localhost:3000
```

#### Step 5: Start UI Dev Server

```bash
# Terminal 2
cd ui
pnpm dev-server

# UI will be available at http://localhost:9001
# Hot-reload enabled for development
```

#### Step 6: Open in Browser

- **Main App:** http://localhost:9001
- **3D Visualization:** http://localhost:9001/graph/3d/public
- **API Docs:** http://localhost:3000/openapi.html
- **API Health:** http://localhost:3000/explorer/public/ledger/last

---

## 🔧 Configuration

### API Configuration

**File:** `api/app.config.json`

Key settings:
```json
{
  "apiEndpoint": "http://localhost:3000",
  "networks": {
    "public": {
      "db": "mongodb://127.0.0.1:27017/stellar_explorer",
      "archive": "mongodb://127.0.0.1:27017/stellar_archive",
      "horizon": "https://horizon.stellar.org"
    }
  }
}
```

### UI Configuration

**File:** `ui/app.config.json`

Key settings:
```json
{
  "apiEndpoint": "http://localhost:3000",
  "networks": {
    "public": {
      "horizon": "https://horizon.stellar.org",
      "title": "Public Network"
    }
  }
}
```

---

## 🎮 Running Specific Features

### 3D Visualization

```bash
# 1. Ensure API is running
cd api && npm start

# 2. Ensure UI is running
cd ui && pnpm dev-server

# 3. Navigate to:
# http://localhost:9001/graph/3d/public
```

### AI Insights (Optional)

1. Get OpenRouter API key: https://openrouter.ai/keys
2. Add to `ui/.env`:
   ```bash
   REACT_APP_OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
3. Or configure in UI: Settings → AI Configuration
4. Toggle AI Insights in 3D view overlay

### Real-Time Transaction Stream

The SSE endpoint is automatically available when API is running:
```
http://localhost:3000/explorer/public/tx/stream
```

Test with curl:
```bash
curl -N http://localhost:3000/explorer/public/tx/stream
```

---

## 🐛 Troubleshooting

### API Won't Start

**Issue:** Port 3000 already in use
```bash
# Change port in api/.env
PORT=3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Issue:** MongoDB connection error
```bash
# Check MongoDB is running
mongosh mongodb://127.0.0.1:27017

# Or check Docker container
docker ps | grep mongo
```

**Issue:** Elasticsearch connection error
```bash
# Check Elasticsearch is running
curl http://localhost:9200

# Or check Docker container
docker ps | grep elasticsearch
```

### UI Won't Start

**Issue:** Port 9001 already in use
```bash
# Change port in ui/webpack-config.js or use different port
PORT=9002 pnpm dev-server
```

**Issue:** API endpoint not found
```bash
# Check API is running
curl http://localhost:3000/explorer/public/ledger/last

# Update ui/.env
REACT_APP_API_ENDPOINT=http://localhost:3000
```

**Issue:** 3D dependencies missing
```bash
# Reinstall dependencies
cd ui
pnpm install

# Verify Three.js is installed
pnpm list three @react-three/fiber @react-three/drei zustand
```

### 3D Visualization Issues

**Issue:** Black screen / WebGL error
- Check browser console for errors
- Ensure GPU acceleration is enabled
- Try different browser (Chrome/Firefox recommended)
- Check WebGL support: https://get.webgl.org/

**Issue:** No transactions appearing
- Check SSE connection: Open browser DevTools → Network → EventStream
- Verify API endpoint: `http://localhost:3000/explorer/public/tx/stream`
- Check connection status indicator in 3D overlay

---

## 📊 Service Status Check

### Check All Services

```bash
# API Health
curl http://localhost:3000/explorer/public/ledger/last

# MongoDB
mongosh mongodb://127.0.0.1:27017 --eval "db.adminCommand('ping')"

# Elasticsearch
curl http://localhost:9200

# UI (check if dev server is running)
curl http://localhost:9001
```

### Docker Services

```bash
# Check all containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart api
docker-compose restart ui
```

---

## 🚀 Production Build

### Build UI for Production

```bash
cd ui
pnpm build

# Output in ui/public/
# Serve with any static file server
```

### Run API in Production

```bash
cd api
NODE_ENV=production npm start

# Or use PM2 for process management
pm2 start api.js --name lumina-api
```

---

## 📝 Development Scripts

### API Scripts

```bash
cd api

# Start server
npm start

# Start with verbose logging
MODE=development npm start

# Run tests
npm test
```

### UI Scripts

```bash
cd ui

# Start dev server
pnpm dev-server

# Build for production
pnpm build

# Run tests
pnpm test

# Build API docs
pnpm build-api-docs
```

---

## 🎯 Quick Reference

| Service | Port | URL | Command |
|---------|------|-----|---------|
| API | 3000 | http://localhost:3000 | `cd api && npm start` |
| UI | 9001 | http://localhost:9001 | `cd ui && pnpm dev-server` |
| MongoDB | 27017 | mongodb://localhost:27017 | `docker-compose up mongodb` |
| Elasticsearch | 9200 | http://localhost:9200 | `docker-compose up elasticsearch` |
| 3D View | - | http://localhost:9001/graph/3d/public | (via UI) |

---

## ✅ Verification Checklist

After starting, verify everything works:

- [ ] API responds: `curl http://localhost:3000/explorer/public/ledger/last`
- [ ] UI loads: http://localhost:9001
- [ ] 3D view loads: http://localhost:9001/graph/3d/public
- [ ] Transactions appear in 3D view
- [ ] SmartSearch works in top menu
- [ ] Time Travel controls visible
- [ ] AI Insights toggle works (if API key configured)

---

## 🆘 Need Help?

- Check logs: `docker-compose logs` or terminal output
- Review documentation: `README.md`, `QUICK_START.md`
- Check environment variables: `api/.env`, `ui/.env`
- Verify database connections
- Check browser console for frontend errors

---

**Happy Exploring! 🌌**

