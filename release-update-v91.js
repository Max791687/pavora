/* PAVORA v91: preserve latest Reel styling after dynamically injected legacy rules.
   Notify installed-PWA users of newer releases without discarding drafts. */
(()=>{
'use strict';
const cssLink=document.querySelector('link[href*="reels-corrected-v90.css"]');
if(cssLink){
 let moving=false;
 const ensureLast=()=>{
  if(moving||cssLink.parentElement!==document.head||document.head.lastElementChild===cssLink)return;
  moving=true;document.head.appendChild(cssLink);moving=false;
 };
 ensureLast();
 // cloud.js, social-suite.js and reel-seek.js inject CSS after page styles load.
 // The same-specificity !important rules must follow those sheets.
 const observer=new MutationObserver(records=>{
  if(!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.tagName==='STYLE'||n.tagName==='LINK'))))return;
  ensureLast();
 });
 observer.observe(document.head,{childList:true});
}
const VERSION='91';
const key='pavora-release-v91';
try{sessionStorage.setItem(key,VERSION)}catch(e){}
const banner=document.createElement('div');
banner.id='pvAppUpdateNotice';
banner.hidden=true;
banner.setAttribute('role','status');
banner.innerHTML='<span>A newer PAVORA update is ready.</span><button type="button" class="pvApplyUpdate">Refresh app</button><button type="button" class="pvDismissUpdate" aria-label="Later">×</button>';
const style=document.createElement('style');
style.textContent=`
#pvAppUpdateNotice{position:fixed;left:50%;bottom:calc(82px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:500;
 width:min(390px,calc(100vw - 24px));padding:12px 13px;display:flex;align-items:center;gap:9px;
 background:#221735;color:#fff;border:1px solid #b880ec;border-radius:13px;
 box-shadow:0 12px 35px #0007;font-size:12px}
#pvAppUpdateNotice[hidden]{display:none!important}
#pvAppUpdateNotice button{border:0;background:#e2cbff;color:#312044;border-radius:8px;padding:8px 10px;font-size:12px;cursor:pointer}
#pvAppUpdateNotice .pvDismissUpdate{background:none;color:#fff;font-size:20px}
`;
document.head.appendChild(style);
document.body.appendChild(banner);
let availableVersion=null,checking=false;
const haveDraft=()=>!!document.querySelector('.pvComposeOpen, #profileEditor:not([hidden])')||
  [...document.querySelectorAll('textarea')].some(el=>document.activeElement===el&&el.value.trim().length>0);
async function check(){
 if(checking||document.hidden||!navigator.onLine)return;checking=true;
 try{
  const response=await fetch('./app-version.json?check='+Date.now(),{cache:'no-store'});
  if(!response.ok)return;
  const data=await response.json();
  const version=Number(data.version)||0;
  if(version>Number(VERSION)){availableVersion=version;banner.hidden=false}
 }catch(e){/* Offline or not yet deployed: retry on next app focus. */}
 finally{checking=false}
}
banner.querySelector('.pvApplyUpdate').onclick=()=>{
 if(haveDraft()&&!confirm('Refresh PAVORA? Unsaved text or an upload may be interrupted.'))return;
 if('serviceWorker' in navigator)navigator.serviceWorker.getRegistration().then(reg=>reg?.update()).catch(()=>{});
 const url=new URL(location.href);url.searchParams.set('pvupdate',String(availableVersion||Date.now()));
 location.replace(url.href);
};
banner.querySelector('.pvDismissUpdate').onclick=()=>{banner.hidden=true};
window.addEventListener('focus',check);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
window.addEventListener('online',check);
setInterval(check,10*60*1000);
setTimeout(check,1200);
})();
