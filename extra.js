// InkPad extras: lasso, ruler/grid, flashcards, audio, OCR, AI, page tools, share-target
const SN=p=>S.gs&&(S.t==='sh'||S.rl&&S.t==='pen')?[Math.round(p[0]/14)*14,Math.round(p[1]/14)*14,p[2]]:p;
const pip=(q,P)=>{let r=0;for(let i=0,j=P.length-1;i<P.length;j=i++)if((P[i][1]>q[1])!=(P[j][1]>q[1])&&q[0]<(P[j][0]-P[i][0])*(q[1]-P[i][1])/(P[j][1]-P[i][1])+P[i][0])r=!r;return r};
const bx=l=>{const q=l.flatMap(sp),xs=q.map(v=>v[0]),ys=q.map(v=>v[1]);return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]};
const sc2=(o,k,x,y)=>{if(o.rs)o.rs=o.rs.map(r=>[x+(r[0]-x)*k,y+(r[1]-y)*k,r[2]*k,r[3]*k]);else{o.p=o.p.map(q=>[x+(q[0]-x)*k,y+(q[1]-y)*k,...q.slice(2)]);if(o.t==='im'){o.w*=k;o.h*=k}else if(o.t==='tx')o.w*=k}};
// ---- lasso ----
const LS={sel:[],el:null,P:null,md:'',
 x(){const e=this.el;this.sel=[];this.P=null;this.el=null;$('#lsb').hidden=true;e&&ink(e.i)},
 d(el,p){if(this.sel.length&&this.el===el){const b=bx(this.sel),g=16;if(p[0]>b[0]-g&&p[0]<b[2]+g&&p[1]>b[1]-g&&p[1]<b[3]+g){this.md='m';this.p0=p;this.sv=this.sel.map(o=>JSON.stringify(o));return}}
  this.x();this.el=el;this.md='d';this.P=[p]},
 m(el,p){if(this.md==='m'){const dx=p[0]-this.p0[0],dy=p[1]-this.p0[1];this.sel.forEach((o,j)=>{const s=JSON.parse(this.sv[j]);if(o.rs)o.rs=s.rs.map(r=>[r[0]+dx,r[1]+dy,r[2],r[3]]);else o.p=s.p.map(q=>q.map((v,n)=>n==0?v+dx:n==1?v+dy:v))})}else this.P.push(p);
  cancelAnimationFrame(el.f);el.f=requestAnimationFrame(()=>ink(el.i))},
 u(el){if(this.md==='m'){save();this.bar();ink(el.i);return}const P=this.P;this.P=null;const l=S.d.s[el.i]||[];this.sel=P.length>3?l.filter(o=>{const q=sp(o);return q.filter(v=>pip(v,P)).length>q.length*.5}):[];this.bar();ink(el.i)},
 bar(){const b=$('#lsb');b.hidden=!this.sel.length;if(!b.hidden){const r=this.el.getBoundingClientRect();b.style.top=Math.max(60,r.top+bx(this.sel)[1]*S.z-50)+'px'}},
 r(c,el,k){if(el!==this.el)return;c.save();c.strokeStyle='#38bdf8';c.lineWidth=2;c.setLineDash([6,4]);if(this.P){c.beginPath();this.P.forEach((q,j)=>j?c.lineTo(q[0]*k,q[1]*k):c.moveTo(q[0]*k,q[1]*k));c.stroke()}
  if(this.sel.length){const b=bx(this.sel);c.strokeRect((b[0]-6)*k,(b[1]-6)*k,(b[2]-b[0]+12)*k,(b[3]-b[1]+12)*k)}c.restore()}};
