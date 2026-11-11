/* PAVORA v93: present the real Reels/Friends tabs and a working Create shortcut.
 * Existing For You/Following filtering, swipe and Reel actions remain authoritative.
 */
(()=>{
'use strict';
const isMobile=()=>matchMedia('(max-width:700px)').matches;
function mount(){
 if(!isMobile())return;
 const root=document.getElementById('reels');if(!root)return;
 for(const button of root.querySelectorAll('.pvSmartReelTab')){
  if(button.dataset.mode==='for-you'){
   button.textContent='Reels';
   button.setAttribute('aria-label','For You Reels');
  }else if(button.dataset.mode==='following'){
   button.textContent='Friends';
   button.setAttribute('aria-label','Reels from followed accounts');
  }
 }
 if(!document.querySelector('.pv93ReelCreate')){
  const add=document.createElement('button');
  add.type='button';add.className='pv93ReelCreate';add.textContent='+';
  add.setAttribute('aria-label','Create a new Reel');
  add.title='Create a Reel';
  add.onclick=()=>{
   const create=document.querySelector('header .pvCreateTop');
   if(create){create.click();return}
   const rail=document.querySelector('.pvIconRail .pvRailButton[title="Create post"]');
   if(rail){rail.click();return}
   const old=document.querySelector('#reels .pvReelUploadToggle');
   if(old)old.click();
  };
  document.body.append(add);
 }
}
let queued=false;
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;mount()});
}
mount();
const observer=new MutationObserver(records=>{
 if(!isMobile())return;
 if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&
 (n.classList?.contains('pvSmartReelTabs')||n.classList?.contains('pvSmartReelTab')||n.querySelector?.('.pvSmartReelTab')))))schedule();
});
observer.observe(document.body,{childList:true,subtree:true});
})();
