import {useEffect} from 'react'
import {useStore} from './store'
import {isDEXTransaction, extractDEXTrades, detectArbitrage} from './dex-trade-detector'
import dexSoundEngine from './dex-sound-engine'

/**
 * Hook to process transactions and extract DEX trades
 */
export function useDEXProcessor() {
    const transactions = useStore(state => state.transactions)
    const addDEXTrades = useStore(state => state.addDEXTrades)
    const dexTrades = useStore(state => state.dexTrades)

    useEffect(() => {
        // Process latest transaction
        if (transactions.length === 0) return
        
        const latestTx = transactions[transactions.length - 1]
        
        // Check if it's a DEX transaction
        if (isDEXTransaction(latestTx)) {
            const trades = extractDEXTrades(latestTx)
            
            if (trades.length > 0) {
                addDEXTrades(trades)
                
                // Play sounds based on trade type and size
                trades.forEach(trade => {
                    if (!trade.successful) return
                    
                    const isWhale = trade.amountIn > 100000 || trade.amountOut > 100000
                    const highImpact = trade.priceImpact && Math.abs(trade.priceImpact) > 0.05
                    
                    if (isWhale) {
                        dexSoundEngine.playBassDrop()
                    } else if (highImpact) {
                        dexSoundEngine.playHeartbeat()
                    } else if (trade.type === 'swap') {
                        dexSoundEngine.playSwoosh()
                    } else {
                        dexSoundEngine.playZap()
                    }
                })
            }
        }
    }, [transactions.length, addDEXTrades])

    // Detect arbitrage patterns
    useEffect(() => {
        if (dexTrades.length < 3) return
        
        const arbitrages = detectArbitrage(dexTrades, 3000)
        
        if (arbitrages.length > 0) {
            // Play rapid beeps for arbitrage
            dexSoundEngine.playRapidBeeps(arbitrages.length)
        }
    }, [dexTrades.length])
}

export default useDEXProcessor
