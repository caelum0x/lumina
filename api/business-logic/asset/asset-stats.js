const {Long} = require('mongodb')
const db = require('../../connectors/mongodb-connector')
const horizonAdapter = require('../../connectors/horizon-adapter')
const errors = require('../errors')
const {validateNetwork, validateAssetName, isValidContractAddress} = require('../validators')
const {anyToNumber} = require('../../utils/formatter')
const AssetDescriptor = require('./asset-descriptor')

async function queryAssetStats(network, asset) {
    validateNetwork(network)
    
    // Handle native XLM
    if (asset === 'XLM' || asset === 'native') {
        return {
            asset: 'XLM',
            supply: '100000000000',
            trustlines: { total: 0, authorized: 0, funded: 0 },
            payments: 0,
            payments_amount: 0,
            trades: 0,
            traded_amount: 0,
            price: 0,
            volume: 0,
            volume7d: 0,
            price7d: [],
            rating: 100,
            native: true
        }
    }
    
    let query
    if (isValidContractAddress(asset)) {
        query = {$or: [{contract: asset}, {name: asset}]}
    } else {
        validateAssetName(asset)
        query = {name: new AssetDescriptor(asset).toFQAN()}
    }
    
    const assetInfo = await db[network].collection('assets').findOne(query)
    
    // Fallback to Horizon if not in MongoDB
    if (!assetInfo) {
        try {
            const descriptor = new AssetDescriptor(asset)
            const horizonAsset = await horizonAdapter.getAsset(network, descriptor.code, descriptor.issuer)
            
            if (horizonAsset) {
                return {
                    asset: `${descriptor.code}-${descriptor.issuer}`,
                    supply: parseFloat(horizonAsset.amount) || 0,
                    trustlines: {
                        total: parseInt(horizonAsset.num_accounts) || 0,
                        authorized: parseInt(horizonAsset.num_accounts) || 0,
                        funded: parseInt(horizonAsset.num_accounts) || 0
                    },
                    payments: 0,
                    payments_amount: 0,
                    trades: 0,
                    traded_amount: 0,
                    price: 0,
                    volume: 0,
                    volume7d: 0,
                    price7d: [],
                    rating: parseInt(horizonAsset.num_accounts) || 0
                }
            }
        } catch (e) {
            console.error('Horizon fallback failed:', e.message)
        }
        
        throw errors.notFound('Asset statistics were not found on the ledger. Check if you specified the asset correctly.')
    }

    const res = {
        asset: assetInfo.name,
        created: assetInfo.created,
        supply: anyToNumber(assetInfo.supply),
        trustlines: {
            total: assetInfo.trustlines[0],
            authorized: assetInfo.trustlines[1],
            funded: assetInfo.trustlines[2]
        },
        payments: assetInfo.payments,
        payments_amount: assetInfo.paymentsAmount,
        trades: assetInfo.totalTrades,
        traded_amount: assetInfo.baseVolume,
        price: assetInfo.lastPrice,
        volume: Math.round(assetInfo.quoteVolume),
        volume7d: Math.round(assetInfo.volume7d),
        price7d: assetInfo.price7d
    }
    if (assetInfo.contract) {
        res.contract = assetInfo.contract
    }
    if (res.trustlines.authorized < 0) {
        res.trustlines.authorized = 0
    }
    if (assetInfo.tomlInfo) {
        res.toml_info = assetInfo.tomlInfo
        res.home_domain = assetInfo.domain
    }

    if (assetInfo._id > 0) {
        Object.assign(res, {
            rating: assetInfo.rating
        })
    }
    if (assetInfo._id === 0) {
        //fetch fee pool and reserve for XLM
        const [xlmHistory, poolHistory] = await Promise.all([
            db[network].collection('asset_history')
                .find({
                    _id: {
                        $gt: new Long(0, assetInfo._id),
                        $lt: new Long(0, assetInfo._id + 1)
                    }
                })
                .sort({_id: -1})
                .limit(2)
                .project({reserve: 1})
                .toArray(),
            db[network].collection('network_stats')
                .find({})
                .sort({_id: -1})
                .project({fee_pool: 1})
                .limit(1)
                .toArray()
        ])
        if (poolHistory.length) {
            res.fee_pool = poolHistory[0].fee_pool
        }
        if (xlmHistory[0] && xlmHistory[0].reserve) {
            res.reserve = xlmHistory[0].reserve
        } else {
            if (xlmHistory.length > 1) {
                const {reserve} = xlmHistory[1]
                res.reserve = reserve || '0'
            } else {
                res.reserve = '0'
            }
        }
    }

    return res
}

module.exports = {queryAssetStats}