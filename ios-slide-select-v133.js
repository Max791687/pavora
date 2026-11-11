/* PAVORA v133: iPhone-style drag-to-select in segmented navigation.
   A finger held on a button may glide across peers; release selects the
   button below the finger. Normal taps remain native. No feed/chat swipes. */
(()=>{
 'use strict';
 if(window.__pvSlideSelect133)return;
 window.__pvSlideSelect133=true;
 const groups=[
  {host:'.pvIconRail',item:'.pvRailButton:not(.pvRailMore)'},
  {host:'#home .pvFeedModeTabs',item:'button'}
 ];
 let gesture=null,synthetic=false;
 const mobile=()=>matchMedia('(max-width:700px) and (pointer:coarse)').matches;
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 function getGroup(target){
  if(!mobile())return null;
  for(const config of groups){
   const item=target?.closest?.(config.item);
   const host=item?.closest?.(config.host);
   if(host&&!item.disabled&&item.getAttribute('aria-disabled')!=='true')
    return {host,item,config};
  }
  return null;
 }
 function buttons(g){return [...g.host.querySelectorAll(g.config.item)].filter(b=>b.getClientRects().length&&!b.disabled&&b.getAttribute('aria-disabled')!=='true')}
 function targetAt(g,x,y){
  const items=buttons(g);
  const within=items.find(b=>{const r=b.getBoundingClientRect();return x>=r.left-7&&x<=r.right+7&&y>=r.top-18&&y<=r.bottom+18});
  if(within)return within;
  const host=g.host.getBoundingClientRect();
  if(y<host.top-28||y>host.bottom+28)return null;
  return items.reduce((best,b)=>{
   const r=b.getBoundingClientRect(),dist=Math.abs(x-(r.left+r.right)/2);
   return !best||dist<best.dist?{button:b,dist}:best;
  },null)?.button||null;
 }
 function indicator(g){
  const layer=document.createElement('div');
  layer.className='pvSlideGlass133';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML='<span class="pvSlideGlassShine134"></span>';
  g.host.appendChild(layer);
  return layer;
 }
 function paint(g,item,x){
  if(!item)return;
  if(g.hover!==item){
   g.hover?.classList.remove('pvSlideIconHovered135');
   g.hover=item;
  }
  item.classList.add('pvSlideIconHovered135');
  const host=g.host.getBoundingClientRect(),rect=item.getBoundingClientRect();
  const width=rect.width,height=rect.height;
  // Finger-following glass, not the stepped target button positions.
  const center=x==null?rect.left+width/2:Math.max(host.left+width/2+2,
   Math.min(host.right-width/2-2,x));
  g.toX=center-host.left-width/2;
  g.toY=rect.top-host.top;
  g.layer.style.width=width+'px';
  g.layer.style.height=height+'px';
  if(g.currentX==null){
   g.currentX=g.toX;g.currentY=g.toY;
   g.layer.style.transform='translate3d('+g.currentX+'px,'+g.currentY+'px,0) scale(1.03)';
  }
  g.layer.classList.add('pvSlideGlassVisible133');
 }
 function frame(g){
  if(gesture!==g)return;
  if(g.currentX!=null){
   const dx=g.toX-g.currentX,dy=g.toY-g.currentY;
   // Fast but damped spring-like tracking; no jumps between item centers.
   const strength=reduced()?1:.44;
   g.currentX+=dx*strength;g.currentY+=dy*strength;
   if(Math.abs(dx)<.15)g.currentX=g.toX;
   if(Math.abs(dy)<.15)g.currentY=g.toY;
   g.layer.style.transform='translate3d('+g.currentX.toFixed(2)+'px,'+
     g.currentY.toFixed(2)+'px,0) scale(1.03)';
  }
  g.raf=requestAnimationFrame(()=>frame(g));
 }
 function cleanup(){
  const g=gesture;gesture=null;if(!g)return;
  if(g.raf)cancelAnimationFrame(g.raf);
  g.host.classList.remove('pvSlideSelecting133');
  g.hover?.classList.remove('pvSlideIconHovered135');
  g.layer.remove();
 }
 document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1){cleanup();return}
  const group=getGroup(e.target);
  if(!group){cleanup();return}
  const t=e.touches[0];
  cleanup();
  const g={...group,id:t.identifier,startX:t.clientX,startY:t.clientY,
   hover:group.item,moved:false,cancelled:false,layer:null,raf:null,currentX:null,currentY:null};
  g.layer=indicator(g);
  g.host.classList.add('pvSlideSelecting133');
  paint(g,g.item,t.clientX);
  gesture=g;
  g.raf=requestAnimationFrame(()=>frame(g));
 },{capture:true,passive:true});
 document.addEventListener('touchmove',e=>{
  const g=gesture;if(!g)return;
  const t=[...e.touches].find(t=>t.identifier===g.id);
  if(!t){cleanup();return}
  const dx=t.clientX-g.startX,dy=t.clientY-g.startY;
  // A vertical gesture remains ordinary page scroll, not navigation.
  if(!g.moved&&Math.abs(dy)>Math.max(16,Math.abs(dx)*1.2)){cleanup();return}
  if(Math.abs(dx)>10)g.moved=true;
  if(g.moved){
   const button=targetAt(g,t.clientX,t.clientY);
   if(button)paint(g,button,t.clientX);
   // Prevent mobile WebKit from treating this intentional horizontal button
   // selection gesture as a back swipe or scrolling the tab row.
   if(e.cancelable&&Math.abs(dx)>14)e.preventDefault();
  }
 },{capture:true,passive:false});
 document.addEventListener('touchend',e=>{
  const g=gesture;if(!g)return;
  const t=[...e.changedTouches].find(t=>t.identifier===g.id);
  if(!t)return;
  const selected=g.moved?targetAt(g,t.clientX,t.clientY):null;
  const choose=selected&&selected!==g.item;
  if(g.moved){
   if(e.cancelable)e.preventDefault();
   // stop only the synthesized click that would otherwise select the
   // original pressed item; our controlled click selects the finger target.
   const initial=g.item;
   const once=event=>{
    if(synthetic)return;
    if(event.target===initial||initial.contains(event.target)){
     event.preventDefault();
     event.stopImmediatePropagation();
    }
   };
   document.addEventListener('click',once,true);
   setTimeout(()=>document.removeEventListener('click',once,true),430);
  }
  if(choose){
   paint(g,selected,t.clientX);
   const dest=selected;
   // Trigger existing app click handlers, never recreate navigation logic.
   requestAnimationFrame(()=>{
    synthetic=true;
    try{if(dest.isConnected)dest.click()}finally{synthetic=false}
   });
  }
  cleanup();
 },{capture:true,passive:false});
 document.addEventListener('touchcancel',cleanup,{capture:true,passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cleanup()});
})();
