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
try{localStorage.removeItem('inkai')}catch(e){}
const showAI=t=>{$('#aib').textContent=t;$('#air').hidden=false};
$('#aix').onclick=()=>$('#air').hidden=true;$('#aic').onclick=()=>navigator.clipboard.writeText($('#aib').textContent);
const AISYS='أنت مساعد مذاكرة لطالب علاج طبيعي. أجب بالعربية المصرية المبسطة وخلّي المصطلحات الطبية بالإنجليزية. كن مختصرًا.';
// موافقة مرة واحدة قبل أي استخدام لخدمة خارجية (الذكاء الاصطناعي / الترجمة أونلاين)
window.inkNetOk=async()=>{try{if(localStorage.getItem('inknet')==='1')return true}catch(e){}
 const ok=await inkYN('الميزة دي بتبعت النص اللي بتختاره (أو نص الصفحة) لخدمة خارجية على الإنترنت (ذكاء اصطناعي مجاني / ترجمة). الملفات نفسها مش بتتبعت، النص المطلوب بس. موافق؟','موافق','لا',1);
 if(ok)try{localStorage.setItem('inknet','1')}catch(e){}return !!ok};
async function aiChat(msgs,sys){if(!await inkNetOk())return null;let r,j;
 try{r=await fetch('https://text.pollinations.ai/openai',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model:'openai',max_tokens:4000,messages:[{role:'system',content:sys||AISYS},...msgs]}),...(window.AbortSignal&&AbortSignal.timeout?{signal:AbortSignal.timeout(90000)}:{})})}catch(x){throw Error('تعذر الاتصال بخدمة الذكاء الاصطناعي (ممكن مفيش نت أو الخدمة واقفة). جرّب بعدين')}
 try{j=await r.json()}catch(x){throw Error('الخدمة رجّعت رد مش مفهوم ('+r.status+'). جرّب بعدين')}
 if(!r.ok)throw Error(String((j&&j.error&&(j.error.message||j.error))||(Array.isArray(j)&&j[0]&&j[0].error&&j[0].error.message)||('الخدمة رفضت الطلب ('+r.status+')')));
 const t=j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;if(!t)throw Error('رد فاضي');return t}
async function ai(p,sys){return aiChat([{role:'user',content:p}],sys)}
$('#ai').onclick=async()=>{const t=selTxt();if(!t)return;
 showAI('⏳ …');try{const r=await ai('اشرح بشكل مبسط:\n'+t);r?showAI(r):$('#air').hidden=true}catch(e){showAI('خطأ: '+e.message)}};
$('#m-sm').onclick=async()=>{$('#mm').hidden=true;if(!S.pdf)return alert('التلخيص للـPDF بس');const T=await ptxt(S.cp||0),t=T.it.map(x=>x.str).join(' ').trim();if(!t)return alert('الصفحة مفيهاش نص. جرّب OCR الأول');
 showAI('⏳ …');try{const r=await ai('لخّص النص ده في نقاط قصيرة:\n'+t.slice(0,12000));r?showAI(r):$('#air').hidden=true}catch(e){showAI('خطأ: '+e.message)}};
// ---- flashcards ----
const cz=t=>{const ws=t.split(/\s+/).map(x=>x.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'')).filter(x=>x.length>3),lt=ws.filter(x=>/^[A-Za-z][A-Za-z-]*$/.test(x)),w=(lt.length?lt:ws).sort((a,b)=>b.length-a.length)[0];return w?t.replace(w,'＿＿＿＿'):t};
const hls=()=>{const L=[];S.pg.forEach((_,i)=>(S.d.s[i]||[]).forEach(o=>o.t==='hr'&&o.tx&&o.tx.trim().length>8&&L.push([i,o.tx.trim()])));return L};
async function aiCards(){const H=hls();if(!H.length)return alert('ظلّل نص بالهايلايت الأول');showAI('⏳ بعمل الكروت…');
 try{const t=await ai('حوّل الجمل دي لكروت مراجعة (سؤال وإجابة قصيرة). رجّع JSON array فقط بالشكل [{"q":"","a":""}] بدون أي كلام تاني:\n'+H.map(x=>x[1]).join('\n').slice(0,8000));if(!t)return $('#air').hidden=true;
  (S.d.ai=S.d.ai||[]).push(...JSON.parse(t.match(/\[[\s\S]*\]/)[0]).filter(x=>x.q&&x.a));save();$('#air').hidden=true;plR()}catch(e){showAI('خطأ: '+e.message)}}
$('#m-fc').onclick=()=>{$('#mm').hidden=true;tab='fc';$('#pl').hidden=false;plR()};
let cur=null,curU=null;
const _pl=plR;plR=function(){if(tab!=='fc'&&tab!=='au')return _pl();const b=$('#plb');b.innerHTML='';b.classList.add('l');document.querySelectorAll('#plh [data-p]').forEach(x=>x.classList.toggle('on',x.dataset.p===tab));
 if(tab==='fc'){const C=[...(S.d.ai||[]),...hls().map(([i,t])=>({q:cz(t),a:t}))],g=E('button');g.textContent='✨ كروت بالـAI من الهايلايت';g.onclick=aiCards;b.append(g);
  if(!C.length){const p=E('p');p.textContent='ظلّل نص بالهايلايت وهيتحوّل لكروت هنا. اضغط على الكارت لإظهار الإجابة.';b.append(p)}
  C.forEach(c=>{const d=E('div','hi');let f=0;d.textContent='❓ '+c.q;d.onclick=()=>{f=!f;d.textContent=f?'✅ '+c.a:'❓ '+c.q};b.append(d)});return}
 if(!(S.d.au||[]).length){const p=E('p');p.textContent='مفيش تسجيلات. ابدأ من ⋯ ← 🎙 تسجيل صوت.';b.append(p)}
 (S.d.au||[]).forEach((r,j)=>{const d=E('div','hi','<b></b> <button>▶</button> <button>🗑</button>');d.querySelector('b').textContent='ص '+(r.pg+1)+' · '+new Date(r.t).toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});const[p,x]=d.querySelectorAll('button');
  p.onclick=async()=>{const f=await tx('f','readonly',s=>s.get(r.k));if(!f)return alert('ملف التسجيل مش موجود');cur&&cur.pause();curU&&URL.revokeObjectURL(curU);curU=URL.createObjectURL(new Blob([f],{type:r.m}));cur=new Audio(curU);cur.play().catch(()=>{})};
  x.onclick=async()=>{if(!await inkConfirm('حذف التسجيل؟'))return;await tx('f','readwrite',s=>s.delete(r.k));S.d.au.splice(j,1);save();plR()};b.append(d)})};
