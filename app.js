(()=>{const sh=m=>{let d=document.getElementById('err');if(!d){d=document.createElement('div');d.id='err';d.style.cssText='position:fixed;left:0;right:0;top:0;z-index:99;background:#b91c1c;color:#fff;font:12px monospace;padding:6px 8px;direction:ltr;white-space:pre-wrap';d.onclick=()=>d.remove();document.body.append(d)}d.textContent='خطأ (اضغط للإخفاء): '+m};
addEventListener('error',e=>sh(e.message+' @'+(e.lineno||'')));addEventListener('unhandledrejection',e=>sh(String(e.reason&&e.reason.message||e.reason)))})();
const $=s=>document.querySelector(s),E=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const DB=new Promise(r=>{const q=indexedDB.open('inkpad',1);q.onupgradeneeded=()=>{q.result.createObjectStore('d',{keyPath:'id'});q.result.createObjectStore('f')};q.onsuccess=()=>r(q.result)});
const tx=async(st,m,f)=>{const db=await DB;return new Promise((ok,no)=>{const t=db.transaction(st,m),r=f(t.objectStore(st));t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>no(t.error)})};
const dbPut=d=>tx('d','readwrite',s=>s.put(d));
const S={t:'pen',c:'#1e40af',w:3,z:1,fit:1,sh:'line',und:[],red:[],pg:[]},W=595,H=842;
// ---------- home ----------
const SZ=()=>{try{return JSON.parse(localStorage.getItem('inksz')||'{}')}catch(e){return{}}},
SO=()=>{try{return localStorage.getItem('inkso')||'u'}catch(e){return'u'}},
fmt=n=>n<1048576?Math.max(1,Math.round(n/1024))+' KB':(n/1048576).toFixed(1)+' MB',
inkSort=(x,y)=>{const o=SO(),z=SZ();return o==='n'?String(x.n).localeCompare(String(y.n),'ar'):o==='sz'?(z[y.id]||0)-(z[x.id]||0):y.u-x.u};
async function bfill(a){if(S.bf)return;const m=SZ(),todo=a.filter(d=>d.k==='pdf'&&m[d.id]===undefined);if(!todo.length)return;S.bf=1;
 for(const d of todo){try{const b=await tx('f','readonly',s=>s.get(d.id));m[d.id]=b?b.byteLength:0}catch(e){m[d.id]=0}}
 try{localStorage.setItem('inksz',JSON.stringify(m))}catch(e){}S.bf=0;home()}
async function home(){$('#ed').hidden=true;$('#home').hidden=false;const l=$('#list');l.innerHTML='';
 const a=(await tx('d','readonly',s=>s.getAll())).sort(inkSort);
 lib(l,a);bfill(a);const q=$('#ls').value.trim().toLowerCase(),fl=a.filter(d=>(!q||(d.n+' '+(d.tag||'')).toLowerCase().includes(q))&&(!S.tg||d.tag===S.tg));if(!a.length)l.innerHTML='<p class="em">لسه مفيش ملفات. افتح PDF أو اعمل ملاحظة جديدة.</p>';
 fl.forEach(d=>{const r=E('div','it','<div><b></b><small></small></div><button>🗑</button><button class="tg">🏷</button>');
  r.querySelector('b').textContent=d.n;r.querySelector('small').textContent=(d.k==='pdf'?'PDF':'ملاحظة')+' · '+new Date(d.u).toLocaleDateString('ar-EG')+(d.k==='pdf'&&SZ()[d.id]?' · '+fmt(SZ()[d.id]):'')+(d.tag?' · 📁'+d.tag:'');
  r.firstChild.onclick=()=>openDoc(d.id);r.querySelector('.tg').onclick=async()=>{const t=prompt('اسم المجلد/الوسم (فاضي = بدون):',d.tag||'');if(t!==null){d.tag=t.trim();await dbPut(d);home()}};
  r.querySelector('button').onclick=async()=>{if(confirm('حذف؟')){await tx('d','readwrite',s=>s.delete(d.id));await tx('f','readwrite',s=>s.delete(d.id));home()}};l.append(r)})}
$('#fp').onchange=async e=>{const f=e.target.files[0];if(!f)return;const id='p'+Date.now();
 const b=await f.arrayBuffer();await tx('f','readwrite',s=>s.put(b,id));
 await dbPut({id,n:f.name.replace(/\.pdf$/i,''),k:'pdf',s:{},u:Date.now()});e.target.value='';openDoc(id)};
$('#nn').onclick=async()=>{const id='n'+Date.now();await dbPut({id,n:'ملاحظة '+new Date().toLocaleDateString('ar-EG'),k:'note',np:1,tp:$('#tpl').value,s:{},u:Date.now()});openDoc(id)};
// ---------- editor ----------
async function openDoc(id){const d=await tx('d','readonly',s=>s.get(id));S.d=d;S.pdf=null;S.und=[];S.red=[];S.tc=[];S.sr=[];S.si=-1;S.lq='';clearHl();$('#ed').classList.toggle('nt',!!d.nt);$('#sb').hidden=true;$('#cnt').textContent='';$('#si').value='';$('#ed').classList.remove('fs');
 $('#home').hidden=true;$('#ed').hidden=false;$('#ttl').textContent=d.n;$('#ap').hidden=d.k!=='note';$('#sq').hidden=d.k!=='pdf';
 let n=d.np;
 if(d.k==='pdf'){const data=await tx('f','readonly',s=>s.get(id));const lt=pdfjsLib.getDocument({data});lt.onPassword=cb=>cb(prompt('كلمة سر الملف:')||'');
  try{S.pdf=await lt.promise}catch(e){alert('تعذر فتح الملف');return home()}n=S.pdf.numPages}
 const p1=S.pdf?(await S.pdf.getPage(1)).getViewport({scale:1}):{width:W,height:H};
 S.fit=Math.min(2,($('#sc').clientWidth-8)/p1.width);S.z=Math.max(S.fit*.5,Math.min(S.fit*3,S.fit*(d.zr||1)));
 const g=$('#pgs');g.innerHTML='';S.pg=[];S.io&&S.io.disconnect();
 S.io=new IntersectionObserver(es=>es.forEach(e=>{const el=e.target;if(e.isIntersecting)rp(el.i);else{el.bg.width=el.ink.width=1;el.r=null;el.tl&&(el.tl.remove(),el.tl=null)}}),{root:$('#sc'),rootMargin:'300px 0px'});
 for(let i=0;i<n;i++)addPg(i,[p1.width,p1.height]);S.rs=1;rst(d);setTimeout(()=>S.rs=0,700)}
