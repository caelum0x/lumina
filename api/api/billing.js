const BillingService = require('@stellar-expert/api-billing-connector')
const {billing, corsWhitelist} = require('../app.config')

// Only initialize billing service if serviceToken is provided
let billingService = null

if (billing && billing.serviceToken && billing.serviceToken.trim() !== '') {
    try {
        const billingProps = {
            ...billing,
            allowlist: corsWhitelist
        }
        billingService = new BillingService(billingProps)
        billingService.connect()
        console.log('Billing service initialized')
    } catch (error) {
        console.log('Billing service initialization failed (optional):', error.message)
        billingService = null
    }
} else {
    console.log('Billing service not configured (serviceToken missing), skipping initialization')
}

// Export a mock service if billing is not configured
if (!billingService) {
    billingService = {
        connect: () => {},
        disconnect: () => {},
        isConnected: () => false,
        // charge() is called in router.js - always return true (allow all requests)
        charge: () => true,
        // Add any other methods that might be called
        getUsage: () => ({usage: 0, limit: 0}),
        checkLimit: () => true
    }
}

module.exports = billingService