'use strict';

const CACHE_NAME = 'static-cache-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/scripts.js',
    '/images/logo.png',
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                        console.log('Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', event => {
    // Network-First Strategy for dynamic content
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                // Clone the response
                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // Fallback to cache if offline
                return caches.match(event.request);
            })
    );
});
