/* PAVORA v131: reliable iOS double-tap Like for real and demo feed posts.
 * Real posts use their original secured Like button; no duplicate database writes.
 * Swipe gestures and individual taps are not intercepted. */
(()=>{
 'use strict';
 if(window.__pvPostDoubleTap131)return;
 window.__pvPostDoubleTap131=true;
 let touch=null,last=null,blockedClickUntil=0;
 const getImage=target=>target?.closest?.('#home article.post img:not(.profilepic img)');
 const getCard=image=>image?.closest?.('article.post');
 const now=()=>performance.now();
 function heart(card){
  card.classList.add('pvDoubleLikeSurface');
  card.querySelector('.pvDoubleLikeHeart')?.remove();
  const el=document.createElement('span');
  el.className='pvDoubleLikeHeart';
  el.textContent='♥';el.setAttribute('aria-hidden','true');
  card.append(el);
  setTimeout(()=>el.remove(),750);
 }
 document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1){touch=null;last=null;return}
  const image=getImage(e.target),t=e.touches[0];
  if(!image){touch=null;return}
  touch={image,x:t.clientX,y:t.clientY,time:now(),moved:false};
 },{capture:true,passive:true});
 document.addEventListener('touchmove',e=>{
  if(!touch||!e.touches.length)return;
  const t=e.touches[0];
  if(Math.abs(t.clientX-touch.x)>12||Math.abs(t.clientY-touch.y)>12)touch.moved=true;
 },{capture:true,passive:true});
 document.addEventListener('touchcancel',()=>{touch=null;last=null},{capture:true,passive:true});
 document.addEventListener('touchend',e=>{
  const start=touch;touch=null;
  if(!start||start.moved||e.changedTouches.length!==1){last=null;return}
  const t=e.changedTouches[0],at=now();
  if(at-start.time>330){last=null;return}
  const card=getCard(start.image);
  if(!card)return;
  if(last&&last.image===start.image&&at-last.at<410&&
     Math.hypot(t.clientX-last.x,t.clientY-last.y)<75){
   last=null;
   blockedClickUntil=at+650;
   e.preventDefault();
   const button=card.querySelector('.postfoot button[data-pv-like-post]')||
                 card.querySelector('.postfoot button');
   if(!button||button.disabled)return;
   // Double tap always Likes; it must never unlike an already-liked post.
   const liked=card.classList.contains('pvDailyCard')?
      button.getAttribute('aria-pressed')==='true':
      button.textContent.trim().startsWith('♥');
   if(!liked)button.click();
   heart(card);
  }else{
   last={image:start.image,at,x:t.clientX,y:t.clientY};
  }
 },{capture:true,passive:false});
 // Safari synthesizes mouse clicks after touch. Stop the legacy dbl-click
 // listener from toggling the same Like again.
 document.addEventListener('click',e=>{
  if(!getImage(e.target))return;
  if(e.sourceCapabilities?.firesTouchEvents||now()<blockedClickUntil){
   e.stopImmediatePropagation();
  }
 },true);
})();
