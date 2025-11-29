# Lumina Development Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose (for local development)
- Git

## Quick Start with Docker

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd lumina

# Start all services
docker-compose up

# Access the application
# UI: http://localhost:9001
# API: http://localhost:3000
# MongoDB: localhost:27087
# Elasticsearch: localhost:9201
```

## Manual Setup

### 1. Install Dependencies

```bash
# API
cd api
npm install

# UI
cd ui
pnpm install
```

### 2. Configure Environment Variables

```bash
# API
cp api/.env.example api/.env
# Edit api/.env with your configuration

# UI
cp ui/.env.example ui/.env
# Edit ui/.env with your configuration
```

### 3. Start Services

#### Option A: Using Docker for databases only

```bash
# Start MongoDB and Elasticsearch
docker-compose up mongodb mongodb-archive elasticsearch
```

#### Option B: Install locally

**MongoDB:**
```bash
# Install MongoDB 7.0
brew install mongodb-community@7.0  # macOS
# or use your package manager

# Start MongoDB
mongod --port 27087 --dbpath /path/to/data
mongod --port 40217 --dbpath /path/to/archive
```

**Elasticsearch:**
```bash
# Install Elasticsearch 8.11
brew install elasticsearch@8  # macOS

# Configure single-node mode
# Edit /usr/local/etc/elasticsearch/elasticsearch.yml:
# discovery.type: single-node
# xpack.security.enabled: false

# Start Elasticsearch
elasticsearch
```

### 4. Start Application

```bash
# Terminal 1: API Server
cd api
npm start

# Terminal 2: UI Dev Server
cd ui
pnpm dev-server
```

### 5. Access Application

- **UI:** http://localhost:9001
- **API:** http://localhost:3000
- **3D View:** http://localhost:9001/graph/3d/public

## Development Workflow

### Running Tests

```bash
# API tests
cd api
npm test

# UI tests
cd ui
pnpm test

# E2E tests
npx playwright test

# Watch mode
npm test -- --watch
```

### Linting

```bash
# API
cd api
npm run lint

# UI
cd ui
pnpm lint
```

### Building

```bash
# UI production build
cd ui
pnpm build

# Output: ui/public/
```

## Project Structure

```
lumina/
├── api/                    # Backend API
│   ├── api/               # Routes and middleware
│   ├── business-logic/    # Core logic
│   ├── connectors/        # Database connectors
│   ├── utils/             # Utilities
│   └── __tests__/         # Tests
├── ui/                     # Frontend
│   ├── views/             # React components
│   ├── business-logic/    # Frontend logic
│   ├── models/            # Data models
│   └── __tests__/         # Tests
├── e2e/                    # E2E tests
├── docker/                 # Docker configs
└── .github/workflows/      # CI/CD
```

## Key Features

### 3D Visualization

Located in `ui/views/graph/`:
- `three-galaxy-view.js` - Main 3D scene
- `store.js` - Zustand state management
- `use-stellar-stream.js` - SSE connection
- `three-galaxy-overlay.js` - UI overlay

### Real-Time Streaming

- **API Endpoint:** `/explorer/:network/tx/stream`
- **Implementation:** `api/business-logic/archive/tx-stream.js`
- **Frontend Hook:** `ui/views/graph/use-stellar-stream.js`

### AI Integration

- **OpenRouter Client:** `ui/business-logic/ai/openrouter-client.js`
- **Pattern Analyzer:** `ui/business-logic/ai/transaction-pattern-analyzer.js`
- **Smart Search:** `ui/business-logic/ai/smart-search.js`

## Configuration

### API Configuration

Edit `api/app.config.json`:

```json
{
  "port": 3000,
  "networks": {
    "public": {
      "db": "mongodb://...",
      "horizon": "https://horizon.stellar.org"
    }
  }
}
```

### Environment Variables

See `.env.example` files for all available options.

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `ELASTICSEARCH_URL` - Elasticsearch URL
- `REACT_APP_API_ENDPOINT` - API server URL

**Optional:**
- `REACT_APP_OPENROUTER_API_KEY` - For AI features
- `SENTRY_DSN` - For error tracking
- `GITHUB_OAUTH_CLIENT_ID` - For directory management

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
mongosh --port 27087

# Check connection string in .env
MONGODB_URI=mongodb://127.0.0.1:27087/se_pub802
```

### Elasticsearch Issues

```bash
# Check Elasticsearch is running
curl http://localhost:9201/_cluster/health

# Check logs
docker logs lumina-elasticsearch
```

### SSE Connection Issues

1. Check API server is running
2. Check CORS configuration in `api/.env`
3. Check browser console for errors
4. Verify network in URL matches configuration

### 3D Rendering Issues

1. Check WebGL support: https://get.webgl.org/
2. Check browser console for Three.js errors
3. Try reducing `REACT_APP_3D_MAX_PARTICLES`
4. Disable hardware acceleration if needed

## Performance Tips

### Development

- Use `API_CACHE_DISABLED=false` for faster responses
- Reduce `REACT_APP_3D_MAX_PARTICLES` for better FPS
- Use Chrome DevTools Performance tab

### Production

- Enable caching: `API_CACHE_DISABLED=false`
- Use CDN for static assets
- Enable gzip compression
- Use production build: `pnpm build`

## Debugging

### API Debugging

```bash
# Verbose logging
MODE=development npm start

# Debug mode
NODE_ENV=development DEBUG=* npm start
```

### UI Debugging

```bash
# React DevTools
# Install: https://react.dev/learn/react-developer-tools

# Redux DevTools (for Zustand)
# Install: https://github.com/reduxjs/redux-devtools
```

### 3D Debugging

```javascript
// In browser console
window.__THREE_DEVTOOLS__ = true

// Access store
const store = require('./views/graph/store').useStore.getState()
console.log(store.transactions)
```

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand](https://github.com/pmndrs/zustand)
- [OpenRouter](https://openrouter.ai/docs)

## Support

- GitHub Issues: <repository-url>/issues
- Documentation: See `DOCUMENTATION.md`
- Architecture: See `ARCHITECTURE.md`
