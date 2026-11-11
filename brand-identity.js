/* PAVORA v80 — brand identity shown persistently, not just during launch. */
(()=>{
 'use strict';
 const logo='./app-icon.svg';
 const css=document.createElement('style');
 css.textContent=`
 .pvBrandMark{width:36px;height:36px;display:block;flex:none;object-fit:contain;border-radius:9px}
 .top .brand{display:inline-flex;align-items:center;gap:9px;white-space:nowrap;line-height:1;min-width:0}
 .top .brand .pvBrandMark{width:34px;height:34px}
 #authOverlay .authLogo{display:inline-flex!important;align-items:center;gap:12px;line-height:1.1;font-weight:900}
 #authOverlay .authLogo .pvBrandMark{width:46px;height:46px;box-shadow:0 8px 25px #532a7726}
 .pvIconRail{position:fixed}
 .pvRailBrand{position:absolute;top:17px;left:50%;transform:translateX(-50%);display:grid;place-items:center;width:49px;height:51px;border-radius:12px;text-decoration:none}
 .pvRailBrand .pvBrandMark{width:43px;height:43px}
 .pvRailBrand:focus-visible{outline:2px solid #d4a7ff;outline-offset:2px}
 @media(max-width:700px){.top .brand{gap:6px;font-size:22px!important}.top .brand .pvBrandMark{width:30px;height:30px}#authOverlay .authLogo .pvBrandMark{width:39px;height:39px}}
 `;
 document.head.append(css);
 function image(){const img=document.createElement('img');img.className='pvBrandMark';img.src=logo;img.alt='';img.decoding='async';return img}
 function updateWordmark(el){
  if(!el||el.querySelector('.pvBrandMark'))return;
  el.replaceChildren(image(),document.createTextNode('PAVORA'));
  el.setAttribute('aria-label','PAVORA');
 }
 function mount(){
  const top=document.querySelector('header .top .brand');
  updateWordmark(top);
  document.querySelectorAll('#authOverlay .authLogo').forEach(updateWordmark);
  const rail=document.querySelector('.pvIconRail');
  if(rail&&!rail.querySelector('.pvRailBrand')){
   const anchor=document.createElement('a');anchor.className='pvRailBrand';
   anchor.href='./';anchor.title='PAVORA Home';
   anchor.setAttribute('aria-label','PAVORA Home');
   anchor.append(image());
   anchor.addEventListener('click',e=>{
    const home=document.querySelector('aside.left [data-view="home"]');
    if(home){e.preventDefault();home.click()}
   });
   rail.prepend(anchor);
  }
 }
 mount();
 let busy=false;
 const observer=new MutationObserver(()=>{
  if(busy)return;busy=true;
  requestAnimationFrame(()=>{busy=false;mount()});
 });
 observer.observe(document.body,{childList:true,subtree:true});
})();
