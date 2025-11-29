# Lumina 3D Modern Stellar Explorer - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users/Browsers                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
        ┌───────────────▼────────────────┐
        │     Frontend (React App)       │
        │     Port: 9001 (dev)           │
        │     - React 17                 │
        │     - React Router 5           │
        │     - React Three Fiber        │
        │     - Webpack                  │
        └───────────────┬────────────────┘
                        │
                        │ REST API + SSE
                        │
        ┌───────────────▼────────────────┐
        │      API Server (Express)      │
        │      Port: 3000                │
        │      - Express.js              │
        │      - CORS Middleware         │
        │      - Caching Layer           │
        │      - Billing Middleware      │
        │      - SSE Streaming           │
        └───────────────┬────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│   MongoDB    │ │ Elasticsearch│ │  Horizon   │
│  (Primary)   │ │  (Search)    │ │    API     │
│              │ │              │ │            │
│ - Accounts   │ │ - Transactions│ │ - Real-time│
│ - Assets     │ │ - Operations │ │   Data     │
│ - Ledgers    │ │ - Full-text  │ │            │
│ - Archive   │ │   Search     │ │            │
└──────────────┘ └──────────────┘ └────────────┘
```

## Data Flow

### Read Operations
1. User request → Frontend
2. Frontend → API Server
3. API Server → MongoDB/Elasticsearch
4. API Server → Cache (if available)
5. API Server → Frontend
6. Frontend → User

### Real-Time Streaming (SSE)
1. Frontend → API Server (SSE connection)
2. API Server → Transaction Stream (polling)
3. Transaction Stream → MongoDB/Elasticsearch
4. Transaction Stream → Format & Filter
5. API Server → Frontend (SSE events)
6. Frontend → Zustand Store
7. Zustand Store → 3D Visualization (React Three Fiber)
8. 3D Scene → User (rendered particles)

### Write Operations (Directory)
1. User action → Frontend
2. Frontend → API Server (OAuth authenticated)
3. API Server → GitHub API
4. GitHub → Directory Repository
5. API Server → Frontend
6. Frontend → User

## Component Architecture

### API Layer

```
api/
├── api.js                    # Entry point
├── api/
│   ├── router.js            # Route registration utility
│   ├── api-cache.js         # LRU caching
│   ├── billing.js           # Billing middleware
│   └── routes/              # Route definitions
│       ├── explorer-routes.js
│       ├── account-explorer-routes.js
│       ├── asset-explorer-routes.js
│       └── ...
├── business-logic/          # Domain logic
│   ├── account/
│   ├── asset/
│   ├── archive/
│   └── ...
└── connectors/              # External connections
    ├── mongodb-connector.js
    └── elastic-connector.js
```

### Frontend Layer

```
ui/
├── app.js                   # Entry point
├── views/
│   ├── router.js           # Route configuration
│   ├── explorer/           # Explorer views
│   │   ├── account/
│   │   ├── asset/
│   │   ├── tx/
│   │   └── ...
│   ├── graph/              # Graph visualization
│   │   ├── graph-view.js    # 2D graph
│   │   ├── three-galaxy-view.js  # 3D visualization
│   │   ├── three-galaxy-overlay.js  # UI overlay
│   │   ├── store.js        # Zustand state
│   │   ├── use-stellar-stream.js  # SSE hook
│   │   └── three-graph-router.js
│   ├── components/         # Reusable components
│   └── layout/             # Layout components
├── business-logic/         # Frontend logic
└── models/                 # Data models
```

## Request Processing Flow

### API Request Flow

```
1. HTTP Request
   ↓
2. CORS Middleware
   ↓
3. Body Parser
   ↓
4. Proxy Validator
   ↓
5. Billing Middleware (if applicable)
   ↓
6. Cache Check
   ↓
7. Route Handler
   ↓
8. Business Logic
   ↓
9. Database Query
   ↓
10. Response Formatter
   ↓
11. Cache Store
   ↓
12. HTTP Response
```

### Frontend Request Flow

```
1. User Interaction
   ↓
2. React Component
   ↓
3. Business Logic Hook
   ↓
4. API Call (fetch)
   ↓
5. Client Cache Check
   ↓
6. HTTP Request to API
   ↓
7. Response Processing
   ↓
8. State Update
   ↓