function rst(d){const el=S.pg[d.pi||0],sc=$('#sc');if(el&&(d.pi||d.po)){const x=el.getBoundingClientRect(),y=sc.getBoundingClientRect();sc.scrollTop+=x.top-y.top+(d.po||0)*x.height}up()}
function addPg(i,dim){const el=E('div','pg');el.i=i;el.dim=dim;el.bg=E('canvas');el.ink=E('canvas','ink');el.append(el.bg,el.ink);
 el.style.width=dim[0]*S.z+'px';el.style.height=dim[1]*S.z+'px';bind(el);S.pg[i]=el;$('#pgs').append(el);S.io.observe(el)}
async function bgDraw(i,c,k){const el=S.pg[i];c.fillStyle='#fff';c.fillRect(0,0,el.dim[0]*k,el.dim[1]*k);
 if(S.pdf){const p=await S.pdf.getPage(i+1);await p.render({canvasContext:c,viewport:p.getViewport({scale:k})}).promise;return}
 const t=S.d.tp,s=28*k;c.strokeStyle=c.fillStyle='#cbd5e1';c.lineWidth=Math.max(1,k*.6);
 if(t==='lines')for(let y=s*1.5;y<H*k;y+=s){c.beginPath();c.moveTo(0,y);c.lineTo(W*k,y);c.stroke()}
 else if(t==='grid'){for(let y=s;y<H*k;y+=s){c.beginPath();c.moveTo(0,y);c.lineTo(W*k,y);c.stroke()}for(let x=s;x<W*k;x+=s){c.beginPath();c.moveTo(x,0);c.lineTo(x,H*k);c.stroke()}}
 else if(t==='dots')for(let y=s;y<H*k;y+=s)for(let x=s;x<W*k;x+=s)c.fillRect(x-k*.8,y-k*.8,k*1.6,k*1.6)}
async function rp(i){const el=S.pg[i];if(!el||el.r===S.z)return;el.r=S.z;const t=el.tk=(el.tk||0)+1;
 if(S.pdf){const v=(await S.pdf.getPage(i+1)).getViewport({scale:1});el.dim=[v.width,v.height]}
 const w=el.dim[0]*S.z,h=el.dim[1]*S.z;let d=Math.min(devicePixelRatio||1,2);d=Math.max(.8,Math.min(d,Math.sqrt(3e6/(w*h))));const oc=E('canvas');oc.width=w*d;oc.height=h*d;
 await bgDraw(i,oc.getContext('2d'),S.z*d);if(t!==el.tk)return;
 el.style.width=w+'px';el.style.height=h+'px';
 for(const c of[el.bg,el.ink]){c.width=w*d;c.height=h*d;c.style.width=w+'px';c.style.height=h+'px'}
 el.bg.getContext('2d').drawImage(oc,0,0);oc.width=oc.height=0;ink(i);buildTl(i)}
function ds(c,o,k){c.save();c.lineCap=c.lineJoin='round';c.strokeStyle=c.fillStyle=o.c;c.lineWidth=o.w*k*(o.t==='hl'?4:1);if(o.t==='hl')c.globalAlpha=.35;
 if(o.t==='im'){const g=im(o.src);if(g.complete&&g.naturalWidth)c.drawImage(g,o.p[0][0]*k,o.p[0][1]*k,o.w*k,o.h*k);c.restore();return}
 if(o.t==='hr'){c.globalAlpha=.4;c.fillStyle=o.c;o.rs.forEach(r=>c.fillRect(r[0]*k,r[1]*k,r[2]*k,r[3]*k));c.restore();return}
 const p=o.p,X=i=>p[i][0]*k,Y=i=>p[i][1]*k;c.beginPath();
 if(o.t==='pen'&&p.some(q=>q[2]>0&&q[2]!==.5)){for(let i=1;i<p.length;i++){c.beginPath();c.lineWidth=o.w*k*(.4+1.2*(p[i][2]+p[i-1][2])/2);c.moveTo(X(i-1),Y(i-1));c.lineTo(X(i),Y(i));c.stroke()}}else if(o.t==='pen'||o.t==='hl'){c.moveTo(X(0),Y(0));for(let i=1;i<p.length-1;i++)c.quadraticCurveTo(X(i),Y(i),(X(i)+X(i+1))/2,(Y(i)+Y(i+1))/2);c.lineTo(X(p.length-1),Y(p.length-1));c.stroke()}
 else if(o.t==='line'){c.moveTo(X(0),Y(0));c.lineTo(X(1),Y(1));c.stroke()}
 else if(o.t==='rect')c.strokeRect(X(0),Y(0),X(1)-X(0),Y(1)-Y(0));
 else if(o.t==='ell'){c.ellipse((X(0)+X(1))/2,(Y(0)+Y(1))/2,Math.abs(X(1)-X(0))/2||1,Math.abs(Y(1)-Y(0))/2||1,0,0,7);c.stroke()}
 else{c.font=o.w*k+'px sans-serif';c.textBaseline='top';o.s.split('\n').forEach((t,j)=>c.fillText(t,X(0),Y(0)+j*o.w*k*1.25))}
 c.restore()}
