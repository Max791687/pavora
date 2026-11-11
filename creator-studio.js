/* PAVORA Creator Studio v70 — collaboration, tags, edits, photo tools & discovery.
   All permissioned writes remain enforced by Supabase RLS. */
(()=>{
'use strict';
const kit=window.PVKit,db=kit?.db;if(!db)return;
const uid=()=>kit.getUser()?.id||null;
const E=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
const css=E('style');css.textContent=[
'.pvStudioOpen{overflow:hidden}',
'#pvStudio[hidden]{display:none!important}',
'#pvStudio{position:fixed;inset:0;z-index:470;display:grid;place-items:center;padding:14px;background:#070610e8;color:#f7f1ff}',
'.pvsDialog{width:min(780px,100%);height:min(790px,94dvh);overflow:hidden;display:flex;flex-direction:column;background:#161222;border:1px solid #615078;border-radius:18px;box-shadow:0 22px 80px #000b}',
'.pvsHead{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:17px 18px;background:#29203b}',
'.pvsHead h2{font-size:19px;margin:0}.pvsTabs{display:flex;gap:5px;overflow-x:auto;padding:10px;border-bottom:1px solid #483a56}',
'.pvsTabs button,.pvsBtn{border:1px solid #70548b;color:#fff;background:#493265;border-radius:9px;padding:9px 12px;cursor:pointer;font-size:12px;font-weight:700}',
'.pvsTabs button[aria-selected=true]{background:#8250c1}.pvsBody{overflow-y:auto;padding:17px;flex:1}',
'.pvsRow{background:#251e33;border:1px solid #453650;padding:14px;border-radius:12px;margin-bottom:11px;overflow-wrap:anywhere}',
'.pvsRow strong{display:block;margin-bottom:5px}.pvsRow small{display:block;color:#baaccf;margin:4px 0 10px}',
'.pvsTools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:9px}',
'.pvsInput{width:100%;box-sizing:border-box;border:1px solid #6d5981;border-radius:9px;background:#130f1a;color:#fff;padding:11px;font-size:13px}',
'.pvsNotice{font-size:13px;color:#c6b6d8;margin-bottom:13px}',
'#pvStudioLauncher{display:inline-flex;align-items:center;justify-content:center;border:1px solid #8a69b4;background:#4c3271;color:#fff;border-radius:11px;padding:10px 13px;font-size:12px;font-weight:800;cursor:pointer;margin:8px 0}',
'.pvsDismiss{border:0;background:#473754;border-radius:9px;color:white;padding:8px 12px;cursor:pointer}',
'@media(prefers-reduced-motion:reduce){.pvStudioOpen *,#pvStudio *,#pvStudio *:before,#pvStudio *:after{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}',
'@media(max-width:600px){#pvStudio{padding:0}.pvsDialog{height:100dvh;width:100%;border-radius:0}.pvsBody{padding:11px}.pvsHead{padding:13px}}',
'/* Creator Studio v104: scoped Liquid Glass readability and touch targets */',
'#pvStudio .pvsDialog{background:linear-gradient(145deg,#fffafd,#f3ebff)!important;border:1px solid #dcc8f0!important;box-shadow:0 24px 75px #13082655!important;color:#2b1c3c!important}',
'#pvStudio .pvsHead{background:linear-gradient(110deg,#f3e6ff,#faf5ff)!important;border-bottom:1px solid #e5d3f2!important}',
'#pvStudio .pvsHead h2{color:#2e1c43!important;-webkit-text-fill-color:#2e1c43!important}',
'#pvStudio .pvsDismiss{min-height:42px!important;background:#633296!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:800!important}',
'#pvStudio .pvsTabs{background:#f9f3ff!important;border-bottom:1px solid #e5d4f0!important;scrollbar-width:thin}',
'#pvStudio .pvsTabs button{min-height:42px!important;flex:0 0 auto!important;background:#ede1fa!important;color:#4b2f64!important;-webkit-text-fill-color:#4b2f64!important;border:1px solid #dac5eb!important;font-size:13px!important}',
'#pvStudio .pvsTabs button[aria-selected="true"]{background:#643399!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border-color:#643399!important;box-shadow:0 4px 12px #6a359729!important}',
'#pvStudio .pvsBody{background:transparent!important;color:#362448!important}',
'#pvStudio .pvsRow{background:#fffaff!important;border:1px solid #e7d7ef!important;border-radius:14px!important;color:#2c1e3d!important;box-shadow:0 4px 12px #5b30800c!important}',
'#pvStudio .pvsRow strong{color:#2a1b3a!important;-webkit-text-fill-color:#2a1b3a!important}',
'#pvStudio .pvsRow small,#pvStudio .pvsNotice{color:#62516e!important;-webkit-text-fill-color:#62516e!important;line-height:1.55!important}',
'#pvStudio .pvsBtn{min-height:42px!important;background:#65369b!important;color:#fff!important;-webkit-text-fill-color:#fff!important;border-color:#65369b!important;font-weight:750!important}',
'#pvStudio .pvsBtn:disabled{opacity:.65!important}',
'#pvStudio .pvsInput{background:#fff!important;color:#251636!important;-webkit-text-fill-color:#251636!important;border:1px solid #cdb3e1!important;min-height:43px!important}',
'#pvStudio .pvsInput::placeholder{color:#82708d!important}',
'#pvStudio :is(button,input,textarea,select):focus-visible{outline:3px solid #9661d7!important;outline-offset:2px!important}',
'@media(max-width:600px){#pvStudio .pvsDialog{height:100dvh!important;border-radius:0!important}#pvStudio .pvsTabs{padding:9px!important}#pvStudio .pvsTabs button{font-size:12px!important}#pvStudio .pvsBody{padding:12px!important}}'
].join('');document.head.append(css);
const overlay=E('section');overlay.id='pvStudio';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','PAVORA Creator Studio');
const dialog=E('div','pvsDialog'),head=E('div','pvsHead'),heading=E('h2','','✦ Creator Studio'),dismiss=E('button','pvsDismiss','Close ×'),tabs=E('nav','pvsTabs'),body=E('div','pvsBody');
head.append(heading,dismiss);dialog.append(head,tabs,body);overlay.append(dialog);document.body.append(overlay);
let section='posts',ticket=0,launcher=null;
const names={posts:'My Posts',invitations:'Collab Invites',tags:'Tagged Posts',discover:'Discover',accessibility:'Accessibility'};
function row(title,detail){const item=E('article','pvsRow');item.append(E('strong','',title));if(detail)item.append(E('small','',detail));body.append(item);return item}
function btn(label,action){const b=E('button','pvsBtn',label);b.type='button';b.onclick=async()=>{b.disabled=true;try{await action()}catch(e){notice('Error: '+(e.message||e))}finally{b.disabled=false}};return b}
function notice(t){const p=E('p','pvsNotice',t);body.prepend(p)}
function open(){if(!uid())return;overlay.hidden=false;document.body.classList.add('pvStudioOpen');section='posts';renderTabs();render()}
function close(){overlay.hidden=true;document.body.classList.remove('pvStudioOpen');ticket++}
dismiss.onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close()});
function mount(){const panel=document.querySelector('#profile > .panel');if(!panel)return;
 if(!launcher){launcher=E('button');launcher.id='pvStudioLauncher';launcher.textContent='✦ Creator Studio';launcher.type='button';launcher.onclick=open}
 if(!launcher.isConnected)panel.append(launcher);
 launcher.hidden=!uid();
}
function renderTabs(){tabs.replaceChildren();for(const [key,label] of Object.entries(names)){const b=E('button','',label);b.type='button';b.setAttribute('aria-selected',String(key===section));b.onclick=()=>{section=key;renderTabs();render()};tabs.append(b)}}
async function lookupUsername(value){
 const handle=String(value||'').trim().replace(/^@/,'');
 if(!/^[a-z0-9_]{3,24}$/i.test(handle))throw Error('Enter a valid username (3–24 letters, numbers or _)');
 const r=await db.from('profiles').select('id,username').ilike('username',handle).limit(1).maybeSingle();
 if(r.error)throw r.error;if(!r.data)throw Error('Account not found');if(r.data.id===uid())throw Error('Choose another account');
 return r.data;
}
async function render(){
 const token=++ticket;body.replaceChildren(E('p','pvsNotice','Loading…'));
 const current=uid();if(!current){notice('Please sign in');return}
 try{
 if(section==='posts'){
  const r=await db.from('posts').select('id,caption,created_at').eq('author_id',current).order('created_at',{ascending:false}).limit(30);
  if(r.error)throw r.error;if(token!==ticket)return;body.replaceChildren();
  notice('Edit your post caption, tag a creator or invite a collaborator. An invitation never becomes public until the recipient accepts.');
  if(!r.data?.length)row('No posts yet','Publish a post first from the Home screen.');
  for(const post of r.data||[]){
   const item=row((post.caption||'Untitled post').slice(0,110),new Date(post.created_at).toLocaleString('en-IN'));
   const tools=E('div','pvsTools');
   tools.append(btn('Edit caption',async()=>{
    const next=prompt('Edit post caption (up to 2,200 characters):',post.caption||'');
    if(next===null)return;if(next.length>2200)throw Error('Caption exceeds 2,200 characters');
    const r=await db.from('posts').update({caption:next}).eq('id',post.id).eq('author_id',current).select('id');
    if(r.error)throw r.error;if(!r.data?.length)throw Error('Edit not saved');await render();
   }));
   tools.append(btn('Tag account',async()=>{
    const raw=prompt('Username to tag in this post (for example @creator):');if(raw===null)return;
    const person=await lookupUsername(raw);
    const r=await db.from('pv_post_tags').upsert({post_id:post.id,tagged_user_id:person.id},{onConflict:'post_id,tagged_user_id',ignoreDuplicates:true});
    if(r.error)throw r.error;notice('Tagged @'+person.username+' in this post');
   }));
   tools.append(btn('Invite collaborator',async()=>{
    const raw=prompt('Invite collaborator by username:');if(raw===null)return;
    const person=await lookupUsername(raw);
    const r=await db.from('pv_post_collaborators').insert({post_id:post.id,collaborator_id:person.id});
    if(r.error)throw r.error;notice('Invitation sent to @'+person.username+'; post is not collaborative until accepted.');
   }));
   item.append(tools);
  }
 }else if(section==='invitations'){
  const r=await db.from('pv_post_collaborators').select('post_id,collaborator_id,status,created_at').eq('collaborator_id',current).order('created_at',{ascending:false}).limit(40);
  if(r.error)throw r.error;if(token!==ticket)return;body.replaceChildren();
  notice('Only you can accept or decline collaboration invitations addressed to your account.');
  if(!r.data?.length)row('No invitations','New collaboration requests will appear here.');
  for(const c of r.data||[]){
   const item=row('Post invitation · '+c.status,new Date(c.created_at).toLocaleString('en-IN'));
   if(c.status==='pending'){const tools=E('div','pvsTools');
    for(const next of ['accepted','declined'])tools.append(btn(next==='accepted'?'Accept':'Decline',async()=>{
     const r=await db.from('pv_post_collaborators').update({status:next}).eq('post_id',c.post_id).eq('collaborator_id',current).eq('status','pending').select('post_id');
     if(r.error)throw r.error;if(!r.data?.length)throw Error('Invitation no longer pending');await render();
    }));
    item.append(tools);
   }
  }
 }else if(section==='tags'){
  const r=await db.from('pv_post_tags').select('post_id,created_at').eq('tagged_user_id',current).order('created_at',{ascending:false}).limit(40);
  if(r.error)throw r.error;if(token!==ticket)return;body.replaceChildren();
  notice('Accounts may tag you in posts. Remove any tag you do not want associated with your profile.');
  if(!r.data?.length)row('No tagged posts','Your tagged posts will appear here.');
  for(const tag of r.data||[]){const item=row('Tagged post',new Date(tag.created_at).toLocaleString('en-IN'));
   item.append(btn('Remove my tag',async()=>{const r=await db.from('pv_post_tags').delete().eq('post_id',tag.post_id).eq('tagged_user_id',current);if(r.error)throw r.error;await render()}));
  }
 }else if(section==='discover'){
  const [profiles,follows]=await Promise.all([db.from('profiles').select('id,username,display_name,is_private').eq('is_private',false).limit(50),db.from('follows').select('following_id').eq('follower_id',current)]);
  if(profiles.error||follows.error)throw (profiles.error||follows.error);if(token!==ticket)return;body.replaceChildren();
  notice('Suggested creators: public profiles you do not already follow. This is a simple discovery filter, not a personalized AI algorithm.');
  const following=new Set((follows.data||[]).map(v=>v.following_id));
  const available=(profiles.data||[]).filter(p=>p.id!==current&&!following.has(p.id)).slice(0,20);
  if(!available.length)row('No suggestions yet','Try again when more public creators join PAVORA.');
  for(const p of available){const item=row('@'+p.username,p.display_name||'Public creator');
   item.append(btn('Follow',async()=>{const r=await db.from('follows').insert({follower_id:current,following_id:p.id});if(r.error)throw r.error;item.remove()}));
  }
 }else if(section==='accessibility'){
  body.replaceChildren();
  notice('Your preferences are stored only on this device. They do not change other users’ settings.');
  const item=row('Reduced motion','Reduce nonessential animation and transitions for comfort.');
  const key='pavora-reduce-motion';
  const toggle=btn(localStorage.getItem(key)==='on'?'Reduced motion: ON':'Reduced motion: OFF',async()=>{
   const on=localStorage.getItem(key)!=='on';localStorage.setItem(key,on?'on':'off');document.documentElement.classList.toggle('pvReducedMotion',on);toggle.textContent='Reduced motion: '+(on?'ON':'OFF');
  });
  item.append(toggle);
  row('Accessibility support','Creator Studio uses readable labels, keyboard-accessible buttons, live status messages, and respects system reduced-motion settings.');
  row('Moderation','Use the existing Report, Block, Restrict, and Owner moderation tools to manage harmful content. Reports are reviewed by authorized admins.');
 }
 }catch(e){if(token!==ticket)return;body.replaceChildren();notice('Could not load Creator Studio: '+(e.message||e))}
}
const reduced=E('style');reduced.textContent='html.pvReducedMotion *,html.pvReducedMotion *::before,html.pvReducedMotion *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}';document.head.append(reduced);
try{document.documentElement.classList.toggle('pvReducedMotion',localStorage.getItem('pavora-reduce-motion')==='on')}catch(e){}
mount();setInterval(mount,2500);
db.auth.onAuthStateChange(()=>{setTimeout(mount,0);if(!uid())close()});
})();
