# 🚀 How to Start Lumina 3D Modern Stellar Explorer

## Prerequisites

- **Docker Desktop** installed and running
- **Node.js** v20+ installed
- **pnpm** installed (`npm install -g pnpm`)

---

## Quick Start (Docker Compose - Recommended)

### Step 1: Start Docker Desktop
```bash
# macOS
open -a Docker

# Wait for Docker to fully start (check menu bar icon)
```

### Step 2: Start All Services
```bash
cd /Users/arhansubasi/lumina/lumina

# Start MongoDB, Elasticsearch, Redis, API, and UI
docker-compose up
```

**Access:**
- 🌐 **UI**: https://localhost:9001
- 🎨 **3D View**: https://localhost:9001/graph/3d/public
- 🔌 **API**: http://localhost:3000

---

## Manual Start (Development Mode)

### Step 1: Start Databases with Docker
```bash
cd /Users/arhansubasi/lumina/lumina

# Start only databases
docker-compose up mongodb mongodb-archive elasticsearch redis -d
```

### Step 2: Install Dependencies (First Time Only)

**API:**
```bash
cd api
npm install
```

**UI:**
```bash
cd ui
pnpm install
```

### Step 3: Update React Three Fiber (Fix Compatibility)
```bash
cd ui
pnpm remove @react-three/fiber @react-three/drei
pnpm add @react-three/fiber@^7.0.27 @react-three/drei@^8.15.0
```

### Step 4: Start API Server
```bash
cd api
npm start
```

**API will run on:** http://localhost:3000

### Step 5: Start UI Server (New Terminal)

**Option A: HTTPS (with self-signed certificate warning)**
```bash
cd ui
pnpm dev-server
```
Access: **https://localhost:9001** (you'll need to accept the certificate warning)

**Option B: HTTP (no certificate needed)**
```bash
cd ui
DISABLE_HTTPS=true pnpm dev-server
```
Access: **http://localhost:9001**

**Note:** If you see "Your connection is not private" error, see `SSL_FIX.md` for solutions.

---

## Verify Everything Works

### Check Services
```bash
# Check Docker containers
docker-compose ps

# Test API
curl http://localhost:3000/explorer/public/ledger/last

# Test UI (should return HTML)
curl -k https://localhost:9001
```

### Access Points
- **Main UI**: https://localhost:9001
- **3D Visualization**: https://localhost:9001/graph/3d/public
- **API Health**: http://localhost:3000/explorer/public/ledger/last
- **API Docs**: http://localhost:3000/openapi.html

---

## Troubleshooting

### Docker Not Running
```bash
# Start Docker Desktop
open -a Docker

# Verify Docker is running
docker ps
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :9001

# Kill process
kill -9 <PID>
```

### React Three Fiber Errors
If you see `useId` or `react-dom/client` errors:
```bash
cd ui
pnpm remove @react-three/fiber @react-three/drei
pnpm add @react-three/fiber@^7.0.27 @react-three/drei@^8.15.0
pnpm install
```

### MongoDB Connection Issues
Check `api/app.config.json` has correct MongoDB URLs:
```json
{
  "networks": {
    "public": {
      "db": "mongodb://127.0.0.1:27087/se_pub802",
      "archive": "mongodb://127.0.0.1:40217/se_archive"
    }
  }
}
```

### Clear and Restart
```bash
# Stop all services
docker-compose down

# Remove volumes (if needed)
docker-compose down -v

# Restart
docker-compose up
```

---

## Development Commands

### API
```bash
cd api
npm start          # Start API server
npm test           # Run tests
```

### UI
```bash
cd ui
pnpm dev-server    # Start dev server with hot reload
pnpm build         # Build for production
pnpm test          # Run tests
pnpm lint          # Lint code
```

### Docker
```bash
docker-compose up              # Start all services
docker-compose up -d           # Start in background
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
docker-compose restart api     # Restart specific service
```

---

## Environment Variables

### API (`api/.env`)
```env
MONGODB_URI=mongodb://127.0.0.1:27087/se_pub802
ELASTICSEARCH_URL=http://localhost:9201
HORIZON_URL_PUBLIC=https://horizon.stellar.org
```

### UI (`ui/.env`)
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_OPENROUTER_API_KEY=your_key_here
REACT_APP_OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

---

## Next Steps

1. ✅ **Start Docker Desktop**
2. ✅ **Run `docker-compose up`**
3. ✅ **Access https://localhost:9001**
4. ✅ **Navigate to 3D view: `/graph/3d/public`**

---

**Need help?** Check `BUILD_FIXES.md` for build issues or `DOCKER_TROUBLESHOOTING.md` for Docker problems.

