/* PAVORA background push opt-in. Permission is only requested on a button tap.
   Never sends service role secrets to the browser. */
(()=>{
'use strict';
const project='https://iyqmjaomslffqfwbsydr.supabase.co';
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const supported=()=>('Notification' in window)&&('serviceWorker' in navigator)&&('PushManager' in window)&&window.isSecureContext;
const toBytes=base64=>{const padded=base64.replace(/-/g,'+').replace(/_/g,'/');const bytes=atob(padded+'='.repeat((4-padded.length%4)%4));return Uint8Array.from(bytes,c=>c.charCodeAt(0))};
const toBase64=buffer=>{let out='';for(const v of new Uint8Array(buffer))out+=String.fromCharCode(v);return btoa(out)};
let busy=false,lastUid=null;
const button=document.createElement('button');
button.type='button';button.className='pvPushToggle';button.textContent='🔔 Enable alerts';button.hidden=true;
button.title='Enable lock-screen notifications for messages, likes, comments and stories';
button.setAttribute('aria-label','Manage phone push notifications');
const style=document.createElement('style');
style.textContent=`
.pvPushToggle{border:1px solid #7554a8;border-radius:99px;background:#322343;color:#faf4ff;padding:8px 12px;font-size:12px;font-weight:700;white-space:nowrap}
.pvPushToggle:disabled{opacity:.5}
.pvPushToggle[hidden]{display:none!important}
@media(max-width:700px){.pvPushToggle{font-size:10px;padding:7px 8px;max-width:120px;white-space:normal}}
`;
document.head.append(style);
document.querySelector('header .top')?.append(button);
async function current(){
 const kit=window.PVKit;
 if(!kit?.db)return null;
 const user=kit.getUser?.();
 return user?{db:kit.db,user}:null;
}
async function getSubscription(){
 const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
 return {registration,subscription:await registration.pushManager.getSubscription()};
}
async function sync(){
 const context=await current();const uid=context?.user?.id;
 button.hidden=!uid;
 if(!uid||busy||!supported())return;
 if(lastUid===uid)return;
 lastUid=uid;
 try{
  const {subscription}=await getSubscription();
  button.textContent=subscription?'🔔 Alerts on':'🔔 Enable alerts';
 }catch(e){console.warn('Push status:',e);button.textContent='🔔 Enable alerts'}
}
button.onclick=async()=>{
 const context=await current();if(!context||busy)return;
 if(!supported()){alert('This browser does not support background push notifications. Use an installed PAVORA PWA on a supported device.');return}
 if(isIOS()&&!installed()){alert('On iPhone, first open Safari → Share → Add to Home Screen. Then open PAVORA from the home-screen icon and enable alerts there.');return}
 if(Notification.permission==='denied'){alert('Notifications are blocked. Allow PAVORA notifications in your phone/browser settings.');return}
 // This must be done directly inside the user interaction for mobile browsers.
 const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
 if(permission!=='granted'){alert('Notification permission was not granted.');return}
 busy=true;button.disabled=true;button.textContent='Setting up…';
 try{
  const {registration,subscription}=await getSubscription();
  if(subscription){
   // Explicit disable action: remove this subscription from the user's DB first.
   const {error}=await context.db.from('push_subscriptions').delete().eq('user_id',context.user.id).eq('endpoint',subscription.endpoint);
   if(error)throw error;
   await subscription.unsubscribe();
   button.textContent='🔔 Enable alerts';
   return;
  }
  const response=await fetch(project+'/functions/v1/send-push',{method:'GET',cache:'no-store'});
  if(!response.ok)throw Error('Push backend not yet deployed ('+response.status+').');
  const {publicKey}=await response.json();
  if(!publicKey)throw Error('Push public key missing. Set VAPID secrets in Supabase.');
  const fresh=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:toBytes(publicKey)});
  const json=fresh.toJSON();
  const {error}=await context.db.from('push_subscriptions').upsert({
   user_id:context.user.id,endpoint:fresh.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth,
   updated_at:new Date().toISOString()
  },{onConflict:'endpoint'});
  if(error){await fresh.unsubscribe();throw error}
  button.textContent='🔔 Alerts on';
  alert('PAVORA phone notifications enabled. Sound depends on your phone notification settings.');
 }catch(e){console.error('Push setup:',e);button.textContent='🔔 Enable alerts';alert('Could not enable push: '+(e?.message||e))}
 finally{busy=false;button.disabled=false}
};
document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastUid=null;sync()}});
window.addEventListener('focus',()=>{lastUid=null;sync()});
setInterval(sync,4000);
sync();
})();
