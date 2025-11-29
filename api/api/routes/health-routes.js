const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')

module.exports = function (app) {
    registerRoute(app,
        'health',
        {cache: false, cors: 'open'},
        async () => {
            const checks = {
                api: 'ok',
                horizon: 'checking',
                timestamp: Date.now()
            }
            
            try {
                await horizonAdapter.getLedgers('public', 1)
                checks.horizon = 'ok'
            } catch (e) {
                checks.horizon = 'error'
                checks.horizonError = e.message
            }
            
            return checks
        })
}
