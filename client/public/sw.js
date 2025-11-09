const CACHE_NAME = 'mealtracker-v2-NEW-BUTTON';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        return caches.match('/');
      })
  );
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Mealtracker',
    body: 'Neue Benachrichtigung',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    silent: false,
    badgeCount: null
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.log('Service Worker: Push event data parse error', error);
    }
  }

  // Stille Push: Nur Badge aktualisieren, keine Notification
  if (data.silent && data.badgeCount !== null && data.badgeCount !== undefined) {
    console.log('Service Worker: Silent push - updating badge to', data.badgeCount);
    
    // Feature detection und Badge setzen
    if ('setAppBadge' in self.navigator) {
      event.waitUntil(
        self.navigator.setAppBadge(data.badgeCount).catch((error) => {
          console.log('Service Worker: Failed to set badge', error);
        })
      );
    } else {
      console.log('Service Worker: setAppBadge not supported');
    }
    return;
  }

  // Normale Push: Notification anzeigen + Badge setzen
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  const promises = [
    self.registration.showNotification(data.title, options)
  ];

  // Badge setzen wenn angegeben
  if (data.badgeCount !== null && data.badgeCount !== undefined && 'setAppBadge' in self.navigator) {
    promises.push(
      self.navigator.setAppBadge(data.badgeCount).catch((error) => {
        console.log('Service Worker: Failed to set badge', error);
      })
    );
  }

  event.waitUntil(Promise.all(promises));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
