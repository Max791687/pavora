/* PAVORA Invite & Earn v187 — referral click-to-signup funnel, reviewed rewards and wallet. */
(()=>{
'use strict';
if(window.PAVORA_INVITES)return;
const db=()=>window.PVKit?.db||null;
const user=()=>window.PVKit?.getUser?.()||null;
const storageKey='pv_referral_pending_v184',codePattern=/^[a-f0-9]{32}$/;
let landingCode='';
try{
 const parsed=new URL(location.href),code=parsed.searchParams.get('ref');
 if(code&&codePattern.test(code.toLowerCase())){landingCode=code.toLowerCase();localStorage.setItem(storageKey,landingCode)}
 if(code){parsed.searchParams.delete('ref');history.replaceState(history.state,'',parsed.pathname+parsed.search+parsed.hash)}
}catch(e){}
// Track only an anonymous visit-session counter (no IP, name or private gallery).
// This is not evidence of a real unique person, signup or paid referral.
async function trackLanding(){
 if(!landingCode)return;
 const client=db();if(!client){setTimeout(trackLanding,650);return}
 const key='pv_ref_view_session_v187';let session;
 try{session=sessionStorage.getItem(key);if(!session||!/^[0-9a-f-]{36}$/.test(session)){session=crypto.randomUUID();sessionStorage.setItem(key,session)}}
 catch(e){session=crypto.randomUUID()}
 try{const {error}=await client.rpc('pv_track_referral_link',{p_code:landingCode,p_session:session});if(error)console.warn('Invite link view not recorded:',error.message)}
 catch(e){console.warn('Invite link view tracking unavailable:',e)}
}
if(landingCode)setTimeout(trackLanding,100);
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
'#pvInvite184 .invFunnel{margin:13px 0;padding:13px;border:1px solid #e2c8ff69;border-radius:16px;background:#ffffff13}#pvInvite184 .invFunnel h3{font-size:14px;margin:0 0 9px}#pvInvite184 .invFunnelGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}#pvInvite184 .invFunnelGrid div{border-radius:12px;border:1px solid #e8dcff40;padding:9px 6px;text-align:center}#pvInvite184 .invFunnelGrid b{display:block;font-size:21px}#pvInvite184 .invFunnelGrid small{display:block;font-size:10px;color:#e9d7ff}#pvInvite184 .invFunnel p{font-size:11px;color:#e0d1f1;line-height:1.5;margin:9px 0 0}',
'#pvInvite184 .invHistory{margin:14px 0;padding:12px;background:#ffffff10;border:1px solid #eed6ff60;border-radius:16px}#pvInvite184 .invHistory h3{margin:0 0 8px;font-size:14px}#pvInvite184 .invHistoryList{max-height:205px;overflow:auto;font-size:12px}#pvInvite184 .invHistoryRow{display:flex;justify-content:space-between;gap:7px;padding:8px 0;border-bottom:1px solid #ffffff22}#pvInvite184 .invHistoryRow:last-child{border:0}#pvInvite184 .invHistoryRow span:last-child{text-align:right;color:#e7d7fc}',
'#pvInvite184 .invCash{padding:14px;border:1px solid #e2c7ff70;background:linear-gradient(135deg,#ad79ee30,#7e6fc220);border-radius:17px;margin:12px 0}#pvInvite184 .invCash h3{font-size:15px;margin:0 0 8px}#pvInvite184 .invCash .invAmount{font-size:28px;font-weight:800}#pvInvite184 .invCash .invInstall{font-size:12px;color:#e8dbff;margin:7px 0}#pvInvite184 .invCash .invPayoutNote{font-size:11px;color:#dfd1f2;line-height:1.5;margin:7px 0 10px}#pvInvite184 .invCash label{display:block;font-size:12px;margin:8px 0;color:#f2eaff}#pvInvite184 .invCash input{width:100%;padding:11px;border-radius:11px;background:#0a0b30;color:white;border:1px solid #e1cbff82;outline:none}#pvInvite184 .invCash button{width:100%;margin-top:9px;border:1px solid #eed8ff9a;border-radius:12px;background:linear-gradient(135deg,#a376ef,#704fbc);color:#fff;padding:11px;font-weight:750}#pvInvite184 .invCash button:disabled{opacity:.45;cursor:not-allowed}',
'.pvInviteLaunch184{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;border:1px solid #bb92ff85;border-radius:12px;background:linear-gradient(125deg,#9e74ee44,#6a51c533);color:#f9f3ff;font-weight:750}',
'.pvInviteLaunch184.pvInviteTop{width:38px;height:38px;font-size:20px;flex:0 0 38px;margin-left:4px}.pvInviteLaunch184.pvInviteProfile{padding:10px 14px;margin-top:13px}',
'@media(max-width:600px){#pvInvite184 .invCard{border-radius:24px;padding:20px}#pvInvite184 .invMetric strong{font-size:22px}.pvInviteLaunch184.pvInviteTop{width:32px;height:32px;flex-basis:32px;margin-left:0;font-size:17px}}'
].join('\n');document.head.append(css);
const dialog=document.createElement('div');dialog.id='pvInvite184';dialog.hidden=true;
dialog.innerHTML='<div class="invCard" role="dialog" aria-modal="true" aria-label="Invite and Earn Badges">'+
'<button type="button" class="invClose" aria-label="Close invite rewards">×</button>'+
'<div class="invMark">🎁</div><h2>Invite & Earn Badges</h2>'+
'<p class="invSub">Invite friends to PAVORA. After 10 qualifying referrals, earn ₹2 per qualifying referral including your first 10. Rewards require verification and manual payout approval.</p>'+
'<div class="invStats"><div class="invMetric"><strong id="pvInvCount">0</strong><small>Verified friends joined</small></div><div class="invMetric"><strong id="pvInvNext">1</strong><small>Next badge at</small></div></div>'+
'<div class="invFunnel"><h3>🔗 Invite link activity</h3><div class="invFunnelGrid"><div><b id="pvInvClicks">—</b><small>Link opens</small></div><div><b id="pvInvSignups">—</b><small>Verified signups</small></div><div><b id="pvInvOpened">—</b><small>App opened</small></div></div><p>Link opens are approximate sessions, not unique people. If somebody opens the link but never creates an ID, only link opens increase.</p></div>'+
'<div class="invRewards"><div class="invReward" data-target="1"><b>✦</b><small>1 Friend</small></div><div class="invReward" data-target="5"><b>✧</b><small>5 Friends</small></div><div class="invReward" data-target="10"><b>✪</b><small>10 Friends</small></div><div class="invReward" data-target="25"><b>♛</b><small>25 Friends</small></div><div class="invReward" data-target="50"><b>★</b><small>50 Friends</small></div></div>'+
'<div class="invCash"><h3>💸 Referral Earnings</h3><div class="invAmount" id="pvInvCash">₹0.00</div><p class="invInstall" id="pvInvInstall">0/10 verified signups + app opens</p><p class="invPayoutNote" id="pvInvCashInfo">Unlock at 10 qualifying referrals. Earnings are subject to anti-fraud review; not automatically paid.</p><label for="pvInvUpi">UPI ID for manual payout request</label><input id="pvInvUpi" type="text" autocomplete="off" maxlength="100" placeholder="yourname@upi"/><button type="button" id="pvInvPayout" disabled>Request payout (minimum ₹20)</button></div>'+
'<div class="invHistory"><h3>📋 Referral & payout history</h3><div id="pvInvHistory" class="invHistoryList">Loading history…</div></div>'+
'<div class="invLink" id="pvInvLink">Preparing your personal invitation link…</div>'+
'<div class="invActions"><button type="button" id="pvInvCopy">⧉ Copy link</button><button type="button" id="pvInvShare">↗ Share invite</button></div>'+
'<div class="invStatus" role="status" id="pvInvStatus"></div>'+
'<p class="invHelp">Cash campaign: ₹2 per qualifying referral, unlocked only after 10 new verified users open the installed app. PWA installation signals are not fraud-proof. Payout requests undergo manual checks and actual payment by PAVORA. No automatic transfer or guaranteed payout before approval.</p>'+
'</div>';
document.body.append(dialog);
const $=selector=>dialog.querySelector(selector);
let link='',currentId=null,opening=false,claimedFor='',modalBefore=null,eligibleForPayout=false;
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
 const installed=Number(data.installed_count)||0;
 const approved=Number(data.approved_count)||0;
 const available=(Number(data.pending_review_paise)||0)/100;
 const inReview=(Number(data.payout_in_review_paise)||0)/100;
 $('#pvInvCash').textContent='₹'+available.toFixed(2);
 $('#pvInvPayout').textContent=data.campaign_enabled?'Request payout (minimum ₹20)':'Campaign paused by PAVORA';
 $('#pvInvInstall').textContent=approved+'/10 admin-approved referrals · '+installed+' installed-app signals';
 $('#pvInvCashInfo').textContent=!data.campaign_enabled?'Cash campaign is paused. Referral counts continue, but new payouts are disabled.':approved<10?'You need '+(10-approved)+' more admin-approved referrals to unlock cash rewards.':inReview>0?'₹'+inReview.toFixed(2)+' payout request is under review. Available earnings are separate.':'₹2 per approved referral including first 10. Actual payments require manual review.';
 eligibleForPayout=!!data.campaign_enabled&&approved>=10&&available>=20&&inReview===0;
 $('#pvInvPayout').disabled=!eligibleForPayout;
 currentId=u.id;
 await Promise.all([loadHistory(client),loadFunnel(client)]);
}
async function loadFunnel(client){
 try{
  const {data,error}=await client.rpc('pv_referral_my_funnel');if(error)throw error;
  $('#pvInvClicks').textContent=String(data?.link_opens??0);
  $('#pvInvSignups').textContent=String(data?.verified_signups??0);
  $('#pvInvOpened').textContent=String(data?.app_launches??0);
 }catch(e){console.warn('Personal referral funnel unavailable',e)}
}
async function loadHistory(client){
 const root=$('#pvInvHistory');root.textContent='Loading history…';
 try{
  const {data,error}=await client.rpc('pv_get_invite_history');if(error)throw error;
  root.replaceChildren();
  const refs=data?.referrals||[],pays=data?.payouts||[];
  if(!refs.length&&!pays.length){root.textContent='No referral or payout history yet.';return}
  const entries=[...refs.map(x=>({date:x.date,label:'Friend signup · '+(x.installed?'App opened':'Awaiting app open'),status:x.status})),...pays.map(x=>({date:x.created_at,label:'UPI payout ₹'+(Number(x.amount_paise)/100).toFixed(2),status:x.status+(x.reference?' · Ref '+x.reference:'')+(x.review_note?' · '+x.review_note:'')}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,80);
  for(const x of entries){const row=document.createElement('div');row.className='invHistoryRow';const left=document.createElement('span');left.textContent=x.label+' · '+new Date(x.date).toLocaleDateString('en-IN');const right=document.createElement('span');right.textContent=x.status;row.append(left,right);root.append(row)}
 }catch(err){root.textContent='History unavailable: '+(err.message||'Try again')}
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
$('#pvInvPayout').onclick=async()=>{
 if(!eligibleForPayout){$('#pvInvStatus').textContent='Campaign must be active and you need 10 admin-approved referrals plus ₹20 earnings.';return}
 const upi=$('#pvInvUpi').value.trim();
 if(!/^[a-zA-Z0-9._-]{2,80}@[a-zA-Z]{2,30}$/.test(upi)){$('#pvInvStatus').textContent='Enter a valid UPI ID, e.g. name@upi.';return}
 if(!confirm('Submit a manual payout request for review? PAVORA must verify referrals and send the payment separately.'))return;
 const button=$('#pvInvPayout');button.disabled=true;
 try{
  const {data,error}=await db().rpc('pv_request_invite_payout',{p_upi_id:upi});
  if(error)throw error;
  $('#pvInvStatus').textContent=data==='submitted_for_review'?'✓ Payout request submitted. Payment is not automatic; PAVORA will review and process it.':'Payout not submitted: '+String(data||'try again');
  await dashboard();
 }catch(err){$('#pvInvStatus').textContent='Request failed: '+(err.message||'Try again.');button.disabled=false}
};
$('#pvInvShare').onclick=async()=>{
 if(!link){$('#pvInvStatus').textContent='Invite link is not ready.';return}
 const message='Join me on PAVORA! Create your profile, install the app, and explore Reels, Stories and more. '+link;
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
async function refreshLogin(){
 const u=user();
 if(!u){currentId=null;link='';claimedFor='';return}
 if(currentId&&currentId!==u.id){currentId=null;link=''}
 await attemptClaim();
 // PWA standalone launch is only an install attestation; payouts need human review.
 if(window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true){
  try{const {error}=await db().rpc('pv_confirm_invite_launch');if(error)throw error}
  catch(err){console.warn('Invite install attestation failed:',err)}
 }
}
const authCheck=setInterval(()=>{if(db()&&user()){clearInterval(authCheck);refreshLogin()}},1300);
setTimeout(()=>clearInterval(authCheck),60000);
if(db())db().auth.onAuthStateChange((event,session)=>{setTimeout(refreshLogin,400)});
window.PAVORA_INVITES={open:show,refresh:dashboard,version:'187'};
})();