// ---- audio recording ----
let MR=null,CHT=[];$('#m-rc').onclick=async()=>{const b=$('#m-rc');if(MR){MR.stop();return}
 try{const st=await navigator.mediaDevices.getUserMedia({audio:true}),pg=S.cp||0,dd=S.d;MR=new MediaRecorder(st);CHT=[];MR.ondataavailable=e=>CHT.push(e.data);
  MR.onstop=async()=>{st.getTracks().forEach(t=>t.stop());const m=MR.mimeType||'audio/webm',ab=await new Blob(CHT,{type:m}).arrayBuffer(),k='a'+Date.now();MR=null;b.textContent='🎙 تسجيل صوت';$('#mn').style.color='';
   try{await tx('f','readwrite',s=>s.put(ab,k))}catch(e){return alert('تعذر حفظ التسجيل (ممكن المساحة خلصت)')}(dd.au=dd.au||[]).push({k,pg,t:Date.now(),m});if(dd===S.d)save();else dbPut(dd).catch(()=>{})};
  MR.start();b.textContent='⏹ إيقاف التسجيل';$('#mn').style.color='#ef4444'}catch(e){alert('مفيش إذن للميكروفون')}};
// ---- OCR ----
const _pt=ptxt;ptxt=async function(i){const o=S.d.oc&&S.d.oc[i];if(!o)return _pt(i);if(S.tc[i])return S.tc[i];const v=(await S.pdf.getPage(i+1)).getViewport({scale:1}),T={s:'',mi:[],mo:[],it:[],w:v.width,h:v.height};
 o.forEach(([str,x,y,w,h])=>{const j=T.it.length;T.it.push({str,x,y:y+h*.82,dx:1,dy:0,ux:0,uy:-1,w,h,n:str.length,ar:/[\u0590-\u08FF\uFB1D-\uFEFF]/.test(str)});let k=0;for(const c0 of str){for(const c of NM(c0)){T.s+=c;T.mi.push(j);T.mo.push(k)}k++}T.s+=' ';T.mi.push(-1);T.mo.push(0)});return S.tc[i]=T};
$('#m-ocr').onclick=async()=>{if(!S.pdf)return alert('OCR للـPDF بس');const b=$('#m-ocr'),i=S.cp||0,el=S.pg[i];b.disabled=true;
 try{const TB=new URL('lib/tess/',location.href).href;
  const ld=u=>new Promise((r,x)=>{const t=E('script');t.src=u;t.onload=r;t.onerror=()=>x(Error('محتاج إنترنت'));document.head.append(t)});
  if(!window.Tesseract){try{await ld(TB+'tesseract.min.js');window._tessLocal=true}catch(e){await ld('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js')}}
  const k=2,c=E('canvas');c.width=el.dim[0]*k;c.height=el.dim[1]*k;await bgDraw(i,c.getContext('2d'),k);
  const TO={logger:m=>b.textContent='🔎 '+Math.round((m.progress||0)*100)+'%'};if(window._tessLocal){const TB=new URL('lib/tess/',location.href).href;TO.workerPath=TB+'worker.min.js';TO.corePath=TB;TO.langPath=TB;TO.gzip=false}
  const r=await Tesseract.recognize(c,'ara+eng',TO);
  (S.d.oc=S.d.oc||{})[i]=r.data.words.filter(w=>w.text.trim()).map(w=>[w.text,w.bbox.x0/k,w.bbox.y0/k,(w.bbox.x1-w.bbox.x0)/k,(w.bbox.y1-w.bbox.y0)/k]);
  S.tc[i]=null;el.tl&&(el.tl.remove(),el.tl=null);buildTl(i);save();alert('تم. جرّب البحث أو تحديد النص في الصفحة دي')}catch(e){alert('فشل OCR: '+e.message)}b.disabled=false;b.textContent='🔎 OCR للصفحة'};
// ---- page tools (insert / delete / move) ----
async function PM(a){const d=S.d,n=S.pg.length,c=S.cp||0;let o=[...Array(n).keys()],np=c;
 if(a==='i'){o.splice(c+1,0,null);np=c+1}else if(a==='d'){if(n<2)return alert('لازم تفضل صفحة واحدة');if(!await inkConfirm('حذف صفحة '+(c+1)+'؟'))return;o.splice(c,1);np=Math.min(c,o.length-1)}
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
 b.innerHTML='';const T=E('div','stt'),l=E('div','stl');T.textContent=ft(s[dk(n)]||0);l.textContent='النهاردة';b.append(T,l);
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
SC.addEventListener('pointerdown',e=>{t0=e.isPrimary&&NV()?{x:e.clientX,y:e.clientY,t:Date.now()}:null},true);
SC.addEventListener('pointerup',e=>{const q=t0;t0=null;if(!q||!S.d||S.pd||getSelection().toString())return;if(Math.hypot(e.clientX-q.x,e.clientY-q.y)>=10||Date.now()-q.t>=400)return;
 const h=hit(e.clientX,e.clientY);if(!h)return;e.stopImmediatePropagation();RV.has(h.o)?RV.delete(h.o):RV.add(h.o);ink(h.i)},true);
$('#m-cv').onclick=()=>{$('#mm').hidden=true;S.sh='cv';$('#shs').value='cv';S.t='sh';sync()};
const rl=()=>{const b=$('#m-ra');b.textContent='👁 إظهار كل الإجابات: '+(RA?'شغال':'إيقاف');b.classList.toggle('on',!!RA)};
$('#m-ra').onclick=()=>{RA=RA?0:1;rl();S.pg.forEach(e=>e.ink.width>1&&ink(e.i))};
const _od=openDoc;openDoc=id=>{RA=0;rl();return _od(id)};
})();

