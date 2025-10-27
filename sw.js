// sw.js — aktif hanya untuk index dan home
const CACHE = "link-grid-v1";
const ALLOWED_PAGES = ["/", "/index.html", "/home.html"];
const ICONS = [
  "/assets/icons/manifest.json",
  "/assets/icons/favicon.ico",
  "/assets/icons/favicon-16x16.png",
  "/assets/icons/favicon-32x32.png",
  "/assets/icons/favicon-72x72.png",
  "/assets/icons/favicon-96x96.png",
  "/assets/icons/favicon-128x128.png",
  "/assets/icons/favicon-144x144.png",
  "/assets/icons/favicon-180x180.png",
  "/assets/icons/favicon-192x192.png",
  "/assets/icons/favicon-256x256.png",
  "/assets/icons/favicon-384x384.png",
  "/assets/icons/favicon-512x512.png",
  "/assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ICONS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // cache-first untuk ikon
  if (ICONS.includes(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(m => m || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }))
    );
    return;
  }

  // hanya intersep index dan home
  const isHTML = e.request.headers.get("accept")?.includes("text/html");
  const isAllowed = isHTML && ALLOWED_PAGES.includes(url.pathname);
  if (!isAllowed) return;

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match("/")))
  );
});
