const $=s=>document.querySelector(s),E=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const DB=new Promise(r=>{const q=indexedDB.open('inkpad',1);q.onupgradeneeded=()=>{q.result.createObjectStore('d',{keyPath:'id'});q.result.createObjectStore('f')};q.onsuccess=()=>r(q.result)});
const tx=async(st,m,f)=>{const db=await DB;return new Promise((ok,no)=>{const t=db.transaction(st,m),r=f(t.objectStore(st));t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>no(t.error)})};
const dbPut=d=>tx('d','readwrite',s=>s.put(d));
const S={t:'pen',c:'#1e40af',w:3,z:1,fit:1,sh:'line',und:[],red:[],pg:[]},W=595,H=842;
// ---------- home ----------
async function home(){$('#ed').hidden=true;$('#home').hidden=false;const l=$('#list');l.innerHTML='';
 const a=(await tx('d','readonly',s=>s.getAll())).sort((x,y)=>y.u-x.u);
 if(!a.length)l.innerHTML='<p class="em">لسه مفيش ملفات. افتح PDF أو اعمل ملاحظة جديدة.</p>';
 a.forEach(d=>{const r=E('div','it','<div><b></b><small></small></div><button>🗑</button>');
  r.querySelector('b').textContent=d.n;r.querySelector('small').textContent=(d.k==='pdf'?'PDF':'ملاحظة')+' · '+new Date(d.u).toLocaleDateString('ar-EG');
  r.firstChild.onclick=()=>openDoc(d.id);
  r.querySelector('button').onclick=async()=>{if(confirm('حذف؟')){await tx('d','readwrite',s=>s.delete(d.id));await tx('f','readwrite',s=>s.delete(d.id));home()}};l.append(r)})}
$('#fp').onchange=async e=>{const f=e.target.files[0];if(!f)return;const id='p'+Date.now();
 const b=await f.arrayBuffer();await tx('f','readwrite',s=>s.put(b,id));
 await dbPut({id,n:f.name.replace(/\.pdf$/i,''),k:'pdf',s:{},u:Date.now()});e.target.value='';openDoc(id)};
$('#nn').onclick=async()=>{const id='n'+Date.now();await dbPut({id,n:'ملاحظة '+new Date().toLocaleDateString('ar-EG'),k:'note',np:1,tp:$('#tpl').value,s:{},u:Date.now()});openDoc(id)};
// ---------- editor ----------
async function openDoc(id){const d=await tx('d','readonly',s=>s.get(id));S.d=d;S.pdf=null;S.und=[];S.red=[];S.tc=[];S.sr=[];S.si=-1;S.lq='';clearHl();$('#sb').hidden=true;$('#cnt').textContent='';$('#si').value='';$('#ed').classList.remove('fs');
 $('#home').hidden=true;$('#ed').hidden=false;$('#ttl').textContent=d.n;$('#ap').hidden=d.k!=='note';$('#sq').hidden=d.k!=='pdf';
 let n=d.np;
 if(d.k==='pdf'){const data=await tx('f','readonly',s=>s.get(id));const lt=pdfjsLib.getDocument({data});lt.onPassword=cb=>cb(prompt('كلمة سر الملف:')||'');
  try{S.pdf=await lt.promise}catch(e){alert('تعذر فتح الملف');return home()}n=S.pdf.numPages}
 const p1=S.pdf?(await S.pdf.getPage(1)).getViewport({scale:1}):{width:W,height:H};
 S.fit=Math.min(2,($('#sc').clientWidth-8)/p1.width);S.z=Math.max(S.fit*.5,Math.min(S.fit*3,S.fit*(d.zr||1)));
 const g=$('#pgs');g.innerHTML='';S.pg=[];S.io&&S.io.disconnect();
 S.io=new IntersectionObserver(es=>es.forEach(e=>{const el=e.target;if(e.isIntersecting)rp(el.i);else{el.bg.width=el.ink.width=1;el.r=null;el.tl&&(el.tl.remove(),el.tl=null)}}),{root:$('#sc'),rootMargin:'600px 0px'});
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
 const d=Math.min(devicePixelRatio||1,2),w=el.dim[0]*S.z,h=el.dim[1]*S.z,oc=E('canvas');oc.width=w*d;oc.height=h*d;
 await bgDraw(i,oc.getContext('2d'),S.z*d);if(t!==el.tk)return;
 el.style.width=w+'px';el.style.height=h+'px';
 for(const c of[el.bg,el.ink]){c.width=w*d;c.height=h*d;c.style.width=w+'px';c.style.height=h+'px'}
 el.bg.getContext('2d').drawImage(oc,0,0);ink(i);buildTl(i)}
