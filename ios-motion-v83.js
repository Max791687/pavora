/* PAVORA v83 — progressive enhancement only; existing navigation remains authoritative. */
(()=>{
'use strict';
let reset=null;
function animate(){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const body=document.body;
 body.classList.remove('pvIOSSwitching');
 void body.offsetWidth;
 body.classList.add('pvIOSSwitching');
 if(reset)clearTimeout(reset);
 reset=setTimeout(()=>{body.classList.remove('pvIOSSwitching');reset=null},360);
}
document.addEventListener('click',event=>{
 const target=event.target.closest?.('[data-rail-view], aside.left [data-view], .pvRailBrand');
 if(!target||target.closest('#authOverlay'))return;
 animate();
},true);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(reset)clearTimeout(reset);reset=null;document.body.classList.remove('pvIOSSwitching')}
});
})();
