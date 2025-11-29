# 🚀 Start Lumina in One Command

## Quick Start

```bash
./start.sh
```

That's it! Everything starts automatically.

---

## What It Does

1. ✅ Cleans up ports (3000, 9001)
2. ✅ Starts databases (MongoDB, Elasticsearch, Redis)
3. ✅ Starts API server (port 3000)
4. ✅ Starts UI dev server (port 9001)

---

## Access Points

- **API Health:** http://localhost:3000/
- **UI:** http://localhost:9001
- **3D View:** http://localhost:9001/graph/3d/public

---

## View Logs

```bash
# API logs
tail -f api.log

# UI logs
tail -f ui.log
```

---

## Stop Everything

```bash
./stop.sh
```

Or press `Ctrl+C` in the terminal running `start.sh`

---

## Alternative: Using npm

```bash
# Install concurrently first
npm install

# Start all services
npm start

# Or use dev mode (shows all logs)
npm run dev
```

---

## First Time Setup

```bash
# Install all dependencies
npm run install:all

# Then start
./start.sh
```

---

## Troubleshooting

### Port Already in Use
```bash
./stop.sh
./start.sh
```

### Databases Not Starting
```bash
docker-compose up mongodb mongodb-archive elasticsearch redis
```

### Need to Rebuild
```bash
cd api && npm install
cd ../ui && pnpm install
./start.sh
```

---

## That's It!

One command to rule them all: `./start.sh` 🚀
