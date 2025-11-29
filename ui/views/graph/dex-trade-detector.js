import {getAssetPosition, parseAsset} from './asset-position-manager'

/**
 * Detect if transaction contains DEX operations
 */
export function isDEXTransaction(tx) {
    if (!tx.operations) return false
    
    return tx.operations.some(op => 
        op.type === 'manage_buy_offer' ||
        op.type === 'manage_sell_offer' ||
        op.type === 'create_passive_sell_offer' ||
        op.type === 'path_payment_strict_send' ||
        op.type === 'path_payment_strict_receive'
    )
}

/**
 * Extract DEX trades from transaction
 */
export function extractDEXTrades(tx) {
    if (!tx.operations) return []
    
    const trades = []
    
    tx.operations.forEach((op, index) => {
        let trade = null
        
        // Orderbook operations
        if (op.type === 'manage_buy_offer' || 
            op.type === 'manage_sell_offer' ||
            op.type === 'create_passive_sell_offer') {
            
            const {selling, buying} = parseAsset(op)
            const amount = parseFloat(op.amount || 0)
            
            trade = {
                id: `${tx.id}-${index}`,
                type: 'order',
                assetIn: selling,
                assetOut: buying,
                amountIn: amount,
                amountOut: amount * parseFloat(op.price || 1),
                fromPosition: getAssetPosition(selling),
                toPosition: getAssetPosition(buying),
                timestamp: tx.created_at,
                successful: tx.successful
            }
        }
        
        // Path payment (AMM swaps)
        else if (op.type === 'path_payment_strict_send' || 
                 op.type === 'path_payment_strict_receive') {
            
            const sendAsset = op.source_asset_type === 'native'
                ? 'native'
                : `${op.source_asset_code}:${op.source_asset_issuer}`
            
            const destAsset = op.destination_asset_type === 'native'
                ? 'native'
                : `${op.destination_asset_code}:${op.destination_asset_issuer}`
            
            const amountIn = parseFloat(op.source_amount || op.amount || 0)
            const amountOut = parseFloat(op.destination_amount || op.amount || 0)
            
            trade = {
                id: `${tx.id}-${index}`,
                type: 'swap',
                assetIn: sendAsset,
                assetOut: destAsset,
                amountIn,
                amountOut,
                fromPosition: getAssetPosition(sendAsset),
                toPosition: getAssetPosition(destAsset),
                path: op.path || [],
                timestamp: tx.created_at,
                successful: tx.successful,
                priceImpact: calculatePriceImpact(amountIn, amountOut)
            }
        }
        
        if (trade) {
            trades.push(trade)
        }
    })
    
    return trades
}

/**
 * Calculate price impact (simplified)
 */
function calculatePriceImpact(amountIn, amountOut) {
    if (!amountIn || !amountOut) return 0
    
    // Simplified: just check if it's a large trade
    // Real implementation would compare to market price
    const ratio = amountOut / amountIn
    
    // If ratio is very different from 1, there's impact
    return Math.abs(1 - ratio)
}

/**
 * Detect arbitrage patterns
 * Returns true if multiple trades form a cycle
 */
export function detectArbitrage(trades, timeWindowMs = 3000) {
    if (trades.length < 3) return []
    
    const arbitrages = []
    const now = Date.now()
    
    // Group trades by time window
    const recentTrades = trades.filter(t => 
        now - new Date(t.timestamp).getTime() < timeWindowMs
    )
    
    // Look for cycles: A→B→C→A
    for (let i = 0; i < recentTrades.length - 2; i++) {
        const t1 = recentTrades[i]
        const t2 = recentTrades[i + 1]
        const t3 = recentTrades[i + 2]
        
        // Check if forms a cycle
        if (t1.assetOut === t2.assetIn &&
            t2.assetOut === t3.assetIn &&
            t3.assetOut === t1.assetIn) {
            
            arbitrages.push({
                trades: [t1, t2, t3],
                positions: [
                    t1.fromPosition,
                    t2.fromPosition,
                    t3.fromPosition
                ]
            })
        }
    }
    
    return arbitrages
}

export default {
    isDEXTransaction,
    extractDEXTrades,
    detectArbitrage
}