$('#l-d').onclick=()=>{const l=S.d.s[LS.el.i]||[],o=LS.sel.filter(x=>l.includes(x));o.forEach(x=>l.splice(l.indexOf(x),1));push({a:'del',i:LS.el.i,o});LS.x()};
const sz=k=>{const g=bx(LS.sel);LS.sel.forEach(o=>sc2(o,k,(g[0]+g[2])/2,(g[1]+g[3])/2));ink(LS.el.i);save();LS.bar()};
$('#l-m').onclick=()=>sz(.85);$('#l-p').onclick=()=>sz(1.18);$('#l-x').onclick=()=>LS.x();
const _sy=sync;sync=()=>{_sy();S.t!=='ls'&&LS.sel.length&&LS.x()};
// ---- toggles ----
const tg=(id,k,t)=>$(id).onclick=()=>{S[k]=!S[k];$(id).textContent=t+': '+(S[k]?'شغال':'إيقاف');$(id).classList.toggle('on',S[k])};
tg('#m-rl','rl','📏 مسطرة (خط مستقيم)');tg('#m-gs','gs','🔲 محاذاة للشبكة');
// ---- AI ----
const KEY=()=>{try{return localStorage.getItem('inkkey')||''}catch(e){return''}};
const showAI=t=>{$('#aib').textContent=t;$('#air').hidden=false};
$('#aix').onclick=()=>$('#air').hidden=true;$('#aic').onclick=()=>navigator.clipboard.writeText($('#aib').textContent);
async function ai(p){let k=KEY();if(!k){k=(prompt('الصق مفتاح Anthropic API (بيتخزن على جهازك بس):')||'').trim();if(!k)return null;try{localStorage.setItem('inkkey',k)}catch(e){}}
 const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-haiku-5-5',max_tokens:1500,system:'أنت مساعد مذاكرة لطالب علاج طبيعي. أجب بالعربية المصرية المبسطة وخلّي المصطلحات الطبية بالإنجليزية. كن مختصرًا.',messages:[{role:'user',content:p}]})});
 const j=await r.json();if(!r.ok)throw Error(j.error&&j.error.message||r.status);return j.content.map(c=>c.text||'').join('')}
$('#ai').onclick=async()=>{const s=hs();if(!s)return;const t=s.toString();if(!KEY())return open('https://claude.ai/new?q='+encodeURIComponent('اشرح لي بشكل مبسط:\n'+t),'_blank');
 showAI('⏳ …');try{showAI(await ai('اشرح بشكل مبسط:\n'+t))}catch(e){showAI('خطأ: '+e.message)}};
$('#m-sm').onclick=async()=>{$('#mm').hidden=true;if(!S.pdf)return alert('التلخيص للـPDF بس');const T=await ptxt(S.cp||0),t=T.it.map(x=>x.str).join(' ').trim();if(!t)return alert('الصفحة مفيهاش نص. جرّب OCR الأول');
 showAI('⏳ …');try{const r=await ai('لخّص النص ده في نقاط قصيرة:\n'+t.slice(0,12000));r?showAI(r):$('#air').hidden=true}catch(e){showAI('خطأ: '+e.message)}};
$('#m-ky').onclick=()=>{const k=prompt('مفتاح Anthropic API (فاضي = مسح):',KEY());if(k===null)return;try{localStorage.setItem('inkkey',k.trim())}catch(e){}};
// ---- flashcards ----
const cz=t=>{const w=t.split(/\s+/).filter(x=>x.length>3).sort((a,b)=>b.length-a.length)[0];return w?t.replace(w,'＿＿＿＿'):t};
const hls=()=>{const L=[];S.pg.forEach((_,i)=>(S.d.s[i]||[]).forEach(o=>o.t==='hr'&&o.tx&&o.tx.trim().length>8&&L.push([i,o.tx.trim()])));return L};
async function aiCards(){const H=hls();if(!H.length)return alert('ظلّل نص بالهايلايت الأول');showAI('⏳ بعمل الكروت…');
 try{const t=await ai('حوّل الجمل دي لكروت مراجعة (سؤال وإجابة قصيرة). رجّع JSON array فقط بالشكل [{"q":"","a":""}] بدون أي كلام تاني:\n'+H.map(x=>x[1]).join('\n').slice(0,8000));if(!t)return $('#air').hidden=true;
  (S.d.ai=S.d.ai||[]).push(...JSON.parse(t.match(/\[[\s\S]*\]/)[0]).filter(x=>x.q&&x.a));save();$('#air').hidden=true;plR()}catch(e){showAI('خطأ: '+e.message)}}
