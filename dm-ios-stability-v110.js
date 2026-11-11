/* PAVORA v110 — iPhone DM gesture guard.
   Do not cancel native touchmove: that is how Safari scrolls the list.
   Capture the post-swipe synthetic click before individual row onclick handlers. */
(()=>{
 'use strict';
 if(window.__pvDmGestureGuard110)return;
 window.__pvDmGestureGuard110=true;
 let start=null, lastSwipe=0;
 const inboxList=el=>el?.closest?.('#pvInboxView .pvThreadList');
 const isMobile=()=>window.matchMedia('(max-width:700px)').matches;
 document.addEventListener('touchstart',e=>{
  if(!isMobile()||!document.body.classList.contains('pvMessagesMode'))return;
  const list=inboxList(e.target);const t=e.touches[0];
  if(!list||!t||e.touches.length!==1){start=null;return}
  start={list,x:t.clientX,y:t.clientY,top:list.scrollTop,moved:false};
 },{capture:true,passive:true});
 document.addEventListener('touchmove',e=>{
  if(!start)return;
  const t=e.touches[0];if(!t)return;
  if(Math.abs(t.clientY-start.y)>7||Math.abs(t.clientX-start.x)>10||Math.abs(start.list.scrollTop-start.top)>2){
   start.moved=true;
  }
 },{capture:true,passive:true});
 document.addEventListener('touchend',e=>{
  if(start&&(start.moved||Math.abs(start.list.scrollTop-start.top)>2))lastSwipe=Date.now();
  start=null;
 },{capture:true,passive:true});
 document.addEventListener('touchcancel',()=>{if(start)lastSwipe=Date.now();start=null},{capture:true,passive:true});
 document.addEventListener('click',e=>{
  if(!isMobile()||!document.body.classList.contains('pvMessagesMode'))return;
  if(!e.target.closest?.('#pvInboxView .pvThreadPerson'))return;
  if((start&&start.moved)||(Date.now()-lastSwipe<450)){
   e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
  }
 },true);
 // Return to a stable top of the page when the inbox owns the scroll viewport.
 document.addEventListener('pv-chat-peer-changed',()=>{
  if(!isMobile())return;
  document.documentElement.scrollTop=0;document.body.scrollTop=0;
 },{passive:true});
})();