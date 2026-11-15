// InkPad plus: قفل (رقم سري + بصمة) · هدف المذاكرة + التتابع · راحة العين · علامة تحديد النص · تجميعة الهايلايتات PDF
// بيتحمّل بعد extra.js وnative.js
(()=>{
const lsg=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
 lss=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const tst=m=>{let t=document.getElementById('inktoast');if(!t){t=E('div');t.id='inktoast';document.body.append(t)}t.textContent=m;t.hidden=false;clearTimeout(tst.t);tst.t=setTimeout(()=>{t.hidden=true},2800)};

// ================= 1) راحة العين =================
const EYE_OP=[0,.2,.36,.52],EYE_TX=['إيقاف','خفيف','متوسط','قوي'];
const eov=E('div');eov.id='eyeov';document.body.append(eov);
let eye=+lsg('inkeye',0)||0;if(!(eye>=0&&eye<=3))eye=0;
const eyeApply=()=>{eov.style.opacity=EYE_OP[eye];['#m-ey','#h-ey'].forEach(s=>{const b=$(s);if(b){b.textContent='👁 راحة العين: '+EYE_TX[eye];b.classList.toggle('on',eye>0)}})};
const eyeCycle=()=>{eye=(eye+1)%4;lss('inkeye',eye);eyeApply()};
['#m-ey','#h-ey'].forEach(s=>{const b=$(s);b&&(b.onclick=eyeCycle)});eyeApply();

// ================= 2) علامة تحديد النص (بتظهر دايمًا، من غير ما نعتمد على تظليل النظام) =================
const sv=E('div');sv.id='selov';document.body.append(sv);
let svr=0;
function paintSel(){svr=0;sv.textContent='';const s=getSelection();
 if(!s||s.isCollapsed||!s.rangeCount||!NV()||!$('#pgs').contains(s.anchorNode))return;
 const sc=$('#sc').getBoundingClientRect(),f=document.createDocumentFragment(),seen=new Set();let n=0;
 for(const r of s.getRangeAt(0).getClientRects()){if(r.width<2||r.height<2||r.height>90)continue;
  const t=Math.max(r.top,sc.top),b=Math.min(r.bottom,sc.bottom);if(b<=t)continue;
  const key=Math.round(r.left/2)+'_'+Math.round(t/2)+'_'+Math.round(r.width/2)+'_'+Math.round((b-t)/2);if(seen.has(key))continue;seen.add(key);
  const d=E('i');d.style.cssText='left:'+r.left+'px;top:'+t+'px;width:'+r.width+'px;height:'+(b-t)+'px';f.append(d);if(++n>700)break}
 sv.append(f)}
const sched=()=>{svr||(svr=requestAnimationFrame(paintSel))};
document.addEventListener('selectionchange',sched);
$('#sc').addEventListener('scroll',sched,{passive:true});
addEventListener('resize',sched);

// ================= 3) هدف المذاكرة اليومي + التتابع =================
const GK='inkgoal',DNK='inkdone';
const two=n=>String(n).padStart(2,'0'),dayKey=d=>d.getFullYear()+'-'+two(d.getMonth()+1)+'-'+two(d.getDate()),
 addD=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n),
 pk=k=>{const a=k.split('-');return new Date(+a[0],+a[1]-1,+a[2])};
const goalH=()=>{const g=+lsg(GK,0);return g>0?g:0},studied=k=>+(lsg('inkstudy',{})[k]||0);
const fdur=s=>{const M=Math.round(s/60);if(!M)return s>0?'أقل من دقيقة':'0 د';const h=M/60|0,m=M%60;return h?h+' س'+(m?' '+m+' د':''):m+' د'};
const fgoal=g=>+g.toFixed(2)+' ساعة';
function streak(){const D=new Set(lsg(DNK,[])),n=new Date(),today=D.has(dayKey(n));let cur=0;
 for(let i=today?0:1;i<4000;i++){if(D.has(dayKey(addD(n,-i))))cur++;else break}
 let best=0,run=0,prev=null;for(const k of[...D].sort()){const dt=pk(k);run=prev&&Math.round((dt-prev)/864e5)===1?run+1:1;if(run>best)best=run;prev=dt}
 return{cur,best,today,D}}
function homeLbl(){const b=$('#h-st');if(!b)return;const s=streak();b.textContent='📊 وقت المذاكرة والهدف'+(goalH()&&s.cur?'  ·  🔥 '+s.cur:'')}
function chkGoal(){const g=goalH();if(!g)return;const k=dayKey(new Date());if(studied(k)<g*3600)return;
 const D=lsg(DNK,[]);if(D.includes(k))return;D.push(k);lss(DNK,D.sort().slice(-800));homeLbl();
 tst('🎉 حققت هدف النهاردة! 🔥 '+streak().cur+' يوم متتالي');if(navigator.vibrate)navigator.vibrate([120,60,120]);const c=$('#gcd');c&&!$('#stp').hidden&&gcard()}
setInterval(chkGoal,10000);setTimeout(chkGoal,1500);homeLbl();
async function setGoal(){const g=goalH(),v=await inkAsk('كام ساعة عاوز تذاكر كل يوم؟\n(مثلاً 2 أو 1.5 — سيبها فاضية لو عاوز تلغي الهدف)',g?String(g):'');if(v===null)return;
 const t=String(v).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[٫,،]/g,'.').trim();
 if(!t){lss(GK,0);homeLbl();gcard();return}
 const n=parseFloat(t);if(!(n>0&&n<=16))return alert('اكتب رقم من 0.25 لـ 16 ساعة');
 lss(GK,Math.round(n*4)/4);chkGoal();homeLbl();gcard()}
