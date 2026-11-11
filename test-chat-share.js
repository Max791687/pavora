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
 css.textContent=`
/* Test sharing: readable in both light Liquid Glass and dark themes */
#pvTestSharingBar{
 display:flex!important;flex-direction:column!important;gap:10px!important;align-items:stretch!important;
 margin:12px 0!important;padding:14px!important;min-width:0!important;max-width:100%!important;
 border:1px solid rgba(125,88,185,.34)!important;border-radius:16px!important;
 background:linear-gradient(135deg,rgba(255,255,255,.88),rgba(241,231,255,.91))!important;
 box-shadow:0 8px 24px rgba(69,39,106,.1)!important;
 color:#352247!important;font-size:13px!important;
}
#pvTestSharingBar button{
 display:flex!important;align-items:center!important;justify-content:center!important;
 width:100%!important;min-height:46px!important;padding:12px 16px!important;
 border:1px solid #6d3da7!important;border-radius:12px!important;
 background:#65369b!important;color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;
 font-size:14px!important;font-weight:800!important;line-height:1.25!important;letter-spacing:.01em!important;
 opacity:1!important;text-shadow:none!important;box-shadow:0 4px 12px rgba(85,39,148,.22)!important;
}
#pvTestSharingBar button[data-enabled="true"]{
 background:#fff3f5!important;border-color:#ba405c!important;color:#872139!important;
 -webkit-text-fill-color:#872139!important;box-shadow:none!important;
}
#pvTestSharingBar button:focus-visible{outline:3px solid #9e72de!important;outline-offset:3px!important}
#pvTestSharingBar button:disabled{opacity:.65!important;cursor:wait!important}
#pvTestSharingBar small{
 display:block!important;min-width:0!important;overflow-wrap:anywhere!important;
 line-height:1.55!important;font-size:12px!important;font-weight:600!important;
 color:#51415f!important;-webkit-text-fill-color:#51415f!important;opacity:1!important;
}
@media(prefers-color-scheme:dark){
 #pvTestSharingBar{background:linear-gradient(135deg,rgba(45,31,66,.97),rgba(33,24,49,.98))!important;border-color:#77599d!important;color:#f4eaff!important}
 #pvTestSharingBar small{color:#e1d0f0!important;-webkit-text-fill-color:#e1d0f0!important}
}
`
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