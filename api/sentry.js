const Sentry = require('@sentry/node')

// Try to load ProfilingIntegration, but make it optional
let ProfilingIntegration = null
try {
    ProfilingIntegration = require('@sentry/profiling-node').ProfilingIntegration
} catch (e) {
    console.log('Sentry profiling not available (optional)')
}

function initSentry(app) {
    if (!process.env.SENTRY_DSN) {
        console.log('Sentry DSN not configured, skipping initialization')
        return
    }

    const integrations = [
        new Sentry.Integrations.Http({tracing: true}),
        new Sentry.Integrations.Express({app})
    ]
    
    // Add profiling integration only if available
    if (ProfilingIntegration) {
        try {
            integrations.push(new ProfilingIntegration())
        } catch (e) {
            console.log('Sentry profiling integration failed (optional):', e.message)
        }
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        integrations: integrations,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    })

    // Request handler must be first
    app.use(Sentry.Handlers.requestHandler())
    app.use(Sentry.Handlers.tracingHandler())

    console.log('Sentry initialized for API')
}

function errorHandler() {
    return Sentry.Handlers.errorHandler()
}

module.exports = {initSentry, errorHandler, Sentry}
