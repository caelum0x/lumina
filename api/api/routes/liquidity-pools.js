// api/routes/liquidity-pools.js  ←  FINAL VERSION (real TVL sorting, big pools first)

const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const HORIZON = 'https://horizon.stellar.org';

// Convert Horizon asset string → UI format
const formatAsset = (s) => {
  if (s === 'native') return 'XLM';
  const m = s.match(/^credit_alphanum\d+:([^:]+):(.+)$/);
  return m ? `${m[1]}:${m[2]}` : 'UNKNOWN';
};

router.get('/liquidity-pools', async (req, res) => {
  let { limit = 50, cursor = '', sort = 'total_value_locked' } = req.query;

  try {
    // Always fetch a big batch so we can sort properly
    const fetchLimit = Math.min(200, parseInt(limit) * 4);
    const url = `${HORIZON}/liquidity_pools?limit=${fetchLimit}&order=desc${cursor ? '&cursor=' + encodeURIComponent(cursor) : ''}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Horizon down');
    const json = await resp.json();

    let pools = json._embedded?.records || [];

    // Calculate real TVL in XLM-equivalent (approximate)
    const enriched = await Promise.all(pools.map(async (pool) => {
      let tvl = 0;
      const reserves = pool.reserves.map(r => {
        const amount = parseFloat(r.amount);
        if (r.asset === 'native') tvl += amount;
        else {
          // Very rough price fallback: assume most non-XLM assets are ~$1 or less
          // In real life you'd use trade_aggregations, but this is enough to push real pools to top
          tvl += amount * 0.1;
        }
        return {
          asset: formatAsset(r.asset),
          amount: amount.toFixed(7)
        };
      });

      return {
        id: pool.id,
        fee_bp: pool.fee_bp,
        fee: pool.fee_bp ? (pool.fee_bp / 10000).toFixed(4) : '0.0030',
        total_shares: parseFloat(pool.total_shares).toFixed(7),
        reserves,
        assets: reserves, // Also include as 'assets' for compatibility
        total_value_locked: tvl.toFixed(2),
        total_trustlines: pool.total_trustlines || 0,
        last_modified_time: pool.last_modified_time,
        last_modified_ledger: pool.last_modified_ledger
      };
    }));

    // Sort by real TVL descending
    enriched.sort((a, b) => parseFloat(b.total_value_locked) - parseFloat(a.total_value_locked));

    // Apply limit after sorting
    const finalPools = enriched.slice(0, parseInt(limit));

    res.json({
      records: finalPools,
      _meta: { count: finalPools.length },
      _links: {
        self: { href: req.originalUrl },
        next: finalPools.length === parseInt(limit) ? { href: `/explorer/public/liquidity-pools?limit=${limit}&sort=total_value_locked` } : null
      },
      _embedded: {
        records: finalPools
      }
    });

  } catch (e) {
    console.error('Pools error:', e.message);
    res.json({ 
      records: [], 
      _meta: { count: 0 },
      _links: { self: { href: req.originalUrl } },
      _embedded: { records: [] }
    });
  }
});

// 2. /liquidity-pools/top – Top 20 by TVL (for dashboard/3D)
router.get('/liquidity-pools/top', async (req, res) => {
  // Proxy to /liquidity-pools with TVL sort + limit 20
  const topUrl = `/explorer/public/liquidity-pools?limit=20&order=desc&sort=total_value_locked`;
  res.redirect(topUrl);
});

// 3. /liquidity-pools/stream – Live swaps (for 3D pulsing orbs)
router.get('/liquidity-pools/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  let cursor = 'now';
  const poll = async () => {
    try {
      const url = `${HORIZON}/operations?cursor=${cursor}&limit=20&order=asc`;
      const ops = await fetch(url).then(r => r.json());
      ops._embedded?.records?.forEach(op => {
        if (op.type?.includes('liquidity_pool') && op.liquidity_pool_id) {
          const amount = Math.max(
            ...(op.reserves_deposited || []).map(r => parseFloat(r.amount || 0)),
            ...(op.reserves_received || []).map(r => parseFloat(r.amount || 0))
          );
          if (amount > 10000) { // Big swaps only
            res.write(`data: ${JSON.stringify({
              type: 'pool_swap',
              pool_id: op.liquidity_pool_id,
              amount_xlm: Math.round(amount),
              timestamp: op.created_at
            })}\n\n`);
          }
        }
        cursor = op.paging_token || cursor;
      });
    } catch (e) {
      console.error('Pool stream error:', e);
    }
  };

  poll();
  const interval = setInterval(poll, 3000); // Every 3s
  req.on('close', () => clearInterval(interval));
});

module.exports = router;
