self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    event.waitUntil(
        self.registration.showNotification(data.title || '⏰ StickyFlow 提醒', {
            body: data.body || '你有新的流笺提醒哦',
            icon: data.icon || 'logo.png',
            badge: 'logo.png'
        })
    );
});
