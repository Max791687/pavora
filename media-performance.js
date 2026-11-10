/* PAVORA v70 progressive media-loading defaults: do not replace DOM nodes or reel controllers. */
(()=>{
'use strict';
const enhance=root=>{
 if(!root?.querySelectorAll)return;
 for(const img of root.querySelectorAll('img:not([data-pv-optimized])')){
  img.dataset.pvOptimized='true';img.decoding='async';
  if(!img.closest('.pvReelCard')&&!img.closest('.pvStoryViewer')&&!img.closest('.pvChatArea')&&!img.closest('.pvoMediaThumb'))img.loading='lazy';
 }
 for(const video of root.querySelectorAll('video:not([data-pv-optimized])')){
  video.dataset.pvOptimized='true';video.playsInline=true;
  if(!video.autoplay)video.preload='metadata';
 }
};
let scheduled=false;
const observer=new MutationObserver(()=>{
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;enhance(document)});
});
enhance(document);
observer.observe(document.body,{childList:true,subtree:true});
})();
