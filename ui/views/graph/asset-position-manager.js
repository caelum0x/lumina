// Maps assets to fixed 3D positions for DEX visualization
const assetPositions = new Map()

// Major assets get fixed positions in a circle
const majorAssets = [
    {code: 'XLM', issuer: 'native', position: [0, 0, 0], color: '#6B46C1'},
    {code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', position: [20, 0, 0], color: '#2775ca'},
    {code: 'BTC', issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF', position: [14, 0, 14], color: '#ff8800'},
    {code: 'ETH', issuer: 'GDZCEWJ5TVXUTFH6V5CVJQDE4JLN2DQRV6GCCXQBVQHJ5YGDPKJCWQJZ', position: [-14, 0, 14], color: '#00ff88'},
    {code: 'EURC', issuer: 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2', position: [-20, 0, 0], color: '#cccccc'},
    {code: 'AQUA', issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA', position: [0, 0, 20], color: '#00ffff'},
    {code: 'yXLM', issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55', position: [0, 0, -20], color: '#8844ff'}
]

// Initialize major assets
majorAssets.forEach(asset => {
    const key = asset.issuer === 'native' ? 'XLM' : `${asset.code}:${asset.issuer}`
    assetPositions.set(key, {
        position: asset.position,
        color: asset.color,
        code: asset.code,
        issuer: asset.issuer
    })
})

/**
 * Get or create position for an asset
 */
export function getAssetPosition(asset) {
    if (!asset) return [0, 0, 0]
    
    // Handle native XLM
    if (asset === 'native' || asset.asset_type === 'native') {
        return assetPositions.get('XLM').position
    }
    
    // Parse asset
    let code, issuer
    if (typeof asset === 'string') {
        if (asset.includes(':')) {
            [code, issuer] = asset.split(':')
        } else {
            code = asset
            issuer = 'native'
        }
    } else {
        code = asset.asset_code || asset.code
        issuer = asset.asset_issuer || asset.issuer
    }
    
    const key = issuer === 'native' ? code : `${code}:${issuer}`
    
    // Return if exists
    if (assetPositions.has(key)) {
        return assetPositions.get(key).position
    }
    
    // Create new position in a spiral pattern
    const count = assetPositions.size
    const angle = count * 0.618 * Math.PI * 2 // Golden angle
    const radius = 15 + Math.sqrt(count) * 3
    const height = (Math.random() - 0.5) * 10
    
    const position = [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
    ]
    
    assetPositions.set(key, {
        position,
        color: `hsl(${count * 137.5}, 70%, 60%)`, // Golden angle hue
        code,
        issuer
    })
    
    return position
}

/**
 * Get asset color
 */
export function getAssetColor(asset) {
    if (!asset) return '#ffffff'
    
    if (asset === 'native' || asset.asset_type === 'native') {
        return assetPositions.get('XLM').color
    }
    
    let code, issuer
    if (typeof asset === 'string') {
        if (asset.includes(':')) {
            [code, issuer] = asset.split(':')
        } else {
            return '#ffffff'
        }
    } else {
        code = asset.asset_code || asset.code
        issuer = asset.asset_issuer || asset.issuer
    }
    
    const key = issuer === 'native' ? code : `${code}:${issuer}`
    return assetPositions.get(key)?.color || '#ffffff'
}

/**
 * Get all known assets
 */
export function getAllAssets() {
    return Array.from(assetPositions.values())
}

/**
 * Parse asset from operation
 */
export function parseAsset(op) {
    // Selling asset
    const selling = op.selling_asset_type === 'native' 
        ? 'native'
        : `${op.selling_asset_code}:${op.selling_asset_issuer}`
    
    // Buying asset
    const buying = op.buying_asset_type === 'native'
        ? 'native'
        : `${op.buying_asset_code}:${op.buying_asset_issuer}`
    
    return {selling, buying}
}

export default {
    getAssetPosition,
    getAssetColor,
    getAllAssets,
    parseAsset
}
