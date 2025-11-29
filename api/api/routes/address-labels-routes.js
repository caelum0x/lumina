const {registerRoute} = require('../router')
const db = require('../../connectors/mongodb-connector')
const {validateNetwork} = require('../../business-logic/validators')

module.exports = function (app) {
    // Get all labels for a user (by session/IP)
    registerRoute(app,
        'labels',
        {cache: '', cors: 'open'},
        async ({params, req}) => {
            validateNetwork(params.network)
            const userId = req.headers['x-user-id'] || req.ip || 'anonymous'
            
            try {
                const labels = await db[params.network].collection('address_labels')
                    .find({user_id: userId})
                    .sort({created_at: -1})
                    .limit(1000)
                    .toArray()
                
                return {
                    records: labels.map(l => ({
                        address: l.address,
                        label: l.label,
                        color: l.color,
                        notes: l.notes,
                        created_at: l.created_at
                    }))
                }
            } catch (e) {
                return {records: []}
            }
        })
    
    // Add or update a label
    registerRoute(app,
        'labels',
        {method: 'post', cache: '', cors: 'open'},
        async ({params, req}) => {
            validateNetwork(params.network)
            const userId = req.headers['x-user-id'] || req.ip || 'anonymous'
            const {address, label, color, notes} = req.body
            
            if (!address || !label) {
                return {error: 'Address and label are required', status: 400}
            }
            
            // Validate address format
            if (!/^G[A-Z0-9]{55}$/.test(address) && !/^C[A-Z0-9]{55}$/.test(address)) {
                return {error: 'Invalid address format', status: 400}
            }
            
            try {
                await db[params.network].collection('address_labels').updateOne(
                    {user_id: userId, address: address},
                    {
                        $set: {
                            label: label.substring(0, 100),
                            color: color || '#8B5CF6',
                            notes: notes ? notes.substring(0, 500) : '',
                            updated_at: new Date()
                        },
                        $setOnInsert: {
                            user_id: userId,
                            address: address,
                            created_at: new Date()
                        }
                    },
                    {upsert: true}
                )
                
                return {
                    success: true,
                    address,
                    label
                }
            } catch (e) {
                console.error('Label save error:', e)
                return {error: 'Failed to save label', status: 500}
            }
        })
    
    // Delete a label
    registerRoute(app,
        'labels/:address',
        {method: 'delete', cache: '', cors: 'open'},
        async ({params, req}) => {
            validateNetwork(params.network)
            const userId = req.headers['x-user-id'] || req.ip || 'anonymous'
            const {address} = params
            
            try {
                const result = await db[params.network].collection('address_labels').deleteOne({
                    user_id: userId,
                    address: address
                })
                
                return {
                    success: result.deletedCount > 0,
                    deleted: result.deletedCount
                }
            } catch (e) {
                return {error: 'Failed to delete label', status: 500}
            }
        })
    
    // Get label for specific address
    registerRoute(app,
        'labels/:address',
        {cache: '', cors: 'open'},
        async ({params, req}) => {
            validateNetwork(params.network)
            const userId = req.headers['x-user-id'] || req.ip || 'anonymous'
            const {address} = params
            
            try {
                const label = await db[params.network].collection('address_labels').findOne({
                    user_id: userId,
                    address: address
                })
                
                if (!label) {
                    return {address, label: null}
                }
                
                return {
                    address: label.address,
                    label: label.label,
                    color: label.color,
                    notes: label.notes,
                    created_at: label.created_at
                }
            } catch (e) {
                return {address, label: null}
            }
        })
}
