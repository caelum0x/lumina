#!/bin/bash

echo "🛑 Stopping Lumina..."

# Kill processes on ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:9001 | xargs kill -9 2>/dev/null

# Stop Docker containers
docker-compose stop 2>/dev/null

echo "✅ All services stopped"