9. Component Re-render
```

## Database Architecture

### MongoDB Collections

```
Network Database (per network: public/testnet)
├── accounts
├── assets
├── transactions
├── ledgers
├── operations
├── trustlines
├── offers
├── liquidity_pools
└── contracts

Archive Database (per network)
├── historical_ledgers
├── historical_transactions
└── historical_operations
```

### Elasticsearch Indexes

```
Index Pattern: {opIndex}-{year}
Example: se-tx-pubnet000-2024

Indexes:
├── se-tx-pubnet000-2020
├── se-tx-pubnet000-2021
├── se-tx-pubnet000-2022
├── se-tx-pubnet000-2023
└── se-tx-pubnet000-2024
```

## Caching Strategy

### API Caching (LRU Cache)

| Bucket | Size | TTL | Use Case |
|--------|------|-----|----------|
| tx | 8000 | 5s | Transaction queries |
| balance | 8000 | 10s | Balance queries |
| stats | 8000 | 2m | Statistics |
| global-stats | 8000 | 5m | Global statistics |
| search | 2000 | 30s | Search queries |

### Frontend Caching

- Client-side cache via `@stellar-expert/client-cache`
- Browser cache for static assets
- Service worker (potential future enhancement)

## Network Support

### Multi-Network Architecture

```
Configuration:
├── public
│   ├── MongoDB: se_pub802
│   ├── Archive: se_archive
│   ├── Elasticsearch: se-tx-pubnet000
│   └── Horizon: horizon.stellar.org
└── testnet
    ├── MongoDB: se_test802
    ├── Archive: se_test_archive
    ├── Elasticsearch: se-tx-testnet000
    └── Horizon: horizon-testnet.stellar.org
```

## Security Architecture

### Authentication & Authorization

```
Public Endpoints:
├── Explorer endpoints (read-only)
├── Directory listing
└── Asset information

Authenticated Endpoints:
├── Directory management (OAuth)
│   └── GitHub OAuth
└── Billing endpoints
    └── API key/token
```

### CORS Policy

```
Whitelist CORS:
├── Configured origins
└── Billing-processed requests

Open CORS:
└── Public directory endpoints
```

## Scalability Considerations

### Current Architecture
- Single API server instance
- Direct database connections
- In-memory caching

### Future Scalability Options
- Horizontal scaling (multiple API instances)
- Redis for distributed caching
- Database read replicas
- CDN for static assets
- Load balancer

## Technology Stack Summary

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Search**: Elasticsearch
- **Caching**: LRU Cache (in-memory)

### Frontend
- **Framework**: React 17
- **Routing**: React Router 5
- **3D Rendering**: React Three Fiber, Three.js
- **State Management**: Zustand
- **Build**: Webpack
- **Styling**: SCSS
- **Charts**: Highcharts

### External Services
- **Stellar Horizon**: Network data
- **GitHub**: Directory repository
- **OAuth**: GitHub OAuth

## 3D Visualization Architecture

### Real-Time Transaction Streaming
- **SSE Endpoint**: `/explorer/:network/tx/stream`
- **Polling Interval**: 500ms
- **Transaction Stream**: Polls MongoDB/Elasticsearch for new transactions
- **Formatting**: Extracts amount, fee, source, Soroban flag
- **Filtering**: Supports minAmount, limit parameters

### 3D Rendering Pipeline
1. **SSE Connection**: Frontend connects to transaction stream
2. **State Management**: Zustand store receives transactions
3. **3D Scene**: React Three Fiber renders particles
4. **Visualization**:
   - Regular transactions: Blue spheres
   - Whale transactions (>50k XLM): Pink spheres
   - High fee transactions (>0.1 XLM): Orange spheres
   - Soroban contracts: Cyan pulsing spheres
5. **Connections**: Curved beams between accounts
6. **Effects**: Bloom, trails, particle systems

## Deployment Architecture

### Development
```
Local Machine
├── API: localhost:3000
├── Frontend: localhost:9001
├── MongoDB: localhost:27017
└── Elasticsearch: localhost:9201
```

### Production (Inferred)
```
Production Environment
├── API Server(s)
├── Frontend (Static hosting/CDN)
├── MongoDB (Replica Set)
└── Elasticsearch (Cluster)
```

---

*For detailed documentation, see DOCUMENTATION.md*
*For development plan, see PLAN.md*

