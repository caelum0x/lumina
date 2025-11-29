# Lumina 3D Block Explorer - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone <repository-url>
cd lumina

# 2. Start all services
docker-compose up

# 3. Open browser
# UI: http://localhost:9001
# 3D View: http://localhost:9001/graph/3d/public
```

That's it! All services (MongoDB, Elasticsearch, API, UI) will start automatically.

### Option 2: Manual Setup

```bash
# 1. Install dependencies
cd api && npm install
cd ../ui && pnpm install

# 2. Start databases (Docker)
docker-compose up mongodb mongodb-archive elasticsearch

# 3. Start API (Terminal 1)
cd api && npm start

# 4. Start UI (Terminal 2)
cd ui && pnpm dev-server

# 5. Open http://localhost:9001
```

## 📋 Prerequisites

- **Docker:** [Install Docker](https://docs.docker.com/get-docker/)
- **Node.js 20+:** [Install Node.js](https://nodejs.org/)
- **pnpm:** `npm install -g pnpm`

## 🎯 Key Features

### 3D Galaxy Visualization
Navigate to `/graph/3d/public` to see:
- Real-time transaction particles
- Whale detection (pink spheres >50k XLM)
- Soroban contracts (cyan pulsing)
- Interactive camera controls
- Time travel mode
- Network topology view

### AI-Powered Insights
1. Get OpenRouter API key: https://openrouter.ai/keys
2. Go to Settings → AI Configuration
3. Enter API key
4. Toggle AI Insights in 3D view

### Smart Search
- Search accounts, transactions, assets
- AI-powered query understanding
- Instant suggestions

## 🔧 Configuration

### Environment Variables

**API (.env):**
```bash
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27087/se_pub802
ELASTICSEARCH_URL=http://localhost:9201
```

**UI (.env):**
```bash
REACT_APP_API_ENDPOINT=http://localhost:3000
REACT_APP_ENABLE_3D_VIEW=true
```

See `.env.example` files for all options.

## 🧪 Testing

```bash
# Unit tests
cd api && npm test
cd ui && pnpm test

# E2E tests
npx playwright test

# Watch mode
npm test -- --watch
```

## 📚 Documentation

- **Development:** [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Docs:** [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Restart
docker-compose restart mongodb
```

### 3D View Not Loading
1. Check WebGL support: https://get.webgl.org/
2. Check browser console for errors
3. Try reducing particles: `REACT_APP_3D_MAX_PARTICLES=1000`

### SSE Connection Issues
1. Check API is running: `curl http://localhost:3000/health`
2. Check CORS in `api/.env`
3. Check browser console

## 🎨 Customization

### Change Whale Threshold
```bash
# In ui/.env
REACT_APP_3D_WHALE_THRESHOLD=100000  # 100k XLM
```

### Adjust Performance
```bash
# In ui/.env
REACT_APP_3D_MAX_PARTICLES=1000  # Lower for better FPS
REACT_APP_3D_TARGET_FPS=30       # Lower target FPS
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.

## 📞 Support

- **Issues:** GitHub Issues
- **Docs:** See documentation files
- **Community:** [Stellar Discord](https://discord.gg/stellar)

## 🎉 What's Next?

1. ✅ Explore 3D visualization
2. ✅ Try AI insights
3. ✅ Search for accounts/transactions
4. ✅ Toggle different view modes
5. ✅ Experiment with filters

Enjoy exploring the Stellar Network in 3D! 🌌
