/* PAVORA v88 – fit Reels to actual iOS visible viewport and fixed tab bar. */
(()=>{
'use strict';
const mobile=()=>window.matchMedia('(max-width:700px)').matches;
let raf=0;
function fit(){
 raf=0;
 if(!mobile()||!document.body.classList.contains('pvReelsMode'))return;
 const nav=document.querySelector('.pvIconRail');
 const head=document.querySelector('body > header');
 const root=document.documentElement;
 const viewport=window.visualViewport;
 const visibleTop=viewport?.offsetTop||0;
 const visibleEnd=visibleTop+(viewport?.height||window.innerHeight);
 const headerRect=head?.getBoundingClientRect();
 const barRect=nav?.getBoundingClientRect();
 // All measurements use the same CSS-viewport coordinates.
 const top=Math.max(0,Math.round(headerRect?.bottom||visibleTop));
 const barTop=barRect&&barRect.height>20?barRect.top:visibleEnd-63;
 const bottom=Math.min(visibleEnd,barTop);
 const height=Math.max(200,Math.round(bottom-top));
 root.style.setProperty('--pv88ReelTop',top+'px');
 root.style.setProperty('--pv88ReelHeight',height+'px');
}
function schedule(){if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(fit)}
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',schedule,{passive:true});
window.visualViewport?.addEventListener('resize',schedule,{passive:true});
window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
const observer=new MutationObserver(records=>{
 if(records.some(r=>r.attributeName==='class'&&r.target===document.body))schedule();
});
observer.observe(document.body,{attributes:true,attributeFilter:['class']});
document.querySelectorAll('[data-rail-view="reels"],aside.left [data-view="reels"]').forEach(b=>b.addEventListener('click',()=>{
 requestAnimationFrame(()=>requestAnimationFrame(schedule));
}));
schedule();
})();
