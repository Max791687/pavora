/* PAVORA v94 — combined usability & reliability pack.
 * Completely client-side; no modification to authentication, public posts,
 * WebRTC calling, direct messages, Reels playback or Supabase tables.
 */
(()=>{
'use strict';
const kit=window.PVKit;
const uid=()=>kit?.getUser?.()?.id||'guest';
const prefKey=()=> 'pavora-app-prefs-v94:'+uid();
const defaults={hideDemos:false,reduceMotion:false,dataSaver:false};
const fromStore=()=>{
 try{const stored=JSON.parse(localStorage.getItem(prefKey())||'{}');const existingSaver=localStorage.getItem('pavora-data-saver')==='on';return {...defaults,dataSaver:existingSaver,...stored}}catch{return {...defaults,dataSaver:localStorage.getItem('pavora-data-saver')==='on'}}
};
let preferences=fromStore(),lastUid=uid();
const css=document.createElement('style');
css.textContent=`
#pv94Connectivity{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);z-index:550;
 width:max-content;max-width:calc(100vw - 22px);padding:8px 13px;border-radius:99px;
 color:#fff;background:#45304d;border:1px solid #d1a9eb;font:600 12px/1.4 system-ui,sans-serif;
 box-shadow:0 8px 25px #0004;text-align:center}
#pv94Connectivity[hidden]{display:none!important}
body.pv94HideDemos #posts .pvDailyCard{display:none!important}
html.pv94ReducedMotion *,html.pv94ReducedMotion *::before,html.pv94ReducedMotion *::after{
 animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
#pv94SettingsOverlay{position:fixed;inset:0;z-index:490;background:#1b122aa3;display:grid;place-items:center;
 padding:18px;backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}
#pv94SettingsOverlay[hidden]{display:none!important}
#pv94SettingsOverlay .pv94Panel{width:min(440px,100%);max-height:min(650px,85dvh);overflow-y:auto;border-radius:23px;
 background:#fdfaff;color:#1d1730;padding:20px;box-shadow:0 25px 65px #0006;font-family:system-ui,sans-serif}
#pv94SettingsOverlay .pv94Heading{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:4px}
#pv94SettingsOverlay .pv94Heading h2{font-size:20px;color:#261536;margin:0}
#pv94SettingsOverlay .pv94Close{background:#ede6f8;color:#41275f;border:0;border-radius:10px;padding:8px 12px;font-size:14px}
#pv94SettingsOverlay .pv94Description{font-size:12px;color:#756883;line-height:1.5;margin:5px 0 15px}
#pv94SettingsOverlay .pv94Option{display:flex;align-items:center;justify-content:space-between;gap:15px;
 padding:13px 0;border-top:1px solid #e9e0f1;cursor:pointer}
#pv94SettingsOverlay .pv94Option strong{display:block;font-size:14px;color:#241831}
#pv94SettingsOverlay .pv94Option small{display:block;color:#71677c;font-size:11px;line-height:1.4;margin-top:4px}
#pv94SettingsOverlay .pv94Option input{width:20px;height:20px;flex:0 0 20px;accent-color:#943edf}
#pv94SettingsOverlay .pv94Foot{color:#766b7e;font-size:11px;line-height:1.5;padding-top:13px;border-top:1px solid #e9e0f1}
#pv94SettingsLaunch{display:block;width:100%;max-width:100%;border:1px solid #e1cff0!important;background:#f0e6fb!important;
 color:#482670!important;border-radius:11px!important;padding:11px 13px!important;margin:8px 0!important;
 font-size:13px!important;text-align:left!important;font-weight:750!important;cursor:pointer}
.pv94MediaRetry{display:flex;align-items:center;justify-content:center;gap:9px;background:#ede9f5!important;
 color:#55386c!important;border:0;padding:14px 12px;width:100%;min-height:125px;cursor:pointer;font-size:13px}
.pv94MediaRetry[hidden]{display:none!important}
.pv94FailedMedia{display:none!important}
#pv94BackTop{position:fixed;right:15px;bottom:calc(76px + env(safe-area-inset-bottom,0px));
 z-index:45;border:1px solid #d8c6ec;background:#f9f3ffed;color:#563375;box-shadow:0 6px 18px #4a2e7d2b;
 border-radius:100%;width:42px;height:42px;display:grid;place-items:center;cursor:pointer;font-size:19px}
#pv94BackTop[hidden]{display:none!important}
body.pvReelsMode #pv94BackTop,body.pvMessagesMode #pv94BackTop{display:none!important}
`;
document.head.append(css);
const connectivity=document.createElement('div');connectivity.id='pv94Connectivity';connectivity.hidden=true;
connectivity.setAttribute('role','status');document.body.append(connectivity);
let offlineTimer=null;
function connection(){
 if(!navigator.onLine){connectivity.textContent='You are offline · New posts and messages may not load';connectivity.hidden=false;return}
 if(!connectivity.hidden){connectivity.textContent='Back online';clearTimeout(offlineTimer);offlineTimer=setTimeout(()=>connectivity.hidden=true,2300)}
}
window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
const overlay=document.createElement('div');overlay.id='pv94SettingsOverlay';overlay.hidden=true;
overlay.innerHTML='<section class="pv94Panel" role="dialog" aria-modal="true" aria-labelledby="pv94Title"><div class="pv94Heading"><h2 id="pv94Title">App preferences</h2><button type="button" class="pv94Close" aria-label="Close preferences">✕</button></div><p class="pv94Description">Customize PAVORA on this device. Your account data and posts are unchanged.</p></section>';
document.body.append(overlay);
const panel=overlay.querySelector('.pv94Panel'),close=overlay.querySelector('.pv94Close');
const options=[
 ['hideDemos','Hide virtual creator posts','Show only real posts in For You; virtual creators remain labeled and available when enabled.'],
 ['reduceMotion','Reduce app animations','Limit page transitions and animated visual effects.'],
 ['dataSaver','Save mobile data','Use the existing Creator Hub data-saver preference.']
];
function apply(){
 document.body.classList.toggle('pv94HideDemos',preferences.hideDemos);
 document.documentElement.classList.toggle('pv94ReducedMotion',preferences.reduceMotion);
 try{localStorage.setItem('pavora-data-saver',preferences.dataSaver?'on':'off')}catch(e){}
}
function save(){
 try{localStorage.setItem(prefKey(),JSON.stringify(preferences))}catch(e){}
 apply();
}
const inputs={};
for(const [key,title,desc] of options){
 const label=document.createElement('label');label.className='pv94Option';
 const wrap=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small'),toggle=document.createElement('input');
 strong.textContent=title;small.textContent=desc;wrap.append(strong,small);toggle.type='checkbox';toggle.checked=!!preferences[key];
 toggle.onchange=()=>{preferences[key]=toggle.checked;save()};
 label.append(wrap,toggle);panel.append(label);inputs[key]=toggle;
}
const foot=document.createElement('p');foot.className='pv94Foot';
foot.textContent='Preferences stay on this browser. Photos and reels are not deleted. Device-level Reduced Motion and Data Saver settings also remain available.';
panel.append(foot);
const launch=document.createElement('button');launch.id='pv94SettingsLaunch';launch.type='button';launch.textContent='⚙ App preferences';
let previousFocus=null;
function openSettings(){
 lastUid=uid();preferences=fromStore();apply();
 for(const key of Object.keys(inputs))inputs[key].checked=!!preferences[key];
 previousFocus=document.activeElement;overlay.hidden=false;close.focus();
}
function closeSettings(){overlay.hidden=true;previousFocus?.focus?.()}
launch.onclick=openSettings;close.onclick=closeSettings;
overlay.addEventListener('click',e=>{if(e.target===overlay)closeSettings()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden){e.preventDefault();closeSettings()}});
function mountLaunch(){
 const root=document.querySelector('#profile .pvMobileSettings .pvMobileToolsBody')||
  document.querySelector('#profile > .panel');
 if(root&&!root.contains(launch))root.append(launch);
}
const topButton=document.createElement('button');topButton.id='pv94BackTop';topButton.type='button';topButton.textContent='↑';
topButton.hidden=true;topButton.setAttribute('aria-label','Back to top of Home Feed');
topButton.onclick=()=>window.scrollTo({top:0,behavior:preferences.reduceMotion?'instant':'smooth'});
document.body.append(topButton);
function syncTop(){
 const home=document.getElementById('home');
 topButton.hidden=!home||home.classList.contains('hide')||window.scrollY<750||
  document.body.classList.contains('pvReelsMode')||document.body.classList.contains('pvMessagesMode');
}
window.addEventListener('scroll',syncTop,{passive:true});
let updateScheduled=false;
function refresh(){
 updateScheduled=false;
 const current=uid();
 if(current!==lastUid){lastUid=current;preferences=fromStore();for(const key in inputs)inputs[key].checked=!!preferences[key];apply()}
 mountLaunch();syncTop();
}
function schedule(){
 if(updateScheduled)return;updateScheduled=true;requestAnimationFrame(refresh);
}
const domObserver=new MutationObserver(records=>{
 if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(
 n.id==='pvProfileToolsRow'||n.id==='profile'||n.classList?.contains('pvMobileSettings')
 ))))schedule();
});
domObserver.observe(document.body,{childList:true,subtree:true});
kit?.db?.auth?.onAuthStateChange?.(()=>setTimeout(schedule,0));
setInterval(()=>{if(uid()!==lastUid)schedule()},6000);
function photoError(event){
 const img=event.target;
 if(!(img instanceof HTMLImageElement))return;
 if(!img.closest('#posts article.post,#profile .pvGrid,#explore .pvExploreGrid'))return;
 if(img.dataset.pv94Retrying==='true')return;
 const parent=img.parentElement;if(!parent||parent.querySelector(':scope > .pv94MediaRetry'))return;
 const button=document.createElement('button');
 button.type='button';button.className='pv94MediaRetry';
 button.textContent='Photo did not load · Tap to retry';
 const src=img.currentSrc||img.src;
 button.onclick=()=>{
  button.disabled=true;button.textContent='Retrying photo…';
  img.dataset.pv94Retrying='true';
  img.classList.remove('pv94FailedMedia');
  const clean=()=>{img.dataset.pv94Retrying='false';button.disabled=false;void 0};
  img.addEventListener('load',()=>{clean();button.remove()},{once:true});
  img.addEventListener('error',()=>{img.dataset.pv94Retrying='false';button.disabled=false;img.classList.add('pv94FailedMedia');button.textContent='Photo did not load · Tap to retry'},{once:true});
  const url=new URL(src,location.href);url.searchParams.set('pv-media-retry',String(Date.now()));
  img.src=url.href;
 };
 img.classList.add('pv94FailedMedia');img.after(button);
}
document.addEventListener('error',photoError,true);
apply();mountLaunch();syncTop();
})();
