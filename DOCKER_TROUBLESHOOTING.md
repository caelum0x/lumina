# Docker Troubleshooting Guide

## Issue: Docker Daemon Not Running

### Error Message
```
unable to get image 'docker.elastic.co/elasticsearch/elasticsearch:8.11.0': 
Cannot connect to the Docker daemon at unix:///Users/arhansubasi/.docker/run/docker.sock. 
Is the docker daemon running?
```

### Solution 1: Start Docker Desktop (macOS)

1. **Open Docker Desktop**
   - Press `Cmd + Space` and search for "Docker"
   - Or open Applications → Docker

2. **Wait for Docker to start**
   - Look for the Docker whale icon in the menu bar
   - Wait until it shows "Docker Desktop is running"

3. **Verify Docker is running**
   ```bash
   docker ps
   # Should show running containers or empty list (not an error)
   ```

4. **Try again**
   ```bash
   docker-compose up
   ```

### Solution 2: Start Docker via Command Line (Linux)

```bash
# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Verify
sudo systemctl status docker
```

### Solution 3: Run Without Docker (Manual Setup)

If you can't use Docker, run the app manually:

#### Step 1: Install MongoDB and Elasticsearch Locally

**macOS (using Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Install Elasticsearch
brew install elasticsearch
brew services start elasticsearch
```

**Or use existing MongoDB/Elasticsearch instances:**
- Update `api/.env` with your connection strings
- MongoDB: `mongodb://127.0.0.1:27017/your_database`
- Elasticsearch: `http://localhost:9200`

#### Step 2: Start API and UI Manually

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

## Issue: Docker Compose Version Warning

### Warning Message
```
WARN[0000] docker-compose.yml: the attribute `version` is obsolete
```

### Fix Applied ✅

The `version: '3.8'` line has been removed from `docker-compose.yml` as it's no longer needed in newer Docker Compose versions.

---

## Quick Commands

### Check Docker Status
```bash
# Check if Docker is running
docker ps

# Check Docker Compose version
docker-compose --version

# Check Docker Desktop status (macOS)
open -a Docker
```

### Start Docker Desktop (macOS)
```bash
# Open Docker Desktop
open -a Docker

# Or via command line
open /Applications/Docker.app
```

### Alternative: Use Only Databases with Docker

If you want to run API/UI manually but use Docker for databases:

```bash
# Start only databases
docker-compose up mongodb mongodb-archive elasticsearch redis -d

# Then run API and UI manually
cd api && npm start
cd ui && pnpm dev-server
```

---

## Verify Everything Works

After starting Docker:

```bash
# 1. Check containers are running
docker-compose ps

# 2. Check logs
docker-compose logs

# 3. Test API
curl http://localhost:3000/explorer/public/ledger/last

# 4. Test UI
curl http://localhost:9001
```

---

## Common Issues

### Port Already in Use

If ports 3000, 9001, 27087, 40217, or 9201 are already in use:

```bash
# Find process using port
lsof -i :3000
lsof -i :9001

# Kill process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Docker Desktop Won't Start

1. **Restart Docker Desktop**
   - Quit Docker Desktop completely
   - Reopen it
   - Wait for full startup

2. **Reset Docker Desktop** (if needed)
   - Docker Desktop → Settings → Troubleshoot → Reset to factory defaults

3. **Check system resources**
   - Ensure you have enough RAM (Docker needs ~4GB)
   - Close other resource-intensive apps

### Permission Denied

**Linux:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or:
newgrp docker
```

---

## Next Steps

Once Docker is running:

```bash
# Start all services
docker-compose up

# Or in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

**Need more help?** Check `RUN_APP.md` for complete setup instructions.

