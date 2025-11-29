import * as Sentry from '@sentry/react'

export function initSentry() {
    if (!process.env.REACT_APP_SENTRY_DSN) {
        console.log('Sentry DSN not configured, skipping initialization')
        return
    }

    Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        integrations: [
            new Sentry.BrowserTracing(),
            new Sentry.Replay()
        ],
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0
    })

    console.log('Sentry initialized for UI')
}

export {Sentry}
