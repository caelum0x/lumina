import React from 'react'
import {render} from 'react-dom'
import {navigation, bindClickNavHandler} from '@stellar-expert/navigation'
import {createToastNotificationsContainer, initMeta, subscribeToStellarNetworkChange} from '@stellar-expert/ui-framework'
import Router from './views/router'
import {OfflineDetector} from './views/components/offline-detector'
import {KeyboardShortcutsProvider} from './views/components/keyboard-shortcuts-provider'
import {NotificationProvider} from './views/components/notification-system'
import {registerServiceWorker} from './views/components/service-worker'
import openRouterClient from './business-logic/ai/openrouter-client'
import appSettings from './app-settings'
import './styles.scss'
import './views/app-fixes.scss'

// Polyfill Buffer globally for Stellar SDK
import {Buffer} from 'buffer'
window.Buffer = Buffer

// Initialize Sentry (optional)
try {
    const {initSentry} = require('./sentry')
    initSentry()
} catch (err) {
    console.log('Sentry not available (optional)')
}

// Initialize OpenRouter client if API key is available
const apiKey = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_OPENROUTER_API_KEY) || 
               (typeof window !== 'undefined' && window.OPENROUTER_API_KEY)
const model = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_OPENROUTER_MODEL) || 
              'anthropic/claude-3.5-sonnet'

if (apiKey) {
    openRouterClient.init(apiKey, model)
    console.log('OpenRouter AI initialized')
} else if (typeof window !== 'undefined' && window.localStorage) {
    // Check localStorage for saved key
    const savedKey = localStorage.getItem('openrouter_api_key')
    const savedModel = localStorage.getItem('openrouter_model')
    if (savedKey) {
        openRouterClient.init(savedKey, savedModel)
        console.log('OpenRouter AI initialized from localStorage')
    } else {
        console.info('OpenRouter API key not found. AI insights will use rule-based analysis.')
    }
}

// Register service worker for offline support (disabled in development)
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    registerServiceWorker()
}

const preLoader = document.getElementById('pre-loader')
if (preLoader) { //skip initialization of pre-rendered pages
    const appContainer = document.createElement('div')

    bindClickNavHandler(appContainer)

    window.explorerFrontendOrigin = window.origin
    window.explorerApiOrigin = window.forcedExplorerApiOrigin || appSettings.apiEndpoint
    window.horizonOrigin = appSettings.horizonUrl

    subscribeToStellarNetworkChange(function () {
        window.horizonOrigin = appSettings.horizonUrl
    })

    const metaOrigin = 'https://stellar.expert'
    initMeta({
        serviceTitle: '| Lumina 3D Modern Stellar Explorer',
        origin: metaOrigin,
        description: 'Lumina 3D Modern Stellar Explorer | Stellar XLM block explorer and analytics platform',
        image: metaOrigin + '/img/stellar-expert-social-1200x630.png',
        imageEndpoint: metaOrigin + '/thumbnail'
    })

    render(
        <NotificationProvider>
            <KeyboardShortcutsProvider>
                <Router history={navigation.history}/>
            </KeyboardShortcutsProvider>
        </NotificationProvider>,
        appContainer
    )
    preLoader.parentNode.removeChild(preLoader)
    createToastNotificationsContainer()

    // Add offline detector
    const offlineDetector = document.createElement('div')
    offlineDetector.id = 'offline-detector'
    document.body.appendChild(offlineDetector)
    render(<OfflineDetector />, offlineDetector)

    document.body.appendChild(appContainer)
}