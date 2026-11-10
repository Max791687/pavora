/* PAVORA v57 — ephemeral chat presence. Stores only open chat IDs, NEVER messages.
   Not a proof of messages being exchanged: paired active windows = "both viewing chat". */
(()=>{
'use strict';
const kit=window.PVKit;if(!kit?.db)return;
const db=kit.db,intervalMs=18000;
let previousUser=null,previousPeer=null,busy=false,stopped=false;
const user=()=>kit.getUser()?.id||null;
const openPeer=()=>typeof kit.getActiveChatPeer==='function'?kit.getActiveChatPeer():null;
async function send(){
 if(busy)return;busy=true;
 try{
  const id=user(),peer=!document.hidden?openPeer():null;
  if(previousUser&&(!id||previousUser!==id||!peer||previousPeer!==peer)){
   await db.from('pv_chat_presence').delete().eq('user_id',previousUser);
   previousUser=null;previousPeer=null;
  }
  if(id&&peer&&id!==peer&&!stopped){
   const result=await db.from('pv_chat_presence').upsert({user_id:id,peer_id:peer,updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(result.error)throw result.error;
   previousUser=id;previousPeer=peer;
  }
 }catch(e){console.warn('PAVORA chat presence:',e?.message||e)}
 finally{busy=false}
}
const tick=()=>send();
const timer=setInterval(tick,intervalMs);setTimeout(tick,1800);
document.addEventListener('visibilitychange',tick);
db.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'||event==='SIGNED_IN')setTimeout(tick,180)});
window.addEventListener('pagehide',()=>{stopped=true;clearInterval(timer);if(previousUser){const uid=previousUser;db.from('pv_chat_presence').delete().eq('user_id',uid).then(()=>{})}});
})();
