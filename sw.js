const C='inkpad-v26';
const A=['./','index.html','app.js','extra.js','plus.js','style.css','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(async c=>{await c.addAll(A);await Promise.all(CDN.map(u=>c.add(new Request(u,{mode:'cors'})).catch(()=>{})))}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='inkshare').map(x=>caches.delete(x)))));clients.claim()});
// استلام PDF من "مشاركة" أندرويد/الويب: بنحفظه مؤقتًا والصفحة بتاخده وتمسحه
async function shareH(r){const base=self.registration.scope;
 try{const fd=await r.formData(),c=await caches.open('inkshare');for(const k of await c.keys())await c.delete(k);let n=0;
  for(const f of fd.getAll('pdf')){if(!f||!f.name)continue;await c.put(new URL('s/'+n++,base).href,new Response(f,{headers:{'x-name':encodeURIComponent(f.name)}}))}
  return Response.redirect(new URL(n?'./?shared=1':'./',base).href,303)}
 catch(x){return Response.redirect(new URL('./',base).href,303)}}
// listener واحد بس لكل الطلبات
self.addEventListener('fetch',e=>{const r=e.request;
 if(r.method==='POST'){if(/\/share$/.test(new URL(r.url).pathname))e.respondWith(shareH(r));return}
 if(r.method!=='GET')return;
 e.respondWith(caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(h=>{
  const f=fetch(r).then(res=>{if(res.ok&&res.status===200){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>h||Response.error());
  if(h)e.waitUntil(f.catch(()=>{}));
  return h||f}))});