$('#m-fc').onclick=()=>{$('#mm').hidden=true;tab='fc';$('#pl').hidden=false;plR()};
let cur=null;
const _pl=plR;plR=function(){if(tab!=='fc'&&tab!=='au')return _pl();const b=$('#plb');b.innerHTML='';b.classList.add('l');document.querySelectorAll('#plh [data-p]').forEach(x=>x.classList.toggle('on',x.dataset.p===tab));
 if(tab==='fc'){const C=[...(S.d.ai||[]),...hls().map(([i,t])=>({q:cz(t),a:t}))],g=E('button');g.textContent='✨ كروت بالـAI من الهايلايت';g.onclick=aiCards;b.append(g);
  if(!C.length){const p=E('p');p.textContent='ظلّل نص بالهايلايت وهيتحوّل لكروت هنا. اضغط على الكارت لإظهار الإجابة.';b.append(p)}
  C.forEach(c=>{const d=E('div','hi');let f=0;d.textContent='❓ '+c.q;d.onclick=()=>{f=!f;d.textContent=f?'✅ '+c.a:'❓ '+c.q};b.append(d)});return}
 if(!(S.d.au||[]).length){const p=E('p');p.textContent='مفيش تسجيلات. ابدأ من ⋯ ← 🎙 تسجيل صوت.';b.append(p)}
 (S.d.au||[]).forEach((r,j)=>{const d=E('div','hi','<b></b> <button>▶</button> <button>🗑</button>');d.querySelector('b').textContent='ص '+(r.pg+1)+' · '+new Date(r.t).toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});const[p,x]=d.querySelectorAll('button');
  p.onclick=async()=>{const f=await tx('f','readonly',s=>s.get(r.k));cur&&cur.pause();cur=new Audio(URL.createObjectURL(new Blob([f],{type:r.m})));cur.play()};
  x.onclick=async()=>{if(!confirm('حذف التسجيل؟'))return;await tx('f','readwrite',s=>s.delete(r.k));S.d.au.splice(j,1);save();plR()};b.append(d)})};
// ---- audio recording ----
let MR=null,CH=[];$('#m-rc').onclick=async()=>{const b=$('#m-rc');if(MR){MR.stop();return}
 try{const st=await navigator.mediaDevices.getUserMedia({audio:true}),pg=S.cp||0;MR=new MediaRecorder(st);CH=[];MR.ondataavailable=e=>CH.push(e.data);
  MR.onstop=async()=>{st.getTracks().forEach(t=>t.stop());const m=MR.mimeType||'audio/webm',ab=await new Blob(CH,{type:m}).arrayBuffer(),k='a'+Date.now();MR=null;b.textContent='🎙 تسجيل صوت';$('#mn').style.color='';
   await tx('f','readwrite',s=>s.put(ab,k));(S.d.au=S.d.au||[]).push({k,pg,t:Date.now(),m});save()};
  MR.start();b.textContent='⏹ إيقاف التسجيل';$('#mn').style.color='#ef4444'}catch(e){alert('مفيش إذن للميكروفون')}};
// ---- OCR ----
const _pt=ptxt;ptxt=async function(i){const o=S.d.oc&&S.d.oc[i];if(!o)return _pt(i);if(S.tc[i])return S.tc[i];const v=(await S.pdf.getPage(i+1)).getViewport({scale:1}),T={s:'',mi:[],mo:[],it:[],w:v.width,h:v.height};
 o.forEach(([str,x,y,w,h])=>{const j=T.it.length;T.it.push({str,x,y:y+h*.82,dx:1,dy:0,ux:0,uy:-1,w,h,n:str.length,ar:/[\u0590-\u08FF\uFB1D-\uFEFF]/.test(str)});let k=0;for(const c0 of str){for(const c of NM(c0)){T.s+=c;T.mi.push(j);T.mo.push(k)}k++}T.s+=' ';T.mi.push(-1);T.mo.push(0)});return S.tc[i]=T};
