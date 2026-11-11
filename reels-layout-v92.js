/* PAVORA v92 — measure actual iPhone PWA display geometry.
   Avoid the 100dvh-only calculation which left a dead black strip on some iPhones.
   No changes to video playback, real data or swipe handlers.
*/
(()=>{
'use strict';
const root=document.documentElement;
const isPhone=()=>matchMedia('(max-width:700px)').matches;
const safeProbe=document.createElement('span');
safeProbe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);height:0;width:0;';
document.body.append(safeProbe);
let raf=0;
function measure(){
 raf=0;
 if(!isPhone()||!document.body.classList.contains('pvReelsMode'))return;
 const vv=window.visualViewport;
 const viewHeight=Math.max(innerHeight||0,document.documentElement.clientHeight||0,(vv?.height||0)+(vv?.offsetTop||0));
 // Standalone iOS may report a shorter visual viewport than the actual screen:
 // avoid leaving the underlying dark document exposed below the Reel.
 const portrait=matchMedia('(orientation:portrait)').matches;
 const screenH=portrait?Number(screen.height)||0:0;
 const height=Math.round(Math.max(viewHeight,Math.min(screenH,viewHeight*1.19)));
 const computed=getComputedStyle(safeProbe);
 const bottomSafe=Math.max(0,parseFloat(computed.paddingBottom)||0);
 const topSafe=Math.max(0,parseFloat(computed.paddingTop)||0);
 const navTop=Math.max(0,Math.round(height-bottomSafe-70));
 root.style.setProperty('--pv92-height',height+'px');
 root.style.setProperty('--pv92-nav-top',navTop+'px');
 root.style.setProperty('--pv92-safe',bottomSafe+'px');
 root.style.setProperty('--pv92-safe-top',topSafe+'px');
}
function schedule(){if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(measure)}
const observer=new MutationObserver(records=>{
 if(records.some(r=>r.target===document.body&&r.attributeName==='class'))schedule();
});
observer.observe(document.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',schedule,{passive:true});
window.visualViewport?.addEventListener('resize',schedule,{passive:true});
window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-rail-view="reels"]'))requestAnimationFrame(schedule)},true);
schedule();
})();
