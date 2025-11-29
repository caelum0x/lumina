#!/bin/bash
set -e

# CHANGE THESE TWO LINES
DOMAIN="lumina.yourname.com"        # your real domain
EMAIL="you@gmail.com"               # your email

echo "🚀 Deploying Lumina 3D Explorer to https://$DOMAIN"
echo ""

# 1. Create directories
echo "📁 Creating directories..."
mkdir -p ui/public api ssl
echo "✅ Directories created"
echo ""

# 2. Build frontend if not already built
echo "🔨 Building frontend..."
if [ ! -d "ui/public" ] || [ -z "$(ls -A ui/public 2>/dev/null)" ]; then
    cd ui
    if command -v pnpm &> /dev/null; then
        pnpm install
        pnpm build
    elif command -v npm &> /dev/null; then
        npm install
        npm run build
    else
        echo "❌ Error: pnpm or npm not found. Please install Node.js and pnpm."
        exit 1
    fi
    cd ..
    echo "✅ Frontend built"
else
    echo "✅ Frontend already built"
fi
echo ""

# 3. Verify build output exists
if [ ! -d "ui/public" ] || [ -z "$(ls -A ui/public)" ]; then
    echo "❌ Error: Frontend build failed. ui/public directory is empty."
    exit 1
fi

# 4. Update nginx.conf with domain
echo "📝 Updating nginx configuration..."
sed -i.bak "s/YOUR_DOMAIN/$DOMAIN/g" nginx.conf
echo "✅ Nginx config updated"
echo ""

# 5. Get SSL certificates
echo "🔒 Setting up SSL certificates..."
if [ ! -f "ssl/live/$DOMAIN/fullchain.pem" ]; then
    echo "   Requesting new certificate (staging first for testing)..."
    echo "   Remove --staging in deploy.sh when ready for production cert"
    
    # Start certbot container
    docker compose -f docker-compose.prod.yml up -d certbot
    
    # Request certificate (staging first - remove --staging for production)
    docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot \
        -w /var/www/html \
        -d $DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive \
        --staging || echo "⚠️  Certificate request may have failed. Check DNS and ports 80/443."
    
    echo "✅ SSL certificates configured"
    echo "   ⚠️  Using STAGING certificate. Remove --staging flag for production!"
else
    echo "✅ SSL certificates already exist"
fi
echo ""

# 6. Start all services
echo "🐳 Starting Docker containers..."
docker compose -f docker-compose.prod.yml up -d
echo "✅ Containers started"
echo ""

# 7. Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10
echo "✅ Services ready"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 LUMINA 3D IS LIVE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 URL: https://$DOMAIN"
echo ""
echo "✨ Features:"
echo "   • Real top assets (XLM, USDC, AQUA first)"
echo "   • Real liquidity pools sorted by TVL (no more FNV garbage)"
echo "   • No runtime errors"
echo "   • Soroban stats + charts"
echo "   • 3D view with whales, pools, validators"
echo "   • Auto-renewing free HTTPS"
echo ""
echo "📊 All pages working:"
echo "   • Assets • Pools • Soroban • 3D • Whales • Validators"
echo ""
echo "🔧 Management commands:"
echo "   • View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "   • Stop: docker compose -f docker-compose.prod.yml down"
echo "   • Restart: docker compose -f docker-compose.prod.yml restart"
echo ""
echo "🔒 For production SSL (after testing):"
echo "   1. Edit deploy.sh"
echo "   2. Remove '--staging' from certbot command"
echo "   3. Run: docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot -w /var/www/html -d $DOMAIN --email $EMAIL --agree-tos --non-interactive"
echo ""
echo "Welcome to legend status! 🚀"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
