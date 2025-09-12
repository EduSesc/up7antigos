const CACHE_NAME = 'up7-pwa-v1';
const urlsToCache = [
  '/',
  '/admin.html',
  '/crud.html',
  '/crudbanner.html',
  '/crudeventos.html',
  '/crudvideos.html',
  '/dashboard.html',
  '/assets/css/style.css',
  '/assets/css/admin.css',
  '/assets/css/banner.css',
  '/assets/css/crud.css',
  '/assets/css/crudeventos.css',
  '/assets/css/crudvideos.css',
  '/assets/css/dashboard.css',
  '/assets/css/pwa.css',
  '/assets/js/app.js',
  '/assets/js/admin.js',
  '/assets/js/crud.js',
  '/assets/js/crudeventos.js',
  '/assets/js/dashboard.js',
  '/assets/js/script.js',
  '/assets/img/logo3.svg',
  '/assets/img/favicon.ico/manifest.json',

];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna o cache se encontrado, senão faz a requisição
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Receber push
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || "Nova notificação";
  const options = {
    body: data.body || "Você tem uma nova mensagem.",
    icon: "/assets/img/logo3.svg",
    badge: "/assets/img/logo3.svg",
    data: data.url || "/"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
