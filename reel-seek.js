/* PAVORA Reels v40: mobile-friendly scrubber for each Reel.
   Native range slider supports drag, touch, keyboard and screen readers. */
(()=>{
'use strict';
const time=n=>{
 if(!Number.isFinite(n)||n<0)return '0:00';
 const seconds=Math.floor(n),minutes=Math.floor(seconds/60),hours=Math.floor(minutes/60);
 const two=v=>String(v).padStart(2,'0');
 return hours?hours+':'+two(minutes%60)+':'+two(seconds%60):minutes+':'+two(seconds%60);
};
function attach(screen,video){
 if(!screen||!video||screen.querySelector('.pvReelSeek'))return;
 const wrap=document.createElement('div');wrap.className='pvReelSeek';
 const track=document.createElement('input');
 track.className='pvReelSeekRange';track.type='range';track.min='0';track.max='1000';track.step='1';track.value='0';
 track.disabled=true;track.setAttribute('aria-label','Seek through Reel');track.setAttribute('aria-valuetext','0:00 of 0:00');
 const labels=document.createElement('div');labels.className='pvReelSeekTime';
 const current=document.createElement('span');current.textContent='0:00';
 const total=document.createElement('span');total.textContent='0:00';
 labels.append(current,total);wrap.append(track,labels);screen.append(wrap);
 // Anchor the seek control ABOVE the actual mobile navigation edge.
 // Unlike a hard-coded bottom offset this still works with iPhone safe areas,
 // floating nav layouts and different screen heights.
 const place=()=>{
  if(!wrap.isConnected)return;
  if(window.innerWidth>700||!document.body.classList.contains('pvReelsMode')){
   wrap.style.removeProperty('--pvReelSeekLift');
   screen.style.removeProperty('--pvReelSeekLift');
   return;
  }
  const nav=document.querySelector('.pvIconRail');
  const navRect=nav?.getBoundingClientRect();
  const screenRect=screen.getBoundingClientRect();
  const obstructed=navRect&&navRect.height>0?Math.max(0,screenRect.bottom-navRect.top):0;
  const lift=Math.ceil(obstructed+10)+'px';
  wrap.style.setProperty('--pvReelSeekLift',lift);
  screen.style.setProperty('--pvReelSeekLift',lift);
 };
 const schedulePlace=()=>requestAnimationFrame(place);
 window.addEventListener('resize',schedulePlace,{passive:true});
 window.visualViewport?.addEventListener('resize',schedulePlace,{passive:true});
 requestAnimationFrame(place);
 setTimeout(place,280);
 let scrubbing=false,wasPlaying=false,loaded=false;
 const duration=()=>Number.isFinite(video.duration)&&video.duration>0?video.duration:0;
 function update(){
  const end=duration();
  track.disabled=!end;loaded=!!end;
  total.textContent=time(end);
  if(scrubbing)return;
  const position=Math.max(0,Math.min(end,video.currentTime||0));
  current.textContent=time(position);
  const value=end?Math.round(position/end*1000):0;
  track.value=String(value);
  track.style.setProperty('--pvSeekProgress',value/10+'%');
  track.setAttribute('aria-valuetext',time(position)+' of '+time(end));
 }
 function seek(){
  const end=duration();
  if(!end)return;
  const requested=Math.max(0,Math.min(end,(Number(track.value)/1000)*end));
  current.textContent=time(requested);
  track.style.setProperty('--pvSeekProgress',(Number(track.value)/10)+'%');
  track.setAttribute('aria-valuetext',time(requested)+' of '+time(end));
  try{video.currentTime=requested}catch(e){console.warn('Reel seek unavailable:',e)}
 }
 // Touch gestures on the scrubber must never advance to the next Reel.
 for(const eventName of ['touchstart','touchmove','touchend','pointerdown','pointermove','pointerup','mousedown','click','dblclick']){
  wrap.addEventListener(eventName,e=>e.stopPropagation(),{passive:true});
 }
 track.addEventListener('pointerdown',()=>{scrubbing=true;wasPlaying=!video.paused});
 track.addEventListener('touchstart',()=>{scrubbing=true;wasPlaying=!video.paused},{passive:true});
 track.addEventListener('input',()=>{scrubbing=true;seek()});
 function finish(){if(!scrubbing)return;scrubbing=false;seek();update()}
 track.addEventListener('change',finish);
 track.addEventListener('pointerup',finish);
 track.addEventListener('pointercancel',finish);
 track.addEventListener('touchend',finish,{passive:true});
 track.addEventListener('touchcancel',finish,{passive:true});
 for(const eventName of ['loadedmetadata','durationchange','timeupdate','seeking','seeked','emptied'])video.addEventListener(eventName,update);
 update();
}
const css=document.createElement('style');
css.textContent=`
.pvReelScreen{position:relative}
.pvReelScreen .pvReelSeek{position:absolute;bottom:var(--pvReelSeekLift,0px);left:0;right:0;z-index:30;display:flex;flex-direction:column;gap:0;align-items:stretch;padding:5px 11px max(4px,env(safe-area-inset-bottom,4px));background:linear-gradient(0deg,#000b,transparent);pointer-events:auto}
.pvReelScreen .pvReelSeekRange{-webkit-appearance:none;appearance:none;display:block;width:100%;height:17px;min-height:17px;margin:0;padding:0;background:transparent;border:0;outline:0;cursor:pointer;touch-action:pan-x;accent-color:#f4e2ff}
.pvReelScreen .pvReelSeekRange::-webkit-slider-runnable-track{height:3px;border-radius:9px;background:linear-gradient(to right,#e7c1ff 0%,#e7c1ff var(--pvSeekProgress,0%),#ffffff5c var(--pvSeekProgress,0%),#ffffff5c 100%)}
.pvReelScreen .pvReelSeekRange::-moz-range-track{height:3px;border-radius:9px;background:#ffffff5c}
.pvReelScreen .pvReelSeekRange::-moz-range-progress{height:3px;border-radius:9px;background:#e7c1ff}
.pvReelScreen .pvReelSeekRange::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;margin-top:-4.5px;border-radius:50%;background:#fff;border:1px solid #e7c1ff;box-shadow:0 1px 4px #0009}
.pvReelScreen .pvReelSeekRange::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#fff;border:1px solid #e7c1ff}
.pvReelScreen .pvReelSeekRange:focus-visible{outline:2px solid #e7c1ff;outline-offset:2px;border-radius:7px}
.pvReelScreen .pvReelSeekRange:disabled{cursor:default;opacity:.5}
.pvReelScreen .pvReelSeekTime{display:flex;justify-content:space-between;color:#fff;font-weight:650;font-size:10px;line-height:16px;user-select:none;text-shadow:0 1px 3px #000}
body.pvReelsMode .pvReelMeta{bottom:calc(var(--pvReelSeekLift,0px) + 34px)!important}
body.pvReelsMode .pvReelCard .pvReelActions{bottom:144px!important}
body.pvReelsMode .pvReelSound{bottom:133px!important}
@media(max-width:700px){
 body.pvReelsMode .pvReelMeta{bottom:calc(var(--pvReelSeekLift,0px) + 32px)!important}
 body.pvReelsMode .pvReelCard .pvReelActions{bottom:139px!important}
 body.pvReelsMode .pvReelSound{bottom:132px!important}
 .pvReelScreen .pvReelSeek{padding-left:13px;padding-right:13px;background:linear-gradient(0deg,rgba(0,0,0,.52),transparent)}
}
@media(max-width:700px) and (max-height:640px){
 body.pvReelsMode .pvReelCard .pvReelActions{bottom:110px!important}
 body.pvReelsMode .pvReelSound{bottom:105px!important}
}
`;
document.head.append(css);
window.PAVORA_REEL_SEEK={attach,time};
})();