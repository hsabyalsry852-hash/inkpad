const C='inkpad-v1',A=['./','index.html','app.js','style.css','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(h=>{const f=fetch(e.request).then(r=>{if(r.ok&&r.status===200)caches.open(C).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>h);return h||f}))});