function gcard(){const b=$('#stb');if(!b)return;const old=$('#gcd');old&&old.remove();const c=E('div','gc');c.id='gcd';
 const g=goalH(),n=new Date(),k=dayKey(n),s=studied(k),st=streak();
 const h=E('h4');h.textContent='🎯 هدف المذاكرة اليومي';c.append(h);
 if(!g){const p=E('p','gn');p.textContent='لسه ما حددتش هدف. حدّد كام ساعة عاوز تذاكر كل يوم، وهنحسبلك الأيام المتتالية اللي حققت فيها الهدف.';c.append(p)}
 else{const p=Math.min(1,s/(g*3600)),row=E('div','gp','<div><i></i></div><b></b>');row.querySelector('i').style.width=Math.round(p*100)+'%';
  row.querySelector('b').textContent=fdur(s)+' من '+fgoal(g);if(p>=1)row.classList.add('ok');c.append(row);
  const sr=E('div','gs','<div><b></b><small>أيام متتالية</small></div><div><b></b><small>أفضل تتابع</small></div>');
  const bb=sr.querySelectorAll('b');bb[0].textContent='🔥 '+st.cur;bb[1].textContent='🏆 '+st.best;c.append(sr);
  if(!st.today&&st.cur>0){const w=E('p','gn');w.textContent='⚠ كمّل هدف النهاردة عشان التتابع ما يتقطعش.';c.append(w)}
  const dd=E('div','gd');for(let i=13;i>=0;i--){const d=addD(n,-i),x=E('span',(st.D.has(dayKey(d))?'ok':'')+(i===0?' td':''));x.textContent=d.getDate();x.title=d.toLocaleDateString('ar-EG');dd.append(x)}c.append(dd)}
 const btn=E('button','btn');btn.textContent=g?'✏ غيّر الهدف':'➕ حدّد هدف';btn.onclick=setGoal;c.append(btn);b.prepend(c)}
['#h-st','#m-st'].forEach(s=>{const b=$(s);if(!b)return;const o=b.onclick;b.onclick=function(e){const r=o&&o.call(this,e);gcard();return r}});

