const express = require('express')
const router = express.Router()
const horizonAdapter = require('../../connectors/horizon-adapter')

const SOROBAN_FEE_THRESHOLD = 5.0
const SOROBAN_CPU_THRESHOLD = 50_000_000

const assetPriceCache = {}
const getPriceInXLM = async (network, code, issuer) => {
  const key = `${code}:${issuer || 'native'}`
  if (assetPriceCache[key] && Date.now() - assetPriceCache[key].ts < 60_000) {
    return assetPriceCache[key].price
  }
  if (code === 'XLM' || !issuer) return 1.0
  try {
    const server = horizonAdapter.getServer(network)
    const agg = await server.tradeAggregations(
      {type: 'credit_alphanum4', code, issuer},
      {type: 'native'},
      Date.now() - 3600000,
      Date.now(),
      60000
    ).limit(1).order('desc').call()
    const price = parseFloat(agg.records[0]?.avg || 0)
    assetPriceCache[key] = {price, ts: Date.now()}
    return price
  } catch (e) {
    return 0
  }
}

router.get('/whales/recent', async (req, res) => {
  try {
    const network = req.params.network || 'public'
    const ops = await horizonAdapter.getOperations(network, 200)
    const whales = []
    const seenTxs = new Set()

    for (const op of ops) {
      let isClassicWhale = false
      let classicAmount = 0
      let assetCode = 'XLM'

      if (op.type === 'payment' || op.type.includes('path_payment')) {
        classicAmount = parseFloat(op.amount || 0)
        assetCode = op.asset_code || 'XLM'
        const price = await getPriceInXLM(network, assetCode, op.asset_issuer)
        if (classicAmount * price >= 300_000) isClassicWhale = true
      } else if (op.type.includes('liquidity_pool')) {
        const maxReserve = Math.max(
          parseFloat(op.reserves_deposited?.[0]?.amount || 0),
          parseFloat(op.reserves_deposited?.[1]?.amount || 0),
          parseFloat(op.reserves_received?.[0]?.amount || 0),
          parseFloat(op.reserves_received?.[1]?.amount || 0)
        )
        if (maxReserve >= 300_000) isClassicWhale = true
      }

      if (isClassicWhale && !seenTxs.has(op.transaction_hash)) {
        whales.push({
          id: op.id,
          hash: op.transaction_hash,
          from: op.source_account,
          to: op.to || op.into || 'unknown',
          amount: classicAmount.toFixed(2),
          asset: assetCode,
          amount_xlm: Math.round(classicAmount).toLocaleString(),
          usd_value: Math.round(classicAmount * 0.25).toLocaleString(),
          timestamp: op.created_at,
          type: 'whale',
          size: 4,
          color: '#ff6b00'
        })
        seenTxs.add(op.transaction_hash)
      }

      if (op.type_i === 24 || op.type === 'invoke_host_function') {
        const txHash = op.transaction_hash
        if (seenTxs.has(txHash)) continue

        try {
          const tx = await horizonAdapter.getTransaction(network, txHash)
          const feeCharged = parseFloat(tx.fee_charged) / 1e7
          const maxFee = parseFloat(tx.max_fee) / 1e7

          if (feeCharged >= SOROBAN_FEE_THRESHOLD || maxFee >= 50) {
            whales.push({
              id: op.id,
              hash: txHash,
              from: op.source_account,
              to: 'contract',
              amount: feeCharged.toFixed(3),
              asset: 'SOROBAN',
              amount_xlm: feeCharged.toFixed(3),
              usd_value: (feeCharged * 0.25).toFixed(0),
              timestamp: op.created_at,
              type: 'soroban_whale',
              size: Math.min(8, 3 + Math.log10(feeCharged * 10)),
              color: '#00ffff'
            })
            seenTxs.add(txHash)
          }
        } catch (e) {}
      }

      if (whales.length >= 100) break
    }

    res.json({
      records: whales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      count: whales.length,
      generated_at: new Date().toISOString()
    })
  } catch (e) {
    console.error('Whale detection error:', e)
    res.status(503).json({records: [], error: 'Horizon down'})
  }
})

router.get('/whales/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  const sendWhales = async () => {
    try {
      const network = req.params.network || 'public'
      const payments = await horizonAdapter.getPayments(network, 50)
      const whales = []
      for (const p of payments) {
        if (p.type === 'payment' && parseFloat(p.amount) * 1 >= 500_000) {
          whales.push({id: p.id, hash: p.transaction_hash, amount: p.amount})
        }
        if (whales.length >= 3) break
      }
      if (whales.length > 0) {
        res.write(`data: ${JSON.stringify({type: 'whale', whales})}\n\n`)
      }
    } catch (e) {}
  }

  sendWhales()
  const interval = setInterval(sendWhales, 4000)
  req.on('close', () => clearInterval(interval))
})

module.exports = router