$('#m-ocr').onclick=async()=>{if(!S.pdf)return alert('OCR للـPDF بس');const b=$('#m-ocr'),i=S.cp||0,el=S.pg[i];b.disabled=true;
 try{if(!window.Tesseract)await new Promise((r,x)=>{const s=E('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js';s.onload=r;s.onerror=()=>x(Error('محتاج إنترنت'));document.head.append(s)});
  const k=2,c=E('canvas');c.width=el.dim[0]*k;c.height=el.dim[1]*k;await bgDraw(i,c.getContext('2d'),k);
  const r=await Tesseract.recognize(c,'ara+eng',{logger:m=>b.textContent='🔎 '+Math.round((m.progress||0)*100)+'%'});
  (S.d.oc=S.d.oc||{})[i]=r.data.words.filter(w=>w.text.trim()).map(w=>[w.text,w.bbox.x0/k,w.bbox.y0/k,(w.bbox.x1-w.bbox.x0)/k,(w.bbox.y1-w.bbox.y0)/k]);
  S.tc[i]=null;el.tl&&(el.tl.remove(),el.tl=null);buildTl(i);save();alert('تم. جرّب البحث أو تحديد النص في الصفحة دي')}catch(e){alert('فشل OCR: '+e.message)}b.disabled=false;b.textContent='🔎 OCR للصفحة'};
// ---- page tools (insert / delete / move) ----
async function PM(a){const d=S.d,n=S.pg.length,c=S.cp||0;let o=[...Array(n).keys()],np=c;
 if(a==='i'){o.splice(c+1,0,null);np=c+1}else if(a==='d'){if(n<2)return alert('لازم تفضل صفحة واحدة');if(!confirm('حذف صفحة '+(c+1)+'؟'))return;o.splice(c,1);np=Math.min(c,o.length-1)}
 else{const j=c+(a==='u'?-1:1);if(j<0||j>=n)return;[o[c],o[j]]=[o[j],o[c]];np=j}
 $('#mm').hidden=true;await flush();
 try{if(d.k==='pdf'){const D=await PDFLib.PDFDocument.load(await tx('f','readonly',s=>s.get(d.id))),N=await PDFLib.PDFDocument.create();
   for(const k of o){if(k==null){const z=D.getPage(c).getSize();N.addPage([z.width,z.height])}else N.addPage((await N.copyPages(D,[k]))[0])}
   const by=await N.save();await tx('f','readwrite',s=>s.put(by.buffer.slice(by.byteOffset,by.byteOffset+by.byteLength),d.id))}
  const rm=m=>{const r={};o.forEach((k,j)=>{if(k!=null&&m[k])r[j]=m[k]});return r};d.s=rm(d.s);d.oc=rm(d.oc||{});
  d.bm=(d.bm||[]).map(b=>o.indexOf(b)).filter(x=>x>=0);d.au=(d.au||[]).map(r=>({...r,pg:Math.max(0,o.indexOf(r.pg))}));
  if(d.k==='note')d.np=o.length;d.pi=np;d.po=0;await dbPut(d);openDoc(d.id)}catch(e){alert('فشل: '+e.message+' (ممكن الملف محمي)')}}
$('#m-pi').onclick=()=>PM('i');$('#m-pd').onclick=()=>PM('d');$('#m-pu').onclick=()=>PM('u');$('#m-pn').onclick=()=>PM('n');
// ---- open from other apps (share / open-with) ----
async function imp(f){const id='p'+Date.now()+Math.random().toString(36).slice(2,5),b=await f.arrayBuffer();await tx('f','readwrite',s=>s.put(b,id));await dbPut({id,n:f.name.replace(/\.pdf$/i,''),k:'pdf',s:{},u:Date.now()});return id}
(async()=>{if(!/shared=1/.test(location.search)||!window.caches)return;const c=await caches.open('inkshare');let id;for(const r of await c.keys()){const rs=await c.match(r);id=await imp(new File([await rs.blob()],decodeURIComponent(rs.headers.get('x-name')||'file.pdf')));await c.delete(r)}history.replaceState(null,'',location.pathname);id&&openDoc(id)})();
if('launchQueue'in window)launchQueue.setConsumer(async l=>{let id;for(const h of l.files||[])id=await imp(await h.getFile());id&&openDoc(id)});

// ================= v7: focus mode / study time / review list / hide answers =================
(()=>{
const ED=$('#ed'),op=id=>$(id);
// ---- focus mode (hide all bars; floating ✕ to exit) ----
$('#m-fo').onclick=()=>{$('#mm').hidden=true;ED.classList.add('fs','fo')};
$('#fxb').onclick=()=>ED.classList.remove('fs','fo');
new MutationObserver(()=>{if(!ED.classList.contains('fs')&&ED.classList.contains('fo'))ED.classList.remove('fo')}).observe(ED,{attributes:true,attributeFilter:['class']});
// ---- study time ----
const KS='inkstudy',ld=()=>{try{return JSON.parse(localStorage.getItem(KS)||'{}')}catch(e){return{}}},
 dk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),
 ft=s=>{const M=Math.round(s/60);if(!M)return s>0?'أقل من دقيقة':'0 د';const h=M/60|0,m=M%60;return h?h+' س'+(m?' '+m+' د':''):m+' د'};
let la=Date.now(),lt=Date.now();
['pointerdown','pointermove','scroll','keydown','touchstart'].forEach(v=>addEventListener(v,()=>la=Date.now(),{passive:true,capture:true}));
setInterval(()=>{const n=Date.now(),dt=Math.min(n-lt,10000)/1000;lt=n;if(document.hidden||ED.hidden||n-la>300000)return;
 const s=ld(),k=dk(new Date());s[k]=(s[k]||0)+dt;const ks=Object.keys(s).sort();ks.slice(0,Math.max(0,ks.length-400)).forEach(x=>delete s[x]);try{localStorage.setItem(KS,JSON.stringify(s))}catch(e){}},5000);
function stR(){const s=ld(),n=new Date(),b=$('#stb');let wk=0,mx=1,m30=0;const rows=[];
 for(let i=0;i<30;i++){const d=new Date(n.getFullYear(),n.getMonth(),n.getDate()-i),v=s[dk(d)]||0;m30+=v;if(i<7){rows.push([d,v,i]);wk+=v;mx=Math.max(mx,v)}}
 b.innerHTML='';const T=E('div','stt'),l=E('div','em');T.textContent=ft(s[dk(n)]||0);l.textContent='النهاردة';b.append(T,l);
 rows.forEach(([d,v,i])=>{const r=E('div','sbr',"<span></span><div><i></i></div><span></span>"),sp=r.querySelectorAll('span');sp[0].textContent=i?d.toLocaleDateString('ar-EG',{weekday:'long'}):'النهاردة';sp[1].textContent=ft(v);r.querySelector('i').style.width=v>0?Math.max(2,Math.round(v/mx*100))+'%':'0';b.append(r)});
 [['آخر 7 أيام',ft(wk)],['متوسط اليوم (7 أيام)',ft(wk/7)],['آخر 30 يوم',ft(m30)]].forEach(([a,c])=>{const r=E('div','stx'),x=E('span'),y=E('b');x.textContent=a;y.textContent=c;r.append(x,y);b.append(r)})}
const stO=()=>{$('#mm').hidden=true;stR();$('#stp').hidden=false};
$('#h-st').onclick=$('#m-st').onclick=stO;$('#stx').onclick=()=>$('#stp').hidden=true;
// ---- review list (all starred ⭐ pages from all files) ----
async function rvR(){const b=$('#rvb');b.innerHTML='';
 const a=(await tx('d','readonly',s=>s.getAll())).filter(d=>(d.bm||[]).length).sort((x,y)=>y.u-x.u);
 if(!a.length){b.append(E('p','em','مفيش صفحات متعلّم عليها. جوه أي ملف اضغط ☆ فوق عشان تضيف الصفحة للمراجعة.'));return}
 a.forEach(d=>{const g=E('div','rg'),h=E('b');h.textContent=d.n+' ('+d.bm.length+')';g.append(h);
  [...d.bm].sort((x,y)=>x-y).forEach(p=>{const r=E('div','rr'),t=E('span'),x=E('button');t.textContent='📄 صفحة '+(p+1);x.textContent='✓ تمت';
   t.onclick=()=>rvGo(d.id,p);x.onclick=async()=>{await rvDone(d.id,p);rvR()};r.append(t,x);g.append(r)});b.append(g)})}
async function rvDone(id,p){if(S.d&&S.d.id===id&&!ED.hidden){const b=S.d.bm=S.d.bm||[],x=b.indexOf(p);if(x>=0)b.splice(x,1);updBm();await flush();return}
 const d=await tx('d','readonly',s=>s.get(id));if(!d)return;d.bm=(d.bm||[]).filter(x=>x!==p);await dbPut(d)}
async function rvGo(id,p){$('#rv').hidden=true;if(!ED.hidden)await flush();if(!(S.d&&!ED.hidden&&S.d.id===id))await openDoc(id);
 const el=S.pg[p];if(S.d&&!ED.hidden&&S.d.id===id&&el)el.scrollIntoView()}
const rvO=async()=>{$('#mm').hidden=true;if(!ED.hidden)await flush();$('#rv').hidden=false;rvR()};
$('#h-rv').onclick=$('#m-rv').onclick=rvO;$('#rvx').onclick=()=>$('#rv').hidden=true;
// ---- hide answers (cover rectangles; tap with ✋ to reveal) ----
const RV=new WeakSet();let RA=0;const rev=o=>RA?!RV.has(o):RV.has(o);
const _ds=ds;ds=(c,o,k)=>{if(o.t!=='cv')return _ds(c,o,k);
 const a=o.p[0],b=o.p[1]||a,x=Math.min(a[0],b[0])*k,y=Math.min(a[1],b[1])*k,w=Math.abs(b[0]-a[0])*k,h=Math.abs(b[1]-a[1])*k;if(w<2||h<2)return;
 c.save();if(S.pg.some(e=>e.cur===o)){c.globalAlpha=.45;c.fillStyle=o.c;c.fillRect(x,y,w,h)}
 else if(rev(o)){c.strokeStyle=o.c;c.lineWidth=Math.max(1.5,2*k);c.setLineDash([6*k,4*k]);c.strokeRect(x,y,w,h)}
 else{c.fillStyle=o.c;c.fillRect(x,y,w,h);if(h>16*k&&w>16*k){c.fillStyle='#fff';c.font='bold '+Math.min(h*.6,28*k)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('؟',x+w/2,y+h/2)}}
 c.restore()};
const _sp=sp;sp=o=>{if(o.t!=='cv')return _sp(o);const a=o.p[0],b=o.p[1]||a,r=[];for(let u=0;u<=4;u++)for(let v=0;v<=4;v++)r.push([a[0]+(b[0]-a[0])*u/4,a[1]+(b[1]-a[1])*v/4]);return r};
const hit=(x,y)=>{for(let i=0;i<S.pg.length;i++){const r=S.pg[i].getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)continue;
 const px=(x-r.left)/S.z,py=(y-r.top)/S.z,l=S.d.s[i]||[];
 for(let j=l.length-1;j>=0;j--){const o=l[j];if(o.t!=='cv')continue;const a=o.p[0],b=o.p[1]||a;if(px>=Math.min(a[0],b[0])&&px<=Math.max(a[0],b[0])&&py>=Math.min(a[1],b[1])&&py<=Math.max(a[1],b[1]))return{i,o}}return null}return null};
let t0=null;const SC=$('#sc');
SC.addEventListener('pointerdown',e=>{t0=e.isPrimary&&S.t==='hand'?{x:e.clientX,y:e.clientY,t:Date.now()}:null},true);
SC.addEventListener('pointerup',e=>{const q=t0;t0=null;if(!q||!S.d||S.pd||getSelection().toString())return;if(Math.hypot(e.clientX-q.x,e.clientY-q.y)>=10||Date.now()-q.t>=400)return;
 const h=hit(e.clientX,e.clientY);if(!h)return;e.stopImmediatePropagation();RV.has(h.o)?RV.delete(h.o):RV.add(h.o);ink(h.i)},true);
$('#m-cv').onclick=()=>{$('#mm').hidden=true;S.sh='cv';$('#shs').value='cv';S.t='sh';sync()};
const rl=()=>{const b=$('#m-ra');b.textContent='👁 إظهار كل الإجابات: '+(RA?'شغال':'إيقاف');b.classList.toggle('on',!!RA)};
$('#m-ra').onclick=()=>{RA=RA?0:1;rl();S.pg.forEach(e=>e.ink.width>1&&ink(e.i))};
const _od=openDoc;openDoc=id=>{RA=0;rl();return _od(id)};
})();

