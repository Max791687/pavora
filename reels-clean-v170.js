/* PAVORA Reels clean overlay v170. Presentation only: existing playback,
   swipe controller, authentication, sharing and Supabase actions remain intact. */
(()=>{
'use strict';
const css=document.createElement('style');
css.id='pvReelsCleanV170';
css.textContent=`
/* Keep video visible edge-to-edge; avoid large opaque black gradient covers. */
body.pvReelsMode .pvReelCard{isolation:isolate}
body.pvReelsMode .pvReelScreen{background:#09090b!important;overflow:hidden!important}
body.pvReelsMode .pvReelScreen video{
 width:100%!important;height:100%!important;object-fit:contain!important;
 background:#09090b!important
}
body.pvReelsMode .pvReelScreen .pvReelMeta{
 position:absolute!important;left:0!important;right:0!important;
 bottom:calc(var(--pv170NavOverlap,0px) + var(--pv170SeekHeight,44px) + 8px)!important;z-index:8!important;
 padding:9px 76px 7px 14px!important;
 background:transparent!important;box-shadow:none!important;
 pointer-events:none!important;max-width:100%!important;
}
body.pvReelsMode .pvReelScreen .pvReelMeta{
 display:block!important;visibility:visible!important;opacity:1!important;
 transform:none!important;max-height:none!important;
}
body.pvReelsMode .pvReelScreen .pvReelMeta .pvReelAuthor{
 display:flex!important;visibility:visible!important;opacity:1!important;
}
body.pvReelsMode .pvReelScreen .pvReelMeta::before,
body.pvReelsMode .pvReelScreen .pvReelMeta::after{display:none!important}
body.pvReelsMode .pvReelAuthor{
 display:flex!important;align-items:center!important;gap:9px!important;
 min-width:0!important;max-width:100%!important;flex-wrap:nowrap!important
}
body.pvReelsMode .pvReelAvatar{
 width:36px!important;height:36px!important;min-width:36px!important;
 flex:0 0 36px!important;border:2px solid #fff!important;
 box-shadow:0 2px 9px #0009!important
}
body.pvReelsMode .pvReelCreator{
 display:block!important;min-width:0!important;max-width:100%!important;
 overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
 color:#fff!important;font-size:14px!important;font-weight:800!important;
 text-shadow:0 2px 8px #000,0 0 3px #000!important;
 pointer-events:auto!important
}
body.pvReelsMode .pvReelFollow{
 flex-shrink:0!important;color:#fff!important;font-size:11px!important;
 font-weight:700!important;padding:6px 9px!important;
 border:1px solid #ffffffa6!important;border-radius:8px!important;
 background:#1b18215c!important;backdrop-filter:blur(8px);
 pointer-events:auto!important
}
body.pvReelsMode .pvReelCaption{
 display:block!important;max-width:100%!important;max-height:none!important;
 -webkit-line-clamp:unset!important;overflow:visible!important;
 margin:8px 0 0!important;font-size:13px!important;line-height:1.42!important;
 color:#fff!important;white-space:normal!important;overflow-wrap:anywhere!important;
 text-shadow:0 2px 8px #000,0 0 3px #000!important;
}
body.pvReelsMode .pvReelCaption.pv170Clamped{
 display:-webkit-box!important;-webkit-box-orient:vertical!important;
 -webkit-line-clamp:2!important;overflow:hidden!important
}
body.pvReelsMode .pvReelCaption.pv170NoCaption{display:none!important}
body.pvReelsMode .pv170MoreCaption{
 display:inline-flex!important;align-items:center!important;
 margin:4px 0 0!important;padding:2px 0!important;background:transparent!important;
 color:#fff!important;font-weight:750!important;font-size:12px!important;
 border:0!important;text-shadow:0 1px 5px #000!important;
 pointer-events:auto!important
}
/* Keep standard action handlers but make every icon/count clear and separated. */
body.pvReelsMode .pvReelCard .pvReelActions{
 position:absolute!important;right:8px!important;bottom:calc(114px + var(--pv170NavOverlap,0px))!important;
 width:55px!important;min-width:55px!important;z-index:10!important;
 padding:0!important;margin:0!important;gap:0!important;
 display:flex!important;flex-direction:column!important;align-items:center!important;
 pointer-events:auto!important
}
body.pvReelsMode .pvSuiteReelActions{
 display:flex!important;flex-direction:column!important;align-items:center!important;
 gap:9px!important;width:100%!important
}
body.pvReelsMode .pvSuiteIconAction{
 width:52px!important;min-height:51px!important;
 display:flex!important;flex-direction:column!important;align-items:center!important;
 justify-content:center!important;gap:3px!important;padding:3px 0!important;
 border:0!important;background:transparent!important;color:#fff!important;
 filter:drop-shadow(0 2px 3px #0009)!important;box-shadow:none!important;
}
body.pvReelsMode .pvSuiteIconAction svg{
 width:29px!important;height:29px!important;flex:0 0 29px!important;
 stroke-width:2!important
}
body.pvReelsMode .pvSuiteIconAction .pvSuiteCount{
 display:block!important;color:#fff!important;font-size:12px!important;
 line-height:15px!important;font-weight:700!important;margin:0!important;
 text-shadow:0 1px 5px #000!important
}
body.pvReelsMode .pvSuiteReelActions>.pvSuiteCount.pvSuiteViews{
 display:block!important;color:#fff!important;font-size:11px!important;
 white-space:nowrap!important;text-shadow:0 1px 5px #000!important
}
/* High-contrast low-profile scrubber; no interaction stealing from swipe feed. */
body.pvReelsMode .pvReelScreen .pvReelSeek{
 position:absolute!important;bottom:var(--pv170NavOverlap,0px)!important;left:0!important;right:0!important;
 z-index:20!important;padding:3px 12px 5px!important;
 background:transparent!important;pointer-events:auto!important
}
body.pvReelsMode .pvReelSeekRange{height:20px!important;min-height:20px!important}
body.pvReelsMode .pvReelSeekTime{
 font-size:11px!important;font-weight:750!important;line-height:17px!important;
 color:#fff!important;text-shadow:0 2px 5px #000!important
}
body.pvReelsMode .pvReelSound{
 position:absolute!important;bottom:calc(153px + var(--pv170NavOverlap,0px))!important;right:73px!important;
 z-index:11!important;color:#fff!important;filter:drop-shadow(0 1px 3px #000a)
}
body.pvReelsMode .pvReelPlay{z-index:9!important}
/* This preference is a menu action, never a black floating label over the video. */
body.pvReelsMode #reels .pvSmartNotInterested{
 top:57px!important;bottom:auto!important;right:9px!important;
 max-width:112px!important;font-size:10px!important;opacity:.82!important;
 white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
 background:rgba(12,14,21,.32)!important;border:1px solid rgba(255,255,255,.25)!important
}
/* Top tabs and glass bottom navigation match the supplied reference. */
body.pvReelsMode #reels .pvSmartReelTabs{
 border:0!important;box-shadow:none!important;background:transparent!important;
 backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
 top:8px!important;gap:12px!important
}
body.pvReelsMode #reels .pvSmartReelTab{
 padding:8px 2px!important;font-size:19px!important;font-weight:800!important;
 color:#dedce2!important;text-shadow:0 2px 9px #0009!important;
 border-radius:0!important
}
body.pvReelsMode #reels .pvSmartReelTab.active{
 background:transparent!important;color:#fff!important
}
@media(max-width:700px){
 body.pvReelsMode .pvReelScreen .pvReelMeta{
  bottom:calc(var(--pv170NavOverlap,0px) + var(--pv170SeekHeight,44px) + 8px)!important;padding:8px 72px 5px 13px!important
 }
 body.pvReelsMode .pvReelCard .pvReelActions{
  right:5px!important;bottom:calc(113px + var(--pv170NavOverlap,0px))!important;width:55px!important
 }
 body.pvReelsMode .pvReelSound{bottom:calc(157px + var(--pv170NavOverlap,0px))!important;right:65px!important}
 body.pvReelsMode .pvSuiteReelActions{gap:7px!important}
 body.pvReelsMode .pvSuiteIconAction{width:50px!important;min-height:49px!important}
 body.pvReelsMode .pvReelSeek{padding-left:12px!important;padding-right:12px!important}
 body.pvReelsMode .pvIconRail{
  background:rgba(34,40,51,.36)!important;
  border:1px solid rgba(255,255,255,.45)!important;
  border-radius:999px!important;left:12px!important;right:12px!important;
  width:calc(100% - 24px)!important;
  bottom:calc(5px + env(safe-area-inset-bottom,0px))!important;
  height:60px!important;padding:5px!important;
  backdrop-filter:blur(19px) saturate(1.35)!important;
  -webkit-backdrop-filter:blur(19px) saturate(1.35)!important;
  box-shadow:0 4px 18px #0004!important
 }
 body.pvReelsMode .pvIconRail .pvRailButton{
  color:#fff!important;border-radius:999px!important;height:48px!important
 }
 body.pvReelsMode .pvIconRail .pvRailButton.active{
  background:rgba(238,244,255,.26)!important;color:#fff!important
 }
}
@media(max-width:700px) and (max-height:680px){
 body.pvReelsMode .pvSuiteReelActions{gap:1px!important}
 body.pvReelsMode .pvSuiteIconAction{min-height:42px!important}
 body.pvReelsMode .pvSuiteIconAction svg{height:25px!important;width:25px!important;flex-basis:25px!important}
 body.pvReelsMode .pvReelCard .pvReelActions{bottom:calc(94px + var(--pv170NavOverlap,0px))!important}
 body.pvReelsMode .pvReelSound{bottom:calc(125px + var(--pv170NavOverlap,0px))!important}
 body.pvReelsMode .pvReelCaption.pv170Clamped{-webkit-line-clamp:1!important}
}
@media(prefers-reduced-motion:reduce){
 body.pvReelsMode .pvSuiteIconAction{transition:none!important}
}
`;
document.head.append(css);
/* iOS fixed viewport can put the pill navigation visually over the video.
   Measure its actual placement instead of guessing viewport/safe-area offsets. */
function placeOverlays(){
 if(!document.body.classList.contains('pvReelsMode'))return;
 const nav=document.querySelector('.pvIconRail');
 if(!nav||getComputedStyle(nav).display==='none')return;
 const rect=nav.getBoundingClientRect();
 document.querySelectorAll('#reels .pvReelScreen').forEach(screen=>{
  const videoRect=screen.getBoundingClientRect();
  const overlap=Math.max(0,Math.min(videoRect.height*.55,videoRect.bottom-rect.top+7));
  screen.style.setProperty('--pv170NavOverlap',Math.ceil(overlap)+'px');
  const seek=screen.querySelector('.pvReelSeek');
  const h=seek?Math.ceil(seek.getBoundingClientRect().height):44;
  screen.style.setProperty('--pv170SeekHeight',Math.max(36,h)+'px');
 });
}
let pv170Queued=false;
function queueOverlay(){
 if(pv170Queued)return;pv170Queued=true;
 requestAnimationFrame(()=>{pv170Queued=false;placeOverlays()});
}
function enhance(card){
 if(card.dataset.pv170Enhanced==='yes')return;
 const meta=card.querySelector('.pvReelMeta'),caption=meta?.querySelector('.pvReelCaption');
 if(!caption)return;
 queueOverlay();
 card.dataset.pv170Enhanced='yes';
 // The main rendering logic only creates the View profile action for OTHER
 // authors. Reuse the existing username click handler for the owner's Reel.
 const author=meta.querySelector('.pvReelAuthor');
 const who=author?.querySelector('.pvReelCreator');
 if(author&&who&&!author.querySelector('.pvReelFollow')){
  const view=document.createElement('button');
  view.type='button';
  view.className='pvReelFollow';
  view.textContent='View profile';
  view.addEventListener('click',event=>{
   event.stopPropagation();
   who.click();
  });
  author.append(view);
 }
 if(!caption.textContent.trim()){caption.classList.add('pv170NoCaption');return}
 const original=caption.textContent.trim();
 if(original.length<=88)return;
 caption.classList.add('pv170Clamped');
 const more=document.createElement('button');
 more.type='button';more.className='pv170MoreCaption';more.textContent='more';
 more.setAttribute('aria-label','Expand Reel caption');
 more.setAttribute('aria-expanded','false');
 more.addEventListener('click',e=>{
  e.stopPropagation();
  const expanded=caption.classList.toggle('pv170Clamped')===false;
  more.textContent=expanded?'less':'more';
  more.setAttribute('aria-label',expanded?'Collapse Reel caption':'Expand Reel caption');
  more.setAttribute('aria-expanded',String(expanded));
 });
 meta.append(more);
}
function scan(root=document){
 if(root.matches?.('.pvReelCard'))enhance(root);
 root.querySelectorAll?.('#reels .pvReelCard').forEach(enhance);
}
scan();
window.addEventListener('resize',queueOverlay,{passive:true});
window.addEventListener('orientationchange',queueOverlay,{passive:true});
window.visualViewport?.addEventListener('resize',queueOverlay,{passive:true});
document.querySelectorAll('.pvRailButton[data-rail-view]').forEach(b=>b.addEventListener('click',queueOverlay));
queueOverlay();
const reelRoot=document.getElementById('reelList')||document.getElementById('reels');
if(reelRoot){
 const observer=new MutationObserver(records=>{
  for(const record of records)for(const child of record.addedNodes){
   if(child.nodeType===1)scan(child);
  }
  queueOverlay();
 });
 observer.observe(reelRoot,{childList:true,subtree:true});
}
})();
