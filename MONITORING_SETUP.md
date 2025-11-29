# 📊 Lumina Explorer - Monitoring & Analytics Setup

**Real-time dashboards for Accounts · Assets · Liquidity Pools · Network health**

## Quick Start

### 1. Install prom-client

```bash
cd api
npm install prom-client
```

### 2. Start Monitoring Services

```bash
docker compose -f docker-compose.prod.yml up -d prometheus grafana node-exporter cadvisor
```

### 3. Access Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin123` (change on first login)

## What You Get

### Real-Time Metrics

| Metric | Description | Update Frequency |
|--------|-------------|-----------------|
| `lumina_account_balance_xlm` | Top whale account balances | Every 10s |
| `lumina_asset_price_usd` | Asset prices (XLM, USDC, AQUA, etc.) | Every 10s |
| `lumina_pool_tvl_xlm` | Liquidity pool TVL leaderboard | Every 10s |
| `lumina_network_tps` | Network transactions per second | Every 10s |

### System Metrics

- **Node Exporter**: CPU, RAM, disk, network
- **cAdvisor**: Docker container metrics
- **Prometheus**: All metrics aggregated

### Grafana Dashboards

1. **Lumina Overview** (auto-provisioned)
   - Network TPS graph
   - Top whale balances
   - Asset prices
   - Liquidity pool TVL

2. **System Health** (built-in)
   - Container CPU/RAM usage
   - Disk I/O
   - Network traffic

## Adding Custom Metrics

Edit `api/api/routes/metrics.js` to add your own metrics:

```js
const customMetric = new client.Gauge({
  name: 'lumina_custom_metric',
  help: 'Your custom metric description',
  labelNames: ['label1', 'label2']
});

// Update it
customMetric.set({ label1: 'value1', label2: 'value2' }, 123.45);
```

## Monitoring Top Accounts

To monitor specific accounts, edit `api/api/routes/metrics.js`:

```js
const accounts = [
  'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', // USDC issuer
  'YOUR_ACCOUNT_HERE', // Add your accounts
];
```

## Querying Metrics

### Prometheus Queries

```promql
# Top 10 pools by TVL
topk(10, lumina_pool_tvl_xlm)

# Average TPS over 5 minutes
avg_over_time(lumina_network_tps[5m])

# Total XLM in monitored accounts
sum(lumina_account_balance_xlm)

# Asset price changes
rate(lumina_asset_price_usd[5m])
```

### Grafana Queries

1. Go to Grafana → Explore
2. Select "Prometheus" datasource
3. Enter PromQL query
4. Click "Run query"

## Alerting (Coming Soon)

Set up alerts for:
- Whale movements (>$10M)
- TPS drops below threshold
- Pool TVL changes
- API errors

## Troubleshooting

### Metrics Not Appearing

1. Check if prom-client is installed:
```bash
cd api && npm list prom-client
```

2. Check API logs:
```bash
docker compose -f docker-compose.prod.yml logs api | grep METRICS
```

3. Verify metrics endpoint:
```bash
curl http://localhost:3000/explorer/public/metrics
```

### Prometheus Not Scraping

1. Check Prometheus targets:
   - Go to http://localhost:9090/targets
   - All targets should show "UP"

2. Check Prometheus logs:
```bash
docker compose -f docker-compose.prod.yml logs prometheus
```

### Grafana Not Loading

1. Check Grafana logs:
```bash
docker compose -f docker-compose.prod.yml logs grafana
```

2. Verify datasource:
   - Go to Grafana → Configuration → Data Sources
   - Prometheus should be configured and tested

## Performance

- **Metrics update**: Every 10 seconds
- **Scrape interval**: 15 seconds (Prometheus)
- **Storage**: Prometheus stores 15 days by default
- **Resource usage**: ~200MB RAM per service

## Security

### Change Default Passwords

1. **Grafana**: Change on first login or set via environment:
```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=your_secure_password
```

2. **Expose only via reverse proxy** in production:
   - Add to nginx.conf
   - Use authentication
   - Enable HTTPS only

## Next Steps

- [ ] Set up alerting rules
- [ ] Add custom dashboards
- [ ] Monitor specific accounts
- [ ] Track historical trends
- [ ] Set up alert notifications (Telegram, Slack, etc.)

---

**Your explorer now has institutional-grade monitoring! 📊**

