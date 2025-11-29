/**
 * Service Worker registration for offline caching and PWA capabilities
 */

const CACHE_NAME = 'lumina-3d-explorer-v1'
const urlsToCache = [
    '/',
    '/styles.css',
    '/app.js',
    '/img/stellar-expert-blue.svg'
]

/**
 * Register service worker
 */
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration.scope)
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                if (confirm('New version available! Reload to update?')) {
                                    window.location.reload()
                                }
                            }
                        })
                    })
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed:', error)
                })
        })
    }
}

/**
 * Unregister service worker
 */
export function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.unregister()
        })
    }
}

/**
 * Create service worker file content
 */
export function getServiceWorkerContent() {
    return `
// Service Worker for Lumina 3D Modern Stellar Explorer
const CACHE_NAME = '${CACHE_NAME}'
const urlsToCache = ${JSON.stringify(urlsToCache)}

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache')
                return cache.addAll(urlsToCache)
            })
    )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request).then(response => {
                    // Don't cache non-GET requests or non-same-origin requests
                    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
                        return response
                    }

                    // Clone the response
                    const responseToCache = response.clone()

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache)
                        })

                    return response
                })
            })
            .catch(() => {
                // Offline fallback
                if (event.request.destination === 'document') {
                    return caches.match('/')
                }
            })
    )
})
`
}

