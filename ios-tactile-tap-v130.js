/* PAVORA v130 – iPhone-style tactile micro-interactions.
   Real touch/pointer events, not only :active. Never intercept navigation or scrolling. */
(()=>{
 'use strict';
 if(window.__pvTactileV130)return;
 window.__pvTactileV130=true;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const selector=[
  '.pvIconRail .pvRailButton',
  'header .pvTopAction',
  'header .pvMobileActivity',
  'header .pvActivityBell',
  '#home .pvFeedModeTabs button',
  '#home .postfoot button',
  '#home .story button',
  '#home .pvStoryAdd',
  '#home .pv96Creator button',
  '#home .posthead button',
  '#home .post .pvPersonButton',
  '#explore button:not([disabled])',
  '#profile button:not([disabled])',
  '#pvPublicView button:not([disabled])',
  '#pvInboxView .pvInboxTabs button',
  '#pvInboxView .pvChatSend',
  '#pvInboxView .pvChatBack',
  '#pvInboxView .pvChatMore',
  '.pvComposeOverlay button',
  '.pvActivityPanel button'
 ].join(',');
 const enabled=()=>window.matchMedia('(max-width:700px)').matches&&!reduced.matches;
 const current=new Map();
 const match=(node)=>node?.closest?.(selector);
 let preventSyntheticClickUntil=0;
 function reset(el,animate){
  const state=current.get(el);if(!state)return;
  current.delete(el);
  if(state.timer)clearTimeout(state.timer);
  const remaining=Math.max(0,95-(performance.now()-state.started));
  setTimeout(()=>{
   el.classList.remove('pvTouchPressed130');
   if(animate&&el.isConnected&&enabled()){
    el.classList.remove('pvTouchPop130');
    void el.offsetWidth;
    el.classList.add('pvTouchPop130');
    setTimeout(()=>el.classList.remove('pvTouchPop130'),440);
   }
  },remaining);
 }
 document.addEventListener('pointerdown',event=>{
  if(!enabled()||event.button!==0)return;
  const el=match(event.target);
  if(!el||el.disabled||el.getAttribute('aria-disabled')==='true')return;
  // Do not animate large cards and never block a swipe.
  const state={x:event.clientX,y:event.clientY,started:performance.now(),timer:null};
  if(current.has(el))reset(el,false);
  current.set(el,state);
  el.classList.remove('pvTouchPop130');
  el.classList.add('pvTouchPressed130');
 },{capture:true,passive:true});
 document.addEventListener('pointermove',event=>{
  const el=match(event.target),state=el&&current.get(el);
  if(state&&(Math.abs(event.clientX-state.x)>11||Math.abs(event.clientY-state.y)>11))reset(el,false);
 },{capture:true,passive:true});
 document.addEventListener('pointerup',event=>{
  const el=match(event.target);if(el&&current.has(el))reset(el,true);
 },{capture:true,passive:true});
 document.addEventListener('pointercancel',event=>{
  const el=match(event.target);if(el)reset(el,false);
 },{capture:true,passive:true});
 document.addEventListener('click',event=>{
  if(!enabled()||!event.detail)return;
  // Some iOS controls navigate immediately after pointerup; run a visible
  // pop on the still-mounted nav control without changing its click behavior.
  const el=match(event.target);
  if(!el||current.has(el))return;
  el.classList.remove('pvTouchPop130');
  void el.offsetWidth;
  el.classList.add('pvTouchPop130');
  setTimeout(()=>el.classList.remove('pvTouchPop130'),440);
 },{capture:true,passive:true});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden)for(const el of [...current.keys()])reset(el,false);
 });
})();
