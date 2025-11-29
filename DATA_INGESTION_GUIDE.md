# Lumina Data Ingestion Guide

## Problem
Your MongoDB database is empty, causing 404 errors when searching for or clicking on assets, accounts, and other Stellar data.

## Solution
Run the data ingestion script to populate your MongoDB with Stellar network data from Horizon.

## Quick Start

### Run the Ingestion Script
```bash
./ingest-data.sh
```

Or directly:
```bash
cd api
node scripts/full-data-ingestion.js
```

## What Gets Ingested

1. **Assets** (200 most popular) - Asset codes, issuers, supply
2. **Ledgers** (200 most recent) - Sequences, hashes, transactions
3. **Transactions** (200 most recent) - Hashes, fees, operations
4. **Accounts** (100 most recent) - Addresses, balances, signers
5. **Network Statistics** - Total operations, reserves, latest ledger

## After Ingestion

✅ Search for assets works (XLM, USDC, AQUA)
✅ Asset pages load without 404 errors
✅ Account details display correctly
✅ Network statistics show real data

## Troubleshooting

**MongoDB Connection Error**: Check `.env` file has correct `MONGODB_URI`
**Horizon Timeout**: Wait and retry, or reduce limit in script
**Still 404 Errors**: Restart API server after ingestion
