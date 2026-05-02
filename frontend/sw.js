const CACHE_NAME = 'cinelandia-pwa-v1';

// Archivos estáticos que queremos guardar en el celular del cliente
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    'https://unpkg.com/@tailwindcss/browser@4'
];

// Evento de Instalación (Descarga los archivos)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cacheando archivos estáticos');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// Evento de Activación (Limpia cachés viejos si actualizas la versión)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Borrando caché antiguo');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Evento Fetch (Intercepta las peticiones de red)
self.addEventListener('fetch', (event) => {
    // IMPORTANTE: No cacheamos las llamadas a la API (base de datos o WebSockets)
    if (event.request.url.includes('/api/') || event.request.url.includes('socket.io')) {
        return; 
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si el archivo está en caché, lo devolvemos al instante
                if (response) {
                    return response;
                }
                // Si no está, lo descargamos de internet normalmente
                return fetch(event.request);
            })
    );
});