/* PAVORA Creator Hub v41
   Creator Analytics • Admin report review • Growth suggestions • Data saver.
   All privileged reads are enforced server-side by Supabase RLS/RPC grants. */
(()=>{
'use strict';
const kit=window.PVKit;if(!kit)return;
const db=kit.db;
const own=()=>kit.getUser();
const n=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
const fmt=n=>Number(n||0).toLocaleString('en-IN');
const safe=async op=>{try{const r=await op;if(r.error)throw r.error;return r.data||[]}catch(e){console.warn('Creator Hub:',e.message);throw e}};
const uid=()=>own()?.id;
const dataSaver=()=>{try{return localStorage.getItem('pavora-data-saver')==='on'||!!navigator.connection?.saveData}catch{return false}};
const css=n('style');
css.textContent=`
.pvHubLauncher{border:1px solid #9f80ba50!important;border-radius:999px!important;color:#f7ecff!important;background:#503375c9!important;padding:8px 12px!important;font-size:12px!important;font-weight:800!important;white-space:nowrap}
.pvHubLauncher:hover{background:#6f4da0!important}
#pvCreatorHub{position:fixed;inset:0;z-index:210;background:#08070be8;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:15px;color:#f7f3ff}
#pvCreatorHub[hidden]{display:none!important}
.pvHubPanel{width:min(930px,100%);height:min(790px,94dvh);display:flex;flex-direction:column;background:#17151f;border:1px solid #4d3b60;border-radius:20px;box-shadow:0 28px 80px #000b;overflow:hidden}
.pvHubHead{display:flex;align-items:center;gap:12px;justify-content:space-between;padding:16px 20px;background:#201a2b;border-bottom:1px solid #3c3048;flex:none}
.pvHubHead strong{font-size:19px}.pvHubHead small{display:block;color:#aea4b7;font-size:11px;margin-top:3px}
.pvHubClose{background:#30273b;color:#fff;border:0;border-radius:10px;width:38px;height:38px;font-size:23px}
.pvHubTabs{display:flex;gap:5px;padding:9px 12px;overflow-x:auto;flex:none;border-bottom:1px solid #382f40}
.pvHubTab{border:0;border-radius:9px;padding:10px 13px;white-space:nowrap;background:transparent;color:#c4b6d2;font-size:12px;font-weight:750}
.pvHubTab.active{background:#694497;color:white}
.pvHubContent{padding:20px;flex:1;min-height:0;overflow:auto;overscroll-behavior:contain}
.pvHubContent h3{font-size:19px;margin:0 0 13px}.pvHubContent p{color:#bab0c7;font-size:13px;line-height:1.5}
.pvHubStats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:15px 0}
.pvHubStat{background:#292233;border:1px solid #463752;border-radius:13px;padding:15px;min-width:0}
.pvHubStat strong{font-size:23px;color:#fff;display:block;font-variant-numeric:tabular-nums}
.pvHubStat span{font-size:11px;color:#b5a7c5}
.pvHubCard{padding:13px 14px;margin:10px 0;border:1px solid #3d3349;background:#211d29;border-radius:12px;display:flex;gap:12px;justify-content:space-between;align-items:center;min-width:0}
.pvHubCardMain{flex:1;min-width:0}.pvHubCardMain strong{font-size:13px;overflow-wrap:anywhere}.pvHubCardMain small{display:block;font-size:11px;color:#b3a4c3;margin:5px 0}
.pvHubBtn{background:#7048b2;color:#fff;border:0;border-radius:9px;font-size:12px;padding:10px 13px;font-weight:750;white-space:nowrap;cursor:pointer}
.pvHubBtn:disabled{opacity:.5;cursor:wait}.pvHubBtn.secondary{background:#383040}
.pvHubChart{margin:6px 0 15px;display:flex;align-items:end;height:120px;gap:8px;padding:15px;border:1px solid #42334c;background:#201a29;border-radius:13px}
.pvHubBar{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:end;gap:4px;align-items:center;height:100%}
.pvHubBar div{background:linear-gradient(#c078f1,#724bba);border-radius:6px 6px 0 0;width:100%;max-width:44px;min-height:2px}
.pvHubBar small{font-size:9px;color:#b9adcb}
.pvHubMuted{font-size:12px;color:#b1a6c1}
.pvHubError{padding:14px;border:1px solid #a64b64;background:#4d2532;border-radius:11px;color:#ffdbe2;font-size:12px}
.pvHubSelect{background:#302a39;color:white;border:1px solid #665276;padding:9px;border-radius:8px;max-width:100%}
.pvHubDivider{border:0;border-top:1px solid #3e3248;margin:18px 0}
@media(max-width:700px){#pvCreatorHub{padding:0}.pvHubPanel{width:100%;height:100dvh;border-radius:0;border:0}.pvHubContent{padding:13px 12px 95px}.pvHubStats{grid-template-columns:repeat(2,minmax(0,1fr))}.pvHubHead{padding:12px 14px}.pvHubLauncher{padding:7px 9px!important;font-size:11px!important}.pvHubCard{padding:12px 10px}.pvHubCardMain small{font-size:10px}}
`;
document.head.append(css);
const overlay=n('section');overlay.id='pvCreatorHub';overlay.hidden=true;
overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','PAVORA Creator Hub');
const panel=n('div','pvHubPanel'),head=n('div','pvHubHead'),headInfo=n('div'),title=n('strong','','PAVORA Creator Hub'),subtitle=n('small','','Analytics · Growth · Performance'),close=n('button','pvHubClose','×');
close.type='button';close.setAttribute('aria-label','Close Creator Hub');headInfo.append(title,subtitle);head.append(headInfo,close);
const tabs=n('nav','pvHubTabs'),body=n('div','pvHubContent');panel.append(head,tabs,body);overlay.append(panel);document.body.append(overlay);
const launcher=n('button','pvHubLauncher','✦ Creator Hub');launcher.type='button';launcher.title='Creator Analytics, Growth and tools';
const profilePanel=document.querySelector('#profile > .panel');
profilePanel?.prepend(launcher);
let selected='analytics',isAdmin=false,sessionId=null,requested=0;
function clear(){body.replaceChildren()}
function text(tag,cls,t,parent=body){const node=n(tag,cls,t);parent.append(node);return node}
function error(msg){text('div','pvHubError',msg)}
function button(label,fn,cls=''){const b=n('button','pvHubBtn '+cls,label);b.type='button';b.onclick=fn;return b}
function stat(value,label){const box=n('div','pvHubStat');box.append(n('strong','',fmt(value)),n('span','',label));return box}
function renderTabs(){
 tabs.replaceChildren();
 for(const [id,name] of [['analytics','📊 Analytics'],['growth','✨ Growth'],['performance','⚡ Performance'],...(isAdmin?[['moderation','🛡 Moderation']]:[])]){
  const b=n('button','pvHubTab'+(selected===id?' active':''),name);b.type='button';
  b.onclick=()=>{selected=id;renderTabs();render()};tabs.append(b);
 }
}
function open(){if(!uid())return;overlay.hidden=false;document.body.classList.add('pvHubOpen');selected='analytics';sessionId=uid();verifyAdmin().then(()=>{if(!overlay.hidden){renderTabs();render()}});}
function shutdown(){overlay.hidden=true;document.body.classList.remove('pvHubOpen');requested++;clear()}
launcher.onclick=open;close.onclick=shutdown;overlay.addEventListener('click',e=>{if(e.target===overlay)shutdown()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)shutdown()});
async function verifyAdmin(){
 isAdmin=false;
 const userId=uid();
 if(!userId)return;
 const {data,error}=await db.from('pv_app_admins').select('user_id').eq('user_id',userId).maybeSingle();
 if(!error&&uid()===userId)isAdmin=!!data;
}
function chart(values){
 const box=n('div','pvHubChart');const max=Math.max(...values.map(x=>x.value),1);
 for(const item of values){const col=n('div','pvHubBar'),bar=n('div'),label=n('small','',item.label);bar.style.height=Math.max(3,Math.round(item.value/max*83))+'%';bar.title=item.value+' views';col.append(bar,label);box.append(col)}
 body.append(box);
}
async function analytics(token){
 text('h3','','Your Creator Analytics');
 text('p','','Real figures from your posts, Reels and recorded engagement. Watch-time metrics are aggregate-only to protect viewer privacy.');
 const userId=uid();
 const [reels,posts,followers]=await Promise.all([
  safe(db.from('reels').select('id,caption,created_at').eq('author_id',userId).order('created_at',{ascending:false}).limit(60)),
  safe(db.from('posts').select('id,caption,created_at').eq('author_id',userId).order('created_at',{ascending:false}).limit(60)),
  db.from('follows').select('follower_id',{count:'exact',head:true}).eq('following_id',userId)
 ]);
 if(token!==requested||userId!==uid())return;
 const entries=await Promise.all(reels.map(async reel=>{
  try{const r=await db.rpc('pv_creator_reel_stats',{p_reel:reel.id});if(r.error)throw r.error;return {...reel,...(r.data?.[0]||{})}}
  catch(e){console.warn('Creator stats:',e.message);return {...reel,unique_views:0,total_likes:0,total_saves:0,average_watch_seconds:0,completion_rate:0,failed:true}}
 }));
 if(token!==requested||userId!==uid())return;
 const views=entries.reduce((n,r)=>n+Number(r.unique_views||0),0);
 const likes=entries.reduce((n,r)=>n+Number(r.total_likes||0),0);
 const metrics=n('div','pvHubStats');metrics.append(stat(posts.length,'Recent posts'),stat(reels.length,'Recent Reels'),stat(views,'Unique Reel views'),stat(followers.count||0,'Followers'));body.append(metrics);
 if(entries.length){
  text('h3','','Top Reels');
  chart(entries.slice(0,7).map((r,i)=>({label:String(i+1),value:Number(r.unique_views||0)})));
  for(const reel of [...entries].sort((a,b)=>Number(b.unique_views||0)-Number(a.unique_views||0)).slice(0,15)){
   const item=n('div','pvHubCard'),main=n('div','pvHubCardMain');
   main.append(n('strong','',reel.caption?.trim().slice(0,90)||'Untitled Reel'));
   main.append(n('small','',fmt(reel.unique_views)+' views · '+fmt(reel.total_likes)+' likes · '+fmt(reel.total_saves)+' saves'));
   main.append(n('small','','Avg watch '+Number(reel.average_watch_seconds||0).toFixed(1)+'s · '+Number(reel.completion_rate||0).toFixed(1)+'% completion'+(reel.failed?' · Stats temporarily unavailable':'')));
   item.append(main);body.append(item);
  }
 }else text('p','pvHubMuted','Upload your first Reel to see performance insights here.');
 text('p','pvHubMuted','Recent posts/Reels are limited to 60 per type. Viewer counts represent unique accounts, not repeat plays.');
}
async function growth(token){
 text('h3','','Discover Rising Creators');
 text('p','','Follow active creators, discover their content and invite friends to build the PAVORA community.');
 const userId=uid();
 const [people,following,reels]=await Promise.all([
  safe(db.from('profiles').select('id,username,display_name,is_private').neq('id',userId).order('created_at',{ascending:false}).limit(70)),
  safe(db.from('follows').select('following_id').eq('follower_id',userId).limit(500)),
  safe(db.from('reels').select('author_id').order('created_at',{ascending:false}).limit(100))
 ]);
 if(token!==requested||userId!==uid())return;
 const already=new Set(following.map(r=>r.following_id)),counts=new Map();
 for(const reel of reels)counts.set(reel.author_id,(counts.get(reel.author_id)||0)+1);
 const eligible=people.filter(p=>!already.has(p.id)&&!p.is_private).sort((a,b)=>(counts.get(b.id)||0)-(counts.get(a.id)||0)).slice(0,15);
 const invite=button('↗ Invite friends',async()=>{
  const url=location.origin+location.pathname;
  try{if(navigator.share)await navigator.share({title:'Join me on PAVORA',url,text:'Discover creators on PAVORA!'});
   else{await navigator.clipboard.writeText(url);invite.textContent='✓ Invite link copied'}}
  catch(e){if(e.name!=='AbortError')alert('Could not share: '+e.message)}
 });
 body.append(invite);
 if(!eligible.length)text('p','pvHubMuted','No new public creators found right now.');
 for(const p of eligible){
  const card=n('div','pvHubCard'),main=n('div','pvHubCardMain');
  main.append(n('strong','','@'+(p.username||'creator')),n('small','',(p.display_name||'')+' · '+fmt(counts.get(p.id)||0)+' recent Reels'));
  const follow=button('＋ Follow',async()=>{
   follow.disabled=true;
   const {error}=await db.from('follows').insert({follower_id:userId,following_id:p.id});
   if(error){follow.disabled=false;alert('Could not follow: '+error.message)}
   else{follow.textContent='✓ Following';follow.classList.add('secondary')}
  });
  card.append(main,follow);body.append(card);
 }
}
function performance(){
 text('h3','','Performance Pro');
 text('p','','Control mobile data use and inspect current app performance without affecting your posts or messages.');
 const box=n('div','pvHubStats');
 box.append(stat(document.querySelectorAll('#reelList .pvReelCard').length,'Loaded Reel cards'),stat(document.querySelectorAll('#posts .post').length,'Rendered posts'));
 box.append(stat(navigator.onLine?1:0,'Online (1=yes)'),stat(dataSaver()?1:0,'Data Saver (1=on)'));body.append(box);
 const toggle=button(dataSaver()?'✓ Data Saver On':'Enable Data Saver',()=>{
  try{localStorage.setItem('pavora-data-saver',dataSaver()?'off':'on')}catch{}
  render();
 });
 body.append(toggle);
 text('p','pvHubMuted','Data Saver reduces preloading of adjacent Reels. It does not change original upload quality.');
 const nav=n('div','pvHubCard'),main=n('div','pvHubCardMain');main.append(n('strong','','Connection'),n('small','',navigator.connection?.effectiveType||'Browser network details unavailable'));nav.append(main);body.append(nav);
}
async function moderation(token){
 if(!isAdmin){error('Admin permissions required.');return}
 text('h3','','Moderation Queue');
 text('p','','Only verified admins can view reports. Review content and update report status. This does not automatically remove posts or ban accounts.');
 const reports=await safe(db.from('content_reports').select('id,reporter_id,target_kind,target_id,reason,details,status,created_at').order('created_at',{ascending:false}).limit(80));
 if(token!==requested||uid()!==sessionId)return;
 const stats=n('div','pvHubStats');stats.append(stat(reports.length,'Recent reports'),stat(reports.filter(r=>!r.status||['pending','open'].includes(r.status)).length,'Awaiting review'));body.append(stats);
 if(!reports.length)text('p','pvHubMuted','No reports in the moderation queue.');
 for(const report of reports){
  const card=n('div','pvHubCard'),main=n('div','pvHubCardMain');
  main.append(n('strong','','⚑ '+report.target_kind+' · '+report.reason));
  main.append(n('small','',(report.details||'No additional details').slice(0,200)));
  main.append(n('small','',new Date(report.created_at).toLocaleString()+' · '+(report.status||'pending')));
  const select=n('select','pvHubSelect');
  for(const status of ['pending','reviewing','resolved','dismissed']){
   const option=n('option','',status);option.value=status;if((report.status||'pending')===status)option.selected=true;select.append(option);
  }
  select.setAttribute('aria-label','Review report status');
  select.onchange=async()=>{
   select.disabled=true;
   const previous=report.status||'pending';
   const {error}=await db.from('content_reports').update({status:select.value}).eq('id',report.id);
   if(error){alert('Could not update review status: '+error.message);select.value=previous}
   else report.status=select.value;
   select.disabled=false;
  };
  card.append(main,select);body.append(card);
 }
}
async function render(){
 const token=++requested;const page=selected;clear();
 if(!uid()){shutdown();return}
 try{
  if(page==='analytics')await analytics(token);
  else if(page==='growth')await growth(token);
  else if(page==='performance')performance();
  else if(page==='moderation')await moderation(token);
 }catch(e){if(token===requested)error('Could not load '+page+': '+e.message)}
}
window.PAVORA_CREATOR_HUB={open,dataSaver};
})();
