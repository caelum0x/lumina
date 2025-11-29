# 🚀 Lumina 3D Explorer - Production Deployment Guide

One-click deploy · Auto HTTPS · Zero config · Works forever

## Quick Start (2 Minutes)

### 1. Edit Configuration

Edit `deploy.sh` and set your domain and email:

```bash
DOMAIN="your-domain.com"   # ← CHANGE THIS
EMAIL="you@gmail.com"      # ← CHANGE THIS
```

Also update `nginx.conf`:

```nginx
server_name your-domain.com;  # ← CHANGE THIS
```

### 2. Run Deployment

```bash
chmod +x deploy.sh
./deploy.sh
```

**That's it!** Your explorer is now live at `https://your-domain.com`

## What Gets Deployed

### Services

- **lumina-api** - Node.js API server (port 3000)
- **lumina-frontend** - Nginx serving React frontend (ports 80/443)
- **certbot** - Auto-renewing SSL certificates
- **mongodb** - Main database
- **mongodb-archive** - Archive database
- **elasticsearch** - Search index
- **redis** - Cache layer

### Features

✅ Real Mainnet data (219k+ assets, real pools, real prices)  
✅ No crashes (Invalid asset name fixed)  
✅ Full HTTPS with auto-renew  
✅ 3D view fully alive (whales, pools, validators)  
✅ Zero config after first run

## Management Commands

### View Logs
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### View API Logs Only
```bash
docker compose -f docker-compose.prod.yml logs -f lumina-api
```

### View Frontend Logs Only
```bash
docker compose -f docker-compose.prod.yml logs -f lumina-frontend
```

### Stop Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart
```

### Update and Redeploy
```bash
# Pull latest code
git pull

# Rebuild frontend
cd ui && pnpm build && cd ..

# Restart services
docker compose -f docker-compose.prod.yml restart
```

## SSL Certificate Management

### Manual Renewal
```bash
docker compose -f docker-compose.prod.yml exec certbot certbot renew
```

### Check Certificate Status
```bash
docker compose -f docker-compose.prod.yml exec certbot certbot certificates
```

Certificates auto-renew every 12 hours via the certbot container.

## Troubleshooting

### Port Already in Use

If ports 80 or 443 are already in use:

1. Stop existing web server:
```bash
sudo systemctl stop nginx  # or apache2
```

2. Or change ports in `docker-compose.prod.yml`:
```yaml
ports:
  - "8080:80"    # HTTP
  - "8443:443"   # HTTPS
```

### Frontend Not Building

Ensure you have Node.js and pnpm installed:

```bash
# Install pnpm
npm install -g pnpm

# Or use npm
npm install -g npm
```

### API Not Connecting

Check API logs:
```bash
docker compose -f docker-compose.prod.yml logs lumina-api
```

Verify API is running:
```bash
curl http://localhost:3000/
```

### SSL Certificate Issues

If certificate request fails:

1. Ensure domain DNS points to your server
2. Ensure ports 80 and 443 are open
3. Check certbot logs:
```bash
docker compose -f docker-compose.prod.yml logs certbot
```

### Database Connection Issues

Check MongoDB logs:
```bash
docker compose -f docker-compose.prod.yml logs mongodb
```

Verify MongoDB is running:
```bash
docker compose -f docker-compose.prod.yml exec mongodb mongosh --eval "db.runCommand('ping')"
```

## Environment Variables

Key environment variables in `docker-compose.prod.yml`:

- `NODE_ENV=production` - Production mode
- `MONGODB_URI` - MongoDB connection string
- `ELASTICSEARCH_URL` - Elasticsearch URL
- `REDIS_URL` - Redis connection string
- `HORIZON_URL_PUBLIC` - Stellar Mainnet Horizon
- `HORIZON_URL_TESTNET` - Stellar Testnet Horizon

## Performance Tuning

### Increase API Memory
Edit `docker-compose.prod.yml`:
```yaml
lumina-api:
  deploy:
    resources:
      limits:
        memory: 2G
```

### Increase Elasticsearch Memory
```yaml
elasticsearch:
  environment:
    - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
```

## Security Checklist

- [ ] Domain DNS configured correctly
- [ ] SSL certificates installed
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Environment variables secured
- [ ] Database passwords set (if using auth)
- [ ] Regular backups configured
- [ ] Monitoring/logging set up

## Backup & Restore

### Backup MongoDB
```bash
docker compose -f docker-compose.prod.yml exec mongodb mongodump --out /backup
```

### Restore MongoDB
```bash
docker compose -f docker-compose.prod.yml exec mongodb mongorestore /backup
```

## Support

For issues or questions:
1. Check logs: `docker compose -f docker-compose.prod.yml logs`
2. Verify services: `docker compose -f docker-compose.prod.yml ps`
3. Check network: `docker network ls`

---

**Welcome to the big leagues! 🚀**

Your Lumina 3D Explorer is now production-ready and will run forever with zero maintenance.

