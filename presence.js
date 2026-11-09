/* PAVORA v37: public-only Online / Offline / Last Seen.
   Database RLS protects private and blocked profiles, even from direct API reads.
   Backgrounded tabs become offline. Heartbeats use server-generated timestamps. */
(function(){
'use strict';
const REFRESH_MS=20000,HEARTBEAT_MS=25000,ONLINE_AGE_MS=75000;
let db=null,uid=null,timer=null,heartbeatTimer=null,inFlight=null,busy=false,request=0;
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
 const id=uid;
 try{
  const {error}=await db.from('pv_user_presence').upsert({user_id:id,is_active:!!active},{onConflict:'user_id'});
  if(error)console.warn('PAVORA presence heartbeat:',error.message);
 }catch(e){console.warn('PAVORA presence heartbeat:',e.message)}
}
function stop(){
 const was=db&&uid&&!document.hidden;
 clearInterval(timer);clearInterval(heartbeatTimer);
 timer=null;heartbeatTimer=null;request++;
 if(was)heartbeat(false);
 uid=null;
 document.querySelectorAll('[data-pv-presence-peer]').forEach(n=>label(n,'','private'));
}
function start(client,userId){
 if(!client||!userId)return;
 if(uid===userId&&timer)return;
 stop();db=client;uid=userId;
 heartbeat(!document.hidden);
 heartbeatTimer=setInterval(()=>{if(!document.hidden)heartbeat(true)},HEARTBEAT_MS);
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
 if(document.hidden)heartbeat(false);
 else{heartbeat(true);refresh()}
}
document.addEventListener('visibilitychange',onVisible);
window.addEventListener('pagehide',()=>{if(uid)heartbeat(false)});
const css=document.createElement('style');
css.textContent=`
.pvPresenceLabel{display:inline-flex;align-items:center;gap:5px;color:#a9a4b3;font-size:11px;font-weight:600;line-height:1.4;white-space:nowrap}
.pvPresenceLabel[hidden]{display:none!important}
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
