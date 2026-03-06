const CACHE = 'konsertliste-v2';
const ASSETS = [
  '/Konsertliste/',
  '/Konsertliste/index.html',
  '/Konsertliste/icon.png',
  '/Konsertliste/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firebase') || e.request.url.includes('googleapis')) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// Motta push fra Firebase Cloud Messaging
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  const title = data.notification?.title || 'Konsertliste';
  const options = {
    body: data.notification?.body || '',
    icon: '/Konsertliste/icon.png',
    badge: '/Konsertliste/icon.png',
    tag: data.data?.konsertId || 'konsert',
    renotify: false
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Klikk på varsel åpner appen
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/Konsertliste/'));
});

// Lokal melding fra siden (fallback)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    e.waitUntil(
      self.registration.showNotification(e.data.title, {
        body: e.data.body,
        icon: '/Konsertliste/icon.png',
        badge: '/Konsertliste/icon.png',
        tag: e.data.tag || 'konsert'
      })
    );
  }
});
