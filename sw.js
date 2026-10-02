// Offline cache for the Metronome app. Bump VERSION after editing any file.
const VERSION = 'metronome-v4';
// this app's caches (it was called Nhịp Chuẩn before); caches of other apps on the same site are left alone
const OURS = /^(metronome|nhip-chuan)-v\d+$/;
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
// cache: 'reload' skips the browser's HTTP cache so a new version really downloads the new files
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION && OURS.test(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// cache first (works offline), refreshed from the network in the background
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const fresh = fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); e.waitUntil(caches.open(VERSION).then((c) => c.put(req, copy))); }
    return res;
  });
  e.waitUntil(fresh.catch(() => {}));
  e.respondWith(caches.open(VERSION).then((c) => c.match(req, { ignoreSearch: true })).then((hit) => hit || fresh));
});
