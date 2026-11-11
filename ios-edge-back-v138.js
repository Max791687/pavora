/* PAVORA v138 – Left-edge swipe Back. Works across app sections and
 conversations through their existing navigation handlers. */
(()=>{
 'use strict';
 if(window.__pvEdgeBack138)return;
 window.__pvEdgeBack138=true;
 let gesture=null;
 const enabled=()=>matchMedia('(max-width:700px) and (pointer:coarse)').matches;
 const blocked=target=>!!target?.closest?.(
  '.pvSlideSelecting133,.pvIconRail,.pvFeedModeTabs,'+
  'input,textarea,[contenteditable="true"],video,audio,canvas,'+
  '.pvReelScreen,.pvReelsFeed,.pvStoryViewer,'+
  '[role="slider"],[data-disable-edge-back]'
 );
 const swipeState=(x,y)=>({startX:x,startY:y,x,y,detected:false,cancelled:false,stamp:performance.now()});
 document.addEventListener('touchstart',e=>{
  if(!enabled()||e.touches.length!==1){gesture=null;return}
  const t=e.touches[0];
  if(t.clientX>34||blocked(e.target)){gesture=null;return}
  gesture=swipeState(t.clientX,t.clientY);
 },{capture:true,passive:true});
 document.addEventListener('touchmove',e=>{
  if(!gesture||!e.touches.length)return;
  const t=e.touches[0],dx=t.clientX-gesture.startX,dy=t.clientY-gesture.startY;
  gesture.x=t.clientX;gesture.y=t.clientY;
  if(!gesture.detected){
   if(Math.abs(dy)>16&&Math.abs(dy)>Math.abs(dx)*1.12){gesture=null;return}
   if(dx< -12){gesture=null;return}
   if(dx>22&&Math.abs(dx)>Math.abs(dy)*1.35)gesture.detected=true;
  }
  // Once confirmed, prevent the underlying horizontal page from shifting.
  if(gesture?.detected&&e.cancelable)e.preventDefault();
 },{capture:true,passive:false});
 document.addEventListener('touchend',e=>{
  const g=gesture;gesture=null;
  if(!g||!g.detected||e.changedTouches.length!==1)return;
  const t=e.changedTouches[0];
  const dx=t.clientX-g.startX,dy=t.clientY-g.startY;
  if(dx<85||Math.abs(dy)>Math.max(55,dx*.62)||performance.now()-g.stamp>1600)return;
  try{window.PAVORA_EDGE_BACK?.()}catch(error){console.warn('Edge Back:',error)}
 },{capture:true,passive:true});
 document.addEventListener('touchcancel',()=>gesture=null,{capture:true,passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)gesture=null});
})();
