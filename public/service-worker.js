// Service Worker for Lumina 3D Modern Stellar Explorer
const CACHE_NAME = 'lumina-3d-explorer-v1'
const urlsToCache = [
    '/',
    '/styles.css',
    '/app.js'
]

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