// ================= 4) القفل: رقم سري + بصمة =================
const LKK='inklock',LK=()=>lsg(LKK,null),UN={};
const NP=()=>{const C=window.Capacitor;return C&&C.isNativePlatform&&C.isNativePlatform()&&C.Plugins&&C.Plugins.InkLock||null};
let _av=null;
const bioAvail=async()=>{if(_av!==null)return _av;const p=NP();if(!p)return _av=false;try{const r=await p.available();return _av=!!(r&&r.ok)}catch(e){return _av=false}};
let authing=0;
async function bioAuth(sub){const p=NP();if(!p)return false;authing++;try{const r=await p.authenticate({title:'InkPad',subtitle:sub||'أكّد بالبصمة'});return !!(r&&r.ok)}catch(e){return false}finally{setTimeout(()=>{authing=Math.max(0,authing-1)},600)}}
async function hashPin(pin,salt){try{const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pin));return[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=5381;const s=salt+':'+pin;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return'x'+h}}
async function pbk(pin,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']),b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:150000,hash:'SHA-256'},k,256);return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
// v:2 = PBKDF2. الأرقام القديمة (SHA-256 بسيط) بتتحدّث لوحدها أول ما تتكتب صح
const chkPin=async p=>{const L=LK();if(!L)return false;
 if(L.v===2){try{return(await pbk(p,L.s))===L.h}catch(e){return false}}
 const ok=(await hashPin(p,L.s))===L.h;if(ok){try{const h=await pbk(p,L.s);lss(LKK,{...L,v:2,h})}catch(e){}}return ok};
const FK='inklockf',fl=()=>lsg(FK,{n:0,u:0}),waitS=()=>Math.max(0,Math.ceil((fl().u-Date.now())/1000));
const FP='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>';
let lkCancel=null;
// شاشة الرقم السري. لو فيه o.check بترجّع true لما يتأكد، وغير كده بترجّع الرقم نفسه. null = إلغاء
function pad(o){return new Promise(res=>{const old=document.getElementById('lkov');old&&old.remove();
 const el=E('div','','<div class="lkc"><div class="lki">🔒</div><h3></h3><p class="lks"></p><div class="lkd"></div><p class="lke"></p><div class="lkp"></div><div class="lkb"></div></div>');el.id='lkov';
 const q=s=>el.querySelector(s),dots=q('.lkd'),err=q('.lke');q('h3').textContent=o.title||'اكتب الرقم السري';q('.lks').textContent=o.sub||'';
 let v='',busy=0;
 const draw=()=>{dots.textContent='';for(let i=0;i<Math.max(4,v.length);i++)dots.append(E('i',i<v.length?'on':''))};
 const done=r=>{document.removeEventListener('keydown',kd,true);lkCancel=null;el.remove();if(r)document.documentElement.classList.remove('locked');res(r)};
 const bio=async()=>{if(!o.bio)return;const ok=await bioAuth(o.sub||o.title);if(ok&&document.getElementById('lkov')===el){lss(FK,{n:0,u:0});done(o.check?true:null)}};
 const submit=async()=>{if(busy||v.length<4)return;busy=1;const x=v;
  if(!o.check){done(x);return}
  const w=waitS();if(w>0){err.textContent='محاولات كتير. استنى '+w+' ثانية';v='';draw();busy=0;return}
  let ok=false;try{ok=await o.check(x)}catch(e){}
  if(ok){lss(FK,{n:0,u:0});done(true);return}
  const f=fl();f.n++;if(f.n>=5){f.u=Date.now()+30000;f.n=0}lss(FK,f);
  err.textContent=f.u>Date.now()?'محاولات كتير. استنى 30 ثانية':'الرقم غلط';navigator.vibrate&&navigator.vibrate(80);
  dots.classList.add('sh');setTimeout(()=>dots.classList.remove('sh'),400);v='';draw();busy=0};
 const add=c=>{if(busy||v.length>=8)return;v+=c;err.textContent='';draw()},del=()=>{if(busy)return;v=v.slice(0,-1);draw()};
 const kp=q('.lkp');
 [...'123456789','b','0','d'].forEach(k=>{const b=E('button','lkk');
  if(k==='b'){if(o.bio){b.innerHTML=FP;b.setAttribute('aria-label','بصمة');b.onclick=bio}else b.className='lkk e'}
  else if(k==='d'){b.textContent='⌫';b.setAttribute('aria-label','مسح');b.onclick=del}
  else{b.textContent=k;b.onclick=()=>add(k)}kp.append(b)});
 const bt=q('.lkb'),ok=E('button','btn p');ok.textContent='✓ تأكيد';ok.onclick=submit;bt.append(ok);
 if(o.cancel){const c=E('button','btn');c.textContent='إلغاء';c.onclick=()=>done(null);bt.append(c);lkCancel=()=>done(null)}else lkCancel=null;
 const kd=e=>{if(/^[0-9]$/.test(e.key)){e.preventDefault();add(e.key)}else if(e.key==='Backspace'){e.preventDefault();del()}else if(e.key==='Enter'){e.preventDefault();submit()}else if(e.key==='Escape'&&o.cancel){e.preventDefault();done(null)}};
 document.addEventListener('keydown',kd,true);draw();document.body.append(el);if(o.bio)setTimeout(bio,350)})}
async function verify(o={}){const L=LK();if(!L)return true;const bio=!!L.b&&await bioAvail();
 return(await pad({title:o.title||'اكتب الرقم السري',sub:o.sub,bio,cancel:o.cancel!==false,check:chkPin}))===true}
async function newPin(title){const a=await pad({title:title||'اختار رقم سري (4 أرقام على الأقل)',cancel:true});if(a==null)return null;
 const b=await pad({title:'اكتب الرقم تاني للتأكيد',cancel:true});if(b==null)return null;
 if(a!==b){alert('الرقمين مش زي بعض. جرّب تاني');return newPin(title)}return a}
async function savePin(p){const old=LK()||{},s=(()=>{try{return[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return Math.random().toString(36).slice(2)+Date.now().toString(36)}})();
 let v=0,h;try{h=await pbk(p,s);v=2}catch(e){h=await hashPin(p,s)}lss(LKK,{s,h,v,b:old.b?1:0,a:old.a?1:0})}
// قفل ملف معيّن (الزرار 🔒 جنب اسم الملف)
window.inkLockToggle=async d=>{if(!LK()){if(!await inkYN('لازم تعمل رقم سري الأول عشان تقفل الملفات. تعمله دلوقتي؟'))return;const p=await newPin();if(!p)return;await savePin(p);
  if(await bioAvail()&&await inkYN('تفعّل فتح الملفات بالبصمة كمان؟')&&await bioAuth('تفعيل البصمة')){const L=LK();L.b=1;lss(LKK,L)}}
 if(d.lk){if(!await verify({title:'فك قفل الملف',sub:d.n}))return;delete d.lk}else{d.lk=1;UN[d.id]=0}
 await dbPut(d);home()};
// أي فتح لملف مقفول لازم يعدّي من هنا (من القايمة / المشاركة / التنقل بين الملفات)
{const _o=openDoc;openDoc=async function(id){let lk=null;
  try{const L=LK();if(L&&!(S.d&&S.d.id===id&&!$('#ed').hidden)){const d=await tx('d','readonly',s=>s.get(id));if(d&&d.lk&&!(UN[id]&&Date.now()-UN[id]<180000))lk=d}}catch(e){}
  if(lk){if(!await verify({title:'الملف مقفول 🔒',sub:lk.n}))return;UN[id]=Date.now()}
  return _o.apply(this,arguments)}}
// قفل التطبيق كله عند الفتح / الرجوع من الخلفية
async function lockApp(){const L=LK();if(!L||document.getElementById('lkov'))return;document.documentElement.classList.add('locked');
 const bio=!!L.b&&await bioAvail();await pad({title:'InkPad مقفول',bio,cancel:false,check:chkPin});for(const k in UN)delete UN[k]}
async function relockDoc(){if(document.getElementById('lkov'))return;const ok=await verify({title:'الملف مقفول 🔒',sub:S.d&&S.d.n});if(!ok)$('#bk').click();else if(S.d)UN[S.d.id]=Date.now()}
let hidT=0;
document.addEventListener('visibilitychange',()=>{if(document.hidden){hidT=Date.now();return}
 if(!hidT||authing)return;const L=LK();if(!L||Date.now()-hidT<20000)return;hidT=0;
 if(L.a)lockApp();else if(S.d&&S.d.lk&&!$('#ed').hidden)relockDoc()});
{const ob=window.inkBack;window.inkBack=()=>{if(document.getElementById('lkov')){if(lkCancel){lkCancel();return true}return false}return ob?ob():false}}
window.inkVerify=verify;window.inkLockReady=1;
{const L=LK();if(L&&L.a)lockApp();else document.documentElement.classList.remove('locked')}

// شاشة إعدادات القفل
async function lockSet(){const old=$('#lks');old&&old.remove();
 const o=E('div','ov','<div class="ph"><b>🔒 القفل</b><button class="x">✕</button></div><div class="ob"></div>');o.id='lks';document.body.append(o);o.querySelector('.x').onclick=()=>o.remove();
 const body=o.querySelector('.ob'),av=await bioAvail();
 const row=(t,s,f)=>{const b=E('button','btn tb1','<span></span><small></small>');b.firstChild.textContent=t;b.lastChild.textContent=s||'';b.onclick=f;body.append(b);return b};
 const note=t=>{const p=E('p','gn');p.textContent=t;body.append(p)};
 const R=async()=>{body.textContent='';const L=LK();
  if(!L){note('القفل مش مفعّل. اعمل رقم سري (وبصمة لو جهازك بيدعمها)، وبعدين تقدر تقفل أي ملف بزرار 🔒 جنب اسمه، أو تقفل التطبيق كله عند الفتح.');
   row('🔒 تفعيل القفل','',async()=>{const p=await newPin();if(!p)return;await savePin(p);
    if(av&&await inkYN('تفعّل الفتح بالبصمة كمان؟')&&await bioAuth('تفعيل البصمة')){const x=LK();x.b=1;lss(LKK,x)}R()});return}
  row('👆 الفتح بالبصمة',av?(L.b?'شغال':'إيقاف'):'مش متاحة',async()=>{if(!av)return alert('البصمة بتشتغل في تطبيق الأندرويد على جهاز فيه بصمة متسجّلة. دلوقتي الرقم السري هو المتاح.');
   const x=LK();if(x.b){x.b=0;lss(LKK,x)}else{if(!await bioAuth('تفعيل البصمة'))return;x.b=1;lss(LKK,x)}R()});
  row('📱 قفل التطبيق كله عند الفتح',L.a?'شغال':'إيقاف',async()=>{const x=LK();if(x.a){if(!await verify({title:'اكتب الرقم السري'}))return;x.a=0}else x.a=1;lss(LKK,x);R()});
  row('🔑 تغيير الرقم السري','',async()=>{if(!await verify())return;const p=await newPin('اختار الرقم السري الجديد');if(!p)return;await savePin(p);tst('اتغيّر الرقم السري');R()});
  row('🗑 إيقاف القفل نهائيًا','',async()=>{if(!await verify())return;if(!await inkYN('حذف الرقم السري وفتح كل الملفات؟','نعم','لا',1))return;try{localStorage.removeItem(LKK);localStorage.removeItem(FK)}catch(e){}R();home()});
  const n=(await tx('d','readonly',s=>s.getAll())).filter(d=>d.lk).length;
  note('الملفات المقفولة: '+n+'. لقفل/فك ملف اضغط 🔒 جنب اسمه في "ملفاتي". بعد 5 محاولات غلط بتستنى 30 ثانية. ملحوظة: القفل بيمنع الفتح من جوه التطبيق، لكن الملفات نفسها مش مشفّرة على التخزين.')};
 R()}
$('#h-lk')&&($('#h-lk').onclick=lockSet);

// ================= 5) تجميعة الهايلايتات في PDF واحد =================
const hcOn=()=>lsg('inkhc',0)==1;
function hcUI(){const on=hcOn(),b=$('#m-hc'),c=$('#m-hcb');if(b){b.textContent='📚 تجميعة الهايلايتات: '+(on?'شغال':'إيقاف');b.classList.toggle('on',on)}if(c)c.hidden=!on}
$('#m-hc').onclick=()=>{lss('inkhc',hcOn()?0:1);hcUI()};hcUI();
$('#m-hcb').onclick=()=>compileHl();
{const _p=plR;plR=function(){const r=_p.apply(this,arguments);
  if(tab==='hl'&&hcOn()){const b=$('#plb'),x=E('button');x.textContent='📄 اعمل PDF بالهايلايتات';x.onclick=()=>{$('#pl').hidden=true;compileHl()};b.prepend(x)}return r}}
function drawComp(items,name){
 const PW=1240,PH=1754,M=96,LH=58,FS=36,cvs=[],FONT=s=>s+'px "Noto Naskh Arabic","Noto Sans Arabic","Segoe UI",Tahoma,system-ui,sans-serif';let cx,y;
 const np=()=>{const c=document.createElement('canvas');c.width=PW;c.height=PH;cx=c.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,PW,PH);cx.textBaseline='middle';cvs.push(c);y=M};
 const isA=t=>(t.match(/[\u0600-\u06FF]/g)||[]).length>t.replace(/\s/g,'').length*.3;
 const dir=r=>{cx.direction=r?'rtl':'ltr';cx.textAlign=r?'right':'left'};
 const wrap=(t,w)=>{cx.font=FONT(FS);const out=[];let cur='';for(const wd of t.split(/\s+/)){if(!wd)continue;const nx=cur?cur+' '+wd:wd;if(cx.measureText(nx).width>w&&cur){out.push(cur);cur=wd}else cur=nx}if(cur)out.push(cur);return out};
 np();
 cx.fillStyle='#0f172a';cx.font='bold '+FONT(56);dir(1);cx.fillText('تجميعة الهايلايتات',PW-M,y+30);y+=76;
 cx.fillStyle='#475569';cx.font=FONT(32);dir(isA(name));cx.fillText(name.length>60?name.slice(0,60)+'…':name,isA(name)?PW-M:M,y+20);y+=48;
 cx.fillStyle='#94a3b8';cx.font=FONT(28);dir(1);cx.fillText(items.length+' هايلايت · '+new Date().toLocaleDateString('ar-EG'),PW-M,y+16);y+=44;
 cx.fillStyle='#e2e8f0';cx.fillRect(M,y,PW-2*M,3);y+=36;
 for(const it of items){const rtl=isA(it.t),lines=wrap(it.t,PW-2*M-44);if(y+LH*Math.min(2,lines.length)+60>PH-M-20)np();
  for(const ln of lines){if(y+LH>PH-M-20)np();
   cx.font=FONT(FS);dir(rtl);const x=rtl?PW-M-26:M+26,tw=cx.measureText(ln).width;
   cx.fillStyle=it.c;cx.fillRect(rtl?PW-M-8:M,y,8,LH);
   cx.fillStyle=it.c+'66';cx.fillRect(rtl?x-tw-10:x-10,y+4,tw+20,LH-8);
   cx.fillStyle='#111827';cx.fillText(ln,x,y+LH/2);y+=LH}
  cx.font=FONT(26);cx.fillStyle='#64748b';dir(rtl);cx.fillText('ص '+it.p,rtl?PW-M-26:M+26,y+22);y+=62}
 cvs.forEach((c,i)=>{const x=c.getContext('2d');x.font=FONT(24);x.fillStyle='#94a3b8';x.direction='ltr';x.textAlign='center';x.textBaseline='middle';x.fillText((i+1)+' / '+cvs.length,PW/2,PH-44)});
 return cvs}
async function compileHl(){$('#mm').hidden=true;if(!S.d||$('#ed').hidden)return;
 const L=[];S.pg.forEach((_,i)=>(S.d.s[i]||[]).forEach(o=>{if(o.t==='hr'&&o.tx&&o.tx.trim())L.push({i,o,y:o.rs&&o.rs[0]?o.rs[0][1]:0})}));
 L.sort((a,b)=>a.i-b.i||a.y-b.y);
 if(!L.length)return alert('مفيش هايلايت نصي في الملف ده. حدّد نص بزر 🖍 وبعدين اختار لون.');
 window.inkBusy&&inkBusy(true,'جاري عمل PDF الهايلايتات…');
 try{const cvs=drawComp(L.map(x=>({t:x.o.tx.trim(),c:/^#[0-9a-f]{6}$/i.test(x.o.c)?x.o.c:'#facc15',p:x.i+1})),S.d.n),D=await PDFLib.PDFDocument.create();
  for(const c of cvs){const im=await D.embedJpg(await(await fetch(c.toDataURL('image/jpeg',.9))).arrayBuffer());D.addPage([595,842]).drawImage(im,{x:0,y:0,width:595,height:842});c.width=c.height=0}
  const by=await D.save(),id='p'+Date.now();
  await tx('f','readwrite',s=>s.put(by.buffer.slice(by.byteOffset,by.byteOffset+by.byteLength),id));
  await dbPut({id,n:'هايلايتات — '+S.d.n,k:'pdf',s:{},u:Date.now()})}
 catch(e){window.inkBusy&&inkBusy(false);return alert('فشل عمل الـPDF: '+e.message)}
 window.inkBusy&&inkBusy(false);
 const del=await inkYN('اتعمل PDF فيه '+L.length+' هايلايت وبقى في قايمة ملفاتك.\n\nحذف الهايلايتات من الملف ده؟','نعم','لا',1);
 if(!del){tst('📚 اتحفظ PDF الهايلايتات. الهايلايتات لسه موجودة في الملف');return}
 const by={};L.forEach(x=>(by[x.i]=by[x.i]||[]).push(x.o));
 for(const i in by){const l=S.d.s[i]||[],rm=by[i].filter(o=>l.includes(o));rm.forEach(o=>l.splice(l.indexOf(o),1));if(rm.length)push({a:'del',i:+i,o:rm})}
 tst('اتحذفت '+L.length+' هايلايت (تقدر تتراجع بزرار ↩)')}
window.inkCompileHl=compileHl;
})();