// ================= v8: organized toolbar (popovers) =================
(()=>{
const ED=$('#ed'),TB=$('#tb'),PM=$('#pm'),PC=$('#pc2'),MB=$('#tmb'),CB=$('#tcb'),MI={lz:'✨',tx:'T',mv:'✥',ls:'⛶',sh:'▭'};
const shut=()=>{PM.hidden=PC.hidden=true;MB.classList.remove('open');CB.classList.remove('open')};
const place=p=>{const r=TB.getBoundingClientRect();p.style.cssText='';
 if(ED.classList.contains('L')){p.style.left=r.right+6+'px';p.style.top=Math.max(8,r.top)+'px';p.style.maxHeight=innerHeight-Math.max(8,r.top)-8+'px'}
 else{p.style.bottom=innerHeight-r.top+6+'px';p.style.left='8px';p.style.right='8px'}};
const tog=(p,b)=>{const o=p.hidden;shut();if(o){p.hidden=false;b.classList.add('open');place(p)}};
MB.onclick=()=>tog(PM,MB);CB.onclick=()=>tog(PC,CB);
addEventListener('pointerdown',e=>{if(!e.target.closest('.pop,#tmb,#tcb'))shut()},true);
PM.querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',shut));$('#shs').addEventListener('change',shut);
$('#tp').addEventListener('click',()=>setTimeout(()=>place(PM),0));
const upd=()=>{const i=MI[S.t];MB.textContent=i||'🧰';MB.classList.toggle('on',!!i);$('#dot').style.background=S.c;$('#pv').style.background=S.c;$('#pv').style.height=Math.max(2,S.w*1.5)+'px'};
const _sy2=sync;sync=()=>{_sy2();upd()};const _pc=pc;pc=()=>{_pc();upd()};
$('#wd').addEventListener('input',upd);$('#co').addEventListener('input',upd);upd();
})();

