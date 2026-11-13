/* PAVORA Invite & Earn v184 — verified referrals, no fake followers or payments. */
(()=>{
'use strict';
if(window.PAVORA_INVITES)return;
const db=()=>window.PVKit?.db||null;
const user=()=>window.PVKit?.getUser?.()||null;
const storageKey='pv_referral_pending_v184',codePattern=/^[a-f0-9]{32}$/;
try{
 const parsed=new URL(location.href),code=parsed.searchParams.get('ref');
 if(code&&codePattern.test(code.toLowerCase()))localStorage.setItem(storageKey,code.toLowerCase());
 if(code){parsed.searchParams.delete('ref');history.replaceState(history.state,'',parsed.pathname+parsed.search+parsed.hash)}
}catch(e){}
const css=document.createElement('style');css.id='pvInviteStyle184';
css.textContent=[
'#pvInvite184[hidden]{display:none!important}#pvInvite184{position:fixed;inset:0;z-index:18000;background:#09051dc9;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:grid;place-items:center;padding:14px;color:white}',
'#pvInvite184 *{box-sizing:border-box}#pvInvite184 .invCard{position:relative;width:min(465px,100%);max-height:92dvh;overflow-y:auto;border:1px solid #e7d5ff7e;border-radius:28px;padding:22px;background:radial-gradient(circle at 16% 0%,#b279f861,transparent 60%),linear-gradient(145deg,#28214c,#11162f 75%);box-shadow:0 25px 95px #000c,inset 0 1px #fff5}',
'#pvInvite184 .invClose{position:absolute;right:16px;top:13px;width:35px;height:35px;border:1px solid #f0e7ff60;background:#ffffff19;color:white;border-radius:12px;font-size:25px;cursor:pointer}',
'#pvInvite184 .invMark{font-size:38px;margin-bottom:6px}#pvInvite184 h2{margin:0 0 7px;font-size:25px;letter-spacing:-.5px}#pvInvite184 .invSub{font-size:13px;color:#e5d7fa;line-height:1.5;margin:0 0 15px}',
'#pvInvite184 .invStats{display:flex;gap:12px}#pvInvite184 .invMetric{flex:1;min-width:0;padding:14px 11px;border:1px solid #eadbff4a;background:#ffffff17;border-radius:17px}#pvInvite184 .invMetric strong{display:block;font-size:24px}#pvInvite184 .invMetric small{font-size:11px;color:#dfd3f1}',
'#pvInvite184 .invRewards{display:flex;gap:7px;overflow:auto;margin:18px 0 15px;padding:3px 0}#pvInvite184 .invReward{flex:1;min-width:62px;text-align:center;padding:10px 5px;border:1px solid #eedbff47;border-radius:15px;background:#ffffff0a;opacity:.55}',
'#pvInvite184 .invReward.earned{opacity:1;background:linear-gradient(145deg,#ad8af946,#e7b7ff33);border-color:#e4bdffb0}#pvInvite184 .invReward b{display:block;font-size:18px}#pvInvite184 .invReward small{font-size:10px;color:#e7d9ff}',
'#pvInvite184 .invLink{padding:13px;border:1px solid #f1e6ff70;background:#080c2d8c;border-radius:14px;overflow-wrap:anywhere;font-size:13px;color:#e9d9ff}',
'#pvInvite184 .invActions{display:flex;gap:9px;margin-top:11px}#pvInvite184 .invActions button{flex:1;background:linear-gradient(135deg,#a679f4,#754bd4);border:1px solid #e9d7ff7e;color:#fff;border-radius:13px;padding:12px 9px;font-size:13px;font-weight:750;cursor:pointer}#pvInvite184 .invActions button:last-child{background:#ffffff22}',
'#pvInvite184 .invHelp{font-size:11px;color:#d6c8e7;line-height:1.5;margin:14px 0 0}#pvInvite184 .invStatus{font-size:12px;color:#e9d9ff;min-height:17px;margin-top:10px}',
'.pvInviteLaunch184{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;border:1px solid #bb92ff85;border-radius:12px;background:linear-gradient(125deg,#9e74ee44,#6a51c533);color:#f9f3ff;font-weight:750}',
'.pvInviteLaunch184.pvInviteTop{width:38px;height:38px;font-size:20px;flex:0 0 38px;margin-left:4px}.pvInviteLaunch184.pvInviteProfile{padding:10px 14px;margin-top:13px}',
'@media(max-width:600px){#pvInvite184 .invCard{border-radius:24px;padding:20px}#pvInvite184 .invMetric strong{font-size:22px}.pvInviteLaunch184.pvInviteTop{width:32px;height:32px;flex-basis:32px;margin-left:0;font-size:17px}}'
].join('\n');document.head.append(css);
const dialog=document.createElement('div');dialog.id='pvInvite184';dialog.hidden=true;
dialog.innerHTML='<div class="invCard" role="dialog" aria-modal="true" aria-label="Invite and Earn Badges">'+
'<button type="button" class="invClose" aria-label="Close invite rewards">×</button>'+
'<div class="invMark">🎁</div><h2>Invite & Earn Badges</h2>'+
'<p class="invSub">Bring your friends to PAVORA. Unlock exclusive referral badges when verified new users join through your link.</p>'+
'<div class="invStats"><div class="invMetric"><strong id="pvInvCount">0</strong><small>Verified friends joined</small></div><div class="invMetric"><strong id="pvInvNext">1</strong><small>Next badge at</small></div></div>'+
'<div class="invRewards"><div class="invReward" data-target="1"><b>✦</b><small>1 Friend</small></div><div class="invReward" data-target="5"><b>✧</b><small>5 Friends</small></div><div class="invReward" data-target="10"><b>✪</b><small>10 Friends</small></div><div class="invReward" data-target="25"><b>♛</b><small>25 Friends</small></div><div class="invReward" data-target="50"><b>★</b><small>50 Friends</small></div></div>'+
'<div class="invLink" id="pvInvLink">Preparing your personal invitation link…</div>'+
'<div class="invActions"><button type="button" id="pvInvCopy">⧉ Copy link</button><button type="button" id="pvInvShare">↗ Share invite</button></div>'+
'<div class="invStatus" role="status" id="pvInvStatus"></div>'+
'<p class="invHelp">Only new, verified accounts count. One inviter per account; inviting yourself does not count. Badges represent genuine signups, not followers. No monetary reward is offered.</p>'+
'</div>';
document.body.append(dialog);
const $=selector=>dialog.querySelector(selector);
let link='',currentId=null,opening=false,claimedFor='',modalBefore=null;
function syncBadges(count){
 $('#pvInvCount').textContent=String(count);
 const next=[1,5,10,25,50].find(n=>n>count);
 $('#pvInvNext').textContent=next?String(next):'MAX';
 dialog.querySelectorAll('.invReward').forEach(x=>x.classList.toggle('earned',count>=Number(x.dataset.target)));
}
function close(){dialog.hidden=true;if(modalBefore?.isConnected)modalBefore.focus({preventScroll:true});modalBefore=null}
$('.invClose').onclick=close;
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)close()});
async function dashboard(){
 const client=db(),u=user();
 if(!client||!u)return;
 const {data,error}=await client.rpc('pv_get_invite_dashboard');
 if(error)throw error;
 if(!data?.code||!codePattern.test(data.code))throw Error('Invite code unavailable.');
 link=new URL('./?ref='+encodeURIComponent(data.code),location.href).href;
 $('#pvInvLink').textContent=link;
 syncBadges(Number(data.count)||0);
 currentId=u.id;
}
async function show(){
 if(!user()){alert('Sign in to PAVORA to get your invite link.');return}
 if(opening)return;
 modalBefore=document.activeElement;
 dialog.hidden=false;$('#pvInvStatus').textContent='Loading invite rewards…';
 opening=true;
 try{await dashboard();$('#pvInvStatus').textContent='Ready to invite your friends.'}
 catch(err){$('#pvInvStatus').textContent='Cannot load referral details. '+(err.message||'Try again.')}
 finally{opening=false}
}
$('#pvInvCopy').onclick=async()=>{
 if(!link){$('#pvInvStatus').textContent='Invite link is not ready.';return}
 try{
  if(navigator.clipboard&&isSecureContext)await navigator.clipboard.writeText(link);
  else{const box=document.createElement('textarea');box.value=link;box.style.position='fixed';box.style.opacity=0;document.body.append(box);box.select();if(!document.execCommand('copy'))throw Error('Clipboard unavailable');box.remove()}
  $('#pvInvStatus').textContent='✓ Invite link copied!';
 }catch(err){$('#pvInvStatus').textContent='Could not copy. Select the link above.'}
};
$('#pvInvShare').onclick=async()=>{
 if(!link){$('#pvInvStatus').textContent='Invite link is not ready.';return}
 const message='Join me on PAVORA! Create your profile and explore Reels, Stories and more. '+link;
 if(navigator.share){try{await navigator.share({title:'Join PAVORA',text:message,url:link});$('#pvInvStatus').textContent='Invite share sheet opened.'}catch(e){if(e.name!=='AbortError')$('#pvInvStatus').textContent='Sharing unavailable. Try Copy link.'}}
 else{window.open('https://wa.me/?text='+encodeURIComponent(message),'_blank','noopener,noreferrer')}
};
function addButtons(){
 const top=document.querySelector('header .top');
 if(top&&!top.querySelector('.pvInviteTop')){
  const b=document.createElement('button');b.type='button';b.className='pvInviteLaunch184 pvInviteTop';b.textContent='🎁';b.title='Invite friends · Earn badges';b.setAttribute('aria-label','Invite friends and earn badges');
  b.onclick=show;
  const before=top.querySelector('#reset')||top.lastElementChild;
  if(before)top.insertBefore(b,before);else top.append(b);
 }
 const panel=document.querySelector('#profile .panel');
 if(panel&&!panel.querySelector('.pvInviteProfile')){
  const b=document.createElement('button');b.type='button';b.className='pvInviteLaunch184 pvInviteProfile';b.textContent='🎁 Invite Friends · Earn Badges';b.onclick=show;panel.append(b);
 }
}
addButtons();
const observer=new MutationObserver(()=>addButtons());
const profile=document.querySelector('#profile');if(profile)observer.observe(profile,{childList:true,subtree:false});
async function attemptClaim(){
 const client=db(),u=user();
 if(!client||!u||claimedFor===u.id)return;
 let pending;try{pending=localStorage.getItem(storageKey)}catch(e){return}
 if(!pending||!codePattern.test(pending))return;
 claimedFor=u.id;
 try{
  const {data,error}=await client.rpc('pv_claim_invite',{p_code:pending});
  if(error)throw error;
  // Verification can finish later; retain the referral code only until verified or 48h signup window.
  if(data==='verify_account'){claimedFor='';return}
  localStorage.removeItem(storageKey);
  if(data==='success')console.info('PAVORA: verified referral recorded.');
 }catch(e){claimedFor='';console.warn('Invite attribution temporarily unavailable:',e?.message||e)}
}
function refreshLogin(){
 const u=user();
 if(!u){currentId=null;link='';claimedFor='';return}
 if(currentId&&currentId!==u.id){currentId=null;link=''}
 void attemptClaim();
}
const authCheck=setInterval(()=>{if(db()&&user()){clearInterval(authCheck);refreshLogin()}},1300);
setTimeout(()=>clearInterval(authCheck),60000);
if(db())db().auth.onAuthStateChange((event,session)=>{setTimeout(refreshLogin,400)});
window.PAVORA_INVITES={open:show,refresh:dashboard,version:'184'};
})();