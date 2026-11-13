const C='inkpad-v8';
const A=['./','index.html','app.js','extra.js','style.css','manifest.json','icon-192.png','icon-512.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(async c=>{await c.addAll(A);await Promise.all(CDN.map(u=>c.add(new Request(u,{mode:'cors'})).catch(()=>{})))}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='inkshare').map(x=>caches.delete(x)))));clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(h=>{const f=fetch(e.request).then(r=>{if(r.ok&&r.status===200)caches.open(C).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>h);return h||f}))});

self.addEventListener('fetch',e=>{if(e.request.method==='POST'&&/\/share$/.test(new URL(e.request.url).pathname)){e.respondWith((async()=>{const fd=await e.request.formData(),c=await caches.open('inkshare');let n=0;for(const f of fd.getAll('pdf'))await c.put('/s/'+n++,new Response(f,{headers:{'x-name':encodeURIComponent(f.name)}}));return Response.redirect('./?shared=1',303)})())}});
