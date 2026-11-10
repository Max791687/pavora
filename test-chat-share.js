/* PAVORA Consent-Based Test Chat Sharing.
 * Opt in from the account whose own outgoing messages will be displayed.
 * No incoming message text is shared. Opt-in is persistent until revoked. */
(()=>{
 'use strict';
 const kit=window.PVKit, db=kit?.db;
 if(!db)return;
 const selector='#profile';
 let button=null,notice=null,working=false;
 const getUser=()=>kit.getUser()?.id||null;
 const css=document.createElement('style');
 css.textContent='#pvTestSharingBar{display:flex;flex-direction:column;gap:5px;align-items:stretch;margin:8px 0;padding:8px;border:1px solid #514263;border-radius:10px;background:#211b2d;color:#f1e8ff;font-size:11px;max-width:100%;min-width:0}#pvTestSharingBar button{border:1px solid #8063b1;border-radius:9px;background:#51357c;color:white;padding:7px 11px;font-weight:700}#pvTestSharingBar small{display:block;min-width:0;overflow-wrap:anywhere;line-height:1.3;color:#c2b3d4}';
 document.head.append(css);
 async function read(){
  if(!getUser()||!button)return;
  const {data,error}=await db.from('pv_test_chat_shares').select('enabled,expires_at').eq('user_id',getUser()).maybeSingle();
  if(error){notice.textContent='Sharing status unavailable: '+error.message;return}
  const on=!!data?.enabled&&new Date(data.expires_at).getTime()>Date.now();
  button.textContent=on?'Stop test sharing':'Enable test sharing';
  button.dataset.enabled=String(on);
  notice.textContent=on?'ON · Your new outgoing messages can be viewed in Owner Test Viewer until you switch OFF. Incoming replies are private.':'OFF · You can explicitly enable sharing of your new outgoing test messages. Incoming replies are private.';
 }
 async function toggle(){
  if(working||!getUser())return;
  const on=button.dataset.enabled==='true';
  if(!on&&!confirm('Share messages YOU send from this account after enabling with the PAVORA Owner Test Viewer until you switch OFF? This stays enabled across logins. Other people’s replies are NOT shared.'))return;
  working=true;button.disabled=true;
  try{
   const expires=on?new Date(Date.now()-1000).toISOString():'2099-01-01T00:00:00.000Z';
   const {error}=await db.from('pv_test_chat_shares').upsert({user_id:getUser(),enabled:!on,expires_at:expires,updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(error)throw error;
   await read();
  }catch(e){notice.textContent='Could not change sharing: '+(e.message||e)}
  finally{working=false;button.disabled=false}
 }
 function mount(){
  const inbox=document.querySelector(selector),user=getUser();
  if(!inbox||!user)return;
  if(document.querySelector('#pvTestSharingBar'))return;
  const bar=document.createElement('div');bar.id='pvTestSharingBar';bar.setAttribute('role','region');bar.setAttribute('aria-label','Test message sharing privacy settings');
  button=document.createElement('button');button.type='button';button.textContent='Manage test sharing';button.onclick=toggle;
  notice=document.createElement('small');notice.textContent='Checking test sharing…';
  bar.append(button,notice);
  inbox.append(bar);
  read();
 }
 setInterval(()=>{mount()},2000);
 db.auth.onAuthStateChange(()=>setTimeout(()=>{const el=document.getElementById('pvTestSharingBar');if(el)el.remove();button=null;notice=null},150));
})();