function ink(i){const el=S.pg[i],c=el.ink.getContext('2d'),k=el.ink.width/el.dim[0];c.clearRect(0,0,el.ink.width,el.ink.height);
 (S.d.s[i]||[]).forEach(o=>ds(c,o,k));if(el.cur)ds(c,el.cur,k);el.lz&&el.lz.length&&lzd(c,el,k);LS.r(c,el,k)}
// ---------- drawing ----------
const pt=(e,el)=>{const r=el.getBoundingClientRect();return[(e.clientX-r.left)/S.z,(e.clientY-r.top)/S.z,e.pointerType==='pen'&&e.pressure?+e.pressure.toFixed(2):.5]};
function sp(o){if(o.t==='im')return[0,1,2,3,4].flatMap(u=>[0,1,2,3,4].map(v=>[o.p[0][0]+o.w*u/4,o.p[0][1]+o.h*v/4]));if(o.t==='hr')return o.rs.flatMap(r=>[0,1,2,3,4].map(k=>[r[0]+r[2]*k/4,r[1]+r[3]/2]));const p=o.p;if(o.t==='pen'||o.t==='hl'||o.t==='tx')return p;const[a,b]=p,r=[],L=(u,v)=>{for(let k=0;k<=10;k++)r.push([u[0]+(v[0]-u[0])*k/10,u[1]+(v[1]-u[1])*k/10])};
 if(o.t==='line')L(a,b);else if(o.t==='rect'){L(a,[b[0],a[1]]);L([b[0],a[1]],b);L(b,[a[0],b[1]]);L([a[0],b[1]],a)}
 else{const cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,rx=Math.abs(b[0]-a[0])/2,ry=Math.abs(b[1]-a[1])/2;for(let k=0;k<32;k++){const t=k/32*6.283;r.push([cx+rx*Math.cos(t),cy+ry*Math.sin(t)])}}return r}
function era(el,p){const l=S.d.s[el.i]||[],r=8+S.w*2;for(let j=l.length-1;j>=0;j--)if(sp(l[j]).some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<r))el.er.push(...l.splice(j,1));ink(el.i)}
function bind(el){const c=el.ink;
 c.onpointerdown=e=>{if(S.t==='hand'||!e.isPrimary||S.po&&e.pointerType==='touch')return;e.preventDefault();const p=SN(pt(e,el)),i=el.i;if(S.t==='ls'){c.setPointerCapture(e.pointerId);el.dn=1;LS.d(el,p);return}
  if(S.t==='mv'){const l=S.d.s[i]||[];let h=null;for(let j=l.length-1;j>=0&&!h;j--)if(sp(l[j]).some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<14))h=l[j];if(h){el.mo={o:h,p0:p,sv:JSON.stringify(h)};c.setPointerCapture(e.pointerId);el.dn=1}return}
  if(S.t==='lz'){const o={c:S.c,w:S.w,p:[p],end:0};(el.lz=el.lz||[]).push(o);el.lo=o;c.setPointerCapture(e.pointerId);el.dn=1;lzLoop();return}
  if(S.t==='tx'){const s=prompt('اكتب النص:');if(s)add(i,{t:'tx',c:S.c,w:S.w*4+8,p:[p],s});return}
  if(S.t==='er'){el.er=[];era(el,p)}
  else el.cur={t:S.t==='sh'?S.sh:S.t,c:S.c,w:S.w,p:S.t==='sh'?[p,p]:[p]};
  c.setPointerCapture(e.pointerId);el.dn=1};
 c.onpointermove=e=>{if(!el.dn)return;const p=SN(pt(e,el));if(S.t==='ls'){LS.m(el,p);return}
  if(S.t==='mv'){const m=el.mo;if(m){const dx=p[0]-m.p0[0],dy=p[1]-m.p0[1],s=JSON.parse(m.sv),o=m.o;if(o.rs)o.rs=s.rs.map(r=>[r[0]+dx,r[1]+dy,r[2],r[3]]);else o.p=s.p.map(q=>q.map((v,n)=>n==0?v+dx:n==1?v+dy:v));cancelAnimationFrame(el.f);el.f=requestAnimationFrame(()=>ink(el.i))}return}
  el.lt=Date.now();
  if(S.t==='lz'){el.lo&&el.lo.p.push(p);return}
  if(S.t==='er')era(el,p);else if(S.t==='sh')el.cur.p[1]=p;else if(S.rl&&S.t==='pen')el.cur.p=[el.cur.p[0],p];else el.cur.p.push(p);
  cancelAnimationFrame(el.f);el.f=requestAnimationFrame(()=>ink(el.i))};
 c.onpointerup=c.onpointercancel=()=>{if(!el.dn)return;el.dn=0;if(S.t==='ls'){LS.u(el);return}
  if(S.t==='mv'){el.mo=null;save();return}
  if(S.t==='lz'){if(el.lo)el.lo.end=Date.now();el.lo=null;return}
  if(S.t==='er'){if(el.er.length)push({a:'del',i:el.i,o:el.er});el.er=null}
  else if(el.cur){const o=el.cur;el.cur=null;if(o.t==='pen'&&o.p.length>8&&Date.now()-(el.lt||0)>550)snap(o);add(el.i,o)}}}
