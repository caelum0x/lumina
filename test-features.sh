#!/bin/bash

echo "🧪 Testing Lumina Features End-to-End"
echo "======================================"
echo ""

API_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Asset Details
echo "1. Testing Asset Details Endpoint..."
RESPONSE=$(curl -s "${API_URL}/explorer/public/asset/XLM/details")
if echo "$RESPONSE" | grep -q '"asset"'; then
    echo -e "${GREEN}✓${NC} Asset details working"
    echo "   Sample: $(echo $RESPONSE | jq -r '.asset.code' 2>/dev/null || echo 'XLM')"
else
    echo -e "${RED}✗${NC} Asset details failed"
fi
echo ""

# Test 2: Latest Transactions
echo "2. Testing Latest Transactions Endpoint..."
RESPONSE=$(curl -s "${API_URL}/explorer/public/transactions/latest?limit=5")
if echo "$RESPONSE" | grep -q '"records"'; then
    echo -e "${GREEN}✓${NC} Latest transactions working"
    COUNT=$(echo $RESPONSE | jq -r '._meta.count' 2>/dev/null || echo '5')
    echo "   Loaded: $COUNT transactions"
else
    echo -e "${RED}✗${NC} Latest transactions failed"
fi
echo ""

# Test 3: SSE Stream (check if endpoint exists)
echo "3. Testing SSE Stream Endpoint..."
timeout 3 curl -s "${API_URL}/explorer/public/transactions/stream" > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo -e "${GREEN}✓${NC} SSE stream endpoint responding"
else
    echo -e "${RED}✗${NC} SSE stream not available"
fi
echo ""

# Test 4: Unified Search
echo "4. Testing Unified Search..."
RESPONSE=$(curl -s "${API_URL}/explorer/public/search/unified?q=XLM")
if echo "$RESPONSE" | grep -q '"records"'; then
    echo -e "${GREEN}✓${NC} Unified search working"
else
    echo -e "${RED}✗${NC} Unified search failed"
fi
echo ""

echo "======================================"
echo "✅ End-to-End Testing Complete!"
echo ""
echo "📋 Summary:"
echo "  • Asset details page: /explorer/public/asset/:code/details"
echo "  • Latest transactions: /explorer/public/transactions/latest"
echo "  • SSE stream: /explorer/public/transactions/stream"
echo "  • Unified search: /explorer/public/search/unified?q=..."
echo ""
echo "🌐 Frontend Routes:"
echo "  • Asset details: /explorer/public/asset/XLM/details"
echo "  • Home page: /explorer/public (with live transactions)"
echo ""
