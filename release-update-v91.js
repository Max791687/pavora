/* PAVORA v91: preserve latest Reel styling after dynamically injected legacy rules.
   Notify installed-PWA users of newer releases without discarding drafts. */
(()=>{
'use strict';
const cssLink=document.querySelector('link[href*="reels-reference-v93.css"]');
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
/* PAVORA v115: one release notice per installed browser/device and version.
   A dismissal is stored persistently on this device; a future version has a new key.
   A newer deployed version also prompts while the old app is still open. */
const VERSION=116;
const RELEASE_KEY_PREFIX='pavora-update-seen-';
const LEGACY_BANNER_ID='pvAppUpdateNotice';
const banner=document.createElement('section');
banner.id=LEGACY_BANNER_ID;
banner.hidden=true;
banner.setAttribute('role','dialog');
banner.setAttribute('aria-modal','false');
banner.setAttribute('aria-label','PAVORA app update');
banner.innerHTML='<div class="pvReleaseIcon" aria-hidden="true">✦</div><div class="pvReleaseCopy"><strong>New PAVORA update</strong><span class="pvReleaseDescription">A smoother, better PAVORA experience is ready.</span></div><button type="button" class="pvApplyUpdate">Update</button><button type="button" class="pvDismissUpdate" aria-label="Close update notice">×</button>';
const style=document.createElement('style');
style.textContent=`
#pvAppUpdateNotice{
 position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));
 z-index:501;width:min(450px,calc(100vw - 24px));transform:translateX(-50%);
 display:flex;align-items:center;gap:10px;padding:13px;
 border-radius:19px;border:1px solid rgba(172,120,219,.4);
 background:rgba(248,242,255,.97);color:#31213c;
 -webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
 box-shadow:0 18px 45px rgba(57,27,85,.23);
}
#pvAppUpdateNotice[hidden]{display:none!important}
#pvAppUpdateNotice .pvReleaseIcon{width:39px;height:39px;display:grid;place-items:center;flex:0 0 39px;background:#783bbd;color:white;border-radius:13px;font-size:25px}
#pvAppUpdateNotice .pvReleaseCopy{display:flex;flex:1 1 auto;flex-direction:column;gap:3px;min-width:0}
#pvAppUpdateNotice .pvReleaseCopy strong{font-size:13px;font-weight:800;color:#2b1b3a;-webkit-text-fill-color:#2b1b3a}
#pvAppUpdateNotice .pvReleaseCopy span{font-size:11px;line-height:1.4;color:#635070;-webkit-text-fill-color:#635070;overflow-wrap:anywhere}
#pvAppUpdateNotice button{flex:none;cursor:pointer;border-radius:11px;min-height:37px;font-size:12px;font-weight:800}
#pvAppUpdateNotice .pvApplyUpdate{background:#783bbd;color:white;border:0;padding:8px 12px;-webkit-text-fill-color:white}
#pvAppUpdateNotice .pvDismissUpdate{background:transparent;color:#563668;border:0;padding:4px 8px;font-size:23px;-webkit-text-fill-color:#563668}
@media(max-width:380px){#pvAppUpdateNotice{gap:6px;padding:9px}#pvAppUpdateNotice .pvReleaseIcon{display:none}#pvAppUpdateNotice .pvApplyUpdate{padding:7px 8px}}
`;
document.head.appendChild(style);document.body.appendChild(banner);
let displayedVersion=null,checking=false,availableVersion=null;
const storageKey=v=>RELEASE_KEY_PREFIX+String(v);
function alreadySeen(version){
 try{return localStorage.getItem(storageKey(version))==='1'}
 catch(e){return false}
}
function remember(version){
 if(!version)return;
 try{localStorage.setItem(storageKey(version),'1')}catch(e){}
}
function show(version,notes){
 if(!version||alreadySeen(version))return;
 displayedVersion=version;
 availableVersion=version>VERSION?version:null;
 banner.querySelector('.pvReleaseDescription').textContent=
   notes||('Version '+version+' includes improvements and fixes.');
 banner.querySelector('.pvApplyUpdate').textContent=version>VERSION?'Update':'Got it';
 banner.hidden=false;
}
function dismiss(){
 if(displayedVersion)remember(displayedVersion);
 banner.hidden=true;
 displayedVersion=null;
}
const haveDraft=()=>!!document.querySelector('.pvComposeOpen, #profileEditor:not([hidden])')||
 [...document.querySelectorAll('textarea')].some(el=>document.activeElement===el&&el.value.trim().length>0);
banner.querySelector('.pvDismissUpdate').onclick=dismiss;
banner.querySelector('.pvApplyUpdate').onclick=()=>{
 const v=displayedVersion;
 if(!v)return;
 if(v<=VERSION){dismiss();return}
 if(haveDraft()&&!confirm('Refresh PAVORA? Unsaved text or an upload may be interrupted.'))return;
 remember(v);
 if('serviceWorker' in navigator)navigator.serviceWorker.getRegistration().then(reg=>reg?.update()).catch(()=>{});
 const url=new URL(location.href);url.searchParams.set('pvupdate',String(v));
 location.replace(url.href);
};
async function check(){
 if(checking||document.hidden||!navigator.onLine)return;
 checking=true;
 try{
  const response=await fetch('./app-version.json?check='+Date.now(),{cache:'no-store'});
  if(!response.ok)return;
  const data=await response.json();
  const deployed=Number(data.version);
  if(!Number.isSafeInteger(deployed)||deployed<1)return;
  // Do not announce an uninstalled newer release over an already displayed one.
  if(!banner.hidden)return;
  if(deployed>VERSION)show(deployed,'A new PAVORA version is ready. Refresh to get the latest features.');
  else if(deployed===VERSION)show(deployed,String(data.notes||'Latest improvements and fixes are available.'));
 }catch(e){/* Retry on next focus/online. No fake update notices. */}
 finally{checking=false}
}
window.addEventListener('focus',check);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
window.addEventListener('online',check);
setInterval(check,10*60*1000);
setTimeout(check,1100);
})();