function add(i,o){(S.d.s[i]=S.d.s[i]||[]).push(o);push({a:'add',i,o:[o]})}
function push(a){S.und.push(a);S.red=[];ink(a.i);save()}
function apply(a,inv){const l=S.d.s[a.i]=S.d.s[a.i]||[];
 if((a.a==='add')===inv)a.o.forEach(o=>{const x=l.indexOf(o);if(x>=0)l.splice(x,1)});else l.push(...a.o);ink(a.i);save()}
$('#un').onclick=()=>{const a=S.und.pop();if(a){apply(a,true);S.red.push(a)}};
$('#re').onclick=()=>{const a=S.red.pop();if(a){apply(a,false);S.und.push(a)}};
let st;function save(){clearTimeout(st);st=setTimeout(flush,600)}
function flush(){clearTimeout(st);if(!S.d||$('#ed').hidden)return;S.d.u=Date.now();return dbPut(S.d)}
document.addEventListener('visibilitychange',()=>document.hidden&&flush());
// ---------- tools / zoom ----------
function sync(){document.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===S.t));$('#ed').classList.toggle('dr',S.t!=='hand')}
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{S.t=b.dataset.t;sync()});
$('#shs').onchange=e=>{S.sh=e.target.value;S.t='sh';sync()};
$('#wd').oninput=e=>S.w=+e.target.value;
const cl=$('#cl');
function pc(){cl.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',b.dataset.c===S.c))}
['#1e40af','#dc2626','#16a34a','#111827','#facc15','#9333ea'].forEach(c=>{const b=E('button','sw');b.style.background=c;b.dataset.c=c;b.onclick=()=>{S.c=c;$('#co').value=c;pc()};cl.append(b)});
$('#co').oninput=e=>{S.c=e.target.value;pc()};pc();sync();
const vis=el=>{const a=el.getBoundingClientRect(),b=$('#sc').getBoundingClientRect();return a.bottom>b.top-600&&a.top<b.bottom+600};
function zoom(z){z=Math.max(S.fit*.5,Math.min(S.fit*3,z));const sc=$('#sc'),rx=(sc.scrollLeft+sc.clientWidth/2)/sc.scrollWidth,ry=(sc.scrollTop+sc.clientHeight/2)/sc.scrollHeight;
 S.z=z;S.pg.forEach(el=>{el.style.width=el.dim[0]*z+'px';el.style.height=el.dim[1]*z+'px';el.r=null;el.tl&&(el.tl.style.transform='scale('+z+')')});S.d.zr=z/S.fit;save();
 sc.scrollLeft=rx*sc.scrollWidth-sc.clientWidth/2;sc.scrollTop=ry*sc.scrollHeight-sc.clientHeight/2;
 S.pg.forEach(el=>vis(el)&&rp(el.i))}
$('#zi').onclick=()=>zoom(S.z*1.25);$('#zo').onclick=()=>zoom(S.z/1.25);
const dist=e=>Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
$('#sc').addEventListener('touchstart',e=>{if(e.touches.length===2){S.pd=dist(e);S.pl=S.pd;S.pz=S.z;S.pg.forEach(el=>{el.dn=0;el.cur=null;if(el.ink.width>1)ink(el.i)})}},{passive:true});
$('#sc').addEventListener('touchmove',e=>{if(S.pd&&e.touches.length===2)S.pl=dist(e)},{passive:true});
$('#sc').addEventListener('touchend',e=>{if(S.pd&&e.touches.length<2){const r=S.pl/S.pd;S.pd=0;if(Math.abs(r-1)>.05)zoom(S.pz*r)}},{passive:true});
function up(){const sc=$('#sc'),m=sc.getBoundingClientRect().top+sc.clientHeight/3;let c=0;S.pg.forEach((el,i)=>{if(el.getBoundingClientRect().top<=m)c=i});$('#pn').textContent=(c+1)+'/'+S.pg.length;S.cp=c;updBm();if(!S.rs&&S.d&&S.pg[c]){const x=S.pg[c].getBoundingClientRect(),y=sc.getBoundingClientRect();S.d.pi=c;S.d.po=(y.top-x.top)/x.height;save()}}
let ur=0;$('#sc').onscroll=()=>{ur||(ur=requestAnimationFrame(()=>{ur=0;up()}))};
$('#pn').onclick=()=>{const n=+prompt('رقم الصفحة:');if(n>0&&n<=S.pg.length)S.pg[n-1].scrollIntoView()};
$('#ttl').onclick=()=>{const n=prompt('الاسم:',S.d.n);if(n){S.d.n=n;$('#ttl').textContent=n;save()}};
$('#ap').onclick=()=>{const i=S.pg.length;S.d.np++;addPg(i,[W,H]);rp(i).then(()=>S.pg[i].scrollIntoView());save()};
$('#bk').onclick=async()=>{$('#ed').classList.remove('fs');document.fullscreenElement&&document.exitFullscreen();clearHl();await flush();try{S.pdf&&S.pdf.destroy&&S.pdf.destroy()}catch(e){}S.d=null;home()};
// ---------- export ----------
async function exImg(b){const D=await PDFLib.PDFDocument.create(),n=S.pg.length;
 for(let i=0;i<n;i++){const el=S.pg[i];if(S.pdf){const v=(await S.pdf.getPage(i+1)).getViewport({scale:1});el.dim=[v.width,v.height]}
  const k=2,c=E('canvas');c.width=el.dim[0]*k;c.height=el.dim[1]*k;const x=c.getContext('2d');await bgDraw(i,x,k);(S.d.s[i]||[]).forEach(o=>ds(x,o,k));
  const im=await D.embedJpg(await(await fetch(c.toDataURL('image/jpeg',.88))).arrayBuffer());
  D.addPage([el.dim[0],el.dim[1]]).drawImage(im,{x:0,y:0,width:el.dim[0],height:el.dim[1]});b.textContent=(i+1)+'/'+n}
 return D}
async function exTxt(b){const data=await tx('f','readonly',s=>s.get(S.d.id));const D=await PDFLib.PDFDocument.load(data),P=D.getPages(),n=S.pg.length,k=2;
 for(let i=0;i<n;i++){const l=S.d.s[i]||[];b.textContent=(i+1)+'/'+n;if(!l.length)continue;
  const v=(await S.pdf.getPage(i+1)).getViewport({scale:1}),w=v.width,h=v.height,c=E('canvas');c.width=w*k;c.height=h*k;const x=c.getContext('2d');l.forEach(o=>ds(x,o,k));
  const im=await D.embedPng(await(await fetch(c.toDataURL('image/png'))).arrayBuffer()),p=P[i],cb=p.getCropBox(),r=((p.getRotation().angle%360)+360)%360;
  let X=cb.x,Y=cb.y;if(r===90)X+=cb.width;else if(r===180){X+=cb.width;Y+=cb.height}else if(r===270)Y+=cb.height;
  p.drawImage(im,{x:X,y:Y,width:w,height:h,rotate:PDFLib.degrees(r)})}
 return D}
$('#ex').onclick=async()=>{const b=$('#ex');b.disabled=true;let img=0;
 try{let D;if(S.pdf){try{D=await exTxt(b)}catch(e){console.warn(e);img=1;D=await exImg(b)}}else{D=await exImg(b)}
  const blob=new Blob([await D.save()],{type:'application/pdf'}),f=new File([blob],S.d.n+'.pdf',{type:'application/pdf'});
  if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f]}).catch(()=>{});
  else{const a=E('a');a.href=URL.createObjectURL(blob);a.download=f.name;a.click()}
  if(img)alert('الملف ده اتصدّر كصور (النص مش قابل للتحديد) لأنه محمي أو غير مدعوم.');
 }catch(e){alert('فشل التصدير: '+e.message)}
 b.textContent='⬇ PDF';b.disabled=false};
