#!/bin/bash

echo "🚀 Starting Lumina Data Ingestion..."
echo ""

cd api
node scripts/full-data-ingestion.js

echo ""
echo "✅ Ingestion complete! You can now start the application."
