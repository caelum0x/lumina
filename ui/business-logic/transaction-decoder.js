// Transaction Decoder - Convert operations to human-readable text

export function decodeOperation(op) {
    const type = op.type || op.type_i
    
    switch (type) {
        case 'payment':
        case 0:
            return `💸 Sent ${formatAmount(op.amount)} ${formatAsset(op.asset)} to ${formatAccount(op.to)}`
        
        case 'create_account':
        case 1:
            return `🆕 Created account ${formatAccount(op.account)} with ${formatAmount(op.starting_balance)} XLM`
        
        case 'path_payment_strict_receive':
        case 2:
            return `🔄 Path payment: Sent ${formatAsset(op.source_asset)} → Received ${formatAmount(op.amount)} ${formatAsset(op.asset)}`
        
        case 'manage_sell_offer':
        case 3:
            return `📊 ${op.amount === '0' ? 'Cancelled' : 'Created'} sell offer: ${formatAmount(op.amount)} ${formatAsset(op.selling)} for ${formatAsset(op.buying)}`
        
        case 'create_passive_sell_offer':
        case 4:
            return `📊 Created passive offer: ${formatAmount(op.amount)} ${formatAsset(op.selling)} for ${formatAsset(op.buying)}`
        
        case 'set_options':
        case 5:
            return `⚙️ Updated account settings${op.home_domain ? ` (domain: ${op.home_domain})` : ''}`
        
        case 'change_trust':
        case 6:
            if (op.limit === '0') {
                return `❌ Removed trustline for ${formatAsset(op.asset)}`
            }
            return `✅ Added trustline for ${formatAsset(op.asset)}${op.limit ? ` (limit: ${formatAmount(op.limit)})` : ''}`
        
        case 'allow_trust':
        case 7:
            return `${op.authorize ? '✅ Authorized' : '❌ Revoked'} ${formatAccount(op.trustor)} for ${op.asset_code}`
        
        case 'account_merge':
        case 8:
            return `🔀 Merged account into ${formatAccount(op.into)}`
        
        case 'manage_data':
        case 10:
            return `📝 ${op.value ? 'Set' : 'Deleted'} data entry "${op.name}"`
        
        case 'bump_sequence':
        case 11:
            return `⏭️ Bumped sequence to ${op.bump_to}`
        
        case 'manage_buy_offer':
        case 12:
            return `📊 ${op.amount === '0' ? 'Cancelled' : 'Created'} buy offer: ${formatAmount(op.amount)} ${formatAsset(op.buying)} for ${formatAsset(op.selling)}`
        
        case 'path_payment_strict_send':
        case 13:
            return `🔄 Path payment: Sent ${formatAmount(op.send_amount)} ${formatAsset(op.send_asset)} → Received ${formatAsset(op.dest_asset)}`
        
        case 'create_claimable_balance':
        case 14:
            return `🎁 Created claimable balance: ${formatAmount(op.amount)} ${formatAsset(op.asset)}`
        
        case 'claim_claimable_balance':
        case 15:
            return `🎁 Claimed balance ${op.balance_id?.substring(0, 8)}...`
        
        case 'begin_sponsoring_future_reserves':
        case 16:
            return `🤝 Began sponsoring ${formatAccount(op.sponsored_id)}`
        
        case 'end_sponsoring_future_reserves':
        case 17:
            return `🤝 Ended sponsorship`
        
        case 'revoke_sponsorship':
        case 18:
            return `🚫 Revoked sponsorship`
        
        case 'clawback':
        case 19:
            return `⚠️ Clawed back ${formatAmount(op.amount)} ${formatAsset(op.asset)} from ${formatAccount(op.from)}`
        
        case 'clawback_claimable_balance':
        case 20:
            return `⚠️ Clawed back claimable balance ${op.balance_id?.substring(0, 8)}...`
        
        case 'set_trust_line_flags':
        case 21:
            return `🏴 Updated trustline flags for ${formatAccount(op.trustor)}`
        
        case 'liquidity_pool_deposit':
        case 22:
            return `💧 Deposited to liquidity pool (${formatAmount(op.max_amount_a)} + ${formatAmount(op.max_amount_b)})`
        
        case 'liquidity_pool_withdraw':
        case 23:
            return `💧 Withdrew from liquidity pool (${formatAmount(op.amount)} shares)`
        
        case 'invoke_host_function':
        case 24:
            return `⚡ Invoked Soroban contract${op.function ? `: ${op.function}` : ''}`
        
        case 'extend_footprint_ttl':
        case 25:
            return `⏰ Extended contract TTL`
        
        case 'restore_footprint':
        case 26:
            return `🔄 Restored contract footprint`
        
        default:
            return `❓ ${type} operation`
    }
}

function formatAmount(amount) {
    if (!amount) return '0'
    const num = parseFloat(amount)
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toFixed(2)
}

function formatAsset(asset) {
    if (!asset) return 'XLM'
    if (typeof asset === 'string') {
        if (asset === 'native') return 'XLM'
        return asset.split(':')[0] || asset
    }
    if (asset.asset_code) return asset.asset_code
    if (asset.code) return asset.code
    return 'XLM'
}

function formatAccount(address) {
    if (!address) return 'unknown'
    if (address.length === 56) {
        return `${address.substring(0, 4)}...${address.substring(52)}`
    }
    return address
}

export function decodeTransaction(tx) {
    if (!tx) return 'Unknown transaction'
    
    const ops = tx.operations || []
    if (ops.length === 0) return 'Empty transaction'
    
    if (ops.length === 1) {
        return decodeOperation(ops[0])
    }
    
    return `🔗 ${ops.length} operations: ${ops.map(op => decodeOperation(op).split(' ')[0]).join(' ')}`
}