// ================= v8: organized toolbar (tool groups + popovers) =================
(()=>{
const ED=$('#ed'),TB=$('#tb'),PM=$('#pm'),PC=$('#pc2'),PA=$('#pa'),PS=$('#pst'),MB=$('#tmb'),CB=$('#tcb'),GP=$('#g-pen'),GT=$('#g-th'),GA=$('#g-add'),SP=$('#psb'),ST=$('#tsb'),MI={mv:1,ls:1,sh:1},
IK={bag:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',mv:'<path d="m5 9-3 3 3 3"/><path d="m9 5 3-3 3 3"/><path d="m15 19-3 3-3-3"/><path d="m19 9 3 3-3 3"/><path d="M2 12h20"/><path d="M12 2v20"/>',ls:'<path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h1"/><path d="M14 3h1"/><path d="M14 21h1"/><path d="M3 9v1"/><path d="M21 9v1"/><path d="M3 14v1"/><path d="M21 14v1"/>',sh:'<path d="M8.3 10a.7.7 0 0 1-.6-1.1L11.4 3a.7.7 0 0 1 1.2 0L16.3 9a.7.7 0 0 1-.6 1z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>'},
GI={pen:'<path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.4 18.6a2 2 0 0 1-.9.5l-2.9.8a.5.5 0 0 1-.6-.6l.8-2.9a2 2 0 0 1 .5-.9z"/>',hl:'<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',lz:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',er:'<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'};
const shut=()=>{[PM,PC,PA,PS].forEach(p=>p.hidden=true);[MB,CB,GA].forEach(b=>b.classList.remove('open'))};
const place=p=>{const r=TB.getBoundingClientRect();p.style.cssText='';
 if(ED.classList.contains('L')){p.style.left=r.right+6+'px';p.style.top=Math.max(8,r.top)+'px';p.style.maxHeight=innerHeight-Math.max(8,r.top)-8+'px'}
 else{p.style.bottom=innerHeight-r.top+6+'px';p.style.left='8px';p.style.right='8px'}};
const tog=(p,b)=>{const o=p.hidden;shut();if(o){p.hidden=false;b.classList.add('open');place(p)}};
MB.onclick=()=>tog(PM,MB);CB.onclick=()=>tog(PC,CB);
// زر الإضافات: لو وضع النص شغال الضغطة بتقفله، غير كده بيفتح قايمة (صورة / نص / ستيكر / توقيع)
GA.onclick=()=>{if(S.t==='tx'){S.t='hand';shut();sync();return}tog(PA,GA)};
addEventListener('pointerdown',e=>{if(!e.target.closest('.pop,#tmb,#tcb,#g-add'))shut()},true);
PM.querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',shut));$('#shs').addEventListener('change',shut);
// مجموعة القلم: ضغطة تشغّل آخر أداة (قلم/هايلايتر/ليزر/ممسحة)، وضغطة تانية ترجّع التحكم في الشاشة بس
GP.onclick=()=>{shut();S.t=PENT.includes(S.t)?'hand':(S.lp||'pen');sync()};
GT.onclick=()=>{shut();S.t=S.t==='th'?'hand':'th';sync()};
$('#a-tx').onclick=()=>{shut();S.t='tx';sync()};
$('#imf').addEventListener('change',shut);
$('#a-sg').onclick=()=>{shut();sigUI()};
$('#a-st').onclick=()=>{shut();PS.hidden=false;GA.classList.add('open');place(PS)};
// ---- stickers (بتتحط كصورة: تتحرك وتتكبّر قبل التثبيت) ----
const SK=['✅','❌','⭐','❗','❓','💡','📌','🔥','👍','⚠️','🧠','➡️','❤️','🎯','📖','🔴','🟡','🟢','✔️','💬'],sgd=PS.querySelector('.stg');
SK.forEach(k=>{const b=E('button');b.textContent=k;b.onclick=()=>{shut();stk(k)};sgd.append(b)});
function stk(k){const c=E('canvas');c.width=c.height=256;const x=c.getContext('2d');x.font='200px "Apple Color Emoji","Noto Color Emoji","Segoe UI Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(k,128,140);placeImg(c.toDataURL('image/png'),1)}
// ---- signature ----
const SGK='inksig',sgl=()=>{try{const a=JSON.parse(localStorage.getItem(SGK)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}},sgs=a=>{try{localStorage.setItem(SGK,JSON.stringify(a.slice(-6)))}catch(e){}};
function sigUI(){const old=$('#sgo');old&&old.remove();let col='#111827';
 const o=E('div','ov','<div class="ph"><b>✍ التوقيع</b><button class="x">✕</button></div><div class="ob"><div class="mh">وقّع في المربع وبعدين اضغط ✓ عشان تحطه في الصفحة (بتقدر تحرّكه وتكبّره).</div><canvas></canvas><div class="row sgr"><button class="c" data-c="#111827" style="background:#111827"></button><button class="c" data-c="#1e40af" style="background:#1e40af"></button><button class="clr">🧹 مسح</button></div><h4>توقيعاتك المحفوظة</h4><div class="sgl"></div></div><div class="mf"><button class="btn p go">✓ حفظ ووضع في الصفحة</button></div>');
 o.id='sgo';document.body.append(o);
 const cv=o.querySelector('canvas'),w=Math.min(innerWidth-32,460),h=Math.round(w*.45),d=Math.max(1,Math.min(devicePixelRatio||1,3));cv.width=w*d;cv.height=h*d;cv.style.width=w+'px';cv.style.height=h+'px';
 const x=cv.getContext('2d');x.scale(d,d);x.lineCap=x.lineJoin='round';x.lineWidth=2.8;
 let dn=0,lp=null,bb=[1e9,1e9,-1e9,-1e9];
 const P=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]},bm=q=>{bb=[Math.min(bb[0],q[0]),Math.min(bb[1],q[1]),Math.max(bb[2],q[0]),Math.max(bb[3],q[1])]};
 const ink1=()=>{x.strokeStyle=col};
 cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);dn=1;lp=P(e);ink1();x.beginPath();x.moveTo(lp[0],lp[1]);x.lineTo(lp[0]+.1,lp[1]);x.stroke();bm(lp)};
 cv.onpointermove=e=>{if(!dn)return;const q=P(e);ink1();x.beginPath();x.moveTo(lp[0],lp[1]);x.lineTo(q[0],q[1]);x.stroke();lp=q;bm(q)};
 cv.onpointerup=cv.onpointercancel=()=>{dn=0};
 const cs=o.querySelectorAll('.sgr .c'),sc2=()=>cs.forEach(b=>b.classList.toggle('on',b.dataset.c===col));cs.forEach(b=>b.onclick=()=>{col=b.dataset.c;sc2()});sc2();
 o.querySelector('.clr').onclick=()=>{x.clearRect(0,0,w,h);bb=[1e9,1e9,-1e9,-1e9]};
 o.querySelector('.x').onclick=()=>o.remove();
 const L=o.querySelector('.sgl'),draw=()=>{L.innerHTML='';const a=sgl();if(!a.length){const p=E('small');p.textContent='لسه مفيش توقيعات محفوظة.';p.style.color='var(--mut)';L.append(p)}
  a.forEach((g,j)=>{const t=E('div','sgi','<img><b>✕</b>');t.querySelector('img').src=g.src;t.querySelector('img').onclick=()=>{o.remove();placeImg(g.src,g.ar)};t.querySelector('b').onclick=e=>{e.stopPropagation();const z=sgl();z.splice(j,1);sgs(z);draw()};L.append(t)})};draw();
 o.querySelector('.go').onclick=()=>{if(bb[2]<bb[0])return alert('وقّع الأول');const p=8,X=Math.max(0,bb[0]-p),Y=Math.max(0,bb[1]-p),X2=Math.min(w,bb[2]+p),Y2=Math.min(h,bb[3]+p),cw=Math.max(8,X2-X),ch=Math.max(8,Y2-Y),c=E('canvas');
  c.width=cw*d;c.height=ch*d;c.getContext('2d').drawImage(cv,X*d,Y*d,cw*d,ch*d,0,0,cw*d,ch*d);const src=c.toDataURL('image/png'),ar=ch/cw,a=sgl();a.push({src,ar});sgs(a);o.remove();placeImg(src,ar)}}
// ---- sub bars (القلم / هايلايت النص) ----
const subPlace=()=>{const r=TB.getBoundingClientRect(),L=ED.classList.contains('L');
 [[SP,GP],[ST,GT]].forEach(([p,b])=>{if(p.hidden)return;p.style.cssText='';
  if(L){const q=b.getBoundingClientRect();p.style.left=r.right+8+'px';p.style.top=Math.max(8,Math.min(q.top,innerHeight-p.offsetHeight-8))+'px'}
  else{p.style.left='0';p.style.right='0';p.style.margin='0 auto';p.style.bottom=innerHeight-r.top+8+'px'}})};
window.inkSubPlace=subPlace;
const grp=()=>{const pen=PENT.includes(S.t);GP.classList.toggle('on',pen);GT.classList.toggle('on',S.t==='th');GA.classList.toggle('on',S.t==='tx');
 GP.innerHTML='<svg class="i" viewBox="0 0 24 24">'+GI[S.lp||'pen']+'</svg>';SP.hidden=!pen;ST.hidden=S.t!=='th';ED.classList.toggle('sub',pen||S.t==='th');subPlace()};
addEventListener('resize',()=>{subPlace();shut()});
const upd=()=>{const i=MI[S.t];MB.innerHTML='<svg class="i" viewBox="0 0 24 24">'+IK[i?S.t:'bag']+'</svg>';MB.classList.toggle('on',!!i);$('#dot').style.background=S.c;$('#pv').style.background=S.c;$('#pv').style.height=Math.max(2,S.w*1.5)+'px'};
const _sy2=sync;sync=()=>{_sy2();upd();grp()};const _pc=pc;pc=()=>{_pc();upd()};
$('#wd').addEventListener('input',upd);$('#co').addEventListener('input',upd);$('#tp').addEventListener('click',()=>setTimeout(()=>{place(PM);subPlace()},0));sync();
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
window.openDoc=async function(id){S.df=1;const r=await od.apply(this,arguments);try{if(S.d&&S.d.id===id&&S.d.k==='pdf'&&!document.getElementById('ed').hidden){const a=get();if(!a.includes(id)){a.push(id);put(a)}}}catch(e){}return r};
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

// الطبقة النصية (تحديد النص) بتتبني بس في وضع اليد 🖐
{const _s3=sync;sync=()=>{_s3();if(NV()&&S.pg)S.pg.forEach(el=>{if(el&&el.r&&!el.tl&&nearEl(el,600))buildTl(el.i)})}}


// ---- v9: theme switch (dark / light) ----
(()=>{const q=s=>document.querySelector(s),R=document.documentElement,K='inktheme';
const get=()=>{try{return localStorage.getItem(K)||'dark'}catch(e){return'dark'}};
const apply=t=>{if(t==='light')R.setAttribute('data-theme','light');else R.removeAttribute('data-theme');
 const m=q('meta[name=theme-color]');m&&m.setAttribute('content',t==='light'?'#ffffff':'#0b1120');
 const b=q('#m-th');b&&(b.textContent='🎨 المظهر: '+(t==='light'?'فاتح':'داكن'))};
apply(get());
const b=q('#m-th');b&&b.addEventListener('click',()=>{const t=get()==='light'?'dark':'light';try{localStorage.setItem(K,t)}catch(e){}apply(t)});
})();

// ================= v20: TOC, links, search list, AI chat, AI highlights =================
const closePm=()=>{$('#pm').hidden=true;$('#tmb').classList.remove('open')};
const pgText=async i=>{const T=await ptxt(i);return T.it.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim()};
// ---- destinations / jumping ----
async function destInfo(dest){try{if(typeof dest==='string')dest=await S.pdf.getDestination(dest);if(!Array.isArray(dest)||!dest.length)return null;
 const r=dest[0];const i=typeof r==='number'?r:await S.pdf.getPageIndex(r);if(!(i>=0&&i<S.pg.length))return null;
 let y=null;const m=dest[1]&&dest[1].name;
 if(m==='XYZ'||m==='FitH'||m==='FitBH'){const t=m==='XYZ'?dest[3]:dest[2];if(typeof t==='number'){const p=await S.pdf.getPage(i+1),v=p.getViewport({scale:1});y=v.convertToViewportPoint(m==='XYZ'?(dest[2]||0):0,t)[1];if(!(y>=0&&y<=v.height))y=null}}
 return{i,y}}catch(e){return null}}
function showBack(){let b=$('#bkj');if(!b){b=E('button','', '↩ رجوع للمكان السابق');b.id='bkj';b.onclick=()=>{const sc=$('#sc');S.bk&&sc.scrollTo(S.bk.l,S.bk.t);b.hidden=true};document.body.append(b)}
 b.hidden=false;clearTimeout(b.t);b.t=setTimeout(()=>b.hidden=true,15000)}
function jumpTo(d,back){const sc=$('#sc'),el=S.pg[d.i];if(!el)return;if(back)S.bk={t:sc.scrollTop,l:sc.scrollLeft};
 const r=el.getBoundingClientRect(),s=sc.getBoundingClientRect();sc.scrollTop+=r.top-s.top+(d.y!=null?Math.max(0,d.y*S.z-40):0);back&&showBack()}
// ---- table of contents tab ----
async function loadToc(){if(!S.pdf)return null;if(S.pdf._t!==undefined)return S.pdf._t;let o=null;try{o=await S.pdf.getOutline()}catch(e){}S.pdf._t=o&&o.length?o:null;return S.pdf._t}
const _pl3=plR;plR=function(){if(tab!=='toc')return _pl3();const b=$('#plb');b.innerHTML='';b.classList.add('l');document.querySelectorAll('#plh [data-p]').forEach(x=>x.classList.toggle('on',x.dataset.p===tab));
 const p=E('p');p.textContent='⏳ …';b.append(p);
 loadToc().then(T=>{if(tab!=='toc')return;b.innerHTML='';
  if(!T){const q=E('p');q.textContent=S.pdf?'الملف ده مفيهوش فهرس مدمج.':'الفهرس للـPDF بس.';b.append(q);return}
  const walk=(L,dp)=>L.forEach(it=>{const d=E('div','hi');d.style.cssText='border-color:var(--acc);margin-right:'+Math.min(dp,5)*14+'px';d.textContent=it.title||'—';
   d.onclick=async()=>{const r=await destInfo(it.dest);if(!r){if(it.url&&await inkConfirm('فتح الرابط؟\n'+it.url))open(it.url,'_blank','noopener');return}$('#pl').hidden=true;jumpTo(r,true)};b.append(d);it.items&&it.items.length&&walk(it.items,dp+1)});
  walk(T,0)})};
// ---- clickable links inside the PDF (hand tool, tap) ----
async function loadLinks(i){const el=S.pg[i];if(!el||el.lk!==undefined||!S.pdf)return;el.lk=null;
 try{const p=await S.pdf.getPage(i+1),v=p.getViewport({scale:1}),an=await p.getAnnotations();
  el.lk=an.filter(a=>a.subtype==='Link'&&a.rect&&(a.dest||a.url||a.unsafeUrl||a.action)).map(a=>{const[x0,y0,x1,y1]=v.convertToViewportRectangle(a.rect);
   return{x0:Math.min(x0,x1),y0:Math.min(y0,y1),x1:Math.max(x0,x1),y1:Math.max(y0,y1),dest:a.dest,url:a.url||a.unsafeUrl,act:a.action}})}catch(e){el.lk=[]}}
const _bt=buildTl;buildTl=function(i){loadLinks(i);return _bt(i)};
async function followLink(h,i){if(h.dest){const r=await destInfo(h.dest);r&&jumpTo(r,true);return}
 if(h.url){if(await inkConfirm('فتح الرابط؟\n'+h.url))open(h.url,'_blank','noopener');return}
 const n={NextPage:i+1,PrevPage:i-1,FirstPage:0,LastPage:S.pg.length-1}[h.act];if(n!=null&&S.pg[n])jumpTo({i:n,y:null},true)}
let tpk=null;
$('#sc').addEventListener('pointerdown',e=>{tpk=e.isPrimary&&NV()?{x:e.clientX,y:e.clientY,t:Date.now()}:null},true);
$('#sc').addEventListener('pointerup',e=>{const k=tpk;tpk=null;if(!k||S.pd||PN)return;if(Math.hypot(e.clientX-k.x,e.clientY-k.y)>10||Date.now()-k.t>400)return;if(getSelection().toString())return;
 const i=S.pg.findIndex(el=>{const q=el.getBoundingClientRect();return e.clientX>=q.left&&e.clientX<=q.right&&e.clientY>=q.top&&e.clientY<=q.bottom});if(i<0)return;
 const el=S.pg[i];if(!el.lk||!el.lk.length)return;const q=el.getBoundingClientRect(),x=(e.clientX-q.left)/S.z,y=(e.clientY-q.top)/S.z,g=2;
 const h=el.lk.find(l=>x>=l.x0-g&&x<=l.x1+g&&y>=l.y0-g&&y<=l.y1+g);if(!h)return;e.stopPropagation();followLink(h,i)},true);
// ---- search results list ----
$('#sl').onclick=()=>{if(!S.sr||!S.sr.length)return alert('اعمل بحث الأول');
 const old=$('#srl');old&&old.remove();const o=E('div','ov','<div class="ph"><b></b><button class="x">✕</button></div><div class="ob"></div>');o.id='srl';
 o.querySelector('b').textContent='🔍 '+S.lq+' — '+S.sr.length+' نتيجة';const b=o.querySelector('.ob');
 S.sr.slice(0,500).forEach((r,n)=>{const T=S.tc[r.i],j=Math.max(0,T.mi[r.k]);const d=E('div','hi');d.style.borderColor='#f97316';
  const s=T.it.slice(Math.max(0,j-1),j+2).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();d.textContent='ص'+(r.i+1)+' — '+s.slice(0,200);d.onclick=()=>{o.remove();go(n)};b.append(d)});
 if(S.sr.length>500){const p=E('p');p.textContent='معروض أول 500 نتيجة بس.';b.append(p)}
 o.querySelector('.x').onclick=()=>o.remove();document.body.append(o)};
// ---- AI chat about the file ----
const AICH={h:[],busy:0,id:''};
function addMsg(c,t){const m=E('div','cm '+c);m.textContent=t;const b=$('#cqb');b.append(m);b.scrollTop=b.scrollHeight;return m}
function chatOpen(){if(!S.pdf)return alert('الشات للـPDF بس');let o=$('#cq');
 if(!o){o=E('div','ov','<div class="ph"><b>💬 اسأل عن الملف</b><select id="cqs"><option value="1">الصفحة الحالية</option><option value="3">٣ صفحات حواليها</option><option value="all">الملف كله (مقتطع)</option></select><button class="x">✕</button></div><div class="ob" id="cqb"></div><div class="cqc"><button>📝 لخّص</button><button>🧒 اشرح ببساطة</button><button>❓ اعملّي أسئلة مراجعة</button></div><div id="cqf"><textarea id="cqi" rows="1" placeholder="اسأل عن الصفحة…" dir="auto"></textarea><button class="btn p" id="cqg">إرسال</button></div>');
  o.id='cq';document.body.append(o);o.querySelector('.x').onclick=()=>o.hidden=true;$('#cqg').onclick=chatSend;
  const qs=['لخّص الصفحة دي في نقاط قصيرة','اشرح الصفحة دي ببساطة','اعملّي 5 أسئلة مراجعة مع إجاباتها من الصفحة دي'];
  o.querySelectorAll('.cqc button').forEach((b,n)=>b.onclick=()=>{$('#cqi').value=qs[n];chatSend()});
  $('#cqi').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&innerWidth>700){e.preventDefault();chatSend()}}}
 if(AICH.id!==S.d.id){AICH.id=S.d.id;AICH.h=[];$('#cqb').innerHTML='';addMsg('a','اسألني أي حاجة عن الصفحة اللي واقف عندها 👇')}
 o.hidden=false;$('#cqi').focus()}
