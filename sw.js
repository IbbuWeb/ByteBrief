const APP_VERSION = '20261109-6';
const UPDATE_URL = '/ByteBrief/?source=update';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('bytebrief-') && k !== `bytebrief-${APP_VERSION}`).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Network-first: bypass stale HTTP cache for app/data requests; fall back only if offline.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  const isAppAsset =
    path.startsWith('/ByteBrief/') &&
    (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.json') || path.endsWith('/ByteBrief/') || path === '/ByteBrief');
  if (!isAppAsset) return;

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: 'no-store' });
      return fresh;
    } catch {
      const cached = await caches.match(req);
      if (cached) return cached;
      throw new Error('offline');
    }
  })());
});

self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data?.json?.() ?? {};
  } catch {
    payload = { body: event.data?.text?.() ?? '' };
  }

  const title = payload.title || 'ByteBrief got an update';
  const body =
    payload.body ||
    'Cleaner cards, text-first stories, and a smoother Saved page.';
  const url = payload.url || UPDATE_URL;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/ByteBrief/assets/icon-192.png',
      badge: '/ByteBrief/assets/icon-192.png',
      data: { url },
      tag: `bytebrief-update-${APP_VERSION}`,
      renotify: false
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || UPDATE_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (new URL(client.url).origin === self.location.origin) {
          return client.navigate(url).then(windowClient => windowClient.focus());
        }
      }
      return clients.openWindow(url);
    })
  );
});
