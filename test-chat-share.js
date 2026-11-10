/* PAVORA Consent-Based Test Chat Sharing.
 * Opt in from the account whose own outgoing messages will be displayed.
 * No incoming message text is shared, and sharing expires within 1 hour. */
(()=>{
 'use strict';
 const kit=window.PVKit, db=kit?.db;
 if(!db)return;
 const selector='#pvInboxView';
 let button=null,notice=null,working=false;
 const getUser=()=>kit.getUser()?.id||null;
 const css=document.createElement('style');
 css.textContent='#pvTestSharingBar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0;padding:10px 12px;border:1px solid #514263;border-radius:12px;background:#211b2d;color:#f1e8ff;font-size:12px}#pvTestSharingBar button{border:1px solid #8063b1;border-radius:9px;background:#51357c;color:white;padding:7px 11px;font-weight:700}#pvTestSharingBar small{flex:1;min-width:155px;color:#c2b3d4}';
 document.head.append(css);
 async function read(){
  if(!getUser()||!button)return;
  const {data,error}=await db.from('pv_test_chat_shares').select('enabled,expires_at').eq('user_id',getUser()).maybeSingle();
  if(error){notice.textContent='Sharing status unavailable: '+error.message;return}
  const on=!!data?.enabled&&new Date(data.expires_at).getTime()>Date.now();
  button.textContent=on?'Stop test sharing':'Enable 1-hour test sharing';
  button.dataset.enabled=String(on);
  notice.textContent=on?'Only new messages YOU send are shared with the Owner Test Viewer until '+new Date(data.expires_at).toLocaleTimeString('en-IN')+'. Incoming messages stay private.':'Off. Enable to share only new messages that you send for testing; other users’ replies remain private.';
 }
 async function toggle(){
  if(working||!getUser())return;
  const on=button.dataset.enabled==='true';
  if(!on&&!confirm('Share only messages YOU send after this moment with PAVORA Owner for a maximum of one hour? Other people’s messages are NOT shared. You can switch off anytime.'))return;
  working=true;button.disabled=true;
  try{
   const expires=new Date(Date.now()+(on?-1000:3600000)).toISOString();
   const {error}=await db.from('pv_test_chat_shares').upsert({user_id:getUser(),enabled:!on,expires_at:expires,updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(error)throw error;
   await read();
  }catch(e){notice.textContent='Could not change sharing: '+(e.message||e)}
  finally{working=false;button.disabled=false}
 }
 function mount(){
  const inbox=document.querySelector(selector),user=getUser();
  if(!inbox||!user||inbox.classList.contains('hide'))return;
  if(document.querySelector('#pvTestSharingBar'))return;
  const bar=document.createElement('div');bar.id='pvTestSharingBar';
  button=document.createElement('button');button.type='button';button.textContent='Test sharing';button.onclick=toggle;
  notice=document.createElement('small');notice.textContent='Checking test sharing…';
  bar.append(button,notice);
  inbox.prepend(bar);
  read();
 }
 setInterval(()=>{mount();if(button&&document.querySelector('#pvTestSharingBar')&&getUser()&&button.dataset.enabled==='true'&&Date.now()%180000<2500)read()},2000);
 db.auth.onAuthStateChange(()=>setTimeout(()=>{const el=document.getElementById('pvTestSharingBar');if(el)el.remove();button=null;notice=null},150));
})();