async function chatSend(){const i=$('#cqi'),q=i.value.trim();if(!q||AICH.busy||!S.pdf)return;i.value='';addMsg('u',q);AICH.busy=1;const w=addMsg('a','⏳ …');
 try{const sc=$('#cqs').value,cp=S.cp||0;let idx=sc==='all'?[...S.pg.keys()]:sc==='3'?[cp-1,cp,cp+1].filter(n=>n>=0&&n<S.pg.length):[cp];
  const lim=sc==='all'?60000:15000;let ctx='';for(const n of idx){const t=await pgText(n);if(t)ctx+='[ص'+(n+1)+'] '+t+'\n';if(ctx.length>lim){ctx=ctx.slice(0,lim);break}}
  const sys=AISYS+' استخدم نص الملف التالي كمرجع، ولو الإجابة مش فيه قول كده بوضوح وجاوب من معلوماتك العامة مع التنبيه. لو مفيش نص مستخرج قول إن الصفحة سكان ولازم OCR.\n--- نص الملف ---\n'+(ctx||'(مفيش نص مستخرج)');
  const r=await aiChat([...AICH.h.slice(-8),{role:'user',content:q}],sys);
  if(r==null){w.textContent='اتلغى (محتاج توافق على استخدام الخدمة)'}else{w.textContent=r;AICH.h.push({role:'user',content:q},{role:'assistant',content:r})}
 }catch(e){w.textContent='خطأ: '+e.message}AICH.busy=0}
