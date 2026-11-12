/* PAVORA v113 — iOS keyboard: keep the most recent DM visible when composing. */
(()=>{
 'use strict';
 if(window.__pvDmKeyboardFollow113)return;
 window.__pvDmKeyboardFollow113=true;
 const inputSelector='#pvInboxView.pvChatSelected .pvMessageForm textarea';
 let focused=false, lastKeyboard=false, raf=0, followUntil=0;
 const mobile=()=>window.matchMedia('(max-width:700px)').matches;
 const state=()=>{
  if(!mobile()||!document.body.classList.contains('pvMessagesMode'))return null;
  const input=document.querySelector(inputSelector);
  if(!input||document.activeElement!==input)return null;
  const list=document.querySelector('#pvInboxView.pvChatSelected .pvMessages');
  return list?{list,input}:null;
 };
 function atBottom(){
  const x=state();if(!x)return;
  x.list.scrollTop=x.list.scrollHeight;
 }
 function followLatest(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{atBottom();requestAnimationFrame(atBottom)});
  setTimeout(atBottom,90);
  setTimeout(atBottom,260);
 }
 function sync(){
  const x=state();
  if(!x){focused=false;lastKeyboard=false;return}
  const vv=window.visualViewport;
  const keyboard=!!vv&&vv.height<window.innerHeight-110;
  if(!focused||(!lastKeyboard&&keyboard)){
   followUntil=Date.now()+800;
   followLatest();
  }else if(Date.now()<followUntil){requestAnimationFrame(atBottom)}
  focused=true;lastKeyboard=keyboard;
 }
 document.addEventListener('focusin',e=>{
  if(e.target.matches?.(inputSelector)){focused=false;sync()}
 });
 document.addEventListener('focusout',e=>{
  if(e.target.matches?.(inputSelector)){focused=false;lastKeyboard=false}
 });
 window.visualViewport?.addEventListener('resize',sync,{passive:true});
 window.visualViewport?.addEventListener('scroll',sync,{passive:true});
 window.addEventListener('resize',sync,{passive:true});
})();
