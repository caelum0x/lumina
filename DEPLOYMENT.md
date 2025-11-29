# Lumina Deployment Guide

## Production Deployment

### Prerequisites

- Docker & Docker Compose
- Domain name with SSL certificate
- MongoDB cluster (or managed service)
- Elasticsearch cluster (or managed service)
- CI/CD pipeline (GitHub Actions configured)

## Deployment Options

### Option 1: Docker Compose (Simple)

```bash
# Production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Kubernetes (Scalable)

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

### Option 3: Cloud Platforms

#### AWS

- **API:** ECS/Fargate or EC2
- **UI:** S3 + CloudFront
- **MongoDB:** DocumentDB
- **Elasticsearch:** OpenSearch Service

#### Google Cloud

- **API:** Cloud Run or GKE
- **UI:** Cloud Storage + Cloud CDN
- **MongoDB:** MongoDB Atlas
- **Elasticsearch:** Elastic Cloud

#### Azure

- **API:** Container Instances or AKS
- **UI:** Blob Storage + CDN
- **MongoDB:** Cosmos DB
- **Elasticsearch:** Elastic Cloud

## Environment Configuration

### Production Environment Variables

**API (.env.production):**
```bash
NODE_ENV=production
PORT=3000

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lumina
MONGODB_ARCHIVE_URI=mongodb+srv://user:pass@cluster.mongodb.net/lumina_archive

ELASTICSEARCH_URL=https://elasticsearch.example.com:9200

HORIZON_URL_PUBLIC=https://horizon.stellar.org
HORIZON_URL_TESTNET=https://horizon-testnet.stellar.org

API_CACHE_DISABLED=false

CORS_WHITELIST=https://lumina.network,https://www.lumina.network

SENTRY_DSN=https://xxx@sentry.io/xxx

ENABLE_3D_STREAM=true
ENABLE_SSE_STREAMING=true
```

**UI (.env.production):**
```bash
NODE_ENV=production

REACT_APP_API_ENDPOINT=https://api.lumina.network
REACT_APP_DEFAULT_NETWORK=public

REACT_APP_HORIZON_URL_PUBLIC=https://horizon.stellar.org
REACT_APP_HORIZON_URL_TESTNET=https://horizon-testnet.stellar.org

REACT_APP_ENABLE_3D_VIEW=true
REACT_APP_ENABLE_SSE_STREAMING=true
REACT_APP_ENABLE_VR_MODE=true

REACT_APP_3D_MAX_PARTICLES=2000
REACT_APP_3D_TARGET_FPS=60

REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Build Process

### UI Build

```bash
cd ui
pnpm install --frozen-lockfile
pnpm build

# Output: ui/public/
# Deploy to CDN or static hosting
```

### API Build

```bash
cd api
npm ci --only=production

# Run with PM2 or Docker
```

## Monitoring Setup

### Sentry

1. Create Sentry project
2. Get DSN
3. Add to environment variables
4. Deploy

### Logging

```bash
# Use structured logging
npm install winston

# Configure log aggregation
# - CloudWatch (AWS)
# - Stackdriver (GCP)
# - Application Insights (Azure)
```

### Metrics

```bash
# Prometheus + Grafana
docker-compose -f monitoring/docker-compose.yml up -d
```

## SSL/TLS Configuration

### Let's Encrypt (Free)

```bash
# Using Certbot
certbot certonly --standalone -d lumina.network -d www.lumina.network

# Auto-renewal
certbot renew --dry-run
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name lumina.network;

    ssl_certificate /etc/letsencrypt/live/lumina.network/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lumina.network/privkey.pem;

    # UI
    location / {
        root /var/www/lumina/public;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SSE
    location /explorer/ {
        proxy_pass http://localhost:3000/explorer/;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }
}
```

## Database Setup

### MongoDB

```bash
# Create indexes
mongosh mongodb+srv://cluster.mongodb.net/lumina

use lumina
db.transactions.createIndex({id: 1}, {unique: true})
db.transactions.createIndex({hash: 1}, {unique: true})
db.transactions.createIndex({ledger: 1})
db.transactions.createIndex({created_at: -1})
db.accounts.createIndex({account_id: 1}, {unique: true})
db.assets.createIndex({asset: 1}, {unique: true})
```

### Elasticsearch

```bash
# Create index template
curl -X PUT "https://elasticsearch:9200/_index_template/lumina-tx" \
  -H 'Content-Type: application/json' \
  -d '{
    "index_patterns": ["se-tx-*"],
    "template": {
      "settings": {
        "number_of_shards": 3,
        "number_of_replicas": 1
      }
    }
  }'
```

## Scaling

### Horizontal Scaling

```bash
# Scale API instances
docker-compose up -d --scale api=3

# Load balancer (Nginx)
upstream api_backend {
    server api1:3000;
    server api2:3000;
    server api3:3000;
}
```

### Database Scaling

- **MongoDB:** Replica sets + sharding
- **Elasticsearch:** Multi-node cluster

### Caching

```bash
# Redis for distributed caching
docker run -d -p 6379:6379 redis:7-alpine

# Update API to use Redis
npm install redis
```

## Backup Strategy

### MongoDB Backup

```bash
# Daily backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://..." /backup/20250129
```

### Elasticsearch Backup

```bash
# Snapshot repository
curl -X PUT "https://elasticsearch:9200/_snapshot/backup" \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/backup/elasticsearch"
    }
  }'

# Create snapshot
curl -X PUT "https://elasticsearch:9200/_snapshot/backup/snapshot_1"
```

## Health Checks

### API Health Endpoint

```javascript
// api/api/routes/health.js
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})
```

### Monitoring

```bash
# Uptime monitoring
# - UptimeRobot
# - Pingdom
# - StatusCake
```

## Rollback Procedure

```bash
# Docker
docker-compose down
docker-compose up -d --force-recreate

# Kubernetes
kubectl rollout undo deployment/lumina-api
kubectl rollout undo deployment/lumina-ui
```

## Security Checklist

- [ ] SSL/TLS enabled
- [ ] Environment variables secured
- [ ] Database authentication enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] Secrets rotated regularly
- [ ] Backups tested
- [ ] Monitoring alerts configured

## Performance Optimization

### CDN Configuration

- CloudFlare
- AWS CloudFront
- Fastly

### Compression

```nginx
# Nginx gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Caching Headers

```nginx
# Static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### High Memory Usage

```bash
# Check Node.js memory
node --max-old-space-size=4096 api.js

# Monitor
docker stats
```

### SSE Connection Issues

```bash
# Check nginx timeout
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;

# Check firewall
ufw allow 3000/tcp
```

### Database Performance

```bash
# MongoDB slow queries
db.setProfilingLevel(1, {slowms: 100})
db.system.profile.find().sort({ts: -1}).limit(5)

# Elasticsearch slow logs
curl -X PUT "https://elasticsearch:9200/_cluster/settings" \
  -d '{"transient": {"logger.index.search.slowlog": "DEBUG"}}'
```

## Support

- Documentation: See `DOCUMENTATION.md`
- Issues: GitHub Issues
- Security: security@lumina.network