$('#aq').onclick=chatOpen;$('#m-ch').onclick=()=>{$('#mm').hidden=true;chatOpen()};$('#p-ch').onclick=()=>{closePm();chatOpen()};
const _od=openDoc;openDoc=async function(id){const r=await _od(id);$('#aq').hidden=!(S.d&&S.d.k==='pdf');const c=$('#cq');c&&(c.hidden=true);return r};
// ---- AI picks the important sentences and highlights them ----
function locate(T,ph){const q=NM(ph.trim()).replace(/ +/g,' ').trim();if(q.length<6)return null;let a=T.s.indexOf(q);if(a>=0)return[a,a+q.length];
 const w=q.split(' ');if(w.length<4)return null;const mx=Math.min(4,w.length>>1);let h='';a=-1;for(let k=mx;k>=2&&a<0;k--){h=w.slice(0,k).join(' ');a=T.s.indexOf(h)}if(a<0)return null;
 for(let k=mx;k>=2;k--){const t=w.slice(-k).join(' '),b=T.s.indexOf(t,a+h.length);if(b>=0&&b+t.length-a<=q.length*1.6+30)return[a,b+t.length]}return null}
async function aiHl(){$('#mm').hidden=true;closePm();if(!S.pdf)return alert('التحديد بالـAI للـPDF بس');const i=S.cp||0,T=await ptxt(i),raw=T.it.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
 if(raw.length<40)return alert('الصفحة مفيهاش نص كفاية. جرّب OCR الأول');showAI('⏳ الـAI بيحدد المهم في ص'+(i+1)+'…');
 try{const r=await ai('ده نص صفحة من كتاب دراسي. اختار أهم الجمل أو أجزاء الجمل اللي الطالب لازم يعمللها هايلايت (تعريفات، أسباب، علامات، علاج، أرقام مهمة). من 3 لـ 8 اختيارات، كل واحد بين 4 و30 كلمة، وانسخه حرفيًا زي ما هو في النص بدون أي تغيير أو ترجمة. رجّع JSON array فقط من نصوص، بدون أي كلام تاني.\n\n'+raw.slice(0,12000));
  if(r==null){$('#air').hidden=true;return}
  let L;try{L=JSON.parse(r.match(/\[[\s\S]*\]/)[0])}catch(x){throw Error('رد الـAI مش مفهوم، جرّب تاني')}
  let n=0;for(const ph of L){if(typeof ph!=='string')continue;const m=locate(T,ph);if(!m)continue;const rs=rects(T,m[0],m[1]).map(q=>[q.x,q.y,q.w,q.h]);if(!rs.length)continue;add(i,{t:'hr',c:'#facc15',rs,tx:ph.trim()});n++}
  showAI(n?'✅ حدّدت '+n+' جملة مهمة في ص'+(i+1)+'. تقدر تمسحها بزرار التراجع ↩ (واحدة واحدة).':'ماقدرتش ألاقي الجمل دي في نص الصفحة (غالبًا تنسيقها معقد). جرّب تاني.')}
 catch(e){showAI('خطأ: '+e.message)}}