// ---------- search ----------
const NM=s=>{let r='';for(const c0 of s)for(const c of c0.normalize('NFKC').toLowerCase()){if(/[\u064B-\u065F\u0670\u0640]/.test(c))continue;
 const d='٠١٢٣٤٥٦٧٨٩'.indexOf(c);r+='أإآٱ'.includes(c)?'ا':c==='ى'?'ي':c==='ة'?'ه':d>=0?String(d):/\s/.test(c)?' ':c}return r};
async function ptxt(i){if(S.tc[i])return S.tc[i];const p=await S.pdf.getPage(i+1),tc=await p.getTextContent(),v=p.getViewport({scale:1}),T={s:'',mi:[],mo:[],it:[],w:v.width,h:v.height};
 tc.items.forEach(t=>{if(typeof t.str!=='string')return;const j=T.it.length,tr=pdfjsLib.Util.transform(v.transform,t.transform),
  lx=Math.hypot(tr[0],tr[1])||1,ly=Math.hypot(tr[2],tr[3])||1;
  T.it.push({str:t.str,x:tr[4],y:tr[5],dx:tr[0]/lx,dy:tr[1]/lx,ux:tr[2]/ly,uy:tr[3]/ly,w:t.width,h:t.height||ly,n:t.str.length,ar:/[\u0590-\u08FF\uFB1D-\uFEFF]/.test(t.str)});
  let o=0;for(const c0 of t.str){const n=NM(c0);for(const c of n){if(c===' '&&T.s.endsWith(' '))continue;T.s+=c;T.mi.push(j);T.mo.push(o)}o+=c0.length}
  if(t.hasEOL&&!T.s.endsWith(' ')){T.s+=' ';T.mi.push(-1);T.mo.push(0)}});
 return S.tc[i]=T}
function rects(T,a,b){const g={};for(let k=a;k<b;k++){const j=T.mi[k];if(j<0)continue;const o=T.mo[k];g[j]=g[j]?[Math.min(g[j][0],o),Math.max(g[j][1],o+1)]:[o,o+1]}
 return Object.keys(g).map(j=>{const t=T.it[j];let f0=g[j][0]/t.n,f1=g[j][1]/t.n;if(t.ar){f0=0;f1=1}
  const p=[[f0,-.2],[f1,-.2],[f0,1],[f1,1]].map(([u,v])=>[t.x+t.dx*t.w*u+t.ux*t.h*v,t.y+t.dy*t.w*u+t.uy*t.h*v]),xs=p.map(q=>q[0]),ys=p.map(q=>q[1]),x=Math.min(...xs),y=Math.min(...ys);
  return{x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y,W:T.w,H:T.h}})}
