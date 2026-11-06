const UPDATE_URL = '/ByteBrief/?source=update';

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
      tag: 'bytebrief-update-v1',
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
