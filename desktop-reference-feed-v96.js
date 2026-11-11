/* PAVORA v96 — show real creator discovery beside real Stories.
   Suggested accounts are NOT labeled as Stories; no synthetic Stories or engagement.
   Existing story buttons/viewers remain controlled by social-suite.js.
*/
(()=>{
'use strict';
const kit=window.PVKit;
if(!kit?.db)return;
const bar=document.getElementById('stories');
if(!bar)return;
const desktop=()=>window.matchMedia('(min-width:901px)').matches;
let ownerId=null,suggestions=[],loading=false,lastLoad=0,queued=false;
function initials(name){
 return String(name||'?').trim().slice(0,1).toUpperCase()||'?';
}
function goExplore(name){
 const nav=document.querySelector('.pvIconRail [data-rail-view="explore"]')||
  document.querySelector('aside.left [data-view="explore"]');
 nav?.click();
 const focus=()=>{
  const search=document.querySelector('#explore .pvExploreSearch');
  if(!search)return;
  search.value=name;
  search.dispatchEvent(new Event('input',{bubbles:true}));
  search.focus({preventScroll:true});
 };
 requestAnimationFrame(()=>requestAnimationFrame(focus));
}
function display(){
 if(!desktop()){
  bar.querySelectorAll('.pv96Creator,.pv96CreatorDivider').forEach(n=>n.remove());
  return;
 }
 // Remove only our own suggestions, never modify story playback buttons.
 bar.querySelectorAll('.pv96Creator,.pv96CreatorDivider').forEach(n=>n.remove());
 if(!suggestions.length)return;
 const realStoryAuthors=new Set([...bar.querySelectorAll('.pvStoryAdd small')].map(el=>el.textContent.trim().toLowerCase()));
 const available=suggestions.filter(p=>!realStoryAuthors.has((p.username||'').toLowerCase())).slice(0,6);
 if(!available.length)return;
 const divider=document.createElement('span');divider.className='pv96CreatorDivider';
 divider.setAttribute('aria-hidden','true');bar.append(divider);
 for(const person of available){
  const b=document.createElement('button');b.type='button';b.className='pv96Creator';
  const avatar=document.createElement('span');avatar.className='pv96CreatorAvatar';
  if(person.avatar_url){
   const img=document.createElement('img');img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';
   img.src=person.avatar_url;img.onerror=()=>{img.remove();avatar.textContent=initials(person.username)};
   avatar.append(img);
  }else avatar.textContent=initials(person.username);
  const label=document.createElement('small');label.textContent=person.username||'Creator';
  b.title='Discover @'+(person.username||'creator')+' · not an active Story';
  b.setAttribute('aria-label','Discover creator '+(person.username||'creator'));
  b.append(avatar,label);
  b.onclick=()=>goExplore(person.username||'');
  bar.append(b);
 }
}
async function reload(force=false){
 const id=kit.getUser?.()?.id;
 if(!id){suggestions=[];ownerId=null;display();return}
 if(loading)return;
 if(!force&&id===ownerId&&Date.now()-lastLoad<90000)return;
 ownerId=id;lastLoad=Date.now();loading=true;
 try{
  const {data,error}=await kit.db.from('profiles')
   .select('id,username,avatar_url')
   .neq('id',id).limit(12);
  if(error)throw error;
  if(kit.getUser?.()?.id!==id)return;
  suggestions=(data||[]).filter(p=>!!p.username);
 }catch(e){
  suggestions=[];
  console.warn('Creator suggestions unavailable:',e?.message||e);
 }finally{loading=false;display()}
}
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;display()});
}
const observer=new MutationObserver(mutations=>{
 if(!desktop())return;
 if(mutations.some(m=>[...m.removedNodes,...m.addedNodes].some(n=>n.nodeType===1&&!n.matches?.('.pv96Creator,.pv96CreatorDivider'))))schedule();
});
observer.observe(bar,{childList:true});
window.addEventListener('resize',()=>{display();reload(false)},{passive:true});
kit.db.auth.onAuthStateChange?.(()=>setTimeout(()=>reload(true),0));
reload();
setInterval(()=>{if(!document.hidden&&desktop())reload()},120000);
})();