// ---- loading indicator + back button (history based, works on web and in the Android app) ----
(()=>{
const st=document.createElement('style');
st.textContent='#inkbusy{position:fixed;inset:0;z-index:90;background:rgba(15,23,42,.72);display:flex;align-items:center;justify-content:center;gap:12px;color:#e2e8f0;font:600 16px system-ui;direction:rtl}#inkbusy i{width:22px;height:22px;border:3px solid #475569;border-top-color:#60a5fa;border-radius:50%;animation:inkspin .8s linear infinite}@keyframes inkspin{to{transform:rotate(360deg)}}#so{margin:6px 0}';
document.head.append(st);
let el=null,t1=0,t2=0;
window.inkBusy=(on,txt)=>{clearTimeout(t1);clearTimeout(t2);
 if(!on){el&&el.remove();el=null;return}
 t1=setTimeout(()=>{if(el)return;el=document.createElement('div');el.id='inkbusy';el.innerHTML='<i></i><span></span>';el.querySelector('span').textContent=txt||'جاري التحميل…';document.body.append(el)},200);
 t2=setTimeout(()=>inkBusy(false),60000)};
addEventListener('error',()=>inkBusy(false));addEventListener('unhandledrejection',()=>inkBusy(false));
const fp=document.getElementById('fp');
fp&&fp.addEventListener('change',e=>{if(e.target.files&&e.target.files[0])inkBusy(true,'جاري فتح الملف…')},true);

let skip=0;const back=()=>{skip=1;setTimeout(()=>{skip=0},500);history.back()};
const od=window.openDoc;
window.openDoc=async function(){
 inkBusy(true,'جاري فتح الملف…');
 if(!(history.state&&history.state.ink))try{history.pushState({ink:1},'')}catch(e){}
 try{return await od.apply(this,arguments)}
 finally{inkBusy(false);const ed=document.getElementById('ed');if(ed&&ed.hidden&&history.state&&history.state.ink)back()}};
const bk=document.getElementById('bk'),obk=bk.onclick;
bk.onclick=async function(e){await obk.call(this,e);if(history.state&&history.state.ink)back()};
addEventListener('popstate',()=>{
 if(skip){skip=0;return}
 const pops=[...document.querySelectorAll('.pop,#mm')].filter(p=>!p.hidden);
 if(pops.length){pops.forEach(p=>p.hidden=true);try{history.pushState({ink:1},'')}catch(e){}return}
 const ed=document.getElementById('ed');if(ed&&!ed.hidden)obk.call(bk)});
})();