$('#m-hl').onclick=aiHl;$('#p-hl').onclick=aiHl;


// ================= v22: select highlight (recolor/delete), quick translate, draggable toolbar =================
let HS=null; // الهايلايت المتحدد: {i:رقم الصفحة, o:الكائن}
const rdPg=i=>{const e=S.pg&&S.pg[i];e&&e.ink.width>1&&ink(i)};
const selTxt=()=>{const s=hs();return s?s.toString().trim():((HS&&HS.o.tx)||'').trim()};
function selRect(){const s=hs();if(s)return s.getRangeAt(0).getBoundingClientRect();
 if(HS){const el=S.pg[HS.i],q=el.getBoundingClientRect(),r=HS.o.rs&&HS.o.rs[0];if(r)return{top:q.top+r[1]*S.z,bottom:q.top+(r[1]+r[3])*S.z,left:q.left+r[0]*S.z,right:q.left+(r[0]+r[2])*S.z,width:r[2]*S.z,height:r[3]*S.z}}return null}
function HSR(c,el,k){if(!HS||HS.i!==el.i)return;const o=HS.o;if(!(S.d.s[el.i]||[]).includes(o)){HS=null;setTimeout(updSA);return}
 c.save();c.strokeStyle='#38bdf8';c.lineWidth=Math.max(1.5,2*k);c.setLineDash([6*k,4*k]);
 if(o.rs)o.rs.forEach(r=>c.strokeRect((r[0]-2)*k,(r[1]-2)*k,(r[2]+4)*k,(r[3]+4)*k));else{const b=bx([o]);c.strokeRect((b[0]-6)*k,(b[1]-6)*k,(b[2]-b[0]+12)*k,(b[3]-b[1]+12)*k)}c.restore()}
