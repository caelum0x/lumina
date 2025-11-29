#!/bin/bash

# Lumina 3D Modern Stellar Explorer - Environment Setup Script
# This script helps first-time developers set up their environment

set -e

echo "🚀 Lumina 3D Modern Stellar Explorer - Environment Setup"
echo "=========================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ -f "api/.env" ]; then
    echo -e "${YELLOW}⚠️  api/.env already exists. Skipping...${NC}"
else
    if [ -f "api/.env.example" ]; then
        cp api/.env.example api/.env
        echo -e "${GREEN}✅ Created api/.env from .env.example${NC}"
    else
        echo -e "${RED}❌ api/.env.example not found!${NC}"
        exit 1
    fi
fi

if [ -f "ui/.env" ]; then
    echo -e "${YELLOW}⚠️  ui/.env already exists. Skipping...${NC}"
else
    if [ -f "ui/.env.example" ]; then
        cp ui/.env.example ui/.env
        echo -e "${GREEN}✅ Created ui/.env from .env.example${NC}"
    else
        echo -e "${RED}❌ ui/.env.example not found!${NC}"
        exit 1
    fi
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit api/.env with your MongoDB and Elasticsearch connection strings"
echo "2. Edit ui/.env with your API endpoint URL"
echo "3. Review api/app.config.json and ui/app.config.json for additional settings"
echo ""
echo -e "${GREEN}✨ Environment setup complete!${NC}"