// ---- التنقل بين آخر ملفات PDF فتحتها بالسحب يمين/شمال ----
(()=>{
const K='inkstrip',get=()=>{try{const a=JSON.parse(localStorage.getItem(K)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}},put=a=>{try{localStorage.setItem(K,JSON.stringify(a.slice(-15)))}catch(e){}};
let tt=0;const toast=m=>{let t=document.getElementById('inktoast');if(!t){t=document.createElement('div');t.id='inktoast';document.body.append(t)}t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{t.hidden=true},1600)};
const od=window.openDoc;
window.openDoc=async function(id){const r=await od.apply(this,arguments);try{if(S.d&&S.d.id===id&&S.d.k==='pdf'&&!document.getElementById('ed').hidden){const a=get();if(!a.includes(id)){a.push(id);put(a)}}}catch(e){}return r};
let busy=0;
async function go(dir){if(busy||!S.d)return;busy=1;
 try{const a=get(),i=a.indexOf(S.d.id);if(i<0){toast('افتح ملفين PDF على الأقل عشان تتنقل بينهم');return}
  let j=i+dir,tg=null;
  while(j>=0&&j<a.length){const d=await tx('d','readonly',s=>s.get(a[j]));if(d&&d.k==='pdf'){tg=d;break}a.splice(j,1);if(dir<0)j--}
  put(a);
  if(!tg){toast(dir<0?'مفيش ملف قبل ده':'ده آخر ملف فتحته');return}
  const n=a.indexOf(tg.id)+1;
  await flush();try{S.pdf&&S.pdf.destroy&&S.pdf.destroy()}catch(e){}clearHl();
  await window.openDoc(tg.id);toast('📄 '+tg.n+'  ('+n+'/'+a.length+')')
 }finally{busy=0}}
const sc=document.getElementById('sc');let g=null;
const mid=e=>{const t=[...e.touches];return[t.reduce((s,q)=>s+q.clientX,0)/t.length,t.reduce((s,q)=>s+q.clientY,0)/t.length,t.length>1?Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY):0]};
sc.addEventListener('touchstart',e=>{
 if(document.getElementById('plc')){g=null;return}
 const n=e.touches.length;
 if(n===2){const m=mid(e);g={two:1,x:m[0],y:m[1],d:m[2],lx:m[0],ly:m[1],ld:m[2],t:Date.now()}}
 else if(n===1&&S.t==='hand'&&sc.scrollWidth<=sc.clientWidth+2){const m=mid(e);g={two:0,x:m[0],y:m[1],d:0,lx:m[0],ly:m[1],ld:0,t:Date.now()}}
 else if(n>2)g=null;
},{passive:true});
sc.addEventListener('touchmove',e=>{if(!g)return;if(e.touches.length!==(g.two?2:1)){return}const m=mid(e);g.lx=m[0];g.ly=m[1];g.ld=m[2]},{passive:true});
sc.addEventListener('touchend',e=>{if(!g)return;if(g.two?e.touches.length>=2:e.touches.length>=1)return;
 const h=g;g=null;const dx=h.lx-h.x,dy=h.ly-h.y,ok=Math.abs(dx)>90&&Math.abs(dx)>2*Math.abs(dy)&&Date.now()-h.t<1200&&(!h.two||!h.d||Math.abs(h.ld/h.d-1)<.15);
 if(ok)go(dx>0?-1:1)},{passive:true});
sc.addEventListener('touchcancel',()=>{g=null},{passive:true});
})();
