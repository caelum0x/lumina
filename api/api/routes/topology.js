const express = require('express')
const router = express.Router()

const VALIDATORS = [
  {id: "sdf1", name: "SDF Core 1", domain: "core1.stellar.org", lat: 37.7749, lng: -122.4194, tier: "sdf", size: 25},
  {id: "sdf2", name: "SDF Core 2", domain: "core2.stellar.org", lat: 40.712, lng: -74.0060, tier: "sdf", size: 25},
  {id: "sdf3", name: "SDF Core 3", domain: "core3.stellar.org", lat: 51.5074, lng: -0.1278, tier: "sdf", size: 25},
  {id: "lobstr", name: "LOBSTR", domain: "lobstr.co", lat: 52.52, lng: 13.405, size: 18},
  {id: "blockdaemon", name: "Blockdaemon", domain: "blockdaemon.com", lat: 40.7128, lng: -74.0060, size: 16},
  {id: "coinqvest", name: "COINQVEST", domain: "coinqvest.com", lat: 51.5074, lng: -0.1278, size: 15},
  {id: "bison", name: "Bison Trails", domain: "bisontrails.co", lat: 37.7749, lng: -122.4194, size: 14},
  {id: "keybase", name: "Keybase", domain: "keybase.io", lat: 40.7128, lng: -74.0060, size: 13},
  {id: "stronghold", name: "Stronghold", domain: "stronghold.co", lat: 37.7749, lng: -122.4194, size: 12},
  {id: "satoshpay", name: "SatoshiPay", domain: "satoshi.pay", lat: 52.52, lng: 13.405, size: 11},
  ...Array.from({length: 100}, (_, i) => ({
    id: `watcher${i}`,
    name: `Watcher ${i+1}`,
    domain: `node${i}.stellar.expert`,
    size: Math.random() * 6 + 4,
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    tier: "watcher"
  }))
]

router.get('/topology/nodes', async (req, res) => {
  const nodes = VALIDATORS.map(v => {
    const phi = (90 - v.lat) * (Math.PI / 180)
    const theta = (v.lng + 180) * (Math.PI / 180)
    const radius = 300 + Math.random() * 100

    return {
      id: v.id,
      name: v.name,
      domain: v.domain,
      tier: v.tier || "watcher",
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi) + 50,
      z: radius * Math.sin(phi) * Math.sin(theta),
      size: v.size,
      color: v.tier === 'sdf' ? '#00ff00' : '#4488ff',
      online: true
    }
  })

  res.json({nodes, updated_at: new Date().toISOString()})
})

router.get('/topology/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  const send = () => {
    const nodes = VALIDATORS.slice(0, 10).map(v => ({
      id: v.id,
      name: v.name,
      online: Math.random() > 0.1
    }))
    res.write(`data: ${JSON.stringify({nodes})}\n\n`)
  }

  send()
  const interval = setInterval(send, 4000)
  req.on('close', () => clearInterval(interval))
})

module.exports = router
