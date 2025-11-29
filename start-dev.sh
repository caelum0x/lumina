#!/bin/bash

# Lumina 3D Modern Stellar Explorer - Development Startup Script

set -e

echo "🚀 Starting Lumina 3D Modern Stellar Explorer (Development Mode)"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 Starting databases..."
docker-compose up mongodb mongodb-archive elasticsearch redis -d

echo ""
echo "✅ Databases started"
echo ""
echo "📝 Next steps:"
echo ""
echo "Terminal 2 - Start API:"
echo "  cd $SCRIPT_DIR/api"
echo "  npm start"
echo ""
echo "Terminal 3 - Start UI:"
echo "  cd $SCRIPT_DIR/ui"
echo "  DISABLE_HTTPS=true pnpm dev-server"
echo ""
echo "🌐 Access:"
echo "  - UI: http://localhost:9001"
echo "  - 3D View: http://localhost:9001/graph/3d/public"
echo "  - API: http://localhost:3000"
echo ""

