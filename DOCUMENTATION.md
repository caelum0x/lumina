# Lumina 3D Modern Stellar Explorer - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [API Server](#api-server)
4. [Frontend Application](#frontend-application)
5. [Data Storage](#data-storage)
6. [Configuration](#configuration)
7. [Key Components](#key-components)
8. [Development Workflow](#development-workflow)
9. [API Endpoints](#api-endpoints)
10. [Frontend Routes](#frontend-routes)

---

## Project Overview

**Lumina 3D Modern Stellar Explorer** is a comprehensive block explorer and analytics platform for the Stellar Network. It provides:

- **3D Visualization**: Real-time 3D galaxy visualization of Stellar transactions using React Three Fiber
- **Block Explorer**: Browse accounts, transactions, ledgers, and operations
- **Asset Analytics**: Detailed asset information, trading pairs, and market data
- **Account Analytics**: Balance history, trustlines, offers, and account statistics
- **Contract Explorer**: Soroban smart contract exploration and validation
- **Directory Service**: Public directory of accounts, assets, and services
- **Market Data**: OHLCV charts, price tracking, and trading statistics
- **Payment Locator**: Advanced payment tracking and tracing
- **Real-Time Streaming**: Server-Sent Events (SSE) for live transaction updates

### Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React 17, React Router 5, React Three Fiber, Three.js
- **State Management**: Zustand
- **3D Rendering**: React Three Fiber, @react-three/drei
- **Databases**: MongoDB (primary), Elasticsearch (transaction indexing)
- **External Services**: Stellar Horizon API, GitHub (directory management)
- **Build Tools**: Webpack, Babel, PNPM

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend UI   │  React Application (Port 9001)
│   (React/SCSS)  │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   API Server    │  Express.js Server (Port 3000)
│  (Node.js/API)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
┌───▼───┐ ┌──▼───┐    ┌─────▼─────┐
│ MongoDB│ │Elastic│   │  Horizon  │
│        │ │search │   │    API    │
└────────┘ └───────┘   └───────────┘
```

### Project Structure

```
lumina/
├── api/                    # Backend API server
│   ├── api/               # API routing and middleware
│   │   ├── routes/        # Route definitions
│   │   ├── router.js      # Route registration utility
│   │   ├── api-cache.js   # Response caching
│   │   ├── billing.js     # Billing middleware
│   │   └── cors-matcher.js
│   ├── business-logic/    # Core business logic
│   │   ├── account/       # Account-related logic
│   │   ├── asset/         # Asset-related logic
│   │   ├── archive/        # Historical data queries
│   │   ├── contracts/     # Smart contract logic
│   │   ├── dex/           # DEX/market logic
│   │   ├── directory/     # Directory management
│   │   ├── ledger/        # Ledger operations
│   │   └── ...
│   ├── connectors/        # Database connectors
│   │   ├── mongodb-connector.js
│   │   └── elastic-connector.js
│   ├── utils/             # Utility functions
│   └── api.js             # Main entry point
│
└── ui/                     # Frontend React application
    ├── views/             # React components and views
    │   ├── explorer/     # Main explorer views
    │   ├── directory/     # Directory management UI
    │   ├── components/    # Reusable components
    │   └── layout/        # Layout components
    ├── business-logic/    # Frontend business logic
    ├── models/            # Data models
    ├── static/            # Static assets
    ├── open-api/          # OpenAPI documentation
    └── app.js             # Main entry point
```

---

## API Server

### Entry Point
**File**: `api/api.js`

The API server:
1. Initializes MongoDB and Elasticsearch connections
2. Sets up Express middleware (CORS, body parsing, logging)
3. Registers all API routes
4. Handles errors and 404 responses

### Route Registration

Routes are registered using the `router.js` utility which provides:
- **CORS handling**: Whitelist or open CORS policies
- **Caching**: Configurable response caching buckets
- **Billing**: Optional billing middleware for premium endpoints
- **Error handling**: Standardized error responses

### Route Categories

#### Explorer Routes (`api/api/routes/explorer-routes.js`)
Main entry point that registers:
- Transaction routes (`tx-routes.js`)
- Account explorer routes (`account-explorer-routes.js`)
- Asset explorer routes (`asset-explorer-routes.js`)
- Contract explorer routes (`contract-explorer-routes.js`)
- Contract validation routes (`contract-validation-routes.js`)
- Contract data routes (`contract-data-explorer-routes.js`)
- Soroban stats routes (`soroban-stats-explorer-routes.js`)
- Liquidity pool routes (`liquidity-pool-explorer-routes.js`)
- Ledger routes (`ledger-explorer-routes.js`)
- Domain meta routes (`domain-meta-routes.js`)
- Offer routes (`offer-explorer-routes.js`)
- Market routes (`market-explorer-routes.js`)
- Claimable balance routes (`claimable-balance-explorer-routes.js`)
- OAuth routes (`oauth-routes.js`)

#### Other Routes
- **Directory Routes**: Public directory management
- **Payment Routes**: Payment tracking and location
- **Price Routes**: Asset pricing data
- **Ticker Routes**: Asset ticker information
- **Relation Routes**: Account relationship graphs
- **Server Info Routes**: Server status and crawler info
- **Demolisher Routes**: Account demolition tool
- **Transaction Stream**: Server-Sent Events endpoint for real-time transaction streaming (`/explorer/:network/tx/stream`)

### Business Logic Layer

Located in `api/business-logic/`, organized by domain:

#### Account (`account/`)
- `account-balances.js`: Account balance queries
- `account-balance-history.js`: Historical balance data
- `account-list.js`: Account listing and filtering
- `account-resolver.js`: Account address resolution
- `account-stats.js`: Account statistics
- `account-stats-history.js`: Historical statistics
- `account-trustlines-value.js`: Trustline valuation
- `account-liquidity-stakes-value.js`: Liquidity stake valuation
- `account-value-estimator.js`: Total account value estimation

#### Asset (`asset/`)
- `asset-descriptor.js`: Asset metadata
- `asset-list.js`: Asset listing
- `asset-meta.js`: Asset metadata management
- `asset-meta-resolver.js`: Asset metadata resolution
- `asset-holders.js`: Asset holder queries
- `asset-price.js`: Price data
- `asset-ohlcvt.js`: OHLCV chart data
- `asset-stats.js`: Asset statistics
- `asset-stats-history.js`: Historical statistics
- `asset-supply.js`: Supply information
- `asset-trading-pairs.js`: Trading pair discovery
- `asset-rating.js`: Asset rating/ranking

#### Archive (`archive/`)
- `archive-ledger-info.js`: Historical ledger queries
- `archive-tx-info.js`: Historical transaction queries
- `archive-locator.js`: Archive location resolution
- `tx-query.js`: Transaction query builder
- `range-constraints.js`: Date range validation

#### Contracts (`contracts/`)
- Contract data queries and validation
- Soroban smart contract support

#### DEX (`dex/`)
- Decentralized exchange operations
- Market data aggregation

#### Directory (`directory/`)
- Directory entry management
- GitHub integration for directory updates

### Caching Strategy

The API uses LRU cache buckets defined in `api/api/api-cache.js`:
- **tx**: 8000 entries, 5 seconds TTL
- **balance**: 8000 entries, 10 seconds TTL
- **stats**: 8000 entries, 2 minutes TTL
- **global-stats**: 8000 entries, 5 minutes TTL
- **search**: 2000 entries, 30 seconds TTL

---

## Frontend Application

### Entry Point
**File**: `ui/app.js`

The frontend:
1. Initializes React application
2. Sets up navigation and routing
3. Configures API endpoints and Horizon URLs
4. Initializes meta tags for SEO
5. Creates toast notification container

### Routing

**File**: `ui/views/router.js`

Main routes:
- `/explorer/:network` - Main explorer interface
- `/graph/3d/:network?` - 3D galaxy visualization of transactions
- `/directory` - Directory management
- `/demolisher/:network` - Account demolition tool
- `/asset-lists` - Asset list management
- `/blog` - Blog posts
- `/info` - Information pages
- `/widget/:network` - Embedded widgets

### View Structure

#### Explorer Views (`views/explorer/`)
- **account/**: Account detail views, balances, history, charts
- **asset/**: Asset detail views, holders, trading pairs, charts
- **tx/**: Transaction detail views, operations, effects
- **ledger/**: Ledger detail views, statistics
- **contract/**: Smart contract views, storage, calls
- **liquidity-pool/**: Liquidity pool views
- **market/**: Market views, trading pairs
- **claimable-balance/**: Claimable balance views
- **offer/**: Offer views and history
- **operation/**: Operation detail views
- **search/**: Search functionality
- **widget/**: Embedded explorer widgets

#### Directory Views (`views/directory/`)
- Directory entry management
- GitHub OAuth integration
- Tag management
- Blocked domains management

#### Components (`views/components/`)
- Reusable UI components
- Chart components (Highcharts integration)
- Layout components
- Form components

### State Management

- Uses React hooks and context for state
- Zustand for 3D visualization state management
- Client-side caching via `@stellar-expert/client-cache`
- Navigation via `@stellar-expert/navigation`

### 3D Visualization

The 3D galaxy view (`/graph/3d/:network`) provides real-time visualization of Stellar transactions:

- **Real-Time Updates**: Connects to SSE endpoint for live transaction stream
- **Visual Types**:
  - Blue spheres: Regular transactions
  - Pink spheres: Whale transactions (>50k XLM)
  - Orange spheres: High fee transactions (>0.1 XLM)
  - Cyan pulsing spheres: Soroban smart contract invocations
- **Interactions**: Click to focus, drag to rotate, scroll to zoom
- **Features**:
  - Top whales leaderboard
  - Transaction statistics (count, volume, tx/sec)
  - Connection beams between accounts
  - Post-processing effects (bloom, trails)

### Styling

- SCSS modules for component styling
- CSS variables for theming
- Responsive design with mobile support

---

## Data Storage

### MongoDB

**Primary Database**: Stores ledger data, accounts, assets, transactions

**Connection**: Configured per network in `app.config.json`
- Main database: Stores current ledger state
- Archive database: Stores historical data

**Collections** (inferred):
- Accounts
- Assets
- Transactions
- Ledgers
- Operations
- Trustlines
- Offers
- Liquidity pools
- Contracts

### Elasticsearch

**Transaction Index**: Full-text search and querying of transactions

**Index Pattern**: `{opIndex}-{year}` (e.g., `se-tx-pubnet000-2024`)

**Use Cases**:
- Transaction search
- Operation queries
- Historical transaction lookups

### External Services

- **Stellar Horizon**: Real-time Stellar network data
- **GitHub**: Directory repository management
- **OAuth Providers**: GitHub OAuth for directory management

---

## Configuration

### API Configuration (`api/app.config.json`)

```json
{
  "port": 3000,
  "apiCacheDisabled": false,
  "networks": {
    "public": {
      "db": "mongodb://...",
      "archive": "mongodb://...",
      "opIndex": "se-tx-pubnet000",
      "horizon": "https://horizon.stellar.org",
      "network": "PUBLIC"
    },
    "testnet": { ... }
  },
  "elastic": "http://localhost:9201",
  "directory": {
    "repository": "owner/repo",
    "accessToken": "...",
    "admins": ["username"]
  },
  "oauth": {
    "github": {
      "clientId": "...",
      "secret": "..."
    }
  },
  "corsWhitelist": ["http://localhost:3000"],
  "billing": {
    "billingServerUrl": "ws://...",
    "pricing": { ... }
  }
}
```

### Frontend Configuration (`ui/app.config.json`)

```json
{
  "apiEndpoint": "http://localhost:3000",
  "networks": {
    "public": {
      "title": "public",
      "horizon": "https://horizon.stellar.org",
      "passphrase": "Public Global Stellar Network ; September 2015"
    }
  },
  "directoryAdmins": ["username"],
  "oauth": {
    "github": {
      "clientId": "..."
    }
  }
}
```

---

## Key Components

### API Components

#### Router (`api/api/router.js`)
- Route registration utility
- CORS middleware integration
- Caching middleware
- Billing middleware
- Error handling

#### MongoDB Connector (`api/connectors/mongodb-connector.js`)
- Connection pooling
- Multi-network support
- Archive database support

#### Elasticsearch Connector (`api/connectors/elastic-connector.js`)
- Index enumeration
- Year-based index boundaries
- Network-specific indexes

#### API Helpers (`api/business-logic/api-helpers.js`)
- Pagination utilities
- Query normalization
- Response formatting

### Frontend Components

#### Router (`ui/views/router.js`)
- React Router configuration
- Code splitting with Loadable
- Route guards and redirects

#### Layout (`ui/views/layout/`)
- Main layout wrapper
- Top menu
- Footer
- Network switcher
- Theme selector

#### Explorer Components
- Account views with charts and history
- Asset views with market data
- Transaction views with operation details
- Contract views with storage and calls

---

## Development Workflow

### Setup

1. **Install API dependencies**:
   ```bash
   cd api
   npm install
   ```

2. **Install Frontend dependencies**:
   ```bash
   cd ui
   pnpm install
   ```

3. **Configure**:
   - Copy `api/example.app.config.json` to `api/app.config.json`
   - Edit `ui/app.config.json`

4. **Start API server**:
   ```bash
   cd api
   npm start
   # or with verbose logging:
   MODE=development npm start
   ```

5. **Start Frontend dev server**:
   ```bash
   cd ui
   pnpm dev-server
   ```

### Build

**Frontend Production Build**:
```bash
cd ui
pnpm build
```

**OpenAPI Documentation**:
```bash
cd ui
pnpm build-api-docs
```

### Environment Variables

- `PORT`: Override API server port
- `MODE=development`: Enable verbose HTTP logging

---

## API Endpoints

### Base URL Structure

All explorer endpoints follow the pattern:
```
/explorer/:network/{resource}
```

Where `:network` is `public` or `testnet`.

### Endpoint Categories

#### Accounts
- `GET /explorer/:network/account/:address` - Account details
- `GET /explorer/:network/account/:address/balances` - Account balances
- `GET /explorer/:network/account/:address/history` - Account history
- `GET /explorer/:network/account/:address/stats` - Account statistics

#### Assets
- `GET /explorer/:network/asset/:asset` - Asset details
- `GET /explorer/:network/asset/:asset/holders` - Asset holders
- `GET /explorer/:network/asset/:asset/stats` - Asset statistics
- `GET /explorer/:network/asset/:asset/price` - Asset price data

#### Transactions
- `GET /explorer/:network/tx/:hash` - Transaction details
- `GET /explorer/:network/tx/:hash/effects` - Transaction effects

#### Ledgers
- `GET /explorer/:network/ledger/:sequence` - Ledger details
- `GET /explorer/:network/ledger/stats` - Ledger statistics

#### Contracts
- `GET /explorer/:network/contract/:address` - Contract details
- `GET /explorer/:network/contract/:address/storage` - Contract storage

#### Directory
- `GET /explorer/directory` - List directory entries
- `POST /explorer/directory` - Create directory entry (OAuth required)

#### Markets
- `GET /explorer/:network/market/:pair` - Market data
- `GET /explorer/:network/market/:pair/candles` - OHLCV data

#### Real-Time Streaming
- `GET /explorer/:network/tx/stream` - Server-Sent Events stream for real-time transactions
  - Query parameters:
    - `limit` (default: 200) - Maximum transactions per batch
    - `includeEffects` (default: false) - Include transaction effects
    - `minAmount` - Filter transactions by minimum amount
  - Returns: SSE stream with transaction data
  - Format: Each event contains JSON transaction object with:
    - `id`, `hash`, `amount`, `fee_charged`, `source_account`
    - `isWhale` (boolean), `highFee` (boolean), `isSoroban` (boolean)
    - `successful`, `created_at`, `ledger`, `operations`

### Response Format

All endpoints return JSON following Stellar Horizon API conventions:
```json
{
  "_links": {
    "self": { "href": "..." },
    "next": { "href": "..." },
    "prev": { "href": "..." }
  },
  "_embedded": {
    "records": [...]
  }
}
```

---

## Frontend Routes

### Main Routes

- `/explorer/public` - Public network explorer (default)
- `/explorer/testnet` - Testnet explorer
- `/explorer/:network/account/:address` - Account view
- `/explorer/:network/asset/:asset` - Asset view
- `/explorer/:network/tx/:hash` - Transaction view
- `/explorer/:network/ledger/:sequence` - Ledger view
- `/explorer/:network/contract/:address` - Contract view
- `/directory` - Directory management
- `/demolisher/:network` - Account demolition tool
- `/asset-lists` - Asset list management
- `/blog` - Blog posts
- `/info` - Information pages

### URL Patterns

- **Account**: `/explorer/:network/account/{address}`
- **Asset**: `/explorer/:network/asset/{code}:{issuer}` or `/explorer/:network/asset/{assetId}`
- **Transaction**: `/explorer/:network/tx/{hash}`
- **Ledger**: `/explorer/:network/ledger/{sequence}`
- **Contract**: `/explorer/:network/contract/{address}`

---

## Additional Notes

### CORS Policy

- Whitelist-based CORS for most endpoints
- Open CORS for public directory endpoints
- Billing-processed requests bypass CORS restrictions

### Caching

- API responses are cached using LRU cache
- Cache TTL varies by endpoint type
- Cache can be disabled via `apiCacheDisabled` config

### Billing

- Some premium endpoints require billing
- Billing is handled via WebSocket connection
- Returns 402 Payment Required if billing fails

### Error Handling

- Standardized error responses
- CORS errors return 403
- Validation errors return 400
- Server errors return 500
- Not found returns 404

### Security

- Proxy validation for certain endpoints
- OAuth authentication for directory management
- Turnstile CAPTCHA for public forms
- CORS whitelist enforcement

---

## Future Improvements (TBD)

As noted in README:
- Provide access credentials for test database
- Review and migrate existing tests
- Transfer issues from team bugtracker to GitHub Issues

---

*Last Updated: Based on codebase exploration*
*Version: API v0.28.7, UI v0.28.16*

