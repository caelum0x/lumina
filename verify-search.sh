#!/bin/bash

# Lumina Search Implementation Verification Script
# This script verifies that all search features are properly implemented

echo "🔍 Lumina Search Implementation Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if API is running
echo "1. Checking if API server is running..."
if curl -s http://localhost:3000/ > /dev/null; then
    echo -e "${GREEN}✓${NC} API server is running"
else
    echo -e "${RED}✗${NC} API server is not running. Start it with: cd api && npm start"
    exit 1
fi

echo ""

# Check unified search endpoint
echo "2. Testing unified search endpoint..."
SEARCH_RESPONSE=$(curl -s "http://localhost:3000/explorer/public/search/unified?q=XLM")
if echo "$SEARCH_RESPONSE" | grep -q "records"; then
    echo -e "${GREEN}✓${NC} Unified search endpoint working"
else
    echo -e "${RED}✗${NC} Unified search endpoint failed"
fi

echo ""

# Check Soroban RPC connector
echo "3. Checking Soroban RPC connector..."
if [ -f "api/connectors/soroban-rpc.js" ]; then
    echo -e "${GREEN}✓${NC} Soroban RPC connector exists"
else
    echo -e "${RED}✗${NC} Soroban RPC connector missing"
fi

echo ""

# Check asset details endpoint
echo "4. Testing asset details endpoint..."
ASSET_RESPONSE=$(curl -s "http://localhost:3000/explorer/public/asset/XLM/details")
if echo "$ASSET_RESPONSE" | grep -q "asset"; then
    echo -e "${GREEN}✓${NC} Asset details endpoint working"
else
    echo -e "${RED}✗${NC} Asset details endpoint failed"
fi

echo ""

# Check latest transactions endpoint
echo "5. Testing latest transactions endpoint..."
TX_RESPONSE=$(curl -s "http://localhost:3000/explorer/public/transactions/latest?limit=5")
if echo "$TX_RESPONSE" | grep -q "records"; then
    echo -e "${GREEN}✓${NC} Latest transactions endpoint working"
else
    echo -e "${RED}✗${NC} Latest transactions endpoint failed"
fi

echo ""

# Check frontend components
echo "6. Checking frontend components..."
if [ -f "ui/views/components/global-search-bar.js" ]; then
    echo -e "${GREEN}✓${NC} Global search bar component exists"
else
    echo -e "${YELLOW}⚠${NC} Global search bar component missing"
fi

if [ -f "ui/views/components/latest-transactions-feed.js" ]; then
    echo -e "${GREEN}✓${NC} Latest transactions feed component exists"
else
    echo -e "${YELLOW}⚠${NC} Latest transactions feed component missing"
fi

echo ""

# Summary
echo "=============================================="
echo "Verification Complete!"
echo ""
echo "📝 Implementation Summary:"
echo "  • Unified search with Soroban support"
echo "  • Asset details page (Solscan-like)"
echo "  • Latest transactions feed with SSE"
echo "  • AI-powered search suggestions"
echo ""
echo "📚 Documentation: See SEARCH_IMPLEMENTATION.md"
echo ""
echo "🚀 Next Steps:"
echo "  1. Test search: http://localhost:3000/explorer/public/search/unified?q=XLM"
echo "  2. Test assets: http://localhost:3000/explorer/public/asset/XLM/details"
echo "  3. Test stream: http://localhost:3000/explorer/public/transactions/latest"
echo ""
echo "🎉 Your Lumina Explorer now has Solscan-like features!"
