
const CACHE='superpwa-v1';
const ASSETS=[
  './','./index.html','./manifest.json',
  'assets/css/style.css',
  'assets/js/jquery.min.js','assets/js/jquery.mobile.min.js','assets/js/socket.io.min.js',
  'assets/js/jspdf.min.js','assets/js/app.js','assets/js/galaxy.js','assets/js/pinball.js','assets/js/player.js','assets/js/chess.min.js',
  'assets/img/icon-192.png','assets/img/icon-512.png',
  'assets/sounds/tap.wav','assets/sounds/coin.wav','assets/sounds/dice.wav','assets/sounds/bounce.wav','assets/sounds/rec.wav','assets/sounds/notify.wav',
  'assets/fonts/MaterialIcons.woff2'
];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return res;
  }).catch(()=>caches.match('./index.html')) ));
});
