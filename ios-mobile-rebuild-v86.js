/* PAVORA v86: Mobile-first shell actions; reuses original button handlers. */
(()=>{
'use strict';
const mobile=()=>matchMedia('(max-width:600px)').matches;
let scheduled=false;
function mountProfileTools(){
 const profile=document.getElementById('profile');
 const panel=profile?.querySelector('.panel');
 if(!panel||!mobile())return;
 let settings=profile.querySelector('.pvMobileSettings');
 if(!settings){
  settings=document.createElement('section');
  settings.className='pvMobileSettings';
  const toggle=document.createElement('button');
  toggle.type='button';toggle.className='pvMobileToolsToggle';
  toggle.textContent='Settings & creator tools  ⌄';
  toggle.setAttribute('aria-expanded','false');
  const tools=document.createElement('div');tools.className='pvMobileToolsBody';
  toggle.onclick=()=>{
   const open=!settings.classList.contains('pvMobileToolsOpen');
   settings.classList.toggle('pvMobileToolsOpen',open);
   tools.hidden=!open;
   toggle.setAttribute('aria-expanded',String(open));
   toggle.textContent=open?'Settings & creator tools  ⌃':'Settings & creator tools  ⌄';
  };
  tools.hidden=true;
  settings.append(toggle,tools);
  panel.prepend(settings);
 }
 const tools=settings.querySelector('.pvMobileToolsBody');
 if(!tools)return;
 let row=profile.querySelector('#pvProfileToolsRow');
 if(!row){
  const launchers=[...profile.querySelectorAll('#pvHintLauncher,#pvOwnerLauncher,.pvHubLauncher')];
  if(launchers.length){row=document.createElement('div');row.id='pvProfileToolsRow';for(const b of launchers)row.append(b)}
 }
 if(row&&row.parentElement!==tools)tools.append(row);
 const signout=document.getElementById('signout');
 if(signout&&signout.parentElement!==tools){
  signout.classList.add('pvMobileSignout');
  tools.append(signout);
 }
 const push=document.querySelector('.pvPushToggle');
 if(push&&push.parentElement!==tools){
  push.classList.add('pvMobilePushSetting');
  tools.append(push);
 }
}
function mount(){
 if(!mobile())return;
 mountProfileTools();
 const brand=document.querySelector('header .top .brand');
 if(brand)brand.setAttribute('aria-label','PAVORA');
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;mount()});
}
mount();
const observer=new MutationObserver(records=>{
 if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&
 (n.id==='signout'||n.id==='pvProfileToolsRow'||n.classList?.contains('pvPushToggle')||
 n.classList?.contains('pvHubLauncher')||n.id==='profile'||n.id==='pvHintLauncher'||n.id==='pvOwnerLauncher'))))schedule();
});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',schedule,{passive:true});
})();
