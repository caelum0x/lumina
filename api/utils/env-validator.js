/**
 * Environment variable validation utility
 */

const requiredEnvVars = {
    // Optional - will use defaults from app.config.json if not set
    optional: ['PORT', 'MODE', 'NODE_ENV']
}

const recommendedEnvVars = [
    'MONGODB_URI',
    'ELASTICSEARCH_URL',
    'HORIZON_URL_PUBLIC'
]

/**
 * Validate environment variables
 * @param {boolean} strict - If true, will throw errors for missing recommended vars
 */
function validateEnvironment(strict = false) {
    const missing = []
    const warnings = []

    // Check recommended variables
    for (const varName of recommendedEnvVars) {
        if (!process.env[varName]) {
            if (strict) {
                missing.push(varName)
            } else {
                warnings.push(varName)
            }
        }
    }

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }

    if (warnings.length > 0 && !strict) {
        console.warn(`⚠️  Recommended environment variables not set: ${warnings.join(', ')}`)
        console.warn('   Using defaults from app.config.json')
    }

    // Validate format of set variables
    if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
        throw new Error('PORT must be a valid number')
    }

    if (process.env.API_CACHE_DISABLED && !['true', 'false'].includes(process.env.API_CACHE_DISABLED)) {
        throw new Error('API_CACHE_DISABLED must be "true" or "false"')
    }

    return {
        valid: true,
        warnings: warnings.length > 0 ? warnings : null
    }
}

module.exports = {validateEnvironment}

