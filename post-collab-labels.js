/* PAVORA v70: show accepted collaborators and tagged accounts beneath post headers. */
(()=>{
'use strict';
const kit=window.PVKit,db=kit?.db;if(!db)return;
const css=document.createElement('style');
css.textContent='.pvPostSocialLabels{display:flex;gap:7px;flex-wrap:wrap;padding:0 14px 9px;color:#cbb4ed;font-size:11px;font-weight:650}.pvPostSocialLabels span{border:1px solid #584370;border-radius:999px;padding:4px 8px;background:#241a32}.pvPostSocialLabels:empty{display:none}';
document.head.append(css);
const root=document.getElementById('posts');if(!root)return;
let timer=null,version=0,lastKey='';
function ids(){return [...root.querySelectorAll('article.post[id^="pv-post-"]')].map(el=>el.id.slice('pv-post-'.length)).filter(id=>/^[a-f0-9-]{36}$/i.test(id)).slice(0,50)}
async function update(){
 const list=ids();if(!list.length)return;
 const key=list.join(',');
 if(key===lastKey&&root.querySelector('.pvPostSocialLabels'))return;
 lastKey=key;const ticket=++version;
 const [collabs,tags]=await Promise.all([
  db.from('pv_post_collaborators').select('post_id,collaborator_id').eq('status','accepted').in('post_id',list),
  db.from('pv_post_tags').select('post_id,tagged_user_id').in('post_id',list)
 ]);
 if(collabs.error||tags.error){console.warn('PAVORA post labels:',(collabs.error||tags.error).message);return}
 const userIds=[...new Set([...(collabs.data||[]).map(v=>v.collaborator_id),...(tags.data||[]).map(v=>v.tagged_user_id)])];
 const profiles=userIds.length?await db.from('profiles').select('id,username').in('id',userIds):{data:[],error:null};
 if(profiles.error||ticket!==version)return;
 const names=new Map((profiles.data||[]).map(p=>[p.id,p.username]));
 for(const id of list){
  const card=document.getElementById('pv-post-'+id);if(!card)continue;
  let row=card.querySelector('.pvPostSocialLabels');
  if(!row){row=document.createElement('div');row.className='pvPostSocialLabels';card.querySelector('.posthead')?.after(row)}
  row.replaceChildren();
  for(const c of (collabs.data||[]).filter(c=>c.post_id===id)){
   const name=names.get(c.collaborator_id);if(!name)continue;
   const chip=document.createElement('span');chip.textContent='✦ With @'+name;row.append(chip);
  }
  for(const t of (tags.data||[]).filter(t=>t.post_id===id)){
   const name=names.get(t.tagged_user_id);if(!name)continue;
   const chip=document.createElement('span');chip.textContent='⌁ @'+name;row.append(chip);
  }
 }
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>update().catch(e=>console.warn('PAVORA social labels:',e.message)),300)}
const observer=new MutationObserver(mutations=>{
 if(mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('article.post')||n.querySelector?.('article.post'))))) {lastKey='';schedule()}
});
observer.observe(root,{childList:true,subtree:false});
schedule();setInterval(()=>{lastKey='';schedule()},45000);
})();
