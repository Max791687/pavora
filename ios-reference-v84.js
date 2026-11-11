/* PAVORA v84 — reference screen structure with actual existing actions. */
(()=>{
'use strict';
const icons={
 post:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.8"/><path d="m4 17 5-5 4 3 3-3 4 5"/>',
 reel:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M8 3l4 6M15 3l4 6"/><path d="m10 12 5 3-5 3z"/>',
 story:'<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>',
 live:'<path d="M12 6a6 6 0 0 1 0 12M8 9a4 4 0 0 0 0 6M16 9a4 4 0 0 1 0 6"/><circle cx="12" cy="12" r="2"/>'
};
const svg=t=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[t]+'</svg>';
const tile=(type,name,sub)=>{
 const b=document.createElement('button');b.type='button';b.className='pvIOSCreateTile';b.dataset.type=type;
 b.innerHTML=svg(type)+'<strong>'+name+'</strong><span>'+sub+'</span>';return b;
};
function showCreate(){
 const card=document.querySelector('.pvComposeOverlay .pvUnifiedCreate');
 if(!card||card.querySelector('.pvIOSCreateChooser'))return;
 const drop=card.querySelector('.pvCreateDrop');
 if(!drop)return;
 const chooser=document.createElement('div');chooser.className='pvIOSCreateChooser';
 const post=tile('post','Post','Photo or video'),reel=tile('reel','Reel','Short video'),story=tile('story','Story','24h update'),live=tile('live','Live','Go live');
 chooser.append(post,reel,story,live);
 const links=document.createElement('div');links.className='pvIOSCreateSub';
 const upload=document.createElement('button');upload.type='button';upload.textContent='▧   Upload from Gallery   ›';
 const draft=document.createElement('button');draft.type='button';draft.textContent='▤   Drafts   ›';
 links.append(upload,draft);
 drop.before(chooser);
 drop.before(links);
 const input=card.querySelector('.pvUnifiedFile');
 const pick=accept=>{if(!input)return;input.accept=accept;input.click()};
 post.onclick=()=>pick('image/jpeg,image/png,image/webp,video/*');
 reel.onclick=()=>pick('video/*');
 upload.onclick=()=>pick('image/jpeg,image/png,image/webp,video/*');
 story.onclick=()=>{
  // Use an existing story composer. Never claim the selected media is a story if unavailable.
  const add=document.querySelector('.pvStoryAdd,#stories [data-action="add-story"],#stories [aria-label*="Add"][aria-label*="story"]');
  if(add){card.querySelector('.pvComposeClose')?.click();requestAnimationFrame(()=>add.click())}
  else window.PVKit?.notify?.('Open Your Story from Home to create a story.');
 };
 live.onclick=()=>window.PVKit?.notify?.('Live broadcasting is not available in this version.');
 draft.onclick=()=>{
  const match=[...document.querySelectorAll('button')].find(x=>x!==draft&&/draft/i.test(x.textContent||'')&&x.closest('#profile'));
  if(match){card.querySelector('.pvComposeClose')?.click();document.querySelector('aside.left [data-view="profile"]')?.click();match.click()}
  else window.PVKit?.notify?.('Drafts are available while composing a post.');
 };
}
function improveNavigation(){
 const rail=document.querySelector('.pvIconRail');
 if(!rail)return;
 const home=rail.querySelector('[data-rail-view="home"]');
 const explore=rail.querySelector('[data-rail-view="explore"]');
 const reels=rail.querySelector('[data-rail-view="reels"]');
 const messages=rail.querySelector('[data-rail-view="messages"]');
 const profile=rail.querySelector('[data-rail-view="profile"]');
 for(const el of [home,explore,reels,messages,profile])if(el)el.classList.add('pvIOSMainTab');
 // Preserve desktop rail order; CSS handles correct mobile order.
}
function mount(){showCreate();improveNavigation()}
mount();
let scheduled=false;
const observer=new MutationObserver(mutations=>{
 if(!mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&n.matches?.('.pvComposeOverlay,.pvIconRail'))))return;
 if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount()});
});
observer.observe(document.body,{childList:true,subtree:true});
})();
