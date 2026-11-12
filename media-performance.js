/* PAVORA Performance v175 — incremental, media-only DOM work.
 * Never alter Reel playback/buffering, authentication or navigation.
 * Only new DOM subtrees are considered; existing elements are not rescanned.
 */
(()=>{
'use strict';
const optimized='data-pv-optimized';
const canOptimizeImage=img=>!img.closest('.pvReelCard,.pvStoryViewer,.pvChatArea,.pvoMediaThumb');
const canOptimizeVideo=video=>!video.closest('.pvReelCard,.pvStoryViewer,.pvChatArea');
function optimize(node){
 if(!(node instanceof Element)||node.hasAttribute(optimized))return;
 if(node.localName==='img'){
  node.setAttribute(optimized,'true');
  node.decoding='async';
  if(canOptimizeImage(node)&&!node.hasAttribute('loading'))node.loading='lazy';
 }else if(node.localName==='video'){
  node.setAttribute(optimized,'true');
  // Respect existing controllers (especially Reels' adjacent-video buffering).
  if(!canOptimizeVideo(node))return;
  node.playsInline=true;
  if(!node.autoplay&&!node.hasAttribute('preload'))node.preload='metadata';
 }
}
function optimizeTree(root){
 if(!(root instanceof Element))return;
 optimize(root);
 // A subtree from one append is inspected once, not on every unrelated
 // mutation elsewhere in the application.
 for(const item of root.querySelectorAll('img:not([data-pv-optimized]),video:not([data-pv-optimized])'))optimize(item);
}
const pending=new Set();
let scheduled=false;
function flush(){
 scheduled=false;
 if(document.hidden){pending.clear();return}
 const roots=[...pending];pending.clear();
 for(const root of roots){
  if(root.isConnected)optimizeTree(root);
 }
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(flush);
}
const observer=new MutationObserver(records=>{
 for(const record of records){
  for(const node of record.addedNodes){
   if(!(node instanceof Element))continue;
   // Ancestors already queued cover all descendant media exactly once.
   if([...pending].some(root=>root.contains(node)))continue;
   for(const root of [...pending])if(node.contains(root))pending.delete(root);
   pending.add(node);
  }
 }
 if(pending.size)schedule();
});
function begin(){
 optimizeTree(document.body);
 observer.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&pending.size)schedule();
 });
}
if(document.body)begin();
else document.addEventListener('DOMContentLoaded',begin,{once:true});
})();
