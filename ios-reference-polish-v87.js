/* PAVORA v87 — iPhone reference structure. Keeps existing handlers and real data. */
(()=>{
'use strict';
const mobile=()=>matchMedia('(max-width:600px)').matches;
const SVG={
like:'<path d="M20.8 4.6a5.2 5.2 0 0 0-7.3 0L12 6.1l-1.5-1.5a5.2 5.2 0 0 0-7.3 7.3L12 20.7l8.8-8.8a5.2 5.2 0 0 0 0-7.3Z"/>',
comment:'<path d="M20 11.5a8 8 0 0 1-8.5 8 8 8 0 0 1-3.2-.9L3 20l1.5-4.8a8 8 0 1 1 15.5-3.7Z"/>',
save:'<path d="M5 3.7h14v17l-7-5-7 5v-17Z"/>',
share:'<path d="m21 3-8.6 18-3.4-7.8L2 10.2 21 3Z"/><path d="M21 3 9 13.2"/>',
report:'<path d="M5 21V3"/><path d="M5 4h14l-4 5 4 5H5"/>'
};
function icon(kind){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 24 24');
 svg.setAttribute('aria-hidden','true');
 svg.innerHTML=SVG[kind];
 svg.dataset.pvReferenceIcon=kind;
 return svg;
}
function decorateActions(){
 if(!mobile())return;
 const root=document.getElementById('posts');if(!root)return;
 for(const foot of root.querySelectorAll(':scope > article.post > .postfoot')){
  for(const button of foot.querySelectorAll(':scope > button')){
   const label=(button.textContent||'').toLowerCase();
   const kind=label.includes('like')||/^[♡♥]/.test(label)?'like':
    label.includes('comment')?'comment':
    label.includes('saved')||label.includes('save')?'save':
    label.includes('share')?'share':
    label.includes('report')?'report':null;
   if(!kind)continue;
   button.classList.add('pvNativeFooterIcon');
   if(kind==='report')button.classList.add('pvNativeReport');
   // Existing handlers may replace button.textContent on likes; restore only the icon.
   const existing=button.querySelector('svg[data-pv-reference-icon]');
   if(!existing)button.prepend(icon(kind));
   else if(existing.dataset.pvReferenceIcon!==kind)existing.replaceWith(icon(kind));
  }
 }
}
function arrangeProfile(){
 if(!mobile())return;
 const profile=document.getElementById('profile');
 const panel=profile?.querySelector('.pvProfile');
 if(!panel)return;
 const edit=panel.querySelector('#pvEditToggle'),settings=panel.querySelector('.pvMobileSettings');
 if(edit&&settings&&edit.nextElementSibling!==settings)edit.after(settings);
 const hub=panel.querySelector('#pvOfficialHub');
 if(hub&&!hub.closest('details.pvMobileOfficialDetails')){
  const wrap=document.createElement('details');
  wrap.className='pvMobileOfficialDetails';
  const summary=document.createElement('summary');
  summary.textContent='PAVORA Official · Updates & announcements';
  wrap.append(summary);
  hub.before(wrap);
  wrap.append(hub);
 }
 // Empty highlights are honest; keep their placeholder concise and understated.
 for(const el of panel.querySelectorAll('p,div')){
  if(el.children.length===0&&/No Highlights yet\. Open your Story and choose Add to Highlights\./.test(el.textContent||'')){
   el.classList.add('pvHighlightsEmpty');
   el.textContent='No highlights yet · Add from your Story';
  }
 }
}
let queued=false;
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;arrangeProfile();decorateActions()});
}
arrangeProfile();decorateActions();
const observer=new MutationObserver(records=>{
 if(!mobile())return;
 if(records.some(record=>[...record.addedNodes].some(n=>{
  if(n.nodeType!==1)return false;
  if(n.matches?.('article.post,.postfoot,#pvProfileHead,#pvOfficialHub,.pvMobileSettings,.pvHighlight,.pvNoHighlights,.pvHighlightsEmpty'))return true;
  if(n.matches?.('svg[data-pv-reference-icon]'))return false;
  if(n.matches?.('button')&&n.closest?.('#posts .postfoot'))return true;
  return !!n.querySelector?.('article.post,.postfoot,#pvProfileHead,#pvOfficialHub');
 })))schedule();
});
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('resize',schedule,{passive:true});
document.addEventListener('pv:post-published',schedule);
})();