function updSA(){const s=hs();if(s&&HS){const p=HS.i;HS=null;rdPg(p)}
 const x=selTxt();$('#sa').hidden=!(s||HS);$('#hd').hidden=!HS;['#tr','#ai','#cp'].forEach(i=>$(i).hidden=!x);
 $('#sa .sac').querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',!!HS&&b.dataset.h===HS.o.c))}
function recolor(c){if(!HS||HS.o.c===c)return;const o=HS.o;push({a:'col',i:HS.i,o:[o],f:o.c,t:c});o.c=c;updSA()}
function delHs(){if(!HS)return;const{i,o}=HS,l=S.d.s[i]||[],x=l.indexOf(o);HS=null;if(x>=0){l.splice(x,1);push({a:'del',i,o:[o]})}updSA()}
(()=>{
const SC=$('#sc'),ED=$('#ed'),TB=$('#tb');
// ---- ألوان الهايلايت: بتظلّل النص المحدد، أو بتغيّر لون هايلايت متحدد ----
const HC=['#facc15','#4ade80','#f472b6','#38bdf8','#fb923c','#c084fc','#f87171','#2dd4bf'],sac=$('#sa .sac');
HC.forEach(c=>{const b=E('button','sw');b.style.background=c;b.dataset.h=c;b.setAttribute('aria-label','لون');b.onclick=()=>{HS?recolor(c):mkHl(c)};sac.append(b)});
$('#hd').onclick=delHs;
$('#cp').onclick=()=>{const t=selTxt();if(t)navigator.clipboard.writeText(t).then(()=>{$('#cp').textContent='✓';setTimeout(()=>$('#cp').textContent='📋 نسخ',900)})};
$('#tr').onclick=()=>inkTr(selTxt(),selRect());
// ---- اللمس على هايلايت = تحديده ----
function segD(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy;let t=L?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
function hlAt(x,y){for(let i=0;i<S.pg.length;i++){const r=S.pg[i].getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)continue;
 const px=(x-r.left)/S.z,py=(y-r.top)/S.z,l=S.d.s[i]||[],P=[px,py];
 for(let j=l.length-1;j>=0;j--){const o=l[j];
  if(o.t==='hr'){if(o.rs.some(a=>px>=a[0]-3&&px<=a[0]+a[2]+3&&py>=a[1]-3&&py<=a[1]+a[3]+3))return{i,o}}
  else if(o.t==='hl'){const g=o.w*2+6,p=o.p;if(p.length===1?Math.hypot(p[0][0]-px,p[0][1]-py)<g:p.some((q,n)=>n&&segD(P,p[n-1],q)<g))return{i,o}}}
 return null}return null}
function linkAt(x,y){for(let i=0;i<S.pg.length;i++){const el=S.pg[i],r=el.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)continue;
 const px=(x-r.left)/S.z,py=(y-r.top)/S.z;return!!(el.lk&&el.lk.some(l=>px>=l.x0-2&&px<=l.x1+2&&py>=l.y0-2&&py<=l.y1+2))}return false}
let tq=null;
SC.addEventListener('pointerdown',e=>{tq=e.isPrimary&&NV()?{x:e.clientX,y:e.clientY,t:Date.now()}:null},true);
SC.addEventListener('pointerup',e=>{const q=tq;tq=null;if(!q||!S.d||S.pd||PN)return;if(Math.hypot(e.clientX-q.x,e.clientY-q.y)>10||Date.now()-q.t>400)return;if(getSelection().toString())return;
 const h=linkAt(e.clientX,e.clientY)?null:hlAt(e.clientX,e.clientY);
 if(h){e.stopImmediatePropagation();const p=HS&&HS.i;HS=h;rdPg(h.i);p!=null&&p!==h.i&&rdPg(p);updSA();return}
 if(HS){e.stopImmediatePropagation();const p=HS.i;HS=null;rdPg(p);updSA()}},true);
// ---- ترجمة سريعة (جوجل + MyMemory احتياطي) ----
const isAr=t=>(t.match(/[\u0600-\u06FF]/g)||[]).length>t.replace(/\s/g,'').length*.4;
const TMO=()=>window.AbortSignal&&AbortSignal.timeout?{signal:AbortSignal.timeout(4500)}:{};
async function gtr(q,tl){const r=await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl='+tl+'&dt=t&dt=bd&q='+encodeURIComponent(q),TMO());if(!r.ok)throw Error('g'+r.status);const j=await r.json();return{t:(j[0]||[]).map(x=>x&&x[0]||'').join('').trim(),d:Array.isArray(j[1])?j[1]:[]}}
async function mmtr(q,tl){const r=await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(q.slice(0,450))+'&langpair=Autodetect|'+tl,TMO()),j=await r.json(),t=j&&j.responseData&&j.responseData.translatedText;if(!t||/INVALID|QUERY LENGTH|MYMEMORY/i.test(t))throw Error('mm');return{t,d:[]}}
// ---- offline translation (opus-mt via transformers.js; models are bundled in the APK) ----
const _otp={};
function offPipe(key){if(!_otp[key])_otp[key]=(async()=>{const m=await import('./lib/transformers.min.js'),e=m.env;
 e.allowRemoteModels=false;e.allowLocalModels=true;e.useBrowserCache=false;e.localModelPath=new URL('models/',location.href).href;
 e.backends.onnx.wasm.wasmPaths=new URL('lib/ort/',location.href).href;e.backends.onnx.wasm.numThreads=1;
 return m.pipeline('translation','opus-mt-'+key)})().catch(x=>{_otp[key]=null;throw x});return _otp[key]}
async function offTr(q,tl){const key=tl==='ar'?'en-ar':'ar-en',p=await offPipe(key),pre=tl==='ar'?'>>ara<< ':'';
 const parts=[];let cur='';q.split(/(?<=[.!?؟\n])\s+/).forEach(x=>{if((cur+' '+x).length>350&&cur){parts.push(cur);cur=x}else cur=cur?cur+' '+x:x});if(cur)parts.push(cur);
 let out=[];for(const t of parts){const r=await p(pre+t,{max_new_tokens:256});out.push((r&&r[0]&&r[0].translation_text||'').trim())}
 return{t:out.join(' ').trim(),d:[]}}
const tr1=async(q,tl)=>{if(navigator.onLine!==false&&await inkNetOk()){try{const r=await gtr(q,tl);if(r.t)return r}catch(e){}try{return await mmtr(q,tl)}catch(e){}}return offTr(q,tl)};
let trK=0,trR=null,trTx='';
function placeCard(r){const b=$('#trb'),h=b.offsetHeight,H=innerHeight,t0=56;b.style.bottom='';
 let y=t0;if(r&&r.bottom!=null){y=r.top>H/2?r.top-h-10:r.bottom+10}else y=t0;b.style.top=Math.max(t0,Math.min(y,H-h-8))+'px'}
async function inkTr(text,rect){text=(text||'').replace(/\s+/g,' ').trim();if(!text)return;const k=++trK,tl=isAr(text)?'en':'ar',b=$('#trb'),W=$('#trw');trR=rect||null;trTx='';
 $('#trt').textContent=text.length>160?text.slice(0,160)+'…':text;$('#trs').textContent='⏳ …';W.innerHTML='';b.hidden=false;placeCard(trR);
 let r;try{r=await tr1(text.slice(0,1500),tl)}catch(e){if(k===trK){$('#trs').textContent='تعذّرت الترجمة. جرّب تاني.';const g=E('button');g.textContent='فتح في Google Translate';g.onclick=()=>open('https://translate.google.com/?sl=auto&tl='+tl+'&op=translate&text='+encodeURIComponent(text),'_blank','noopener');W.append(g);placeCard(trR)}return}
 if(k!==trK)return;trTx=r.t;$('#trs').textContent=r.t;
 if(r.d.length){r.d.forEach(e=>{const d=E('div','trd'),p=E('i'),s=E('span');p.textContent=e[0]||'';s.textContent=(e[1]||[]).slice(0,6).join('، ');d.append(p,s);W.append(d)})}
 else if(text.length<220){const ws=[...new Set(text.split(/\s+/).map(w=>w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'')).filter(w=>w.length>2))].slice(0,8);
  if(ws.length>1){const h=E('h5');h.textContent='معاني الكلمات';W.append(h);
   ws.map(w=>{const d=E('div','trd'),i=E('i'),s=E('span');i.textContent=w;s.textContent='…';d.append(i,s);W.append(d);return[w,s]}).forEach(async([w,s])=>{try{const x=await gtr(w,tl);if(k!==trK)return;s.textContent=(x.d.length?x.d.flatMap(e=>e[1]||[]).slice(0,4).join('، '):x.t)||x.t}catch(e){s.textContent='—'}})}}
 placeCard(trR);setTimeout(()=>placeCard(trR),900)}
window.inkTr=inkTr;
$('#trx').onclick=()=>{$('#trb').hidden=true;trK++};
$('#trc').onclick=()=>{trTx&&navigator.clipboard.writeText(trTx).then(()=>{$('#trc').textContent='✓';setTimeout(()=>$('#trc').textContent='📋',900)})};
addEventListener('pointerdown',e=>{if(!$('#trb').hidden&&!e.target.closest('#trb,#sa')){$('#trb').hidden=true;trK++}},true);
// ترجمة تلقائية بعد ما تحدد نص (وضع هايلايت النص)
try{S.at=localStorage.getItem('inkat')==='1'}catch(e){}
const tat=()=>{$('#tat').textContent='🌐 تلقائي: '+(S.at?'شغال':'إيقاف');$('#tat').classList.toggle('on',!!S.at)};tat();
$('#tat').onclick=()=>{S.at=!S.at;try{localStorage.setItem('inkat',S.at?'1':'0')}catch(e){}tat();window.inkSubPlace&&inkSubPlace()};
let atT=0,atL='';
document.addEventListener('selectionchange',()=>{clearTimeout(atT);if(S.t!=='th'||!S.at||!hs())return;
 atT=setTimeout(()=>{const s=hs();if(!s)return;const t=s.toString().trim();if(t&&t!==atL&&t.length<=300){atL=t;inkTr(t,s.getRangeAt(0).getBoundingClientRect())}},750)});
// تغيير الأداة / فتح ملف: نلغي التحديد والكروت
{const _s4=sync;sync=()=>{_s4();if(!NV()&&HS){const p=HS.i;HS=null;rdPg(p)}if(!NV())$('#trb').hidden=true;updSA()}}
{const _o4=openDoc;openDoc=async function(){HS=null;$('#trb').hidden=true;updSA();const r=await _o4.apply(this,arguments);window.inkSubPlace&&inkSubPlace();setTimeout(()=>window.inkSubPlace&&inkSubPlace(),150);return r}}
// ---- شريط الأدوات: ضغطة مطولة وسحب لحد شمال الشاشة (أو رجوع للتحت) ----
const DK1=$('#dkL'),DK2=$('#dkB');let T=null,hold=0,dg=null,sup=0;
const zone=(x,y)=>x<innerWidth*.34?'L':(y>innerHeight*.55?'B':null);
TB.addEventListener('contextmenu',e=>e.preventDefault());
TB.addEventListener('click',e=>{if(sup){e.stopPropagation();e.preventDefault()}},true);
TB.addEventListener('touchmove',e=>{if(dg&&e.cancelable)e.preventDefault()},{passive:false});
TB.addEventListener('pointerdown',e=>{if(!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0)||dg)return;clearTimeout(hold);T={id:e.pointerId,x:e.clientX,y:e.clientY};
 hold=setTimeout(()=>{if(!T)return;dg={id:T.id,sx:T.x,sy:T.y,mode:ED.classList.contains('L')?'L':'B'};try{TB.setPointerCapture(T.id)}catch(x){}
  navigator.vibrate&&navigator.vibrate(18);TB.classList.add('drag');TB.style.transform='scale(1.04)';DK1.classList.add('show');DK2.classList.add('show');hint(T.x,T.y)},420)});