function clearHl(){document.querySelectorAll('.sh').forEach(e=>e.remove())}
async function find(q){const tok=S.stk=(S.stk||0)+1;clearHl();S.sr=[];S.si=-1;S.lq=q;const nq=NM(q.trim()).replace(/ +/g,' '),cn=$('#cnt');
 if(!nq){cn.textContent='';return}let any=0;
 for(let i=0;i<S.pg.length;i++){if(tok!==S.stk)return;cn.textContent='…'+(i+1)+'/'+S.pg.length;const T=await ptxt(i);if(T.s.trim())any=1;
  let k=0;while((k=T.s.indexOf(nq,k))>=0){const rs=rects(T,k,k+nq.length),els=rs.map(r=>{const d=E('div','sh');d.style.cssText='left:'+r.x/r.W*100+'%;top:'+r.y/r.H*100+'%;width:'+r.w/r.W*100+'%;height:'+r.h/r.H*100+'%';S.pg[i].append(d);return d});S.sr.push({i,els});k+=nq.length}}
 if(!S.sr.length){cn.textContent=any?'0':'مفيش نص';return}go(0)}
function go(n){const L=S.sr.length;if(!L)return;S.sr.forEach(r=>r.els.forEach(e=>e.classList.remove('cur')));S.si=(n+L)%L;const r=S.sr[S.si];r.els.forEach(e=>e.classList.add('cur'));
 $('#cnt').textContent=(S.si+1)+'/'+L;r.els[0].scrollIntoView({block:'center',inline:'center'})}
$('#sq').onclick=()=>{const s=$('#sb');s.hidden=!s.hidden;if(s.hidden){clearHl();S.sr=[];S.lq='';$('#cnt').textContent=''}else $('#si').focus()};
$('#sx').onclick=()=>{$('#sb').hidden=true;clearHl();S.sr=[];S.lq='';S.stk++;$('#cnt').textContent=''};
$('#si').onkeydown=e=>{if(e.key!=='Enter')return;e.preventDefault();const v=e.target.value;if(v!==S.lq)find(v);else go(S.si+(e.shiftKey?-1:1))};
$('#sn').onclick=()=>{const v=$('#si').value;if(v!==S.lq)find(v);else go(S.si+1)};
$('#sp').onclick=()=>{const v=$('#si').value;if(v!==S.lq)find(v);else go(S.si-1)};
// ---------- tap to hide/show bars (hand tool) ----------
let tp=null;const fsT=()=>{const on=$('#ed').classList.toggle('fs'),d=document;try{if(on&&!d.fullscreenElement)0;else if(!on&&d.fullscreenElement)d.exitFullscreen()}catch(e){}};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)$('#ed').classList.remove('fs')});
$('#sc').addEventListener('pointerdown',e=>{tp=e.isPrimary&&S.t==='hand'?{x:e.clientX,y:e.clientY,t:Date.now()}:null});
$('#sc').addEventListener('pointerup',e=>{if(!tp)return;const d=Math.hypot(e.clientX-tp.x,e.clientY-tp.y),ms=Date.now()-tp.t;tp=null;if(d<10&&ms<400&&!S.pd&&!getSelection().toString())fsT()});
$('#sc').addEventListener('pointercancel',()=>tp=null);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
home();

// ---------- text layer (select / copy / highlight) ----------
const mc=document.createElement('canvas').getContext('2d');
async function buildTl(i){const el=S.pg[i];if(!S.pdf||!el||el.tl||el.tb)return;el.tb=1;await new Promise(r=>setTimeout(r,200));el.tb=0;if(!el.r||el.tl)return;const T=await ptxt(i);if(el.tl||!el.r)return;
 const d=E('div','tl'),fr=document.createDocumentFragment();d.style.cssText='width:'+T.w+'px;height:'+T.h+'px;transform:scale('+S.z+')';
 T.it.forEach(t=>{if(!t.str.trim())return;mc.font=t.h+'px sans-serif';const w=mc.measureText(t.str).width,x=w&&t.w?t.w/w:1,s=E('span');s.textContent=t.str;
  s.style.cssText='left:'+t.x+'px;top:'+(t.y-t.h*.82)+'px;font-size:'+t.h+'px;transform-origin:0 82%;transform:rotate('+Math.atan2(t.dy,t.dx)+'rad) scaleX('+(isFinite(x)&&x>0?x:1)+')';fr.append(s)});
 d.append(fr);el.insertBefore(d,el.ink);el.tl=d}
const hs=()=>{const s=getSelection();return S.t==='hand'&&s&&!s.isCollapsed&&$('#pgs').contains(s.anchorNode)?s:null};
document.addEventListener('selectionchange',()=>{$('#sa').hidden=!hs()});
$('#sa').addEventListener('pointerdown',e=>e.preventDefault());
$('#cp').onclick=()=>{const s=hs();if(s)navigator.clipboard.writeText(s.toString()).then(()=>{$('#cp').textContent='✓';setTimeout(()=>$('#cp').textContent='📋 نسخ',900)})};
document.querySelectorAll('#sa [data-h]').forEach(b=>b.onclick=()=>{const s=hs();if(!s)return;const by={};
 for(const r of s.getRangeAt(0).getClientRects()){if(r.width<2||r.height>60)continue;const cx=r.left+r.width/2,cy=r.top+r.height/2;
  const i=S.pg.findIndex(el=>{const q=el.getBoundingClientRect();return cx>=q.left&&cx<=q.right&&cy>=q.top&&cy<=q.bottom});if(i<0)continue;
  const q=S.pg[i].getBoundingClientRect(),u=[(r.left-q.left)/S.z,(r.top-q.top)/S.z,r.width/S.z,r.height/S.z];
  if(!(by[i]=by[i]||[]).some(v=>Math.abs(v[0]-u[0])<1&&Math.abs(v[1]-u[1])<1&&Math.abs(v[2]-u[2])<2))by[i].push(u)}
 const tt=s.toString();let f1=1;for(const i in by){add(+i,{t:'hr',c:b.dataset.h,rs:by[i],tx:f1?tt:''});f1=0}s.removeAllRanges()});
