/* PAVORA Cloud v2 — public publishable key, never a secret key */
(async function(){
const URL='https://iyqmjaomslffqfwbsydr.supabase.co';
const KEY='sb_publishable_uaHMT5xlLu6egTFd7uaqQQ_LN6sbwhr';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
if(!window.supabase?.createClient){pvRevealApp();alert('Unable to load Supabase SDK. Check internet connection.');return}
const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}});
function pvRevealApp(){if(window.__pvLaunchVisualTimer)clearTimeout(window.__pvLaunchVisualTimer);document.body.classList.remove('pvBooting','pvEarlyShell');document.body.classList.add('pvLaunchReady')}
// Keep the sign-in form responsive if authentication or network is unavailable.
function pvAuthTimeout(promise,ms=15000){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Login is taking too long. Check your internet connection, then try again.')),ms))])}

let user=null,feed=[],profile=null;
// Official status comes only from the database-controlled verification flag.
let pvOfficialId=null;
async function pvLoadOfficialIdentity(){
 try{
  const {data,error}=await db.from('profiles').select('id').eq('is_official',true).limit(1).maybeSingle();
  if(error)return; // Migration may not have been applied yet.
  const previousOfficialId=pvOfficialId;
  pvOfficialId=data?.id||null;
  // Avoid rebuilding loaded images and video when the official badge resolves.
  if(user&&feed.length&&previousOfficialId!==pvOfficialId){
    for(const post of feed){
      const heading=document.getElementById('pv-post-'+post.id)?.querySelector('.posthead .pvPersonButton');
      const badge=heading?.parentElement?.querySelector('.pvOfficialBadge');
      if(post.author_id===pvOfficialId&&heading&&!badge)heading.after(pvOfficialBadge());
      else if(post.author_id===previousOfficialId&&badge)badge.remove();
    }
  }
 }catch(e){console.warn('Official identity lookup:',e)}
}
function pvOfficialBadge(){const b=document.createElement('span');b.className='pvOfficialBadge';b.textContent='✓';b.setAttribute('aria-label','Verified official PAVORA account');b.title='Verified official PAVORA account';return b}
const officialStyle=document.createElement('style');officialStyle.textContent=`
#pvPublicView .pvPublicName{display:flex;align-items:center;gap:5px;margin:0 0 8px}
#pvPublicView .pvPublicStats{display:flex;flex-wrap:wrap;gap:8px 18px;color:#bdb7ce;font-size:12px;margin:13px 0}
#pvPublicView .pvPublicStats strong{color:#f8f6fb;font-weight:800;font-size:14px}

#pvPublicView .pvPublicName .pvOfficialBadge{width:21px;height:21px;font-size:14px}
#pvPublicView .pvPublicOfficialType{font-size:12px;font-weight:700;color:#94caff;margin:0 0 9px}

.pvOfficialBadge{display:inline-grid;place-items:center;margin-left:7px;width:19px;height:19px;border-radius:50%;background:#2697f4;color:#fff;font-size:13px;font-weight:900;line-height:1;vertical-align:middle;box-shadow:0 0 0 2px #2697f420}
#pvOfficialHub{margin:16px 0 8px;padding:19px 20px;background:linear-gradient(125deg,#191226,#11121a 75%);border:1px solid #352549;border-radius:17px}
#pvOfficialHub[hidden]{display:none!important}
#pvOfficialHub .pvOfficialEyebrow{font-size:10px;text-transform:uppercase;letter-spacing:1.8px;font-weight:800;color:#b59bd8}
#pvOfficialHub h3{font-size:19px;margin:8px 0;color:#fff}
#pvOfficialHub p{font-size:13px;color:#c6bdd5;line-height:1.65;margin:7px 0 14px}
#pvOfficialHub .pvOfficialLinks{display:flex;gap:10px;flex-wrap:wrap}
#pvOfficialHub button{border:1px solid #654a94;border-radius:10px;padding:10px 14px;background:#302044;color:#fff;font-weight:700;cursor:pointer}
#pvOfficialHub button:hover{background:#442960}
body.pvProfileMode .pvTopLine .pvOfficialBadge{width:23px;height:23px;font-size:16px}
body.pvProfileMode #pvOfficialType{display:block;margin-top:5px;color:#a7b4c7;font-weight:650;font-size:12px}
.pvTabs button{border:0;border-top:2px solid transparent;margin-top:-1px;padding:14px 30px;background:transparent;color:#a8a5b6;font-size:12px;font-weight:800;letter-spacing:1.5px;cursor:pointer}
.pvTabs button.active{color:#fff;border-top-color:#bc8bff}
@media(max-width:600px){#pvOfficialHub{padding:15px;margin:12px 8px}#pvOfficialHub h3{font-size:17px}.pvTabs button{padding:13px 12px;font-size:11px}}
`;document.head.append(officialStyle);
pvLoadOfficialIdentity();
window.PVKit={db,getUser:()=>user,notify:message=>alert(message)};
let pvSessionInitializing=null,pvSessionInitUser=null,pvSessionReadyForUser=null;
let pvAuthBootstrapped=false,pvExplicitSignout=false;
const style=document.createElement('style');style.textContent=`
#authOverlay.pvAuthHidden{display:none!important}#authOverlay{position:fixed;inset:0;background:#fafafa;color:#161616;z-index:20;display:flex;min-height:100dvh;overflow:auto;font-family:Inter,system-ui,Arial}
#authOverlay .authShowcase{width:55%;min-height:100dvh;padding:45px clamp(25px,6vw,95px);display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 75% 70%,#f5dcff 0,transparent 45%),linear-gradient(135deg,#fff7fc,#f4f1ff);border-right:1px solid #e8e2ec}
#authOverlay .authLogo{font-size:30px;font-weight:900;letter-spacing:-1.5px;background:linear-gradient(90deg,#7b4dfa,#f241a6);background-clip:text;color:transparent}
#authOverlay .authShowcase h1{font-size:clamp(34px,4.3vw,65px);line-height:1.12;letter-spacing:-2px;max-width:640px;margin:40px 0 15px}
#authOverlay .authShowcase h1 em{font-style:normal;background:linear-gradient(90deg,#f26654,#eb3c9e,#8259ff);background-clip:text;color:transparent}
#authOverlay .authShowcase p{font-size:17px;line-height:1.6;color:#676174;max-width:470px}
#authOverlay .authArt{position:relative;display:flex;align-items:center;justify-content:center;min-height:230px;margin-top:25px}
#authOverlay .authArtCard{width:145px;height:205px;border-radius:22px;box-shadow:0 20px 45px #533e8a2b;border:5px solid #fff;display:grid;place-items:center;font-size:50px}
#authOverlay .authArtCard:nth-child(1){background:linear-gradient(135deg,#ffadbd,#ffdb90);transform:rotate(-14deg) translateX(20px)}
#authOverlay .authArtCard:nth-child(2){background:linear-gradient(135deg,#8b72ff,#ee8fd0);z-index:1;transform:translateY(-12px)}
#authOverlay .authArtCard:nth-child(3){background:linear-gradient(135deg,#83d9f4,#a89bff);transform:rotate(14deg) translateX(-20px)}
#authOverlay .authRight{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;padding:35px 28px}
#authBox{width:min(420px,100%);padding:12px 0}
#authBox h2{font-size:25px;letter-spacing:-.5px;margin:0 0 8px}
#authBox .authSub{font-size:14px;color:#77717e;margin:0 0 28px}
#authBox label{display:block;font-size:13px;font-weight:600;margin:13px 0 6px}
#authBox input{width:100%;padding:14px 15px;background:white;color:#161616;border:1px solid #d9d5df;border-radius:12px;outline:none;font-size:14px}
#authBox input:focus{border-color:#8a60ec;box-shadow:0 0 0 3px #8a60ec20}
#authBox .authPasswordRow{display:flex;align-items:center;position:relative}
#authBox .authPasswordRow input{padding-right:72px}
#authBox .authPasswordRow button{position:absolute;right:7px;border:0;background:transparent;color:#7652c6;padding:8px;font-size:12px;font-weight:700;cursor:pointer}
#authBox .authMainBtn{width:100%;border:0;border-radius:12px;padding:14px;color:#fff;background:linear-gradient(90deg,#7e5cf2,#e64eaa);font-weight:750;margin-top:22px;cursor:pointer}
#authBox .authMainBtn:disabled{opacity:.6;cursor:wait}
#authBox .authSwitch{width:100%;border:1px solid #a58df2;border-radius:12px;padding:12px;background:#fff;color:#6946c9;font-weight:700;cursor:pointer}
#authBox .authLink{border:0;background:none;color:#6f4ecb;cursor:pointer;padding:9px;font-weight:600}
#authBox .authCenter{text-align:center;margin-top:12px}
#authBox .authDivider{display:flex;align-items:center;gap:14px;margin:22px 0;color:#999;font-size:12px}
#authBox .authDivider:before,#authBox .authDivider:after{content:'';height:1px;background:#e3e0e7;flex:1}
#authBox #authMsg{color:#a32860;min-height:20px;font-size:13px;line-height:1.5;margin-top:14px}
#authBox .authTerms{font-size:12px;color:#85808b;text-align:center;line-height:1.5;margin-top:20px}
#authBox [hidden]{display:none!important}
#cloudStatus{font-size:12px;color:#bdb4d5;margin:0 0 12px}#signout{margin-left:8px}
@media(min-width:851px){#authOverlay{display:grid!important;grid-template-columns:minmax(0,55%) minmax(0,45%);grid-template-rows:minmax(100dvh,auto);align-items:stretch}#authOverlay>.authShowcase{grid-column:1;grid-row:1;width:100%;min-width:0;min-height:100dvh}#authOverlay>.authRight{grid-column:2;grid-row:1;width:100%;min-width:0;min-height:100dvh}#authOverlay #authBox{margin:auto}}
@media(max-width:850px){#authOverlay{display:block!important}#authOverlay .authShowcase{display:none}#authOverlay .authRight{min-height:100dvh}#authBox{max-width:440px}}
`;document.head.append(style);
const overlay=document.createElement('div');overlay.id='authOverlay';
overlay.innerHTML=`<section class="authShowcase"><div class="authLogo">PAVORA ✦</div><h1>Share moments.<br><em>Make connections.</em></h1><p>Your space to share photos, discover creators, and stay close to the people who matter.</p><div class="authArt" aria-hidden="true"><div class="authArtCard">📷</div><div class="authArtCard">💜</div><div class="authArtCard">✨</div></div></section><section class="authRight"><div id="authBox"><div class="authLogo" style="margin-bottom:28px">PAVORA ✦</div><h2 id="authHeading">Log in to PAVORA</h2><p class="authSub" id="authSubtitle">Welcome back! Enter your details to continue.</p><form id="authForm"><div id="authNameWrap" hidden><label for="authName">Full name</label><input id="authName" type="text" placeholder="Your name" autocomplete="name" maxlength="60"></div><div id="authUsernameWrap" hidden><label for="authUsername">Username</label><input id="authUsername" type="text" placeholder="Choose a username" autocomplete="username" maxlength="24" pattern="[A-Za-z0-9_]{3,24}"></div><div class="pvAuthMethods" id="pvAuthMethods"><button type="button" class="pvAuthMethod active" id="pvMethodEmail" aria-pressed="true">✉ Email</button><button type="button" class="pvAuthMethod" id="pvMethodPhone" aria-pressed="false" disabled title="Mobile signup will launch when SMS verification is available">📱 Phone · Soon</button></div><div id="pvEmailWrap"><label for="authEmail">Email address</label><input id="authEmail" type="email" placeholder="you@example.com" required autocomplete="email"></div><div id="pvPhoneWrap" hidden><label for="authPhone">Mobile number (India)</label><div class="pvPhoneInput"><span>+91</span><input id="authPhone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="9876543210" maxlength="10" pattern="[6-9][0-9]{9}"></div><small>Phone signup requires SMS verification.</small></div><div id="pvOtpWrap" hidden><label for="pvOtp">SMS verification code</label><input id="pvOtp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]{4,8}" placeholder="Enter the code sent by SMS"><button type="button" class="authLink" id="pvOtpResend">Resend code</button></div><label for="authPassword">Password</label><div class="authPasswordRow"><input id="authPassword" type="password" placeholder="At least 6 characters" required minlength="6" autocomplete="current-password"><button type="button" id="authTogglePassword">Show</button></div><div id="authConfirmWrap" hidden><label for="authConfirm">Confirm password</label><input id="authConfirm" type="password" placeholder="Enter password again" autocomplete="new-password"></div><button class="authMainBtn" id="authSubmit" type="submit">Log in</button></form><div class="authCenter"><button class="authLink" id="authForgot" type="button">Forgot password?</button></div><div class="authDivider">OR</div><button class="authSwitch" id="signup" type="button">Create new account</button><p id="authMsg" role="status" aria-live="polite" hidden></p><p class="authTerms">By continuing, you agree to use PAVORA respectfully.</p></div></section>`;
document.body.append(overlay);
const status=document.createElement('p');status.id='cloudStatus';status.textContent='Connecting to PAVORA Cloud…';document.querySelector('.feed').prepend(status);
const signout=document.createElement('button');signout.id='signout';signout.className='secondary';signout.textContent='Log out';document.querySelector('.top').append(signout);
/* Visible, accessible authentication feedback beside the submit button and after navigation. */
const pvAuthNotice=document.createElement('div');
pvAuthNotice.className='pvAuthNotice';pvAuthNotice.setAttribute('role','status');pvAuthNotice.setAttribute('aria-live','polite');pvAuthNotice.hidden=true;
document.body.append(pvAuthNotice);
let pvAuthNoticeTimer=null,pvAuthPending=false;
function pvNotifyAuth(message,type='success'){
 clearTimeout(pvAuthNoticeTimer);
 pvAuthNotice.textContent=message;
 pvAuthNotice.dataset.kind=type;
 pvAuthNotice.hidden=false;
 pvAuthNoticeTimer=setTimeout(()=>{pvAuthNotice.hidden=true},4800);
}
function msg(value,kind=''){
 const el=document.getElementById('authMsg');
 el.textContent=value||'';
 el.dataset.kind=kind||(value?/logging|creating|sending|verifying|opening|please wait/i.test(value)?'loading':'error':'');
 el.hidden=!value;
}
function pvAuthBusy(busy,mode=authMode){
 pvAuthPending=busy;
 const submit=document.getElementById('authSubmit');
 submit.disabled=busy;
 submit.setAttribute('aria-busy',String(busy));
 submit.textContent=busy?(mode==='login'?'Logging in…':mode==='signup'?'Creating account…':mode==='reset'?'Sending link…':'Verifying…'):(mode==='login'?'Log in':mode==='signup'?'Create account':mode==='reset'?'Send reset link':'Verify phone');
}
function pvReadableAuthError(err){
 const raw=String(err?.message||'Login failed. Please try again.');
 const code=String(err?.code||'').toLowerCase();
 if(!navigator.onLine||/failed to fetch|network|fetch failed|load failed/i.test(raw))return 'No internet connection. Check your network and try again.';
 if(/invalid login credentials/i.test(raw)||code==='invalid_credentials')return 'Login failed. Email or password is incorrect.';
 if(/email not confirmed|email_not_confirmed/i.test(raw))return 'Please verify your email first. Check your inbox and spam folder.';
 if(/too many requests|rate limit|security purposes/i.test(raw)||err?.status===429)return 'Too many attempts. Please try again later.';
 if(/timeout|too long|timed out/i.test(raw))return 'Login timed out. Check your internet connection and try again.';
 return raw;
}
const pvAuthFeedbackStyle=document.createElement('style');
pvAuthFeedbackStyle.textContent=`
#authBox #authMsg{display:flex;align-items:center;min-height:0;margin:12px 0 0;padding:11px 12px;border-radius:11px;background:#fff1f3;border:1px solid #efb1c1;color:#9f2547;font-size:13px;font-weight:650;line-height:1.5;overflow-wrap:anywhere}
#authBox #authMsg[hidden],#authBox #authMsg:empty{display:none!important}
#authBox #authMsg[data-kind="loading"]{background:#f3efff;color:#6540bc;border-color:#cfc1f2}
#authBox #authMsg[data-kind="success"]{background:#edfbf1;color:#187044;border-color:#a6dfbc}
#authBox .authMainBtn[aria-busy="true"]{opacity:.75;cursor:progress}
.pvAuthNotice{position:fixed;z-index:230;top:max(17px,env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);width:min(400px,calc(100vw - 28px));padding:14px 16px;border:1px solid #52775f;border-radius:14px;background:#193323;color:#edfff2;font:650 13px/1.5 Inter,system-ui,Arial;box-shadow:0 12px 40px #0008;text-align:center;pointer-events:none}
.pvAuthNotice[data-kind="error"]{background:#411e2b;border-color:#945066;color:#ffe4e7}
.pvAuthNotice[hidden]{display:none!important}
@media(max-width:600px){#authBox #authMsg{position:relative;font-size:12px;margin-top:9px}.pvAuthNotice{top:max(12px,env(safe-area-inset-top,0px))}}
`;document.head.append(pvAuthFeedbackStyle);
const pvPhoneStyles=document.createElement('style');pvPhoneStyles.textContent=`
#authOverlay .pvAuthMethods{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:2px 0 16px}
#authOverlay .pvAuthMethod{border:1px solid #59506d;border-radius:12px;padding:11px;background:#211b32;color:#d9d2eb;cursor:pointer;font-weight:700}
#authOverlay .pvAuthMethod:disabled{opacity:.58;cursor:not-allowed}#authOverlay .pvAuthMethod.active{color:white;background:#6d40d5;border-color:#a58afa}
#authOverlay .pvPhoneInput{display:flex;align-items:center;gap:9px;background:#1d172b;border:1px solid #514768;border-radius:10px;padding-left:12px}
#authOverlay .pvPhoneInput span{font-weight:700;color:#e5ddf7}
#authOverlay .pvPhoneInput input{min-width:0;flex:1;margin:0;border:0;background:transparent;outline:0}
#authOverlay #pvPhoneWrap small{display:block;margin:7px 0 12px;color:#c7bfd9}
#authOverlay #pvOtpResend{margin:8px 0 12px}
`;document.head.append(pvPhoneStyles);
let pvAuthMethod='email',pvPhonePending='';
function pvSwitchMethod(method){pvAuthMethod=method;pvPhonePending='';document.getElementById('pvOtpWrap').hidden=true;document.getElementById('pvOtp').required=false;document.getElementById('pvEmailWrap').hidden=method!=='email';document.getElementById('pvPhoneWrap').hidden=method!=='phone';document.getElementById('authEmail').required=method==='email';document.getElementById('authPhone').required=method==='phone';document.getElementById('pvMethodEmail').classList.toggle('active',method==='email');document.getElementById('pvMethodPhone').classList.toggle('active',method==='phone');document.getElementById('pvMethodEmail').setAttribute('aria-pressed',String(method==='email'));document.getElementById('pvMethodPhone').setAttribute('aria-pressed',String(method==='phone'));setAuthMode(authMode)}
document.getElementById('pvMethodEmail').onclick=()=>pvSwitchMethod('email');
document.getElementById('pvMethodPhone').onclick=()=>pvSwitchMethod('phone');
document.getElementById('pvOtpResend').onclick=async()=>{if(!pvPhonePending)return;try{const {error}=await db.auth.resend({type:'sms',phone:pvPhonePending});if(error)throw error;msg('Fresh verification code sent to '+pvPhonePending)}catch(e){msg(e.message||'Could not resend SMS. Check SMS provider settings.')}};

let authMode='login';
let pvSignupEmailCooldownUntil=0;
let pvSignupCooldownTimer=null;
function pvSignupEmailLimitMessage(){
 return 'PAVORA cannot send more verification emails right now because the email service limit has been reached. Existing users can log in. For reliable new signups, the admin must configure Custom SMTP in Supabase Authentication → SMTP Settings. Please try signup later.';
}
function pvShowSignupEmailLimit(){
 pvSignupEmailCooldownUntil=Date.now()+5*60*1000;
 msg(pvSignupEmailLimitMessage(),'error');
 const feedback=document.getElementById('authMsg');
 let action=document.getElementById('pvAuthBackToLogin');
 if(!action){
  action=document.createElement('button');action.type='button';action.id='pvAuthBackToLogin';
  action.textContent='Already have an account? Log in';
  action.style.cssText='display:block;width:100%;margin-top:8px;padding:9px 12px;background:#fff;color:#6844bd;border:1px solid #ac92e2;border-radius:9px;font-size:12px;font-weight:750;cursor:pointer';
  action.onclick=()=>{if(!pvAuthPending)setAuthMode('login')};
  feedback.insertAdjacentElement('afterend',action);
 }
 action.hidden=false;
 if(pvSignupCooldownTimer)clearTimeout(pvSignupCooldownTimer);
 pvSignupCooldownTimer=setTimeout(()=>{pvSignupCooldownTimer=null;pvSignupEmailCooldownUntil=0},5*60*1000);
}

function setAuthMode(mode){document.getElementById('pvAuthBackToLogin')?.setAttribute('hidden','');authMode=mode;pvPhonePending='';document.getElementById('pvOtpWrap').hidden=true;document.getElementById('pvOtp').required=false;document.getElementById('pvAuthMethods').hidden=mode==='reset';document.getElementById('pvEmailWrap').hidden=mode!=='reset'&&pvAuthMethod==='phone';document.getElementById('pvPhoneWrap').hidden=mode==='reset'||pvAuthMethod==='email';document.getElementById('authEmail').required=mode==='reset'||pvAuthMethod==='email';document.getElementById('authPhone').required=mode!=='reset'&&pvAuthMethod==='phone';msg('');const signup=mode==='signup',reset=mode==='reset';document.getElementById('authNameWrap').hidden=!signup;document.getElementById('authUsernameWrap').hidden=!signup;document.getElementById('authConfirmWrap').hidden=!signup;document.getElementById('authName').required=signup;document.getElementById('authUsername').required=signup;document.getElementById('authConfirm').required=signup;document.getElementById('authName').disabled=!signup;document.getElementById('authUsername').disabled=!signup;document.getElementById('authConfirm').disabled=!signup;document.getElementById('authPhone').disabled=reset||pvAuthMethod!=='phone';document.getElementById('pvOtp').disabled=!pvPhonePending;document.getElementById('authPassword').required=!reset;document.getElementById('authPassword').closest('.authPasswordRow').previousElementSibling.hidden=reset;document.getElementById('authPassword').closest('.authPasswordRow').hidden=reset;document.getElementById('authHeading').textContent=signup?'Create your account':reset?'Reset your password':'Log in to PAVORA';document.getElementById('authSubtitle').textContent=signup?'Join PAVORA in a few easy steps.':reset?'We will send you a password reset link.':'Welcome back! Enter your details to continue.';document.getElementById('authSubmit').textContent=signup?'Create account':reset?'Send reset link':'Log in';document.getElementById('signup').textContent=signup||reset?'Back to log in':'Create new account';document.getElementById('authForgot').hidden=signup||reset||pvAuthMethod==='phone';document.getElementById('authPassword').autocomplete=signup?'new-password':'current-password'}
// Disable inactive signup fields even on initial login, so Chrome autofill cannot block submit.
setAuthMode('login');
// Place feedback immediately below the main action, above OR and account switching.
document.getElementById('authSubmit').insertAdjacentElement('afterend',document.getElementById('authMsg'));
document.getElementById('signup').onclick=()=>{if(!pvAuthPending)setAuthMode(authMode==='login'?'signup':'login')};
document.getElementById('authForgot').onclick=()=>{if(!pvAuthPending)setAuthMode('reset')};
/* Account recovery support: request only; never request passwords, OTPs or secrets. */
const pvSupportButton=document.createElement('button');
pvSupportButton.type='button';
pvSupportButton.id='pvRecoverySupportButton';
pvSupportButton.className='authLink';
pvSupportButton.textContent='Need help? Contact Support';
pvSupportButton.setAttribute('aria-haspopup','dialog');
document.querySelector('#authBox .authCenter')?.append(pvSupportButton);
const pvSupportPanel=document.createElement('div');
pvSupportPanel.id='pvRecoverySupportDialog';
pvSupportPanel.hidden=true;
pvSupportPanel.setAttribute('role','dialog');
pvSupportPanel.setAttribute('aria-modal','true');
pvSupportPanel.setAttribute('aria-label','PAVORA Account Recovery Support');
pvSupportPanel.innerHTML=`<div class="pvRecoverySupportCard"><button type="button" id="pvRecoveryClose" aria-label="Close support form">×</button><h2>Account Recovery Support</h2><p>Forgot your password or cannot use email reset? Tell our team what happened. Never share your password, OTP or recovery codes.</p><form id="pvRecoveryForm"><label for="pvRecoveryEmail">Your account email</label><input id="pvRecoveryEmail" required type="email" autocomplete="email" placeholder="name@gmail.com" maxlength="254"><label for="pvRecoveryIssue">What is the problem?</label><textarea id="pvRecoveryIssue" required minlength="4" maxlength="280" rows="3" placeholder="I cannot access my email or reset my password."></textarea><button type="submit" id="pvRecoverySend">Send support request</button></form><p id="pvRecoveryStatus" role="status" aria-live="polite"></p><p class="pvRecoveryFootnote">A support request does not automatically reset a password. The team must verify account ownership first.</p></div>`;
document.body.append(pvSupportPanel);
const pvSupportStyle=document.createElement('style');
pvSupportStyle.textContent=`
#pvRecoverySupportDialog[hidden]{display:none!important}
#pvRecoverySupportDialog{position:fixed;inset:0;z-index:900;background:#100b1bd9;display:grid;place-items:center;padding:16px}
.pvRecoverySupportCard{position:relative;width:min(450px,100%);background:#fff;border-radius:20px;padding:26px;color:#211b2a;box-shadow:0 20px 80px #0006;font:14px/1.5 Inter,system-ui,sans-serif}
.pvRecoverySupportCard h2{font-size:22px;margin:0 0 8px}.pvRecoverySupportCard p{color:#65596f;font-size:13px}
#pvRecoveryClose{position:absolute;top:10px;right:14px;border:0;background:transparent;font-size:27px;color:#756581;cursor:pointer}
#pvRecoveryForm{display:flex;flex-direction:column;gap:8px;margin-top:20px}
#pvRecoveryForm label{font-weight:700;font-size:12px;margin-top:3px}
#pvRecoveryForm input,#pvRecoveryForm textarea{font:inherit;width:100%;box-sizing:border-box;border:1px solid #d3c8df;border-radius:10px;background:#faf8fd;color:#231a31;padding:12px}
#pvRecoverySend{background:#7546d7;color:#fff;border:0;padding:12px;border-radius:11px;font-weight:800;cursor:pointer;margin-top:6px}
#pvRecoverySend:disabled{opacity:.65}#pvRecoveryStatus{font-weight:650;font-size:12px;min-height:0}
.pvRecoveryFootnote{font-size:11px!important}
`;
document.head.append(pvSupportStyle);
pvSupportButton.onclick=()=>{
 pvSupportPanel.hidden=false;
 const e=document.getElementById('pvRecoveryEmail');
 e.value=document.getElementById('authEmail').value.trim();
 document.getElementById('pvRecoveryStatus').textContent='';
 e.focus();
};
document.getElementById('pvRecoveryClose').onclick=()=>{pvSupportPanel.hidden=true};
pvSupportPanel.addEventListener('click',event=>{if(event.target===pvSupportPanel)pvSupportPanel.hidden=true});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!pvSupportPanel.hidden)pvSupportPanel.hidden=true});
document.getElementById('pvRecoveryForm').onsubmit=async event=>{
 event.preventDefault();
 const button=document.getElementById('pvRecoverySend'),feedback=document.getElementById('pvRecoveryStatus');
 if(button.disabled)return;
 const email=document.getElementById('pvRecoveryEmail').value.trim();
 const issue=document.getElementById('pvRecoveryIssue').value.trim();
 button.disabled=true;button.textContent='Sending request…';feedback.textContent='Submitting securely…';
 try{
  const {data,error}=await pvAuthTimeout(db.functions.invoke('pavora-recovery-support',{body:{email,issue}}),20000);
  if(error)throw error;
  if(!data?.message)throw Error('Support response unavailable.');
  feedback.textContent=data.message;
  if(data.message.startsWith('Support request received'))document.getElementById('pvRecoveryIssue').value='';
 }catch(error){feedback.textContent='Unable to submit request. Check your connection and try again.';console.warn('PAVORA recovery request unavailable:',error.message)}
 finally{button.disabled=false;button.textContent='Send support request'}
};

document.getElementById('authTogglePassword').onclick=()=>{const input=document.getElementById('authPassword');input.type=input.type==='password'?'text':'password';document.getElementById('authTogglePassword').textContent=input.type==='password'?'Show':'Hide'};
/* Authentication controls must never appear unresponsive on browser validation failure.
   Native constraint validation prevents the submit handler from firing. */
const pvAuthForm=document.getElementById('authForm');
const pvAuthSubmit=document.getElementById('authSubmit');
pvAuthForm.addEventListener('invalid',event=>{
 const input=event.target;
 if(!(input instanceof HTMLInputElement))return;
 const label=input.labels?.[0]?.textContent?.trim()||input.getAttribute('aria-label')||input.name||'form field';
 const detail=input.validity.valueMissing?'is required':input.validity.typeMismatch?'has an invalid format':input.validity.tooShort?'is too short':input.validity.patternMismatch?'has an invalid format':'needs attention';
 msg(label+' '+detail+'. Please correct it and try again.','error');
},true);
pvAuthSubmit.addEventListener('click',()=>{
 if(pvAuthPending)return;
 const invalid=[...pvAuthForm.querySelectorAll('input')].find(input=>input.willValidate&&!input.disabled&&!input.closest('[hidden]')&&!input.validity.valid);
 if(invalid){
  const label=invalid.labels?.[0]?.textContent?.trim()||invalid.placeholder||'Input';
  msg('Please check '+label+'. '+(invalid.validationMessage||''),'error');
 }else msg('Checking your login details…','loading');
});
document.getElementById('authForm').onsubmit=async e=>{
e.preventDefault();
if(pvAuthPending)return;
const email=document.getElementById('authEmail').value.trim();
const phoneInput=document.getElementById('authPhone').value.trim();
const phone='+91'+phoneInput;
const usingPhone=pvAuthMethod==='phone'&&authMode!=='reset';
const password=document.getElementById('authPassword').value;
const btn=document.getElementById('authSubmit');
if(pvPhonePending){
 const token=document.getElementById('pvOtp').value.trim();
 if(!/^[0-9]{4,8}$/.test(token))return msg('Enter the 6-digit SMS verification code.');
 pvAuthBusy(true,'verify');msg('Verifying mobile number…','loading');
 try{const {data,error}=await pvAuthTimeout(db.auth.verifyOtp({phone:pvPhonePending,token,type:'sms'}));if(error)throw error;pvPhonePending='';msg('Mobile number verified! Opening PAVORA…','success');if(data?.session){pvNotifyAuth('✓ Login successful! Welcome to PAVORA.');await setSession(data.session)}else setAuthMode('login')}catch(err){msg(pvReadableAuthError(err),'error')}finally{pvAuthBusy(false,authMode)}
 return;
}
if(usingPhone&&!/^[6-9][0-9]{9}$/.test(phoneInput))return msg('Enter a valid 10-digit Indian mobile number.');
if(!usingPhone&&!email)return msg('Please enter your email.');
if(authMode==='signup'&&password!==document.getElementById('authConfirm').value)return msg('Passwords do not match.');
if(authMode==='signup'&&!usingPhone&&Date.now()<pvSignupEmailCooldownUntil){
 pvShowSignupEmailLimit();return;
}
pvAuthBusy(true,authMode);msg(authMode==='login'?'Logging in…':authMode==='signup'?'Creating your account…':'Sending reset link…','loading');
try{
 if(authMode==='login'){
  const credentials=usingPhone?{phone,password}:{email,password};
  const {data,error}=await pvAuthTimeout(db.auth.signInWithPassword(credentials));
  if(error)throw error;
  if(data?.session){msg('Login successful! Opening PAVORA…','success');pvNotifyAuth('✓ Login successful! Welcome to PAVORA.');await setSession(data.session)}
  else throw Error('No session returned. Please try again.');
 }else if(authMode==='reset'){
  const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:'https://max791687.github.io/pavora/'});
  if(error)throw error;msg('If this email has an account, a reset link will arrive shortly. Check spam too.','success');
 }else{
  const username=document.getElementById('authUsername').value.trim(),display_name=document.getElementById('authName').value.trim();
  if(!/^[a-zA-Z0-9_]{3,24}$/.test(username))throw Error('Username must be 3–24 letters, numbers or underscores.');
  const {data:existing,error:lookupError}=await db.from('profiles').select('id').eq('username',username).maybeSingle();
  if(lookupError)throw lookupError;if(existing)throw Error('This username is already taken. Try another.');
  const credentials=usingPhone?{phone,password,options:{data:{username,display_name}}}:{email,password,options:{emailRedirectTo:'https://max791687.github.io/pavora/',data:{username,display_name}}};
  const {data,error}=await pvAuthTimeout(db.auth.signUp(credentials));
  if(error)throw error;
  if(data?.session){msg('Account created! Opening PAVORA…','success');pvNotifyAuth('✓ Account created! Welcome to PAVORA.');await setSession(data.session)}
  else if(usingPhone){
   pvPhonePending=phone;document.getElementById('pvOtpWrap').hidden=false;
   document.getElementById('pvOtp').required=true;document.getElementById('pvOtp').disabled=false;
   document.getElementById('pvOtp').value='';
   document.getElementById('authNameWrap').hidden=true;document.getElementById('authUsernameWrap').hidden=true;document.getElementById('authConfirmWrap').hidden=true;document.getElementById('authName').required=false;document.getElementById('authUsername').required=false;document.getElementById('authConfirm').required=false;document.getElementById('authPhone').required=false;
   document.getElementById('authPassword').closest('.authPasswordRow').hidden=true;
   document.getElementById('authPassword').required=false;
   document.getElementById('pvPhoneWrap').hidden=true;
   document.getElementById('pvAuthMethods').hidden=true;
   document.getElementById('authSubmit').textContent='Verify phone';
   msg('We sent a verification code to '+phone+'. Enter it to finish signup.');
   document.getElementById('pvOtp').focus();
  }else msg('Account created! Check your email to confirm, then log in.','success');
 }
}catch(err){
 const raw=String(err?.message||'Something went wrong. Please try again.');
 const code=String(err?.code||'').toLowerCase();
 if(usingPhone&&(/sms provider|sms.*disabled|phone.*disabled|unsupported provider|provider is not enabled/i.test(raw)))msg('Phone signup needs an SMS provider. PAVORA admin: enable Phone in Supabase Authentication → Sign In / Providers and configure SMS delivery.');
 else if(code==='over_email_send_rate_limit'||/email rate limit exceeded|signup email sending limit reached/i.test(raw))pvShowSignupEmailLimit();
 else if(code==='email_address_not_authorized'||/email address not authorized/i.test(raw))msg('PAVORA email service cannot send to this address yet. The admin needs to configure Custom SMTP in Supabase Authentication → SMTP Settings.','error');
 else if(err?.status===429||/rate limit/i.test(raw))msg('Too many attempts right now. Please try again later.');
 else msg(pvReadableAuthError(err),'error');
}finally{pvAuthBusy(false,authMode)}
};
signout.onclick=async()=>{pvExplicitSignout=true;try{const {error}=await db.auth.signOut();if(error)throw error;await setSession(null)}catch(e){pvExplicitSignout=false;alert('Could not log out: '+e.message)}};
async function ensureProfile(){if(!user)return;let {data,error}=await db.from('profiles').select('*').eq('id',user.id).maybeSingle();if(error)throw error;if(!data){const base=(user.email||user.phone||'creator').split('@')[0].replace(/[^a-zA-Z0-9_]/g,'').slice(0,12)||'creator';const requested=user.user_metadata?.username;const username=/^[a-zA-Z0-9_]{3,24}$/.test(requested||'')?requested:(base+'_'+user.id.slice(0,7)).slice(0,24);const display_name=String(user.user_metadata?.display_name||base).slice(0,60);let created=await db.from('profiles').insert({id:user.id,username,display_name}).select().single();if(created.error?.code==='23505'&&username===requested){created=await db.from('profiles').insert({id:user.id,username:(base+'_'+user.id.slice(0,7)).slice(0,24),display_name}).select().single()}if(created.error)throw created.error;data=created.data}profile=data;document.querySelectorAll('.intro b').forEach(e=>e.textContent='@'+data.username);{const title=document.querySelector('#profile h2');if(title)title.textContent=data.username}}
// Warm-start the public feed from a per-account snapshot on this device.
// No messages, auth tokens or private activity are cached here.
function pvFeedCacheKey(uid){return 'pavora-feed-snapshot-v1-'+uid}
function pvShowCachedFeed(uid){
 try{
  const raw=localStorage.getItem(pvFeedCacheKey(uid));
  if(!raw)return false;
  const saved=JSON.parse(raw);
  if(!saved||!Array.isArray(saved.posts)||Date.now()-saved.savedAt>24*3600*1000)return false;
  feed=saved.posts.slice(0,18);
  if(!feed.length)return false;
  draw();
  status.textContent='☁ Recent posts · updating…';
  document.body.classList.remove('pvFeedLoading');
  return true;
 }catch(e){console.warn('Feed snapshot not available:',e);return false}
}
function pvRememberFeed(){
 if(!user||!feed.length)return;
 try{
  const recent=feed.slice(0,18).map(p=>({
   id:p.id,author_id:p.author_id,caption:String(p.caption||'').slice(0,2200),
   image_path:p.image_path,created_at:p.created_at,
   profiles:p.profiles?{id:p.profiles.id,username:p.profiles.username,display_name:p.profiles.display_name,avatar_url:p.profiles.avatar_url}:null,
   likes:(p.likes||[]).slice(0,100).map(x=>({user_id:x.user_id,post_id:x.post_id})),
   comments:(p.comments||[]).slice(0,30).map(x=>({id:x.id,body:x.body,user_id:x.user_id,post_id:x.post_id}))
  }));
  localStorage.setItem(pvFeedCacheKey(user.id),JSON.stringify({savedAt:Date.now(),posts:recent}));
 }catch(e){console.warn('Feed snapshot storage skipped:',e)}
}

// Reconcile counts without replacing existing DOM nodes (and restarting images/videos).
function pvUpdateRenderedFeedStats(){
 for(const post of feed){
  const card=document.getElementById('pv-post-'+post.id);
  if(!card)continue;
  const actions=card.querySelector('.postfoot');
  if(!actions)continue;
  const buttons=actions.querySelectorAll('button');
  const likes=buttons[0],comments=buttons[1];
  if(likes&&!likes.disabled){
   const count=(post.likes||[]).length;
   likes.textContent=((post.likes||[]).some(l=>l.user_id===user?.id)?'♥':'♡')+' '+count+' Likes';
  }
  if(comments&&!comments.disabled)pvRenderComments(post);
 }
}

/* Live post likes: subscribe to secured database events and reconcile only
   the like button. No full page refresh or post/image replacement. */
let pvLikesChannel=null,pvLikesUserId=null,pvLikesTimer=null,pvLikesSyncTimer=null,pvLikesSyncBusy=false;
async function pvSyncVisibleLikes(){
 if(!user||pvLikesSyncBusy||document.hidden||!feed.length)return;
 const uid=user.id,posts=feed.map(p=>p.id).filter(Boolean);
 if(!posts.length)return;
 pvLikesSyncBusy=true;
 try{
  const {data,error}=await db.from('likes').select('post_id,user_id').in('post_id',posts);
  if(error)throw error;
  if(user?.id!==uid)return;
  const grouped=new Map();
  for(const like of data||[]){if(!grouped.has(like.post_id))grouped.set(like.post_id,[]);grouped.get(like.post_id).push(like)}
  for(const post of feed){
   const likes=grouped.get(post.id)||[];
   const btn=document.querySelector('#pv-post-'+post.id+' .postfoot button[data-pv-like-post]');
   // Don't overwrite a user's optimistic click while its request is pending.
   if(btn?.disabled)continue;
   post.likes=likes;
   if(btn)btn.textContent=(likes.some(l=>l.user_id===uid)?'♥':'♡')+' '+likes.length+' Likes';
  }
 }catch(e){console.warn('Live like sync failed:',e.message)}
 finally{pvLikesSyncBusy=false}
}
function pvScheduleLikesSync(delay=160){
 if(pvLikesSyncTimer)clearTimeout(pvLikesSyncTimer);
 pvLikesSyncTimer=setTimeout(()=>{pvLikesSyncTimer=null;pvSyncVisibleLikes()},delay);
}
function pvStopLikesRealtime(){
 if(pvLikesTimer){clearInterval(pvLikesTimer);pvLikesTimer=null}
 if(pvLikesSyncTimer){clearTimeout(pvLikesSyncTimer);pvLikesSyncTimer=null}
 if(pvLikesChannel){const channel=pvLikesChannel;pvLikesChannel=null;try{db.removeChannel(channel).catch(()=>{})}catch(e){}}
 pvLikesUserId=null;pvLikesSyncBusy=false;
}
function pvStartLikesRealtime(){
 if(!user||!db.channel||pvLikesUserId===user.id)return;
 pvStopLikesRealtime();
 const uid=user.id;pvLikesUserId=uid;
 const channel=db.channel('pavora-post-likes-'+uid);
 channel.on('postgres_changes',{event:'INSERT',schema:'public',table:'likes'},()=>{if(user?.id===uid)pvScheduleLikesSync()});
 channel.on('postgres_changes',{event:'DELETE',schema:'public',table:'likes'},()=>{if(user?.id===uid)pvScheduleLikesSync()});
 channel.subscribe(status=>{if(status==='SUBSCRIBED'&&user?.id===uid)pvScheduleLikesSync()});
 pvLikesChannel=channel;
 // Catch missed events after offline/reconnect or delivery gaps, without redrawing feed.
 pvLikesTimer=setInterval(()=>{if(user?.id===uid&&!document.hidden)pvSyncVisibleLikes()},12000);
}


/* Live comment counters and discussion list: never redraw a post image. */
let pvCommentsChannel=null,pvCommentsUid=null,pvCommentsTimer=null,pvCommentsDebounce=null,pvCommentsBusy=false;
const pvCommentsStyle=document.createElement('style');pvCommentsStyle.textContent=".pvCommentItem{padding:10px 0;border-bottom:1px solid #ffffff18;font-size:13px}.pvCommentItem:last-child{border-bottom:0}.pvCommentHeader{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}.pvCommentUsername{font-weight:800;color:#ecdbff}.pvCommentMessage{color:#f3edf7;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5}.pvCommentTools{display:flex;align-items:center;gap:11px;margin-top:5px}.pvCommentTools button{padding:2px 1px;background:none!important;border:0!important;color:#aa94c4;font-size:11px;cursor:pointer}.pvCommentTools button:hover{color:#fff}.pvCommentReplies{margin-left:16px;padding-left:11px;border-left:2px solid #5e4180}.pvCommentReplyComposer{padding:10px;background:#2b2337;border:1px solid #70508f;border-radius:11px;margin:9px 0}.pvCommentReplyComposer[hidden]{display:none!important}.pvCommentReplyComposer small{display:block;color:#d6b3ff;margin-bottom:7px}.pvCommentReplyComposer input{width:100%;box-sizing:border-box;min-height:38px;background:#1f1a29;color:#fff;border:1px solid #705c82;border-radius:8px;padding:9px}.pvCommentReplyComposer button{padding:8px 11px;border:0;border-radius:7px;background:#7148b2;color:#fff;font-size:12px}.pvCommentReplyActions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}";document.head.append(pvCommentsStyle);
const pvCommentPeople=new Map();
function pvCommentAuthor(c){return pvCommentPeople.get(c.user_id)?.username||(c.user_id===user?.id?profile?.username:'user')||'user'}
function pvRenderComments(post){
 const card=document.getElementById('pv-post-'+post.id);
 if(!card)return;
 const all=post.comments||[];
 const button=card.querySelector('[data-pv-comment-post]');
 if(button)button.textContent='💬 '+all.length+' Comments';
 const list=card.querySelector('[data-pv-comment-list]');
 if(!list)return;
 const signature=JSON.stringify(all.map(c=>[c.id,c.body,c.parent_id,c.created_at,pvCommentAuthor(c)]));
 if(list.dataset.signature===signature)return;
 const children=new Map();
 const parentIds=new Set(all.map(c=>c.id));
 const roots=[];
 for(const c of all){if(c.parent_id&&parentIds.has(c.parent_id)){if(!children.has(c.parent_id))children.set(c.parent_id,[]);children.get(c.parent_id).push(c)}
 else roots.push(c)}
 const frag=document.createDocumentFragment();
 const drawComment=(c,isReply=false)=>{
  const item=node('div','pvCommentItem'+(isReply?' pvCommentReply':'')),head=node('div','pvCommentHeader');
  const handle=pvCommentAuthor(c);
  head.append(node('strong','pvCommentUsername','@'+handle),node('span','pvCommentMessage',c.body));
  item.append(head);
  const tools=node('div','pvCommentTools');
  if(!isReply){const reply=node('button','','Reply');reply.type='button';reply.onclick=()=>{
   const composer=card.querySelector('[data-pv-reply-composer]');
   const field=composer?.querySelector('input');
   if(!composer||!field)return;
   composer.hidden=false;composer.dataset.parentId=c.id;
   composer.querySelector('[data-pv-reply-label]').textContent='Replying to @'+handle;
   field.value='';field.focus();
  };tools.append(reply)}
  if(c.user_id===user?.id){const remove=node('button','','Delete');remove.type='button';remove.onclick=async()=>{
   if(!confirm('Delete this comment?'))return;
   remove.disabled=true;
   const {error}=await db.from('comments').delete().eq('id',c.id).eq('user_id',user.id);
   if(error){remove.disabled=false;alert('Cannot delete comment: '+error.message);return}
   post.comments=(post.comments||[]).filter(x=>x.id!==c.id).map(x=>x.parent_id===c.id?{...x,parent_id:null}:x);
   pvRenderComments(post);pvScheduleComments(140);
  };tools.append(remove)}
  if(tools.childElementCount)item.append(tools);
  return item;
 };
 for(const c of roots){
  const item=drawComment(c);
  const replies=children.get(c.id)||[];
  if(replies.length){const nested=node('div','pvCommentReplies');for(const reply of replies)nested.append(drawComment(reply,true));item.append(nested)}
  frag.append(item);
 }
 list.replaceChildren(frag);list.dataset.signature=signature;
}
async function pvSyncComments(){
 if(!user||pvCommentsBusy||document.hidden||!feed.length)return;
 const uid=user.id,ids=feed.map(p=>p.id);
 pvCommentsBusy=true;
 try{
  const {data,error}=await db.from('comments').select('id,post_id,user_id,body,parent_id,created_at').in('post_id',ids).order('created_at',{ascending:true});
  if(error)throw error;
  if(user?.id!==uid)return;
  const idsToLookup=[...new Set((data||[]).map(c=>c.user_id))].filter(id=>!pvCommentPeople.has(id));
  if(idsToLookup.length){
   const {data:authors}=await db.from('profiles').select('id,username').in('id',idsToLookup.slice(0,100));
   for(const a of authors||[])pvCommentPeople.set(a.id,{username:a.username});
  }
  const byPost=new Map();
  for(const c of data||[]){if(!byPost.has(c.post_id))byPost.set(c.post_id,[]);byPost.get(c.post_id).push(c)}
  for(const post of feed){
   if(document.querySelector('#pv-post-'+post.id+' [data-pv-comment-input]')?.disabled)continue;
   post.comments=byPost.get(post.id)||[];
   pvRenderComments(post);
  }
 }catch(e){console.warn('Comment sync unavailable:',e.message)}
 finally{pvCommentsBusy=false}
}
function pvScheduleComments(delay=170){
 if(pvCommentsDebounce)clearTimeout(pvCommentsDebounce);
 pvCommentsDebounce=setTimeout(()=>{pvCommentsDebounce=null;pvSyncComments()},delay);
}
function pvStopComments(){
 if(pvCommentsTimer)clearInterval(pvCommentsTimer);
 if(pvCommentsDebounce)clearTimeout(pvCommentsDebounce);
 if(pvCommentsChannel){try{db.removeChannel(pvCommentsChannel).catch(()=>{})}catch(e){}}
 pvCommentsTimer=null;pvCommentsDebounce=null;pvCommentsChannel=null;pvCommentsUid=null;pvCommentsBusy=false;
}
function pvStartComments(){
 if(!user||!db.channel||pvCommentsUid===user.id)return;
 pvStopComments();const uid=user.id;pvCommentsUid=uid;
 const channel=db.channel('pavora-comments-'+uid);
 for(const event of ['INSERT','DELETE'])channel.on('postgres_changes',{event,schema:'public',table:'comments'},()=>{if(user?.id===uid)pvScheduleComments()});
 channel.subscribe(status=>{if(status==='SUBSCRIBED'&&user?.id===uid)pvScheduleComments()});
 pvCommentsChannel=channel;
 pvCommentsTimer=setInterval(()=>{if(user?.id===uid&&!document.hidden)pvSyncComments()},12000);
}


/* New-post indicator avoids rebuilding visible images while people are reading. */
const pvNewPostsStyle=document.createElement('style');
pvNewPostsStyle.textContent='#pvNewPostsNotice{position:sticky;top:12px;z-index:18;display:flex;align-items:center;justify-content:center;padding:8px;pointer-events:none}#pvNewPostsNotice[hidden]{display:none!important}#pvNewPostsNotice button{pointer-events:auto;border:1px solid #b07fe9;background:#422b67;color:#fff;padding:10px 19px;border-radius:999px;box-shadow:0 9px 30px #0009;cursor:pointer;font-weight:800;font-size:13px}#pvNewPostsNotice button:hover{background:#68419c}@media(prefers-reduced-motion:no-preference){#pvNewPostsNotice button{animation:pvNewPostsAppear .2s ease-out both}@keyframes pvNewPostsAppear{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}}';
document.head.append(pvNewPostsStyle);
const pvNewPostsNotice=node('div');pvNewPostsNotice.id='pvNewPostsNotice';pvNewPostsNotice.hidden=true;
const pvNewPostsButton=node('button','','↑ New posts available');
pvNewPostsButton.type='button';pvNewPostsNotice.append(pvNewPostsButton);
document.getElementById('posts')?.before(pvNewPostsNotice);
pvNewPostsButton.onclick=async()=>{pvNewPostsNotice.hidden=true;await refresh();if(document.body.classList.contains('pvExploreMode')||document.body.classList.contains('pvReelsMode'))return;window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
let pvPostChangesChannel=null,pvPostChangesUser=null,pvPostWatchTimer=null;
function pvStopPostChanges(){
 if(pvPostWatchTimer)clearInterval(pvPostWatchTimer);
 pvPostWatchTimer=null;pvPostChangesUser=null;
 pvNewPostsNotice.hidden=true;
 if(pvPostChangesChannel){const old=pvPostChangesChannel;pvPostChangesChannel=null;try{db.removeChannel(old).catch(()=>{})}catch(e){}}
}
function pvStartPostChanges(){
 if(!user||!db.channel||pvPostChangesUser===user.id)return;
 pvStopPostChanges();const uid=user.id;pvPostChangesUser=uid;
 const channel=db.channel('pavora-post-changes-'+uid);
 channel.on('postgres_changes',{event:'INSERT',schema:'public',table:'posts'},payload=>{
  if(user?.id!==uid||!payload?.new?.id)return;
  if(!feed.some(p=>p.id===payload.new.id)&&payload.new.author_id!==uid)pvNewPostsNotice.hidden=false;
 });
 channel.subscribe();
 pvPostChangesChannel=channel;
 // Reconnect-safe backup: only fetch the latest post id, not all images.
 pvPostWatchTimer=setInterval(async()=>{
  if(user?.id!==uid||document.hidden||!feed.length)return;
  const {data,error}=await db.from('posts').select('id').order('created_at',{ascending:false}).limit(1);
  if(!error&&data?.[0]?.id&&!feed.some(p=>p.id===data[0].id))pvNewPostsNotice.hidden=false;
 },60000);
}

let pvFeedRequestNumber=0;
async function refresh(){if(!user)return;
 const activeUser=user.id,requestNumber=++pvFeedRequestNumber;
 try{if(!feed.length)status.textContent='Loading cloud posts…';const {data,error}=await db.from('posts').select('id,author_id,caption,image_path,created_at').order('created_at',{ascending:false}).limit(50);if(user?.id!==activeUser||requestNumber!==pvFeedRequestNumber)return;if(error){status.textContent='Cloud feed error: '+error.message;return}const freshFeed=data||[];const previousFeed=feed;const oldIds=feed.map(p=>p.id).join(',');const newIds=freshFeed.map(p=>p.id).join(',');const hasRenderedFeed=oldIds===newIds&&freshFeed.length>0&&!!document.getElementById('posts')?.children.length;feed=freshFeed;const ids=feed.map(p=>p.id);if(ids.length){const [profiles,likes,comments]=await Promise.all([db.from('profiles').select('id,username,display_name,avatar_url').in('id',[...new Set(feed.map(p=>p.author_id))]),db.from('likes').select('post_id,user_id').in('post_id',ids),db.from('comments').select('id,post_id,user_id,body,parent_id,created_at').in('post_id',ids).order('created_at',{ascending:true})]);if(profiles.error||likes.error||comments.error){status.textContent='Cloud posts loaded; some social details unavailable: '+[profiles.error,likes.error,comments.error].filter(Boolean).map(e=>e.message).join('; ')}if(user?.id!==activeUser||requestNumber!==pvFeedRequestNumber)return;const names=new Map((profiles.data||[]).map(p=>[p.id,p]));feed.forEach(p=>{p.profiles=names.get(p.author_id)||null;p.likes=(likes.data||[]).filter(x=>x.post_id===p.id);p.comments=(comments.data||[]).filter(x=>x.post_id===p.id)})}if(hasRenderedFeed){
 // Keep the post objects captured by each like/comment handler in sync.
 const previous=new Map(previousFeed.map(p=>[p.id,p]));
 feed=feed.map(post=>{const existing=previous.get(post.id);if(!existing)return post;Object.assign(existing,post);return existing});
}
if(!status.textContent.startsWith('Cloud posts loaded'))status.textContent='☁ Cloud feed · '+feed.length+' posts';if(!hasRenderedFeed)draw();else pvUpdateRenderedFeedStats();pvRememberFeed();pvNewPostsNotice.hidden=true}finally{document.body.classList.remove('pvFeedLoading')}}
function node(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function pvShowDoubleLikeHeart(target){
 if(!target)return;
 target.classList.add('pvDoubleLikeSurface');
 const existing=target.querySelector('.pvDoubleLikeHeart');
 existing?.remove();
 const heart=node('span','pvDoubleLikeHeart','♥');
 heart.setAttribute('aria-hidden','true');
 target.append(heart);
 setTimeout(()=>heart.remove(),750);
}
function pvBindDoubleTap(element,onDouble,{single=null}={}){
 let last=0,timer=null,wasTouch=false;
 element.addEventListener('click',event=>{
  if(event.target.closest?.('button,a,input,textarea'))return;
  const now=Date.now();
  if(now-last<360){
   clearTimeout(timer);timer=null;last=0;
   event.preventDefault();onDouble();
  }else{
   last=now;
   if(single){clearTimeout(timer);timer=setTimeout(()=>{timer=null;last=0;single()},365)}
  }
 });
 element.addEventListener('dblclick',e=>e.preventDefault());
}
function pvPauseAllReels(){
 document.querySelectorAll('#reelList video').forEach(video=>{
  if(!video.paused)video.pause();
 });
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pvPauseAllReels()});
window.addEventListener('pagehide',pvPauseAllReels,{passive:true});
function draw(){const root=document.getElementById('posts');root.replaceChildren();feed.forEach((p,postIndex)=>{const card=node('article','post'),head=node('div','posthead');card.id='pv-post-'+p.id;card.dataset.authorId=p.author_id;const authorAvatar=node('div','profilepic');const authorName=p.profiles?.display_name||p.profiles?.username||'P';if(p.profiles?.avatar_url){const avatarImg=node('img');avatarImg.src=p.profiles.avatar_url;avatarImg.alt=authorName+' profile photo';avatarImg.loading='lazy';avatarImg.onerror=()=>{authorAvatar.replaceChildren();authorAvatar.textContent=authorName[0].toUpperCase()};authorAvatar.append(avatarImg)}else authorAvatar.textContent=authorName[0].toUpperCase();head.append(authorAvatar);const who=node('div');who.append(pvProfileButton({id:p.author_id,username:p.profiles?.username||'creator'}),node('div','muted',new Date(p.created_at).toLocaleString()));if(p.author_id===pvOfficialId)who.querySelector('.pvPersonButton')?.after(pvOfficialBadge());head.append(who);card.append(head);if(p.caption)card.append(node('div','postbody',p.caption));if(p.image_path){const image=node('img');image.src=db.storage.from('post-images').getPublicUrl(p.image_path).data.publicUrl;image.alt='Post photo';image.loading=postIndex<2?'eager':'lazy';image.decoding='async';if(postIndex===0)image.fetchPriority='high';card.append(image)}const foot=node('div','postfoot');const like=node('button','',((p.likes||[]).some(l=>l.user_id===user.id)?'♥':'♡')+' '+(p.likes||[]).length+' Likes');
like.dataset.pvLikePost=p.id;
function pvPostDoubleLike(){
 if(!user||like.disabled||(p.likes||[]).some(x=>x.user_id===user.id))return;
 like.click();
 pvShowDoubleLikeHeart(card);
}
const postPhoto=card.querySelector('img:not(.profilepic img)');
if(postPhoto)pvBindDoubleTap(postPhoto,pvPostDoubleLike);
else{
 const body=card.querySelector('.postbody');
 if(body)pvBindDoubleTap(body,pvPostDoubleLike);
}
like.onclick=async()=>{
 if(like.disabled||!user)return;
 // Derive the state at click time, never from a stale closure: realtime may
 // have updated likes after this post button was first rendered.
 const currentUser=user.id;
 const previousLikes=[...(p.likes||[])];
 const wasLiked=previousLikes.some(l=>l.user_id===currentUser);
 p.likes=wasLiked?previousLikes.filter(l=>l.user_id!==currentUser):[...previousLikes,{post_id:p.id,user_id:currentUser}];
 like.textContent=(wasLiked?'♡':'♥')+' '+p.likes.length+' Likes';
 like.disabled=true;
 try{
  const result=wasLiked?await db.from('likes').delete().eq('post_id',p.id).eq('user_id',currentUser):await db.from('likes').insert({post_id:p.id,user_id:currentUser});
  if(result.error)throw result.error;
 }catch(e){
  p.likes=previousLikes;
  like.textContent=(wasLiked?'♥':'♡')+' '+p.likes.length+' Likes';
  alert('Could not update Like: '+e.message);
 }finally{like.disabled=false;pvScheduleLikesSync(250)}
};const comments=node('button','', '💬 '+(p.comments||[]).length+' Comments');comments.dataset.pvCommentPost=p.id;
const section=node('div');section.hidden=true;
const commentList=node('div');commentList.dataset.pvCommentList=p.id;
const replyComposer=node('div','pvCommentReplyComposer');replyComposer.hidden=true;replyComposer.dataset.pvReplyComposer=p.id;
const replyLabel=node('small');replyLabel.dataset.pvReplyLabel='1';
const replyInput=node('input');replyInput.placeholder='Write a reply…';replyInput.maxLength=500;
const replyActions=node('div','pvCommentReplyActions'),cancelReply=node('button','','Cancel'),sendReply=node('button','','Post reply');
cancelReply.type=sendReply.type='button';
cancelReply.onclick=()=>{replyComposer.hidden=true;replyInput.value='';replyComposer.dataset.parentId=''};
const submitReply=async()=>{
 const parent_id=replyComposer.dataset.parentId,body=replyInput.value.trim(),account=user;
 if(!account||!parent_id||!body||sendReply.disabled)return;
 sendReply.disabled=true;replyInput.disabled=true;
 try{
  const {data,error}=await db.from('comments').insert({post_id:p.id,user_id:account.id,body,parent_id}).select('id,post_id,user_id,body,parent_id,created_at').single();
  if(error)throw error;
  p.comments=[...(p.comments||[]),data];replyComposer.hidden=true;replyInput.value='';replyComposer.dataset.parentId='';
  pvRenderComments(p);pvScheduleComments(220);
 }catch(e){alert('Could not reply: '+e.message)}
 finally{sendReply.disabled=false;replyInput.disabled=false}
};
sendReply.onclick=submitReply;
replyInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submitReply()}};
replyActions.append(cancelReply,sendReply);replyComposer.append(replyLabel,replyInput,replyActions);
const input=node('input','comment');input.dataset.pvCommentInput=p.id;input.placeholder='Write a comment and press Enter';input.maxLength=500;
input.onkeydown=async e=>{
 if(e.key!=='Enter'||!input.value.trim()||input.disabled)return;
 input.disabled=true;const body=input.value.trim();
 try{
  const {data,error}=await db.from('comments').insert({post_id:p.id,user_id:user.id,body}).select('id,post_id,user_id,body,parent_id,created_at').single();
  if(error)throw error;
  p.comments=[...(p.comments||[]),data];input.value='';pvRenderComments(p);pvScheduleComments(250);
 }catch(err){alert('Could not add comment: '+err.message)}
 finally{input.disabled=false;input.focus()}
};
comments.onclick=()=>{section.hidden=!section.hidden;if(!section.hidden)pvScheduleComments(50)};
section.append(commentList,replyComposer,input);foot.append(like,comments,section);try{window.PVKit?.addPostSave?.(p,foot)}catch(e){console.warn('Post save:',e)}if(p.author_id!==user.id){const report=node('button','pvPostReport','⚑ Report');report.type='button';report.onclick=()=>pvReportTarget('post',p.id);foot.append(report)}if(p.author_id===user.id){const del=node('button','','Delete');del.onclick=async()=>{if(!confirm('Delete your post?'))return;const {error}=await db.from('posts').delete().eq('id',p.id);if(error)alert(error.message);await refresh()};foot.append(del)}card.append(foot);root.append(card);pvRenderComments(p)});if(!feed.length)root.append(node('div','empty','No cloud posts yet. Share the first one!'));if(document.getElementById('stats'))document.getElementById('stats').textContent=feed.filter(p=>p.author_id===user.id).length+' posts · @'+(profile?.username||'creator')}
document.getElementById('publish').onclick=async()=>{if(!user)return;const caption=document.getElementById('caption').value.trim(),file=document.getElementById('photo').files[0];if(!caption&&!file)return alert('Add a caption or photo');if(caption.length>2200)return alert('Caption too long');const btn=document.getElementById('publish');btn.disabled=true;btn.textContent='Posting…';try{let image_path=null;if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Only JPG, PNG or WebP under 5MB allowed');image_path=user.id+'/'+crypto.randomUUID()+'.'+({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type]);const {error}=await db.storage.from('post-images').upload(image_path,file,{contentType:file.type});if(error)throw error}const {error}=await db.from('posts').insert({author_id:user.id,caption,image_path});if(error)throw error;document.getElementById('caption').value='';document.dispatchEvent(new Event('pv:post-published'));document.getElementById('photo').value='';document.getElementById('filename').textContent='';await refresh();await loadOwnPosts();if(status.textContent.startsWith('Cloud feed error'))alert('Post saved, but feed could not load: '+status.textContent)}catch(e){alert(e.message)}finally{btn.disabled=false;btn.textContent='Publish'}};

/* Profile editor + creator discovery, using existing profiles/follows tables */
const extraStyle=document.createElement('style');
extraStyle.textContent=`#profileEditor input,#profileEditor textarea{display:block;width:100%;margin:9px 0;padding:11px;background:#10111f;border:1px solid #41405b;color:#fff;border-radius:10px}#profileEditor textarea{min-height:75px;resize:vertical}.creator{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px;border-bottom:1px solid #363449}.creator button{white-space:nowrap}.creator strong{overflow-wrap:anywhere}.profileAvatar{width:70px;height:70px;border-radius:50%;object-fit:cover}#profileEditor label{display:block;font-size:13px;color:#c6c0d8;margin-top:10px}`;
document.head.append(extraStyle);
const editor=document.createElement('section');editor.id='profileEditor';editor.className='panel';editor.style.marginTop='14px';
editor.innerHTML='<h3>Edit profile</h3><form id="editProfileForm"><label>Username<input id="editUsername" maxlength="24" minlength="3" pattern="[A-Za-z0-9_]{3,24}" required></label><label>Display name<input id="editName" maxlength="60"></label><label>Bio<textarea id="editBio" maxlength="160"></textarea></label><label>Profile photo (JPG, PNG, WebP under 5MB)<input id="editAvatar" type="file" accept="image/jpeg,image/png,image/webp"></label><button class="primary" type="submit">Save profile</button><p id="editFeedback" class="hint" role="status"></p></form>';
document.getElementById('profile').append(editor);

/* Owner-controlled privacy and follow-request inbox (requires account-privacy.sql). */
const pvPrivacyCss=document.createElement('style');
pvPrivacyCss.textContent=`
#pvPrivacySettings{margin:15px 0;padding:17px;border:1px solid #3e3150;border-radius:14px;background:#171421}
#pvPrivacySettings h3{margin:0 0 7px;font-size:16px}
#pvPrivacySettings p{margin:6px 0 13px;color:#bcb3cc;font-size:12px;line-height:1.5}
#pvPrivacySettings .pvPrivacyOptions{display:flex;gap:9px;flex-wrap:wrap}
#pvPrivacySettings .pvPrivacyOptions button{border:1px solid #51405e;border-radius:10px;padding:11px 15px;background:#272135;color:#e4d7f4;cursor:pointer;font-weight:800}
#pvPrivacySettings .pvPrivacyOptions button.active{background:#6c41b2;border-color:#b999ef;color:white}
#pvPrivacyStatus{font-size:12px;color:#c8b7e8;margin-top:10px}
#pvRequestsBox{margin:13px 0;border-top:1px solid #373044;padding-top:13px}
.pvRequestRow{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid #30283a}
.pvRequestRow button{border:0;border-radius:7px;padding:8px 10px;background:#6440a3;color:white;font-size:12px;font-weight:700}
.pvRequestRow button.decline{background:#373040}
.pvRequestName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-weight:700;font-size:13px}
.pvPrivateLock{margin:20px 0;border:1px solid #423752;border-radius:15px;padding:34px 16px;text-align:center;color:#d4cbdb;background:#181422}
.pvPrivateLock strong{font-size:17px;color:white;display:block;margin:8px 0}
.pvProfilePrivacyTag{display:inline-block;margin:7px 0;color:#d6b2ff;font-size:12px;font-weight:750}
`;
document.head.append(pvPrivacyCss);
const pvPrivacyBox=node('section');pvPrivacyBox.id='pvPrivacySettings';
pvPrivacyBox.innerHTML='<h3>Account privacy</h3><p>Choose who can see your posts and reels inside PAVORA. Private accounts approve followers before they can view content. Note: media uploaded to the old public storage buckets may still be accessible through a previously shared direct URL.</p><div class="pvPrivacyOptions"><button type="button" id="pvSetPublic">🌐 Public</button><button type="button" id="pvSetPrivate">🔒 Private</button></div><div id="pvPrivacyStatus" role="status"></div><div id="pvRequestsBox" hidden><h3>Follow requests <span id="pvRequestsCount"></span></h3><div id="pvRequestsList"></div></div>';
document.getElementById('profile').append(pvPrivacyBox);

/* Dedicated settings experience, inspired by familiar social-app navigation. */
const pvSettingsCSS=document.createElement('style');
pvSettingsCSS.textContent=`
#pvSettingsScreen{position:fixed;inset:0;z-index:90;display:grid;grid-template-columns:270px minmax(0,1fr);background:#0b0c10;color:#f7f6fc;overflow:hidden}
#pvSettingsScreen[hidden]{display:none!important}
.pvSettingsSidebar{border-right:1px solid #292831;background:#101015;padding:27px 15px;overflow:auto}
.pvSettingsSidebar h2{font-size:23px;margin:13px 12px 26px}
.pvSettingsBack{background:transparent;border:0;color:#ddd2ef;font-weight:750;padding:12px;cursor:pointer}
.pvSettingsSectionLabel{font-size:11px;font-weight:800;color:#918b9f;margin:24px 13px 9px}
.pvSettingsNav{width:100%;display:flex;align-items:center;gap:13px;padding:15px 13px;border:0;border-radius:11px;background:transparent;color:#e8e4f0;text-align:left;font-size:14px;font-weight:650;cursor:pointer}
.pvSettingsNav:hover,.pvSettingsNav.active{background:#272331}
.pvSettingsNav .pvSettingsIcon{width:23px;font-size:20px;text-align:center}
.pvSettingsMain{overflow:auto;padding:42px clamp(18px,5vw,80px) 75px}
.pvSettingsPage{width:min(620px,100%);margin:0 auto}
.pvSettingsPage h2{font-size:24px;margin:0 0 25px}
.pvSettingsAccount{padding:20px;background:#19171f;border:1px solid #34303c;border-radius:15px;margin-bottom:25px;display:flex;align-items:center;gap:12px}
.pvSettingsAccount .pvSettingsAccountAvatar{width:49px;height:49px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#804eeb,#e061af);overflow:hidden;font-weight:900}
.pvSettingsAccountAvatar img{width:100%;height:100%;object-fit:cover}
.pvSettingsAccount strong{display:block;font-size:14px}
.pvSettingsAccount small{font-size:12px;color:#a9a2b4}
#pvSettingsScreen #pvPrivacySettings{margin:0;background:#16141c;border-color:#35303c;padding:24px}
#pvSettingsScreen #pvPrivacySettings h3{font-size:19px}
#pvSettingsScreen #pvPrivacySettings .pvPrivacyOptions{margin-top:20px}
#pvSettingsScreen #pvPrivacySettings .pvPrivacyOptions button{flex:1;min-height:54px}
.pvSettingsInfo{margin:18px 0;color:#aaa2b8;font-size:13px;line-height:1.7}
.pvSettingsHint{padding:15px;background:#211b2b;border:1px solid #473852;border-radius:12px;color:#d4c4e9;font-size:12px;line-height:1.6}
.pvSettingsOpenProfile{padding:12px 19px;border:0;background:#7048bc;color:white;border-radius:10px;font-weight:750;cursor:pointer}
@media(max-width:680px){#pvSettingsScreen{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.pvSettingsSidebar{border-right:0;border-bottom:1px solid #2a2632;padding:8px 11px}.pvSettingsSidebar h2{font-size:18px;margin:5px 10px 9px}.pvSettingsSectionLabel{display:none}.pvSettingsLinks{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}.pvSettingsNav{width:auto;flex:none;padding:10px;font-size:12px}.pvSettingsNav .pvSettingsIcon{font-size:16px;width:17px}.pvSettingsBack{padding:7px 9px}.pvSettingsMain{padding:23px 14px 90px}.pvSettingsPage h2{font-size:20px}.pvSettingsAccount{padding:12px}#pvSettingsScreen #pvPrivacySettings{padding:15px}}
`;
document.head.append(pvSettingsCSS);const pvSettingsEnhanceCSS=document.createElement('style');pvSettingsEnhanceCSS.textContent="\n#pvSettingsScreen{grid-template-columns:295px minmax(0,1fr);background:#0c0d11}\n.pvSettingsSidebar{background:#111217;border-color:#292b32;scrollbar-width:thin}\n.pvSettingsSidebar h2{letter-spacing:-.5px;margin-bottom:16px}\n.pvSettingsSearch{width:calc(100% - 20px);margin:0 10px 10px;padding:11px 13px;background:#23242b;color:white;border:1px solid #34353e;border-radius:11px;outline:none;font:inherit;font-size:13px}\n.pvSettingsSearch:focus{border-color:#9465dc}\n.pvSettingsSectionLabel{margin:22px 13px 10px;color:#aaa8b4;text-transform:none;font-size:11px}\n.pvSettingsNav{padding:12px 13px;gap:11px;font-size:13.5px;transition:background .14s}\n.pvSettingsNav.active{background:#292535}.pvSettingsNav:hover{background:#282630}\n.pvSettingsMain{background:#0d0e12}.pvSettingsPage{width:min(720px,100%)}.pvSettingsPage h2{font-size:25px}\n.pvSettingsCard{padding:21px;background:#18191f;border:1px solid #31313b;border-radius:14px;margin:15px 0 20px}\n.pvSettingsCard h3{font-size:16px;margin:0 0 10px}\n.pvSettingsCard>p{font-size:13px;line-height:1.65;color:#b0aebc;margin:0 0 13px}\n.pvSettingsRow{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:17px 0;border-top:1px solid #30303b}\n.pvSettingsRow strong{display:block;color:#f3f1f7;font-size:14px;margin-bottom:5px}\n.pvSettingsRow small{display:block;color:#a9a6b6;font-size:12px;line-height:1.6}\n.pvSettingsAction{border:1px solid #585069;border-radius:10px;padding:10px 14px;background:#332842;color:#f3e6ff;font-weight:750;white-space:nowrap;cursor:pointer}\n.pvSettingsAction:hover{background:#503a68}\n.pvSettingsSwitch{width:46px;height:27px;border:0;border-radius:30px;background:#4d4e57;position:relative;flex:none;cursor:pointer}\n.pvSettingsSwitch::after{content:'';position:absolute;top:4px;left:4px;width:19px;height:19px;background:white;border-radius:50%;transition:transform .2s}\n.pvSettingsSwitch.on{background:#8752e6}.pvSettingsSwitch.on::after{transform:translateX(19px)}\n#pvSettingsScreen #pvPrivacySettings{background:transparent;border:0;padding:0;margin:0}\n#pvSettingsScreen #pvPrivacySettings h3{display:none}\n#pvSettingsScreen #pvPrivacySettings>p{font-size:12px;color:#b4adbb;line-height:1.65}\n#pvSettingsScreen #pvPrivacySettings .pvPrivacyOptions{display:flex;flex-direction:column;gap:0;background:#202027;border:1px solid #383441;border-radius:12px;padding:0 15px;margin:15px 0}\n#pvSettingsScreen #pvPrivacySettings .pvPrivacyOptions button{background:transparent!important;text-align:left;border:0!important;border-radius:0;min-height:57px;color:#f4f0fa}\n#pvSettingsScreen #pvPrivacySettings .pvPrivacyOptions button:first-child{border-bottom:1px solid #35333f!important}\n#pvSettingsScreen #pvPrivacySettings .pvPrivacyOptions button.active{color:#cdb5ff}\n#pvSettingsScreen #pvPrivacySettings .pvPrivacyOptions button.active::after{content:'✓';float:right;color:#b69bff}\n#pvSettingsScreen #pvRequestsBox{background:#202027;border:1px solid #383441;padding:15px;border-radius:12px}\n#pvSettingsScreen #pvRequestsBox h3{display:block}\n.pvSettingsSearchEmpty{font-size:12px;color:#aaa;padding:10px}\n@media(max-width:680px){#pvSettingsScreen{grid-template-columns:1fr}.pvSettingsSidebar{padding:9px 12px}.pvSettingsSidebar h2{font-size:18px;margin:5px 10px}.pvSettingsSearch{margin:6px 9px;width:calc(100% - 18px)}.pvSettingsLinks{max-height:90px;overflow-x:auto;gap:6px}.pvSettingsNav{font-size:12px}.pvSettingsSectionLabel{display:none}.pvSettingsMain{padding:22px 15px}.pvSettingsPage h2{font-size:22px}}\n";document.head.append(pvSettingsEnhanceCSS);
const pvSettingsScreen=node('section');pvSettingsScreen.id='pvSettingsScreen';pvSettingsScreen.hidden=true;
pvSettingsScreen.setAttribute('aria-label','PAVORA settings');
const pvSettingsSidebar=node('nav','pvSettingsSidebar');
const pvSettingsBack=node('button','pvSettingsBack','← Back to PAVORA');pvSettingsBack.type='button';
const pvSettingsHeading=node('h2','','Settings and activity');
pvSettingsSidebar.append(pvSettingsBack,pvSettingsHeading);
const pvSettingsSearch=node('input','pvSettingsSearch');
pvSettingsSearch.type='search';pvSettingsSearch.placeholder='Search settings';pvSettingsSearch.setAttribute('aria-label','Search settings');
pvSettingsSidebar.append(pvSettingsSearch);
const pvSettingsLinks=node('div','pvSettingsLinks');pvSettingsSidebar.append(pvSettingsLinks);
const pvSettingsMain=node('div','pvSettingsMain');
const pvSettingsPage=node('div','pvSettingsPage');pvSettingsMain.append(pvSettingsPage);
pvSettingsScreen.append(pvSettingsSidebar,pvSettingsMain);document.body.append(pvSettingsScreen);

const pvBlockStyle=document.createElement('style');
pvBlockStyle.textContent=".pvBlockAction{background:#372334!important;color:#ffa0b6!important;border:1px solid #704b66!important;border-radius:10px;padding:10px 15px;cursor:pointer}.pvBlockedNotice{border:1px solid #67435e;border-radius:14px;padding:20px;background:#251b29;text-align:center;margin:20px 0}.pvBlockedNotice strong{display:block;font-size:17px;margin-bottom:8px}.pvBlockedNotice p{color:#bfb2c7;font-size:13px;line-height:1.5}.pvBlockRow{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #373040}.pvBlockAvatar{width:42px;height:42px;flex:none;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:linear-gradient(135deg,#784bd3,#d56398)}.pvBlockAvatar img{width:100%;height:100%;object-fit:cover}.pvBlockIdentity{flex:1;min-width:0}.pvBlockIdentity strong,.pvBlockIdentity small{display:block}.pvBlockIdentity small{font-size:12px;color:#b7aaca}";document.head.append(pvBlockStyle);
async function pvAmBlocking(id){
 const {data,error}=await db.from('account_blocks').select('blocked_id').eq('blocker_id',user.id).eq('blocked_id',id).maybeSingle();
 if(error)throw error;return !!data;
}
async function pvBlockAccount(id,name){
 if(!user||!id||id===user.id)return;
 if(!confirm('Block @'+(name||'this user')+'? They cannot follow, message, or view your profile and content. Existing follows will be removed.'))return;
 const {error}=await db.from('account_blocks').insert({blocker_id:user.id,blocked_id:id});
 if(error){alert('Block failed: '+error.message);return}
 await Promise.allSettled([refresh(),updateSocialProfile()]);
 await openCreator(id);
}
async function pvUnblockAccount(id,name){
 if(!user||!id)return;
 if(!confirm('Unblock @'+(name||'this user')+'? They can interact with your public account again. Previous follows will not be restored.'))return;
 const {error}=await db.from('account_blocks').delete().eq('blocker_id',user.id).eq('blocked_id',id);
 if(error){alert('Unblock failed: '+error.message);return}
 if(!pvSettingsScreen.hidden&&pvSettingsActive==='blocked')pvShowSettingsPage('blocked');
 else await openCreator(id);
 await Promise.allSettled([refresh(),updateSocialProfile()]);
}
async function pvLoadBlockedAccounts(box){
 const area=node('div','');area.append(node('p','muted','Loading…'));box.append(area);
 const {data,error}=await db.from('account_blocks').select('blocked_id').eq('blocker_id',user.id).order('created_at',{ascending:false}).limit(200);
 if(!area.isConnected||pvSettingsActive!=='blocked')return;
 area.replaceChildren();
 if(error){area.append(node('p','muted',error.message));return}
 if(!data?.length){area.append(node('p','muted','No blocked accounts.'));return}
 const ids=data.map(x=>x.blocked_id);
 const result=await db.from('profiles').select('id,username,display_name,avatar_url').in('id',ids);
 if(!area.isConnected||pvSettingsActive!=='blocked')return;
 const names=new Map((result.data||[]).map(x=>[x.id,x]));
 for(const item of data){
  const person=names.get(item.blocked_id)||{},handle=person.username||'PAVORA user';
  const row=node('div','pvBlockRow'),avatar=node('div','pvBlockAvatar');
  if(person.avatar_url){const img=node('img');img.alt='';img.src=person.avatar_url;avatar.append(img)}
  else avatar.textContent=handle[0].toUpperCase();
  const details=node('div','pvBlockIdentity');
  details.append(node('strong','',person.display_name||handle),node('small','','@'+handle));
  const button=node('button','pvSettingsAction','Unblock');
  button.onclick=()=>pvUnblockAccount(item.blocked_id,handle);
  row.append(avatar,details,button);area.append(row);
 }
}


const pvReportStyles=document.createElement('style');
pvReportStyles.textContent="#pvReportSheet{position:fixed;inset:0;z-index:200;background:#000c;display:flex;align-items:center;justify-content:center;padding:16px}#pvReportSheet[hidden]{display:none!important}.pvReportCard{width:min(460px,100%);max-height:90dvh;overflow:auto;border-radius:18px;background:#222129;border:1px solid #56425c;box-shadow:0 25px 70px #000b;padding:22px;display:grid;gap:13px}.pvReportCard h3{margin:0;font-size:19px}.pvReportCard p{margin:0;font-size:12px;color:#b7aabe;line-height:1.5}.pvReportCard label{font-size:13px;color:#ddd2e8;display:grid;gap:7px}.pvReportCard select,.pvReportCard textarea{box-sizing:border-box;width:100%;background:#302b38;color:#fff;border:1px solid #63536c;border-radius:10px;padding:12px;font:inherit}.pvReportButtons{display:flex;gap:8px;justify-content:flex-end}.pvReportButtons button{border-radius:10px;background:#49345f;color:#fff;padding:11px 17px;border:0;cursor:pointer}.pvReportButtons button:last-child{background:#8952cb}.pvReportError{font-size:12px;color:#ffadbb}";
document.head.append(pvReportStyles);
const pvReportSheet=node('div');pvReportSheet.id='pvReportSheet';pvReportSheet.hidden=true;
document.body.append(pvReportSheet);
function pvOpenActionMenu(options){
 const sheet=node('div');sheet.className='pvActionSheet';sheet.style.cssText='position:fixed;inset:0;z-index:195;background:#000c;display:grid;place-items:center;padding:16px';
 const card=node('div');card.style.cssText='width:min(420px,100%);border:1px solid #51405e;border-radius:17px;background:#25212d;overflow:hidden;box-shadow:0 22px 70px #000a';
 for(const opt of options){
  const button=node('button','',opt.title);button.type='button';
  button.style.cssText='display:block;width:100%;padding:17px;border:0;border-bottom:1px solid #443649;background:transparent;color:'+(opt.danger?'#ff9eb3':'#fff')+';cursor:pointer;font:inherit;font-weight:700';
  button.onclick=()=>{sheet.remove();if(opt.onClick)opt.onClick()};card.append(button);
 }
 const cancel=node('button','','Cancel');cancel.style.cssText='display:block;width:100%;padding:17px;border:0;background:#32283c;color:#fff;cursor:pointer;font-weight:700';cancel.onclick=()=>sheet.remove();
 card.append(cancel);sheet.append(card);sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.remove()});document.body.append(sheet);
}
function pvReportTarget(target_kind,target_id){
 if(!user||!target_id)return;
 pvReportSheet.replaceChildren();
 const card=node('form','pvReportCard'),heading=node('h3','','Report '+target_kind),desc=node('p','','Tell us why you are reporting this content. Reports go to PAVORA moderation review; submitting does not automatically delete it.');
 const reasonLabel=node('label','','Reason'),reason=node('select');
 for(const [value,text] of [['spam','Spam or scam'],['harassment','Bullying or harassment'],['hate','Hate or abuse'],['violence','Violence or threats'],['nudity','Nudity or sexual content'],['impersonation','Impersonation'],['other','Something else']]){
  const option=node('option','',text);option.value=value;reason.append(option)
 }
 reasonLabel.append(reason);
 const detailsLabel=node('label','','Additional details (optional)'),details=node('textarea');
 details.maxLength=1000;details.rows=3;details.placeholder='Describe the issue…';detailsLabel.append(details);
 const error=node('p','pvReportError',''),buttons=node('div','pvReportButtons'),cancel=node('button','','Cancel'),submit=node('button','','Submit report');
 cancel.type='button';submit.type='submit';cancel.onclick=()=>{pvReportSheet.hidden=true;pvReportSheet.replaceChildren()};
 buttons.append(cancel,submit);card.append(heading,desc,reasonLabel,detailsLabel,error,buttons);
 pvReportSheet.append(card);pvReportSheet.hidden=false;
 card.onsubmit=async e=>{
  e.preventDefault();submit.disabled=true;error.textContent='Submitting…';
  const {error:failure}=await db.from('content_reports').insert({reporter_id:user.id,target_kind,target_id,reason:reason.value,details:details.value.trim()});
  if(failure){error.textContent='Could not submit: '+failure.message;submit.disabled=false;return}
  pvReportSheet.hidden=true;pvReportSheet.replaceChildren();alert('Report submitted for moderation review. Thank you.');
 };
}
pvReportSheet.addEventListener('click',e=>{if(e.target===pvReportSheet){pvReportSheet.hidden=true;pvReportSheet.replaceChildren()}});
window.PAVORAReport=pvReportTarget;

const pvSettingsItems=[
 {key:'overview',icon:'◎',title:'Accounts Center',category:'Your account'},
 {key:'edit',icon:'♙',title:'Edit profile',category:'How you use PAVORA'},
 {key:'notifications',icon:'♧',title:'Notifications',category:'How you use PAVORA'},
 {key:'privacy',icon:'◈',title:'Account privacy',category:'Who can see your content'},
 {key:'requests',icon:'✉',title:'Follow requests',category:'Who can see your content'},
 {key:'blocked',icon:'⊘',title:'Blocked accounts',category:'Who can see your content'},
 {key:'closefriends',icon:'★',title:'Close Friends',category:'Who can see your content'},
 {key:'interactions',icon:'♡',title:'Interactions',category:'How others can interact with you'},
 {key:'accessibility',icon:'◐',title:'Accessibility',category:'Your app and media'},
 {key:'language',icon:'文',title:'Language',category:'Your app and media'},
 {key:'help',icon:'?',title:'Help',category:'More info and support'},
 {key:'about',icon:'ⓘ',title:'About PAVORA',category:'More info and support'}
];
let pvSettingsActive='privacy';
function pvCloseSettings(){
 pvSettingsScreen.hidden=true;
 const profilePage=document.getElementById('profile');
 profilePage.append(pvPrivacyBox);
 pvPrivacyBox.hidden=true;
 if(user&&profile)pvUpdatePrivacyControl();
}
function pvOpenSettings(page='overview'){
 if(!user)return;
 document.body.classList.remove('pvDrawerOpen');
 pvSettingsScreen.hidden=false;
 pvShowSettingsPage(page);
}
function pvShowSettingsPage(page){
 pvSettingsActive=page;
 pvSettingsLinks.replaceChildren();
 const query=pvSettingsSearch.value.trim().toLowerCase();
 let category='',total=0;
 for(const item of pvSettingsItems){
  if(query&&!(item.title+' '+item.category).toLowerCase().includes(query))continue;
  if(category!==item.category){category=item.category;pvSettingsLinks.append(node('div','pvSettingsSectionLabel',category))}
  const btn=node('button','pvSettingsNav'+(page===item.key?' active':''));btn.type='button';
  btn.setAttribute('aria-current',page===item.key?'page':'false');
  btn.append(node('span','pvSettingsIcon',item.icon),node('span','',item.title));
  btn.onclick=()=>pvShowSettingsPage(item.key);pvSettingsLinks.append(btn);total++;
 }
 if(!total)pvSettingsLinks.append(node('p','pvSettingsSearchEmpty','No matching settings.'));
 pvSettingsPage.replaceChildren();
 pvSettingsPage.append(node('h2','',pvSettingsItems.find(i=>i.key===page)?.title||'Settings'));
 const card=(heading,detail)=>{
  const box=node('section','pvSettingsCard');if(heading)box.append(node('h3','',heading));
  if(detail)box.append(node('p','',detail));pvSettingsPage.append(box);return box;
 };
 const action=(caption,callback)=>{const btn=node('button','pvSettingsAction',caption);btn.type='button';btn.onclick=callback;return btn};
 const row=(box,heading,detail,control)=>{
  const line=node('div','pvSettingsRow'),left=node('div');
  left.append(node('strong','',heading),node('small','',detail));line.append(left);
  if(control)line.append(control);box.append(line);
 };
 if(page==='privacy'){
  const box=card('Your account visibility','Choose who can view your posts and reels inside PAVORA.');
  box.append(pvPrivacyBox);pvPrivacyBox.hidden=false;
  pvUpdatePrivacyControl();
  document.getElementById('pvRequestsBox').hidden=true;
  pvSettingsPage.append(node('div','pvSettingsHint','Private accounts require your approval before new followers can see your posts. Previously shared direct links to media in old public storage may still work.'));
 }else if(page==='requests'){
  const box=card('Pending follow requests','Approve or decline people who request access to your private profile.');
  box.append(pvPrivacyBox);pvPrivacyBox.hidden=false;
  pvUpdatePrivacyControl();pvLoadFollowRequests();
 }else if(page==='closefriends'){
  const box=card('Close Friends','Choose who can see Stories shared with Close Friends.');
  box.append(action('Manage Close Friends',()=>{pvCloseSettings();window.PVKit?.openCloseFriends?.()}));
 }else if(page==='blocked'){
  const box=card('Blocked accounts','People you block cannot follow, message or view your content. You can unblock anytime.');
  pvLoadBlockedAccounts(box);
 }else if(page==='edit'){
  const box=card('Profile details','Change your username, profile picture, display name and bio.');
  row(box,'Edit your profile','These details are visible to people viewing your profile.',action('Edit profile',()=>{pvCloseSettings();pvNavigate('profile');editor.hidden=false;editor.scrollIntoView({behavior:'smooth',block:'start'})}));
 }else if(page==='notifications'){
  const box=card('Notifications','Manage your device notifications and open recent activity.');
  const state=typeof Notification==='undefined'?'Not supported':Notification.permission==='granted'?'Allowed':Notification.permission==='denied'?'Blocked in browser':'Permission not requested';
  row(box,'Browser notifications',state,action('Check permission',async()=>{if(!('Notification' in window))return alert('Your browser does not support notifications.');if(Notification.permission==='default')await Notification.requestPermission();pvShowSettingsPage('notifications')}));
  row(box,'Notifications inbox','See follows, likes and other activity.',action('View',()=>{pvCloseSettings();const link=document.querySelector('[data-view="notifications"]');if(link)link.click();else alert('Open Notifications from the PAVORA sidebar.')}));
 }else if(page==='interactions'){
  const box=card('Interactions','Manage account visibility and incoming followers.');
  row(box,'Account privacy','Choose a public or private account.',action('Manage',()=>pvShowSettingsPage('privacy')));
  row(box,'Follow requests','Review requests from other people.',action('Open',()=>pvShowSettingsPage('requests')));
  row(box,'Blocked accounts','Manage people you blocked.',action('Manage',()=>pvShowSettingsPage('blocked')));
  row(box,'Close Friends','Choose who can see your selected Stories.',action('Manage',()=>pvShowSettingsPage('closefriends')));
 }else if(page==='accessibility'){
  const box=card('Accessibility','Make the app easier and more comfortable to use.');
  const enabled=localStorage.getItem('pvReduceMotion')==='true';
  const toggle=node('button','pvSettingsSwitch'+(enabled?' on':''));toggle.type='button';toggle.setAttribute('role','switch');toggle.setAttribute('aria-checked',String(enabled));toggle.setAttribute('aria-label','Reduce animations');
  toggle.onclick=()=>{const value=localStorage.getItem('pvReduceMotion')!=='true';localStorage.setItem('pvReduceMotion',String(value));document.documentElement.classList.toggle('pvReduceMotion',value);pvShowSettingsPage('accessibility')};
  row(box,'Reduce animations','Minimize transitions and moving elements on this device.',toggle);
 }else if(page==='language'){
  const box=card('Language','PAVORA currently displays its settings in English.');
  row(box,'English','Full Hindi translation is not available yet.',null);
 }else if(page==='help'){
  const box=card('Account help','Quick answers to common questions.');
  row(box,'Make account private','Go to Account privacy, then choose Private.',action('Privacy',()=>pvShowSettingsPage('privacy')));
  row(box,'Approve followers','Open Follow requests to accept or decline.',action('Requests',()=>pvShowSettingsPage('requests')));
  row(box,'Forgot password','Use Forgot password on the email sign-in page.',null);
 }else if(page==='about'){
  const box=card('PAVORA','Share posts, reels, messages and connections.');
  row(box,'Account protection','Never share passwords or verification codes.',null);
  row(box,'Privacy control','Switch between a public and private account.',action('Open',()=>pvShowSettingsPage('privacy')));
 }else{
  const summary=node('div','pvSettingsAccount'),avatar=node('div','pvSettingsAccountAvatar');
  if(profile?.avatar_url){const img=node('img');img.src=profile.avatar_url;img.alt='';avatar.append(img)}
  else avatar.textContent=(profile?.username||'P')[0].toUpperCase();
  const info=node('div');info.append(node('strong','',profile?.display_name||profile?.username||'Your account'),node('small','','@'+(profile?.username||'creator')));
  summary.append(avatar,info);pvSettingsPage.append(summary);
  const box=card('Account details','Manage your PAVORA account and privacy.');
  row(box,'Signed in as',user?.email||user?.phone||'Signed in',null);
  row(box,'Account visibility',profile?.is_private?'Private account':'Public account',action('Change',()=>pvShowSettingsPage('privacy')));
  row(box,'Profile','Change your public details.',action('Edit',()=>pvShowSettingsPage('edit')));
  const more=card('Quick access','Frequently used settings.');
  row(more,'Follow requests','Requests from people who want to follow you.',action('Open',()=>pvShowSettingsPage('requests')));
  row(more,'Notifications','Manage browser notification permissions.',action('Open',()=>pvShowSettingsPage('notifications')));
  row(more,'Blocked accounts','Review and unblock users.',action('Manage',()=>pvShowSettingsPage('blocked')));
  row(more,'Close Friends','Share private Stories with selected accounts.',action('Manage',()=>pvShowSettingsPage('closefriends')));
 }
}
pvSettingsSearch.addEventListener('input',()=>pvShowSettingsPage(pvSettingsActive));
const pvReduceMotionCSS=document.createElement('style');
pvReduceMotionCSS.textContent='.pvReduceMotion *, .pvReduceMotion *::before, .pvReduceMotion *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}';
document.head.append(pvReduceMotionCSS);
document.documentElement.classList.toggle('pvReduceMotion',localStorage.getItem('pvReduceMotion')==='true');

pvSettingsBack.onclick=pvCloseSettings;
document.getElementById('signout')?.addEventListener('click',pvCloseSettings);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pvSettingsScreen.hidden)pvCloseSettings()});
const pvSettingsDrawerButton=node('button','nav','⚙ Settings');pvSettingsDrawerButton.type='button';
pvSettingsDrawerButton.id='pvOpenSettings';pvSettingsDrawerButton.onclick=()=>pvOpenSettings('overview');
document.querySelector('aside.left').append(pvSettingsDrawerButton);
// Settings now lives in the slide-out More menu only; no duplicate profile button.
pvPrivacyBox.hidden=true;

let pvPrivacyBusy=false;
function pvUpdatePrivacyControl(){
 const ready=profile&&typeof profile.is_private==='boolean';
 const privateMode=ready&&profile.is_private;
 document.getElementById('pvSetPublic').classList.toggle('active',ready&&!privateMode);
 document.getElementById('pvSetPrivate').classList.toggle('active',ready&&privateMode);
 document.getElementById('pvSetPublic').disabled=!ready||pvPrivacyBusy;
 document.getElementById('pvSetPrivate').disabled=!ready||pvPrivacyBusy;
 document.getElementById('pvPrivacyStatus').textContent=!ready?'Privacy setup required: run supabase/account-privacy.sql.':privateMode?'🔒 Private — new followers need your approval.':'🌐 Public — everyone can view your content.';
 document.getElementById('pvRequestsBox').hidden=!privateMode||(!pvSettingsScreen.hidden&&pvSettingsActive!=='requests');
}
async function pvSetPrivacy(value){
 if(!user||pvPrivacyBusy||typeof profile?.is_private!=='boolean')return;
 if(profile.is_private===value)return;
 pvPrivacyBusy=true;pvUpdatePrivacyControl();
 const {data,error}=await db.from('profiles').update({is_private:value}).eq('id',user.id).select().single();
 pvPrivacyBusy=false;
 if(error){alert('Could not change account privacy: '+error.message);pvUpdatePrivacyControl();return}
 profile=data;pvUpdatePrivacyControl();await pvLoadFollowRequests();
}
document.getElementById('pvSetPublic').onclick=()=>pvSetPrivacy(false);
document.getElementById('pvSetPrivate').onclick=()=>pvSetPrivacy(true);
async function pvLoadFollowRequests(){
 if(!user||!profile?.is_private){document.getElementById('pvRequestsBox').hidden=true;return}
 const box=document.getElementById('pvRequestsBox'),list=document.getElementById('pvRequestsList');
 box.hidden=false;list.replaceChildren(node('p','muted','Loading requests…'));
 const {data:requests,error}=await db.from('follow_requests').select('follower_id,created_at').eq('following_id',user.id).order('created_at',{ascending:false}).limit(50);
 if(error){list.replaceChildren(node('p','muted','Run supabase/account-privacy.sql to enable follow requests.'));return}
 const ids=(requests||[]).map(x=>x.follower_id);
 const profiles=ids.length?await db.from('profiles').select('id,username,display_name').in('id',ids):{data:[]};
 const people=new Map((profiles.data||[]).map(p=>[p.id,p]));
 document.getElementById('pvRequestsCount').textContent=ids.length?'('+ids.length+(ids.length===50?'+':'')+')':'';
 list.replaceChildren();
 if(!ids.length){list.append(node('p','muted','No pending requests.'));return}
 for(const request of requests){
  const person=people.get(request.follower_id);
  const row=node('div','pvRequestRow'),name=node('span','pvRequestName','@'+(person?.username||'creator'));
  const accept=node('button','','Accept'),decline=node('button','decline','Decline');
  accept.onclick=async()=>{
   accept.disabled=decline.disabled=true;
   const {error}=await db.rpc('pv_accept_follow_request',{requester:request.follower_id});
   if(error)alert(error.message);
   await pvLoadFollowRequests();await updateSocialProfile();
  };
  decline.onclick=async()=>{
   accept.disabled=decline.disabled=true;
   const {error}=await db.from('follow_requests').delete().eq('following_id',user.id).eq('follower_id',request.follower_id);
   if(error)alert(error.message);
   await pvLoadFollowRequests();
  };
  row.append(name,accept,decline);list.append(row);
 }
}

const explore=document.getElementById('explore');explore.replaceChildren();
const pvExploreSearchWrap=node('div','pvExploreSearchWrap'),pvExploreSearch=node('input','pvExploreSearch'),pvExploreGrid=node('div','pvExploreGrid'),pvExploreResults=node('div','pvExploreResults hide');
pvExploreSearch.type='search';pvExploreSearch.placeholder='Search creators, posts and reels';pvExploreSearch.setAttribute('aria-label','Search PAVORA');pvExploreSearch.autocomplete='off';pvExploreSearchWrap.append(node('span','pvExploreMagnify','⌕'),pvExploreSearch);explore.append(pvExploreSearchWrap,pvExploreResults,pvExploreGrid);
const discover=document.createElement('div');discover.id='creatorDirectory';discover.className='panel';discover.style.display='none';explore.append(discover);

/* PAVORA Virtual Creator discovery: editorial demo profiles, not Auth users.
   They never write follows/likes or impersonate real people; their detail view
   displays a subtle Virtual label and original sample content. */
const pvVirtualNames=['Arohi','Vihaan','Meera','Kabir','Tara','Ritvik','Naina','Ishaan','Zoya','Ayaan','Siya','Dev','Anika','Reyansh','Kavya','Arjun','Riya','Neil','Myra','Advik'];
const pvVirtualThemes=[
 {key:'frames',label:'Visual Stories',bio:'Frames, color and everyday creative experiments.',posts:['A little color can change the whole story.','Three compositions to try on your next creative day.','Finding beautiful details in ordinary places.']},
 {key:'tech',label:'Tech Notes',bio:'Simple digital ideas, design systems and useful tools.',posts:['A cleaner workspace starts with one useful shortcut.','Tiny product details make everyday tools feel better.','Exploring a fresh idea for a simple mobile experience.']},
 {key:'travel',label:'City Trails',bio:'Imaginary city trails, places and creative travel notes.',posts:['A new route is sometimes all you need for inspiration.','Collecting little moments from a quiet city morning.','A travel moodboard for the weekend.']},
 {key:'style',label:'Style Journal',bio:'Outfit palettes, textures and personal-style inspiration.',posts:['This week is all about soft colors and bold details.','Building a look with just three favorite pieces.','A moodboard for the next season.']},
 {key:'studio',label:'Creative Studio',bio:'Original sketches, concepts and behind-the-scenes ideas.',posts:['Starting a new creative concept from a blank page.','A small sketch that became a bigger idea.','Sharing a fresh visual direction today.']}
];
const pvVirtualCreators=pvVirtualNames.flatMap((name,i)=>pvVirtualThemes.map((theme,j)=>({
 id:'virtual-'+i+'-'+j,username:'pv_'+name.toLowerCase()+'_'+theme.key,
 display_name:name+' · '+theme.label,initial:name[0],bio:theme.bio,
 theme:theme.label,posts:theme.posts,shade:(i*2+j)%8
})));

// Published to the clearly labeled daily virtual editorial showcase; no synthetic Auth users.
window.PAVORA_VIRTUAL_CREATORS=pvVirtualCreators;
const pvVirtualCss=document.createElement('style');
pvVirtualCss.textContent=`
#pvVirtualDiscovery{margin:16px 0 26px;padding:18px;background:#14121c;border:1px solid #302638;border-radius:17px}
#pvVirtualDiscovery h3{margin:0;font-size:19px}
#pvVirtualDiscovery .pvVirtualIntro{margin:7px 0 14px;color:#a9a1b8;font-size:12px;line-height:1.5}
.pvVirtualGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.pvVirtualCard{display:flex;align-items:center;gap:10px;min-width:0;background:#201a2a;border:1px solid #382d48;border-radius:12px;padding:11px 9px;color:#fff;text-align:left;cursor:pointer}
.pvVirtualCard:hover{background:#2b2137}
.pvVirtualAvatar{width:48px;height:48px;flex:none;display:grid;place-items:center;border-radius:50%;font-size:20px;font-weight:800;color:white;background:linear-gradient(130deg,#884ee3,#d45e99)}
.pvVirtualAvatar[data-shade="1"]{background:linear-gradient(135deg,#375dbb,#66bae9)}
.pvVirtualAvatar[data-shade="2"]{background:linear-gradient(135deg,#cf704f,#eec06c)}
.pvVirtualAvatar[data-shade="3"]{background:linear-gradient(135deg,#2e9f90,#6dbd8e)}
.pvVirtualAvatar[data-shade="4"]{background:linear-gradient(135deg,#b34489,#ef8594)}
.pvVirtualAvatar[data-shade="5"]{background:linear-gradient(135deg,#6357c9,#a597e0)}
.pvVirtualAvatar[data-shade="6"]{background:linear-gradient(135deg,#b26035,#dc916a)}
.pvVirtualAvatar[data-shade="7"]{background:linear-gradient(135deg,#3b78a1,#5fc5a9)}
.pvVirtualCardText{min-width:0;display:flex;flex-direction:column;gap:3px}
.pvVirtualCardText strong{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pvVirtualCardText small{font-size:10px;color:#b9afc8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pvVirtualView{padding:20px 16px 100px;max-width:880px;margin:auto;color:#f9f6ff}
#pvVirtualView.hide{display:none!important}
.pvVirtualBack{border:0;background:transparent;color:#d5bedf;font-weight:750;padding:9px 0;cursor:pointer}
.pvVirtualProfileHead{display:grid;grid-template-columns:140px minmax(0,1fr);gap:26px;align-items:center;padding:22px 6px}
.pvVirtualProfileHead .pvVirtualAvatar{height:128px;width:128px;font-size:48px;border:3px solid #6d49a1}
.pvVirtualProfileHead h2{margin:0 0 4px;font-size:25px}
.pvVirtualTag{color:#a7a2b8;font-size:11px;font-weight:700}
.pvVirtualMeta{display:flex;flex-wrap:wrap;gap:18px;font-size:13px;color:#b9b4c8;margin:14px 0}
.pvVirtualMeta strong{color:#fff}
.pvVirtualActions{display:flex;gap:10px;margin:14px 0}
.pvVirtualActions button,.pvVirtualChatForm button{background:#6844b3;color:white;border:0;border-radius:10px;padding:11px 17px;font-weight:800;cursor:pointer}
.pvVirtualActions button.secondary{background:#32263f}
.pvVirtualProfileBio{font-size:14px;color:#d7cfdf;line-height:1.6;margin:6px 0}
.pvVirtualPostGrid{border-top:1px solid #382c44;margin-top:24px;padding-top:20px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.pvVirtualPost{aspect-ratio:1;border:0;border-radius:12px;background:linear-gradient(145deg,#34234e,#1a2039);color:#fff;text-align:left;padding:16px;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;overflow:hidden}
.pvVirtualPost span{font-size:12px;line-height:1.5}.pvVirtualPost small{opacity:.7;font-weight:750}
#pvVirtualChat{position:fixed;inset:0;z-index:105;background:#0d0b12;display:flex;justify-content:center;padding:18px}
#pvVirtualChat[hidden]{display:none!important}
.pvVirtualChatCard{display:flex;flex-direction:column;width:min(600px,100%);min-height:0;background:#171320;border:1px solid #41314d;border-radius:17px;overflow:hidden}
.pvVirtualChatHeader{padding:14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #34283e}
.pvVirtualChatHeader strong{flex:1}.pvVirtualChatHeader button{background:transparent;border:0;color:#fff;font-size:23px;cursor:pointer}
.pvVirtualChatNote{font-size:11px;color:#aca2b9;padding:9px 14px;border-bottom:1px solid #292331}
.pvVirtualMessages{flex:1;overflow:auto;min-height:100px;padding:18px 13px;display:flex;flex-direction:column;gap:10px}
.pvVirtualBubble{max-width:78%;padding:11px 14px;border-radius:15px;background:#30243d;color:#eee7f4;font-size:13px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;align-self:flex-start}
.pvVirtualBubble.mine{align-self:flex-end;background:#6945b1;color:white}
.pvVirtualChatForm{display:flex;gap:8px;padding:13px;border-top:1px solid #34283e}
.pvVirtualChatForm input{flex:1;min-width:0;border:1px solid #4c405d;background:#201b29;color:white;border-radius:9px;padding:12px;font-size:14px}
@media(max-width:1100px){.pvVirtualGrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:600px){#pvVirtualDiscovery{margin:12px 8px;padding:12px}.pvVirtualGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.pvVirtualCard{padding:9px 6px;gap:7px}.pvVirtualAvatar{width:38px;height:38px;font-size:16px}.pvVirtualCardText strong{font-size:11px}#pvVirtualView{padding:10px 10px 90px}.pvVirtualProfileHead{grid-template-columns:88px minmax(0,1fr);gap:12px;padding:18px 0}.pvVirtualProfileHead .pvVirtualAvatar{height:82px;width:82px;font-size:33px}.pvVirtualProfileHead h2{font-size:18px}.pvVirtualMeta{gap:7px 13px;margin:9px 0;font-size:12px}.pvVirtualPost{padding:9px}.pvVirtualPost span{font-size:10px}#pvVirtualChat{padding:0}.pvVirtualChatCard{border-radius:0;border:0}.pvVirtualMessages{padding-bottom:80px}}
`;
document.head.append(pvVirtualCss);
const pvVirtualSection=node('section');pvVirtualSection.id='pvVirtualDiscovery';
const pvVirtualHeading=node('h3','','Discover creators');
const pvVirtualIntro=node('p','pvVirtualIntro','Explore original creative concepts from the PAVORA virtual community.');
const pvVirtualGrid=node('div','pvVirtualGrid');
pvVirtualSection.append(pvVirtualHeading,pvVirtualIntro,pvVirtualGrid);
explore.append(pvVirtualSection);
const pvVirtualView=node('section');pvVirtualView.id='pvVirtualView';pvVirtualView.classList.add('hide');
document.querySelector('.feed').append(pvVirtualView);
const pvVirtualChat=node('div');pvVirtualChat.id='pvVirtualChat';pvVirtualChat.hidden=true;
pvVirtualChat.setAttribute('role','dialog');pvVirtualChat.setAttribute('aria-modal','true');pvVirtualChat.setAttribute('aria-label','Virtual creator chat');
document.body.append(pvVirtualChat);
let pvActiveVirtual=null,pvActiveVirtualChat=null;
const pvVirtualById=new Map(pvVirtualCreators.map(p=>[p.id,p]));
function pvVirtualKey(person){return 'pavora-virtual-chat-v1-'+user.id+'-'+person.id}
function pvReadVirtualMessages(person){
 try{const value=JSON.parse(localStorage.getItem(pvVirtualKey(person))||'[]');return Array.isArray(value)?value.slice(-80).filter(m=>m&&typeof m.body==='string'&&['me','virtual'].includes(m.from)):[]}
 catch{return []}
}
function pvWriteVirtualMessages(person,messages){
 try{localStorage.setItem(pvVirtualKey(person),JSON.stringify(messages.slice(-80)))}catch(e){console.warn('Could not save virtual chat locally',e)}
}
function pvCloseVirtualChat(){pvVirtualChat.hidden=true;pvActiveVirtualChat=null;pvVirtualChat.replaceChildren()}
function pvRenderVirtualMessages(person,root){
 root.replaceChildren();
 const messages=pvReadVirtualMessages(person);
 if(!messages.length)root.append(node('div','pvVirtualChatNote','Say hello or ask about '+person.theme.toLowerCase()+'.'));
 for(const message of messages)root.append(node('div','pvVirtualBubble'+(message.from==='me'?' mine':''),message.body));
 root.scrollTop=root.scrollHeight;
}
function pvOpenVirtualChat(person){
 if(!user)return;
 pvActiveVirtualChat=person;
 const card=node('div','pvVirtualChatCard'),head=node('div','pvVirtualChatHeader');
 const avatar=node('span','pvVirtualAvatar',person.initial);avatar.dataset.shade=String(person.shade);
 const who=node('strong','',person.display_name),close=node('button','','×');
 close.type='button';close.setAttribute('aria-label','Close conversation');close.onclick=pvCloseVirtualChat;
 head.append(avatar,who,close);
 const note=node('div','pvVirtualChatNote','Virtual character · Automated sample replies · Messages saved only in this browser');
 const messages=node('div','pvVirtualMessages'),form=node('form','pvVirtualChatForm');
 const input=node('input');input.type='text';input.maxLength=500;input.placeholder='Message '+person.display_name;
 input.setAttribute('aria-label','Message text');
 const send=node('button','','Send');send.type='submit';form.append(input,send);
 form.onsubmit=e=>{
  e.preventDefault();
  const body=input.value.trim();if(!body||!user)return;
  const log=pvReadVirtualMessages(person);
  log.push({from:'me',body,at:Date.now()});
  const lower=body.toLowerCase();
  const response=/^(hi|hello|hey|namaste|hii)\b/.test(lower)?
   'Hey! Welcome to my virtual '+person.theme.toLowerCase()+' space. What would you like to explore?':
   /tool|app|pavora|feature/.test(lower)?
   'I am a virtual creative profile in PAVORA. For official feature updates, check @PAVORA.':
   /thank|thanks/.test(lower)?
   'You are welcome! Have fun exploring creative ideas.':
   person.posts[(log.filter(m=>m.from==='me').length-1)%person.posts.length];
  log.push({from:'virtual',body:response,at:Date.now()});
  pvWriteVirtualMessages(person,log);input.value='';
  pvRenderVirtualMessages(person,messages);input.focus();
 };
 card.append(head,note,messages,form);pvVirtualChat.replaceChildren(card);pvVirtualChat.hidden=false;
 pvRenderVirtualMessages(person,messages);input.focus();
}
function pvOpenVirtual(person){
 if(!user)return;
 pvActiveVirtual=person;
 // Use the same central feed area as real public profiles, not a popup preview.
 document.body.classList.remove('pvMessagesMode','pvReelsMode','pvProfileMode');
 for(const id of ['home','reels','explore','profile','messages']){
  const view=document.getElementById(id);if(view)view.classList.add('hide');
 }
 document.getElementById('pvPublicView')?.classList.add('hide');
 document.getElementById('pvInboxView')?.classList.add('hide');
 pvVirtualView.classList.remove('hide');
 const back=node('button','pvVirtualBack','← Back to Explore');
 back.onclick=()=>{pvVirtualView.classList.add('hide');pvActiveVirtual=null;pvNavigate('explore')};
 const head=node('div','pvVirtualProfileHead'),avatar=node('div','pvVirtualAvatar',person.initial);
 avatar.dataset.shade=String(person.shade);
 const details=node('div');
 details.append(node('h2','',person.username),node('strong','',person.display_name),node('div','pvVirtualTag','Virtual · Creative concept profile'),node('p','pvVirtualProfileBio',person.bio));
 const dailyHistory=window.PAVORA_DAILY?.history?.(person,3)||person.posts.map(text=>({caption:text}));
 const meta=node('div','pvVirtualMeta');meta.append(node('span','',dailyHistory.length+' recent demo posts'),node('span','','Virtual creator · editorial schedule'));
 details.append(meta);
 const actions=node('div','pvVirtualActions'),message=node('button','','Message'),exploreBtn=node('button','secondary','Explore creators');
 message.onclick=()=>pvOpenVirtualChat(person);
 exploreBtn.onclick=back.onclick;
 actions.append(message,exploreBtn);details.append(actions);head.append(avatar,details);
 const grid=node('div','pvVirtualPostGrid');
 dailyHistory.forEach((entry,i)=>{
  const content=entry.caption;
  const post=node('button','pvVirtualPost');post.type='button';
  post.style.background=['linear-gradient(135deg,#3a275c,#18213a)','linear-gradient(135deg,#1e4f63,#25203f)','linear-gradient(135deg,#5b2b50,#292039)'][(i+person.shade)%3];
  post.append(node('small','','PAVORA · '+person.theme),node('span','',content));
  post.onclick=()=>{const preview=node('div','pvVirtualChatNote',content);preview.style.cssText='padding:18px;margin:10px 0;background:#241c30;border-radius:12px';post.after(preview);post.disabled=true};
  grid.append(post);
 });
 pvVirtualView.replaceChildren(back,head,node('h3','','Posts'),grid);
 window.scrollTo({top:0,behavior:'instant'});
}
// Virtual profiles are searchable in regular People search, not a 100-card Explore grid.
pvVirtualSection.hidden=true;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pvVirtualChat.hidden)pvCloseVirtualChat()});
document.querySelectorAll('[data-view],.pvIconRail [data-rail-view]').forEach(btn=>btn.addEventListener('click',()=>{
 pvVirtualView.classList.add('hide');pvActiveVirtual=null;pvCloseVirtualChat();
}));

let pvExploreBusy=false,pvExploreTiles=[],pvExplorePeople=[],pvExploreLoadedAt=0;
async function pvLoadExplore(){if(!user||pvExploreBusy)return;if(pvExploreLoadedAt&&Date.now()-pvExploreLoadedAt<90000&&pvExploreTiles.length)return;pvExploreBusy=true;try{
const [postResult,reelResult,peopleResult]=await Promise.all([
db.from('posts').select('id,author_id,caption,image_path,created_at').not('image_path','is',null).order('created_at',{ascending:false}).limit(75),
db.from('reels').select('id,author_id,caption,video_path,created_at').order('created_at',{ascending:false}).limit(55),
db.from('profiles').select('id,username,display_name,avatar_url').order('created_at',{ascending:false}).limit(80)
]);
pvExplorePeople=peopleResult.data||[];
const pics=(postResult.data||[]).filter(p=>p.image_path).map(p=>({...p,kind:'post'}));
const clips=(reelResult.data||[]).filter(p=>p.video_path).map(p=>({...p,kind:'reel'}));
pvExploreTiles=[...pics,...clips].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
pvExploreLoadedAt=Date.now();pvRenderExplore();
}catch(e){pvExploreGrid.replaceChildren(node('p','pvExploreEmpty','Explore unavailable: '+e.message))}finally{pvExploreBusy=false}}
function pvRenderExplore(){
const query=pvExploreSearch.value.trim().toLowerCase();
pvExploreGrid.replaceChildren();pvExploreResults.replaceChildren();
const creators=query?pvExplorePeople.filter(p=>(p.username||'').toLowerCase().includes(query)||(p.display_name||'').toLowerCase().includes(query)): [];
const virtualMatches=query?pvVirtualCreators.filter(p=>(p.username||'').toLowerCase().includes(query)||(p.display_name||'').toLowerCase().includes(query)): [];
pvExploreResults.classList.toggle('hide',!query);
if(query&&(creators.length||virtualMatches.length)){
 pvExploreResults.append(node('h3','','People'));
 const results=[...creators.map(p=>({...p,virtual:false})),...virtualMatches.map(p=>({...p,virtual:true}))].slice(0,24);
 for(const person of results){
  const row=node('button','pvExplorePerson'),avatar=node('div','pvExplorePersonAvatar'),details=node('span');
  if(person.avatar_url){const image=node('img');image.src=person.avatar_url;image.alt='';avatar.append(image)}
  else avatar.textContent=(person.display_name||person.username||'P')[0].toUpperCase();
  const name=node('strong','','@'+person.username),subtitle=node('small','',person.display_name||'');
  if(person.virtual)subtitle.append(document.createTextNode(' · Virtual'));
  details.append(name,subtitle);row.append(avatar,details);
  row.onclick=()=>person.virtual?pvOpenVirtual(person):openCreator(person.id);
  pvExploreResults.append(row);
 }
}
const authorMatches=new Set(creators.map(p=>p.id));
const matches=pvExploreTiles.filter(p=>!query||(p.caption||'').toLowerCase().includes(query)||authorMatches.has(p.author_id));
if(!matches.length){if(!query||(!creators.length&&!virtualMatches.length))pvExploreGrid.append(node('div','pvExploreEmpty',query?'No matching people, posts or reels found.':'No photos or reels uploaded yet.'));return}
for(const item of matches){
const tile=node('button','pvExploreTile '+(item.kind==='reel'?'pvExploreReel':'pvExplorePhoto'));tile.type='button';tile.title=item.caption||'Open '+item.kind;
if(item.kind==='post'){const img=node('img');img.src=db.storage.from('post-images').getPublicUrl(item.image_path).data.publicUrl;img.alt=item.caption||'Photo';img.loading='lazy';tile.append(img);tile.onclick=()=>{const person=pvExplorePeople.find(x=>x.id===item.author_id);openProfilePost({...item,author_name:person?.username||'creator'})}}
else{const vid=node('video');vid.src=db.storage.from('reel-videos').getPublicUrl(item.video_path).data.publicUrl;vid.preload='metadata';vid.muted=true;vid.playsInline=true;vid.setAttribute('aria-hidden','true');tile.append(vid);const marker=node('span','pvExploreReelMark','▶');tile.append(marker);tile.onclick=()=>{pvNavigate('reels');loadReels().then(()=>{const el=document.getElementById('reel-'+item.id);if(el)el.scrollIntoView({behavior:'smooth',block:'center'})})}}
const shade=node('span','pvExploreTileShade',item.caption||'');tile.append(shade);pvExploreGrid.append(tile)}
}
pvExploreSearch.addEventListener('input',pvRenderExplore);

async function updateSocialProfile(){if(!user||!profile)return;
document.getElementById('editUsername').value=profile.username||'';
document.getElementById('editName').value=profile.display_name||'';
document.getElementById('editBio').value=profile.bio||'';
const head=document.getElementById('pvProfileHead');
if(head){
document.getElementById('pvUsername').textContent=profile.username||'creator';
if(profile.is_official){document.getElementById('pvUsername').append(pvOfficialBadge())}
const officialType=document.getElementById('pvOfficialType');
if(officialType){officialType.hidden=!profile.is_official;officialType.textContent=profile.is_official?'Official PAVORA Account':''}
const officialHub=document.getElementById('pvOfficialHub');
if(officialHub)officialHub.hidden=!profile.is_official;
const sidebarDesc=document.querySelector('aside.left .intro .muted');
if(sidebarDesc)sidebarDesc.textContent=profile.is_official?'Official PAVORA Account':'Creator account';
document.getElementById('pvDisplayName').textContent=profile.display_name||'';
document.getElementById('pvBio').textContent=profile.bio||'';
pvUpdatePrivacyControl();if(profile.is_private)pvLoadFollowRequests();
const sidebarAvatar=document.querySelector('aside.left .intro .profilepic');
if(sidebarAvatar){sidebarAvatar.replaceChildren();if(profile.avatar_url){const sideImg=node('img');sideImg.src=profile.avatar_url;sideImg.alt='Your profile photo';sideImg.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:50%;display:block';sidebarAvatar.append(sideImg)}else sidebarAvatar.textContent=(profile.display_name||profile.username||'P')[0].toUpperCase()}
const photo=document.getElementById('pvAvatar');photo.replaceChildren();
if(profile.avatar_url){const img=node('img');img.src=profile.avatar_url;img.alt='Profile picture';photo.append(img)}else photo.textContent=(profile.display_name||profile.username||'P')[0].toUpperCase();
}
const [{count:followers,error:e1},{count:following,error:e2}]=await Promise.all([
db.from('follows').select('*',{count:'exact',head:true}).eq('following_id',user.id),
db.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',user.id)]);
{const el=document.getElementById('pvFollowers');if(el)el.textContent=e1?'—':followers??0};
{const el=document.getElementById('pvFollowing');if(el)el.textContent=e2?'—':following??0};
await loadOwnPosts();
await loadCreators();
window.PVKit?.renderHighlights?.(document.querySelector('#profile > .panel'),user.id);
}
let pvProfileMediaTab='posts',pvOwnPosts=[],pvOwnReels=[];
let pvOwnReelViews=new Map(),pvOwnReelDeleting=new Set();
async function pvLoadOwnReelViewCounts(ids){
 const counts=new Map();
 if(!ids.length)return counts;
 // reel_views is unique per (user_id, reel_id): these are unique viewers.
 for(let start=0;start<ids.length;start+=70){
  const {data,error}=await db.from('reel_views').select('reel_id').in('reel_id',ids.slice(start,start+70)).limit(5000);
  if(error){console.warn('Profile reel view totals:',error.message);throw error}
  for(const row of data||[])counts.set(row.reel_id,(counts.get(row.reel_id)||0)+1);
 }
 return counts;
}
async function pvDeleteOwnReel(reel){
 if(!user||pvOwnReelDeleting.has(reel.id))return;
 if(!confirm('Permanently delete this Reel? All its likes, comments and views will be removed. This cannot be undone.'))return;
 const uid=user.id;
 pvOwnReelDeleting.add(reel.id);pvDrawOwnMedia();
 try{
  const {data,error}=await db.from('reels').delete().eq('id',reel.id).eq('author_id',uid).select('id');
  if(error)throw error;
  if(!data?.length)throw Error('Reel was not deleted. Check account permissions.');
  pvOwnReels=pvOwnReels.filter(r=>r.id!==reel.id);
  pvOwnReelViews.delete(reel.id);
  const counter=document.getElementById('pvReelCount');
  if(counter)counter.textContent=String(Math.max(0,Number(counter.textContent||pvOwnReels.length+1)-1));
  pvReelsLoadedAt=0;pvReelsLoadedFor=null;
  try{const cleanup=await db.storage.from('reel-videos').remove([reel.video_path]);if(cleanup.error)console.warn('Reel media cleanup:',cleanup.error.message)}catch(e){console.warn('Reel media cleanup:',e)}
  pvDrawOwnMedia();
  pvNotifyAuth('✓ Reel deleted permanently.');
 }catch(e){alert('Could not delete Reel: '+(e.message||e))}
 finally{pvOwnReelDeleting.delete(reel.id);pvDrawOwnMedia()}
}
async function pvOpenProfileReel(reelId){
 pvNavigate('reels');
 await loadReels();
 const target=document.getElementById('reel-'+reelId);
 if(!target){await loadReels(true)}
 const card=document.getElementById('reel-'+reelId);
 const stack=card?.closest('.pvReelStack');
 if(card&&stack&&typeof stack.pvResume==='function'){
  const index=[...stack.querySelectorAll('.pvReelCard')].indexOf(card);
  if(index>=0)stack.pvResume(index);
 }
}
function pvDrawOwnMedia(){const grid=document.getElementById('pvPostGrid');if(!grid)return;grid.replaceChildren();
document.getElementById('pvAllMediaTab')?.classList.toggle('active',pvProfileMediaTab==='posts');
document.getElementById('pvReelsMediaTab')?.classList.toggle('active',pvProfileMediaTab==='reels');
const all=[...pvOwnPosts.map(p=>({...p,kind:'post'})),...pvOwnReels.map(r=>({...r,kind:'reel'}))].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
const shown=all.filter(x=>x.kind===(pvProfileMediaTab==='reels'?'reel':'post'));
if(!shown.length){grid.append(node('div','pvNoPosts',pvProfileMediaTab==='reels'?'No Reels uploaded yet.':'No posts yet. Share your first update!'));return}
for(const item of shown){const tile=node(item.kind==='reel'?'div':'button','pvTile'+(item.kind==='reel'?' pvProfileReelTile':''));if(item.kind!=='reel')tile.type='button';else{tile.tabIndex=0;tile.setAttribute('role','button');tile.setAttribute('aria-label','Open Reel: '+(item.caption||'Video'));tile.addEventListener('keydown',e=>{if(e.target===tile&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pvOpenProfileReel(item.id)}})}tile.title=item.caption||'View '+item.kind;
if(item.kind==='post'){if(item.image_path){const img=node('img');img.loading='lazy';img.alt=item.caption||'Your post';img.src=db.storage.from('post-images').getPublicUrl(item.image_path).data.publicUrl;tile.append(img)}else{tile.classList.add('pvTextTile');tile.append(node('span','',item.caption||'Text post'))}tile.onclick=()=>openProfilePost(item)}
else{
 const video=node('video');video.muted=true;video.playsInline=true;video.preload='metadata';video.src=db.storage.from('reel-videos').getPublicUrl(item.video_path).data.publicUrl;
 tile.append(video,node('span','pvProfileReelBadge','▶'));
 const total=pvOwnReelViews.get(item.id);
 const stats=node('span','pvProfileReelViews',total===undefined?'◉ —':'◉ '+total.toLocaleString()+' views');
 stats.title='Unique people who watched this Reel';tile.append(stats);
 const del=node('button','pvProfileReelDelete','🗑');
 del.type='button';del.title='Delete Reel permanently';del.setAttribute('aria-label','Delete Reel permanently');
 del.disabled=pvOwnReelDeleting.has(item.id);
 del.onclick=event=>{event.stopPropagation();event.preventDefault();pvDeleteOwnReel(item)};
 tile.append(del);
 tile.onclick=()=>pvOpenProfileReel(item.id);
}
grid.append(tile)}
}
async function loadOwnPosts(){if(!user)return;const uid=user.id;const grid=document.getElementById('pvPostGrid');if(!grid)return;
const [postsResult,reelsResult]=await Promise.all([
db.from('posts').select('id,caption,image_path,created_at',{count:'exact'}).eq('author_id',uid).order('created_at',{ascending:false}).limit(100),
db.from('reels').select('id,caption,video_path,created_at',{count:'exact'}).eq('author_id',uid).order('created_at',{ascending:false}).limit(100)
]);
if(uid!==user?.id)return;
pvOwnPosts=postsResult.data||[];pvOwnReels=reelsResult.data||[];
pvOwnReelViews=new Map();
if(pvOwnReels.length){
 try{pvOwnReelViews=await pvLoadOwnReelViewCounts(pvOwnReels.map(r=>r.id))}
 catch(e){console.warn('Reel view counts temporarily unavailable:',e)}
}
if(uid!==user?.id)return;
{const postCount=document.getElementById('pvPostCount');if(postCount)postCount.textContent=postsResult.error?'—':postsResult.count??pvOwnPosts.length};
{const reelCount=document.getElementById('pvReelCount');if(reelCount)reelCount.textContent=reelsResult.error?'—':reelsResult.count??pvOwnReels.length};
if(postsResult.error||reelsResult.error){console.warn('Profile media query:',postsResult.error?.message||'',reelsResult.error?.message||'');if(postsResult.error&&reelsResult.error){grid.replaceChildren(node('p','pvNoPosts','Could not load your uploads: '+postsResult.error.message));return}}
pvDrawOwnMedia();
}

/* In-profile post preview: preserves profile context rather than jumping to feed. */
const pvPreviewCss=document.createElement('style');
pvPreviewCss.textContent=`#pvPostPreview{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.86);display:flex;align-items:center;justify-content:center;padding:24px}#pvPostPreview[hidden]{display:none}#pvPostPreview .pvPreviewCard{background:#171827;border:1px solid #39364f;border-radius:16px;max-width:760px;width:100%;max-height:90vh;overflow:auto;position:relative}#pvPostPreview .pvPreviewMedia{display:block;width:100%;max-height:65vh;object-fit:contain;background:#09090f}#pvPostPreview .pvPreviewCaption{padding:20px;white-space:pre-wrap;overflow-wrap:anywhere}#pvPostPreview .pvPreviewClose{position:absolute;right:12px;top:12px;background:#242333;color:#fff;border:1px solid #514b65;border-radius:50%;width:38px;height:38px;font-size:22px;cursor:pointer}body.pvPreviewOpen{overflow:hidden}`;
document.head.append(pvPreviewCss);
const pvPreview=document.createElement('div');pvPreview.id='pvPostPreview';pvPreview.hidden=true;pvPreview.setAttribute('role','dialog');pvPreview.setAttribute('aria-modal','true');pvPreview.setAttribute('aria-label','Post preview');document.body.append(pvPreview);
let pvPreviousFocus=null;
function closeProfilePost(){pvPreview.hidden=true;pvPreview.replaceChildren();document.body.classList.remove('pvPreviewOpen');pvPreviousFocus?.focus?.()}
function openProfilePost(p){pvPreviousFocus=document.activeElement;pvPreview.replaceChildren();const card=node('div','pvPreviewCard'),close=node('button','pvPreviewClose','×');close.type='button';close.setAttribute('aria-label','Close post preview');close.onclick=closeProfilePost;card.append(close);if(p.image_path){const img=node('img','pvPreviewMedia');img.src=db.storage.from('post-images').getPublicUrl(p.image_path).data.publicUrl;img.alt=p.caption||'Post image';card.append(img)}const caption=node('div','pvPreviewCaption');caption.append(node('strong','', '@'+(profile?.username||'creator')));if(p.caption)caption.append(node('p','',p.caption));caption.append(node('small','muted',new Date(p.created_at).toLocaleString()));card.append(caption);pvPreview.append(card);pvPreview.hidden=false;document.body.classList.add('pvPreviewOpen');close.focus()}
pvPreview.addEventListener('click',e=>{if(e.target===pvPreview)closeProfilePost()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pvPreview.hidden)closeProfilePost()});
async function loadCreators(){if(!user)return;discover.replaceChildren();discover.append(node('h3','','Discover creators'));const [{data:people,error},{data:following,error:followError}]=await Promise.all([db.from('profiles').select('id,username,display_name,bio,avatar_url,is_official').neq('id',user.id).order('created_at',{ascending:false}).limit(40),db.from('follows').select('following_id').eq('follower_id',user.id)]);if(error||followError){discover.append(node('p','muted',(error||followError).message));return}const followed=new Set((following||[]).map(x=>x.following_id));if(!people?.length)discover.append(node('p','muted','No other creators yet. Invite a friend to PAVORA!'));for(const person of people||[]){const row=node('div','creator'),info=node('div'),name=node('strong','', '@'+person.username);const creatorName=pvProfileButton(person);info.append(creatorName);if(person.is_official)info.append(pvOfficialBadge());info.append(node('div','muted',person.display_name||''));const msgBtn=node('button','secondary','Message');msgBtn.onclick=()=>openChat(person.id);if(person.bio)info.append(node('div','muted',person.bio));const btn=node('button','secondary',followed.has(person.id)?'Following ✓':'Follow');btn.onclick=async()=>{btn.disabled=true;const result=followed.has(person.id)?await db.from('follows').delete().eq('follower_id',user.id).eq('following_id',person.id):await db.from('follows').insert({follower_id:user.id,following_id:person.id});if(result.error)alert(result.error.message);await updateSocialProfile()};row.append(info,btn,msgBtn);discover.append(row)}}
document.getElementById('editProfileForm').onsubmit=async event=>{event.preventDefault();if(!user||!profile)return;const feedback=document.getElementById('editFeedback');feedback.textContent='Saving…';const username=document.getElementById('editUsername').value.trim(),display_name=document.getElementById('editName').value.trim(),bio=document.getElementById('editBio').value.trim(),file=document.getElementById('editAvatar').files[0];if(!/^[a-zA-Z0-9_]{3,24}$/.test(username)){feedback.textContent='Username must be 3–24 letters, numbers or underscores';return}try{let avatar_url=profile.avatar_url;if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Choose a JPG, PNG or WebP under 5MB');const path=user.id+'/avatar-'+crypto.randomUUID()+'.'+({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type]);const upload=await db.storage.from('post-images').upload(path,file,{contentType:file.type});if(upload.error)throw upload.error;avatar_url=db.storage.from('post-images').getPublicUrl(path).data.publicUrl}const {data,error}=await db.from('profiles').update({username,display_name,bio,avatar_url}).eq('id',user.id).select().single();if(error)throw error;profile=data;document.querySelectorAll('.intro b').forEach(x=>x.textContent='@'+username);document.querySelector('#profile h2').textContent=username;feedback.textContent='Profile saved!';await updateSocialProfile();await refreshStoryAvatars();await refresh()}catch(e){feedback.textContent=e.message}};


/* Reels V1: MP4/WebM short-video upload, scroll playback and delete */
const reelsView=document.getElementById('reels');
/* Align phone Reels to the actual header + bottom navigation, not guessed pixel offsets. */
function pvFitReelsViewport(){
 if(window.innerWidth>700)return;
 const root=document.documentElement;
 const header=document.querySelector('body > header');
 const rail=document.querySelector('.pvIconRail');
 const top=header?.getBoundingClientRect().bottom||56;
 const navTop=rail?.getBoundingClientRect().top;
 const height=window.innerHeight;
 root.style.setProperty('--pvReelsTop',Math.max(0,Math.round(top))+'px');
 root.style.setProperty('--pvReelsBottom',Math.max(0,Math.round(Number.isFinite(navTop)?height-navTop:63))+'px');
}
window.addEventListener('resize',()=>{if(document.body.classList.contains('pvReelsMode'))requestAnimationFrame(pvFitReelsViewport)},{passive:true});
reelsView.replaceChildren();
const reelsStyles=document.createElement('style');reelsStyles.textContent=`
.reelComposer{padding:16px;background:#171827;border:1px solid #303044;border-radius:16px;margin:12px 0}.reelComposer input,.reelComposer textarea{display:block;width:100%;padding:10px;margin:9px 0;background:#10111f;color:#fff;border:1px solid #39364f;border-radius:10px}.reelCard{background:#171827;border:1px solid #303044;border-radius:16px;margin:16px auto;overflow:hidden;max-width:470px}.reelCard video{width:100%;max-height:75vh;aspect-ratio:9/16;object-fit:contain;background:#000;display:block}.reelInfo{padding:12px 15px}.reelInfo p{white-space:pre-wrap;overflow-wrap:anywhere}.reelInfo button{margin-top:8px}`;document.head.append(reelsStyles);
const reelForm=document.createElement('form');reelForm.className='reelComposer';reelForm.innerHTML='<h2>Reels ▣</h2><p class="muted">Upload an MP4 or WebM video. Upload size depends on your Supabase project limits. Videos are public.</p><input id="reelVideo" type="file" accept="video/mp4,video/webm" required><textarea id="reelCaption" maxlength="1000" placeholder="Write a reel caption…"></textarea><button class="primary" type="submit">Upload Reel</button><p id="reelFeedback" class="hint" role="status"></p>';reelsView.append(reelForm);reelForm.classList.add('hide');const reelUploadToggle=node('button','pvReelUploadToggle','＋ Create Reel');reelUploadToggle.type='button';reelUploadToggle.onclick=()=>{reelForm.classList.toggle('hide');if(!reelForm.classList.contains('hide'))reelForm.scrollIntoView({behavior:'smooth',block:'start'})};reelsView.insertBefore(reelUploadToggle,reelForm);
// Discovery controls remain for desktop; immersive phone Reels hide them.
const reelDiscovery=node('div','pvReelDiscovery');
const reelDiscoveryText=node('span','pvReelDiscoveryText','Discover Reels from PAVORA creators');
const reelRefresh=node('button','pvReelDiscoveryButton','↻ Refresh');
reelRefresh.type='button';reelRefresh.title='Check for new reels';
reelRefresh.onclick=()=>loadReels(true);
const reelCreate=node('button','pvReelDiscoveryButton','＋ Upload');
reelCreate.type='button';reelCreate.onclick=()=>{document.body.classList.add('pvComposeOpen')};
reelDiscovery.append(reelDiscoveryText,reelRefresh,reelCreate);
reelsView.append(reelDiscovery);
const reelList=document.createElement('div');reelList.id='reelList';reelsView.append(reelList);
window.PAVORA_SMART_REELS?.createTabs(reelsView,()=>user?.id||'guest',()=>loadReels(true));
let reelObserver=null,pvReelsLoading=null,pvReelsLoadedAt=0,pvReelsLoadedFor=null;
async function loadReels(force=false){
 if(!user)return;
 const list=document.getElementById('reelList');
 if(!force&&pvReelsLoadedFor===user.id&&list.querySelector('.pvReelCard')&&Date.now()-pvReelsLoadedAt<120000){
  const stack=list.querySelector('.pvReelStack');
  if(document.body.classList.contains('pvReelsMode')&&stack){
   const resumed=Number(stack.dataset.activeReel);
   if(typeof stack.pvResume==='function')stack.pvResume(Number.isFinite(resumed)?resumed:0);
  }
  return;
 }
 if(pvReelsLoading)return pvReelsLoading;
 pvReelsLoading=(async()=>{
 if(!list.querySelector('.pvReelCard'))list.replaceChildren(node('p','muted','Loading reels…'));
const {data:rawReels,error,count}=await db.from('reels').select('id,author_id,caption,video_path,created_at',{count:'exact'}).order('created_at',{ascending:false}).limit(120);
if(error){reelDiscoveryText.textContent='Could not load reels';list.replaceChildren(node('p','muted','Reels unavailable: '+error.message));return}
window.PAVORA_SMART_REELS?.syncTabs(user.id);
const mode=window.PAVORA_SMART_REELS?.getMode(user.id)||'for-you';
const data=await window.PAVORA_SMART_REELS?.rank(db,user,rawReels||[],mode)||rawReels||[];
list.replaceChildren();
reelDiscoveryText.textContent=(count??data?.length??0)+' Reels available';
if(!data?.length&&mode==='following'){
 const empty=node('div','pvSmartReelEmpty');
 empty.append(node('strong','','No Reels from followed creators yet'),node('p','','Follow creators who upload Reels, or switch back to For You to discover videos.'));
 const discover=node('button','','Explore creators');discover.type='button';discover.onclick=()=>pvNavigate('explore');
 empty.append(discover);list.append(empty);pvReelsLoadedAt=Date.now();pvReelsLoadedFor=user.id;return;
}
if(!data?.length){
 const empty=node('div','pvReelEmpty');
 empty.append(node('strong','','No public Reels yet'),node('p','','Creators have not uploaded public Reels here yet. Be the first to share a video, or discover people to follow.'));
 const create=node('button','pvReelEmptyButton','＋ Create first Reel');create.type='button';create.onclick=()=>document.body.classList.add('pvComposeOpen');
 const people=node('button','pvReelEmptySecondary','Discover creators');people.type='button';people.onclick=()=>pvNavigate('explore');
 empty.append(create,people);list.append(empty);return
}
const {data:authors}=await db.from('profiles').select('id,username,display_name,avatar_url').in('id',[...new Set(data.map(r=>r.author_id))]);const people=new Map((authors||[]).map(p=>[p.id,p]));if(reelObserver)reelObserver.disconnect();
if(window.pvReelsWheelCleanup)window.pvReelsWheelCleanup();
const reelStage=node('div','pvReelStage'),reelStack=node('div','pvReelStack'),arrows=node('div','pvReelArrows'),up=node('button','pvReelArrow','↑'),down=node('button','pvReelArrow','↓');up.type=down.type='button';up.title='Previous reel';down.title='Next reel';arrows.append(up,down);reelStage.append(reelStack,arrows);list.append(reelStage);
const cards=[];
function reelSvg(path){return '<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>'}
function reelAction(label,svg,handler){const b=node('button','pvReelAction');b.type='button';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=reelSvg(svg);b.onclick=handler;return b}
let current=0,gestureLocked=false,gestureTimer=null,touchStartY=null,touchStartX=null,touchConsumed=false;

let desktopWheelLastAt=0,desktopWheelGestureAt=0,desktopWheelDirection=0;
const pvReelLoadStyle=document.createElement('style');pvReelLoadStyle.textContent=".pvReelLoadState{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(15,13,22,.76);color:#eee;border-radius:24px;padding:10px 16px;z-index:8;font-size:12px;pointer-events:none;box-shadow:0 6px 25px #0007;white-space:nowrap}.pvReelLoadState[hidden]{display:none!important}.pvReelLoadState.error{pointer-events:auto;cursor:pointer;border:1px solid #e67e9b;color:#fff}.pvReelCard[data-reel-position]:not([data-reel-position=\"active\"]) .pvReelLoadState{display:none!important}";document.head.append(pvReelLoadStyle);
// Reels remember sound across swipes and launches. First audible playback may
// require a tap because browsers block autoplay with audio before interaction.
let pvReelsSoundOn=localStorage.getItem('pvReelsSoundMode')!=='off';
let pvReelsAudioPrompt=null;
function pvSyncReelSoundButtons(){
 for(const card of cards){
  const v=card.querySelector('video'),button=card.querySelector('.pvReelSound');
  if(button){button.classList.toggle('pvMuted',!pvReelsSoundOn);button.title=pvReelsSoundOn?'Mute Reel':'Turn on Reel sound';button.setAttribute('aria-label',button.title)}
  if(v)v.muted=!pvReelsSoundOn;
 }
}
function pvSetReelsSound(on){
 pvReelsSoundOn=!!on;
 try{localStorage.setItem('pvReelsSoundMode',pvReelsSoundOn?'on':'off')}catch(e){}
 pvSyncReelSoundButtons();
 pvReelsAudioPrompt?.remove();pvReelsAudioPrompt=null;
 if(pvReelsSoundOn){
  const currentVideo=videoFor(current);
  if(currentVideo?.paused)currentVideo.play().catch(pvHandleReelAutoplayError);
 }
}
function pvHandleReelAutoplayError(err){
 const video=videoFor(current);
 if(!video||!document.body.classList.contains('pvReelsMode'))return;
 if(err?.name!=='NotAllowedError'){console.warn('Reel playback:',err);return}
 // Keep silent autoplay smooth until the user explicitly enables audio.
 video.muted=true;
 video.play().catch(()=>{});
 if(pvReelsAudioPrompt?.isConnected)return;
 const button=node('button','pvReelsAudioPrompt','🔊 Tap to enable sound');
 button.type='button';button.style.cssText='position:absolute;left:50%;bottom:86px;transform:translateX(-50%);z-index:30;background:rgba(24,18,36,.94);border:1px solid #b391da;color:#fff;padding:11px 18px;border-radius:999px;box-shadow:0 9px 30px #0008;white-space:nowrap;font-weight:800;cursor:pointer';
 button.onclick=()=>pvSetReelsSound(true);
 pvReelsAudioPrompt=button;reelStage.append(button);
}
const videoFor=index=>cards[index]?.querySelector('video');
reelStack.pvResume=index=>goTo(index,'auto');
function pvActivateReel(index){
 if(!cards.length||!document.body.classList.contains('pvReelsMode'))return;
 cards.forEach((card,i)=>{
  const v=card.querySelector('video');if(!v)return;
  const distance=Math.abs(i-index);
  if(distance===0||(!window.PAVORA_CREATOR_HUB?.dataSaver()&&distance===1)){
   // Data Saver skips adjacent-video decoder and network preloading.
   if(!v.hasAttribute('src')&&v.dataset.pvSrc)v.src=v.dataset.pvSrc;
   v.preload=distance===0?'auto':'metadata';
   if(i===index){
    v.muted=!pvReelsSoundOn;
    if(v.paused)v.play().then(()=>{if(pvReelsAudioPrompt){pvReelsAudioPrompt.remove();pvReelsAudioPrompt=null}}).catch(pvHandleReelAutoplayError);
   }else if(!v.paused)v.pause();
  }else{
   if(!v.paused)v.pause();
   if(v.hasAttribute('src')){
    v.removeAttribute('src');v.preload='none';
    // Release far-away decoders and network connections.
    v.load();
   }
  }
 });
}
function goTo(index,behavior='smooth'){
 if(!cards.length)return;
 const next=Math.max(0,Math.min(cards.length-1,index));
 current=next;
 reelStack.dataset.activeReel=String(next);
 // One composited vertical slide per gesture on both phone and desktop.
 // Mobile's old rAF+scrollTop route competed with CSS snap and felt jerky.
 cards.forEach((card,i)=>{
  card.style.transitionDuration=behavior==='smooth'?(window.innerWidth<=700?'260ms':'420ms'):'0ms';
  card.dataset.reelPosition=i<next?'before':i>next?'after':'active';
  card.setAttribute('aria-hidden',String(i!==next));
 });
 pvActivateReel(next);
 clearTimeout(gestureTimer);
 gestureLocked=behavior==='smooth';
 gestureTimer=setTimeout(()=>{gestureLocked=false;pvActivateReel(current)},behavior==='smooth'?(window.innerWidth<=700?285:445):0);
}
function stepReel(direction){
 if(gestureLocked||!direction)return;
 const next=Math.max(0,Math.min(cards.length-1,current+direction));
 if(next===current){
  if(direction>0){reelDiscoveryText.textContent='You are caught up · Refresh for new Reels';reelRefresh.classList.add('pvReelRefreshAttention')}
  return;
 }
 gestureLocked=true;goTo(next,'smooth');
}
up.onclick=()=>stepReel(-1);down.onclick=()=>stepReel(1);
const pvWheelHandler=e=>{
 if(window.innerWidth<=700)return;
 if(!document.body.classList.contains('pvReelsMode')||document.querySelector('.pvSuiteModal:not([hidden]),.pvCallOverlay:not([hidden])'))return;
 if(e.target instanceof Element&&e.target.closest('input,textarea,select,.pvReelComments,.pvSuiteBox'))return;
 // Take over the desktop wheel even for tiny trackpad deltas, avoiding page
 // movement while the gesture is still decelerating.
 if(e.cancelable)e.preventDefault();
 if(!e.deltaY||Math.abs(e.deltaY)<1)return;
 const now=performance.now(),direction=e.deltaY>0?1:-1;
 // Treat a trackpad's momentum events as part of the same gesture instead of
 // advancing one reel for every wheel event.
 const elapsed=now-desktopWheelLastAt;
 const withinBurst=elapsed<280;
 desktopWheelLastAt=now;
 // A trackpad emits many momentum wheel events per gesture. Treat the entire
 // burst as one action; only a fresh burst after a quiet gap can move again.
 if(gestureLocked||withinBurst||now-desktopWheelGestureAt<610)return;
 desktopWheelGestureAt=now;desktopWheelDirection=direction;
 stepReel(direction);
};
document.addEventListener('wheel',pvWheelHandler,{passive:false,capture:true});
// Native touch momentum can skip multiple snap positions on quick swipes.
// Interpret one deliberate vertical swipe as exactly one reel transition.
reelStack.addEventListener('touchstart',e=>{
 if(e.touches.length!==1||e.target.closest('button,input,textarea,select,.pvSuiteBox')){touchStartY=null;return}
 touchStartY=e.touches[0].clientY;touchStartX=e.touches[0].clientX;touchConsumed=false;
},{passive:true});
reelStack.addEventListener('touchmove',e=>{
 if(touchStartY===null||e.touches.length!==1)return;
 const dy=e.touches[0].clientY-touchStartY,dx=e.touches[0].clientX-touchStartX;
 if(Math.abs(dy)>Math.abs(dx)&&e.cancelable)e.preventDefault();
 if(!touchConsumed&&Math.abs(dy)>32&&Math.abs(dy)>Math.abs(dx)*1.15){
  touchConsumed=true;
  stepReel(dy<0?1:-1);
 }
},{passive:false});
reelStack.addEventListener('touchend',e=>{
 if(touchStartY!==null&&!touchConsumed&&e.changedTouches.length){
  const dy=e.changedTouches[0].clientY-touchStartY,dx=e.changedTouches[0].clientX-touchStartX;
  if(Math.abs(dy)>32&&Math.abs(dy)>Math.abs(dx)*1.15)stepReel(dy<0?1:-1);
 }
 touchStartY=null;touchStartX=null;touchConsumed=false;
},{passive:true});
reelStack.addEventListener('touchcancel',()=>{touchStartY=null;touchConsumed=false},{passive:true});
window.pvReelsWheelCleanup=()=>{document.removeEventListener('wheel',pvWheelHandler,true);clearTimeout(gestureTimer);reelStack.style.removeProperty('scroll-snap-type');desktopWheelLastAt=0};
reelStack.addEventListener('keydown',e=>{
 if(['ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();stepReel(1)}
 else if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();stepReel(-1)}
});
reelStack.tabIndex=0;
reelStack.setAttribute('aria-label','Reels feed — one swipe for one video');
const pvReelsResize=()=>{
 if(!reelStack.isConnected){window.removeEventListener('resize',pvReelsResize);return}
 reelStack.style.transition='none';reelStack.style.transform='';
 cards.forEach((card,i)=>{card.style.transitionDuration='0ms';card.dataset.reelPosition=i<current?'before':i>current?'after':'active';card.setAttribute('aria-hidden',String(i!==current))});
};
window.addEventListener('resize',pvReelsResize,{passive:true});
const originalReelsCleanup=window.pvReelsWheelCleanup;
window.pvReelsWheelCleanup=()=>{originalReelsCleanup?.();window.removeEventListener('resize',pvReelsResize)};

for(const reel of data){const person=people.get(reel.author_id)||{},card=node('article','pvReelCard'),screen=node('div','pvReelScreen'),video=node('video'),meta=node('div','pvReelMeta'),author=node('div','pvReelAuthor'),actions=node('div','pvReelActions');
video.dataset.pvSrc=db.storage.from('reel-videos').getPublicUrl(reel.video_path).data.publicUrl;video.loop=true;video.playsInline=true;video.muted=!pvReelsSoundOn;video.defaultMuted=!pvReelsSoundOn;video.autoplay=false;video.preload='none';video.controls=false;video.setAttribute('playsinline','');video.setAttribute('aria-label','Reel by '+(person.username||'creator'));
const avatar=node('div','pvReelAvatar');if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='';avatar.append(img)}else avatar.textContent=(person.username||'P')[0].toUpperCase();
const who=node('button','pvReelCreator','@'+(person.username||'creator'));who.type='button';who.onclick=()=>openCreator(reel.author_id);author.append(avatar,who);
if(reel.author_id!==user.id){const follow=node('button','pvReelFollow','View profile');follow.type='button';follow.onclick=()=>openCreator(reel.author_id);author.append(follow)}
meta.append(author,node('p','pvReelCaption',reel.caption||''));
const loading=node('button','pvReelLoadState','Loading Reel…');loading.hidden=true;loading.disabled=true;
loading.type='button';
loading.onclick=()=>{video.removeAttribute('src');video.load();video.src=video.dataset.pvSrc;video.muted=!pvReelsSoundOn;video.play().catch(pvHandleReelAutoplayError)};
video.addEventListener('loadstart',()=>{if(card.dataset.reelPosition==='active'){loading.classList.remove('error');loading.disabled=true;loading.textContent='Loading Reel…';loading.hidden=false}});
video.addEventListener('waiting',()=>{if(card.dataset.reelPosition==='active'){loading.textContent='Loading Reel…';loading.hidden=false}});
video.addEventListener('playing',()=>{loading.hidden=true;loading.classList.remove('error')});
video.addEventListener('canplay',()=>{if(!video.paused)loading.hidden=true});
video.addEventListener('error',()=>{if(!video.hasAttribute('src'))return;loading.textContent='Could not load Reel · Tap to retry';loading.disabled=false;loading.classList.add('error');loading.hidden=false});
screen.append(video,meta,loading);
window.PAVORA_REEL_SEEK?.attach(screen,video);
const togglePlay=()=>{if(!video.hasAttribute('src')&&video.dataset.pvSrc)video.src=video.dataset.pvSrc;if(video.paused){video.muted=!pvReelsSoundOn;video.play().catch(pvHandleReelAutoplayError)}else video.pause()};
pvBindDoubleTap(video,()=>{
 const reelLike=actions.querySelector('.pvSuiteReelActions .pvSuiteIconAction');
 if(reelLike&&!reelLike.disabled){
  if(!reelLike.classList.contains('pvSuiteIsLiked'))reelLike.click();
  pvShowDoubleLikeHeart(screen);
 }
},{single:togglePlay});
const play=reelAction('Play or pause','<path d="m9 6 10 6-10 6z"/>',togglePlay);play.classList.add('pvReelPlay');screen.append(play);video.addEventListener('play',()=>play.classList.add('hide'));video.addEventListener('pause',()=>play.classList.remove('hide'));
const sound=reelAction('Mute or unmute','<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 9a4 4 0 0 1 0 6"/>',()=>pvSetReelsSound(!pvReelsSoundOn));sound.classList.add('pvReelSound');sound.classList.toggle('pvMuted',!pvReelsSoundOn);sound.title=pvReelsSoundOn?'Mute Reel':'Turn on Reel sound';sound.setAttribute('aria-label',sound.title);screen.append(sound);
actions.append(reelAction('Share reel','<path d="m21 3-8.5 18-3.5-7.5L2 10z"/><path d="M21 3 9 13.5"/>',async()=>{const link=location.href.split('#')[0]+'#reel-'+reel.id;try{if(navigator.share)await navigator.share({title:'PAVORA Reel',url:link});else if(navigator.clipboard){await navigator.clipboard.writeText(link);alert('Reel link copied!')}else prompt('Copy reel link:',link)}catch(e){if(e.name!=='AbortError')alert('Unable to share reel')}}));
actions.append(reelAction('More options','<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',()=>{if(reel.author_id!==user.id){pvOpenActionMenu([{title:'Report Reel',onClick:()=>pvReportTarget('reel',reel.id)},{title:'Block @'+(person.username||'creator'),danger:true,onClick:()=>pvBlockAccount(reel.author_id,person.username||'creator')}]);return}if(!confirm('Delete your Reel permanently?'))return;(async()=>{const result=await db.from('reels').delete().eq('id',reel.id).eq('author_id',user.id);if(result.error){alert(result.error.message);return}await db.storage.from('reel-videos').remove([reel.video_path]);await loadReels(true)})()}));
card.append(screen,actions);reelStack.append(card);cards.push(card);card.id='reel-'+reel.id;
try{window.PVKit?.addReel?.(reel,actions,video)}catch(e){console.warn('Reel extras:',e)}
const dismiss=node('button','pvSmartNotInterested','⋯ Not interested');
dismiss.type='button';dismiss.title='Show fewer Reels like this';
dismiss.onclick=async()=>{
 if(!user||dismiss.disabled)return;
 dismiss.disabled=true;
 try{
  await window.PAVORA_SMART_REELS?.notInterested(db,user.id,reel.id);
  await loadReels(true);
 }catch(e){dismiss.disabled=false;alert('Could not update recommendations: '+e.message)}
};
screen.append(dismiss);
}
// Single playback controller above owns play/pause: no IntersectionObserver races.
if(reelObserver){reelObserver.disconnect();reelObserver=null}
pvReelsLoadedAt=Date.now();pvReelsLoadedFor=user.id;
requestAnimationFrame(()=>{goTo(0,'auto');pvActivateReel(0)});
const hash=location.hash.slice(1);if(hash.startsWith('reel-')){const target=document.getElementById(hash);if(target)setTimeout(()=>goTo(cards.indexOf(target),'auto'),100)}
})().finally(()=>{pvReelsLoading=null});
return pvReelsLoading;
}
reelForm.onsubmit=async event=>{event.preventDefault();if(!user)return;const file=document.getElementById('reelVideo').files[0],caption=document.getElementById('reelCaption').value.trim(),feedback=document.getElementById('reelFeedback'),btn=reelForm.querySelector('button');if(!file||!file.type.startsWith('video/')){feedback.textContent='Choose a video supported by your browser.';return}btn.disabled=true;feedback.textContent='Preparing video…';let path=null;try{const ready=await window.PAVORA_VIDEO.prepare(file,status=>{feedback.textContent=status});feedback.textContent='Uploading '+(ready.size/1048576).toFixed(1)+' MB…';path=user.id+'/'+crypto.randomUUID()+(ready.type==='video/mp4'?'.mp4':'.webm');await window.PAVORA_UPLOAD.upload(db,'reel-videos',path,ready,{onStatus:status=>{feedback.textContent=status}});const result=await db.from('reels').insert({author_id:user.id,caption,video_path:path});if(result.error)throw result.error;feedback.textContent='Reel published!';reelForm.reset();await loadReels(true)}catch(e){feedback.textContent=e.message;if(path)await db.storage.from('reel-videos').remove([path])}finally{btn.disabled=false}};
// pvNavigate('reels') owns loading and playback; avoid duplicate fetches.
document.querySelectorAll('[data-view]').forEach(btn=>{if(btn.dataset.view!=='reels')btn.addEventListener('click',()=>document.querySelectorAll('#reelList video').forEach(v=>v.pause()))});


/* PAVORA Direct Messages V1 */
const chatNav=document.createElement('button');chatNav.className='nav';chatNav.dataset.view='messages';chatNav.textContent='✉ Messages';document.querySelector('[data-view="profile"]').before(chatNav);
const messagesView=document.createElement('div');messagesView.id='messages';messagesView.className='hide';document.querySelector('.feed').append(messagesView);
const chatCss=document.createElement('style');chatCss.textContent=`
#messages .chatLayout{display:grid;grid-template-columns:minmax(120px,200px) minmax(0,1fr);gap:12px}#chatPeople,#chatThread{background:#171827;border:1px solid #303044;border-radius:14px;padding:12px;min-width:0}#chatPeople button{display:block;width:100%;margin:5px 0;text-align:left;overflow-wrap:anywhere}#chatHistory{height:370px;overflow:auto;display:flex;flex-direction:column;gap:9px;padding:8px 0}.bubble{max-width:85%;border-radius:14px;padding:10px 12px;background:#2b2b40;overflow-wrap:anywhere;white-space:pre-wrap}.bubble.mine{align-self:flex-end;background:#593c8c}.bubble small{display:block;font-size:10px;color:#c8c1da;margin-top:5px}#chatForm{display:flex;gap:7px}#chatText{min-width:0;flex:1;padding:11px;background:#10111f;color:#fff;border:1px solid #45415e;border-radius:10px}@media(max-width:600px){#messages .chatLayout{grid-template-columns:1fr}#chatPeople{max-height:150px;overflow:auto}#chatHistory{height:340px}}`;document.head.append(chatCss);
messagesView.innerHTML='<h2>Private Messages ✉</h2><p class="muted">Text messages are private to participants. Open Messages to check for new replies.</p><div class="chatLayout"><div id="chatPeople"><h3>People</h3><p class="muted">Loading…</p></div><div id="chatThread"><h3 id="chatTitle">Choose someone to message</h3><div id="chatHistory"></div><form id="chatForm"><input id="chatText" maxlength="2000" placeholder="Type a message…" required autocomplete="off"><button class="primary" type="submit">Send</button></form><p id="chatFeedback" class="hint" role="status"></p></div></div>';
let chatRecipient=null,chatLoading=false;
async function loadChatPeople(){if(!user)return;const root=document.getElementById('chatPeople');root.replaceChildren(node('h3','','People'));const {data,error}=await db.from('profiles').select('id,username,display_name').neq('id',user.id).order('username').limit(100);if(error){root.append(node('p','muted','Messages setup required: '+error.message));return}if(!data?.length)root.append(node('p','muted','Invite a friend to join PAVORA.'));for(const p of data||[]){const btn=node('button','secondary','@'+p.username);btn.onclick=()=>openChat(p);root.append(btn)}}
async function openChat(person){chatRecipient=person;document.getElementById('chatTitle').textContent='@'+person.username;await loadChatHistory()}
async function loadChatHistory(){if(!user||!chatRecipient||chatLoading)return;chatLoading=true;const partner=chatRecipient.id,root=document.getElementById('chatHistory');try{const {data,error}=await db.from('direct_messages').select('id,sender_id,recipient_id,body,created_at,read_at,reply_to,media_path,media_type').or('and(sender_id.eq.'+user.id+',recipient_id.eq.'+partner+'),and(sender_id.eq.'+partner+',recipient_id.eq.'+user.id+')').order('created_at',{ascending:false}).limit(100);if(error)throw error;if(chatRecipient?.id!==partner)return;root.replaceChildren();for(const m of (data||[]).reverse()){const bubble=node('div','bubble'+(m.sender_id===user.id?' mine':''),m.body);bubble.append(node('small','',new Date(m.created_at).toLocaleString()));root.append(bubble)}if(!data?.length)root.append(node('p','muted','No messages yet. Say hello!'));root.scrollTop=root.scrollHeight;document.getElementById('chatFeedback').textContent=''}catch(e){document.getElementById('chatFeedback').textContent='Chat unavailable: '+e.message+' — run supabase/messages.sql in Supabase SQL Editor.'}finally{chatLoading=false}}
document.getElementById('chatForm').onsubmit=async e=>{e.preventDefault();if(!user||!chatRecipient){document.getElementById('chatFeedback').textContent='Select a person first.';return}const input=document.getElementById('chatText'),body=input.value.trim(),button=e.currentTarget.querySelector('button');if(!body)return;button.disabled=true;const recipient_id=chatRecipient.id;const {error}=await db.from('direct_messages').insert({sender_id:user.id,recipient_id,body});button.disabled=false;if(error){document.getElementById('chatFeedback').textContent=error.message;return}input.value='';await loadChatHistory()};
chatNav.onclick=async()=>{document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===chatNav));['home','reels','explore','profile','messages'].forEach(v=>document.getElementById(v).classList.toggle('hide',v!=='messages'));await loadChatPeople();if(chatRecipient)await loadChatHistory()};
document.querySelectorAll('[data-view]:not([data-view="messages"])').forEach(btn=>btn.addEventListener('click',()=>messagesView.classList.add('hide')));


/* PAVORA profile redesign: Instagram-inspired layout, original PAVORA colors */
const pvCss=document.createElement('style');pvCss.textContent=`body.pvProfileMode main{max-width:1440px;grid-template-columns:190px minmax(0,1fr);gap:30px}body.pvProfileMode .feed{max-width:1050px;width:100%;margin:0 auto}body.pvProfileMode aside.right{display:none}body.pvProfileMode #cloudStatus{display:none}body.pvProfileMode #profile{padding:0 14px}body.pvProfileMode #pvProfileHead{grid-template-columns:180px minmax(0,1fr);gap:42px;padding:35px 12px}body.pvProfileMode .pvAvatar{width:160px;height:160px}body.pvProfileMode .pvEditButton{max-width:350px}body.pvProfileMode .pvGrid{gap:4px}@media(max-width:600px){body.pvProfileMode main{display:block}body.pvProfileMode #profile{padding:0}body.pvProfileMode #pvProfileHead{grid-template-columns:94px minmax(0,1fr);gap:12px;padding:18px 0}body.pvProfileMode .pvAvatar{width:88px;height:88px}body.pvProfileMode .pvEditButton{max-width:none}}
#profile{width:100%;min-width:0}#profile .pvProfile{background:transparent;border:0;padding:0;overflow:visible}#pvProfileHead{display:grid;grid-template-columns:150px minmax(0,1fr);gap:28px;padding:25px 10px 22px;align-items:center}.pvAvatar{height:138px;width:138px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#895aff,#e86cb3);font-size:50px;font-weight:800;overflow:hidden;border:4px solid #27223a}.pvAvatar img{width:100%;height:100%;object-fit:cover}.pvTopLine{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.pvTopLine h2{margin:0;font-size:24px;overflow-wrap:anywhere}.pvCounts{display:flex;gap:22px;margin:20px 0;flex-wrap:wrap}.pvCounts span{white-space:nowrap}.pvCounts strong{font-size:16px}.pvBio{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0;color:#e7e3f2;font-size:14px;line-height:1.5}.pvDisplay{font-weight:700;margin-top:9px}.pvEditButton{width:100%;margin:16px 0 4px}.pvTabs{display:flex;justify-content:center;gap:8px;border-top:1px solid #353247;margin-top:24px}.pvTabs span{border-top:2px solid #bd91ff;margin-top:-1px;padding:14px 30px;font-weight:700;font-size:12px;letter-spacing:1.5px}.pvGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px}.pvTile{border:0;padding:0;aspect-ratio:1;overflow:hidden;background:#242338;color:#f7f4ff;cursor:pointer}.pvTile img{width:100%;height:100%;object-fit:cover;transition:transform .2s}.pvTile:hover img{transform:scale(1.04)}.pvTextTile{display:grid;place-items:center;padding:12px;text-align:center;overflow-wrap:anywhere;font-size:13px}.pvNoPosts{grid-column:1/-1;text-align:center;padding:60px 10px;color:#bcb7cf}#profileEditor{margin-top:20px!important}#profileEditor[hidden]{display:none}@media(max-width:600px){#pvProfileHead{grid-template-columns:90px minmax(0,1fr);gap:12px;padding:16px 2px}.pvAvatar{width:86px;height:86px;font-size:34px}.pvTopLine h2{font-size:18px}.pvCounts{gap:12px;margin:10px 0;font-size:12px}.pvCounts strong{font-size:13px}.pvBio{font-size:13px}.pvGrid{gap:2px}}`;document.head.append(pvCss);

/* Profile-photo action sheet: direct upload/remove without opening the full editor. */
const pvPhotoSheetStyle=document.createElement('style');
pvPhotoSheetStyle.textContent=[
'#pvPhotoSheet{position:fixed;inset:0;z-index:180;background:#000b;display:grid;place-items:center;padding:16px}',
'#pvPhotoSheet[hidden]{display:none!important}',
'.pvPhotoSheetCard{background:#222329;color:#fff;width:min(430px,100%);border-radius:22px;overflow:hidden;box-shadow:0 28px 90px #000b;border:1px solid #373740}',
'.pvPhotoSheetCard h3{font-size:18px;font-weight:800;text-align:center;padding:25px 16px;margin:0;border-bottom:1px solid #35363c}',
'.pvPhotoOption{width:100%;padding:17px 16px;border:0;border-bottom:1px solid #363740;background:transparent;color:#c69bff;text-align:center;font-size:14px;font-weight:750;cursor:pointer}',
'.pvPhotoOption:hover{background:#302b38}',
'.pvPhotoOption.danger{color:#ff5e85}',
'.pvPhotoOption.cancel{color:#f8f7fa;border-bottom:0;font-weight:500}',
'#pvPhotoSheetStatus{padding:10px 18px;text-align:center;color:#d5bded;font-size:12px;line-height:1.5}',
'#pvAvatar{cursor:pointer}',
'#pvAvatar:focus-visible{outline:3px solid #b98cf9;outline-offset:3px}'
].join('');
document.head.append(pvPhotoSheetStyle);
const pvPhotoSheet=document.createElement('div');pvPhotoSheet.id='pvPhotoSheet';pvPhotoSheet.hidden=true;
const pvPhotoCard=document.createElement('div');pvPhotoCard.className='pvPhotoSheetCard';
pvPhotoCard.innerHTML='<h3>Change Profile Photo</h3><button type="button" class="pvPhotoOption" data-photo-action="upload">Upload Photo</button><button type="button" class="pvPhotoOption danger" data-photo-action="remove">Remove Current Photo</button><button type="button" class="pvPhotoOption cancel" data-photo-action="cancel">Cancel</button><p id="pvPhotoSheetStatus" role="status" hidden></p>';
const pvPhotoFile=document.createElement('input');pvPhotoFile.type='file';pvPhotoFile.accept='image/jpeg,image/png,image/webp';pvPhotoFile.hidden=true;
pvPhotoSheet.append(pvPhotoCard,pvPhotoFile);document.body.append(pvPhotoSheet);
let pvPhotoBusy=false;
function pvClosePhotoSheet(){if(pvPhotoBusy)return;pvPhotoSheet.hidden=true}
pvPhotoSheet.addEventListener('click',e=>{if(e.target===pvPhotoSheet)pvClosePhotoSheet()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pvPhotoSheet.hidden)pvClosePhotoSheet()});
function pvPhotoStatus(message){const status=document.getElementById('pvPhotoSheetStatus');status.hidden=!message;status.textContent=message}
async function pvSaveAvatar(avatar_url){
 if(!user||!profile)return;
 const {data,error}=await db.from('profiles').update({avatar_url}).eq('id',user.id).select().single();
 if(error)throw error;profile=data;
 await updateSocialProfile();
 await refreshStoryAvatars();
}
pvPhotoCard.querySelector('[data-photo-action="upload"]').onclick=()=>{if(!pvPhotoBusy)pvPhotoFile.click()};
pvPhotoCard.querySelector('[data-photo-action="cancel"]').onclick=pvClosePhotoSheet;
pvPhotoCard.querySelector('[data-photo-action="remove"]').onclick=async()=>{
 if(pvPhotoBusy||!user||!profile)return;
 pvPhotoBusy=true;pvPhotoStatus('Removing profile photo…');
 try{await pvSaveAvatar(null);pvPhotoSheet.hidden=true;pvPhotoStatus('')}
 catch(e){pvPhotoStatus('Could not remove photo: '+e.message)}
 finally{pvPhotoBusy=false}
};
pvPhotoFile.onchange=async()=>{
 const file=pvPhotoFile.files?.[0];pvPhotoFile.value='';
 if(!file||pvPhotoBusy||!user||!profile)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){pvPhotoStatus('Choose JPG, PNG or WebP under 5 MB.');return}
 pvPhotoBusy=true;pvPhotoStatus('Uploading profile photo…');
 try{
  const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
  const path=user.id+'/avatar-'+crypto.randomUUID()+'.'+ext;
  const result=await db.storage.from('post-images').upload(path,file,{contentType:file.type});
  if(result.error)throw result.error;
  const url=db.storage.from('post-images').getPublicUrl(path).data.publicUrl;
  await pvSaveAvatar(url);pvPhotoSheet.hidden=true;pvPhotoStatus('');
 }catch(e){pvPhotoStatus('Could not upload photo: '+e.message)}
 finally{pvPhotoBusy=false}
};

const pvPanel=document.querySelector('#profile > .panel');pvPanel.classList.add('pvProfile');
pvPanel.innerHTML='<div id="pvProfileHead"><div class="pvAvatar" id="pvAvatar">P</div><div><div class="pvTopLine"><h2 id="pvUsername">creator</h2><span style="color:#b48bff">✦</span></div><div class="pvCounts"><span><strong id="pvPostCount">0</strong> posts</span><span><strong id="pvReelCount">0</strong> reels</span><span><strong id="pvFollowers">0</strong> followers</span><span><strong id="pvFollowing">0</strong> following</span></div><div id="pvOfficialType" hidden></div><div class="pvDisplay" id="pvDisplayName"></div><div class="pvBio" id="pvBio"></div></div></div><button class="secondary pvEditButton" id="pvEditToggle">Edit profile</button><section id="pvOfficialHub" hidden><div class="pvOfficialEyebrow">PAVORA • OFFICIAL CHANNEL</div><h3>Product updates & announcements</h3><p>The verified source for PAVORA releases, features, tools and community news. Publish updates from this account to reach the Home feed.</p><div class="pvOfficialLinks"><button type="button" id="pvOfficialPublish">＋ Create announcement</button></div></section><div class="pvTabs"><button type="button" class="active" id="pvAllMediaTab">▦ POSTS</button><button type="button" id="pvReelsMediaTab">▣ REELS</button></div><div class="pvGrid" id="pvPostGrid"></div>';

const pvProfileAvatarTrigger=document.getElementById('pvAvatar');
pvProfileAvatarTrigger.setAttribute('role','button');
pvProfileAvatarTrigger.setAttribute('tabindex','0');
pvProfileAvatarTrigger.setAttribute('aria-label','Change profile photo');
pvProfileAvatarTrigger.onclick=()=>{if(!user||!profile)return;pvPhotoStatus('');pvPhotoSheet.hidden=false};
pvProfileAvatarTrigger.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pvProfileAvatarTrigger.click()}};
// These tabs are created by pvPanel.innerHTML above; bind only after they exist.
document.getElementById('pvAllMediaTab').onclick=()=>{pvProfileMediaTab='posts';pvDrawOwnMedia()};
document.getElementById('pvOfficialPublish').onclick=()=>{
 if(!user||!profile?.is_official)return;
 const createButton=document.querySelector('.pvIconRail .pvRailButton[title="Create post"]');
 if(createButton)createButton.click();
 else document.querySelector('#home .composer textarea')?.focus();
};
document.getElementById('pvReelsMediaTab').onclick=()=>{pvProfileMediaTab='reels';pvDrawOwnMedia()};
try{window.PVKit?.addSavedTab?.(pvPanel)}catch(e){console.warn('Saved tab:',e)}
editor.hidden=true;
document.getElementById('pvEditToggle').onclick=()=>{editor.hidden=!editor.hidden;if(!editor.hidden)editor.scrollIntoView({behavior:'smooth',block:'nearest'})};
document.querySelector('[data-view="profile"]').addEventListener('click',()=>{document.body.classList.add('pvProfileMode');if(user)updateSocialProfile()});
document.querySelectorAll('[data-view]:not([data-view="profile"])').forEach(b=>b.addEventListener('click',()=>document.body.classList.remove('pvProfileMode')));


/* Public creator profiles + private one-to-one inbox. Public views never query auth.users. */
const socialStyle=document.createElement('style');
socialStyle.textContent=`
#pvPublicView,#pvInboxView{background:#171827;border:1px solid #303044;border-radius:18px;padding:20px;min-height:330px}
.pvPublicTop{display:flex;gap:22px;align-items:center;flex-wrap:wrap;margin:10px 0 22px}
.pvPublicTop .pvPublicAvatar{width:112px;height:112px;border-radius:50%;object-fit:cover;background:#42315e;display:grid;place-items:center;font-size:40px;flex:none;overflow:hidden}
.pvPublicTop h2{margin:0 0 8px;overflow-wrap:anywhere}
.pvPublicActions{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}
.pvPublicGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px;margin-top:20px}
.pvPublicGrid button{aspect-ratio:1;border:0;background:#26243b;color:white;overflow:hidden;cursor:pointer}
.pvPublicGrid img{width:100%;height:100%;object-fit:cover}
.pvPersonButton{border:0;background:transparent;color:#d7b6ff;text-align:left;padding:0;font-weight:700;cursor:pointer}
.pvInboxLayout{display:grid;grid-template-columns:minmax(140px,35%) minmax(0,1fr);gap:14px}
.pvThreadList{border-right:1px solid #39364c;padding-right:10px}
.pvThreadList button{display:block;width:100%;text-align:left;margin:5px 0;padding:12px;border:0;border-radius:10px;background:#242238;color:#fff}
.pvMessages{min-height:260px;max-height:52vh;overflow:auto;display:flex;flex-direction:column;gap:9px;padding:10px}
.pvBubble{padding:10px 13px;max-width:85%;border-radius:14px;background:#34304a;align-self:flex-start;white-space:pre-wrap;overflow-wrap:anywhere}
.pvBubble.mine{align-self:flex-end;background:#754cc4}
.pvMessageForm{display:flex;gap:8px;margin-top:12px}
.pvMessageForm input{min-width:0;flex:1;background:#10111f;color:#fff;border:1px solid #49435c;border-radius:10px;padding:12px}
.pvSearchInput{width:100%;background:#10111f;color:#fff;border:1px solid #49435c;border-radius:10px;padding:12px;margin:12px 0}
@media(max-width:600px){.pvInboxLayout{grid-template-columns:1fr}.pvThreadList{border-right:0;border-bottom:1px solid #39364c}.pvPublicTop .pvPublicAvatar{width:82px;height:82px}}
`;document.head.append(socialStyle);
const existingMessagesNav=document.querySelector('aside.left [data-view="messages"]');
const socialNav=existingMessagesNav||document.createElement('button');
if(!existingMessagesNav){socialNav.className='nav';socialNav.dataset.view='messages';socialNav.textContent='✉ Messages';document.querySelector('aside.left').insertBefore(socialNav,document.querySelector('[data-view="profile"]'))}
document.querySelectorAll('aside.left [data-view="messages"]').forEach((button,index)=>{if(index>0)button.remove()});
const publicView=node('div','hide');publicView.id='pvPublicView';document.querySelector('.feed').append(publicView);
// Keep only the newer inbox interface; the legacy messages panel is superseded.
messagesView.classList.add('hide');messagesView.style.display='none';
const inboxView=node('div','hide');inboxView.id='pvInboxView';document.querySelector('.feed').append(inboxView);
/* Replace demo story initials with real profile photos from signed-up creators. */
// Single owner for the home stories row: social-suite.js (no duplicate creator/demo redraw).
async function refreshStoryAvatars(){
 if(!user)return;
 const storyBar=document.getElementById('stories');
 if(storyBar&&window.PVKit?.renderStories)await window.PVKit.renderStories(storyBar,{force:true});
}

let selectedPeer=null,chatPoll=null,pvChatPollBusy=false;let pvHiddenChats=new Map();
// Expose only which chat window is open; never expose messages or message contents.
window.PVKit.getActiveChatPeer=()=>user&&selectedPeer&&!document.hidden&&!inboxView.classList.contains('hide')?selectedPeer:null;

const pvDmExtrasCss=document.createElement('style');pvDmExtrasCss.textContent="\n.pvMsgReactionWrap{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:3px 0}\n.pvMsgReactButton{border:0!important;background:transparent!important;color:#b9a9ce!important;padding:3px 6px!important;cursor:pointer;font-size:17px!important;border-radius:999px!important}\n.pvMsgReactButton:hover{background:#524065!important}\n.pvMsgReactionBadge{font-size:13px;padding:4px 8px;border-radius:999px;border:1px solid #594a70;background:#2d2339;color:#fff}\n.pvMsgReactionBadge.mine{border-color:#bf8ef0;background:#503466}\n.pvMsgReactionPalette{display:flex;gap:4px;padding:7px;background:#292332;border:1px solid #625075;border-radius:30px;box-shadow:0 8px 22px #0008}\n.pvMsgReactionPalette[hidden]{display:none!important}\n.pvMsgReactionPalette button{border:0;background:transparent;font-size:20px;cursor:pointer;padding:4px;border-radius:50%}\n.pvMsgReactionPalette button:hover{background:#5a4972}\n.pvDmTypingLabel{font-size:12px;color:#d1adef;min-height:18px;padding:3px 16px 5px}\n.pvDmTypingLabel[hidden]{display:none!important}\n";document.head.append(pvDmExtrasCss);
const pvDmReactionEmoji=['❤️','😂','👍','🔥','😮','😢'];
let pvDmReactionBusy=false,pvDmReactionTimer=null,pvDmReactionRefreshPending=null;
let pvDmTypingLastSent=0,pvDmTypingClearTimer=null,pvDmTypingTimer=null,pvDmTypingLastSeen=0;
function pvRenderTyping(){
 const label=document.querySelector('#pvChatArea .pvDmTypingLabel');
 if(!label)return;
 const active=selectedPeer&&!inboxView.classList.contains('hide')&&pvDmTypingLastSeen>Date.now()-6000;
 label.hidden=!active;
 if(active)label.textContent='● typing…';
}
async function pvCheckTyping(){
 if(!user||!selectedPeer||document.hidden||inboxView.classList.contains('hide'))return;
 const peer=selectedPeer,uid=user.id;
 const {data,error}=await db.from('dm_typing_status').select('updated_at').eq('user_id',peer).eq('peer_id',uid).maybeSingle();
 if(error||selectedPeer!==peer||user?.id!==uid)return;
 pvDmTypingLastSeen=data?new Date(data.updated_at).getTime():0;
 pvRenderTyping();
}
async function pvClearTyping(peerId){
 if(!user||!peerId)return;
 try{await db.from('dm_typing_status').delete().eq('user_id',user.id).eq('peer_id',peerId)}catch(e){}
}
function pvOnChatInput(peer){
 if(!user||!peer||selectedPeer!==peer)return;
 if(Date.now()-pvDmTypingLastSent>2600){
  pvDmTypingLastSent=Date.now();
  db.from('dm_typing_status').upsert({user_id:user.id,peer_id:peer,updated_at:new Date().toISOString()},{onConflict:'user_id,peer_id'})
  .then(({error})=>{if(error)console.warn('Typing update:',error.message)});
 }
 if(pvDmTypingClearTimer)clearTimeout(pvDmTypingClearTimer);
 pvDmTypingClearTimer=setTimeout(()=>{pvDmTypingClearTimer=null;pvClearTyping(peer)},4200);
}
function pvDmDecorateRows(list){
 if(!list||!user)return;
 for(const row of list.querySelectorAll('.pvMessageRow[data-message-id]')){
  const id=row.dataset.messageId;
  if(row.querySelector('.pvMsgReactionWrap'))continue;
  const wrap=node('div','pvMsgReactionWrap');
  const badge=node('span','pvMsgReactionBadge');badge.hidden=true;
  const btn=node('button','pvMsgReactButton','♡');btn.type='button';btn.title='React to message';btn.setAttribute('aria-label','React to message');
  const tray=node('div','pvMsgReactionPalette');tray.hidden=true;
  for(const emoji of pvDmReactionEmoji){
   const item=node('button','',emoji);item.type='button';item.title='React '+emoji;
   item.onclick=async()=>{
    tray.hidden=true;
    if(item.disabled)return;
    const selected=row.dataset.myReaction||null;
    item.disabled=true;
    try{
     const result=selected===emoji?await db.from('message_reactions').delete().eq('message_id',id).eq('user_id',user.id)
      :await db.from('message_reactions').upsert({message_id:id,user_id:user.id,emoji},{onConflict:'message_id,user_id'});
     if(result.error)throw result.error;
     row.dataset.myReaction=selected===emoji?'':emoji;
     pvScheduleDmReactionRefresh(100);
    }catch(error){alert('Reaction could not be saved: '+error.message)}
    finally{item.disabled=false}
   };
   tray.append(item);
  }
  btn.onclick=()=>{for(const existing of document.querySelectorAll('.pvMsgReactionPalette'))if(existing!==tray)existing.hidden=true;tray.hidden=!tray.hidden};
  wrap.append(badge,btn,tray);row.append(wrap);
 }
}
async function pvRefreshDmReactions(){
 if(pvDmReactionBusy||!user||!selectedPeer||document.hidden||inboxView.classList.contains('hide'))return;
 const list=document.querySelector('#pvChatArea .pvMessages');if(!list)return;
 const peer=selectedPeer,uid=user.id;
 const rows=[...list.querySelectorAll('.pvMessageRow[data-message-id]')];if(!rows.length)return;
 pvDmReactionBusy=true;
 try{
  const ids=rows.map(r=>r.dataset.messageId);
  const {data,error}=await db.from('message_reactions').select('message_id,user_id,emoji').in('message_id',ids);
  if(error)throw error;
  if(selectedPeer!==peer||user?.id!==uid||!list.isConnected)return;
  const byMessage=new Map();
  for(const reaction of data||[]){
   if(!byMessage.has(reaction.message_id))byMessage.set(reaction.message_id,[]);
   byMessage.get(reaction.message_id).push(reaction);
  }
  pvDmDecorateRows(list);
  for(const row of rows){
   const reactions=byMessage.get(row.dataset.messageId)||[];
   row.dataset.myReaction=reactions.find(x=>x.user_id===uid)?.emoji||'';
   const badge=row.querySelector('.pvMsgReactionBadge');if(!badge)continue;
   badge.textContent=[...new Set(reactions.map(x=>x.emoji))].map(emoji=>emoji+' '+reactions.filter(r=>r.emoji===emoji).length).join(' ');
   badge.hidden=!reactions.length;
   badge.classList.toggle('mine',reactions.some(x=>x.user_id===uid));
  }
 }catch(e){console.warn('Message reactions refresh:',e.message)}
 finally{pvDmReactionBusy=false}
}
function pvScheduleDmReactionRefresh(delay=150){
 if(pvDmReactionRefreshPending)clearTimeout(pvDmReactionRefreshPending);
 pvDmReactionRefreshPending=setTimeout(()=>{pvDmReactionRefreshPending=null;pvRefreshDmReactions()},delay);
}
function pvStopDmExtras(){
 if(pvDmReactionTimer)clearInterval(pvDmReactionTimer);
 if(pvDmTypingTimer)clearInterval(pvDmTypingTimer);
 if(pvDmTypingClearTimer)clearTimeout(pvDmTypingClearTimer);
 if(pvDmReactionRefreshPending)clearTimeout(pvDmReactionRefreshPending);
 pvDmReactionTimer=pvDmTypingTimer=pvDmTypingClearTimer=pvDmReactionRefreshPending=null;
 pvDmTypingLastSeen=0;
}
function pvStartDmExtras(){
 if(pvDmReactionTimer)return;
 pvDmReactionTimer=setInterval(()=>{if(!document.hidden&&selectedPeer&&!inboxView.classList.contains('hide'))pvRefreshDmReactions()},12000);
 pvDmTypingTimer=setInterval(()=>{if(!document.hidden&&selectedPeer&&!inboxView.classList.contains('hide'))pvCheckTyping()},3500);
}


const pvDmMediaCSS=document.createElement('style');
pvDmMediaCSS.textContent=".pvDmReplyPreview{font-size:11px;color:#e1c7f9;background:#553776;border-left:3px solid #d2a6ff;padding:7px 10px;border-radius:7px;max-width:270px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px}.pvDmAttachment{display:block;max-width:min(260px,67vw);max-height:320px;object-fit:contain;border-radius:11px;margin:7px 0;background:#110e19}.pvDmAttachment.video{width:min(260px,67vw);max-height:300px}.pvDmReplyButton{border:0!important;background:transparent!important;color:#c9b1df!important;font-size:12px!important;padding:4px!important}.pvDmSendPreview{display:flex;align-items:center;gap:8px;padding:9px 12px;margin:6px 0;border-left:3px solid #bc95ea;background:#392747;border-radius:9px;color:#f6eaff;font-size:12px}.pvDmSendPreview strong{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pvDmSendPreview button{border:0!important;background:#57436a!important;color:#fff;border-radius:7px;padding:5px 10px}.pvDmAttachButton{border:0;background:transparent;color:#e0c4ff;font-size:24px;cursor:pointer;padding:5px 10px}.pvDmUploadNote{font-size:11px;color:#b8a9cb}.pvDmMediaError{color:#ffb3ba;font-size:12px}";
document.head.append(pvDmMediaCSS);
const pvDmPickerStyle=document.createElement('style');
pvDmPickerStyle.textContent=`
#pvInboxView .pvDmPicker{display:flex;flex-direction:column;grid-template-columns:none;width:min(328px,calc(100vw - 34px));max-height:min(310px,45dvh);padding:9px;gap:8px;overflow:hidden;bottom:calc(100% + 8px);left:12px;background:#24212c;border:1px solid #48404f;border-radius:17px;box-shadow:0 12px 35px #0009}
#pvInboxView .pvDmPicker[hidden]{display:none!important}
#pvInboxView .pvDmPickerTabs{display:flex;gap:4px}
#pvInboxView .pvDmPickerTabs button{flex:1;min-width:0;font-size:12px;font-weight:700;color:#bbb2c8;padding:8px 4px;border-radius:9px}
#pvInboxView .pvDmPickerTabs button.active{background:#44314f;color:#fff}
#pvInboxView .pvDmPickerGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;overflow-y:auto;min-height:0;max-height:220px}
#pvInboxView .pvDmPickerGrid .pvDmSticker{font-size:20px;min-height:47px;border-radius:11px;background:#34303b}
#pvInboxView .pvDmPickerGrid .pvDmEmoji{font-size:22px;min-height:42px}
#pvInboxView .pvDmPickerGrid .pvDmPickerHint{grid-column:1/-1;color:#d0c5d8;font-size:12px;line-height:1.5;margin:8px 3px}
#pvInboxView .pvDmPickerGrid .pvDmGifChoose{grid-column:1/-1;background:#6845a5;color:#fff;font-weight:750;padding:10px;border-radius:10px;font-size:13px}
#pvInboxView .pvMessageRow{animation:pvDmRowAppear .18s ease-out both}
@keyframes pvDmRowAppear{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){#pvInboxView .pvMessageRow{animation:none}}
`;document.head.append(pvDmPickerStyle);
const pvDmComposerPolish=document.createElement('style');pvDmComposerPolish.textContent="\n/* DM composer: keep previews compact and truly hidden when not needed. */\n#pvInboxView .pvDmSendPreview[hidden],#pvInboxView .pvDmReplyCompose[hidden]{display:none!important}\n#pvInboxView .pvDmSendPreview{box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;min-width:0;min-height:0;margin:0 0 8px;padding:9px 11px;border:1px solid #37313f;border-left:2px solid #aa75ed;border-radius:10px;background:#1b1922;box-shadow:none;color:#f2eaf8;font-size:12px}\n#pvInboxView .pvDmSendPreview strong{display:block;min-width:0;flex:1;font-size:12px;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#pvInboxView .pvDmSendPreview button{display:grid;place-items:center;flex:none;width:25px;height:25px;padding:0!important;border:0!important;border-radius:50%!important;background:#37323e!important;color:#eee!important;font-size:16px;cursor:pointer}\n#pvInboxView .pvDmReplyCompose{background:#191820;border-color:#322b3d;border-left-color:#9369c2}\n#pvInboxView .pvDmSendPreview .pvDmPreviewThumb{display:grid;place-items:center;flex:none;width:35px;height:35px;border-radius:7px;background:#292534;overflow:hidden;font-size:18px}\n#pvInboxView .pvDmSendPreview .pvDmPreviewThumb img{width:100%;height:100%;object-fit:cover}\n#pvInboxView .pvDmPreviewTitle{font-size:10px;color:#ab91c5;font-weight:700;display:block;margin-bottom:2px}\n#pvInboxView .pvDmPreviewText{min-width:0;flex:1}\n#pvInboxView .pvDmPreviewText strong{color:#e5dce9}\n#pvInboxView .pvDmAttachButton{font-size:22px;line-height:1;flex:none;display:grid;place-items:center;width:31px;height:34px;padding:0!important;color:#dbcee8!important}\n@media(max-width:600px){#pvInboxView .pvDmSendPreview{margin-bottom:6px;padding:7px 9px}#pvInboxView .pvChatComposerWrap{padding:6px 10px 12px!important}}\n";document.head.append(pvDmComposerPolish);
function pvDmMessageSummary(message){
 if(!message)return 'Original message unavailable';
 const content=(message.body||'').trim();
 return content.slice(0,120)||(message.media_type?.startsWith('image/')?'📷 Photo':message.media_type?.startsWith('video/')?'🎬 Video':'Message');
}
function pvDmSetReply(id,message){
 const area=document.getElementById('pvChatArea'),form=area?.querySelector('.pvMessageForm');
 if(!form||!message||selectedPeer!==id)return;
 const wrap=area.querySelector('.pvDmReplyCompose');
 if(!wrap)return;
 form.dataset.replyTo=message.id;
 wrap.hidden=false;
 wrap.querySelector('strong').textContent=pvDmMessageSummary(message);
 form.querySelector('input[aria-label="Message"]')?.focus({preventScroll:true});
}

const pvDmInlineMenuCss=document.createElement('style');pvDmInlineMenuCss.textContent=".pvMessageRow{position:relative}.pvDmMoreButton{border:0!important;background:transparent!important;color:#b5a7c3!important;border-radius:50%!important;width:28px;height:28px;flex:none;cursor:pointer;font-weight:900;font-size:20px!important;padding:0!important}.pvDmMoreButton:hover{background:#332c3a!important;color:#fff!important}.pvDmInlineMenu{position:absolute;bottom:calc(100% + 3px);right:0;z-index:65;display:flex;flex-direction:column;min-width:175px;max-width:240px;padding:5px;border:1px solid #4c4159;border-radius:12px;background:#25212c;box-shadow:0 12px 32px #0009}.pvDmInlineMenu button{padding:10px 12px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#fff!important;font-size:12px!important;text-align:left!important;cursor:pointer}.pvDmInlineMenu button:hover{background:#3e324b!important}";document.head.append(pvDmInlineMenuCss);
const pvDmUtilityCss=document.createElement('style');pvDmUtilityCss.textContent="\n.pvDmMenuAction{background:transparent!important;border:0!important;color:#aa9db5!important;font-size:12px!important;padding:4px 5px!important;cursor:pointer}\n.pvDmMenuAction:hover{color:#fff!important}\n.pvDmGalleryOverlay{position:fixed;inset:0;z-index:250;background:#000c;display:grid;place-items:center;padding:15px}\n.pvDmGalleryOverlay[hidden]{display:none!important}\n.pvDmGalleryCard{width:min(520px,100%);max-height:85dvh;display:flex;flex-direction:column;background:#19181e;border:1px solid #3b3545;border-radius:17px;overflow:hidden;box-shadow:0 22px 60px #000b}\n.pvDmGalleryHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:17px 18px;border-bottom:1px solid #302d37}\n.pvDmGalleryHead strong{font-size:16px}\n.pvDmGalleryHead button{border:0;border-radius:50%;width:33px;height:33px;background:#302a36;color:#fff;cursor:pointer}\n.pvDmGalleryGrid{overflow:auto;padding:15px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}\n.pvDmGalleryItem{border:0;background:#282431;aspect-ratio:1;border-radius:8px;overflow:hidden;display:flex;justify-content:center;align-items:center;cursor:pointer;position:relative;padding:0}\n.pvDmGalleryItem img{width:100%;height:100%;object-fit:cover}\n.pvDmGalleryItem video{width:100%;height:100%;object-fit:cover}\n.pvDmGalleryItem .pvDmGalleryPlay{position:absolute;background:#0009;padding:8px;border-radius:50%;color:#fff;font-size:17px}\n.pvDmGalleryEmpty{padding:30px 18px;text-align:center;color:#b9aec9;font-size:13px}\n.pvDmGalleryViewer{display:grid;place-items:center;min-height:200px;max-height:70dvh;padding:12px;background:#100f16}\n.pvDmGalleryViewer img,.pvDmGalleryViewer video{max-width:100%;max-height:65dvh;object-fit:contain}\n.pvDmForwardList{padding:10px 16px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:7px}\n.pvDmForwardPerson{border:1px solid #403847;border-radius:11px;padding:12px 13px;color:#fff;background:#24212c;text-align:left;cursor:pointer;font-weight:650}\n.pvDmForwardPerson:hover{background:#382d47}\n.pvDmForwardStatus{font-size:12px;color:#c4afdb;padding:8px 16px}\n";document.head.append(pvDmUtilityCss);
function pvDmOverlay(title){
 const overlay=node('div','pvDmGalleryOverlay'),card=node('div','pvDmGalleryCard'),head=node('div','pvDmGalleryHead');
 const heading=node('strong','',title),close=node('button','','×');
 close.type='button';close.title='Close';close.onclick=()=>overlay.remove();
 head.append(heading,close);card.append(head);overlay.append(card);overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});
 document.body.append(overlay);return {overlay,card,heading};
}
async function pvShowDmMediaGallery(peer){
 if(!user||!peer)return;
 const uid=user.id,{overlay,card}=pvDmOverlay('Shared photos & videos');
 const grid=node('div','pvDmGalleryGrid');card.append(grid);
 grid.append(node('p','pvDmGalleryEmpty','Loading shared media…'));
 const [{data,error},{data:hiddenData}]=await Promise.all([
  db.from('direct_messages').select('id,media_path,media_type,created_at')
  .or('and(sender_id.eq.'+uid+',recipient_id.eq.'+peer+'),and(sender_id.eq.'+peer+',recipient_id.eq.'+uid+')')
  .not('media_path','is',null).order('created_at',{ascending:false}).limit(90),
  db.from('dm_hidden_messages').select('message_id').eq('user_id',uid)
 ]);
 const hiddenMedia=new Set((hiddenData||[]).map(x=>x.message_id));
 const visibleMedia=(data||[]).filter(item=>!hiddenMedia.has(item.id));
 if(!overlay.isConnected)return;
 grid.replaceChildren();
 if(error){grid.append(node('p','pvDmGalleryEmpty','Unable to load media: '+error.message));return}
 if(!visibleMedia.length){grid.append(node('p','pvDmGalleryEmpty','No photos or videos shared yet.'));return}
 // Signed links expire and are limited to media belonging to this chat.
 for(const m of visibleMedia.slice(0,48)){
  const tile=node('button','pvDmGalleryItem'),isVideo=m.media_type?.startsWith('video/');
  tile.type='button';tile.title=isVideo?'View video':'View photo';tile.append(node('span','',isVideo?'🎬':'▧'));
  grid.append(tile);
  const {data:link,error:linkError}=await db.storage.from('pv-dm-media').createSignedUrl(m.media_path,900);
  if(!overlay.isConnected)return;
  if(linkError||!link?.signedUrl){tile.disabled=true;tile.textContent='Unavailable';continue}
  tile.replaceChildren();
  if(isVideo){tile.append(node('span','pvDmGalleryPlay','▶'))}
  else{const img=node('img');img.alt='Shared photo';img.loading='lazy';img.src=link.signedUrl;tile.append(img)}
  tile.onclick=()=>{
   const current=node('div','pvDmGalleryViewer');
   const media=node(isVideo?'video':'img');
   media.src=link.signedUrl;
   if(isVideo){media.controls=true;media.playsInline=true;media.autoplay=false}
   else media.alt='Shared photo';
   current.append(media);grid.hidden=true;card.append(current);
   const back=node('button','','← All media');back.type='button';back.style.cssText='margin:12px;align-self:start;background:#322739;color:white;border:0;border-radius:9px;padding:10px';
   back.onclick=()=>{media.pause?.();current.remove();back.remove();grid.hidden=false};
   card.append(back);
  };
 }
}
async function pvForwardDmMessage(message,originPeer){
 if(!user||!message)return;
 const sender=user.id,{overlay,card}=pvDmOverlay('Forward message');
 const status=node('p','pvDmForwardStatus','Choose an existing conversation');
 const recipients=node('div','pvDmForwardList');card.append(status,recipients);
 const {data,error}=await db.from('direct_messages').select('sender_id,recipient_id')
 .or('sender_id.eq.'+sender+',recipient_id.eq.'+sender).order('created_at',{ascending:false}).limit(300);
 if(!overlay.isConnected)return;
 if(error){status.textContent='Could not load chats: '+error.message;return}
 const peers=[...new Set((data||[]).map(m=>m.sender_id===sender?m.recipient_id:m.sender_id))].filter(id=>id!==sender);
 if(!peers.length){status.textContent='Start a conversation before forwarding messages.';return}
 const {data:profiles}=await db.from('profiles').select('id,username,display_name').in('id',peers.slice(0,100));
 if(!overlay.isConnected)return;
 const persons=new Map((profiles||[]).map(p=>[p.id,p]));
 for(const peer of peers.slice(0,100)){
  const person=persons.get(peer);if(!person)continue;
  const btn=node('button','pvDmForwardPerson','@'+person.username+(person.display_name?' · '+person.display_name:''));
  btn.onclick=async()=>{
   btn.disabled=true;status.textContent='Forwarding…';
   let copiedPath=null;
   try{
    if(message.media_path){
     // Re-upload under the current sender's folder; never share somebody
     // else's original storage path with a different conversation.
     const downloaded=await db.storage.from('pv-dm-media').download(message.media_path);
     if(downloaded.error)throw downloaded.error;
     const ext=message.media_type==='video/mp4'?'.mp4':message.media_type==='video/webm'?'.webm':message.media_type==='image/png'?'.png':message.media_type==='image/webp'?'.webp':message.media_type==='image/gif'?'.gif':'.jpg';
     copiedPath=sender+'/'+crypto.randomUUID()+ext;
     const upload=await db.storage.from('pv-dm-media').upload(copiedPath,downloaded.data,{contentType:message.media_type});
     if(upload.error)throw upload.error;
    }
    const {error:sendError}=await db.from('direct_messages').insert({
     sender_id:sender,recipient_id:peer,body:message.body||'',
     media_path:copiedPath,media_type:copiedPath?message.media_type:null
    });
    if(sendError)throw sendError;
    status.textContent='✓ Message forwarded';
    setTimeout(()=>overlay.remove(),650);
   }catch(err){
    if(copiedPath)db.storage.from('pv-dm-media').remove([copiedPath]).catch(()=>{});
    status.textContent='Forward failed: '+(err.message||'Please retry');
    btn.disabled=false;
   }
  };
  recipients.append(btn);
 }
}

document.addEventListener('click',e=>{if(!e.target.closest('.pvDmInlineMenu,.pvDmMoreButton'))document.querySelectorAll('.pvDmInlineMenu').forEach(menu=>menu.remove())});

const pvDmLongPressStyle=document.createElement('style');pvDmLongPressStyle.textContent="\n/* Mobile DM interactions: messages remain visually uncluttered until held. */\n#pvInboxView .pvDmMoreButton,#pvInboxView .pvMsgReactButton,#pvInboxView .pvMsgReactionPalette{display:none!important}\n#pvInboxView .pvMsgReactionWrap{padding:0!important;margin:0!important;min-height:0!important;gap:0!important}\n#pvInboxView .pvMsgReactionBadge[hidden]{display:none!important}\n#pvInboxView .pvMessageRow .pvBubble{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:pan-y}\n.pvDmHoldBackdrop{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.58);display:block;touch-action:pan-y}\n.pvDmHoldPanel{position:fixed;z-index:601;width:min(340px,calc(100vw - 28px));max-height:min(72dvh,590px);overflow:auto;box-sizing:border-box;border:1px solid #34333a;border-radius:20px;background:#232428;box-shadow:0 20px 70px #000a;overscroll-behavior:contain}\n.pvDmHoldReact{display:flex;justify-content:space-around;align-items:center;gap:1px;padding:13px 9px;border-bottom:1px solid #39383e}\n.pvDmHoldReact button{flex:1;border:0;background:transparent;color:white;min-width:0;font-size:24px;cursor:pointer;border-radius:10px;padding:7px 2px;line-height:1.2}\n.pvDmHoldReact button:hover,.pvDmHoldReact button:focus-visible{background:#3d3b42}\n.pvDmHoldHint{text-align:center;font-size:10px;letter-spacing:.03em;color:#a9a7b0;margin:9px 4px 0}\n.pvDmHoldMenu{display:flex;flex-direction:column;padding:8px}\n.pvDmHoldMenu button{border:0;background:transparent;color:#f6f5f7;text-align:left;display:flex;align-items:center;gap:13px;font-size:15px;font-weight:520;padding:14px 15px;border-radius:12px;cursor:pointer}\n.pvDmHoldMenu button:hover,.pvDmHoldMenu button:focus-visible{background:#37373d}\n.pvDmHoldMenu button.pvDanger{color:#ff889f}\n.pvDmHoldMenu .pvDmActionSymbol{font-size:21px;line-height:1;width:25px;text-align:center}\n@media (max-width:700px){#pvInboxView .pvMessageRow{gap:0!important}#pvInboxView .pvMessageRow .pvBubble{max-width:min(78vw,400px)}.pvDmHoldPanel{border-radius:19px}}\n";document.head.append(pvDmLongPressStyle);
let pvDmHoldCleanup=()=>{};

const pvDmPinCss=document.createElement('style');pvDmPinCss.textContent="#pvInboxView .pvDmPinnedBar{display:flex;flex:none;align-items:center;gap:10px;padding:10px 14px;background:#1c1924;border-bottom:1px solid #332c3c;color:#e8d8f8;min-height:43px;box-sizing:border-box}\n#pvInboxView .pvDmPinnedBar[hidden]{display:none!important}\n#pvInboxView .pvDmPinnedLink{border:0;background:transparent;color:inherit;flex:1;text-align:left;display:flex;flex-direction:column;gap:3px;min-width:0;cursor:pointer;padding:0}\n#pvInboxView .pvDmPinnedLink strong{font-size:11px;color:#cda1f7}\n#pvInboxView .pvDmPinnedLink span{font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:100%}\n#pvInboxView .pvDmPinnedUnpin{flex:none;border:0;border-radius:50%;background:#32283c;color:#fff;width:27px;height:27px;cursor:pointer}\n#pvInboxView .pvDmPinnedRow>.pvBubble{box-shadow:0 0 0 2px #ac7add!important}\n";document.head.append(pvDmPinCss);
const pvDmPinnedByPeer=new Map();
async function pvDmUnpin(peer){
 if(!user||!peer)return;
 const {error}=await db.from('dm_pinned_messages').delete().eq('user_id',user.id).eq('peer_id',peer);
 if(error){alert('Unable to unpin: '+error.message);return}
 pvDmPinnedByPeer.delete(peer);
 pvDmRenderPinBanner(peer);
}
function pvDmRenderPinBanner(peer,messages){
 const area=document.getElementById('pvChatArea');
 if(!area||selectedPeer!==peer)return;
 const bar=area.querySelector('.pvDmPinnedBar');
 if(!bar)return;
 const pinned=pvDmPinnedByPeer.get(peer);
 if(!pinned){bar.hidden=true;bar.replaceChildren();return}
 const list=area.querySelector('.pvMessages');
 const msg=(messages||[]).find(m=>m.id===pinned.message_id);
 const label=msg?pvDmMessageSummary(msg):pinned.summary||'Pinned message';
 bar.replaceChildren();
 const link=node('button','pvDmPinnedLink');
 link.type='button';link.append(node('strong','','📌 Pinned for you'),node('span','',label));
 link.onclick=()=>{
  const row=[...(list?.querySelectorAll('.pvMessageRow[data-message-id]')||[])].find(x=>x.dataset.messageId===pinned.message_id);
  if(row){row.scrollIntoView({behavior:'smooth',block:'center'});row.classList.add('pvDmPinnedRow');setTimeout(()=>row.classList.remove('pvDmPinnedRow'),1400)}
  else alert('This pinned message is older than the currently loaded messages.');
 };
 const unpin=node('button','pvDmPinnedUnpin','×');
 unpin.type='button';unpin.title='Unpin';unpin.setAttribute('aria-label','Unpin message');
 unpin.onclick=()=>pvDmUnpin(peer);
 bar.append(link,unpin);bar.hidden=false;
}
async function pvDmPinMessage(message,peer){
 if(!user||selectedPeer!==peer)return;
 const {error}=await db.from('dm_pinned_messages').upsert(
 {user_id:user.id,peer_id:peer,message_id:message.id,pinned_at:new Date().toISOString()},
 {onConflict:'user_id,peer_id'});
 if(error){alert('Could not pin message: '+error.message);return}
 pvDmPinnedByPeer.set(peer,{message_id:message.id,summary:pvDmMessageSummary(message)});
 pvDmRenderPinBanner(peer);
}
async function pvDmHideForMe(message,peer,row){
 if(!user||selectedPeer!==peer)return;
 const uid=user.id;
 const {error}=await db.from('dm_hidden_messages').insert({user_id:uid,message_id:message.id});
 if(error&&error.code!=='23505'){alert('Unable to hide message: '+error.message);return}
 row?.remove();
 if(pvDmPinnedByPeer.get(peer)?.message_id===message.id){await pvDmUnpin(peer)}
 pvDmScheduleHiddenRefresh(peer);
}
function pvDmScheduleHiddenRefresh(peer){
 if(selectedPeer!==peer)return;
 // Refresh only when user has explicitly changed hidden/pinned state.
 renderChat(peer,true).catch(e=>console.warn('Hidden message refresh:',e));
}

function pvDmOpenHoldMenu(message,peer,row){
 if(!user||selectedPeer!==peer||!row?.isConnected)return;
 pvDmHoldCleanup();
 const mine=message.sender_id===user.id,uid=user.id;
 const backdrop=node('div','pvDmHoldBackdrop pvDmHoldBackdropV136');
 const panel=node('div','pvDmHoldPanel pvDmHoldPanelV136');
 backdrop.setAttribute('role','presentation');
 panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Message actions');
 panel.setAttribute('aria-modal','true');
 const close=()=>{
  if(backdrop.isConnected)backdrop.remove();
  if(panel.isConnected)panel.remove();
  document.removeEventListener('keydown',onKey);
  if(pvDmHoldCleanup===close)pvDmHoldCleanup=()=>{};
 };
 const onKey=e=>{if(e.key==='Escape')close()};
 document.addEventListener('keydown',onKey);
 pvDmHoldCleanup=close;backdrop.onclick=close;
 const reactions=node('div','pvDmHoldReact pvDmHoldReactV136');
 reactions.setAttribute('aria-label','React to message');
 const palette=['❤️','😂','😮','😢','🩷','👍'];
 for(const emoji of palette){
  const btn=node('button','',emoji);btn.type='button';btn.title='React '+emoji;btn.setAttribute('aria-label','React '+emoji);
  btn.onclick=async()=>{
   close();
   const previous=row.dataset.myReaction||'';
   const payload=previous===emoji
    ?db.from('message_reactions').delete().eq('message_id',message.id).eq('user_id',uid)
    :db.from('message_reactions').upsert({message_id:message.id,user_id:uid,emoji},{onConflict:'message_id,user_id'});
   const {error}=await payload;
   if(error)alert('Could not react: '+error.message);
   else pvScheduleDmReactionRefresh(80);
  };
  reactions.append(btn);
 }
 // Floating visual preview, not another interactive message.
 const preview=node('div','pvDmHoldPreviewV136');
 preview.classList.toggle('mine',mine);
 const bubblePreview=node('span','pvDmHoldBubblePreviewV136',pvDmMessageSummary(message)||'Message');
 preview.append(bubblePreview);
 const card=node('div','pvDmHoldCardV136');
 const meta=node('div','pvDmHoldMetaV136',new Date(message.created_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));
 const choices=node('div','pvDmHoldMenu pvDmHoldMenuV136');
 const moreChoices=node('div','pvDmHoldMoreV136');moreChoices.hidden=true;
 function action(symbol,label,fn,{danger=false,extra=false}={}){
  const button=node('button',danger?'pvDanger':''),symbolNode=node('span','pvDmActionSymbol',symbol);
  button.type='button';button.append(symbolNode,node('span','',label));
  button.onclick=()=>{close();fn()};
  (extra?moreChoices:choices).append(button);
 }
 action('↩','Reply',()=>pvDmSetReply(peer,message));
 if(mine&&message.body&&Date.now()-new Date(message.created_at).getTime()<15*60*1000)
  action('✎','Edit',async()=>{
   const value=prompt('Edit message',message.body);
   if(value===null||value.trim()===message.body.trim())return;
   const {error}=await db.rpc('pv_edit_own_dm',{p_message_id:message.id,p_body:value.trim()});
   if(error){alert('Could not edit: '+error.message);return}
   const bubble=row.querySelector('.pvBubble');
   if(bubble){
    for(const t of [...bubble.childNodes])if(t.nodeType===Node.TEXT_NODE)t.remove();
    bubble.append(document.createTextNode(value.trim()));
   }
   pvScheduleLiveDmRefresh();
  });
 action('⌫','Delete for you',()=>pvDmHideForMe(message,peer,row));
 if(mine)action('↶','Unsend',async()=>{
  if(!confirm('Unsend this message for everyone?'))return;
  const {error}=await db.from('direct_messages').delete().eq('id',message.id).eq('sender_id',uid);
  if(error){alert('Could not unsend: '+error.message);return}
  if(message.media_path)db.storage.from('pv-dm-media').remove([message.media_path]).catch(()=>{});
  row.remove();pvScheduleLiveDmRefresh();
 },{danger:true});
 // Keep the complete original feature set accessible under More.
 action('➤','Forward',()=>pvForwardDmMessage(message,peer),{extra:true});
 if(message.body)action('▢','Copy',()=>{
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(message.body).catch(()=>prompt('Copy message',message.body));
  else prompt('Copy message',message.body);
 },{extra:true});
 action('⌖',pvDmPinnedByPeer.get(peer)?.message_id===message.id?'Unpin':'Pin for me',()=>{
  if(pvDmPinnedByPeer.get(peer)?.message_id===message.id)pvDmUnpin(peer);
  else pvDmPinMessage(message,peer);
 },{extra:true});
 const more=node('button','pvDmHoldMoreToggleV136');
 more.type='button';more.setAttribute('aria-expanded','false');
 more.append(node('span','pvDmActionSymbol','···'),node('span','','More'),node('span','pvDmHoldChevronV136','›'));
 more.onclick=()=>{
  const expanded=more.getAttribute('aria-expanded')==='true';
  more.setAttribute('aria-expanded',String(!expanded));
  moreChoices.hidden=expanded;
  more.querySelector('.pvDmHoldChevronV136').textContent=expanded?'›':'⌄';
  position();
 };
 choices.append(more,moreChoices);
 card.append(meta,choices);
 panel.append(reactions,preview,card);
 document.body.append(backdrop,panel);
 function position(){
  if(!panel.isConnected)return;
  // Vertical positioning follows the selected bubble, clamped to the visible viewport.
  const bounds=row.querySelector('.pvBubble')?.getBoundingClientRect()||row.getBoundingClientRect();
  const vv=window.visualViewport;
  const screenTop=vv?.offsetTop||0,screenHeight=vv?.height||window.innerHeight;
  const panelWidth=panel.offsetWidth,margin=12;
  const screenBottom=screenTop+screenHeight;
  const height=panel.getBoundingClientRect().height;
  const preferred=bounds.top-height-12;
  let top=preferred>=screenTop+margin?preferred:bounds.bottom+12;
  if(top+height>screenBottom-margin)top=Math.max(screenTop+margin,screenBottom-height-margin);
  const left=Math.max(margin,Math.min(window.innerWidth-panelWidth-margin,
   mine?bounds.right-panelWidth:bounds.left));
  panel.style.left=left+'px';panel.style.top=top+'px';
 }
 position();
}
function pvDmAttachHoldGesture(row,msg,peer){
 if(row.dataset.pvHoldAttached)return;
 row.dataset.pvHoldAttached='1';
 const bubble=row.querySelector('.pvBubble');if(!bubble)return;
 let handle=null,startX=0,startY=0,opened=false;
 const cancel=()=>{if(handle){clearTimeout(handle);handle=null}};
 bubble.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('button,video,a'))return;
  cancel();opened=false;startX=event.clientX;startY=event.clientY;
  handle=setTimeout(()=>{handle=null;opened=true;try{navigator.vibrate?.(10)}catch(e){};pvDmOpenHoldMenu(msg,peer,row)},430);
 });
 bubble.addEventListener('pointermove',event=>{if(Math.abs(event.clientX-startX)>12||Math.abs(event.clientY-startY)>12)cancel()});
 for(const event of ['pointerup','pointercancel','pointerleave'])bubble.addEventListener(event,cancel);
 bubble.addEventListener('contextmenu',event=>{event.preventDefault();cancel();if(!opened)pvDmOpenHoldMenu(msg,peer,row)});
}

function pvDmDecorateContent(list,messages,peer){
 if(!list||!user||selectedPeer!==peer)return;
 const byId=new Map((messages||[]).map(x=>[String(x.id),x]));
 for(const row of list.querySelectorAll('.pvMessageRow[data-message-id]')){
  const msg=byId.get(row.dataset.messageId);
  if(!msg)continue;
  row.querySelectorAll('.pvDmReplyButton,.pvDmForwardButton,.pvDeleteMessage,.pvDmMoreButton,.pvDmInlineMenu').forEach(b=>b.remove());
  pvDmAttachHoldGesture(row,msg,peer);
  if(msg.reply_to&&!row.querySelector('.pvDmReplyPreview')){
   const preview=node('div','pvDmReplyPreview',pvDmMessageSummary(byId.get(String(msg.reply_to))));
   preview.title='Reply to original message';
   const bubble=row.querySelector('.pvBubble');
   if(bubble)bubble.prepend(preview);
  }
  if(msg.media_path&&!row.querySelector('.pvDmAttachment')&&!row.querySelector('.pvDmMediaError')){
   const bubble=row.querySelector('.pvBubble');if(!bubble)continue;
   const isVideo=msg.media_type?.startsWith('video/');
   const media=node(isVideo?'video':'img','pvDmAttachment'+(isVideo?' video':''));
   if(isVideo){media.controls=true;media.playsInline=true;media.preload='none'}
   else {media.loading='lazy';media.alt='Shared photo'}
// Reserve a stable media slot before signed URLs return to avoid chat jumping.
media.style.width='min(260px,67vw)';
media.style.height=isVideo?'195px':'195px';
media.style.maxHeight='195px';
media.style.objectFit='contain';
   bubble.append(media);
   db.storage.from('pv-dm-media').createSignedUrl(msg.media_path,1800).then(({data,error})=>{
    if(!media.isConnected||selectedPeer!==peer)return;
    if(error||!data?.signedUrl){media.replaceWith(node('span','pvDmMediaError','Media unavailable'));return}
    media.src=data.signedUrl;
   }).catch(()=>{if(media.isConnected)media.replaceWith(node('span','pvDmMediaError','Media unavailable'))});
  }
 }
}

let pvDmRealtimeChannel=null,pvDmRealtimeUser=null,pvDmRealtimeStatus='offline',pvDmRealtimeRefreshTimer=null;
function pvStopDmRealtime(){
 if(pvDmRealtimeRefreshTimer){clearTimeout(pvDmRealtimeRefreshTimer);pvDmRealtimeRefreshTimer=null}
 if(pvDmRealtimeChannel){const old=pvDmRealtimeChannel;pvDmRealtimeChannel=null;try{db.removeChannel(old).catch(()=>{})}catch(e){console.warn('Realtime cleanup:',e)}}
 pvDmRealtimeUser=null;pvDmRealtimeStatus='offline';pvStopDmExtras();
}
function pvDmUpdateReceipt(list,messages){
 if(!list)return;
 const rows=[...list.querySelectorAll('.pvMessageRow.mine[data-message-id]')];
 for(const row of rows)row.querySelector('.pvDmDelivery')?.remove();
 const last=rows[rows.length-1];if(!last)return;
 const message=(messages||[]).find(m=>String(m.id)===last.dataset.messageId);
 const status=node('span','pvDmDelivery',message?.read_at?'Seen':'Sent');
 status.setAttribute('aria-label',message?.read_at?'Message seen':'Message sent');
 last.append(status);
}
function pvScheduleLiveDmRefresh(){
 if(pvDmRealtimeRefreshTimer||!user)return;
 pvDmRealtimeRefreshTimer=setTimeout(()=>{
  pvDmRealtimeRefreshTimer=null;
  if(!user||document.hidden)return;
  if(selectedPeer&&!inboxView.classList.contains('hide'))
   renderChat(selectedPeer,true).catch(e=>console.warn('Live chat refresh:',e));
  pvCheckUnread().catch(e=>console.warn('Live unread refresh:',e));
 },100);
}
function pvStartDmRealtime(){
 if(!user||!db.channel||pvDmRealtimeUser===user.id)return;
 pvStopDmRealtime();
 const uid=user.id;
 pvDmRealtimeUser=uid;
 const channel=db.channel('pavora-dm-'+uid);
 const onChange=payload=>{
  if(!user||user.id!==uid)return;
  pvScheduleLiveDmRefresh();
 };
 channel.on('postgres_changes',{event:'INSERT',schema:'public',table:'direct_messages',filter:'recipient_id=eq.'+uid},onChange);
 channel.on('postgres_changes',{event:'INSERT',schema:'public',table:'direct_messages',filter:'sender_id=eq.'+uid},onChange);
 channel.on('postgres_changes',{event:'UPDATE',schema:'public',table:'direct_messages',filter:'sender_id=eq.'+uid},onChange);
 channel.on('postgres_changes',{event:'DELETE',schema:'public',table:'direct_messages',filter:'recipient_id=eq.'+uid},onChange);
 for(const event of ['INSERT','UPDATE','DELETE'])channel.on('postgres_changes',{event,schema:'public',table:'message_reactions'},()=>{if(user?.id===uid)pvScheduleDmReactionRefresh()});
 for(const event of ['INSERT','UPDATE','DELETE'])channel.on('postgres_changes',{event,schema:'public',table:'dm_typing_status',filter:'peer_id=eq.'+uid},()=>{if(user?.id===uid)pvCheckTyping()});
 channel.subscribe(status=>{
  if(pvDmRealtimeUser!==uid)return;
  pvDmRealtimeStatus=status==='SUBSCRIBED'?'live':'offline';
  const label=document.querySelector('#pvChatArea .pvDmRealtimeLabel');
  if(label){label.textContent=pvDmRealtimeStatus==='live'?'Live':'Syncing';label.title=pvDmRealtimeStatus==='live'?'Messages update in real time':'Message polling is active'}
  if(status==='SUBSCRIBED')pvScheduleLiveDmRefresh();
 });
 pvDmRealtimeChannel=channel;pvStartDmExtras();
}

const pvNotifyStyle=document.createElement('style');pvNotifyStyle.textContent=`.pvThreadEntry{display:flex;align-items:center;gap:5px;margin:5px 0}.pvThreadEntry>button:first-child{flex:1;min-width:0}.pvThreadEntry .pvRemoveChat{width:35px;flex:none;justify-content:center!important;padding:9px!important;color:#ff9cae;background:#342637!important}.pvThreadEntry .pvRemoveChat:hover{background:#603047!important}.pvMessageRow{display:flex;align-items:center;gap:7px;max-width:100%;align-self:flex-start}.pvMessageRow.mine{align-self:flex-end;flex-direction:row-reverse}.pvMessageRow .pvBubble{max-width:min(80vw,450px)}.pvDeleteMessage{border:0;background:transparent;color:#c8b7db;font-size:12px;padding:7px;cursor:pointer;border-radius:8px}.pvDeleteMessage:hover{color:#ff9cae;background:#3c2b41}.pvUnreadBadge{display:inline-flex;align-items:center;justify-content:center;background:#f04478;color:white;border-radius:999px;font-size:11px;font-weight:800;padding:2px 7px;margin-left:8px;min-width:20px}.pvUnreadBadge[hidden]{display:none!important}.pvThreadList button{display:flex!important;align-items:center;justify-content:space-between;gap:8px}`;document.head.append(pvNotifyStyle);
const pvNavBadge=node('span','pvUnreadBadge');pvNavBadge.hidden=true;socialNav.append(pvNavBadge);
let pvUnreadTimer=null,pvLastNotified=null,pvUnreadInitialized=false,pvSoundContext=null,pvUnreadBusy=false,pvUnreadAvailable=true,pvRailBadge=null,pvUnreadCount=0,pvLastNoticeId=null,pvIncomingBaseline=null;
async function pvPlayMessageSound(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;pvSoundContext=pvSoundContext||new C();if(pvSoundContext.state!=='running'){await pvSoundContext.resume();if(pvSoundContext.state!=='running')return false}const now=pvSoundContext.currentTime;for(const [offset,freq] of [[0,740],[.19,1040]]){const osc=pvSoundContext.createOscillator(),gain=pvSoundContext.createGain(),at=now+offset;osc.type='sine';osc.frequency.setValueAtTime(freq,at);osc.frequency.exponentialRampToValueAtTime(freq*1.18,at+.15);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.24,at+.018);gain.gain.exponentialRampToValueAtTime(.0001,at+.31);osc.connect(gain);gain.connect(pvSoundContext.destination);osc.start(at);osc.stop(at+.32)}return true}catch(e){console.warn('Notification audio unavailable',e);return false}}
document.addEventListener('pointerdown',()=>{try{if(!pvSoundContext){const C=window.AudioContext||window.webkitAudioContext;if(C)pvSoundContext=new C()}if(pvSoundContext?.state==='suspended')pvSoundContext.resume().catch(()=>{})}catch(e){}},{passive:true});
// Publishing confirmation is shown only after Supabase confirms insertion.
const pvUploadToast=node('div','pvUploadToast');pvUploadToast.hidden=true;pvUploadToast.setAttribute('role','status');pvUploadToast.setAttribute('aria-live','polite');document.body.append(pvUploadToast);
let pvUploadToastTimeout=null;
function pvShowUploadToast(kind,showUploaded){if(pvUploadToastTimeout)clearTimeout(pvUploadToastTimeout);pvUploadToast.replaceChildren();const mark=node('span','pvUploadToastMark','✓'),content=node('span','pvUploadToastText'),headline=node('strong','',kind==='reel'?'Reel uploaded successfully!':'Post uploaded successfully!'),sub=node('small','','Your '+(kind==='reel'?'video':'photo')+' is now live on PAVORA.');content.append(headline,sub);const view=node('button','pvUploadToastView','View');view.type='button';view.onclick=()=>{pvUploadToast.hidden=true;showUploaded()};const close=node('button','pvUploadToastClose','×');close.type='button';close.setAttribute('aria-label','Dismiss');close.onclick=()=>{pvUploadToast.hidden=true};pvUploadToast.append(mark,content,view,close);pvUploadToast.hidden=false;pvUploadToastTimeout=setTimeout(()=>{pvUploadToast.hidden=true},6500)}
function pvFocusPublished(kind,id){pvNavigate(kind==='reel'?'reels':'home');const element=document.getElementById((kind==='reel'?'reel-':'pv-post-')+id);if(element){element.scrollIntoView({behavior:'smooth',block:'center'});if(kind==='post')element.classList.add('pvNewlyPublished');setTimeout(()=>element.classList.remove('pvNewlyPublished'),4500)}}
const pvNotice=node('div','pvMessageToast');pvNotice.setAttribute('role','status');pvNotice.setAttribute('aria-live','polite');pvNotice.hidden=true;document.body.append(pvNotice);
let pvNoticeTimeout=null;
function pvShowMessageToast(sender){if(pvNoticeTimeout)clearTimeout(pvNoticeTimeout);pvNotice.replaceChildren();pvNotice.append(node('span','','✉ New message'));const from=node('span','',sender?' · @'+sender:'');pvNotice.append(from);pvNotice.hidden=false;pvNotice.onclick=()=>{pvNavigate('messages');pvNotice.hidden=true};pvNoticeTimeout=setTimeout(()=>{pvNotice.hidden=true},4200)}
function pvSetUnreadBadge(count){pvUnreadCount=count;const label=count>99?'99+':String(count);for(const badge of [pvNavBadge,pvRailBadge]){if(!badge)continue;badge.hidden=count===0;badge.textContent=label;badge.title=count+' unread messages'}const button=document.querySelector('.pvIconRail [data-rail-view="messages"]');if(button)button.setAttribute('aria-label',count?'Messages, '+count+' unread':'Messages');}
// Per-account hidden chat state; keep these helpers separate from notification logic.
async function pvLoadHiddenChats(){if(!user)return;const {data,error}=await db.from('hidden_conversations').select('peer_id,hidden_at').eq('owner_id',user.id);if(error){console.warn('Hidden chats not configured:',error.message);pvHiddenChats=new Map();return}pvHiddenChats=new Map((data||[]).map(x=>[x.peer_id,x.hidden_at]))}
function pvIsHiddenMessage(m){const peer=m.sender_id===user.id?m.recipient_id:m.sender_id;const cutoff=pvHiddenChats.get(peer);return !!(cutoff&&new Date(m.created_at)<=new Date(cutoff))}
async function pvRemoveChat(peer){if(!user||!confirm('Remove this conversation from your inbox? Messages will remain available to the other person.'))return;const hidden_at=new Date().toISOString();const {error}=await db.from('hidden_conversations').upsert({owner_id:user.id,peer_id:peer,hidden_at},{onConflict:'owner_id,peer_id'});if(error){alert('Could not remove chat. '+error.message);return}pvHiddenChats.set(peer,hidden_at);if(selectedPeer===peer){selectedPeer=null;if(chatPoll){clearInterval(chatPoll);chatPoll=null}}await loadInbox();await pvCheckUnread()}
async function pvCheckUnread(initial=false){if(!user||pvUnreadBusy||!pvUnreadAvailable)return;pvUnreadBusy=true;try{const {data,error}=await db.from('direct_messages').select('id,sender_id,recipient_id,created_at').eq('recipient_id',user.id).is('read_at',null).order('created_at',{ascending:false}).limit(500);
if(error){console.warn('Unread messages query failed:',error.message);if(/read_at|column|schema cache/i.test(error.message)){pvUnreadAvailable=false;pvNavBadge.title='Run supabase/message-notifications.sql in Supabase'}return}
const visible=(data||[]).filter(m=>!pvIsHiddenMessage(m));
pvSetUnreadBadge(visible.length);
// Check incoming messages independently of read_at: an open chat may mark a new
// message read before this unread poll sees it.
const {data:incoming,error:incomingError}=await db.from('direct_messages').select('id,sender_id,created_at').eq('recipient_id',user.id).order('created_at',{ascending:false}).limit(1);
if(!incomingError){const newest=incoming?.[0]||null;if(pvIncomingBaseline===null||initial){pvIncomingBaseline=newest?{id:newest.id,created_at:newest.created_at}:{id:null,created_at:null}}else if(newest&&newest.id!==pvIncomingBaseline.id){const newer=!pvIncomingBaseline.created_at||new Date(newest.created_at)>new Date(pvIncomingBaseline.created_at);pvIncomingBaseline={id:newest.id,created_at:newest.created_at};if(newer&&(!pvHiddenChats.has(newest.sender_id)||!pvIsHiddenMessage({...newest,recipient_id:user.id}))&&!pvConversationSetting(newest.sender_id).muted){pvPlayMessageSound();pvShowMessageToast('')}}}

const latest=visible[0]?.id||null;
pvLastNotified=latest;pvUnreadInitialized=true;
if(!inboxView.classList.contains('hide')){inboxView.querySelectorAll('[data-peer-id]').forEach(b=>{const n=visible.filter(m=>m.sender_id===b.dataset.peerId).length;let badge=b.querySelector('.pvUnreadBadge');if(!badge){badge=node('span','pvUnreadBadge');b.append(badge)}badge.hidden=!n;badge.textContent=n>99?'99+':String(n)});const tabs=inboxView.querySelectorAll('.pvInboxTabs button');if(tabs.length===3){const requestIdSet=new Set();const {data:requests}=await db.from('message_requests').select('sender_id').eq('recipient_id',user.id).is('accepted_at',null);for(const x of requests||[])requestIdSet.add(x.sender_id);const reqCount=visible.filter(m=>requestIdSet.has(m.sender_id)).length;if(reqCount)tabs[2].textContent='Requests ('+reqCount+')'}}
}catch(e){console.warn('Unread check failed',e)}finally{pvUnreadBusy=false}}
async function pvMarkRead(id){if(!user||!pvUnreadAvailable||document.hidden)return;const {error}=await db.from('direct_messages').update({read_at:new Date().toISOString()}).eq('recipient_id',user.id).eq('sender_id',id).is('read_at',null);if(error)console.warn('Mark read failed',error.message);else await pvCheckUnread()}

// Remember each account's current section across a page refresh in the same tab.
let pvRestoredForUser=null;
function pvRouteKey(){return user?'pavora-route:'+user.id:null}
function pvRememberView(view,creatorId){const key=pvRouteKey();if(!key)return;try{const previous=JSON.parse(sessionStorage.getItem(key)||'{}');const next={...previous,view};if(creatorId)next.creatorId=creatorId;if(view!=='creator')delete next.creatorId;if(view==='messages'){next.tab=pvInboxTab;next.peer=selectedPeer||null}else{delete next.peer}sessionStorage.setItem(key,JSON.stringify(next))}catch(e){console.warn('Could not save current page',e)}}
function pvRememberInboxPosition(){pvRememberView('messages')}
async function pvRestoreView(){const key=pvRouteKey();if(!key||pvRestoredForUser===user.id)return;pvRestoredForUser=user.id;let saved=null;try{saved=JSON.parse(sessionStorage.getItem(key)||'null')}catch(e){}if(!saved||!['home','reels','explore','profile','messages','creator'].includes(saved.view))return;
if(saved.view==='creator'&&saved.creatorId){openCreator(saved.creatorId).catch(e=>console.warn('Creator profile restore:',e));return}
if(saved.view==='messages'){pvInboxTab=['Primary','General','Requests'].includes(saved.tab)?saved.tab:'Primary';selectedPeer=typeof saved.peer==='string'&&/^[0-9a-f-]{36}$/i.test(saved.peer)?saved.peer:null;pvNavigate('messages');if(selectedPeer&&!chatPoll)chatPoll=setInterval(()=>{if(!inboxView.classList.contains('hide')&&selectedPeer)renderChat(selectedPeer,true)},2500);return}
pvNavigate(saved.view);if(saved.view==='profile')updateSocialProfile().catch(e=>console.warn('Profile restore:',e))}
function pvSyncDesktopChatHeight(){
 if(!document.body.classList.contains('pvMessagesMode')||window.innerWidth<=700)return;
 const main=document.querySelector('main'),view=document.getElementById('pvInboxView');
 if(!main||!view)return;
 const mainTop=Math.max(0,main.getBoundingClientRect().top);
 const viewTop=Math.max(0,view.getBoundingClientRect().top);
 document.body.style.setProperty('--pvMsgMainTop',mainTop+'px');
 document.body.style.setProperty('--pvMsgViewTop',viewTop+'px');
}
window.addEventListener('resize',()=>{if(document.body.classList.contains('pvMessagesMode'))requestAnimationFrame(pvSyncDesktopChatHeight)},{passive:true});
/* Keep the installed Android PWA DM within the visible viewport when the keyboard opens. */
function pvSyncMobileDmViewport(){
 const root=document.documentElement;
 if(window.innerWidth>700){
  root.style.removeProperty('--pvDmViewportHeight');
  root.style.removeProperty('--pvDmViewportTop');
  document.body.classList.remove('pvDmKeyboardOpen');
  return;
 }
 const viewport=window.visualViewport;
 const height=viewport?.height||window.innerHeight;
 const top=viewport?.offsetTop||0;
 if(Number.isFinite(height)&&height>200){
  root.style.setProperty('--pvDmViewportHeight',Math.round(height)+'px');
  root.style.setProperty('--pvDmViewportTop',Math.round(Math.max(0,top))+'px');
 }
 const focused=document.activeElement?.matches?.('#pvInboxView .pvMessageForm input');
 const keyboardVisible=!!focused && !!viewport && viewport.height<window.innerHeight-110;
 document.body.classList.toggle('pvDmKeyboardOpen',keyboardVisible);
}
let pvMobileViewportPending=false;
function pvScheduleMobileDmViewport(){
 if(pvMobileViewportPending)return;
 pvMobileViewportPending=true;
 requestAnimationFrame(()=>{pvMobileViewportPending=false;pvSyncMobileDmViewport()});
}
window.visualViewport?.addEventListener('resize',pvScheduleMobileDmViewport,{passive:true});
window.visualViewport?.addEventListener('scroll',pvScheduleMobileDmViewport,{passive:true});
window.addEventListener('resize',pvScheduleMobileDmViewport,{passive:true});
document.addEventListener('focusin',e=>{if(e.target.matches?.('#pvInboxView .pvMessageForm input'))pvScheduleMobileDmViewport()});
document.addEventListener('focusout',e=>{if(e.target.matches?.('#pvInboxView .pvMessageForm input'))pvScheduleMobileDmViewport()});
pvSyncMobileDmViewport();
// In-app navigation trail for iPhone's left-edge Back gesture. Do not
// manipulate browser history or interfere with native media swipes.
let pvEdgeNavCurrent='home',pvEdgeNavTrail=[],pvEdgeGoingBack=false;
function pvNavigate(view){
 if(view!==pvEdgeNavCurrent){
  if(!pvEdgeGoingBack)pvEdgeNavTrail.push(pvEdgeNavCurrent);
  if(pvEdgeNavTrail.length>20)pvEdgeNavTrail.shift();
  pvEdgeNavCurrent=view;
 }
if(view!=='reels')pvPauseAllReels();pvVirtualView.classList.add('hide');pvActiveVirtual=null;pvCloseVirtualChat();pvRememberView(view);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));['home','reels','explore','profile','messages','creator'].forEach(v=>{const el=v==='messages'?inboxView:v==='creator'?publicView:document.getElementById(v);if(el)el.classList.toggle('hide',v!==view)});document.body.classList.toggle('pvProfileMode',view==='profile');document.body.classList.toggle('pvMessagesMode',view==='messages');document.body.classList.toggle('pvExploreMode',view==='explore');document.body.classList.toggle('pvReelsMode',view==='reels');try{window.PVKit?.onNavigate?.(view)}catch(e){console.warn('Feature navigation:',e)}if(view==='messages'){loadInbox();requestAnimationFrame(pvSyncDesktopChatHeight)}else{pvDmTypingLastSeen=0;pvClearTyping(selectedPeer)}if(view==='reels'){requestAnimationFrame(pvFitReelsViewport);loadReels()}if(view==='explore')pvLoadExplore();if(view!=='messages'&&chatPoll){clearInterval(chatPoll);chatPoll=null}}
window.PAVORA_EDGE_BACK=()=>{
 if(!user)return false;
 const focused=document.activeElement;
 if(focused?.matches?.('input,textarea,[contenteditable="true"]')&&
  document.body.classList.contains('pvDmKeyboardOpen')){
  focused.blur();return true;
 }
 if(!pvSettingsScreen.hidden){pvCloseSettings();return true}
 if(!pvVirtualChat.hidden){pvCloseVirtualChat();return true}
 if(!pvVirtualView.classList.contains('hide')){pvVirtualView.classList.add('hide');return true}
 if(pvEdgeNavCurrent==='messages'&&selectedPeer){
  pvInboxMobileBack();return true;
 }
 if(pvEdgeNavTrail.length){
  const previous=pvEdgeNavTrail.pop();
  if(previous&&previous!==pvEdgeNavCurrent){
   pvEdgeGoingBack=true;
   try{pvNavigate(previous)}finally{pvEdgeGoingBack=false}
   return true;
  }
 }
 if(pvEdgeNavCurrent!=='home'){
  pvEdgeGoingBack=true;
  try{pvNavigate('home')}finally{pvEdgeGoingBack=false}
  return true;
 }
 return false;
};
// Legacy demo's button.onclick only hides/shows HTML. Connect each section
// to the real cloud navigation so desktop rail opens Reels Mode + autoplay.
document.querySelectorAll('aside.left [data-view="home"],aside.left [data-view="reels"],aside.left [data-view="profile"]').forEach(button=>{
 button.addEventListener('click',()=>pvNavigate(button.dataset.view));
});
socialNav.addEventListener('click',()=>pvNavigate('messages'));
document.querySelectorAll('[data-view="explore"]').forEach(btn=>btn.addEventListener('click',()=>pvNavigate('explore')));
document.querySelectorAll('[data-view]:not([data-view="explore"])').forEach(btn=>btn.addEventListener('click',()=>document.body.classList.remove('pvExploreMode')));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(b!==socialNav){publicView.classList.add('hide');inboxView.classList.add('hide');if(chatPoll){clearInterval(chatPoll);chatPoll=null}}}));
/* Public followers/following lists: only public profile details are displayed.
   Queries respect existing Supabase RLS and use pages to avoid heavy fetches. */
const pvConnectionsStyle=document.createElement('style');
pvConnectionsStyle.textContent=`
#pvConnectionsDialog{position:fixed;inset:0;z-index:150;background:#000b;display:flex;align-items:center;justify-content:center;padding:14px}
#pvConnectionsDialog[hidden]{display:none!important}
.pvConnectionsCard{width:min(460px,100%);max-height:min(78dvh,730px);display:flex;flex-direction:column;background:#181625;border:1px solid #423651;border-radius:18px;overflow:hidden;box-shadow:0 22px 90px #0009}
.pvConnectionsHeader{display:flex;align-items:center;gap:12px;justify-content:space-between;padding:17px 18px;border-bottom:1px solid #383146}
.pvConnectionsHeader h3{margin:0;font-size:17px}
.pvConnectionsClose{border:0;background:#30283c;color:#fff;font-size:22px;line-height:1;border-radius:8px;width:33px;height:33px;cursor:pointer}
.pvConnectionsPeople{overflow:auto;padding:8px 10px 14px}
.pvConnectionPerson{display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;color:#fff;border-radius:11px;text-align:left;padding:10px;cursor:pointer}
.pvConnectionPerson:hover{background:#292338}
.pvConnectionAvatar{width:45px;height:45px;flex:none;border-radius:50%;background:linear-gradient(135deg,#6546bf,#d466ae);display:grid;place-items:center;font-weight:800;overflow:hidden}
.pvConnectionAvatar img{width:100%;height:100%;object-fit:cover}
.pvConnectionText{min-width:0;display:flex;flex-direction:column;gap:3px}
.pvConnectionText strong{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pvConnectionText small{font-size:12px;color:#bbb3cb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pvConnectionNotice{padding:18px;color:#c7bdd5;text-align:center;font-size:13px}
.pvConnectionsMore{align-self:center;border:1px solid #624e87;border-radius:10px;padding:10px 18px;margin:8px 0 16px;background:#322643;color:#fff;font-weight:700;cursor:pointer}
.pvCounts .pvConnectionCount,#pvPublicView .pvConnectionCount{border:0;background:transparent;color:inherit;font:inherit;padding:0;cursor:pointer;text-align:left}
.pvCounts .pvConnectionCount:hover,#pvPublicView .pvConnectionCount:hover{text-decoration:underline;text-underline-offset:3px}
.pvCounts .pvConnectionCount:focus-visible,#pvPublicView .pvConnectionCount:focus-visible{outline:2px solid #c19cff;border-radius:4px;outline-offset:4px}
`;
document.head.append(pvConnectionsStyle);
const pvConnectionsDialog=node('div');pvConnectionsDialog.id='pvConnectionsDialog';pvConnectionsDialog.hidden=true;
pvConnectionsDialog.setAttribute('role','dialog');pvConnectionsDialog.setAttribute('aria-modal','true');
pvConnectionsDialog.setAttribute('aria-label','Followers and following');
document.body.append(pvConnectionsDialog);
let pvConnectionsRequest=0;
let pvConnectionsCloseTimer=0;
let pvConnectionsSwipe=null;
let pvConnectionsPopRaf=0;
function pvConnectionsPopOpen(card,request){
 cancelAnimationFrame(pvConnectionsPopRaf);
 if(!card||!card.isConnected)return;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce)return;
 const duration=560,start=performance.now();
 // Inline important overrides old !important scale rules; the actual visible
 // optical pop must not depend on Safari's transition scheduling.
 card.style.setProperty('transition','none','important');
 const smooth=t=>t*t*(3-2*t);
 function tick(now){
  if(request!==pvConnectionsRequest||!card.isConnected||pvConnectionsDialog.hidden){
   card.style.removeProperty('transform');card.style.removeProperty('transition');return;
  }
  const t=Math.min(1,(now-start)/duration);
  let scale,lift;
  if(t<.48){const p=smooth(t/.48);scale=.76+.30*p;lift=31*(1-p)}
  else if(t<.75){const p=smooth((t-.48)/.27);scale=1.06-.075*p;lift=-6*(1-p)}
  else{const p=smooth((t-.75)/.25);scale=.985+.015*p;lift=2*(1-p)}
  card.style.setProperty('transform',
   'translate3d(0,'+lift.toFixed(2)+'px,0) scale('+scale.toFixed(4)+')','important');
  if(t<1)pvConnectionsPopRaf=requestAnimationFrame(tick);
  else{
   card.style.removeProperty('transform');
   card.style.removeProperty('transition');
   pvConnectionsPopRaf=0;
  }
 }
 pvConnectionsPopRaf=requestAnimationFrame(tick);
}
function pvCloseConnections(){
 if(pvConnectionsDialog.hidden||pvConnectionsDialog.classList.contains('pvConnectionsClosing'))return;
 pvConnectionsRequest++;
 cancelAnimationFrame(pvConnectionsPopRaf);pvConnectionsPopRaf=0;
 const previousCard=pvConnectionsDialog.querySelector('.pvConnectionsCard');
 if(previousCard){previousCard.style.removeProperty('transform');previousCard.style.removeProperty('transition')}
 pvConnectionsDialog.classList.remove('pvConnectionsOpen');
 pvConnectionsDialog.classList.add('pvConnectionsClosing');
 clearTimeout(pvConnectionsCloseTimer);
 const card=pvConnectionsDialog.querySelector('.pvConnectionsCard');
 card?.setAttribute('aria-hidden','true');
 pvConnectionsCloseTimer=setTimeout(()=>{
  pvConnectionsDialog.hidden=true;
  pvConnectionsDialog.classList.remove('pvConnectionsClosing');
  pvConnectionsDialog.replaceChildren();
 },230);
}
pvConnectionsDialog.onclick=e=>{if(e.target===pvConnectionsDialog)pvCloseConnections()};
pvConnectionsDialog.addEventListener('touchstart',e=>{
 if(e.touches.length!==1||pvConnectionsDialog.hidden)return;
 const grip=e.target.closest('.pvConnectionsHeader,.pvConnectionsGrabber');
 if(!grip)return;
 const t=e.touches[0];
 pvConnectionsSwipe={id:t.identifier,startX:t.clientX,startY:t.clientY,dy:0};
},{passive:true});
pvConnectionsDialog.addEventListener('touchmove',e=>{
 const g=pvConnectionsSwipe;if(!g)return;
 const t=[...e.touches].find(t=>t.identifier===g.id);
 if(!t)return;
 const dx=t.clientX-g.startX,dy=t.clientY-g.startY;
 if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){pvConnectionsSwipe=null;return}
 g.dy=Math.max(0,dy);
 const card=pvConnectionsDialog.querySelector('.pvConnectionsCard');
 if(card)card.style.setProperty('--pvFollowDragY',Math.min(150,g.dy*.72)+'px');
 if(g.dy>8&&e.cancelable)e.preventDefault();
},{passive:false});
pvConnectionsDialog.addEventListener('touchend',()=>{
 const g=pvConnectionsSwipe;pvConnectionsSwipe=null;
 const card=pvConnectionsDialog.querySelector('.pvConnectionsCard');
 card?.style.removeProperty('--pvFollowDragY');
 if(g?.dy>95)pvCloseConnections();
},{passive:true});
pvConnectionsDialog.addEventListener('touchcancel',()=>{
 pvConnectionsSwipe=null;
 pvConnectionsDialog.querySelector('.pvConnectionsCard')?.style.removeProperty('--pvFollowDragY');
},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pvConnectionsDialog.hidden)pvCloseConnections()});
async function pvShowConnections(ownerId,kind){
 if(!user||!ownerId||!['followers','following'].includes(kind))return;
 if(ownerId!==user.id){
  const {data:owner}=await db.from('profiles').select('is_private').eq('id',ownerId).maybeSingle();
  if(owner?.is_private){
   const {data:follow}=await db.from('follows').select('follower_id').eq('follower_id',user.id).eq('following_id',ownerId).maybeSingle();
   if(!follow){alert('This account is private. Follow to see their followers and following.');return}
  }
 }
 const request=++pvConnectionsRequest,heading=kind==='followers'?'Followers':'Following';
 clearTimeout(pvConnectionsCloseTimer);
 pvConnectionsDialog.classList.remove('pvConnectionsClosing','pvConnectionsOpen');
 const card=node('div','pvConnectionsCard'),head=node('div','pvConnectionsHeader');
 const close=node('button','pvConnectionsClose','×');close.type='button';close.setAttribute('aria-label','Close '+heading);close.onclick=pvCloseConnections;
 const titleWrap=node('div','pvConnectionsTitleWrap');
 titleWrap.append(node('span','pvConnectionsEyebrow','PAVORA COMMUNITY'),node('h3','',heading));
 head.append(node('span','pvConnectionsGrabber'),titleWrap,close);
 const people=node('div','pvConnectionsPeople'),more=node('button','pvConnectionsMore','Load more');
 more.type='button';more.hidden=true;card.append(head,people,more);
 pvConnectionsDialog.replaceChildren(card);pvConnectionsDialog.hidden=false;
 // Let WebKit commit the initial small sheet before running the spring pop.
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(request!==pvConnectionsRequest||pvConnectionsDialog.hidden)return;
  pvConnectionsDialog.classList.add('pvConnectionsOpen');
  pvConnectionsPopOpen(card,request);
 }));
 let offset=0,loading=false;
 async function loadPage(){
  if(loading||request!==pvConnectionsRequest)return;
  loading=true;more.hidden=true;
  if(offset===0){
   people.replaceChildren();
   // Reserve the final list surface while the async query is in flight.
   // Do not let the sheet jump from title-only height to full-list height.
   for(let i=0;i<6;i++){
    const ghost=node('div','pvConnectionSkeletonV141');
    ghost.setAttribute('aria-hidden','true');
    ghost.append(node('span','pvConnectionSkeletonAvatarV141'),
      node('span','pvConnectionSkeletonLinesV141'));
    people.append(ghost);
   }
   people.setAttribute('aria-busy','true');
  }
  const filterColumn=kind==='followers'?'following_id':'follower_id';
  const personColumn=kind==='followers'?'follower_id':'following_id';
  const {data:edges,error}=await db.from('follows').select('follower_id,following_id').eq(filterColumn,ownerId).order(personColumn,{ascending:true}).range(offset,offset+49);
  if(request!==pvConnectionsRequest)return;
  if(offset===0){people.replaceChildren();people.removeAttribute('aria-busy')}
  if(error){people.append(node('div','pvConnectionNotice','Could not load list: '+error.message));loading=false;return}
  const rows=edges||[],ids=rows.map(e=>e[personColumn]).filter(Boolean);
  if(ids.length){
   const {data:profiles,error:profileError}=await db.from('profiles').select('id,username,display_name,avatar_url,is_official').in('id',ids);
   if(request!==pvConnectionsRequest)return;
   if(profileError){people.append(node('div','pvConnectionNotice','Could not load profiles: '+profileError.message));loading=false;return}
   const names=new Map((profiles||[]).map(p=>[p.id,p]));
   for(const id of ids){const person=names.get(id);if(!person)continue;
    const row=node('button','pvConnectionPerson');row.type='button';
    const avatar=node('span','pvConnectionAvatar');
    if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='';img.loading='lazy';avatar.append(img)}
    else avatar.textContent=(person.display_name||person.username||'P')[0].toUpperCase();
    const info=node('span','pvConnectionText'),name=node('strong','','@'+(person.username||'creator'));
    if(person.is_official)name.append(pvOfficialBadge());
    info.append(name,node('small','',person.display_name||''));
    row.append(avatar,info);
    row.onclick=()=>{pvCloseConnections();openCreator(id)};
    // Rows arrive asynchronously; CSS nth-child animations often complete
    // before iOS paints the list. Animate each inserted row explicitly.
    const index=people.querySelectorAll('.pvConnectionPerson').length;
    row.classList.add('pvConnectionEnteringV141');
    row.style.setProperty('--pvConnectionOrder',String(Math.min(12,index)));
    people.append(row);
    // Render the entire incoming group in its final geometry before animating.
    if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches&&typeof row.animate==='function'){
     requestAnimationFrame(()=>{
      if(!row.isConnected||request!==pvConnectionsRequest)return;
      const animation=row.animate([
       {opacity:0,transform:'translate3d(0,20px,0) scale(.92)'},
       {opacity:1,transform:'translate3d(0,-2px,0) scale(1.012)',offset:.72},
       {opacity:1,transform:'translate3d(0,0,0) scale(1)'}
      ],{duration:430,delay:Math.min(490,index*58),easing:'cubic-bezier(.18,.85,.24,1)',fill:'both'});
      animation.onfinish=()=>{row.classList.remove('pvConnectionEnteringV141');animation.cancel()};
     });
    }else row.classList.remove('pvConnectionEnteringV141');
   }
  }
  offset+=rows.length;
  if(offset===0)people.append(node('div','pvConnectionNotice','No '+heading.toLowerCase()+' yet.'));
  more.hidden=rows.length<50;
  loading=false;
 }
 more.onclick=loadPage;
 await loadPage();
}
function pvConnectionCountButton(amount,label,ownerId,failed){
 const b=node('button','pvConnectionCount');b.type='button';
 b.append(node('strong','',amount),document.createTextNode(' '+label));
 b.disabled=!!failed;b.title='View '+label;b.onclick=()=>pvShowConnections(ownerId,label);
 return b;
}
// Own profile: convert only followers and following counters into actionable buttons.
for(const [id,kind] of [['pvFollowers','followers'],['pvFollowing','following']]){
 const count=document.getElementById(id);
 const parent=count?.parentElement;
 if(!count||!parent)continue;
 const button=node('button','pvConnectionCount');button.type='button';
 button.append(count,document.createTextNode(' '+kind));
 parent.replaceWith(button);
 button.title='View '+kind;
 button.onclick=()=>{if(user)pvShowConnections(user.id,kind)};
}
function pvProfileButton(person){const b=node('button','pvPersonButton','@'+(person.username||'creator'));b.type='button';b.onclick=()=>openCreator(person.id);return b}
async function openCreator(id){if(!user||!id)return;pvRememberView('creator',id);if(id===user.id){pvNavigate('profile');await updateSocialProfile();return}
let blockedByMe=false;
try{blockedByMe=await pvAmBlocking(id)}catch(e){console.warn('Block check:',e);return alert('Could not check account privacy. Retry shortly.')}pvNavigate('creator');pvRememberView('creator',id);publicView.replaceChildren(node('p','muted','Loading profile…'));
const [{data:person,error},{data:posts,count:postCount,error:postError},{count:reelCount,error:reelCountError},{count:followerCount,error:followerCountError},{count:followingCount,error:followingCountError},{data:myFollow},{data:pendingRequest}]=await Promise.all([
db.from('profiles').select('*').eq('id',id).maybeSingle(),
db.from('posts').select('id,caption,image_path,created_at',{count:'exact'}).eq('author_id',id).order('created_at',{ascending:false}).limit(90),
db.from('reels').select('id',{count:'exact',head:true}).eq('author_id',id),
db.from('follows').select('follower_id',{count:'exact',head:true}).eq('following_id',id),
db.from('follows').select('following_id',{count:'exact',head:true}).eq('follower_id',id),
db.from('follows').select('following_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle(),
db.from('follow_requests').select('follower_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle()
]);publicView.replaceChildren();if(error||!person){publicView.append(node('p','muted',error?.message||'Profile unavailable'));return}
const back=node('button','secondary','← Explore creators');back.onclick=()=>pvNavigate('explore');publicView.append(back);
const top=node('div','pvPublicTop'),avatar=node('div','pvPublicAvatar');if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='Creator profile photo';img.style.cssText='width:100%;height:100%;object-fit:cover';avatar.append(img)}else avatar.textContent=(person.display_name||person.username||'P')[0].toUpperCase();
const details=node('div'),publicName=node('h2','pvPublicName');publicName.append(document.createTextNode(person.username));
if(person.is_official){publicName.append(pvOfficialBadge());details.append(publicName,node('div','pvPublicOfficialType','Official PAVORA Account'));}
else details.append(publicName);
// Display name belongs beside the username, never attached after presence/Offline.
details.append(node('strong','pvPublicDisplayName',person.display_name||person.username));
if(person.is_private)details.append(node('div','pvProfilePrivacyTag','🔒 Private account'));
else window.PAVORA_PRESENCE?.attach(details,id,'profile');
const pvCountText=(value,failed)=>failed?'—':String(value??0);
const publicStats=node('div','pvPublicStats');
for(const [amount,label,failed] of [
 [pvCountText(postCount,postError),'posts',postError],
 [pvCountText(reelCount,reelCountError),'reels',reelCountError],
 [pvCountText(followerCount,followerCountError),'followers',followerCountError],
 [pvCountText(followingCount,followingCountError),'following',followingCountError]
]){const stat=label==='followers'||label==='following'?pvConnectionCountButton(amount,label,id,failed):node('span','pvPublicStat');if(label!=='followers'&&label!=='following')stat.append(node('strong','',amount),document.createTextNode(' '+label));publicStats.append(stat)}
details.append(publicStats,node('p','pvPublicBio',person.bio||''));
top.append(avatar,details);publicView.append(top);
if(blockedByMe){const warning=node('div','pvBlockedNotice');warning.append(node('strong','','You blocked @'+person.username),node('p','','This account cannot access your PAVORA profile or content. Unblock to interact again.'));const button=node('button','pvSettingsAction','Unblock');button.onclick=()=>pvUnblockAccount(id,person.username);warning.append(button);publicView.append(warning);return}
const privateLocked=!!person.is_private&&!myFollow;
const actions=node('div','pvPublicActions'),follow=node('button','secondary',myFollow?'Following ✓':pendingRequest?'Requested ✓':person.is_private?'Request follow':'Follow'),message=node('button','primary','✉ Message');
follow.onclick=async()=>{follow.disabled=true;let result;
 if(myFollow)result=await db.from('follows').delete().eq('follower_id',user.id).eq('following_id',id);
 else if(pendingRequest)result=await db.from('follow_requests').delete().eq('follower_id',user.id).eq('following_id',id);
 else if(person.is_private)result=await db.from('follow_requests').insert({follower_id:user.id,following_id:id});
 else result=await db.from('follows').insert({follower_id:user.id,following_id:id});
 if(result.error)alert(result.error.message);await openCreator(id)};
message.onclick=()=>openChat(id);
const block=node('button','pvBlockAction','⊘ Block');block.onclick=()=>pvBlockAccount(id,person.username);
const report=node('button','secondary','⚑ Report');report.type='button';report.onclick=()=>pvReportTarget('account',id);
actions.append(follow,message,block,report);publicView.append(actions);
if(!privateLocked)window.PVKit?.renderHighlights?.(publicView,id);
if(privateLocked){const locked=node('div','pvPrivateLock');locked.append(node('div','','🔒'),node('strong','','This account is private'),node('p','','Follow this account to see its posts and reels.'));publicView.append(locked);return}
publicView.append(node('h3','','Posts'));const grid=node('div','pvPublicGrid');publicView.append(grid);
if(postError){grid.append(node('p','muted',postError.message));return}if(!posts?.length){grid.append(node('p','muted','No posts yet.'));return}
for(const post of posts){const tile=node('button');tile.type='button';if(post.image_path){const img=node('img');img.loading='lazy';img.src=db.storage.from('post-images').getPublicUrl(post.image_path).data.publicUrl;img.alt=post.caption||'Post';tile.append(img)}else tile.textContent=post.caption||'Post';tile.onclick=()=>openProfilePost({...post,author_name:person.username});grid.append(tile)}
}
const oldOpenProfilePost=openProfilePost;
openProfilePost=function(p){oldOpenProfilePost(p);if(p.author_name){const label=pvPreview.querySelector('.pvPreviewCaption strong');if(label)label.textContent='@'+p.author_name}};
let pvInboxTab='Primary',pvInboxSearch='',pvConversationSettings=new Map(),pvPrefsReady=true;
document.addEventListener('click',e=>{
 if(e.target.closest('.pvChatMenuWrap,.pvDmFloatingMenu'))return;
 document.querySelectorAll('.pvDmFloatingMenu').forEach(m=>{m.classList.add('hide');m.classList.remove('pvDmFloatingMenu');m.remove()});
 document.querySelectorAll('#pvInboxView .pvChatContextMenu').forEach(m=>m.classList.add('hide'));
 document.querySelectorAll('#pvInboxView .pvChatMore[aria-expanded="true"]').forEach(b=>b.setAttribute('aria-expanded','false'));
});
async function pvLoadConversationSettings(){if(!user)return;const {data,error}=await db.from('conversation_preferences').select('peer_id,folder,pinned,muted').eq('owner_id',user.id);if(error){pvPrefsReady=false;console.warn('Inbox folders need setup:',error.message);return}pvPrefsReady=true;pvConversationSettings=new Map((data||[]).map(x=>[x.peer_id,{folder:x.folder,pinned:x.pinned,muted:x.muted}]))}
function pvConversationSetting(peer){return pvConversationSettings.get(peer)||{folder:'primary',pinned:false,muted:false}}
async function pvSaveConversationSetting(peer,changes){if(!pvPrefsReady){alert('Run supabase/conversation-preferences.sql in Supabase SQL Editor first.');return false}const next={...pvConversationSetting(peer),...changes};const {error}=await db.from('conversation_preferences').upsert({owner_id:user.id,peer_id:peer,...next,updated_at:new Date().toISOString()},{onConflict:'owner_id,peer_id'});if(error){alert('Cannot update conversation: '+error.message+' — Run supabase/conversation-preferences.sql first.');return false}pvConversationSettings.set(peer,next);return true}

function pvDmPlayOpenPopV143(area,peer){
 if(window.innerWidth>700||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 if(!area?.isConnected||selectedPeer!==peer||document.activeElement?.matches?.('#pvInboxView .pvMessageForm input'))return;
 area.classList.remove('pvDmOpenPopV143');
 // Trigger once when the real chat replaces the loading skeleton.
 requestAnimationFrame(()=>{
  if(!area.isConnected||selectedPeer!==peer||!inboxView.classList.contains('pvChatSelected'))return;
  void area.offsetWidth;
  area.classList.add('pvDmOpenPopV143');
  const clean=()=>{area.classList.remove('pvDmOpenPopV143');area.removeEventListener('animationend',finish)};
  const finish=e=>{if(e.target===area&&e.animationName==='pvChatSpringPopV143')clean()};
  area.addEventListener('animationend',finish);
  setTimeout(clean,680);
 });
}
function pvInboxMobileBack(){
 document.getElementById('pvChatArea')?.classList.remove('pvDmOpenPopV143');
 // iOS can keep a tapped thread in :hover/:focus and the old .active state.
 // Always clear all transient conversation selection state before showing the list.
 const focus=document.activeElement;
 if(focus?.closest?.('#pvInboxView'))try{focus.blur()}catch(e){}
 inboxView.querySelectorAll('.pvThreadPerson.active').forEach(el=>{
  el.classList.remove('active');
  el.setAttribute('aria-selected','false');
 });
 inboxView.querySelectorAll('.pvChatContextMenu:not(.hide)').forEach(menu=>menu.classList.add('hide'));
 inboxView.querySelectorAll('.pvChatMore[aria-expanded="true"]').forEach(btn=>btn.setAttribute('aria-expanded','false'));
 inboxView.classList.remove('pvChatSelected');
 pvClearTyping(selectedPeer);pvDmTypingLastSeen=0;selectedPeer=null;
 window.dispatchEvent(new Event('pv-chat-peer-changed'));
 pvRememberInboxPosition();
 const area=document.getElementById('pvChatArea');
 if(area)area.replaceChildren(pvEmptyChat());
}
function pvDmLoadingChat(){
 const shell=node('div','pvDmLoadingShell');
 shell.setAttribute('role','status');
 shell.setAttribute('aria-label','Opening conversation');
 shell.innerHTML='<div class="pvDmLoadingHead"><span class="pvDmLoadingBack">‹</span><span class="pvDmLoadingAvatar"></span><span class="pvDmLoadingTitle"></span></div><div class="pvDmLoadingContent"><span class="pvDmLoadingBubble"></span><span class="pvDmLoadingBubble mine"></span><span class="pvDmLoadingBubble short"></span></div><div class="pvDmLoadingCompose"><span></span></div>';
 return shell;
}
function pvEmptyChat(){const empty=node('div','pvEmptyChat');empty.innerHTML='<div class="pvEmptyIcon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m21 3-8.5 18-3.5-7.5L2 10z"/><path d="M21 3 9 13.5"/></svg></div><h2>Your messages</h2><p>Send private photos and messages to a friend.</p>';const btn=node('button','pvStartMessage','Send message');btn.onclick=()=>pvNavigate('explore');empty.append(btn);return empty}
async function loadInbox(){if(!user)return;
const layout=node('div','pvInboxLayout'),side=node('div','pvInboxSide'),right=node('div','pvChatArea');right.id='pvChatArea';right.append(selectedPeer?pvDmLoadingChat():pvEmptyChat());layout.append(side,right);inboxView.replaceChildren(layout);
// Keep inbox visible until real chat content is ready; avoid switching to an empty/skeleton pane.
inboxView.classList.toggle('pvChatSelected',!!selectedPeer);
requestAnimationFrame(pvSyncDesktopChatHeight);
requestAnimationFrame(pvSyncMobileDmViewport);
const top=node('div','pvInboxTop'),name=node('strong','',profile?.username||'Messages'),compose=node('button','pvInboxCompose','✎');compose.title='New message';compose.setAttribute('aria-label','New message');compose.onclick=()=>pvNavigate('explore');const pvInboxBell=pvMakeBell('pvInboxBell');const pvInboxActions=node('div','pvInboxActions');pvInboxActions.append(pvInboxBell,compose);top.append(name,pvInboxActions);side.append(top);
const tabs=node('div','pvInboxTabs');for(const t of ['Primary','General','Requests']){const tab=node('button',pvInboxTab===t?'active':'',t);tab.type='button';tab.onclick=()=>{pvInboxTab=t;selectedPeer=null;pvRememberInboxPosition();loadInbox()};tabs.append(tab)}side.append(tabs);
const searchBox=node('div','pvInboxSearch'),searchIcon=node('span','','⌕'),search=node('input');search.type='search';search.placeholder='Search';search.setAttribute('aria-label','Search conversations');search.value=pvInboxSearch;searchBox.append(searchIcon,search);side.append(searchBox);
const threads=node('div','pvThreadList');side.append(threads);
const {data,error}=await db.from('direct_messages').select('sender_id,recipient_id,body,created_at').or('sender_id.eq.'+user.id+',recipient_id.eq.'+user.id).order('created_at',{ascending:false}).limit(400);
if(error){threads.append(node('p','muted','Messaging setup needed: '+error.message));return}
const visible=(data||[]).filter(m=>!pvIsHiddenMessage(m));
const {data:requests,error:reqError}=await db.from('message_requests').select('sender_id').eq('recipient_id',user.id).is('accepted_at',null);
if(reqError)threads.append(node('p','pvEmptyThreads','Message Requests setup needed: run supabase/message-requests.sql. '+reqError.message));
const requestIds=new Set((requests||[]).map(r=>r.sender_id));
if(requestIds.size){const {data:following}=await db.from('follows').select('follower_id').eq('following_id',user.id).in('follower_id',[...requestIds]);for(const f of following||[])requestIds.delete(f.follower_id)}
if(!pvPrefsReady){const note=node('p','pvEmptyThreads','Inbox folders need setup. Run supabase/conversation-preferences.sql in Supabase SQL Editor.');threads.append(note)}
const allIds=[...new Set(visible.map(m=>m.sender_id===user.id?m.recipient_id:m.sender_id))];if(selectedPeer&&!allIds.includes(selectedPeer))allIds.unshift(selectedPeer);
const ids=allIds.filter(id=>pvInboxTab==='Requests'?requestIds.has(id):!requestIds.has(id)&&pvConversationSetting(id).folder===(pvInboxTab==='General'?'general':'primary'));
if(pvInboxTab==='Requests'&&ids.length)tabs.querySelectorAll('button')[2].textContent='Requests ('+ids.length+')';
if(!ids.length){threads.append(node('p','pvEmptyThreads',pvInboxTab==='Requests'?'No message requests yet.':pvInboxTab==='General'?'No General chats yet. Open the ⋯ menu in Primary and select Move to General.':'No conversations yet. Discover people and tap Message.'));if(selectedPeer)await renderChat(selectedPeer);return}
const {data:people}=await db.from('profiles').select('id,username,display_name,avatar_url').in('id',ids);
const names=new Map((people||[]).map(p=>[p.id,p]));
const orderedIds=ids.slice().sort((a,b)=>Number(pvConversationSetting(b).pinned)-Number(pvConversationSetting(a).pinned));
const rows=[];
for(const id of orderedIds){const p=names.get(id);if(!p)continue;const setting=pvConversationSetting(id),last=visible.find(m=>(m.sender_id===user.id?m.recipient_id:m.sender_id)===id);const entry=node('div','pvThreadEntry'),b=node('button','pvThreadPerson'),avatar=node('div','pvThreadAvatar'),details=node('div','pvThreadDetails');
if(p.avatar_url){const img=node('img');img.src=p.avatar_url;img.alt='';avatar.append(img)}else avatar.textContent=(p.display_name||p.username||'?')[0].toUpperCase();
const label=node('strong','',p.display_name||p.username);if(setting.pinned)label.append(node('span','pvPinnedMarker',' 📌'));if(setting.muted)label.append(node('span','pvMutedMarker',' 🔕'));
details.append(label,node('small','',last?(last.sender_id===user.id?'You: ':'')+(last.body||'Message'):'Start a conversation'));
window.PAVORA_PRESENCE?.attach(details,id,'thread');const when=node('span','pvThreadWhen',last?new Date(last.created_at).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'');
b.append(avatar,details,when);b.dataset.peerId=id;b.title='@'+p.username;
// A vertical flick scrolls the inbox, it must never open the row underneath it.
// iOS may synthesize a click after a moving finger lifts.
let pvTouchStartY=0,pvTouchStartX=0,pvTouchMoved=false,pvTouchEndedAt=0;
b.addEventListener('touchstart',event=>{
 const t=event.touches[0];if(!t)return;
 pvTouchStartY=t.clientY;pvTouchStartX=t.clientX;pvTouchMoved=false;
},{passive:true});
b.addEventListener('touchmove',event=>{
 const t=event.touches[0];if(!t)return;
 if(Math.abs(t.clientY-pvTouchStartY)>9||Math.abs(t.clientX-pvTouchStartX)>12)pvTouchMoved=true;
},{passive:true});
b.addEventListener('touchend',()=>{
 if(pvTouchMoved)pvTouchEndedAt=Date.now();
},{passive:true});
b.addEventListener('touchcancel',()=>{pvTouchMoved=true;pvTouchEndedAt=Date.now()},{passive:true});
b.addEventListener('click',event=>{
 if(pvTouchMoved||Date.now()-pvTouchEndedAt<650){
  event.preventDefault();event.stopPropagation();return;
 }
 openChat(id,false);
});
const menuButton=node('button','pvChatMore','⋯');menuButton.type='button';menuButton.title='Conversation options';menuButton.setAttribute('aria-label','Options for '+(p.display_name||p.username));
const menu=node('div','pvChatContextMenu hide');menu.setAttribute('role','menu');
// The menu must live outside the scrolling inbox: iOS clips fixed descendants
// of overflow/transform containers and shows a popup that cannot be tapped.
function closeMenu(){
 menu.classList.add('hide');
 menuButton.setAttribute('aria-expanded','false');
 menu.classList.remove('pvDmFloatingMenu');
 menu.style.removeProperty('top');menu.style.removeProperty('left');
 menu.style.removeProperty('right');menu.style.removeProperty('position');
 if(menu.parentNode===document.body)controls.append(menu);
}
function menuItem(label,fn){
 const item=node('button','pvChatMenuItem',label);item.type='button';
 item.setAttribute('role','menuitem');
 item.style.setProperty('color',label==='Remove chat'?'#a53057':'#322144','important');
 item.style.setProperty('-webkit-text-fill-color',label==='Remove chat'?'#a53057':'#322144','important');
 item.addEventListener('pointerdown',e=>e.stopPropagation());
 item.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
 item.addEventListener('click',async e=>{
  e.preventDefault();e.stopPropagation();
  if(item.disabled)return;
  closeMenu();
  try{await fn()}catch(error){console.warn('DM action failed:',error)}
 });
 menu.append(item);
}
if(pvInboxTab!=='Requests')menuItem(setting.folder==='primary'?'Move to General':'Move to Primary',async()=>{if(await pvSaveConversationSetting(id,{folder:setting.folder==='primary'?'general':'primary'})){if(selectedPeer===id)selectedPeer=null;await loadInbox()}});
if(pvInboxTab!=='Requests')menuItem(setting.pinned?'Unpin conversation':'Pin conversation',async()=>{if(await pvSaveConversationSetting(id,{pinned:!setting.pinned}))await loadInbox()});
menuItem(setting.muted?'Unmute notifications':'Mute notifications',async()=>{if(await pvSaveConversationSetting(id,{muted:!setting.muted}))await loadInbox()});
menuItem('Remove chat',async()=>pvRemoveChat(id));
menuButton.setAttribute('aria-expanded','false');
menuButton.onclick=e=>{
 e.preventDefault();e.stopPropagation();
 const opening=menu.classList.contains('hide');
 // Clean up older floating menus before opening a new one.
 document.querySelectorAll('.pvDmFloatingMenu').forEach(other=>{
  if(other===menu)return;
  other.classList.add('hide');other.classList.remove('pvDmFloatingMenu');
  other.remove();
 });
 inboxView.querySelectorAll('.pvChatContextMenu').forEach(m=>m.classList.add('hide'));
 inboxView.querySelectorAll('.pvChatMore').forEach(m=>m.setAttribute('aria-expanded','false'));
 if(!opening){closeMenu();return}
 if(window.innerWidth<=700){
  document.body.append(menu);
  menu.classList.add('pvDmFloatingMenu');
 }
 menu.classList.remove('hide');
 menuButton.setAttribute('aria-expanded','true');
 if(window.innerWidth<=700){
  const rect=menuButton.getBoundingClientRect();
  const vv=window.visualViewport;
  const vtop=vv?.offsetTop||0, vleft=vv?.offsetLeft||0;
  const vw=vv?.width||window.innerWidth,vh=vv?.height||window.innerHeight;
  const width=menu.offsetWidth||225,height=menu.offsetHeight||190;
  const left=Math.max(vleft+8,Math.min(rect.right-width,vleft+vw-width-8));
  const below=rect.bottom+6,above=rect.top-height-6;
  const top=below+height<=vtop+vh-8?below:Math.max(vtop+8,above);
  menu.style.position='fixed';menu.style.left=Math.round(left)+'px';
  menu.style.top=Math.round(top)+'px';menu.style.right='auto';
 }
};
const controls=node('div','pvChatMenuWrap');controls.append(menuButton,menu);
entry.append(b,controls);threads.append(entry);rows.push({entry,p})}
const filter=()=>{const q=pvInboxSearch.toLowerCase();for(const {entry,p} of rows)entry.classList.toggle('hide',!(p.display_name||'').toLowerCase().includes(q)&&!(p.username||'').toLowerCase().includes(q))};
search.oninput=()=>{pvInboxSearch=search.value;filter()};filter();
if(selectedPeer)await renderChat(selectedPeer);await pvCheckUnread();
}
async function openChat(id,navigate=true){if(!user||id===user.id)return;if(pvHiddenChats.has(id)){const {error}=await db.from('hidden_conversations').delete().eq('owner_id',user.id).eq('peer_id',id);if(!error)pvHiddenChats.delete(id)}if(selectedPeer&&selectedPeer!==id)pvClearTyping(selectedPeer);pvDmTypingLastSeen=0;selectedPeer=id;window.dispatchEvent(new Event('pv-chat-peer-changed'));if(navigate){
 // Start showing the conversation loading shell before the request-status lookup.
 // This prevents an extra flash of the previous profile or empty chat screen.
 inboxView.classList.add('pvChatSelected');
 pvNavigate('messages');
 const {data:req}=await db.from('message_requests').select('sender_id').eq('recipient_id',user.id).eq('sender_id',id).is('accepted_at',null).maybeSingle();const {data:following}=req?await db.from('follows').select('follower_id').eq('follower_id',id).eq('following_id',user.id).maybeSingle():{data:null};pvInboxTab=req&&!following?'Requests':pvConversationSetting(id).folder==='general'?'General':'Primary';}else{
 // Immediate view switch on tap: do not leave the inbox visible while network requests run.
 inboxView.classList.add('pvChatSelected');
 inboxView.querySelectorAll('.pvThreadPerson').forEach(b=>b.classList.toggle('active',b.dataset.peerId===id));
 const area=document.getElementById('pvChatArea');
 if(area&&!area.querySelector('.pvMessageForm'))area.replaceChildren(pvDmLoadingChat());
 await renderChat(id);
 
}pvRememberInboxPosition();if(!chatPoll)chatPoll=setInterval(()=>{if(!inboxView.classList.contains('hide')&&selectedPeer&&!pvChatPollBusy){pvChatPollBusy=true;renderChat(selectedPeer,true).catch(e=>console.warn('Chat poll:',e)).finally(()=>{pvChatPollBusy=false})}},pvDmRealtimeStatus==='live'?12000:4000)}
async function renderChat(id,silent=false){const area=document.getElementById('pvChatArea');if(!area||!user||selectedPeer!==id)return;
const pollingExisting=!!(silent&&area.querySelector('.pvMessageForm'));
const uid=user.id;
const [{data:person,error:personError},{data:messages,error},{data:hiddenRows,error:hiddenError},{data:pinData,error:pinError}]=await Promise.all([
pollingExisting?Promise.resolve({data:{id},error:null}):db.from('profiles').select('id,username,display_name,avatar_url,bio').eq('id',id).maybeSingle(),
db.from('direct_messages').select('id,sender_id,recipient_id,body,created_at,read_at,reply_to,media_path,media_type').or('and(sender_id.eq.'+user.id+',recipient_id.eq.'+id+'),and(sender_id.eq.'+id+',recipient_id.eq.'+user.id+')').order('created_at',{ascending:true}).limit(pollingExisting?100:200),
db.from('dm_hidden_messages').select('message_id').eq('user_id',uid),
db.from('dm_pinned_messages').select('message_id').eq('user_id',uid).eq('peer_id',id).maybeSingle()
]);if(selectedPeer!==id||user?.id!==uid)return;
const hiddenSet=new Set((hiddenRows||[]).map(x=>x.message_id));
const visibleMessages=hiddenError?messages||[]:(messages||[]).filter(m=>!hiddenSet.has(m.id));
if(!pinError){
 if(pinData&& !hiddenSet.has(pinData.message_id))pvDmPinnedByPeer.set(id,{message_id:pinData.message_id});
 else pvDmPinnedByPeer.delete(id);
}
pvDmRenderPinBanner(id,visibleMessages);if(error||personError){if(!silent)area.replaceChildren(node('p','muted',(error||personError).message));return}
if(!person){area.replaceChildren(node('p','muted','User unavailable'));return}
if(!document.hidden&&visibleMessages.some(m=>m.recipient_id===user.id&&!m.read_at))pvMarkRead(id);
// Never replace the message composer during background polling: iOS/Android
// will dismiss the software keyboard if its focused input is detached.
if(silent&&area.querySelector('.pvMessageForm')){
 const list=area.querySelector('.pvMessages');
 if(list){
  const known=new Set([...list.querySelectorAll('.pvMessageRow[data-message-id]')].map(row=>row.dataset.messageId));
  const received=visibleMessages.filter(m=>!known.has(String(m.id)));
  for(const row of [...list.querySelectorAll('.pvMessageRow[data-message-id]')])if(hiddenSet.has(row.dataset.messageId))row.remove();
  const dayMarkers=list.querySelectorAll('.pvChatDayDivider');
  let lastDay=dayMarkers.length?dayMarkers[dayMarkers.length-1].dataset.dayKey||'':'';
  for(const m of received){
   const stamp=new Date(m.created_at),dayKey=stamp.toDateString();
   if(dayKey!==lastDay){lastDay=dayKey;const dateLabel=node('div','pvChatDayDivider',stamp.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}));dateLabel.dataset.dayKey=dayKey;list.append(dateLabel)}
   list.querySelector('.pvChatEmptyMessage')?.remove();
   const mine=m.sender_id===user.id,row=node('div','pvMessageRow'+(mine?' mine':'')),bubble=node('div','pvBubble'+(mine?' mine':''),m.body);
   row.dataset.messageId=String(m.id);bubble.title=stamp.toLocaleString();row.append(bubble);
   if(mine){const del=node('button','pvDeleteMessage','Delete');del.type='button';del.title='Delete this message for everyone';del.onclick=async()=>{if(!confirm('Delete this message for everyone?'))return;const {error}=await db.from('direct_messages').delete().eq('id',m.id).eq('sender_id',user.id);if(error)return alert(error.message);row.remove();await pvCheckUnread()};row.append(del)}
   list.append(row);
  }
  pvDmUpdateReceipt(list,visibleMessages);
  pvDmDecorateRows(list);pvDmDecorateContent(list,visibleMessages,id);pvScheduleDmReactionRefresh(70);
  if(received.length)list.scrollTop=list.scrollHeight;
 }
 return;
}
const [{data:incoming},{data:outgoing},{data:myFollow}]=await Promise.all([
db.from('message_requests').select('sender_id').eq('recipient_id',user.id).eq('sender_id',id).is('accepted_at',null).maybeSingle(),
db.from('message_requests').select('accepted_at').eq('recipient_id',id).eq('sender_id',user.id).maybeSingle(),
db.from('follows').select('follower_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle()]);
const {data:senderFollowsMe}=incoming?await db.from('follows').select('follower_id').eq('follower_id',id).eq('following_id',user.id).maybeSingle():{data:null};
const pendingIncoming=!!incoming&&!senderFollowsMe,pendingOutgoing=!!outgoing&&!outgoing.accepted_at&&!myFollow,alreadySent=(messages||[]).some(m=>m.sender_id===user.id);
// A slow poll may have started before the composer existed; never let it
// replace a newly mounted focused composer after its later DB queries finish.
if(silent&&area.querySelector('.pvMessageForm'))return;
// Keep the glass skeleton in front until the full chat has been mounted and scrolled.
const pvOpeningSkeleton=area.querySelector('.pvDmLoadingShell');
if(!pvOpeningSkeleton)area.replaceChildren();
const chatTop=node('div','pvChatTop'),back=node('button','pvChatBack','‹'),heading=node('h3','',person.display_name||person.username),handle=node('p','muted','@'+person.username),chatWho=node('div','pvChatWho'),list=node('div','pvMessages'),headerAvatar=node('button','pvChatHeaderAvatar');
back.type='button';back.setAttribute('aria-label','Back to conversations');back.onclick=pvInboxMobileBack;
headerAvatar.type='button';headerAvatar.title='View profile';headerAvatar.setAttribute('aria-label','View '+person.username+' profile');
function pvChatAvatar(target){target.replaceChildren();if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='';img.onerror=()=>{target.replaceChildren();target.textContent=(person.display_name||person.username||'P')[0].toUpperCase()};target.append(img)}else target.textContent=(person.display_name||person.username||'P')[0].toUpperCase()}
pvChatAvatar(headerAvatar);headerAvatar.onclick=()=>openCreator(id);
const headerText=node('button','pvChatHeaderIdentity');headerText.type='button';headerText.onclick=()=>openCreator(id);headerText.append(heading,handle);window.PAVORA_PRESENCE?.attach(headerText,id,'chat');chatWho.append(headerAvatar,headerText);chatTop.append(back,chatWho);
try{window.PVKit?.addCallActions?.(id,chatTop)}catch(e){console.warn('Call buttons:',e)}
const liveLabel=node('span','pvDmRealtimeLabel',pvDmRealtimeStatus==='live'?'Live':'Syncing');
liveLabel.title=pvDmRealtimeStatus==='live'?'Real-time messages enabled':'Using background message checks';
chatTop.append(liveLabel);
const galleryButton=node('button','pvChatInfoButton','▧');galleryButton.type='button';
galleryButton.title='Shared photos & videos';galleryButton.setAttribute('aria-label','Shared photos and videos');galleryButton.onclick=()=>pvShowDmMediaGallery(id);
chatTop.append(galleryButton);
const searchButton=node('button','pvDmSearchButton');
searchButton.type='button';searchButton.title='Search in chat';searchButton.setAttribute('aria-label','Search messages in this chat');
searchButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
searchButton.onclick=()=>window.PAVORA_CHAT_SEARCH?.open(area);
chatTop.append(searchButton);
const themeButton=node('button','pvChatThemeTrigger','🎨');
themeButton.type='button';themeButton.title='Change chat theme';themeButton.setAttribute('aria-label','Choose chat theme');
themeButton.onclick=()=>window.PAVORA_CHAT_THEMES?.open(area,user?.id,id);
chatTop.append(themeButton);
const infoButton=node('button','pvChatInfoButton');infoButton.type='button';infoButton.title='View profile';infoButton.setAttribute('aria-label','View profile');infoButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>';infoButton.onclick=()=>openCreator(id);chatTop.append(infoButton);
const pinnedBar=node('div','pvDmPinnedBar');pinnedBar.hidden=true;
pinnedBar.dataset.peer=id;
const intro=node('div','pvChatIntro'),introAvatar=node('div','pvChatIntroAvatar');pvChatAvatar(introAvatar);
intro.append(introAvatar,node('strong','',person.display_name||person.username),node('span','pvChatIntroHandle','@'+person.username+' · PAVORA'));
const viewProfile=node('button','pvChatViewProfile','View profile');viewProfile.type='button';viewProfile.onclick=()=>openCreator(id);intro.append(viewProfile);
list.append(intro);
let pvLastMessageDay='';
for(const m of visibleMessages){
const stamp=new Date(m.created_at),dayKey=stamp.toDateString();if(dayKey!==pvLastMessageDay){pvLastMessageDay=dayKey;const marker=node('div','pvChatDayDivider',stamp.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}));marker.dataset.dayKey=dayKey;list.append(marker)}
const mine=m.sender_id===user.id,row=node('div','pvMessageRow'+(mine?' mine':'')),bubble=node('div','pvBubble'+(mine?' mine':''),m.body);
row.dataset.messageId=String(m.id);bubble.title=new Date(m.created_at).toLocaleString();row.append(bubble);if(mine){const del=node('button','pvDeleteMessage','Delete');del.type='button';del.title='Delete this message for everyone';del.setAttribute('aria-label','Delete message for everyone');del.onclick=async()=>{if(!confirm('Delete this message for everyone? This cannot be undone.'))return;del.disabled=true;const {error}=await db.from('direct_messages').delete().eq('id',m.id).eq('sender_id',user.id);if(error){alert('Could not delete message: '+error.message);del.disabled=false;return}await renderChat(id);await pvCheckUnread()};row.append(del)}list.append(row)}if(!visibleMessages.length)list.append(node('p','pvChatEmptyMessage','Say hello! 👋'));const form=node('form','pvMessageForm'),input=node('input');input.placeholder='Message…';input.maxLength=2000;input.setAttribute('enterkeyhint','send');input.required=true;input.setAttribute('aria-label','Message');
const emojiButton=node('button','pvChatEmojiButton');emojiButton.type='button';emojiButton.title='Add emoji';emojiButton.setAttribute('aria-label','Add emoji');emojiButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 14c2 3 6 3 8 0"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>';
const emojiTray=node('div','pvChatEmojiTray pvDmPicker');emojiTray.hidden=true;
emojiTray.id='pvDmPicker-'+id.replace(/[^a-zA-Z0-9_-]/g,'');
const pickerTabs=node('div','pvDmPickerTabs'),pickerGrid=node('div','pvDmPickerGrid');
const pvEmojiSet=['❤️','😂','😍','🥰','🔥','👏','🙌','😊','👍','💜','✨','👋','😭','🤩','🙏','🎉','😘','😎','🤗','💯'];
const pvStickerSet=['🥹💜','🫶✨','❤️‍🔥','🎉🥳','💜👑','😘💕','😂🙌','🥰🌸','🤝💖','✨🌙','😴💤','🔥💯','🙏💜','👀✨','😎🔥','🧸💕'];
function pvSelectPickerTab(tab){
 pickerGrid.replaceChildren();
 pickerTabs.querySelectorAll('button').forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
 if(tab==='gif'){
  const hint=node('p','pvDmPickerHint','Send an animated GIF from your phone or computer (up to 30 MB).');
  const choose=node('button','pvDmGifChoose','Choose GIF');choose.type='button';
  choose.onclick=()=>{fileInput.accept='image/gif';fileInput.click()};
  pickerGrid.append(hint,choose);return;
 }
 for(const symbol of tab==='stickers'?pvStickerSet:pvEmojiSet){
  const item=node('button',tab==='stickers'?'pvDmSticker':'pvDmEmoji',symbol);item.type='button';item.title='Insert '+symbol;
  item.onclick=()=>{input.value+=symbol;emojiTray.hidden=true;emojiButton.setAttribute('aria-expanded','false');input.focus({preventScroll:true});input.dispatchEvent(new Event('input'))};
  pickerGrid.append(item);
 }
}
for(const [key,label] of [['emoji','Emoji'],['stickers','Stickers'],['gif','GIF']]){
 const tab=node('button','',label);tab.type='button';tab.dataset.tab=key;tab.setAttribute('role','tab');
 tab.onclick=()=>pvSelectPickerTab(key);pickerTabs.append(tab);
}
pickerTabs.setAttribute('role','tablist');pickerTabs.setAttribute('aria-label','Message extras');
emojiTray.append(pickerTabs,pickerGrid);pvSelectPickerTab('emoji');
emojiButton.setAttribute('aria-controls',emojiTray.id);emojiButton.setAttribute('aria-expanded','false');
emojiButton.onclick=()=>{emojiTray.hidden=!emojiTray.hidden;emojiButton.setAttribute('aria-expanded',String(!emojiTray.hidden))};
emojiTray.addEventListener('keydown',e=>{if(e.key==='Escape'){emojiTray.hidden=true;emojiButton.setAttribute('aria-expanded','false');emojiButton.focus()}});
emojiTray.addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault()});
const send=node('button','primary pvChatSend','Send');
send.type='button';
// The Send control is not a submitter: iOS Safari can dismiss the software
// keyboard when a submit button is tapped, even if input.focus() is called.
// Keep the focused input unchanged and invoke the send action directly.
let pvLastTouchSend=0;
send.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')event.preventDefault()});
send.addEventListener('touchstart',event=>{
 if(send.disabled)return;
 event.preventDefault();
 pvLastTouchSend=Date.now();
 pvSendMessage();
},{passive:false});
send.addEventListener('click',event=>{
 event.preventDefault();
 if(Date.now()-pvLastTouchSend<900)return;
 pvSendMessage();
});
const composerWrap=node('div','pvChatComposerWrap');
// Keep the keyboard anchored to this composer without scrolling the entire fixed DM viewport.
input.addEventListener('focus',pvScheduleMobileDmViewport);
input.addEventListener('blur',pvScheduleMobileDmViewport);
const attach=node('button','pvDmAttachButton','');attach.type='button';attach.title='Camera or media';attach.setAttribute('aria-label','Camera or media');attach.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></svg>';
const fileInput=node('input');fileInput.type='file';fileInput.accept='image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';fileInput.hidden=true;
let pvPendingMedia=null;
const mediaSelection=node('div','pvDmSendPreview');mediaSelection.hidden=true;
const thumb=node('span','pvDmPreviewThumb','📷'),fileSummary=node('div','pvDmPreviewText'),fileTitle=node('span','pvDmPreviewTitle','Attachment'),fileLabel=node('strong',''),removeFile=node('button','','×');
let pvPreviewObjectUrl=null;
removeFile.type='button';removeFile.title='Remove attachment';removeFile.setAttribute('aria-label','Remove attachment');
const revokePreview=()=>{if(pvPreviewObjectUrl){URL.revokeObjectURL(pvPreviewObjectUrl);pvPreviewObjectUrl=null}};
removeFile.onclick=()=>{pvPendingMedia=null;fileInput.value='';mediaSelection.hidden=true;fileLabel.textContent='';thumb.replaceChildren();revokePreview()};
fileSummary.append(fileTitle,fileLabel);mediaSelection.append(thumb,fileSummary,removeFile);
fileInput.onchange=()=>{
 const file=fileInput.files?.[0];if(!file)return;
 const accepted=['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'];
 if(!accepted.includes(file.type)||file.size>30*1024*1024){alert('Choose JPG, PNG, WebP, GIF, MP4 or WebM under 30 MB.');fileInput.value='';return}
 revokePreview();pvPendingMedia=file;mediaSelection.hidden=false;fileLabel.textContent=file.name;
 thumb.replaceChildren();
 if(file.type.startsWith('image/')){const img=node('img');pvPreviewObjectUrl=URL.createObjectURL(file);img.src=pvPreviewObjectUrl;img.alt='Selected photo';thumb.append(img)}
 else thumb.textContent='🎬';
};
attach.onclick=()=>{fileInput.accept='image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';fileInput.click()};
const replyCompose=node('div','pvDmSendPreview pvDmReplyCompose');replyCompose.hidden=true;
const replyInfo=node('div','pvDmPreviewText'),replyHeading=node('span','pvDmPreviewTitle','REPLYING TO'),replyText=node('strong','',''),cancelReply=node('button','','×');cancelReply.type='button';
cancelReply.title='Cancel reply';cancelReply.setAttribute('aria-label','Cancel reply');cancelReply.onclick=()=>{form.dataset.replyTo='';replyCompose.hidden=true};
replyInfo.append(replyHeading,replyText);replyCompose.append(replyInfo,cancelReply);
const gallery=node('button','pvDmGalleryButton');
gallery.type='button';gallery.title='Choose photo or video';gallery.setAttribute('aria-label','Choose photo or video');
gallery.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m4 18 5.3-5.2 3.2 3.1 3.1-3.2L21 18"/></svg>';
gallery.onclick=()=>{fileInput.accept='image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';fileInput.click()};
form.append(attach,input,emojiButton,gallery,send);
composerWrap.append(replyCompose,mediaSelection,fileInput,emojiTray,form);
input.addEventListener('input',()=>{if(input.value.trim()&&!input.disabled)pvOnChatInput(id);else pvClearTyping(id)});
input.addEventListener('blur',()=>{if(input.value.trim())pvClearTyping(id)});
if(pendingOutgoing&&alreadySent){input.disabled=true;send.disabled=true;input.placeholder='Request pending — waiting for acceptance';}
form.addEventListener('submit',event=>{event.preventDefault();pvSendMessage()});
async function pvSendMessage(){
 const body=input.value.trim(),mediaFile=pvPendingMedia,replyTo=form.dataset.replyTo||null;
 if((!body&&!mediaFile)||send.disabled)return;
 pvClearTyping(id);
 // Keep the original input element mounted. Rebuilding renderChat() here
 // makes iOS/Android close the soft keyboard after every message.
 input.value='';
 input.focus({preventScroll:true});
 send.disabled=true;
 let sentMessage=null,uploadedPath=null;
 try{
  if(mediaFile){
   uploadedPath=user.id+'/'+crypto.randomUUID()+(mediaFile.type==='video/mp4'?'.mp4':mediaFile.type==='video/webm'?'.webm':mediaFile.type==='image/png'?'.png':mediaFile.type==='image/webp'?'.webp':mediaFile.type==='image/gif'?'.gif':'.jpg');
   const uploaded=await db.storage.from('pv-dm-media').upload(uploadedPath,mediaFile,{contentType:mediaFile.type});
   if(uploaded.error)throw uploaded.error;
  }
  const payload={sender_id:user.id,recipient_id:id,body,reply_to:replyTo||null,media_path:uploadedPath,media_type:mediaFile?.type||null};
  const response=await db.from('direct_messages').insert(payload).select('id,created_at,body,reply_to,media_path,media_type,sender_id,recipient_id').single();
  if(response.error)throw response.error;
  sentMessage=response.data;
 }catch(error){
  if(uploadedPath)await db.storage.from('pv-dm-media').remove([uploadedPath]).catch(()=>{});
  input.value=body+(input.value?' '+input.value:'');
  input.focus({preventScroll:true});send.disabled=false;
  alert('Unable to send message: '+error.message);return;
 }
 if(mediaFile)removeFile.click();
 form.dataset.replyTo='';replyCompose.hidden=true;
 if(selectedPeer!==id||!list.isConnected)return;
 const today=new Date(sentMessage.created_at),dayKey=today.toDateString();
 if(dayKey!==pvLastMessageDay){
   pvLastMessageDay=dayKey;
   const marker=node('div','pvChatDayDivider',today.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}));marker.dataset.dayKey=dayKey;list.append(marker);
 }
 list.querySelector('.pvChatEmptyMessage')?.remove();
 const row=node('div','pvMessageRow mine'),bubble=node('div','pvBubble mine',body||'');
 row.dataset.messageId=String(sentMessage.id);bubble.title=today.toLocaleString();row.append(bubble);
 if(!list.querySelector('.pvMessageRow[data-message-id="'+String(sentMessage.id)+'"]'))list.append(row);
 pvDmDecorateRows(list);pvDmDecorateContent(list,[sentMessage],id);pvScheduleDmReactionRefresh(120);
 pvDmUpdateReceipt(list,[{id:sentMessage.id,read_at:null}]);
 list.scrollTop=list.scrollHeight;
 if(pendingOutgoing){
   // Preserve the existing single-message request limit.
   input.disabled=true;send.disabled=true;emojiButton.disabled=true;
   input.placeholder='Request pending — waiting for acceptance';
   area.querySelector('.pvPendingRequestNote')?.remove();
   const pendingNote=node('p','pvPendingRequestNote','Request sent. Wait for acceptance, or follow this account to continue.');
   area.insertBefore(pendingNote,list);
 }else{
   send.disabled=false;
   // Keep the keyboard open and let the user send another message immediately.
   if(document.activeElement!==input)input.focus({preventScroll:true});
 }
 pvCheckUnread().catch(err=>console.warn('Unread update:',err));
}area.append(chatTop,pinnedBar);window.PAVORA_CHAT_THEMES?.apply(area,uid,id);pvDmRenderPinBanner(id,visibleMessages);
if(pendingIncoming){const banner=node('div','pvRequestBanner'),description=node('p','','Message request from someone who does not follow you.'),accept=node('button','pvAcceptRequest','Accept'),remove=node('button','pvDeclineRequest','Remove');accept.type=remove.type='button';accept.onclick=async()=>{accept.disabled=true;const {error}=await db.from('message_requests').update({accepted_at:new Date().toISOString()}).eq('recipient_id',user.id).eq('sender_id',id).is('accepted_at',null);if(error){alert('Could not accept request: '+error.message);accept.disabled=false;return}pvInboxTab='Primary';await loadInbox();await pvCheckUnread()};remove.onclick=()=>pvRemoveChat(id);banner.append(description,accept,remove);area.append(banner)}
if(pendingOutgoing){area.append(node('p','pvPendingRequestNote',alreadySent?'Request sent. Wait for acceptance, or follow this account to continue.':'You can send one message request. Follow this account to message freely.'))}
const typingLabel=node('div','pvDmTypingLabel','● typing…');typingLabel.hidden=true;
area.append(list,typingLabel,composerWrap);emojiButton.disabled=input.disabled;pvDmUpdateReceipt(list,visibleMessages);pvDmDecorateRows(list);pvDmDecorateContent(list,visibleMessages,id);pvScheduleDmReactionRefresh(90);pvCheckTyping();
list.scrollTop=list.scrollHeight;
if(pvOpeningSkeleton){
 // Read the final scroll extent after the chat is laid out. Reveal only once.
 // Avoid repeated scroll writes, which visibly bounce the iOS viewport.
 const openingPeer=id;
 requestAnimationFrame(()=>{
  if(selectedPeer!==openingPeer||!list.isConnected)return;
  list.scrollTop=list.scrollHeight;
  pvOpeningSkeleton.remove();
  pvDmPlayOpenPopV143(area,openingPeer);
 });
}
}


// Slide-out navigation and separate Create Post dialog; retain existing publish handlers.
const pvComposer=document.querySelector('#home .composer');
let pvActivityTimer=null,pvActivityReady=false,pvActivityLatest=null,pvActivityBusy=false,pvActivityOpen=false,pvActivityCount=0,pvActivityUserId=null,pvActivityLatestTime=null;
let pvCheckActivity=async()=>{},pvCloseActivity=()=>{},pvSetActivityCount=()=>{};
if(pvComposer){
 pvComposer.classList.add('hide');pvComposer.style.display='none'; // Keep legacy inputs and upload handler for unified Create, but hide old Home composer.
 const pvMenuBtn=node('button','pvTopAction','☰');pvMenuBtn.type='button';pvMenuBtn.title='Open menu';pvMenuBtn.setAttribute('aria-label','Open menu');
 const pvCreateBtn=node('button','pvTopAction pvCreateTop','＋ Create');pvCreateBtn.type='button';
 const pvTop=document.querySelector('header .top');pvTop.insertBefore(pvMenuBtn,pvTop.firstChild);pvTop.append(pvCreateBtn);
 
// Persistent desktop icon rail, with the full menu available from More.
const pvRail=node('nav','pvIconRail');pvRail.setAttribute('aria-label','Main navigation');
const pvIcons={
home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
reels:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M8 3l4 6M15 3l4 6"/><path d="m10 12 5 3-5 3z"/>',
explore:'<circle cx="10.8" cy="10.8" r="7.4"/><path d="m16.2 16.2 5 5"/>',
messages:'<path d="m21 3-8.5 18-3.5-7.5L2 10z"/><path d="M21 3 9 13.5"/>',
profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
create:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 7v10M7 12h10"/>',
more:'<path d="M4 6h16M4 12h16M4 18h16"/>'
};
function pvIconSvg(key){return '<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+pvIcons[key]+'</svg>'}
for(const key of ['home','reels','messages','explore','profile']){
 const b=node('button','pvRailButton');b.innerHTML=pvIconSvg(key);b.type='button';b.dataset.railView=key;b.title=key[0].toUpperCase()+key.slice(1);b.setAttribute('aria-label',b.title);
 b.onclick=()=>{pvNavigate(key);document.body.classList.remove('pvDrawerOpen');pvSyncRail()};
 pvRail.append(b);
}
const pvRailCreate=node('button','pvRailButton');pvRailCreate.innerHTML=pvIconSvg('create');pvRailCreate.type='button';pvRailCreate.title='Create post';pvRailCreate.setAttribute('aria-label','Create post');pvRailCreate.onclick=()=>pvCreateBtn.click();pvRail.insertBefore(pvRailCreate,pvRail.querySelector('[data-rail-view="profile"]'));
const pvRailMore=node('button','pvRailButton pvRailMore');pvRailMore.innerHTML=pvIconSvg('more');pvRailMore.type='button';pvRailMore.title='More options';pvRailMore.setAttribute('aria-label','More options');pvRailMore.onclick=()=>pvMenuBtn.click();pvRail.append(pvRailMore);
document.body.append(pvRail);

/* Social notifications: follows, likes and comments are generated by Supabase triggers. */

const pvActivityPanel=node('section','pvActivityPanel');pvActivityPanel.hidden=true;pvActivityPanel.setAttribute('aria-label','Activity notifications');
const pvActivityHead=node('div','pvActivityHead'),pvActivityTitle=node('strong','','Notifications'),pvActivityClose=node('button','pvActivityClose','×');
pvActivityClose.type='button';pvActivityClose.setAttribute('aria-label','Close notifications');
const pvActivityClear=node('button','pvActivityClear','Clear all');pvActivityClear.type='button';pvActivityClear.title='Clear all notifications';pvActivityClear.setAttribute('aria-label','Clear all notifications');
const pvActivityActions=node('div','pvActivityActions');pvActivityActions.append(pvActivityClear,pvActivityClose);pvActivityHead.append(pvActivityTitle,pvActivityActions);
const pvActivityFilters=node('div','pvActivityFilters');pvActivityFilters.setAttribute('role','group');pvActivityFilters.setAttribute('aria-label','Filter notifications');
const pvActivityList=node('div','pvActivityList');pvActivityPanel.append(pvActivityHead,pvActivityFilters,pvActivityList);document.body.append(pvActivityPanel);
let pvActivityFilter='All',pvActivityCached=[],pvActivityPeople=new Map(),pvActivityFollowed=new Set(),pvActivityPostImages=new Map();
for(const filterName of ['All','People you follow','Comments','Follows','Likes']){const tab=node('button','pvActivityFilter'+(filterName==='All'?' active':''),filterName);tab.type='button';tab.setAttribute('aria-pressed',String(filterName==='All'));tab.onclick=()=>{pvActivityFilter=filterName;pvRenderActivityList()};pvActivityFilters.append(tab)}
function pvActivityRelativeDate(date){const t=new Date(date);return Number.isNaN(t.getTime())?'':t.toLocaleDateString(undefined,{month:'short',day:'numeric'})}
function pvRenderActivityList(){
pvActivityFilters.querySelectorAll('.pvActivityFilter').forEach(button=>{const on=button.textContent===pvActivityFilter;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on))});
pvActivityList.replaceChildren();
const currentMonth=new Date(),matches=pvActivityCached.filter(item=>pvActivityFilter==='All'||pvActivityFilter==='People you follow'&&pvActivityFollowed.has(item.actor_id)||pvActivityFilter==='Comments'&&item.kind==='comment'||pvActivityFilter==='Follows'&&item.kind==='follow'||pvActivityFilter==='Likes'&&item.kind==='like');
if(!matches.length){pvActivityList.append(node('p','pvActivityEmpty',pvActivityCached.length?'No '+pvActivityFilter.toLowerCase()+' notifications yet.':'No notifications yet. Likes, comments and follows will appear here.'));return}
const groupings=[['This month',matches.filter(item=>{const d=new Date(item.created_at);return d.getMonth()===currentMonth.getMonth()&&d.getFullYear()===currentMonth.getFullYear()})],['Earlier',matches.filter(item=>{const d=new Date(item.created_at);return d.getMonth()!==currentMonth.getMonth()||d.getFullYear()!==currentMonth.getFullYear()})]];
for(const [groupTitle,items] of groupings){if(!items.length)continue;const heading=node('h3','pvActivityGroupTitle',groupTitle);pvActivityList.append(heading);
for(const item of items){const person=pvActivityPeople.get(item.actor_id)||{},row=node('div','pvActivityItem'+(!item.read_at?' unread':'')),avatar=node('button','pvActivityAvatar'),words=node('div','pvActivityWords'),content=node('div','pvActivityContent');
avatar.type='button';avatar.setAttribute('aria-label','Open '+(person.username||'creator')+' profile');if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='';avatar.append(img)}else avatar.textContent=(person.display_name||person.username||'P')[0].toUpperCase();avatar.onclick=()=>{pvCloseActivity();openCreator(item.actor_id)};
const line=node('div','pvActivityLine'),name=node('button','pvActivityActor','@'+(person.username||'creator'));name.type='button';name.onclick=()=>{pvCloseActivity();openCreator(item.actor_id)};
const description=item.kind==='follow'?' started following you.':item.kind==='like'?' liked your post.':' commented on your post.';
line.append(name,document.createTextNode(description+' '));const date=node('span','pvActivityDate',pvActivityRelativeDate(item.created_at));line.append(date);words.append(line);
if(item.kind==='comment'&&item.body_preview)words.append(node('div','pvActivityComment','“'+item.body_preview+'”'));
content.append(avatar,words);
row.append(content);
if(item.kind==='follow'){const followed=pvActivityFollowed.has(item.actor_id);const action=node('button','pvActivityFollowAction'+(followed?' following':''),followed?'Following':'Follow Back');action.type='button';action.onclick=async()=>{action.disabled=true;const wasFollowing=pvActivityFollowed.has(item.actor_id);const result=wasFollowing?await db.from('follows').delete().eq('follower_id',user.id).eq('following_id',item.actor_id):await db.from('follows').insert({follower_id:user.id,following_id:item.actor_id});if(result.error){alert('Could not update follow: '+result.error.message);action.disabled=false;return}if(wasFollowing)pvActivityFollowed.delete(item.actor_id);else pvActivityFollowed.add(item.actor_id);pvRenderActivityList();if(pvActivityOpen)await updateSocialProfile()};row.append(action)}
else if(item.post_id){const imageUrl=pvActivityPostImages.get(item.post_id);if(imageUrl){const thumb=node('button','pvActivityThumb');thumb.type='button';thumb.setAttribute('aria-label','View post');const image=node('img');image.src=imageUrl;image.alt='Post thumbnail';thumb.append(image);thumb.onclick=()=>{pvCloseActivity();pvNavigate('home');const post=feed.find(p=>p.id===item.post_id);if(post)openProfilePost({...post,author_name:profile?.username||'creator'})};row.append(thumb)}}
pvActivityList.append(row)}
}
}
const pvActivityBellSvg='<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 10h18c0-2-3-3-3-10"/><path d="M10 22h4"/></svg>';
function pvActivityAlert(){pvShowActivityToast();pvPlayMessageSound()}
function pvShowActivityToast(){if(pvNoticeTimeout)clearTimeout(pvNoticeTimeout);pvNotice.replaceChildren(node('span','','🔔 New activity on PAVORA'));pvNotice.hidden=false;pvNotice.onclick=()=>pvOpenActivity();pvNoticeTimeout=setTimeout(()=>{pvNotice.hidden=true},4200)}
pvSetActivityCount=function(count){pvActivityCount=count;for(const button of document.querySelectorAll('.pvActivityBell')){const badge=button.querySelector('.pvActivityBadge');if(badge){badge.hidden=!count;badge.classList.remove('pvActivityErrorBadge');badge.textContent=count>99?'99+':String(count)}button.title=count?count+' unread activity notifications':'Notifications';button.setAttribute('aria-label',count?'Notifications, '+count+' unread':'Notifications')}}
function pvSetActivityError(message){for(const button of document.querySelectorAll('.pvActivityBell')){const badge=button.querySelector('.pvActivityBadge');if(badge){badge.hidden=false;badge.textContent='!';badge.classList.add('pvActivityErrorBadge')}button.title='Notifications setup needed: '+message}}
pvCloseActivity=function(){pvActivityOpen=false;pvActivityPanel.hidden=true;document.querySelectorAll('.pvActivityBell').forEach(b=>b.classList.remove('active'))}
async function pvOpenActivity(){if(!user)return;pvActivityOpen=!pvActivityOpen;pvActivityPanel.hidden=!pvActivityOpen;document.querySelectorAll('.pvActivityBell').forEach(b=>b.classList.toggle('active',pvActivityOpen));if(pvActivityOpen){await pvLoadActivity(true)}}
pvActivityClear.onclick=async()=>{if(!user||pvActivityClear.disabled)return;if(!confirm('Clear all your notifications? This cannot be undone.'))return;pvActivityClear.disabled=true;pvActivityClear.textContent='Clearing…';try{
const {data:deleted,error}=await db.from('activity_notifications').delete().eq('recipient_id',user.id).select('id');
if(error||(!deleted?.length&&pvActivityList.querySelector('.pvActivityItem'))){alert('Could not clear notifications. Run supabase/clear-activity-notifications.sql in Supabase SQL Editor first. '+(error?.message||'Database delete permission is not enabled.'));return}
pvActivityCached=[];pvRenderActivityList();
pvSetActivityCount(0);pvActivityLatest=null;pvActivityLatestTime=null;pvActivityReady=true;
await pvCheckActivity(false);
}catch(e){alert('Could not clear notifications: '+e.message)}finally{pvActivityClear.disabled=false;pvActivityClear.textContent='Clear all'}};
pvActivityClose.onclick=pvCloseActivity;
document.addEventListener('keydown',e=>{if(e.key==='Escape')pvCloseActivity()});
document.addEventListener('pointerdown',e=>{if(pvActivityOpen&&!e.target.closest('.pvActivityPanel')&&!e.target.closest('.pvActivityBell'))pvCloseActivity()});
function pvMakeBell(extraClass){const b=node('button','pvActivityBell '+extraClass);b.type='button';b.innerHTML=pvActivityBellSvg+'<span class="pvActivityBadge" hidden></span>';b.title='Notifications';b.setAttribute('aria-label','Notifications');b.onclick=pvOpenActivity;return b}
async function pvLoadActivity(markRead=false){if(!user||!pvActivityOpen)return;if(!pvActivityList.querySelector('.pvActivityItem,.pvActivityEmpty'))pvActivityList.replaceChildren(node('p','pvActivityEmpty','Loading notifications…'));
const {data,error}=await db.from('activity_notifications').select('id,actor_id,kind,post_id,body_preview,created_at,read_at').eq('recipient_id',user.id).order('created_at',{ascending:false}).limit(100);
if(error){pvSetActivityError(error.message);pvActivityList.replaceChildren(node('p','pvActivityEmpty','Notifications setup required. Run supabase/activity-notifications.sql in Supabase SQL Editor. '+error.message));return}
const entries=data||[],actors=[...new Set(entries.map(e=>e.actor_id))],postIds=[...new Set(entries.filter(e=>e.post_id).map(e=>e.post_id))];
const requests=[db.from('follows').select('following_id').eq('follower_id',user.id)];
if(actors.length)requests.push(db.from('profiles').select('id,username,display_name,avatar_url').in('id',actors));
if(postIds.length)requests.push(db.from('posts').select('id,image_path').in('id',postIds));
const responses=await Promise.all(requests);
if(responses[0].error)console.warn('Following list could not load:',responses[0].error.message);
pvActivityFollowed=new Set((responses[0].data||[]).map(x=>x.following_id));
pvActivityPeople=new Map(actors.length?(responses[1].data||[]).map(p=>[p.id,p]):[]);
const postsResponse=postIds.length?responses[responses.length-1]:null;
pvActivityPostImages=new Map((postsResponse?.data||[]).filter(p=>p.image_path).map(p=>[p.id,db.storage.from('post-images').getPublicUrl(p.image_path).data.publicUrl]));
pvActivityCached=entries;
pvActivityClear.disabled=!entries.length;
pvRenderActivityList();
if(markRead&&entries.some(x=>!x.read_at)){
const ids=entries.filter(x=>!x.read_at).map(x=>x.id);
const {error:readError}=await db.from('activity_notifications').update({read_at:new Date().toISOString()}).eq('recipient_id',user.id).in('id',ids);
if(!readError){pvSetActivityCount(0);for(const item of entries)item.read_at=item.read_at||new Date().toISOString();pvActivityList.querySelectorAll('.pvActivityItem.unread').forEach(row=>row.classList.remove('unread'))}
}
}
pvCheckActivity=async function(initial=false){if(!user||pvActivityBusy)return;pvActivityBusy=true;try{
const {data,error}=await db.from('activity_notifications').select('id,read_at,created_at').eq('recipient_id',user.id).order('created_at',{ascending:false}).limit(250);
if(error){console.warn('Activity notifications unavailable:',error.message);pvSetActivityError(error.message);return}
const items=data||[];pvSetActivityCount(items.filter(x=>!x.read_at).length);
const newest=items[0]||null;
let shouldRefreshList=false;
if(!pvActivityReady||initial){pvActivityLatest=newest?.id||null;pvActivityLatestTime=newest?.created_at||null;pvActivityReady=true}
else if((newest?.id||null)!==pvActivityLatest){
const isNew=!!newest&&(!pvActivityLatestTime||new Date(newest.created_at)>new Date(pvActivityLatestTime));
pvActivityLatest=newest?.id||null;pvActivityLatestTime=newest?.created_at||null;
shouldRefreshList=true;
if(isNew)pvActivityAlert()
}
if(pvActivityOpen&&shouldRefreshList)await pvLoadActivity(false)
}catch(e){console.warn('Activity notification check failed',e)}finally{pvActivityBusy=false}}
const pvDesktopBell=pvMakeBell('pvRailButton pvDesktopActivity');pvRail.insertBefore(pvDesktopBell,pvRailMore);
const pvMobileBell=pvMakeBell('pvMobileActivity');const pvTopForBell=document.querySelector('header .top');pvTopForBell.append(pvMobileBell);

pvRailBadge=node('span','pvUnreadBadge pvRailUnreadBadge');pvRailBadge.hidden=true;const pvMessageRailButton=pvRail.querySelector('[data-rail-view="messages"]');if(pvMessageRailButton)pvMessageRailButton.append(pvRailBadge);pvSetUnreadBadge(pvUnreadCount);
function pvSyncRail(){pvRail.querySelectorAll('[data-rail-view]').forEach(b=>b.classList.toggle('active',!!document.querySelector('aside.left [data-view="'+b.dataset.railView+'"].active')))}
document.querySelectorAll('aside.left [data-view]').forEach(b=>b.addEventListener('click',()=>setTimeout(pvSyncRail,0)));
// Classic sidebar navigation also uses these buttons: persist its active page.
document.querySelectorAll('aside.left [data-view]').forEach(b=>b.addEventListener('click',()=>{if(user)pvRememberView(b.dataset.view)}));
pvSyncRail();
const pvScrim=node('div','pvDrawerScrim');pvScrim.setAttribute('aria-hidden','true');document.body.append(pvScrim);

 const pvDialog=node('div','pvComposeOverlay');pvDialog.setAttribute('role','dialog');pvDialog.setAttribute('aria-modal','true');pvDialog.setAttribute('aria-label','Create new post');
 const pvCard=node('div','pvComposeCard pvUnifiedCreate');
 pvCard.innerHTML='<div class="pvCreateHeader"><strong>Create new post</strong><button class="pvComposeClose" type="button" aria-label="Close">×</button></div><div class="pvCreateDrop" tabindex="0" role="button" aria-label="Select photo or video"><div class="pvUploadArt"><svg viewBox="0 0 100 90" fill="none" stroke="currentColor" stroke-width="3"><rect x="10" y="15" width="55" height="50" rx="7"/><path d="m13 54 16-16 12 12 9-9 13 13"/><circle cx="25" cy="29" r="5"/><rect x="48" y="30" width="42" height="45" rx="7" fill="#23242a"/><path d="m64 42 16 10-16 10z"/></svg></div><h2>Drag photos and videos here</h2><button class="pvChooseMedia" type="button">Select from computer</button><p class="pvMediaHint">JPG, PNG, WebP · MP4, WebM</p></div><div class="pvCreateSelected hide"><div class="pvCreatePreview"></div><div class="pvCreateDetails"><p class="pvCreateFilename"></p><textarea class="pvCreateCaption" maxlength="1000" placeholder="Write a caption…"></textarea><p class="pvCreateFeedback" role="status"></p><div class="pvCreateButtons"><button type="button" class="pvChangeMedia">Change media</button><button type="button" class="pvUnifiedPublish">Share</button></div></div></div><input type="file" class="pvUnifiedFile" accept="image/jpeg,image/png,image/webp,video/*" hidden>';
 pvDialog.append(pvCard);document.body.append(pvDialog);
 const pvClose=pvCard.querySelector('.pvComposeClose'),pvDrop=pvCard.querySelector('.pvCreateDrop'),pvInput=pvCard.querySelector('.pvUnifiedFile'),pvSelected=pvCard.querySelector('.pvCreateSelected'),pvPreview=pvCard.querySelector('.pvCreatePreview'),pvCaption=pvCard.querySelector('.pvCreateCaption'),pvFeedback=pvCard.querySelector('.pvCreateFeedback'),pvShare=pvCard.querySelector('.pvUnifiedPublish');
 let pvObjectUrl=null,pvUploading=false;
 function pvCloseDrawer(){document.body.classList.remove('pvDrawerOpen')}
 function pvResetMedia(){if(pvObjectUrl){window.URL.revokeObjectURL(pvObjectUrl);pvObjectUrl=null}pvInput.value='';pvPreview.replaceChildren();pvSelected.classList.add('hide');pvDrop.classList.remove('hide');pvCaption.value='';pvFeedback.textContent=''}
 function pvCloseCompose(){if(pvUploading)return;document.body.classList.remove('pvComposeOpen');pvResetMedia()}
 function pvSelectMedia(file){if(!file)return;const types=['image/jpeg','image/png','image/webp'];if(!types.includes(file.type)&&!file.type.startsWith('video/')){pvFeedback.textContent='Choose JPG, PNG, WebP or a supported video.';return}if(pvObjectUrl)window.URL.revokeObjectURL(pvObjectUrl);pvObjectUrl=window.URL.createObjectURL(file);pvPreview.replaceChildren();const media=document.createElement(file.type.startsWith('video/')?'video':'img');media.src=pvObjectUrl;if(media.tagName==='VIDEO'){media.controls=true;media.playsInline=true;media.muted=true}media.alt='Selected media preview';pvPreview.append(media);pvCard.querySelector('.pvCreateFilename').textContent=file.name;pvDrop.classList.add('hide');pvSelected.classList.remove('hide');pvFeedback.textContent=''}
 pvMenuBtn.onclick=()=>document.body.classList.toggle('pvDrawerOpen');
 pvScrim.onclick=pvCloseDrawer;
 pvCreateBtn.onclick=()=>{pvCloseDrawer();document.body.classList.add('pvComposeOpen')};
 pvClose.onclick=pvCloseCompose;
 pvDialog.addEventListener('click',e=>{if(e.target===pvDialog)pvCloseCompose()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){pvCloseDrawer();pvCloseCompose()}});
 document.querySelectorAll('aside.left [data-view]').forEach(b=>b.addEventListener('click',pvCloseDrawer));
 pvDrop.addEventListener('click',e=>{if(e.target.closest('button')||e.target===pvDrop||e.target.closest('.pvUploadArt')||e.target.closest('h2')||e.target.closest('p'))pvInput.click()});
 pvDrop.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pvInput.click()}});
 pvCard.querySelector('.pvChangeMedia').onclick=()=>pvInput.click();
 pvInput.onchange=()=>pvSelectMedia(pvInput.files[0]);
 pvDrop.addEventListener('dragover',e=>{e.preventDefault();pvDrop.classList.add('pvDragOver')});
 pvDrop.addEventListener('dragleave',()=>pvDrop.classList.remove('pvDragOver'));
 pvDrop.addEventListener('drop',e=>{e.preventDefault();pvDrop.classList.remove('pvDragOver');const f=e.dataTransfer.files[0];if(f){const dt=new DataTransfer();dt.items.add(f);pvInput.files=dt.files;pvSelectMedia(f)}});
 pvShare.onclick=async()=>{const file=pvInput.files[0];if(!file||pvUploading||!user)return;pvUploading=true;pvShare.disabled=true;pvShare.textContent='Uploading…';
const kind=file.type.startsWith('video/')?'reel':'post';pvFeedback.textContent='Preparing your '+(kind==='reel'?'video':'photo')+'…';
let path=null,saved=false;
try{
if(kind==='reel'){
if(!file.type.startsWith('video/'))throw Error('Choose a supported video.');
const ready=await window.PAVORA_VIDEO.prepare(file,status=>{pvFeedback.textContent=status});
pvFeedback.textContent='Uploading optimized video ('+(ready.size/1048576).toFixed(1)+' MB)…';
path=user.id+'/'+crypto.randomUUID()+(ready.type==='video/mp4'?'.mp4':'.webm');
await window.PAVORA_UPLOAD.upload(db,'reel-videos',path,ready,{onStatus:status=>{pvFeedback.textContent=status}});
const {data,error}=await db.from('reels').insert({author_id:user.id,caption:pvCaption.value.trim(),video_path:path}).select('id').single();
if(error)throw error;saved=true;
pvCloseComposeAfterUpload();pvNavigate('reels');
try{await loadReels()}catch(e){console.warn('Reels refresh failed after publish:',e)}
pvShowUploadToast('reel',()=>pvFocusPublished('reel',data.id));pvFocusPublished('reel',data.id);
}else{
if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Choose a JPG, PNG or WebP photo under 5 MB.');
const suffix={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}[file.type];
path=user.id+'/'+crypto.randomUUID()+suffix;
await window.PAVORA_UPLOAD.upload(db,'post-images',path,file,{onStatus:status=>{pvFeedback.textContent=status}});
const {data,error}=await db.from('posts').insert({author_id:user.id,caption:pvCaption.value.trim(),image_path:path}).select('id').single();
if(error)throw error;saved=true;
pvCloseComposeAfterUpload();pvNavigate('home');
try{await refresh();await loadOwnPosts()}catch(e){console.warn('Feed refresh failed after publish:',e)}
pvShowUploadToast('post',()=>pvFocusPublished('post',data.id));pvFocusPublished('post',data.id);
}
}catch(e){pvFeedback.textContent=e.message||'Upload failed. Please try again.';if(path&&!saved){try{await db.storage.from(kind==='reel'?'reel-videos':'post-images').remove([path])}catch(err){console.warn('Could not clean up unsuccessful upload:',err)}}}
finally{pvUploading=false;pvShare.disabled=false;pvShare.textContent='Share'}};

 function pvCloseComposeAfterUpload(){document.body.classList.remove('pvComposeOpen');pvResetMedia()}

}

document.getElementById('reset').style.display='none';

async function setSession(session){
const nextUser=session?.user||null;
if(nextUser&&pvSessionInitializing&&pvSessionInitUser===nextUser.id)return pvSessionInitializing;
// Refreshing an already authenticated session must not rebuild the feed,
// messages or profile and must not trigger the login transition again.
if(nextUser&&user?.id===nextUser.id&&pvSessionReadyForUser===nextUser.id)return;
user=nextUser;
if(user)window.PAVORA_PRESENCE?.start(db,user.id);
else window.PAVORA_PRESENCE?.stop();
overlay.classList.toggle('pvAuthHidden',!!user);
signout.style.display=user?'':'none';
if(user){
 document.body.classList.add('pvFeedLoading');
 // Fill the launch frame immediately from last good public posts, then
 // reconcile with Supabase without making users stare at an empty feed.
 pvShowCachedFeed(user.id);
 pvSessionInitUser=user.id;
 pvSessionInitializing=(async()=>{
  // Always reveal within a few seconds if the network stalls.
  const visualFallback=setTimeout(()=>{if(user?.id===nextUser.id)pvRevealApp()},3500);
  try{
   // Restore the requested tab while auth and profile load.
   const profileResult=ensureProfile().then(()=>null,error=>error);
   try{await pvRestoreView()}catch(e){console.warn('Startup route restore:',e)}
   const profileError=await profileResult;
   if(profileError)throw profileError;
   pvSessionReadyForUser=user.id;
   pvStartDmRealtime();
   pvStartLikesRealtime();
   pvStartComments();
   pvStartPostChanges();
   const pvSafeSetup=async(label,fn)=>{try{await fn()}catch(err){console.warn('PAVORA '+label+' setup failed:',err);status.textContent=label+' temporarily unavailable: '+err.message}};
   pvHiddenChats=new Map();pvConversationSettings=new Map();
   // The first visible frame should contain the real feed and real stories.
   // Don't wait for inbox, calls and background notifications before revealing.
   const homeTask=pvSafeSetup('Home feed',refresh);
   const storiesTask=pvSafeSetup('Social suite',async()=>window.PVKit?.init?.());
   const otherTasks=[
    pvSafeSetup('Profile',updateSocialProfile),
    pvSafeSetup('Hidden chats',pvLoadHiddenChats),
    pvSafeSetup('Conversation folders',pvLoadConversationSettings)
   ];
   await Promise.race([Promise.all([homeTask,storiesTask]),new Promise(resolve=>setTimeout(resolve,2800))]);
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   pvRevealApp();
   await Promise.all([homeTask,storiesTask,...otherTasks]);
   if(!user||user.id!==pvSessionInitUser)return;
   pvUnreadAvailable=true;pvLastNotified=null;pvLastNoticeId=null;pvIncomingBaseline=null;pvUnreadInitialized=false;
   await pvSafeSetup('Unread messages',()=>pvCheckUnread(true));
   if(pvUnreadTimer)clearInterval(pvUnreadTimer);
   pvUnreadTimer=setInterval(()=>{if(!document.hidden)pvCheckUnread()},4500);
   if(pvActivityUserId!==user.id){pvActivityUserId=user.id;pvActivityReady=false;pvActivityLatest=null;pvActivityLatestTime=null}
   await pvSafeSetup('Activity notifications',()=>pvCheckActivity(!pvActivityReady));
   if(pvActivityTimer)clearInterval(pvActivityTimer);
   pvActivityTimer=setInterval(()=>{if(!document.hidden)pvCheckActivity()},5500);
  }catch(e){
   console.error('PAVORA startup failed:',e.stack||e);
   status.textContent='App setup error: '+e.message+' — Please refresh. If this continues, send a screenshot.';
  }finally{clearTimeout(visualFallback);pvSessionInitializing=null;pvRevealApp()}
 })();
 await pvSessionInitializing;
}else{
 document.body.classList.remove('pvFeedLoading');
 pvStopDmRealtime();
 pvStopLikesRealtime();
 pvStopComments();
 pvStopPostChanges();
 pvSessionReadyForUser=null;pvSessionInitUser=null;pvSessionInitializing=null;
 window.PVKit?.cleanup?.();pvCloseActivity();
 if(pvActivityTimer){clearInterval(pvActivityTimer);pvActivityTimer=null}
 pvActivityUserId=null;pvActivityReady=false;pvActivityLatest=null;pvActivityLatestTime=null;pvSetActivityCount(0);
 pvRestoredForUser=null;selectedPeer=null;pvHiddenChats=new Map();pvConversationSettings=new Map();
 if(pvUnreadTimer){clearInterval(pvUnreadTimer);pvUnreadTimer=null}pvSetUnreadBadge(0);
 pvLastNotified=null;pvLastNoticeId=null;pvIncomingBaseline=null;pvUnreadInitialized=false;
 if(chatPoll){clearInterval(chatPoll);chatPoll=null}
 profile=null;feed=[];document.getElementById('posts').replaceChildren();status.textContent='Sign in to access the cloud feed.';
}
pvRevealApp();
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user){pvCheckUnread();pvCheckActivity();pvScheduleLikesSync(100);pvScheduleComments(100)}});
// Restore a saved session before considering the user logged out. Supabase can
// emit INITIAL_SESSION while refresh and token recovery are still in progress.
db.auth.onAuthStateChange((event,session)=>{
if(event==='SIGNED_OUT'){if(!pvAuthBootstrapped&&!pvExplicitSignout)return;setTimeout(()=>setSession(null).catch(e=>console.warn('Logout failed:',e)),0);return}
if(!session?.user)return;
if(event==='TOKEN_REFRESHED'&&user?.id===session.user.id)return;
setTimeout(()=>setSession(session).catch(e=>console.warn('Session setup failed:',e)),0)
});
try{
const {data,error}=await pvAuthTimeout(db.auth.getSession(),20000);
if(error)throw error;
pvAuthBootstrapped=true;
if(data?.session?.user)await setSession(data.session);
else if(!user)await setSession(null);
}catch(e){
pvAuthBootstrapped=true;
pvRevealApp();
msg('Could not restore your saved login. Check your connection, then refresh.');
console.warn('Initial session unavailable:',e.message)
}
})();