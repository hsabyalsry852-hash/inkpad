// Native bridge for the Android build only. Loaded after extra.js.
(()=>{
const C=window.Capacitor;
if(!C||!C.isNativePlatform||!C.isNativePlatform()||!C.Plugins)return;
const Ink=C.Plugins.InkOpen,FS=C.Plugins.Filesystem,SH=C.Plugins.Share;
const bytes=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};

// 1) PDF opened from WhatsApp / Files / share sheet: ask native for a pending file
let busy=0,warned=0;
const poll=async()=>{
  if(busy||!Ink)return;busy=1;
  try{
    const r=await Ink.getPending();
    if(r&&r.error)alert('خطأ في قراءة الملف: '+r.error);
    else if(r&&r.data){
      const id=await imp(new File([bytes(r.data)],r.name||'file.pdf',{type:'application/pdf'}));
      await openDoc(id);
    }
  }catch(x){if(!warned++)alert('InkOpen: '+(x&&x.message||x))}
  busy=0;
};
const burst=()=>{let n=0;const t=setInterval(()=>{poll();if(++n>24)clearInterval(t)},500)};
burst();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)burst()});

// 2) Downloads (export PDF / backup): WebView ignores blob downloads, so use the share sheet
const b64=blob=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=no;r.readAsDataURL(blob)});
const orig=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){
  if(this.download&&/^blob:/.test(this.href)&&FS&&SH){
    const name=this.download;
    fetch(this.href).then(r=>r.blob()).then(b64).then(async data=>{
      const f=await FS.writeFile({path:name,data,directory:'CACHE'});
      await SH.share({title:name,url:f.uri,dialogTitle:'حفظ / مشاركة'});
    }).catch(x=>{if(!/cancel/i.test(String(x&&x.message||x)))alert('تعذر الحفظ: '+(x&&x.message||x))});
    return;
  }
  return orig.apply(this,arguments);
};
// 3) Android back button: called from MainActivity. Returns true if the page handled it.
window.inkBack=()=>{
  const pops=[...document.querySelectorAll('.pop,#mm')].filter(p=>!p.hidden);
  if(pops.length){pops.forEach(p=>p.hidden=true);return true}
  const ed=document.getElementById('ed'),bk=document.getElementById('bk');
  if(ed&&!ed.hidden&&bk){bk.click();return true}
  return false;
};
})();
