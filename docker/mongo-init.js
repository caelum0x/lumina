// MongoDB initialization script for Lumina
db = db.getSiblingDB('se_pub802');

// Create collections
db.createCollection('accounts');
db.createCollection('assets');
db.createCollection('transactions');
db.createCollection('ledgers');
db.createCollection('operations');
db.createCollection('trustlines');
db.createCollection('offers');
db.createCollection('liquidity_pools');
db.createCollection('contracts');

// Create indexes for performance
db.transactions.createIndex({ "id": 1 }, { unique: true });
db.transactions.createIndex({ "hash": 1 }, { unique: true });
db.transactions.createIndex({ "ledger": 1 });
db.transactions.createIndex({ "created_at": -1 });
db.transactions.createIndex({ "source_account": 1 });

db.accounts.createIndex({ "id": 1 }, { unique: true });
db.accounts.createIndex({ "account_id": 1 }, { unique: true });

db.assets.createIndex({ "id": 1 }, { unique: true });
db.assets.createIndex({ "asset": 1 }, { unique: true });

db.ledgers.createIndex({ "sequence": 1 }, { unique: true });
db.ledgers.createIndex({ "closed_at": -1 });

print('MongoDB initialized successfully for Lumina');
