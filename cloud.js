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
overlay.innerHTML=`<section class="authShowcase"><div class="authLogo">PAVORA ✦</div><h1>Share moments.<br><em>Make connections.</em></h1><p>Your space to share photos, discover creators, and stay close to the people who matter.</p><div class="authArt" aria-hidden="true"><div class="authArtCard">📷</div><div class="authArtCard">💜</div><div class="authArtCard">✨</div></div></section><section class="authRight"><div id="authBox"><div class="authLogo" style="margin-bottom:28px">PAVORA ✦</div><h2 id="authHeading">Log in to PAVORA</h2><p class="authSub" id="authSubtitle">Welcome back! Enter your details to continue.</p><form id="authForm"><div id="authNameWrap" hidden><label for="authName">Full name</label><input id="authName" type="text" placeholder="Your name" autocomplete="name" maxlength="60"></div><div id="authUsernameWrap" hidden><label for="authUsername">Username</label><input id="authUsername" type="text" placeholder="Choose a username" autocomplete="username" maxlength="24" pattern="[A-Za-z0-9_]{3,24}"></div><div class="pvAuthMethods" id="pvAuthMethods"><button type="button" class="pvAuthMethod active" id="pvMethodEmail" aria-pressed="true">✉ Email</button><button type="button" class="pvAuthMethod" id="pvMethodPhone" aria-pressed="false" disabled title="Mobile signup will launch when SMS verification is available">📱 Phone · Soon</button></div><div id="pvEmailWrap"><label for="authEmail">Email address</label><input id="authEmail" type="email" placeholder="you@example.com" required autocomplete="email"></div><div id="pvPhoneWrap" hidden><label for="authPhone">Mobile number (India)</label><div class="pvPhoneInput"><span>+91</span><input id="authPhone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="9876543210" maxlength="10" pattern="[6-9][0-9]{9}"></div><small>Phone signup requires SMS verification.</small></div><div id="pvOtpWrap" hidden><label for="pvOtp">SMS verification code</label><input id="pvOtp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]{4,8}" placeholder="Enter the code sent by SMS"><button type="button" class="authLink" id="pvOtpResend">Resend code</button></div><label for="authPassword">Password</label><div class="authPasswordRow"><input id="authPassword" type="password" placeholder="At least 6 characters" required minlength="6" autocomplete="current-password"><button type="button" id="authTogglePassword">Show</button></div><div id="authConfirmWrap" hidden><label for="authConfirm">Confirm password</label><input id="authConfirm" type="password" placeholder="Enter password again" autocomplete="new-password"></div><button class="authMainBtn" id="authSubmit" type="submit">Log in</button></form><div class="authCenter"><button class="authLink" id="authForgot" type="button">Forgot password?</button></div><div class="authDivider">OR</div><button class="authSwitch" id="signup" type="button">Create new account</button><p id="authMsg" role="status" aria-live="polite"></p><p class="authTerms">By continuing, you agree to use PAVORA respectfully.</p></div></section>`;
document.body.append(overlay);
const status=document.createElement('p');status.id='cloudStatus';status.textContent='Connecting to PAVORA Cloud…';document.querySelector('.feed').prepend(status);
const signout=document.createElement('button');signout.id='signout';signout.className='secondary';signout.textContent='Log out';document.querySelector('.top').append(signout);
const msg=t=>document.getElementById('authMsg').textContent=t;
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
function setAuthMode(mode){authMode=mode;pvPhonePending='';document.getElementById('pvOtpWrap').hidden=true;document.getElementById('pvOtp').required=false;document.getElementById('pvAuthMethods').hidden=mode==='reset';document.getElementById('pvEmailWrap').hidden=mode!=='reset'&&pvAuthMethod==='phone';document.getElementById('pvPhoneWrap').hidden=mode==='reset'||pvAuthMethod==='email';document.getElementById('authEmail').required=mode==='reset'||pvAuthMethod==='email';document.getElementById('authPhone').required=mode!=='reset'&&pvAuthMethod==='phone';msg('');const signup=mode==='signup',reset=mode==='reset';document.getElementById('authNameWrap').hidden=!signup;document.getElementById('authUsernameWrap').hidden=!signup;document.getElementById('authConfirmWrap').hidden=!signup;document.getElementById('authName').required=signup;document.getElementById('authUsername').required=signup;document.getElementById('authConfirm').required=signup;document.getElementById('authPassword').required=!reset;document.getElementById('authPassword').closest('.authPasswordRow').previousElementSibling.hidden=reset;document.getElementById('authPassword').closest('.authPasswordRow').hidden=reset;document.getElementById('authHeading').textContent=signup?'Create your account':reset?'Reset your password':'Log in to PAVORA';document.getElementById('authSubtitle').textContent=signup?'Join PAVORA in a few easy steps.':reset?'We will send you a password reset link.':'Welcome back! Enter your details to continue.';document.getElementById('authSubmit').textContent=signup?'Create account':reset?'Send reset link':'Log in';document.getElementById('signup').textContent=signup||reset?'Back to log in':'Create new account';document.getElementById('authForgot').hidden=signup||reset||pvAuthMethod==='phone';document.getElementById('authPassword').autocomplete=signup?'new-password':'current-password'}
document.getElementById('signup').onclick=()=>setAuthMode(authMode==='login'?'signup':'login');
document.getElementById('authForgot').onclick=()=>setAuthMode('reset');
document.getElementById('authTogglePassword').onclick=()=>{const input=document.getElementById('authPassword');input.type=input.type==='password'?'text':'password';document.getElementById('authTogglePassword').textContent=input.type==='password'?'Show':'Hide'};
document.getElementById('authForm').onsubmit=async e=>{
e.preventDefault();
const email=document.getElementById('authEmail').value.trim();
const phoneInput=document.getElementById('authPhone').value.trim();
const phone='+91'+phoneInput;
const usingPhone=pvAuthMethod==='phone'&&authMode!=='reset';
const password=document.getElementById('authPassword').value;
const btn=document.getElementById('authSubmit');
if(pvPhonePending){
 const token=document.getElementById('pvOtp').value.trim();
 if(!/^[0-9]{4,8}$/.test(token))return msg('Enter the 6-digit SMS verification code.');
 btn.disabled=true;msg('Verifying mobile number…');
 try{const {data,error}=await pvAuthTimeout(db.auth.verifyOtp({phone:pvPhonePending,token,type:'sms'}));if(error)throw error;pvPhonePending='';msg('Mobile number verified! Opening PAVORA…');if(data?.session)await setSession(data.session);else setAuthMode('login')}catch(err){msg(err.message||'Invalid or expired code. Try again.')}finally{btn.disabled=false}
 return;
}
if(usingPhone&&!/^[6-9][0-9]{9}$/.test(phoneInput))return msg('Enter a valid 10-digit Indian mobile number.');
if(!usingPhone&&!email)return msg('Please enter your email.');
if(authMode==='signup'&&password!==document.getElementById('authConfirm').value)return msg('Passwords do not match.');
btn.disabled=true;msg(authMode==='login'?'Logging in…':authMode==='signup'?'Creating your account…':'Sending reset link…');
try{
 if(authMode==='login'){
  const credentials=usingPhone?{phone,password}:{email,password};
  const {data,error}=await pvAuthTimeout(db.auth.signInWithPassword(credentials));
  if(error)throw error;
  if(data?.session){msg('Login successful! Opening PAVORA…');await setSession(data.session)}
  else throw Error('No session returned. Please try again.');
 }else if(authMode==='reset'){
  const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:'https://max791687.github.io/pavora/'});
  if(error)throw error;msg('If this email has an account, a reset link will arrive shortly. Check spam too.');
 }else{
  const username=document.getElementById('authUsername').value.trim(),display_name=document.getElementById('authName').value.trim();
  if(!/^[a-zA-Z0-9_]{3,24}$/.test(username))throw Error('Username must be 3–24 letters, numbers or underscores.');
  const {data:existing,error:lookupError}=await db.from('profiles').select('id').eq('username',username).maybeSingle();
  if(lookupError)throw lookupError;if(existing)throw Error('This username is already taken. Try another.');
  const credentials=usingPhone?{phone,password,options:{data:{username,display_name}}}:{email,password,options:{emailRedirectTo:'https://max791687.github.io/pavora/',data:{username,display_name}}};
  const {data,error}=await pvAuthTimeout(db.auth.signUp(credentials));
  if(error)throw error;
  if(data?.session){msg('Account created! Opening PAVORA…');await setSession(data.session)}
  else if(usingPhone){
   pvPhonePending=phone;document.getElementById('pvOtpWrap').hidden=false;
   document.getElementById('pvOtp').required=true;
   document.getElementById('pvOtp').value='';
   document.getElementById('authNameWrap').hidden=true;document.getElementById('authUsernameWrap').hidden=true;document.getElementById('authConfirmWrap').hidden=true;document.getElementById('authName').required=false;document.getElementById('authUsername').required=false;document.getElementById('authConfirm').required=false;document.getElementById('authPhone').required=false;
   document.getElementById('authPassword').closest('.authPasswordRow').hidden=true;
   document.getElementById('authPassword').required=false;
   document.getElementById('pvPhoneWrap').hidden=true;
   document.getElementById('pvAuthMethods').hidden=true;
   document.getElementById('authSubmit').textContent='Verify phone';
   msg('We sent a verification code to '+phone+'. Enter it to finish signup.');
   document.getElementById('pvOtp').focus();
  }else msg('Account created! Check your email to confirm, then log in.');
 }
}catch(err){
 const raw=String(err?.message||'Something went wrong. Please try again.');
 const code=String(err?.code||'').toLowerCase();
 if(usingPhone&&(/sms provider|sms.*disabled|phone.*disabled|unsupported provider|provider is not enabled/i.test(raw)))msg('Phone signup needs an SMS provider. PAVORA admin: enable Phone in Supabase Authentication → Sign In / Providers and configure SMS delivery.');
 else if(code==='over_email_send_rate_limit'||/email rate limit exceeded/i.test(raw))msg('Signup email sending limit reached. Try later or ask the admin to configure Custom SMTP.');
 else if(err?.status===429||/rate limit/i.test(raw))msg('Too many attempts right now. Please try again later.');
 else msg(raw);
}finally{btn.disabled=false}
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
  if(comments&&!comments.disabled)comments.textContent='💬 '+(post.comments||[]).length+' Comments';
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