function hint(x,y){const z=dg&&dg.mv?zone(x,y):null;DK1.classList.toggle('on',z==='L');DK2.classList.toggle('on',z==='B')}
TB.addEventListener('pointermove',e=>{if(!T||e.pointerId!==T.id)return;
 if(!dg){if(Math.hypot(e.clientX-T.x,e.clientY-T.y)>10){clearTimeout(hold);T=null}return}
 if(Math.hypot(e.clientX-dg.sx,e.clientY-dg.sy)>50)dg.mv=1;TB.style.transform='translate('+(e.clientX-dg.sx)+'px,'+(e.clientY-dg.sy)+'px) scale(1.04)';hint(e.clientX,e.clientY)});
const endDrag=e=>{clearTimeout(hold);if(!T||(e&&e.pointerId!==T.id))return;T=null;if(!dg)return;
 const d=dg;dg=null;sup=1;setTimeout(()=>sup=0,120);DK1.classList.remove('show','on');DK2.classList.remove('show','on');TB.classList.remove('drag');
 const z=e&&e.type==='pointerup'&&d.mv?zone(e.clientX,e.clientY):null,to=z||d.mode,r0=TB.getBoundingClientRect();
 try{TB.releasePointerCapture(d.id)}catch(x){}
 if(to===d.mode){TB.style.transition='transform .26s cubic-bezier(.2,.9,.3,1)';TB.style.transform='none';setTimeout(()=>{TB.style.transition='';window.inkSubPlace&&inkSubPlace()},290);return}
 // تبديل المكان بأنيميشن: الشريط بيتزحلق من مكان السحب لمكانه الجديد
 try{localStorage.setItem('inkpos',to)}catch(x){}
 TB.style.transition='none';TB.style.transform='none';pos();const r1=TB.getBoundingClientRect();
 TB.style.transform='translate('+((r0.left+r0.width/2)-(r1.left+r1.width/2))+'px,'+((r0.top+r0.height/2)-(r1.top+r1.height/2))+'px) scale(.9)';TB.style.opacity='.75';
 void TB.offsetWidth;TB.style.transition='transform .32s cubic-bezier(.2,.9,.25,1.05),opacity .25s';TB.style.transform='none';TB.style.opacity='';
 setTimeout(()=>{TB.style.transition='';window.inkSubPlace&&inkSubPlace()},340)};
TB.addEventListener('pointerup',endDrag);TB.addEventListener('pointercancel',endDrag);
})();
