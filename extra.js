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
