/* PAVORA Smart Reels v39.
   Explainable on-device feed ranking using private authenticated engagement records.
   Supabase RLS governs every read; no service-role credentials or external AI API. */
(()=>{
'use strict';
const key=uid=>'pavora-smart-reels-mode:'+uid;
let mode='for-you';
function getMode(uid){try{return localStorage.getItem(key(uid))==='following'?'following':'for-you'}catch{return mode}}
function setMode(uid,value){mode=value==='following'?'following':'for-you';try{localStorage.setItem(key(uid),mode)}catch{}return mode}
function ids(rows,field){return new Set((rows||[]).map(r=>r[field]).filter(Boolean))}
const safely=async(query)=>{try{const {data,error}=await query;if(error){console.warn('Smart Reels signal skipped:',error.message);return []}return data||[]}catch(e){console.warn('Smart Reels signal unavailable:',e);return []}};
async function rank(db,user,reels,requestedMode){
 if(!db||!user||!Array.isArray(reels))return reels||[];
 const selected=requestedMode==='following'?'following':'for-you';
 const videoIds=reels.map(r=>r.id);
 const [follows,myLikes,mySaves,myViews,hidden,allLikes,allViews]=await Promise.all([
  safely(db.from('follows').select('following_id').eq('follower_id',user.id).limit(500)),
  safely(db.from('reel_likes').select('reel_id').eq('user_id',user.id).limit(1500)),
  safely(db.from('saved_media').select('reel_id').eq('user_id',user.id).not('reel_id','is',null).limit(1500)),
  safely(db.from('reel_views').select('reel_id').eq('user_id',user.id).limit(1500)),
  videoIds.length?safely(db.from('pv_reel_preferences').select('reel_id').eq('user_id',user.id).eq('not_interested',true).in('reel_id',videoIds)):[],
  videoIds.length?safely(db.from('reel_likes').select('reel_id,user_id').in('reel_id',videoIds).limit(3500)):[],
  videoIds.length?safely(db.from('reel_views').select('reel_id,user_id').in('reel_id',videoIds).limit(3500)):[]
 ]);
 const following=ids(follows,'following_id'),mineLiked=ids(myLikes,'reel_id'),mineSaved=ids(mySaves,'reel_id'),seen=ids(myViews,'reel_id'),excluded=ids(hidden,'reel_id');
 const byAuthor=new Map();
 for(const like of myLikes){const r=reels.find(v=>v.id===like.reel_id);if(r)byAuthor.set(r.author_id,(byAuthor.get(r.author_id)||0)+3)}
 for(const saved of mySaves){const r=reels.find(v=>v.id===saved.reel_id);if(r)byAuthor.set(r.author_id,(byAuthor.get(r.author_id)||0)+5)}
 const likeCounts=new Map(),viewCounts=new Map();
 for(const l of allLikes)likeCounts.set(l.reel_id,(likeCounts.get(l.reel_id)||0)+1);
 for(const v of allViews)viewCounts.set(v.reel_id,(viewCounts.get(v.reel_id)||0)+1);
 let filtered=reels.filter(r=>!excluded.has(r.id));
 if(selected==='following')filtered=filtered.filter(r=>following.has(r.author_id));
 if(selected==='following')return filtered.sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
 const now=Date.now(),authorsShown=new Map();
 // Score high-quality signals and new content, while reducing already-watched repeats.
 const scored=filtered.map(r=>{
  const ageDays=Math.max(0,(now-Date.parse(r.created_at))/86400000)||0;
  const engagement=Math.min(12,(likeCounts.get(r.id)||0)*2)+Math.min(8,Math.sqrt(viewCounts.get(r.id)||0)*1.4);
  const affinity=Math.min(18,byAuthor.get(r.author_id)||0);
  const score=13/(1+ageDays/5)+engagement+affinity+(following.has(r.author_id)?5:0)
   +(mineSaved.has(r.id)?2:0)+(mineLiked.has(r.id)?1:0)-(seen.has(r.id)?13:0);
  return {r,score};
 }).sort((a,b)=>b.score-a.score || Date.parse(b.r.created_at)-Date.parse(a.r.created_at));
 // Diversity: avoid serving too many consecutive videos from one author.
 const result=[];
 while(scored.length){
  let candidate=scored.findIndex(x=>(authorsShown.get(x.r.author_id)||0)<Math.ceil((result.length+1)/3));
  if(candidate<0)candidate=0;
  const [item]=scored.splice(candidate,1);
  authorsShown.set(item.r.author_id,(authorsShown.get(item.r.author_id)||0)+1);result.push(item.r);
 }
 return result;
}
async function notInterested(db,uid,reelId){
 const {error}=await db.from('pv_reel_preferences').upsert({user_id:uid,reel_id:reelId,not_interested:true,updated_at:new Date().toISOString()},{onConflict:'user_id,reel_id'});
 if(error)throw error;
}
function createTabs(parent,uidSource,onChange){
 const uid=()=>typeof uidSource==='function'?uidSource():uidSource;
 const wrap=document.createElement('div');wrap.className='pvSmartReelTabs';wrap.setAttribute('role','tablist');wrap.setAttribute('aria-label','Reels feed');
 const buttons=[];
 function render(){
  const current=getMode(uid());
  for(const b of buttons){const active=b.dataset.mode===current;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1}
 }
 for(const [id,label] of [['for-you','For You'],['following','Following']]){
  const b=document.createElement('button');b.type='button';b.className='pvSmartReelTab';b.dataset.mode=id;b.setAttribute('role','tab');b.textContent=label;
  b.onclick=()=>{if(getMode(uid())===id)return;setMode(uid(),id);render();onChange(id)};
  wrap.append(b);buttons.push(b);
 }
 render();parent.append(wrap);return wrap;
}
const css=document.createElement('style');css.textContent=`
#reels .pvSmartReelTabs{position:absolute;top:11px;left:50%;transform:translateX(-50%);z-index:16;display:flex;align-items:center;gap:9px;background:#090a0eb8;backdrop-filter:blur(13px);border:1px solid #ffffff31;border-radius:999px;padding:4px;box-shadow:0 5px 20px #0006;white-space:nowrap}
#reels .pvSmartReelTab{border:0;background:transparent;color:#b8b9bf;border-radius:999px;font-weight:800;font-size:12px;padding:8px 14px;cursor:pointer}
#reels .pvSmartReelTab.active{background:#ffffff24;color:#fff}
#reels .pvSmartReelEmpty{display:flex;align-items:center;flex-direction:column;justify-content:center;gap:13px;padding:35px 25px;color:#f7f5ff;text-align:center;height:100%;min-height:270px;box-sizing:border-box}
#reels .pvSmartReelEmpty strong{font-size:19px}
#reels .pvSmartReelEmpty p{font-size:13px;max-width:280px;color:#c3bdd1;line-height:1.5}
#reels .pvSmartReelEmpty button{border:0;border-radius:999px;padding:11px 16px;background:#8451e0;color:#fff;font-weight:800}
#reels .pvSmartNotInterested{position:absolute;right:65px;top:12px;z-index:9;border:1px solid #ffffff55;border-radius:999px;background:#15151abc;color:#fff;font-size:11px;font-weight:700;padding:7px 10px}
#reels .pvSmartNotInterested:focus-visible,#reels .pvSmartReelTab:focus-visible{outline:2px solid #ddbbff}
@media(max-width:700px){#reels .pvSmartReelTabs{top:8px;gap:3px}#reels .pvSmartReelTab{font-size:12px;padding:7px 12px}#reels .pvSmartNotInterested{top:51px;right:10px;font-size:10px;padding:6px 9px}}
`;document.head.append(css);
window.PAVORA_SMART_REELS={rank,getMode,setMode,notInterested,createTabs};
})();