// ---------- toolbar position ----------
const lg=()=>{try{return localStorage.getItem('inkpos')}catch(e){}};
function pos(){const L=lg()==='L';$('#ed').classList.toggle('L',L);$('#tp').textContent=L?'⬇':'⬅'}
$('#tp').onclick=()=>{try{localStorage.setItem('inkpos',lg()==='L'?'B':'L')}catch(e){}pos()};pos();

// ---------- laser pen (fades after 7s) ----------
let lzR=0;
function lzLoop(){if(lzR)return;lzR=1;const f=()=>{const n=Date.now();let al=0;S.pg.forEach(el=>{if(!el.lz||!el.lz.length)return;el.lz=el.lz.filter(o=>!o.end||n-o.end<7000);al+=el.lz.length;ink(el.i)});if(al)requestAnimationFrame(f);else lzR=0};requestAnimationFrame(f)}
function lzd(c,el,k){const n=Date.now();el.lz.forEach(o=>{const a=o.end?Math.min(1,(7000-(n-o.end))/1500):1;if(a<=0)return;c.save();c.globalAlpha=a;c.lineCap=c.lineJoin='round';c.beginPath();
 o.p.forEach((q,j)=>j?c.lineTo(q[0]*k,q[1]*k):c.moveTo(q[0]*k,q[1]*k));if(o.p.length===1)c.lineTo(o.p[0][0]*k+.1,o.p[0][1]*k);
 c.shadowColor=o.c;c.shadowBlur=16*k;c.strokeStyle=o.c;c.lineWidth=(o.w+3)*k;c.stroke();c.shadowBlur=0;c.strokeStyle='#fff';c.lineWidth=Math.max(1,o.w*.45)*k;c.stroke();c.restore()})}
// ---------- pages / bookmarks / highlights panel ----------
let tab='pg';
function updBm(){const b=$('#bm');if(b)b.textContent=S.d&&(S.d.bm||[]).includes(S.cp)?'⭐':'☆'}
function tgl(i){const b=S.d.bm=S.d.bm||[],x=b.indexOf(i);x<0?b.push(i):b.splice(x,1);save();updBm()}
function go2(i){$('#pl').hidden=true;S.pg[i].scrollIntoView()}
async function th(d){const i=d.i,c=d.c,k=c.width/S.pg[i].dim[0],x=c.getContext('2d');await bgDraw(i,x,k);(S.d.s[i]||[]).forEach(o=>ds(x,o,k))}
function plR(){const b=$('#plb');b.innerHTML='';b.classList.toggle('l',tab==='hl');document.querySelectorAll('#plh [data-p]').forEach(x=>x.classList.toggle('on',x.dataset.p===tab));
 if(tab==='hl'){const L=[];S.pg.forEach((_,i)=>(S.d.s[i]||[]).forEach(o=>o.t==='hr'&&o.tx&&o.tx.trim()&&L.push([i,o])));
  const cb=E('button');cb.textContent='📋 نسخ الكل ('+L.length+')';cb.onclick=()=>navigator.clipboard.writeText(L.map(([i,o])=>'• '+o.tx.trim()+' (ص'+(i+1)+')').join('\n\n'));b.append(cb);
  if(!L.length){const p=E('p');p.textContent='حدّد نص بـ✋ واضغط لون هايلايت، وهيتجمع هنا.';b.append(p)}
  L.forEach(([i,o])=>{const d=E('div','hi');d.style.borderColor=o.c;d.textContent=o.tx.trim()+' — ص'+(i+1);d.onclick=()=>go2(i);b.append(d)});return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);th(e.target)}}),{root:b}),bm=S.d.bm||[];
 S.pg.forEach((el,i)=>{if(tab==='bm'&&!bm.includes(i))return;const d=E('div','th'),c=E('canvas'),s=E('span','st');d.i=i;d.c=c;c.width=220;c.height=Math.round(220*el.dim[1]/el.dim[0]);
  s.textContent=bm.includes(i)?'⭐':'☆';s.onclick=e=>{e.stopPropagation();tgl(i);s.textContent=(S.d.bm||[]).includes(i)?'⭐':'☆'};
  const l=E('div');l.textContent='ص '+(i+1);d.append(c,s,l);d.onclick=()=>go2(i);b.append(d);io.observe(d)});
 if(!b.children.length){const p=E('p');p.textContent='مفيش علامات. اضغط ☆ فوق عشان تعلّم الصفحة.';b.append(p)}}
$('#pb').onclick=()=>{$('#pl').hidden=false;plR()};$('#plx').onclick=()=>$('#pl').hidden=true;
document.querySelectorAll('#plh [data-p]').forEach(x=>x.onclick=()=>{tab=x.dataset.p;plR()});
$('#bm').onclick=()=>tgl(S.cp||0);
// ---------- backup ----------
async function svF(blob,name){const f=new File([blob],name);if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f]}).catch(()=>{});else{const a=E('a');a.href=URL.createObjectURL(blob);a.download=name;a.click()}}
$('#bkx').onclick=async()=>{try{const ds=await tx('d','readonly',s=>s.getAll()),parts=[],hd=[];for(const d of ds){const f=d.k==='pdf'?await tx('f','readonly',s=>s.get(d.id)):null;hd.push({d,n:f?f.byteLength:0});if(f)parts.push(f)}
 const h=new TextEncoder().encode(JSON.stringify(hd));await svF(new Blob([new Uint32Array([h.length]),h,...parts]),'inkpad-backup-'+new Date().toISOString().slice(0,10)+'.inkbak')}catch(e){alert('فشل النسخ: '+e.message)}};