function ds(c,o,k){c.save();c.lineCap=c.lineJoin='round';c.strokeStyle=c.fillStyle=o.c;c.lineWidth=o.w*k*(o.t==='hl'?4:1);if(o.t==='hl')c.globalAlpha=.35;
 if(o.t==='hr'){c.globalAlpha=.4;c.fillStyle=o.c;o.rs.forEach(r=>c.fillRect(r[0]*k,r[1]*k,r[2]*k,r[3]*k));c.restore();return}
 const p=o.p,X=i=>p[i][0]*k,Y=i=>p[i][1]*k;c.beginPath();
 if(o.t==='pen'||o.t==='hl'){c.moveTo(X(0),Y(0));for(let i=1;i<p.length-1;i++)c.quadraticCurveTo(X(i),Y(i),(X(i)+X(i+1))/2,(Y(i)+Y(i+1))/2);c.lineTo(X(p.length-1),Y(p.length-1));c.stroke()}
 else if(o.t==='line'){c.moveTo(X(0),Y(0));c.lineTo(X(1),Y(1));c.stroke()}
 else if(o.t==='rect')c.strokeRect(X(0),Y(0),X(1)-X(0),Y(1)-Y(0));
 else if(o.t==='ell'){c.ellipse((X(0)+X(1))/2,(Y(0)+Y(1))/2,Math.abs(X(1)-X(0))/2||1,Math.abs(Y(1)-Y(0))/2||1,0,0,7);c.stroke()}
 else{c.font=o.w*k+'px sans-serif';c.textBaseline='top';o.s.split('\n').forEach((t,j)=>c.fillText(t,X(0),Y(0)+j*o.w*k*1.25))}
 c.restore()}
function ink(i){const el=S.pg[i],c=el.ink.getContext('2d'),k=el.ink.width/el.dim[0];c.clearRect(0,0,el.ink.width,el.ink.height);
 (S.d.s[i]||[]).forEach(o=>ds(c,o,k));if(el.cur)ds(c,el.cur,k)}
// ---------- drawing ----------
const pt=(e,el)=>{const r=el.getBoundingClientRect();return[(e.clientX-r.left)/S.z,(e.clientY-r.top)/S.z]};
function sp(o){if(o.t==='hr')return o.rs.flatMap(r=>[0,1,2,3,4].map(k=>[r[0]+r[2]*k/4,r[1]+r[3]/2]));const p=o.p;if(o.t==='pen'||o.t==='hl'||o.t==='tx')return p;const[a,b]=p,r=[],L=(u,v)=>{for(let k=0;k<=10;k++)r.push([u[0]+(v[0]-u[0])*k/10,u[1]+(v[1]-u[1])*k/10])};
 if(o.t==='line')L(a,b);else if(o.t==='rect'){L(a,[b[0],a[1]]);L([b[0],a[1]],b);L(b,[a[0],b[1]]);L([a[0],b[1]],a)}
 else{const cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,rx=Math.abs(b[0]-a[0])/2,ry=Math.abs(b[1]-a[1])/2;for(let k=0;k<32;k++){const t=k/32*6.283;r.push([cx+rx*Math.cos(t),cy+ry*Math.sin(t)])}}return r}
function era(el,p){const l=S.d.s[el.i]||[],r=8+S.w*2;for(let j=l.length-1;j>=0;j--)if(sp(l[j]).some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<r))el.er.push(...l.splice(j,1));ink(el.i)}
function bind(el){const c=el.ink;
 c.onpointerdown=e=>{if(S.t==='hand'||!e.isPrimary)return;e.preventDefault();const p=pt(e,el),i=el.i;
  if(S.t==='tx'){const s=prompt('اكتب النص:');if(s)add(i,{t:'tx',c:S.c,w:S.w*4+8,p:[p],s});return}
  if(S.t==='er'){el.er=[];era(el,p)}
  else el.cur={t:S.t==='sh'?S.sh:S.t,c:S.c,w:S.w,p:S.t==='sh'?[p,p]:[p]};
  c.setPointerCapture(e.pointerId);el.dn=1};
 c.onpointermove=e=>{if(!el.dn)return;const p=pt(e,el);
  if(S.t==='er')era(el,p);else if(S.t==='sh')el.cur.p[1]=p;else el.cur.p.push(p);
  cancelAnimationFrame(el.f);el.f=requestAnimationFrame(()=>ink(el.i))};
 c.onpointerup=c.onpointercancel=()=>{if(!el.dn)return;el.dn=0;
  if(S.t==='er'){if(el.er.length)push({a:'del',i:el.i,o:el.er});el.er=null}
  else if(el.cur){const o=el.cur;el.cur=null;add(el.i,o)}}}
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
function up(){const sc=$('#sc'),m=sc.getBoundingClientRect().top+sc.clientHeight/3;let c=0;S.pg.forEach((el,i)=>{if(el.getBoundingClientRect().top<=m)c=i});$('#pn').textContent=(c+1)+'/'+S.pg.length;if(!S.rs&&S.d&&S.pg[c]){const x=S.pg[c].getBoundingClientRect(),y=sc.getBoundingClientRect();S.d.pi=c;S.d.po=(y.top-x.top)/x.height;save()}}
$('#sc').onscroll=up;
$('#pn').onclick=()=>{const n=+prompt('رقم الصفحة:');if(n>0&&n<=S.pg.length)S.pg[n-1].scrollIntoView()};
$('#ttl').onclick=()=>{const n=prompt('الاسم:',S.d.n);if(n){S.d.n=n;$('#ttl').textContent=n;save()}};
$('#ap').onclick=()=>{const i=S.pg.length;S.d.np++;addPg(i,[W,H]);rp(i).then(()=>S.pg[i].scrollIntoView());save()};
$('#bk').onclick=async()=>{$('#ed').classList.remove('fs');document.fullscreenElement&&document.exitFullscreen();clearHl();await flush();S.pdf&&S.pdf.destroy();S.d=null;home()};
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
let tp=null;const fsT=()=>{const on=$('#ed').classList.toggle('fs'),d=document;try{if(on&&!d.fullscreenElement)d.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{});else if(!on&&d.fullscreenElement)d.exitFullscreen()}catch(e){}};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)$('#ed').classList.remove('fs')});
$('#sc').addEventListener('pointerdown',e=>{tp=e.isPrimary&&S.t==='hand'?{x:e.clientX,y:e.clientY,t:Date.now()}:null});
$('#sc').addEventListener('pointerup',e=>{if(!tp)return;const d=Math.hypot(e.clientX-tp.x,e.clientY-tp.y),ms=Date.now()-tp.t;tp=null;if(d<10&&ms<400&&!S.pd&&!getSelection().toString())fsT()});
$('#sc').addEventListener('pointercancel',()=>tp=null);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
home();