async function refresh(){if(!user)return;try{status.textContent='Loading cloud posts…';const {data,error}=await db.from('posts').select('id,author_id,caption,image_path,created_at').order('created_at',{ascending:false}).limit(50);if(error){status.textContent='Cloud feed error: '+error.message;return}const freshFeed=data||[];const oldIds=feed.map(p=>p.id).join(',');const newIds=freshFeed.map(p=>p.id).join(',');const hasRenderedFeed=oldIds===newIds&&freshFeed.length>0&&!!document.getElementById('posts')?.children.length;feed=freshFeed;const ids=feed.map(p=>p.id);if(ids.length){const [profiles,likes,comments]=await Promise.all([db.from('profiles').select('id,username,display_name,avatar_url').in('id',[...new Set(feed.map(p=>p.author_id))]),db.from('likes').select('post_id,user_id').in('post_id',ids),db.from('comments').select('id,post_id,user_id,body').in('post_id',ids)]);if(profiles.error||likes.error||comments.error){status.textContent='Cloud posts loaded; some social details unavailable: '+[profiles.error,likes.error,comments.error].filter(Boolean).map(e=>e.message).join('; ')}const names=new Map((profiles.data||[]).map(p=>[p.id,p]));feed.forEach(p=>{p.profiles=names.get(p.author_id)||null;p.likes=(likes.data||[]).filter(x=>x.post_id===p.id);p.comments=(comments.data||[]).filter(x=>x.post_id===p.id)})}if(!status.textContent.startsWith('Cloud posts loaded'))status.textContent='☁ Cloud feed · '+feed.length+' posts';if(!hasRenderedFeed)draw();else pvUpdateRenderedFeedStats();pvRememberFeed()}finally{document.body.classList.remove('pvFeedLoading')}}
function node(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function draw(){const root=document.getElementById('posts');root.replaceChildren();feed.forEach((p,postIndex)=>{const card=node('article','post'),head=node('div','posthead');card.id='pv-post-'+p.id;const authorAvatar=node('div','profilepic');const authorName=p.profiles?.display_name||p.profiles?.username||'P';if(p.profiles?.avatar_url){const avatarImg=node('img');avatarImg.src=p.profiles.avatar_url;avatarImg.alt=authorName+' profile photo';avatarImg.loading='lazy';avatarImg.onerror=()=>{authorAvatar.replaceChildren();authorAvatar.textContent=authorName[0].toUpperCase()};authorAvatar.append(avatarImg)}else authorAvatar.textContent=authorName[0].toUpperCase();head.append(authorAvatar);const who=node('div');who.append(pvProfileButton({id:p.author_id,username:p.profiles?.username||'creator'}),node('div','muted',new Date(p.created_at).toLocaleString()));if(p.author_id===pvOfficialId)who.querySelector('.pvPersonButton')?.after(pvOfficialBadge());head.append(who);card.append(head);if(p.caption)card.append(node('div','postbody',p.caption));if(p.image_path){const image=node('img');image.src=db.storage.from('post-images').getPublicUrl(p.image_path).data.publicUrl;image.alt='Post photo';image.loading=postIndex<2?'eager':'lazy';image.decoding='async';if(postIndex===0)image.fetchPriority='high';card.append(image)}const foot=node('div','postfoot');let liked=(p.likes||[]).some(l=>l.user_id===user.id);
const like=node('button','',(liked?'♥':'♡')+' '+(p.likes||[]).length+' Likes');
like.dataset.pvLikePost=p.id;
like.onclick=async()=>{
 if(like.disabled)return;
 const previousLikes=[...(p.likes||[])],wasLiked=liked;
 liked=!wasLiked;
 p.likes=wasLiked?previousLikes.filter(l=>l.user_id!==user.id):[...previousLikes,{post_id:p.id,user_id:user.id}];
 like.textContent=(liked?'♥':'♡')+' '+p.likes.length+' Likes';
 like.disabled=true;
 try{
  const result=wasLiked?await db.from('likes').delete().eq('post_id',p.id).eq('user_id',user.id):await db.from('likes').insert({post_id:p.id,user_id:user.id});
  if(result.error)throw result.error;
 }catch(e){
  liked=wasLiked;p.likes=previousLikes;
  like.textContent=(liked?'♥':'♡')+' '+p.likes.length+' Likes';
  alert('Could not update Like: '+e.message);
 }finally{like.disabled=false}
};const comments=node('button','', '💬 '+(p.comments||[]).length+' Comments');const section=node('div');section.hidden=true;(p.comments||[]).forEach(c=>section.append(node('div','commentline',c.body)));const input=node('input','comment');input.placeholder='Write a comment and press Enter';input.maxLength=500;input.onkeydown=async e=>{if(e.key==='Enter'&&input.value.trim()){input.disabled=true;const {error}=await db.from('comments').insert({post_id:p.id,user_id:user.id,body:input.value.trim()});if(error)alert(error.message);await refresh()}};comments.onclick=()=>{section.hidden=!section.hidden};section.append(input);foot.append(like,comments,section);try{window.PVKit?.addPostSave?.(p,foot)}catch(e){console.warn('Post save:',e)}if(p.author_id===user.id){const del=node('button','','Delete');del.onclick=async()=>{if(!confirm('Delete your post?'))return;const {error}=await db.from('posts').delete().eq('id',p.id);if(error)alert(error.message);await refresh()};foot.append(del)}card.append(foot);root.append(card)});if(!feed.length)root.append(node('div','empty','No cloud posts yet. Share the first one!'));if(document.getElementById('stats'))document.getElementById('stats').textContent=feed.filter(p=>p.author_id===user.id).length+' posts · @'+(profile?.username||'creator')}
document.getElementById('publish').onclick=async()=>{if(!user)return;const caption=document.getElementById('caption').value.trim(),file=document.getElementById('photo').files[0];if(!caption&&!file)return alert('Add a caption or photo');if(caption.length>2200)return alert('Caption too long');const btn=document.getElementById('publish');btn.disabled=true;btn.textContent='Posting…';try{let image_path=null;if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Only JPG, PNG or WebP under 5MB allowed');image_path=user.id+'/'+crypto.randomUUID()+'.'+({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type]);const {error}=await db.storage.from('post-images').upload(image_path,file,{contentType:file.type});if(error)throw error}const {error}=await db.from('posts').insert({author_id:user.id,caption,image_path});if(error)throw error;document.getElementById('caption').value='';document.getElementById('photo').value='';document.getElementById('filename').textContent='';await refresh();await loadOwnPosts();if(status.textContent.startsWith('Cloud feed error'))alert('Post saved, but feed could not load: '+status.textContent)}catch(e){alert(e.message)}finally{btn.disabled=false;btn.textContent='Publish'}};

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
const pvSettingsItems=[
 {key:'overview',icon:'◎',title:'Accounts Center',category:'Your account'},
 {key:'edit',icon:'♙',title:'Edit profile',category:'How you use PAVORA'},
 {key:'notifications',icon:'♧',title:'Notifications',category:'How you use PAVORA'},
 {key:'privacy',icon:'◈',title:'Account privacy',category:'Who can see your content'},
 {key:'requests',icon:'✉',title:'Follow requests',category:'Who can see your content'},
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
 const meta=node('div','pvVirtualMeta');meta.append(node('span','','3 posts'),node('span','','Creative concepts'));
 details.append(meta);
 const actions=node('div','pvVirtualActions'),message=node('button','','Message'),exploreBtn=node('button','secondary','Explore creators');
 message.onclick=()=>pvOpenVirtualChat(person);
 exploreBtn.onclick=back.onclick;
 actions.append(message,exploreBtn);details.append(actions);head.append(avatar,details);
 const grid=node('div','pvVirtualPostGrid');
 person.posts.forEach((content,i)=>{
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
}
let pvProfileMediaTab='posts',pvOwnPosts=[],pvOwnReels=[];
function pvDrawOwnMedia(){const grid=document.getElementById('pvPostGrid');if(!grid)return;grid.replaceChildren();
document.getElementById('pvAllMediaTab')?.classList.toggle('active',pvProfileMediaTab==='posts');
document.getElementById('pvReelsMediaTab')?.classList.toggle('active',pvProfileMediaTab==='reels');
const all=[...pvOwnPosts.map(p=>({...p,kind:'post'})),...pvOwnReels.map(r=>({...r,kind:'reel'}))].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
const shown=all.filter(x=>x.kind===(pvProfileMediaTab==='reels'?'reel':'post'));
if(!shown.length){grid.append(node('div','pvNoPosts',pvProfileMediaTab==='reels'?'No Reels uploaded yet.':'No posts yet. Share your first update!'));return}
for(const item of shown){const tile=node('button','pvTile'+(item.kind==='reel'?' pvProfileReelTile':''));tile.type='button';tile.title=item.caption||'View '+item.kind;
if(item.kind==='post'){if(item.image_path){const img=node('img');img.loading='lazy';img.alt=item.caption||'Your post';img.src=db.storage.from('post-images').getPublicUrl(item.image_path).data.publicUrl;tile.append(img)}else{tile.classList.add('pvTextTile');tile.append(node('span','',item.caption||'Text post'))}tile.onclick=()=>openProfilePost(item)}
else{const video=node('video');video.muted=true;video.playsInline=true;video.preload='metadata';video.src=db.storage.from('reel-videos').getPublicUrl(item.video_path).data.publicUrl;tile.append(video,node('span','pvProfileReelBadge','▶'));tile.onclick=()=>{pvNavigate('reels');loadReels().then(()=>document.getElementById('reel-'+item.id)?.scrollIntoView({behavior:'smooth',block:'center'}))}}
grid.append(tile)}
}
async function loadOwnPosts(){if(!user)return;const uid=user.id;const grid=document.getElementById('pvPostGrid');if(!grid)return;
const [postsResult,reelsResult]=await Promise.all([
db.from('posts').select('id,caption,image_path,created_at',{count:'exact'}).eq('author_id',uid).order('created_at',{ascending:false}).limit(100),
db.from('reels').select('id,caption,video_path,created_at',{count:'exact'}).eq('author_id',uid).order('created_at',{ascending:false}).limit(100)
]);
if(uid!==user?.id)return;
pvOwnPosts=postsResult.data||[];pvOwnReels=reelsResult.data||[];
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
reelsView.replaceChildren();
const reelsStyles=document.createElement('style');reelsStyles.textContent=`
.reelComposer{padding:16px;background:#171827;border:1px solid #303044;border-radius:16px;margin:12px 0}.reelComposer input,.reelComposer textarea{display:block;width:100%;padding:10px;margin:9px 0;background:#10111f;color:#fff;border:1px solid #39364f;border-radius:10px}.reelCard{background:#171827;border:1px solid #303044;border-radius:16px;margin:16px auto;overflow:hidden;max-width:470px}.reelCard video{width:100%;max-height:75vh;aspect-ratio:9/16;object-fit:contain;background:#000;display:block}.reelInfo{padding:12px 15px}.reelInfo p{white-space:pre-wrap;overflow-wrap:anywhere}.reelInfo button{margin-top:8px}`;document.head.append(reelsStyles);
const reelForm=document.createElement('form');reelForm.className='reelComposer';reelForm.innerHTML='<h2>Reels ▣</h2><p class="muted">Upload an MP4 or WebM video. Upload size depends on your Supabase project limits. Videos are public.</p><input id="reelVideo" type="file" accept="video/mp4,video/webm" required><textarea id="reelCaption" maxlength="1000" placeholder="Write a reel caption…"></textarea><button class="primary" type="submit">Upload Reel</button><p id="reelFeedback" class="hint" role="status"></p>';reelsView.append(reelForm);reelForm.classList.add('hide');const reelUploadToggle=node('button','pvReelUploadToggle','＋ Create Reel');reelUploadToggle.type='button';reelUploadToggle.onclick=()=>{reelForm.classList.toggle('hide');if(!reelForm.classList.contains('hide'))reelForm.scrollIntoView({behavior:'smooth',block:'start'})};reelsView.insertBefore(reelUploadToggle,reelForm);
const reelList=document.createElement('div');reelList.id='reelList';reelsView.append(reelList);
let reelObserver=null,pvReelsLoading=null,pvReelsLoadedAt=0,pvReelsLoadedFor=null;
async function loadReels(force=false){
 if(!user)return;
 const list=document.getElementById('reelList');
 if(!force&&pvReelsLoadedFor===user.id&&list.querySelector('.pvReelCard')&&Date.now()-pvReelsLoadedAt<120000){
  const stack=list.querySelector('.pvReelStack');
  if(document.body.classList.contains('pvReelsMode')&&stack){
   const cards=[...stack.querySelectorAll('.pvReelCard')];
   const restored=Number(stack.dataset.activeReel);
   const index=Math.min(cards.length-1,Math.max(0,Number.isFinite(restored)?restored:Math.round(stack.scrollTop/(stack.clientHeight||1))));
   cards.forEach((card,i)=>{const v=card.querySelector('video');if(v){if(i===index)v.play().catch(()=>{});else v.pause()}});
  }
  return;
 }
 if(pvReelsLoading)return pvReelsLoading;
 pvReelsLoading=(async()=>{
 if(!list.querySelector('.pvReelCard'))list.replaceChildren(node('p','muted','Loading reels…'));const {data,error}=await db.from('reels').select('id,author_id,caption,video_path,created_at').order('created_at',{ascending:false}).limit(40);if(error){list.replaceChildren(node('p','muted','Reels unavailable: '+error.message));return}list.replaceChildren();if(!data?.length){list.append(node('div','empty','No Reels yet. Upload your first video with ＋ Create Reel.'));return}
const {data:authors}=await db.from('profiles').select('id,username,display_name,avatar_url').in('id',[...new Set(data.map(r=>r.author_id))]);const people=new Map((authors||[]).map(p=>[p.id,p]));if(reelObserver)reelObserver.disconnect();
if(window.pvReelsWheelCleanup)window.pvReelsWheelCleanup();
const reelStage=node('div','pvReelStage'),reelStack=node('div','pvReelStack'),arrows=node('div','pvReelArrows'),up=node('button','pvReelArrow','↑'),down=node('button','pvReelArrow','↓');up.type=down.type='button';up.title='Previous reel';down.title='Next reel';arrows.append(up,down);reelStage.append(reelStack,arrows);list.append(reelStage);
const cards=[];
function reelSvg(path){return '<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>'}
function reelAction(label,svg,handler){const b=node('button','pvReelAction');b.type='button';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=reelSvg(svg);b.onclick=handler;return b}
let current=0,gestureLocked=false,gestureTimer=null,touchStartY=null,touchStartX=null,touchConsumed=false;

let desktopWheelLastAt=0,desktopWheelGestureAt=0,desktopWheelDirection=0;
const videoFor=index=>cards[index]?.querySelector('video');
function pvActivateReel(index){
 if(!cards.length||!document.body.classList.contains('pvReelsMode'))return;
 cards.forEach((card,i)=>{
  const v=card.querySelector('video');if(!v)return;
  if(i===index){
   if(v.preload==='none')v.preload='metadata';
   if(v.paused)v.play().catch(()=>{});
  }else if(!v.paused)v.pause();
 });
 // Prepare the next and previous clip so a swipe does not wait for metadata.
 for(const nearby of [index-1,index+1]){
  const adjacent=videoFor(nearby);
  if(adjacent&&adjacent.preload==='none')adjacent.preload='metadata';
 }
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
 if(next===current)return;
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
video.src=db.storage.from('reel-videos').getPublicUrl(reel.video_path).data.publicUrl;video.loop=true;video.playsInline=true;video.muted=true;video.defaultMuted=true;video.autoplay=false;video.preload=cards.length<2?'metadata':'none';video.controls=false;video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-label','Reel by '+(person.username||'creator'));
const avatar=node('div','pvReelAvatar');if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='';avatar.append(img)}else avatar.textContent=(person.username||'P')[0].toUpperCase();
const who=node('button','pvReelCreator','@'+(person.username||'creator'));who.type='button';who.onclick=()=>openCreator(reel.author_id);author.append(avatar,who);
if(reel.author_id!==user.id){const follow=node('button','pvReelFollow','View profile');follow.type='button';follow.onclick=()=>openCreator(reel.author_id);author.append(follow)}
meta.append(author,node('p','pvReelCaption',reel.caption||''));screen.append(video,meta);
const togglePlay=()=>{if(video.paused)video.play().catch(()=>{});else video.pause()};video.addEventListener('click',togglePlay);
const play=reelAction('Play or pause','<path d="m9 6 10 6-10 6z"/>',togglePlay);play.classList.add('pvReelPlay');screen.append(play);video.addEventListener('play',()=>play.classList.add('hide'));video.addEventListener('pause',()=>play.classList.remove('hide'));
const sound=reelAction('Mute or unmute','<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 9a4 4 0 0 1 0 6"/>',()=>{video.muted=!video.muted;sound.classList.toggle('pvMuted',video.muted)});video.muted=true;sound.classList.add('pvMuted');sound.classList.add('pvReelSound');screen.append(sound);
actions.append(reelAction('Share reel','<path d="m21 3-8.5 18-3.5-7.5L2 10z"/><path d="M21 3 9 13.5"/>',async()=>{const link=location.href.split('#')[0]+'#reel-'+reel.id;try{if(navigator.share)await navigator.share({title:'PAVORA Reel',url:link});else if(navigator.clipboard){await navigator.clipboard.writeText(link);alert('Reel link copied!')}else prompt('Copy reel link:',link)}catch(e){if(e.name!=='AbortError')alert('Unable to share reel')}}));
actions.append(reelAction('More options','<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',()=>{if(reel.author_id!==user.id){alert('More options coming soon.');return}if(!confirm('Delete your Reel permanently?'))return;(async()=>{const result=await db.from('reels').delete().eq('id',reel.id).eq('author_id',user.id);if(result.error){alert(result.error.message);return}await db.storage.from('reel-videos').remove([reel.video_path]);await loadReels()})()}));
card.append(screen,actions);reelStack.append(card);cards.push(card);card.id='reel-'+reel.id;
try{window.PVKit?.addReel?.(reel,actions,video)}catch(e){console.warn('Reel extras:',e)}
}
// Single playback controller above owns play/pause: no IntersectionObserver races.
if(reelObserver){reelObserver.disconnect();reelObserver=null}
pvReelsLoadedAt=Date.now();pvReelsLoadedFor=user.id;
requestAnimationFrame(()=>{goTo(0,'auto');pvActivateReel(0)});
const hash=location.hash.slice(1);if(hash.startsWith('reel-')){const target=document.getElementById(hash);if(target)setTimeout(()=>goTo(cards.indexOf(target),'auto'),100)}
})().finally(()=>{pvReelsLoading=null});
return pvReelsLoading;
}
reelForm.onsubmit=async event=>{event.preventDefault();if(!user)return;const file=document.getElementById('reelVideo').files[0],caption=document.getElementById('reelCaption').value.trim(),feedback=document.getElementById('reelFeedback'),btn=reelForm.querySelector('button');if(!file||!['video/mp4','video/webm'].includes(file.type)){feedback.textContent='Choose an MP4 or WebM video. Your Supabase project may limit upload size.';return}btn.disabled=true;feedback.textContent='Uploading video…';let path=null;try{path=user.id+'/'+crypto.randomUUID()+(file.type==='video/mp4'?'.mp4':'.webm');const upload=await db.storage.from('reel-videos').upload(path,file,{contentType:file.type});if(upload.error)throw upload.error;const result=await db.from('reels').insert({author_id:user.id,caption,video_path:path});if(result.error)throw result.error;feedback.textContent='Reel published!';reelForm.reset();await loadReels(true)}catch(e){feedback.textContent=e.message;if(path)await db.storage.from('reel-videos').remove([path])}finally{btn.disabled=false}};
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
async function loadChatHistory(){if(!user||!chatRecipient||chatLoading)return;chatLoading=true;const partner=chatRecipient.id,root=document.getElementById('chatHistory');try{const {data,error}=await db.from('direct_messages').select('id,sender_id,recipient_id,body,created_at,read_at').or('and(sender_id.eq.'+user.id+',recipient_id.eq.'+partner+'),and(sender_id.eq.'+partner+',recipient_id.eq.'+user.id+')').order('created_at',{ascending:false}).limit(100);if(error)throw error;if(chatRecipient?.id!==partner)return;root.replaceChildren();for(const m of (data||[]).reverse()){const bubble=node('div','bubble'+(m.sender_id===user.id?' mine':''),m.body);bubble.append(node('small','',new Date(m.created_at).toLocaleString()));root.append(bubble)}if(!data?.length)root.append(node('p','muted','No messages yet. Say hello!'));root.scrollTop=root.scrollHeight;document.getElementById('chatFeedback').textContent=''}catch(e){document.getElementById('chatFeedback').textContent='Chat unavailable: '+e.message+' — run supabase/messages.sql in Supabase SQL Editor.'}finally{chatLoading=false}}
document.getElementById('chatForm').onsubmit=async e=>{e.preventDefault();if(!user||!chatRecipient){document.getElementById('chatFeedback').textContent='Select a person first.';return}const input=document.getElementById('chatText'),body=input.value.trim(),button=e.currentTarget.querySelector('button');if(!body)return;button.disabled=true;const recipient_id=chatRecipient.id;const {error}=await db.from('direct_messages').insert({sender_id:user.id,recipient_id,body});button.disabled=false;if(error){document.getElementById('chatFeedback').textContent=error.message;return}input.value='';await loadChatHistory()};
chatNav.onclick=async()=>{document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===chatNav));['home','reels','explore','profile','messages'].forEach(v=>document.getElementById(v).classList.toggle('hide',v!=='messages'));await loadChatPeople();if(chatRecipient)await loadChatHistory()};
document.querySelectorAll('[data-view]:not([data-view="messages"])').forEach(btn=>btn.addEventListener('click',()=>messagesView.classList.add('hide')));


/* PAVORA profile redesign: Instagram-inspired layout, original PAVORA colors */
const pvCss=document.createElement('style');pvCss.textContent=`body.pvProfileMode main{max-width:1440px;grid-template-columns:190px minmax(0,1fr);gap:30px}body.pvProfileMode .feed{max-width:1050px;width:100%;margin:0 auto}body.pvProfileMode aside.right{display:none}body.pvProfileMode #cloudStatus{display:none}body.pvProfileMode #profile{padding:0 14px}body.pvProfileMode #pvProfileHead{grid-template-columns:180px minmax(0,1fr);gap:42px;padding:35px 12px}body.pvProfileMode .pvAvatar{width:160px;height:160px}body.pvProfileMode .pvEditButton{max-width:350px}body.pvProfileMode .pvGrid{gap:4px}@media(max-width:600px){body.pvProfileMode main{display:block}body.pvProfileMode #profile{padding:0}body.pvProfileMode #pvProfileHead{grid-template-columns:94px minmax(0,1fr);gap:12px;padding:18px 0}body.pvProfileMode .pvAvatar{width:88px;height:88px}body.pvProfileMode .pvEditButton{max-width:none}}
#profile{width:100%;min-width:0}#profile .pvProfile{background:transparent;border:0;padding:0;overflow:visible}#pvProfileHead{display:grid;grid-template-columns:150px minmax(0,1fr);gap:28px;padding:25px 10px 22px;align-items:center}.pvAvatar{height:138px;width:138px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#895aff,#e86cb3);font-size:50px;font-weight:800;overflow:hidden;border:4px solid #27223a}.pvAvatar img{width:100%;height:100%;object-fit:cover}.pvTopLine{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.pvTopLine h2{margin:0;font-size:24px;overflow-wrap:anywhere}.pvCounts{display:flex;gap:22px;margin:20px 0;flex-wrap:wrap}.pvCounts span{white-space:nowrap}.pvCounts strong{font-size:16px}.pvBio{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0;color:#e7e3f2;font-size:14px;line-height:1.5}.pvDisplay{font-weight:700;margin-top:9px}.pvEditButton{width:100%;margin:16px 0 4px}.pvTabs{display:flex;justify-content:center;gap:8px;border-top:1px solid #353247;margin-top:24px}.pvTabs span{border-top:2px solid #bd91ff;margin-top:-1px;padding:14px 30px;font-weight:700;font-size:12px;letter-spacing:1.5px}.pvGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px}.pvTile{border:0;padding:0;aspect-ratio:1;overflow:hidden;background:#242338;color:#f7f4ff;cursor:pointer}.pvTile img{width:100%;height:100%;object-fit:cover;transition:transform .2s}.pvTile:hover img{transform:scale(1.04)}.pvTextTile{display:grid;place-items:center;padding:12px;text-align:center;overflow-wrap:anywhere;font-size:13px}.pvNoPosts{grid-column:1/-1;text-align:center;padding:60px 10px;color:#bcb7cf}#profileEditor{margin-top:20px!important}#profileEditor[hidden]{display:none}@media(max-width:600px){#pvProfileHead{grid-template-columns:90px minmax(0,1fr);gap:12px;padding:16px 2px}.pvAvatar{width:86px;height:86px;font-size:34px}.pvTopLine h2{font-size:18px}.pvCounts{gap:12px;margin:10px 0;font-size:12px}.pvCounts strong{font-size:13px}.pvBio{font-size:13px}.pvGrid{gap:2px}}`;document.head.append(pvCss);
const pvPanel=document.querySelector('#profile > .panel');pvPanel.classList.add('pvProfile');
pvPanel.innerHTML='<div id="pvProfileHead"><div class="pvAvatar" id="pvAvatar">P</div><div><div class="pvTopLine"><h2 id="pvUsername">creator</h2><span style="color:#b48bff">✦</span></div><div class="pvCounts"><span><strong id="pvPostCount">0</strong> posts</span><span><strong id="pvReelCount">0</strong> reels</span><span><strong id="pvFollowers">0</strong> followers</span><span><strong id="pvFollowing">0</strong> following</span></div><div id="pvOfficialType" hidden></div><div class="pvDisplay" id="pvDisplayName"></div><div class="pvBio" id="pvBio"></div></div></div><button class="secondary pvEditButton" id="pvEditToggle">Edit profile</button><section id="pvOfficialHub" hidden><div class="pvOfficialEyebrow">PAVORA • OFFICIAL CHANNEL</div><h3>Product updates & announcements</h3><p>The verified source for PAVORA releases, features, tools and community news. Publish updates from this account to reach the Home feed.</p><div class="pvOfficialLinks"><button type="button" id="pvOfficialPublish">＋ Create announcement</button></div></section><div class="pvTabs"><button type="button" class="active" id="pvAllMediaTab">▦ POSTS</button><button type="button" id="pvReelsMediaTab">▣ REELS</button></div><div class="pvGrid" id="pvPostGrid"></div>';
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
let pvDmRealtimeChannel=null,pvDmRealtimeUser=null,pvDmRealtimeStatus='offline',pvDmRealtimeRefreshTimer=null;
function pvStopDmRealtime(){
 if(pvDmRealtimeRefreshTimer){clearTimeout(pvDmRealtimeRefreshTimer);pvDmRealtimeRefreshTimer=null}
 if(pvDmRealtimeChannel){const old=pvDmRealtimeChannel;pvDmRealtimeChannel=null;try{db.removeChannel(old).catch(()=>{})}catch(e){console.warn('Realtime cleanup:',e)}}
 pvDmRealtimeUser=null;pvDmRealtimeStatus='offline';
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
 pvStopLikesRealtime();
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
 channel.subscribe(status=>{
  if(pvDmRealtimeUser!==uid)return;
  pvDmRealtimeStatus=status==='SUBSCRIBED'?'live':'offline';
  const label=document.querySelector('#pvChatArea .pvDmRealtimeLabel');
  if(label){label.textContent=pvDmRealtimeStatus==='live'?'Live':'Syncing';label.title=pvDmRealtimeStatus==='live'?'Messages update in real time':'Message polling is active'}
  if(status==='SUBSCRIBED')pvScheduleLiveDmRefresh();
 });
 pvDmRealtimeChannel=channel;
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
const b=document.querySelector('aside.left [data-view="'+saved.view+'"]');if(b)b.click();else pvNavigate(saved.view)}
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
function pvNavigate(view){pvVirtualView.classList.add('hide');pvActiveVirtual=null;pvCloseVirtualChat();pvRememberView(view);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));['home','reels','explore','profile','messages','creator'].forEach(v=>{const el=v==='messages'?inboxView:v==='creator'?publicView:document.getElementById(v);if(el)el.classList.toggle('hide',v!==view)});document.body.classList.toggle('pvProfileMode',view==='profile');document.body.classList.toggle('pvMessagesMode',view==='messages');document.body.classList.toggle('pvExploreMode',view==='explore');document.body.classList.toggle('pvReelsMode',view==='reels');try{window.PVKit?.onNavigate?.(view)}catch(e){console.warn('Feature navigation:',e)}if(view==='messages'){loadInbox();requestAnimationFrame(pvSyncDesktopChatHeight)}if(view==='reels')loadReels();if(view==='explore')pvLoadExplore();if(view!=='messages'&&chatPoll){clearInterval(chatPoll);chatPoll=null}}
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
function pvCloseConnections(){pvConnectionsRequest++;pvConnectionsDialog.hidden=true;pvConnectionsDialog.replaceChildren()}
pvConnectionsDialog.onclick=e=>{if(e.target===pvConnectionsDialog)pvCloseConnections()};
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
 const card=node('div','pvConnectionsCard'),head=node('div','pvConnectionsHeader');
 const close=node('button','pvConnectionsClose','×');close.type='button';close.setAttribute('aria-label','Close '+heading);close.onclick=pvCloseConnections;
 head.append(node('h3','',heading),close);
 const people=node('div','pvConnectionsPeople'),more=node('button','pvConnectionsMore','Load more');
 more.type='button';more.hidden=true;card.append(head,people,more);
 pvConnectionsDialog.replaceChildren(card);pvConnectionsDialog.hidden=false;close.focus();
 let offset=0,loading=false;
 async function loadPage(){
  if(loading||request!==pvConnectionsRequest)return;
  loading=true;more.hidden=true;
  if(offset===0)people.append(node('div','pvConnectionNotice','Loading '+heading.toLowerCase()+'…'));
  const filterColumn=kind==='followers'?'following_id':'follower_id';
  const personColumn=kind==='followers'?'follower_id':'following_id';
  const {data:edges,error}=await db.from('follows').select('follower_id,following_id').eq(filterColumn,ownerId).order(personColumn,{ascending:true}).range(offset,offset+49);
  if(request!==pvConnectionsRequest)return;
  if(offset===0)people.replaceChildren();
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
    people.append(row);
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
async function openCreator(id){if(!user||!id)return;pvRememberView('creator',id);if(id===user.id){pvNavigate('profile');await updateSocialProfile();return}pvNavigate('creator');pvRememberView('creator',id);publicView.replaceChildren(node('p','muted','Loading profile…'));
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
if(person.is_private)details.append(node('div','pvProfilePrivacyTag','🔒 Private account'));
const pvCountText=(value,failed)=>failed?'—':String(value??0);
const publicStats=node('div','pvPublicStats');
for(const [amount,label,failed] of [
 [pvCountText(postCount,postError),'posts',postError],
 [pvCountText(reelCount,reelCountError),'reels',reelCountError],
 [pvCountText(followerCount,followerCountError),'followers',followerCountError],
 [pvCountText(followingCount,followingCountError),'following',followingCountError]
]){const stat=label==='followers'||label==='following'?pvConnectionCountButton(amount,label,id,failed):node('span','pvPublicStat');if(label!=='followers'&&label!=='following')stat.append(node('strong','',amount),document.createTextNode(' '+label));publicStats.append(stat)}
details.append(node('strong','',person.display_name||person.username),publicStats,node('p','',person.bio||''));
top.append(avatar,details);publicView.append(top);
const privateLocked=!!person.is_private&&!myFollow;
const actions=node('div','pvPublicActions'),follow=node('button','secondary',myFollow?'Following ✓':pendingRequest?'Requested ✓':person.is_private?'Request follow':'Follow'),message=node('button','primary','✉ Message');
follow.onclick=async()=>{follow.disabled=true;let result;
 if(myFollow)result=await db.from('follows').delete().eq('follower_id',user.id).eq('following_id',id);
 else if(pendingRequest)result=await db.from('follow_requests').delete().eq('follower_id',user.id).eq('following_id',id);
 else if(person.is_private)result=await db.from('follow_requests').insert({follower_id:user.id,following_id:id});
 else result=await db.from('follows').insert({follower_id:user.id,following_id:id});
 if(result.error)alert(result.error.message);await openCreator(id)};
message.onclick=()=>openChat(id);actions.append(follow,message);publicView.append(actions);
if(privateLocked){const locked=node('div','pvPrivateLock');locked.append(node('div','','🔒'),node('strong','','This account is private'),node('p','','Follow this account to see its posts and reels.'));publicView.append(locked);return}
publicView.append(node('h3','','Posts'));const grid=node('div','pvPublicGrid');publicView.append(grid);
if(postError){grid.append(node('p','muted',postError.message));return}if(!posts?.length){grid.append(node('p','muted','No posts yet.'));return}
for(const post of posts){const tile=node('button');tile.type='button';if(post.image_path){const img=node('img');img.loading='lazy';img.src=db.storage.from('post-images').getPublicUrl(post.image_path).data.publicUrl;img.alt=post.caption||'Post';tile.append(img)}else tile.textContent=post.caption||'Post';tile.onclick=()=>openProfilePost({...post,author_name:person.username});grid.append(tile)}
}
const oldOpenProfilePost=openProfilePost;
openProfilePost=function(p){oldOpenProfilePost(p);if(p.author_name){const label=pvPreview.querySelector('.pvPreviewCaption strong');if(label)label.textContent='@'+p.author_name}};
let pvInboxTab='Primary',pvInboxSearch='',pvConversationSettings=new Map(),pvPrefsReady=true;
document.addEventListener('click',e=>{if(!e.target.closest('.pvChatMenuWrap'))document.querySelectorAll('.pvChatContextMenu').forEach(m=>m.classList.add('hide'))});
async function pvLoadConversationSettings(){if(!user)return;const {data,error}=await db.from('conversation_preferences').select('peer_id,folder,pinned,muted').eq('owner_id',user.id);if(error){pvPrefsReady=false;console.warn('Inbox folders need setup:',error.message);return}pvPrefsReady=true;pvConversationSettings=new Map((data||[]).map(x=>[x.peer_id,{folder:x.folder,pinned:x.pinned,muted:x.muted}]))}
function pvConversationSetting(peer){return pvConversationSettings.get(peer)||{folder:'primary',pinned:false,muted:false}}
async function pvSaveConversationSetting(peer,changes){if(!pvPrefsReady){alert('Run supabase/conversation-preferences.sql in Supabase SQL Editor first.');return false}const next={...pvConversationSetting(peer),...changes};const {error}=await db.from('conversation_preferences').upsert({owner_id:user.id,peer_id:peer,...next,updated_at:new Date().toISOString()},{onConflict:'owner_id,peer_id'});if(error){alert('Cannot update conversation: '+error.message+' — Run supabase/conversation-preferences.sql first.');return false}pvConversationSettings.set(peer,next);return true}

function pvInboxMobileBack(){inboxView.classList.remove('pvChatSelected');selectedPeer=null;pvRememberInboxPosition();const area=document.getElementById('pvChatArea');if(area)area.replaceChildren(pvEmptyChat());}
function pvEmptyChat(){const empty=node('div','pvEmptyChat');empty.innerHTML='<div class="pvEmptyIcon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m21 3-8.5 18-3.5-7.5L2 10z"/><path d="M21 3 9 13.5"/></svg></div><h2>Your messages</h2><p>Send private photos and messages to a friend.</p>';const btn=node('button','pvStartMessage','Send message');btn.onclick=()=>pvNavigate('explore');empty.append(btn);return empty}
async function loadInbox(){if(!user)return;
const layout=node('div','pvInboxLayout'),side=node('div','pvInboxSide'),right=node('div','pvChatArea');right.id='pvChatArea';right.append(pvEmptyChat());layout.append(side,right);inboxView.replaceChildren(layout);
inboxView.classList.toggle('pvChatSelected',!!selectedPeer);
requestAnimationFrame(pvSyncDesktopChatHeight);
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
details.append(label,node('small','',last?(last.sender_id===user.id?'You: ':'')+(last.body||'Message'):'Start a conversation'));const when=node('span','pvThreadWhen',last?new Date(last.created_at).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'');
b.append(avatar,details,when);b.dataset.peerId=id;b.title='@'+p.username;b.onclick=()=>openChat(id,false);
const menuButton=node('button','pvChatMore','⋯');menuButton.type='button';menuButton.title='Conversation options';menuButton.setAttribute('aria-label','Options for '+(p.display_name||p.username));
const menu=node('div','pvChatContextMenu hide');menu.setAttribute('role','menu');
function menuItem(label,fn){const item=node('button','pvChatMenuItem',label);item.type='button';item.setAttribute('role','menuitem');item.onclick=async e=>{e.stopPropagation();menu.classList.add('hide');menuButton.setAttribute('aria-expanded','false');await fn()};menu.append(item)}
if(pvInboxTab!=='Requests')menuItem(setting.folder==='primary'?'Move to General':'Move to Primary',async()=>{if(await pvSaveConversationSetting(id,{folder:setting.folder==='primary'?'general':'primary'})){if(selectedPeer===id)selectedPeer=null;await loadInbox()}});
if(pvInboxTab!=='Requests')menuItem(setting.pinned?'Unpin conversation':'Pin conversation',async()=>{if(await pvSaveConversationSetting(id,{pinned:!setting.pinned}))await loadInbox()});
menuItem(setting.muted?'Unmute notifications':'Mute notifications',async()=>{if(await pvSaveConversationSetting(id,{muted:!setting.muted}))await loadInbox()});
menuItem('Remove chat',async()=>pvRemoveChat(id));
menuButton.setAttribute('aria-expanded','false');menuButton.onclick=e=>{e.stopPropagation();const opening=menu.classList.contains('hide');inboxView.querySelectorAll('.pvChatContextMenu').forEach(m=>m.classList.add('hide'));inboxView.querySelectorAll('.pvChatMore').forEach(m=>m.setAttribute('aria-expanded','false'));menu.classList.toggle('hide',!opening);menuButton.setAttribute('aria-expanded',String(opening))};
const controls=node('div','pvChatMenuWrap');controls.append(menuButton,menu);
entry.append(b,controls);threads.append(entry);rows.push({entry,p})}
const filter=()=>{const q=pvInboxSearch.toLowerCase();for(const {entry,p} of rows)entry.classList.toggle('hide',!(p.display_name||'').toLowerCase().includes(q)&&!(p.username||'').toLowerCase().includes(q))};
search.oninput=()=>{pvInboxSearch=search.value;filter()};filter();
if(selectedPeer)await renderChat(selectedPeer);await pvCheckUnread();
}
async function openChat(id,navigate=true){if(!user||id===user.id)return;if(pvHiddenChats.has(id)){const {error}=await db.from('hidden_conversations').delete().eq('owner_id',user.id).eq('peer_id',id);if(!error)pvHiddenChats.delete(id)}selectedPeer=id;if(navigate){const {data:req}=await db.from('message_requests').select('sender_id').eq('recipient_id',user.id).eq('sender_id',id).is('accepted_at',null).maybeSingle();const {data:following}=req?await db.from('follows').select('follower_id').eq('follower_id',id).eq('following_id',user.id).maybeSingle():{data:null};pvInboxTab=req&&!following?'Requests':pvConversationSetting(id).folder==='general'?'General':'Primary';pvNavigate('messages')}else{inboxView.classList.add('pvChatSelected');inboxView.querySelectorAll('.pvThreadPerson').forEach(b=>b.classList.toggle('active',b.dataset.peerId===id));await renderChat(id)}pvRememberInboxPosition();if(!chatPoll)chatPoll=setInterval(()=>{if(!inboxView.classList.contains('hide')&&selectedPeer&&!pvChatPollBusy){pvChatPollBusy=true;renderChat(selectedPeer,true).catch(e=>console.warn('Chat poll:',e)).finally(()=>{pvChatPollBusy=false})}},pvDmRealtimeStatus==='live'?12000:4000)}
async function renderChat(id,silent=false){const area=document.getElementById('pvChatArea');if(!area||!user||selectedPeer!==id)return;
const pollingExisting=!!(silent&&area.querySelector('.pvMessageForm'));
const [{data:person,error:personError},{data:messages,error}]=await Promise.all([
pollingExisting?Promise.resolve({data:{id},error:null}):db.from('profiles').select('id,username,display_name,avatar_url,bio').eq('id',id).maybeSingle(),
db.from('direct_messages').select('id,sender_id,recipient_id,body,created_at,read_at').or('and(sender_id.eq.'+user.id+',recipient_id.eq.'+id+'),and(sender_id.eq.'+id+',recipient_id.eq.'+user.id+')').order('created_at',{ascending:true}).limit(pollingExisting?100:200)
]);if(selectedPeer!==id)return;if(error||personError){if(!silent)area.replaceChildren(node('p','muted',(error||personError).message));return}
if(!person){area.replaceChildren(node('p','muted','User unavailable'));return}
if(!document.hidden&&messages?.some(m=>m.recipient_id===user.id&&!m.read_at))pvMarkRead(id);
// Never replace the message composer during background polling: iOS/Android
// will dismiss the software keyboard if its focused input is detached.
if(silent&&area.querySelector('.pvMessageForm')){
 const list=area.querySelector('.pvMessages');
 if(list){
  const known=new Set([...list.querySelectorAll('.pvMessageRow[data-message-id]')].map(row=>row.dataset.messageId));
  const received=(messages||[]).filter(m=>!known.has(String(m.id)));
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
  pvDmUpdateReceipt(list,messages);
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
area.replaceChildren();
const chatTop=node('div','pvChatTop'),back=node('button','pvChatBack','‹'),heading=node('h3','',person.display_name||person.username),handle=node('p','muted','@'+person.username),chatWho=node('div','pvChatWho'),list=node('div','pvMessages'),headerAvatar=node('button','pvChatHeaderAvatar');
back.type='button';back.setAttribute('aria-label','Back to conversations');back.onclick=pvInboxMobileBack;
headerAvatar.type='button';headerAvatar.title='View profile';headerAvatar.setAttribute('aria-label','View '+person.username+' profile');
function pvChatAvatar(target){target.replaceChildren();if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='';img.onerror=()=>{target.replaceChildren();target.textContent=(person.display_name||person.username||'P')[0].toUpperCase()};target.append(img)}else target.textContent=(person.display_name||person.username||'P')[0].toUpperCase()}
pvChatAvatar(headerAvatar);headerAvatar.onclick=()=>openCreator(id);
const headerText=node('button','pvChatHeaderIdentity');headerText.type='button';headerText.onclick=()=>openCreator(id);headerText.append(heading,handle);chatWho.append(headerAvatar,headerText);chatTop.append(back,chatWho);
try{window.PVKit?.addCallActions?.(id,chatTop)}catch(e){console.warn('Call buttons:',e)}
const liveLabel=node('span','pvDmRealtimeLabel',pvDmRealtimeStatus==='live'?'Live':'Syncing');
liveLabel.title=pvDmRealtimeStatus==='live'?'Real-time messages enabled':'Using background message checks';
chatTop.append(liveLabel);
const infoButton=node('button','pvChatInfoButton');infoButton.type='button';infoButton.title='View profile';infoButton.setAttribute('aria-label','View profile');infoButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>';infoButton.onclick=()=>openCreator(id);chatTop.append(infoButton);
const intro=node('div','pvChatIntro'),introAvatar=node('div','pvChatIntroAvatar');pvChatAvatar(introAvatar);
intro.append(introAvatar,node('strong','',person.display_name||person.username),node('span','pvChatIntroHandle','@'+person.username+' · PAVORA'));
const viewProfile=node('button','pvChatViewProfile','View profile');viewProfile.type='button';viewProfile.onclick=()=>openCreator(id);intro.append(viewProfile);
list.append(intro);
let pvLastMessageDay='';
for(const m of messages||[]){
const stamp=new Date(m.created_at),dayKey=stamp.toDateString();if(dayKey!==pvLastMessageDay){pvLastMessageDay=dayKey;const marker=node('div','pvChatDayDivider',stamp.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}));marker.dataset.dayKey=dayKey;list.append(marker)}
const mine=m.sender_id===user.id,row=node('div','pvMessageRow'+(mine?' mine':'')),bubble=node('div','pvBubble'+(mine?' mine':''),m.body);
row.dataset.messageId=String(m.id);bubble.title=new Date(m.created_at).toLocaleString();row.append(bubble);if(mine){const del=node('button','pvDeleteMessage','Delete');del.type='button';del.title='Delete this message for everyone';del.setAttribute('aria-label','Delete message for everyone');del.onclick=async()=>{if(!confirm('Delete this message for everyone? This cannot be undone.'))return;del.disabled=true;const {error}=await db.from('direct_messages').delete().eq('id',m.id).eq('sender_id',user.id);if(error){alert('Could not delete message: '+error.message);del.disabled=false;return}await renderChat(id);await pvCheckUnread()};row.append(del)}list.append(row)}if(!messages?.length)list.append(node('p','pvChatEmptyMessage','Say hello! 👋'));const form=node('form','pvMessageForm'),input=node('input');input.placeholder='Message…';input.maxLength=2000;input.required=true;input.setAttribute('aria-label','Message');
const emojiButton=node('button','pvChatEmojiButton');emojiButton.type='button';emojiButton.title='Add emoji';emojiButton.setAttribute('aria-label','Add emoji');emojiButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 14c2 3 6 3 8 0"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>';
const emojiTray=node('div','pvChatEmojiTray');emojiTray.hidden=true;for(const emoji of ['❤️','😂','😍','🥰','🔥','👏','🙌','😊','👍','💜','✨','👋']){const item=node('button','',emoji);item.type='button';item.onclick=()=>{input.value+=emoji;emojiTray.hidden=true;input.focus();input.dispatchEvent(new Event('input'))};emojiTray.append(item)}
emojiButton.onclick=()=>{emojiTray.hidden=!emojiTray.hidden};
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
const composerWrap=node('div','pvChatComposerWrap');form.append(emojiButton,input,send);composerWrap.append(emojiTray,form);
if(pendingOutgoing&&alreadySent){input.disabled=true;send.disabled=true;input.placeholder='Request pending — waiting for acceptance';}
form.addEventListener('submit',event=>{event.preventDefault();pvSendMessage()});
async function pvSendMessage(){
 const body=input.value.trim();if(!body||send.disabled)return;
 // Keep the original input element mounted. Rebuilding renderChat() here
 // makes iOS/Android close the soft keyboard after every message.
 input.value='';
 input.focus({preventScroll:true});
 send.disabled=true;
 const {data:sentMessage,error}=await db.from('direct_messages').insert({sender_id:user.id,recipient_id:id,body}).select('id,created_at').single();
 if(error){
   input.value=body+(input.value?' '+input.value:'');
   input.focus({preventScroll:true});
   send.disabled=false;
   alert(error.message);
   return;
 }
 if(selectedPeer!==id||!list.isConnected)return;
 const today=new Date(sentMessage.created_at),dayKey=today.toDateString();
 if(dayKey!==pvLastMessageDay){
   pvLastMessageDay=dayKey;
   const marker=node('div','pvChatDayDivider',today.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}));marker.dataset.dayKey=dayKey;list.append(marker);
 }
 list.querySelector('.pvChatEmptyMessage')?.remove();
 const row=node('div','pvMessageRow mine'),bubble=node('div','pvBubble mine',body);
 row.dataset.messageId=String(sentMessage.id);bubble.title=today.toLocaleString();row.append(bubble);
 if(!list.querySelector('.pvMessageRow[data-message-id="'+String(sentMessage.id)+'"]'))list.append(row);
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
}area.append(chatTop);
if(pendingIncoming){const banner=node('div','pvRequestBanner'),description=node('p','','Message request from someone who does not follow you.'),accept=node('button','pvAcceptRequest','Accept'),remove=node('button','pvDeclineRequest','Remove');accept.type=remove.type='button';accept.onclick=async()=>{accept.disabled=true;const {error}=await db.from('message_requests').update({accepted_at:new Date().toISOString()}).eq('recipient_id',user.id).eq('sender_id',id).is('accepted_at',null);if(error){alert('Could not accept request: '+error.message);accept.disabled=false;return}pvInboxTab='Primary';await loadInbox();await pvCheckUnread()};remove.onclick=()=>pvRemoveChat(id);banner.append(description,accept,remove);area.append(banner)}
if(pendingOutgoing){area.append(node('p','pvPendingRequestNote',alreadySent?'Request sent. Wait for acceptance, or follow this account to continue.':'You can send one message request. Follow this account to message freely.'))}
area.append(list,composerWrap);emojiButton.disabled=input.disabled;pvDmUpdateReceipt(list,messages);list.scrollTop=list.scrollHeight}


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
 pvCard.innerHTML='<div class="pvCreateHeader"><strong>Create new post</strong><button class="pvComposeClose" type="button" aria-label="Close">×</button></div><div class="pvCreateDrop" tabindex="0" role="button" aria-label="Select photo or video"><div class="pvUploadArt"><svg viewBox="0 0 100 90" fill="none" stroke="currentColor" stroke-width="3"><rect x="10" y="15" width="55" height="50" rx="7"/><path d="m13 54 16-16 12 12 9-9 13 13"/><circle cx="25" cy="29" r="5"/><rect x="48" y="30" width="42" height="45" rx="7" fill="#23242a"/><path d="m64 42 16 10-16 10z"/></svg></div><h2>Drag photos and videos here</h2><button class="pvChooseMedia" type="button">Select from computer</button><p class="pvMediaHint">JPG, PNG, WebP · MP4, WebM</p></div><div class="pvCreateSelected hide"><div class="pvCreatePreview"></div><div class="pvCreateDetails"><p class="pvCreateFilename"></p><textarea class="pvCreateCaption" maxlength="1000" placeholder="Write a caption…"></textarea><p class="pvCreateFeedback" role="status"></p><div class="pvCreateButtons"><button type="button" class="pvChangeMedia">Change media</button><button type="button" class="pvUnifiedPublish">Share</button></div></div></div><input type="file" class="pvUnifiedFile" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" hidden>';
 pvDialog.append(pvCard);document.body.append(pvDialog);
 const pvClose=pvCard.querySelector('.pvComposeClose'),pvDrop=pvCard.querySelector('.pvCreateDrop'),pvInput=pvCard.querySelector('.pvUnifiedFile'),pvSelected=pvCard.querySelector('.pvCreateSelected'),pvPreview=pvCard.querySelector('.pvCreatePreview'),pvCaption=pvCard.querySelector('.pvCreateCaption'),pvFeedback=pvCard.querySelector('.pvCreateFeedback'),pvShare=pvCard.querySelector('.pvUnifiedPublish');
 let pvObjectUrl=null,pvUploading=false;
 function pvCloseDrawer(){document.body.classList.remove('pvDrawerOpen')}
 function pvResetMedia(){if(pvObjectUrl){window.URL.revokeObjectURL(pvObjectUrl);pvObjectUrl=null}pvInput.value='';pvPreview.replaceChildren();pvSelected.classList.add('hide');pvDrop.classList.remove('hide');pvCaption.value='';pvFeedback.textContent=''}
 function pvCloseCompose(){if(pvUploading)return;document.body.classList.remove('pvComposeOpen');pvResetMedia()}
 function pvSelectMedia(file){if(!file)return;const types=['image/jpeg','image/png','image/webp','video/mp4','video/webm'];if(!types.includes(file.type)){pvFeedback.textContent='Choose JPG, PNG, WebP, MP4 or WebM.';return}if(pvObjectUrl)window.URL.revokeObjectURL(pvObjectUrl);pvObjectUrl=window.URL.createObjectURL(file);pvPreview.replaceChildren();const media=document.createElement(file.type.startsWith('video/')?'video':'img');media.src=pvObjectUrl;if(media.tagName==='VIDEO'){media.controls=true;media.playsInline=true;media.muted=true}media.alt='Selected media preview';pvPreview.append(media);pvCard.querySelector('.pvCreateFilename').textContent=file.name;pvDrop.classList.add('hide');pvSelected.classList.remove('hide');pvFeedback.textContent=''}
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
const kind=file.type.startsWith('video/')?'reel':'post';pvFeedback.textContent='Uploading your '+(kind==='reel'?'video':'photo')+'…';
let path=null,saved=false;
try{
if(kind==='reel'){
if(!['video/mp4','video/webm'].includes(file.type))throw Error('Choose MP4 or WebM video.');
if(file.size>50*1024*1024)throw Error('Video must be under 50 MB.');
path=user.id+'/'+crypto.randomUUID()+(file.type==='video/mp4'?'.mp4':'.webm');
const upload=await db.storage.from('reel-videos').upload(path,file,{contentType:file.type});if(upload.error)throw upload.error;
const {data,error}=await db.from('reels').insert({author_id:user.id,caption:pvCaption.value.trim(),video_path:path}).select('id').single();
if(error)throw error;saved=true;
pvCloseComposeAfterUpload();pvNavigate('reels');
try{await loadReels()}catch(e){console.warn('Reels refresh failed after publish:',e)}
pvShowUploadToast('reel',()=>pvFocusPublished('reel',data.id));pvFocusPublished('reel',data.id);
}else{
if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Choose a JPG, PNG or WebP photo under 5 MB.');
const suffix={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}[file.type];
path=user.id+'/'+crypto.randomUUID()+suffix;
const upload=await db.storage.from('post-images').upload(path,file,{contentType:file.type});if(upload.error)throw upload.error;
const {data,error}=await db.from('posts').insert({author_id:user.id,caption:pvCaption.value.trim(),image_path:path}).select('id').single();
if(error)throw error;saved=true;
pvCloseComposeAfterUpload();pvNavigate('home');
try{await refresh();await loadOwnPosts()}catch(e){console.warn('Feed refresh failed after publish:',e)}
pvShowUploadToast('post',()=>pvFocusPublished('post',data.id));pvFocusPublished('post',data.id);
}
}catch(e){pvFeedback.textContent=e.message;if(path&&!saved){try{await db.storage.from(kind==='reel'?'reel-videos':'post-images').remove([path])}catch(err){console.warn('Could not clean up unsuccessful upload:',err)}}}
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
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user){pvCheckUnread();pvCheckActivity();pvScheduleLikesSync(100)}});
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