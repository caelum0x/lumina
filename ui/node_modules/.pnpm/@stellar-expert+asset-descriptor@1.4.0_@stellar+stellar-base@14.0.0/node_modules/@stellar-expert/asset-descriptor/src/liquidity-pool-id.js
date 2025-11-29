import {Asset, LiquidityPoolAsset, LiquidityPoolFeeV18, getLiquidityPoolId} from '@stellar/stellar-base'
import {AssetDescriptor} from './asset-descriptor'

/**
 * Generate constant product liquidity pool id from provided assets
 * @param {Array<String>|LiquidityPoolAsset} assetProps
 * @return {String}
 */
export function generateLiquidityPoolId(assetProps) {
    const lp = assetProps instanceof Array ? getLiquidityPoolAsset(assetProps) : assetProps
    if (lp === null)
        return null //invalid pool
    const id = getLiquidityPoolId('constant_product', lp.getLiquidityPoolParameters())
    return id.toString('hex')
}

/**
 * Generate Stellar LiquidityPoolAsset for a given asset pair
 * @param {Array<String>} asset
 * @return {LiquidityPoolAsset}
 */
export function getLiquidityPoolAsset(asset) {
    if (asset[0] === asset[1])
        return null //invalid pool
    const wrappedAssets = asset.map(a => AssetDescriptor.parse(a).toAsset())
    wrappedAssets.sort(Asset.compare)
    return new LiquidityPoolAsset(wrappedAssets[0], wrappedAssets[1], LiquidityPoolFeeV18)
}