$('#bki').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const ab=await f.arrayBuffer(),len=new Uint32Array(ab.slice(0,4))[0],hd=JSON.parse(new TextDecoder().decode(ab.slice(4,4+len)));let o=4+len;
 for(const{d,n}of hd){await tx('d','readwrite',s=>s.put(d));if(n){await tx('f','readwrite',s=>s.put(ab.slice(o,o+n),d.id));o+=n}}alert('تم استرجاع '+hd.length+' ملف');home()}catch(x){alert('ملف النسخة غير صالح')}};

// ---------- snap, images, menu, tools ----------
function snap(o){const a=o.p[0],b=o.p[o.p.length-1],xs=o.p.map(q=>q[0]),ys=o.p.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 if(Math.hypot(a[0]-b[0],a[1]-b[1])<.25*Math.hypot(x1-x0,y1-y0)&&x1-x0>20&&y1-y0>20){o.t='ell';o.p=[[x0,y0],[x1,y1]]}else{o.t='line';o.p=[a,b]}}
const IM={};function im(s){let i=IM[s];if(!i){i=IM[s]=new Image();i.onload=()=>S.pg.forEach(e=>e.ink.width>1&&ink(e.i));i.src=s}return i}
$('#imf').onchange=async e=>{const f=e.target.files[0];e.target.value='';$('#mm').hidden=true;if(!f)return;const i=new Image();await new Promise(r=>{i.onload=r;i.src=URL.createObjectURL(f)});
 const m=Math.min(1,1000/Math.max(i.naturalWidth,i.naturalHeight)),c=E('canvas');c.width=i.naturalWidth*m;c.height=i.naturalHeight*m;c.getContext('2d').drawImage(i,0,0,c.width,c.height);
 const pi=S.cp||0,el=S.pg[pi],w=el.dim[0]*.5,y=Math.max(10,($('#sc').getBoundingClientRect().top-el.getBoundingClientRect().top)/S.z+60);
 add(pi,{t:'im',src:c.toDataURL('image/jpeg',.82),p:[[el.dim[0]*.25,y]],w,h:w*c.height/c.width});S.t='mv';sync()};
$('#mn').onclick=()=>$('#mm').hidden=!$('#mm').hidden;
$('#m-po').onclick=()=>{S.po=!S.po;$('#m-po').textContent='🖐 وضع القلم فقط: '+(S.po?'شغال':'إيقاف');$('#m-po').classList.toggle('on',S.po)};
$('#m-nt').onclick=()=>{S.d.nt=!S.d.nt;$('#ed').classList.toggle('nt',S.d.nt);save()};
let tmI=0;$('#m-tm').onclick=()=>{$('#mm').hidden=true;const t=$('#tmr');if(tmI){clearInterval(tmI);tmI=0;t.hidden=true;return}const end=Date.now()+25*60000;t.hidden=false;
 tmI=setInterval(()=>{const s=Math.max(0,Math.round((end-Date.now())/1000));t.textContent='⏱ '+String(s/60|0).padStart(2,'0')+':'+String(s%60).padStart(2,'0');if(!s){clearInterval(tmI);tmI=0;t.hidden=true;navigator.vibrate&&navigator.vibrate([300,100,300]);alert('خلصت 25 دقيقة. خد استراحة 5 دقايق')}},500)};
$('#tmr').onclick=()=>$('#m-tm').click();
$('#tr').onclick=()=>{const s=hs();s&&open('https://translate.google.com/?sl=auto&tl=ar&op=translate&text='+encodeURIComponent(s.toString()),'_blank')};
$('#ai').onclick=()=>{const s=hs();s&&open('https://claude.ai/new?q='+encodeURIComponent('اشرح لي بشكل مبسط:\n'+s.toString()),'_blank')};
$('#mgf').onchange=async e=>{const fs=[...e.target.files];e.target.value='';if(fs.length<2)return alert('اختار ملفين PDF على الأقل');
 try{const D=await PDFLib.PDFDocument.create();for(const f of fs){const s=await PDFLib.PDFDocument.load(await f.arrayBuffer());(await D.copyPages(s,s.getPageIndices())).forEach(p=>D.addPage(p))}
  const by=await D.save(),id='p'+Date.now();await tx('f','readwrite',s=>s.put(by.buffer.slice(by.byteOffset,by.byteOffset+by.byteLength),id));await dbPut({id,n:'مدمج '+new Date().toLocaleDateString('ar-EG'),k:'pdf',s:{},u:Date.now()});openDoc(id)}catch(x){alert('فشل الدمج (ممكن ملف محمي بباسورد)')}};
function lib(l,a){if(!$('#ls')){const i=E('input');i.id='ls';i.type='search';i.placeholder='🔍 ابحث في ملفاتك';i.oninput=home;l.before(i);const so=E('select');so.id='so';[['u','الأحدث'],['n','الاسم'],['sz','الحجم']].forEach(([v,t])=>{const o=E('option');o.value=v;o.textContent=t;so.append(o)});so.value=SO();so.onchange=()=>{try{localStorage.setItem('inkso',so.value)}catch(e){}home()};i.after(so);const t=E('div');t.id='tgs';l.before(t)}
 const t=$('#tgs');t.innerHTML='';[...new Set(a.map(d=>d.tag).filter(Boolean))].forEach(x=>{const b=E('button','chip'+(S.tg===x?' on':''));b.textContent='📁 '+x;b.onclick=()=>{S.tg=S.tg===x?'':x;home()};t.append(b)})}
