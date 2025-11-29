#!/bin/bash

# Lumina 3D Block Explorer - One Command Startup
echo "🚀 Starting Lumina 3D Block Explorer..."

# Kill any existing processes on ports
echo "📦 Cleaning up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:9001 | xargs kill -9 2>/dev/null

# Start databases in background
echo "🗄️  Starting databases..."
docker-compose up -d mongodb mongodb-archive elasticsearch redis 2>/dev/null

# Wait for databases
echo "⏳ Waiting for databases to be ready..."
sleep 5

# Start API in background
echo "🔧 Starting API server..."
cd api && npm start > ../api.log 2>&1 &
API_PID=$!

# Wait for API
sleep 3

# Start UI in background
echo "🎨 Starting UI dev server..."
cd ui && pnpm dev-server > ../ui.log 2>&1 &
UI_PID=$!

# Wait a bit
sleep 3

echo ""
echo "✅ Lumina is starting up!"
echo ""
echo "📍 Access points:"
echo "   API Health: http://localhost:3000/"
echo "   UI:         http://localhost:9001"
echo "   3D View:    http://localhost:9001/graph/3d/public"
echo ""
echo "📋 Logs:"
echo "   API: tail -f api.log"
echo "   UI:  tail -f ui.log"
echo ""
echo "🛑 To stop: ./stop.sh or kill $API_PID $UI_PID"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $API_PID $UI_PID 2>/dev/null; docker-compose stop 2>/dev/null; echo '✅ Stopped'; exit" INT

# Keep script running
wait
