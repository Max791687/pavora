/* PAVORA v68: best-effort foreground and background Online / Offline / Last Seen.
   Database RLS protects private and blocked profiles, even from direct API reads.
   Background tabs remain active while JavaScript can run. Heartbeats use server timestamps; suspended apps expire after a short grace window. */
(function(){
'use strict';
const REFRESH_MS=20000,HEARTBEAT_MS=15000,ONLINE_AGE_MS=300000;
let db=null,uid=null,timer=null,heartbeatTimer=null,inFlight=null,busy=false,request=0,heartbeatBusy=false,pendingHeartbeat=false;
const fmt=t=>{
 const ms=Date.now()-new Date(t).getTime();
 if(!Number.isFinite(ms)||ms<0)return 'Last seen recently';
 const mins=Math.floor(ms/60000);
 if(mins<1)return 'Last seen just now';
 if(mins<60)return 'Last seen '+mins+'m ago';
 const hours=Math.floor(mins/60);
 if(hours<24)return 'Last seen '+hours+'h ago';
 const days=Math.floor(hours/24);
 if(days<7)return 'Last seen '+days+'d ago';
 return 'Last seen '+new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'});
};
function label(node,text,state){
 if(!node.isConnected)return;
 node.textContent=text;
 node.dataset.pvPresence=state;
 node.hidden=!text;
}
function targets(){
 return [...document.querySelectorAll('[data-pv-presence-peer]')].filter(e=>e.isConnected);
}
async function refresh(){
 if(!db||!uid||document.hidden||busy)return;
 const nodes=targets();
 if(!nodes.length)return;
 const ids=[...new Set(nodes.map(n=>n.dataset.pvPresencePeer).filter(id=>id&&id!==uid))];
 if(!ids.length)return;
 busy=true;const run=request;
 try{
  // Never rely on a cached privacy value; profiles can turn Private at any time.
  const profiles=await db.from('profiles').select('id,is_private').in('id',ids);
  if(profiles.error)throw profiles.error;
  if(run!==request)return;
  const publicIds=(profiles.data||[]).filter(p=>p.is_private===false).map(p=>p.id);
  let activity=[];
  if(publicIds.length){
   const response=await db.from('pv_user_presence').select('user_id,last_active_at,is_active').in('user_id',publicIds);
   if(response.error)throw response.error;
   activity=response.data||[];
  }
  if(run!==request)return;
  const visible=new Set(publicIds),presence=new Map(activity.map(r=>[r.user_id,r]));
  for(const n of nodes){
   const peer=n.dataset.pvPresencePeer;
   if(!visible.has(peer)){label(n,'','private');continue}
   const row=presence.get(peer);
   if(!row){label(n,'Offline','offline');continue}
   const recent=Date.now()-new Date(row.last_active_at).getTime()<ONLINE_AGE_MS;
   if(row.is_active&&recent)label(n,'Online','online');
   else label(n,fmt(row.last_active_at),'offline');
  }
 }catch(e){console.warn('PAVORA presence unavailable:',e.message||e)}
 finally{busy=false}
}
async function heartbeat(active){
 if(!db||!uid)return;
 const id=uid,client=db;
 if(heartbeatBusy){if(active)pendingHeartbeat=true;return}
 heartbeatBusy=true;
 try{
  const {error}=await client.from('pv_user_presence').upsert({user_id:id,is_active:!!active},{onConflict:'user_id'});
  if(error)console.warn('PAVORA presence heartbeat:',error.message);
 }catch(e){console.warn('PAVORA presence heartbeat:',e.message)}
 finally{
  heartbeatBusy=false;
  if(pendingHeartbeat){pendingHeartbeat=false;if(uid===id&&db===client)heartbeat(true)}
 }
}
function stop(){
 const previousUid=uid,previousDb=db;
 clearInterval(timer);clearInterval(heartbeatTimer);
 timer=null;heartbeatTimer=null;request++;
 uid=null;
 pendingHeartbeat=false;
 // Only sign-out must set offline. Backgrounded/suspended pages rely on heartbeat expiry.
 // Avoid racing an old account's offline write with a new account's online write.
 if(previousUid&&previousDb){
  previousDb.from('pv_user_presence').upsert({user_id:previousUid,is_active:false},{onConflict:'user_id'}).then(({error})=>{
   if(error)console.warn('PAVORA presence sign-out:',error.message)
  });
 }
 document.querySelectorAll('[data-pv-presence-peer]').forEach(n=>label(n,'','private'));
}
function start(client,userId){
 if(!client||!userId)return;
 if(uid===userId&&timer){heartbeat(true);return}
 // A foreground reinitialization for the same account must not write offline.
 if(uid&&uid!==userId)stop();
 else{clearInterval(timer);clearInterval(heartbeatTimer);timer=null;heartbeatTimer=null;request++}
 db=client;uid=userId;
 heartbeat(true);
 heartbeatTimer=setInterval(()=>heartbeat(true),HEARTBEAT_MS);
 timer=setInterval(refresh,REFRESH_MS);
 refresh();
}
function attach(parent,peerId,style='inline'){
 if(!parent||!peerId||peerId===uid)return null;
 const n=document.createElement('span');
 n.className='pvPresenceLabel pvPresence-'+style;
 n.dataset.pvPresencePeer=peerId;n.setAttribute('aria-live','off');
 n.hidden=true;parent.append(n);
 // Coalesce many attachments into one server request when loading an inbox.
 if(!inFlight)inFlight=setTimeout(()=>{inFlight=null;refresh()},140);
 return n;
}
function onVisible(){
 if(!uid)return;
 heartbeat(true);
 if(!document.hidden)refresh()
}
document.addEventListener('visibilitychange',onVisible);
// Reconnect and resume instantly without requiring a manual page refresh.
window.addEventListener('online',()=>{if(uid){heartbeat(true);refresh()}});
window.addEventListener('focus',()=>{if(uid){heartbeat(true);refresh()}});
window.addEventListener('pageshow',()=>{if(uid){heartbeat(true);refresh()}});
document.addEventListener('resume',()=>{if(uid){heartbeat(true);refresh()}});
// Do not mark offline on pagehide: mobile PWA may be backgrounded or frozen instead of closed.
// The server automatically stops considering an account online after 5 min without heartbeats.
const css=document.createElement('style');
css.textContent=`
.pvPresenceLabel{display:inline-flex;align-items:center;gap:5px;color:#a9a4b3;font-size:11px;font-weight:600;line-height:1.4;white-space:nowrap}
.pvPresenceLabel[hidden]{display:none!important}
/* Keep DM rows and chat headers at a stable height while async presence loads.
   Hidden status occupies its final line; only its text becomes visible. */
.pvPresence-thread,.pvPresence-chat{min-height:14px;line-height:14px;max-width:100%;animation:none!important;transition:none!important;transform:none!important}
.pvPresence-thread[hidden],.pvPresence-chat[hidden]{display:block!important;visibility:hidden!important}
.pvPresence-thread:not([hidden]),.pvPresence-chat:not([hidden]){visibility:visible!important}
.pvPresenceLabel[data-pv-presence="online"]{color:#53d98a}
.pvPresenceLabel[data-pv-presence="online"]::before{content:"";width:7px;height:7px;background:#43d881;border-radius:50%;box-shadow:0 0 0 2px #43d88125}
.pvPresence-chat{display:block;font-size:10px;margin-top:2px}
.pvPresence-thread{font-size:10px;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.pvPresence-profile{font-size:12px;margin:5px 0}
@media(max-width:700px){.pvPresenceLabel{font-size:10px}.pvPresence-chat{font-size:9px}}
`;
document.head.append(css);
window.PAVORA_PRESENCE={start,stop,attach,refresh};
})();