// ---------- text layer (select / copy / highlight) ----------
async function buildTl(i){const el=S.pg[i];if(!S.pdf||!el||el.tl)return;const T=await ptxt(i);if(el.tl||!el.r)return;
 const d=E('div','tl'),sp=[];d.style.cssText='width:'+T.w+'px;height:'+T.h+'px;transform:scale('+S.z+')';
 T.it.forEach(t=>{if(!t.str.trim())return;const s=E('span');s.textContent=t.str;s.style.cssText='left:'+t.x+'px;top:'+(t.y-t.h*.82)+'px;font-size:'+t.h+'px;transform-origin:0 82%';s.t=t;sp.push(s);d.append(s)});
 el.insertBefore(d,el.ink);el.tl=d;
 const ws=sp.map(s=>s.offsetWidth);sp.forEach((s,k)=>{const t=s.t,x=ws[k]?t.w/ws[k]:1;s.style.transform='rotate('+Math.atan2(t.dy,t.dx)+'rad) scaleX('+(isFinite(x)&&x>0?x:1)+')'})}
const hs=()=>{const s=getSelection();return S.t==='hand'&&s&&!s.isCollapsed&&$('#pgs').contains(s.anchorNode)?s:null};
document.addEventListener('selectionchange',()=>{$('#sa').hidden=!hs()});
$('#sa').addEventListener('pointerdown',e=>e.preventDefault());
$('#cp').onclick=()=>{const s=hs();if(s)navigator.clipboard.writeText(s.toString()).then(()=>{$('#cp').textContent='✓';setTimeout(()=>$('#cp').textContent='📋 نسخ',900)})};
document.querySelectorAll('#sa [data-h]').forEach(b=>b.onclick=()=>{const s=hs();if(!s)return;const by={};
 for(const r of s.getRangeAt(0).getClientRects()){if(r.width<2||r.height>60)continue;const cx=r.left+r.width/2,cy=r.top+r.height/2;
  const i=S.pg.findIndex(el=>{const q=el.getBoundingClientRect();return cx>=q.left&&cx<=q.right&&cy>=q.top&&cy<=q.bottom});if(i<0)continue;
  const q=S.pg[i].getBoundingClientRect(),u=[(r.left-q.left)/S.z,(r.top-q.top)/S.z,r.width/S.z,r.height/S.z];
  if(!(by[i]=by[i]||[]).some(v=>Math.abs(v[0]-u[0])<1&&Math.abs(v[1]-u[1])<1&&Math.abs(v[2]-u[2])<2))by[i].push(u)}
 for(const i in by)add(+i,{t:'hr',c:b.dataset.h,rs:by[i]});s.removeAllRanges()});
// ---------- toolbar position ----------
const lg=()=>{try{return localStorage.getItem('inkpos')}catch(e){}};
function pos(){const L=lg()==='L';$('#ed').classList.toggle('L',L);$('#tp').textContent=L?'⬇':'⬅'}
$('#tp').onclick=()=>{try{localStorage.setItem('inkpos',lg()==='L'?'B':'L')}catch(e){}pos()};pos();
