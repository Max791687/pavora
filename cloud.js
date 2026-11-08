/* PAVORA Cloud v2 — public publishable key, never a secret key */
(async function(){
const URL='https://iyqmjaomslffqfwbsydr.supabase.co';
const KEY='sb_publishable_uaHMT5xlLu6egTFd7uaqQQ_LN6sbwhr';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
if(!window.supabase?.createClient){document.body.classList.remove('pvBooting');alert('Unable to load Supabase SDK. Check internet connection.');return}
const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}});
// Keep the sign-in form responsive if authentication or network is unavailable.
function pvAuthTimeout(promise,ms=15000){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Login is taking too long. Check your internet connection, then try again.')),ms))])}

let user=null,feed=[],profile=null;
window.PVKit={db,getUser:()=>user,notify:message=>alert(message)};
let pvSessionInitializing=null,pvSessionInitUser=null;
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
overlay.innerHTML=`<section class="authShowcase"><div class="authLogo">PAVORA ✦</div><h1>Share moments.<br><em>Make connections.</em></h1><p>Your space to share photos, discover creators, and stay close to the people who matter.</p><div class="authArt" aria-hidden="true"><div class="authArtCard">📷</div><div class="authArtCard">💜</div><div class="authArtCard">✨</div></div></section><section class="authRight"><div id="authBox"><div class="authLogo" style="margin-bottom:28px">PAVORA ✦</div><h2 id="authHeading">Log in to PAVORA</h2><p class="authSub" id="authSubtitle">Welcome back! Enter your details to continue.</p><form id="authForm"><div id="authNameWrap" hidden><label for="authName">Full name</label><input id="authName" type="text" placeholder="Your name" autocomplete="name" maxlength="60"></div><div id="authUsernameWrap" hidden><label for="authUsername">Username</label><input id="authUsername" type="text" placeholder="Choose a username" autocomplete="username" maxlength="24" pattern="[A-Za-z0-9_]{3,24}"></div><label for="authEmail">Email address</label><input id="authEmail" type="email" placeholder="you@example.com" required autocomplete="email"><label for="authPassword">Password</label><div class="authPasswordRow"><input id="authPassword" type="password" placeholder="At least 6 characters" required minlength="6" autocomplete="current-password"><button type="button" id="authTogglePassword">Show</button></div><div id="authConfirmWrap" hidden><label for="authConfirm">Confirm password</label><input id="authConfirm" type="password" placeholder="Enter password again" autocomplete="new-password"></div><button class="authMainBtn" id="authSubmit" type="submit">Log in</button></form><div class="authCenter"><button class="authLink" id="authForgot" type="button">Forgot password?</button></div><div class="authDivider">OR</div><button class="authSwitch" id="signup" type="button">Create new account</button><p id="authMsg" role="status" aria-live="polite"></p><p class="authTerms">By continuing, you agree to use PAVORA respectfully.</p></div></section>`;
document.body.append(overlay);
const status=document.createElement('p');status.id='cloudStatus';status.textContent='Connecting to PAVORA Cloud…';document.querySelector('.feed').prepend(status);
const signout=document.createElement('button');signout.id='signout';signout.className='secondary';signout.textContent='Log out';document.querySelector('.top').append(signout);
const msg=t=>document.getElementById('authMsg').textContent=t;
let authMode='login';
function setAuthMode(mode){authMode=mode;msg('');const signup=mode==='signup',reset=mode==='reset';document.getElementById('authNameWrap').hidden=!signup;document.getElementById('authUsernameWrap').hidden=!signup;document.getElementById('authConfirmWrap').hidden=!signup;document.getElementById('authName').required=signup;document.getElementById('authUsername').required=signup;document.getElementById('authConfirm').required=signup;document.getElementById('authPassword').required=!reset;document.getElementById('authPassword').closest('.authPasswordRow').previousElementSibling.hidden=reset;document.getElementById('authPassword').closest('.authPasswordRow').hidden=reset;document.getElementById('authHeading').textContent=signup?'Create your account':reset?'Reset your password':'Log in to PAVORA';document.getElementById('authSubtitle').textContent=signup?'Join PAVORA in a few easy steps.':reset?'We will send you a password reset link.':'Welcome back! Enter your details to continue.';document.getElementById('authSubmit').textContent=signup?'Create account':reset?'Send reset link':'Log in';document.getElementById('signup').textContent=signup||reset?'Back to log in':'Create new account';document.getElementById('authForgot').hidden=signup||reset;document.getElementById('authPassword').autocomplete=signup?'new-password':'current-password'}
document.getElementById('signup').onclick=()=>setAuthMode(authMode==='login'?'signup':'login');
document.getElementById('authForgot').onclick=()=>setAuthMode('reset');
document.getElementById('authTogglePassword').onclick=()=>{const input=document.getElementById('authPassword');input.type=input.type==='password'?'text':'password';document.getElementById('authTogglePassword').textContent=input.type==='password'?'Show':'Hide'};
document.getElementById('authForm').onsubmit=async e=>{e.preventDefault();const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPassword').value,btn=document.getElementById('authSubmit');if(!email)return msg('Please enter your email.');if(authMode==='signup'&&password!==document.getElementById('authConfirm').value)return msg('Passwords do not match.');btn.disabled=true;msg(authMode==='login'?'Logging in…':authMode==='signup'?'Creating your account…':'Sending reset link…');try{if(authMode==='login'){const {data,error}=await pvAuthTimeout(db.auth.signInWithPassword({email,password}));if(error)throw error;if(data?.session){msg('Login successful! Opening PAVORA…');await setSession(data.session)}else throw Error('No session returned. Please try logging in again.')}else if(authMode==='reset'){const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:'https://max791687.github.io/pavora/'});if(error)throw error;msg('If this email has an account, a reset link will arrive shortly. Check spam too.')}else{const username=document.getElementById('authUsername').value.trim(),display_name=document.getElementById('authName').value.trim();if(!/^[a-zA-Z0-9_]{3,24}$/.test(username))throw Error('Username must be 3–24 letters, numbers or underscores.');const {data:existing,error:lookupError}=await db.from('profiles').select('id').eq('username',username).maybeSingle();if(lookupError)throw lookupError;if(existing)throw Error('This username is already taken. Try another.');const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:'https://max791687.github.io/pavora/',data:{username,display_name}}});if(error)throw error;msg(data.session?'Account created! Opening PAVORA…':'Account created! Check your email to confirm, then log in.')}}catch(err){msg(err.message||'Something went wrong. Please try again.')}finally{btn.disabled=false}};
signout.onclick=async()=>{pvExplicitSignout=true;try{const {error}=await db.auth.signOut();if(error)throw error;await setSession(null)}catch(e){pvExplicitSignout=false;alert('Could not log out: '+e.message)}};
async function ensureProfile(){if(!user)return;let {data,error}=await db.from('profiles').select('*').eq('id',user.id).maybeSingle();if(error)throw error;if(!data){const base=(user.email||'creator').split('@')[0].replace(/[^a-zA-Z0-9_]/g,'').slice(0,12)||'creator';const requested=user.user_metadata?.username;const username=/^[a-zA-Z0-9_]{3,24}$/.test(requested||'')?requested:(base+'_'+user.id.slice(0,7)).slice(0,24);const display_name=String(user.user_metadata?.display_name||base).slice(0,60);let created=await db.from('profiles').insert({id:user.id,username,display_name}).select().single();if(created.error?.code==='23505'&&username===requested){created=await db.from('profiles').insert({id:user.id,username:(base+'_'+user.id.slice(0,7)).slice(0,24),display_name}).select().single()}if(created.error)throw created.error;data=created.data}profile=data;document.querySelectorAll('.intro b').forEach(e=>e.textContent='@'+data.username);{const title=document.querySelector('#profile h2');if(title)title.textContent=data.username}}
async function refresh(){if(!user)return;status.textContent='Loading cloud posts…';const {data,error}=await db.from('posts').select('id,author_id,caption,image_path,created_at').order('created_at',{ascending:false}).limit(50);if(error){status.textContent='Cloud feed error: '+error.message;return}feed=data||[];const ids=feed.map(p=>p.id);if(ids.length){const [profiles,likes,comments]=await Promise.all([db.from('profiles').select('id,username,display_name,avatar_url').in('id',[...new Set(feed.map(p=>p.author_id))]),db.from('likes').select('post_id,user_id').in('post_id',ids),db.from('comments').select('id,post_id,user_id,body').in('post_id',ids)]);if(profiles.error||likes.error||comments.error){status.textContent='Cloud posts loaded; some social details unavailable: '+[profiles.error,likes.error,comments.error].filter(Boolean).map(e=>e.message).join('; ')}const names=new Map((profiles.data||[]).map(p=>[p.id,p]));feed.forEach(p=>{p.profiles=names.get(p.author_id)||null;p.likes=(likes.data||[]).filter(x=>x.post_id===p.id);p.comments=(comments.data||[]).filter(x=>x.post_id===p.id)})}if(!status.textContent.startsWith('Cloud posts loaded'))status.textContent='☁ Cloud feed · '+feed.length+' posts';draw()}
function node(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function draw(){const root=document.getElementById('posts');root.replaceChildren();feed.forEach(p=>{const card=node('article','post'),head=node('div','posthead');card.id='pv-post-'+p.id;const authorAvatar=node('div','profilepic');const authorName=p.profiles?.display_name||p.profiles?.username||'P';if(p.profiles?.avatar_url){const avatarImg=node('img');avatarImg.src=p.profiles.avatar_url;avatarImg.alt=authorName+' profile photo';avatarImg.loading='lazy';avatarImg.onerror=()=>{authorAvatar.replaceChildren();authorAvatar.textContent=authorName[0].toUpperCase()};authorAvatar.append(avatarImg)}else authorAvatar.textContent=authorName[0].toUpperCase();head.append(authorAvatar);const who=node('div');who.append(pvProfileButton({id:p.author_id,username:p.profiles?.username||'creator'}),node('div','muted',new Date(p.created_at).toLocaleString()));head.append(who);card.append(head);if(p.caption)card.append(node('div','postbody',p.caption));if(p.image_path){const image=node('img');image.src=db.storage.from('post-images').getPublicUrl(p.image_path).data.publicUrl;image.alt='Post photo';image.loading='lazy';card.append(image)}const foot=node('div','postfoot');const liked=(p.likes||[]).some(l=>l.user_id===user.id);const like=node('button','',(liked?'♥':'♡')+' '+(p.likes||[]).length+' Likes');like.onclick=async()=>{like.disabled=true;const result=liked?await db.from('likes').delete().eq('post_id',p.id).eq('user_id',user.id):await db.from('likes').insert({post_id:p.id,user_id:user.id});if(result.error)alert(result.error.message);await refresh()};const comments=node('button','', '💬 '+(p.comments||[]).length+' Comments');const section=node('div');section.hidden=true;(p.comments||[]).forEach(c=>section.append(node('div','commentline',c.body)));const input=node('input','comment');input.placeholder='Write a comment and press Enter';input.maxLength=500;input.onkeydown=async e=>{if(e.key==='Enter'&&input.value.trim()){input.disabled=true;const {error}=await db.from('comments').insert({post_id:p.id,user_id:user.id,body:input.value.trim()});if(error)alert(error.message);await refresh()}};comments.onclick=()=>{section.hidden=!section.hidden};section.append(input);foot.append(like,comments,section);try{window.PVKit?.addPostSave?.(p,foot)}catch(e){console.warn('Post save:',e)}if(p.author_id===user.id){const del=node('button','','Delete');del.onclick=async()=>{if(!confirm('Delete your post?'))return;const {error}=await db.from('posts').delete().eq('id',p.id);if(error)alert(error.message);await refresh()};foot.append(del)}card.append(foot);root.append(card)});if(!feed.length)root.append(node('div','empty','No cloud posts yet. Share the first one!'));if(document.getElementById('stats'))document.getElementById('stats').textContent=feed.filter(p=>p.author_id===user.id).length+' posts · @'+(profile?.username||'creator')}
document.getElementById('publish').onclick=async()=>{if(!user)return;const caption=document.getElementById('caption').value.trim(),file=document.getElementById('photo').files[0];if(!caption&&!file)return alert('Add a caption or photo');if(caption.length>2200)return alert('Caption too long');const btn=document.getElementById('publish');btn.disabled=true;btn.textContent='Posting…';try{let image_path=null;if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Only JPG, PNG or WebP under 5MB allowed');image_path=user.id+'/'+crypto.randomUUID()+'.'+({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type]);const {error}=await db.storage.from('post-images').upload(image_path,file,{contentType:file.type});if(error)throw error}const {error}=await db.from('posts').insert({author_id:user.id,caption,image_path});if(error)throw error;document.getElementById('caption').value='';document.getElementById('photo').value='';document.getElementById('filename').textContent='';await refresh();await loadOwnPosts();if(status.textContent.startsWith('Cloud feed error'))alert('Post saved, but feed could not load: '+status.textContent)}catch(e){alert(e.message)}finally{btn.disabled=false;btn.textContent='Publish'}};

/* Profile editor + creator discovery, using existing profiles/follows tables */
const extraStyle=document.createElement('style');
extraStyle.textContent=`#profileEditor input,#profileEditor textarea{display:block;width:100%;margin:9px 0;padding:11px;background:#10111f;border:1px solid #41405b;color:#fff;border-radius:10px}#profileEditor textarea{min-height:75px;resize:vertical}.creator{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px;border-bottom:1px solid #363449}.creator button{white-space:nowrap}.creator strong{overflow-wrap:anywhere}.profileAvatar{width:70px;height:70px;border-radius:50%;object-fit:cover}#profileEditor label{display:block;font-size:13px;color:#c6c0d8;margin-top:10px}`;
document.head.append(extraStyle);
const editor=document.createElement('section');editor.id='profileEditor';editor.className='panel';editor.style.marginTop='14px';
editor.innerHTML='<h3>Edit profile</h3><form id="editProfileForm"><label>Username<input id="editUsername" maxlength="24" minlength="3" pattern="[A-Za-z0-9_]{3,24}" required></label><label>Display name<input id="editName" maxlength="60"></label><label>Bio<textarea id="editBio" maxlength="160"></textarea></label><label>Profile photo (JPG, PNG, WebP under 5MB)<input id="editAvatar" type="file" accept="image/jpeg,image/png,image/webp"></label><button class="primary" type="submit">Save profile</button><p id="editFeedback" class="hint" role="status"></p></form>';
document.getElementById('profile').append(editor);
const explore=document.getElementById('explore');explore.replaceChildren();
const pvExploreSearchWrap=node('div','pvExploreSearchWrap'),pvExploreSearch=node('input','pvExploreSearch'),pvExploreGrid=node('div','pvExploreGrid'),pvExploreResults=node('div','pvExploreResults hide');
pvExploreSearch.type='search';pvExploreSearch.placeholder='Search creators, posts and reels';pvExploreSearch.setAttribute('aria-label','Search PAVORA');pvExploreSearch.autocomplete='off';pvExploreSearchWrap.append(node('span','pvExploreMagnify','⌕'),pvExploreSearch);explore.append(pvExploreSearchWrap,pvExploreResults,pvExploreGrid);
const discover=document.createElement('div');discover.id='creatorDirectory';discover.className='panel';discover.style.display='none';explore.append(discover);
let pvExploreBusy=false,pvExploreTiles=[],pvExplorePeople=[];
async function pvLoadExplore(){if(!user||pvExploreBusy)return;pvExploreBusy=true;try{
const [postResult,reelResult,peopleResult]=await Promise.all([
db.from('posts').select('id,author_id,caption,image_path,created_at').not('image_path','is',null).order('created_at',{ascending:false}).limit(75),
db.from('reels').select('id,author_id,caption,video_path,created_at').order('created_at',{ascending:false}).limit(55),
db.from('profiles').select('id,username,display_name,avatar_url').order('created_at',{ascending:false}).limit(80)
]);
pvExplorePeople=peopleResult.data||[];
const pics=(postResult.data||[]).filter(p=>p.image_path).map(p=>({...p,kind:'post'}));
const clips=(reelResult.data||[]).filter(p=>p.video_path).map(p=>({...p,kind:'reel'}));
pvExploreTiles=[...pics,...clips].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
pvRenderExplore();
}catch(e){pvExploreGrid.replaceChildren(node('p','pvExploreEmpty','Explore unavailable: '+e.message))}finally{pvExploreBusy=false}}
function pvRenderExplore(){
const query=pvExploreSearch.value.trim().toLowerCase();
pvExploreGrid.replaceChildren();pvExploreResults.replaceChildren();
const creators=query?pvExplorePeople.filter(p=>(p.username||'').toLowerCase().includes(query)||(p.display_name||'').toLowerCase().includes(query)): [];
pvExploreResults.classList.toggle('hide',!query);
if(query){if(creators.length){pvExploreResults.append(node('h3','','People'));for(const person of creators.slice(0,12)){const row=node('button','pvExplorePerson'),avatar=node('div','pvExplorePersonAvatar'),details=node('span');if(person.avatar_url){const image=node('img');image.src=person.avatar_url;image.alt='';avatar.append(image)}else avatar.textContent=(person.display_name||person.username||'P')[0].toUpperCase();details.append(node('strong','','@'+person.username),node('small','',person.display_name||''));row.append(avatar,details);row.onclick=()=>openCreator(person.id);pvExploreResults.append(row)}}}
const authorMatches=new Set(creators.map(p=>p.id));
const matches=pvExploreTiles.filter(p=>!query||(p.caption||'').toLowerCase().includes(query)||authorMatches.has(p.author_id));
if(!matches.length){pvExploreGrid.append(node('div','pvExploreEmpty',query?'No matching posts or reels found.':'No photos or reels uploaded yet.'));return}
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
document.getElementById('pvDisplayName').textContent=profile.display_name||'';
document.getElementById('pvBio').textContent=profile.bio||'';
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
let pvProfileMediaTab='all',pvOwnPosts=[],pvOwnReels=[];
function pvDrawOwnMedia(){const grid=document.getElementById('pvPostGrid');if(!grid)return;grid.replaceChildren();
document.getElementById('pvAllMediaTab')?.classList.toggle('active',pvProfileMediaTab==='all');
document.getElementById('pvReelsMediaTab')?.classList.toggle('active',pvProfileMediaTab==='reels');
const all=[...pvOwnPosts.map(p=>({...p,kind:'post'})),...pvOwnReels.map(r=>({...r,kind:'reel'}))].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
const shown=pvProfileMediaTab==='reels'?all.filter(x=>x.kind==='reel'):all;
if(!shown.length){grid.append(node('div','pvNoPosts',pvProfileMediaTab==='reels'?'No Reels uploaded yet.':'No posts or Reels yet. Share your first moment!'));return}
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
async function loadCreators(){if(!user)return;discover.replaceChildren();discover.append(node('h3','','Discover creators'));const [{data:people,error},{data:following,error:followError}]=await Promise.all([db.from('profiles').select('id,username,display_name,bio,avatar_url').neq('id',user.id).order('created_at',{ascending:false}).limit(40),db.from('follows').select('following_id').eq('follower_id',user.id)]);if(error||followError){discover.append(node('p','muted',(error||followError).message));return}const followed=new Set((following||[]).map(x=>x.following_id));if(!people?.length)discover.append(node('p','muted','No other creators yet. Invite a friend to PAVORA!'));for(const person of people||[]){const row=node('div','creator'),info=node('div'),name=node('strong','', '@'+person.username);info.append(pvProfileButton(person),node('div','muted',person.display_name||''));const msgBtn=node('button','secondary','Message');msgBtn.onclick=()=>openChat(person.id);if(person.bio)info.append(node('div','muted',person.bio));const btn=node('button','secondary',followed.has(person.id)?'Following ✓':'Follow');btn.onclick=async()=>{btn.disabled=true;const result=followed.has(person.id)?await db.from('follows').delete().eq('follower_id',user.id).eq('following_id',person.id):await db.from('follows').insert({follower_id:user.id,following_id:person.id});if(result.error)alert(result.error.message);await updateSocialProfile()};row.append(info,btn,msgBtn);discover.append(row)}}
document.getElementById('editProfileForm').onsubmit=async event=>{event.preventDefault();if(!user||!profile)return;const feedback=document.getElementById('editFeedback');feedback.textContent='Saving…';const username=document.getElementById('editUsername').value.trim(),display_name=document.getElementById('editName').value.trim(),bio=document.getElementById('editBio').value.trim(),file=document.getElementById('editAvatar').files[0];if(!/^[a-zA-Z0-9_]{3,24}$/.test(username)){feedback.textContent='Username must be 3–24 letters, numbers or underscores';return}try{let avatar_url=profile.avatar_url;if(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Choose a JPG, PNG or WebP under 5MB');const path=user.id+'/avatar-'+crypto.randomUUID()+'.'+({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type]);const upload=await db.storage.from('post-images').upload(path,file,{contentType:file.type});if(upload.error)throw upload.error;avatar_url=db.storage.from('post-images').getPublicUrl(path).data.publicUrl}const {data,error}=await db.from('profiles').update({username,display_name,bio,avatar_url}).eq('id',user.id).select().single();if(error)throw error;profile=data;document.querySelectorAll('.intro b').forEach(x=>x.textContent='@'+username);document.querySelector('#profile h2').textContent=username;feedback.textContent='Profile saved!';await updateSocialProfile();await refreshStoryAvatars();await refresh()}catch(e){feedback.textContent=e.message}};


/* Reels V1: MP4/WebM short-video upload, scroll playback and delete */
const reelsView=document.getElementById('reels');
reelsView.replaceChildren();
const reelsStyles=document.createElement('style');reelsStyles.textContent=`
.reelComposer{padding:16px;background:#171827;border:1px solid #303044;border-radius:16px;margin:12px 0}.reelComposer input,.reelComposer textarea{display:block;width:100%;padding:10px;margin:9px 0;background:#10111f;color:#fff;border:1px solid #39364f;border-radius:10px}.reelCard{background:#171827;border:1px solid #303044;border-radius:16px;margin:16px auto;overflow:hidden;max-width:470px}.reelCard video{width:100%;max-height:75vh;aspect-ratio:9/16;object-fit:contain;background:#000;display:block}.reelInfo{padding:12px 15px}.reelInfo p{white-space:pre-wrap;overflow-wrap:anywhere}.reelInfo button{margin-top:8px}`;document.head.append(reelsStyles);
const reelForm=document.createElement('form');reelForm.className='reelComposer';reelForm.innerHTML='<h2>Reels ▣</h2><p class="muted">Upload an MP4 or WebM video. Upload size depends on your Supabase project limits. Videos are public.</p><input id="reelVideo" type="file" accept="video/mp4,video/webm" required><textarea id="reelCaption" maxlength="1000" placeholder="Write a reel caption…"></textarea><button class="primary" type="submit">Upload Reel</button><p id="reelFeedback" class="hint" role="status"></p>';reelsView.append(reelForm);reelForm.classList.add('hide');const reelUploadToggle=node('button','pvReelUploadToggle','＋ Create Reel');reelUploadToggle.type='button';reelUploadToggle.onclick=()=>{reelForm.classList.toggle('hide');if(!reelForm.classList.contains('hide'))reelForm.scrollIntoView({behavior:'smooth',block:'start'})};reelsView.insertBefore(reelUploadToggle,reelForm);
const reelList=document.createElement('div');reelList.id='reelList';reelsView.append(reelList);
let reelObserver=null;
async function loadReels(){if(!user)return;const list=document.getElementById('reelList');list.replaceChildren(node('p','muted','Loading reels…'));const {data,error}=await db.from('reels').select('id,author_id,caption,video_path,created_at').order('created_at',{ascending:false}).limit(40);if(error){list.replaceChildren(node('p','muted','Reels unavailable: '+error.message));return}list.replaceChildren();if(!data?.length){list.append(node('div','empty','No Reels yet. Upload your first video with ＋ Create Reel.'));return}
const {data:authors}=await db.from('profiles').select('id,username,display_name,avatar_url').in('id',[...new Set(data.map(r=>r.author_id))]);const people=new Map((authors||[]).map(p=>[p.id,p]));if(reelObserver)reelObserver.disconnect();
if(window.pvReelsWheelCleanup)window.pvReelsWheelCleanup();
const reelStage=node('div','pvReelStage'),reelStack=node('div','pvReelStack'),arrows=node('div','pvReelArrows'),up=node('button','pvReelArrow','↑'),down=node('button','pvReelArrow','↓');up.type=down.type='button';up.title='Previous reel';down.title='Next reel';arrows.append(up,down);reelStage.append(reelStack,arrows);list.append(reelStage);
const cards=[];
function reelSvg(path){return '<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+path+'</svg>'}
function reelAction(label,svg,handler){const b=node('button','pvReelAction');b.type='button';b.title=label;b.setAttribute('aria-label',label);b.innerHTML=reelSvg(svg);b.onclick=handler;return b}
let current=0,lastWheelTime=0,snapInProgress=false,snapTimer=null,scrollIdle=null;
function goTo(index,behavior='smooth'){
 if(!cards.length)return;
 const next=Math.max(0,Math.min(cards.length-1,index));
 current=next;
 const target=cards[next];
 const top=target.offsetTop-cards[0].offsetTop;
 reelStack.scrollTo({top,behavior});
 snapInProgress=behavior==='smooth';
 clearTimeout(snapTimer);
 snapTimer=setTimeout(()=>{snapInProgress=false},620);
}
up.onclick=()=>goTo(current-1);down.onclick=()=>goTo(current+1);
// Wheel events can land on the video, right-side buttons, or the page gutter.
// Capture them at document level and keep the active Reels feed as the only scroller.
const pvWheelHandler=e=>{
 if(!document.body.classList.contains('pvReelsMode')||document.querySelector('.pvSuiteModal:not([hidden]),.pvCallOverlay:not([hidden])'))return;
 if(e.target.closest('input,textarea,select,.pvReelComments,.pvSuiteBox'))return;
 if(Math.abs(e.deltaY)<2)return;
 e.preventDefault();
 const now=performance.now();
 if(snapInProgress||now-lastWheelTime<550)return;
 lastWheelTime=now;goTo(current+(e.deltaY>0?1:-1));
};
document.addEventListener('wheel',pvWheelHandler,{passive:false,capture:true});
window.pvReelsWheelCleanup=()=>{document.removeEventListener('wheel',pvWheelHandler,true);clearTimeout(snapTimer);clearTimeout(scrollIdle)};
// Touch scroll uses native momentum and CSS snap. At rest, sync the index and player.
reelStack.addEventListener('scroll',()=>{
 clearTimeout(scrollIdle);
 scrollIdle=setTimeout(()=>{
 const height=reelStack.clientHeight||1;
 current=Math.max(0,Math.min(cards.length-1,Math.round(reelStack.scrollTop/height)));
 snapInProgress=false;
 cards.forEach((card,index)=>{const v=card.querySelector('video');if(!v)return;if(index===current&&document.body.classList.contains('pvReelsMode'))v.play().catch(()=>{});else v.pause()});
 },130);
},{passive:true});
reelStack.addEventListener('keydown',e=>{if(['ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();goTo(current+1)}else if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();goTo(current-1)}});
reelStack.tabIndex=0;reelStack.setAttribute('aria-label','Reels feed — scroll for next video');

for(const reel of data){const person=people.get(reel.author_id)||{},card=node('article','pvReelCard'),screen=node('div','pvReelScreen'),video=node('video'),meta=node('div','pvReelMeta'),author=node('div','pvReelAuthor'),actions=node('div','pvReelActions');
video.src=db.storage.from('reel-videos').getPublicUrl(reel.video_path).data.publicUrl;video.loop=true;video.playsInline=true;video.preload='metadata';video.controls=false;video.setAttribute('aria-label','Reel by '+(person.username||'creator'));
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
reelObserver=new IntersectionObserver(entries=>{for(const entry of entries){const index=cards.indexOf(entry.target);const video=entry.target.querySelector('video');if(entry.isIntersecting&&entry.intersectionRatio>=.65&&document.body.classList.contains('pvReelsMode')){video.play().catch(()=>{});const upcoming=cards[index+1]?.querySelector('video');if(upcoming&&upcoming.preload==='metadata')upcoming.preload='auto'}else video.pause()}},{root:reelStack,threshold:[0,.35,.65,.95]});cards.forEach(c=>reelObserver.observe(c));
requestAnimationFrame(()=>goTo(0,'auto'));
const hash=location.hash.slice(1);if(hash.startsWith('reel-')){const target=document.getElementById(hash);if(target)setTimeout(()=>goTo(cards.indexOf(target),'auto'),100)}
}
reelForm.onsubmit=async event=>{event.preventDefault();if(!user)return;const file=document.getElementById('reelVideo').files[0],caption=document.getElementById('reelCaption').value.trim(),feedback=document.getElementById('reelFeedback'),btn=reelForm.querySelector('button');if(!file||!['video/mp4','video/webm'].includes(file.type)){feedback.textContent='Choose an MP4 or WebM video. Your Supabase project may limit upload size.';return}btn.disabled=true;feedback.textContent='Uploading video…';let path=null;try{path=user.id+'/'+crypto.randomUUID()+(file.type==='video/mp4'?'.mp4':'.webm');const upload=await db.storage.from('reel-videos').upload(path,file,{contentType:file.type});if(upload.error)throw upload.error;const result=await db.from('reels').insert({author_id:user.id,caption,video_path:path});if(result.error)throw result.error;feedback.textContent='Reel published!';reelForm.reset();await loadReels()}catch(e){feedback.textContent=e.message;if(path)await db.storage.from('reel-videos').remove([path])}finally{btn.disabled=false}};
document.querySelector('[data-view="reels"]').addEventListener('click',()=>loadReels());
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
pvPanel.innerHTML='<div id="pvProfileHead"><div class="pvAvatar" id="pvAvatar">P</div><div><div class="pvTopLine"><h2 id="pvUsername">creator</h2><span style="color:#b48bff">✦</span></div><div class="pvCounts"><span><strong id="pvPostCount">0</strong> posts</span><span><strong id="pvReelCount">0</strong> reels</span><span><strong id="pvFollowers">0</strong> followers</span><span><strong id="pvFollowing">0</strong> following</span></div><div class="pvDisplay" id="pvDisplayName"></div><div class="pvBio" id="pvBio"></div></div></div><button class="secondary pvEditButton" id="pvEditToggle">Edit profile</button><div class="pvTabs"><button type="button" class="active" id="pvAllMediaTab">▦ POSTS</button><button type="button" id="pvReelsMediaTab">▣ REELS</button></div><div class="pvGrid" id="pvPostGrid"></div>';
// These tabs are created by pvPanel.innerHTML above; bind only after they exist.
document.getElementById('pvAllMediaTab').onclick=()=>{pvProfileMediaTab='all';pvDrawOwnMedia()};
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
async function refreshStoryAvatars(){if(!user)return;const storyBar=document.getElementById('stories');if(!storyBar)return;const {data:creators,error}=await db.from('profiles').select('id,username,display_name,avatar_url').order('created_at',{ascending:false}).limit(16);if(error)return;storyBar.replaceChildren();const ordered=[profile,...(creators||[]).filter(p=>p.id!==user.id)];for(const person of ordered){if(!person)continue;const item=node('div','storyitem'),circle=node('div','profilepic'),label=node('span','',person.id===user.id?'You':person.display_name||person.username);label.style.cssText='display:block;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';const initial=(person.display_name||person.username||'P')[0].toUpperCase();if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt=(person.display_name||person.username)+' profile photo';img.onerror=()=>{circle.replaceChildren();circle.textContent=initial};circle.append(img)}else circle.textContent=initial;item.append(circle,label);item.style.cursor='pointer';item.title='View '+(person.display_name||person.username)+' profile';item.onclick=()=>person.id===user.id?pvNavigate('profile'):openCreator(person.id);storyBar.append(item)}try{window.PVKit?.renderStories?.(storyBar)}catch(e){console.warn('Story extras:',e)}}
let selectedPeer=null,chatPoll=null;let pvHiddenChats=new Map();
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
if(saved.view==='creator'&&saved.creatorId){await openCreator(saved.creatorId);return}
if(saved.view==='messages'){pvInboxTab=['Primary','General','Requests'].includes(saved.tab)?saved.tab:'Primary';selectedPeer=typeof saved.peer==='string'&&/^[0-9a-f-]{36}$/i.test(saved.peer)?saved.peer:null;pvNavigate('messages');if(selectedPeer&&!chatPoll)chatPoll=setInterval(()=>{if(!inboxView.classList.contains('hide')&&selectedPeer)renderChat(selectedPeer,true)},2500);return}
const b=document.querySelector('aside.left [data-view="'+saved.view+'"]');if(b)b.click();else pvNavigate(saved.view)}
function pvNavigate(view){pvRememberView(view);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));['home','reels','explore','profile','messages','creator'].forEach(v=>{const el=v==='messages'?inboxView:v==='creator'?publicView:document.getElementById(v);if(el)el.classList.toggle('hide',v!==view)});document.body.classList.toggle('pvProfileMode',view==='profile');document.body.classList.toggle('pvMessagesMode',view==='messages');document.body.classList.toggle('pvExploreMode',view==='explore');document.body.classList.toggle('pvReelsMode',view==='reels');try{window.PVKit?.onNavigate?.(view)}catch(e){console.warn('Feature navigation:',e)}if(view==='messages')loadInbox();if(view==='explore')pvLoadExplore();if(view!=='messages'&&chatPoll){clearInterval(chatPoll);chatPoll=null}}
socialNav.addEventListener('click',()=>pvNavigate('messages'));
document.querySelectorAll('[data-view="explore"]').forEach(btn=>btn.addEventListener('click',()=>pvNavigate('explore')));
document.querySelectorAll('[data-view]:not([data-view="explore"])').forEach(btn=>btn.addEventListener('click',()=>document.body.classList.remove('pvExploreMode')));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(b!==socialNav){publicView.classList.add('hide');inboxView.classList.add('hide');if(chatPoll){clearInterval(chatPoll);chatPoll=null}}}));
function pvProfileButton(person){const b=node('button','pvPersonButton','@'+(person.username||'creator'));b.type='button';b.onclick=()=>openCreator(person.id);return b}
async function openCreator(id){if(!user||!id)return;pvRememberView('creator',id);if(id===user.id){pvNavigate('profile');await updateSocialProfile();return}pvNavigate('creator');pvRememberView('creator',id);publicView.replaceChildren(node('p','muted','Loading profile…'));
const [{data:person,error},{data:posts,error:postError},{data:followers},{data:following},{data:myFollow}]=await Promise.all([
db.from('profiles').select('id,username,display_name,bio,avatar_url').eq('id',id).maybeSingle(),
db.from('posts').select('id,caption,image_path,created_at').eq('author_id',id).order('created_at',{ascending:false}).limit(90),
db.from('follows').select('*',{count:'exact',head:true}).eq('following_id',id),
db.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',id),
db.from('follows').select('following_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle()
]);publicView.replaceChildren();if(error||!person){publicView.append(node('p','muted',error?.message||'Profile unavailable'));return}
const back=node('button','secondary','← Explore creators');back.onclick=()=>pvNavigate('explore');publicView.append(back);
const top=node('div','pvPublicTop'),avatar=node('div','pvPublicAvatar');if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='Creator profile photo';img.style.cssText='width:100%;height:100%;object-fit:cover';avatar.append(img)}else avatar.textContent=(person.display_name||person.username||'P')[0].toUpperCase();
const details=node('div');details.append(node('h2','',person.username),node('strong','',person.display_name||person.username),node('p','muted',(posts?.length||0)+' recent posts · '+(followers??0)+' followers · '+(following??0)+' following'),node('p','',person.bio||''));top.append(avatar,details);publicView.append(top);
const actions=node('div','pvPublicActions'),follow=node('button','secondary',myFollow?'Following ✓':'Follow'),message=node('button','primary','✉ Message');
follow.onclick=async()=>{follow.disabled=true;const result=myFollow?await db.from('follows').delete().eq('follower_id',user.id).eq('following_id',id):await db.from('follows').insert({follower_id:user.id,following_id:id});if(result.error)alert(result.error.message);await openCreator(id)};
message.onclick=()=>openChat(id);actions.append(follow,message);publicView.append(actions);
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
async function openChat(id,navigate=true){if(!user||id===user.id)return;if(pvHiddenChats.has(id)){const {error}=await db.from('hidden_conversations').delete().eq('owner_id',user.id).eq('peer_id',id);if(!error)pvHiddenChats.delete(id)}selectedPeer=id;if(navigate){const {data:req}=await db.from('message_requests').select('sender_id').eq('recipient_id',user.id).eq('sender_id',id).is('accepted_at',null).maybeSingle();const {data:following}=req?await db.from('follows').select('follower_id').eq('follower_id',id).eq('following_id',user.id).maybeSingle():{data:null};pvInboxTab=req&&!following?'Requests':pvConversationSetting(id).folder==='general'?'General':'Primary';pvNavigate('messages')}else{inboxView.classList.add('pvChatSelected');inboxView.querySelectorAll('.pvThreadPerson').forEach(b=>b.classList.toggle('active',b.dataset.peerId===id));await renderChat(id)}pvRememberInboxPosition();if(!chatPoll)chatPoll=setInterval(()=>{if(!inboxView.classList.contains('hide')&&selectedPeer)renderChat(selectedPeer,true)},2500)}
async function renderChat(id,silent=false){const area=document.getElementById('pvChatArea');if(!area||!user||selectedPeer!==id)return;
const [{data:person,error:personError},{data:messages,error}]=await Promise.all([
db.from('profiles').select('id,username,display_name,avatar_url,bio').eq('id',id).maybeSingle(),
db.from('direct_messages').select('id,sender_id,recipient_id,body,created_at,read_at').or('and(sender_id.eq.'+user.id+',recipient_id.eq.'+id+'),and(sender_id.eq.'+id+',recipient_id.eq.'+user.id+')').order('created_at',{ascending:true}).limit(200)
]);if(selectedPeer!==id)return;if(error||personError){if(!silent)area.replaceChildren(node('p','muted',(error||personError).message));return}
if(!person){area.replaceChildren(node('p','muted','User unavailable'));return}
if(!document.hidden&&messages?.some(m=>m.recipient_id===user.id&&!m.read_at))pvMarkRead(id);
if(silent&&area.querySelector('input:focus'))return;
const [{data:incoming},{data:outgoing},{data:myFollow}]=await Promise.all([
db.from('message_requests').select('sender_id').eq('recipient_id',user.id).eq('sender_id',id).is('accepted_at',null).maybeSingle(),
db.from('message_requests').select('accepted_at').eq('recipient_id',id).eq('sender_id',user.id).maybeSingle(),
db.from('follows').select('follower_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle()]);
const {data:senderFollowsMe}=incoming?await db.from('follows').select('follower_id').eq('follower_id',id).eq('following_id',user.id).maybeSingle():{data:null};
const pendingIncoming=!!incoming&&!senderFollowsMe,pendingOutgoing=!!outgoing&&!outgoing.accepted_at&&!myFollow,alreadySent=(messages||[]).some(m=>m.sender_id===user.id);
area.replaceChildren();
const chatTop=node('div','pvChatTop'),back=node('button','pvChatBack','‹'),heading=node('h3','',person.display_name||person.username),handle=node('p','muted','@'+person.username),chatWho=node('div','pvChatWho'),list=node('div','pvMessages'),headerAvatar=node('button','pvChatHeaderAvatar');
back.type='button';back.setAttribute('aria-label','Back to conversations');back.onclick=pvInboxMobileBack;
headerAvatar.type='button';headerAvatar.title='View profile';headerAvatar.setAttribute('aria-label','View '+person.username+' profile');
function pvChatAvatar(target){target.replaceChildren();if(person.avatar_url){const img=node('img');img.src=person.avatar_url;img.alt='';img.onerror=()=>{target.replaceChildren();target.textContent=(person.display_name||person.username||'P')[0].toUpperCase()};target.append(img)}else target.textContent=(person.display_name||person.username||'P')[0].toUpperCase()}
pvChatAvatar(headerAvatar);headerAvatar.onclick=()=>openCreator(id);
const headerText=node('button','pvChatHeaderIdentity');headerText.type='button';headerText.onclick=()=>openCreator(id);headerText.append(heading,handle);chatWho.append(headerAvatar,headerText);chatTop.append(back,chatWho);
try{window.PVKit?.addCallActions?.(id,chatTop)}catch(e){console.warn('Call buttons:',e)}
const infoButton=node('button','pvChatInfoButton');infoButton.type='button';infoButton.title='View profile';infoButton.setAttribute('aria-label','View profile');infoButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></svg>';infoButton.onclick=()=>openCreator(id);chatTop.append(infoButton);
const intro=node('div','pvChatIntro'),introAvatar=node('div','pvChatIntroAvatar');pvChatAvatar(introAvatar);
intro.append(introAvatar,node('strong','',person.display_name||person.username),node('span','pvChatIntroHandle','@'+person.username+' · PAVORA'));
const viewProfile=node('button','pvChatViewProfile','View profile');viewProfile.type='button';viewProfile.onclick=()=>openCreator(id);intro.append(viewProfile);
list.append(intro);
let pvLastMessageDay='';
for(const m of messages||[]){
const stamp=new Date(m.created_at),dayKey=stamp.toDateString();if(dayKey!==pvLastMessageDay){pvLastMessageDay=dayKey;list.append(node('div','pvChatDayDivider',stamp.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})))}
const mine=m.sender_id===user.id,row=node('div','pvMessageRow'+(mine?' mine':'')),bubble=node('div','pvBubble'+(mine?' mine':''),m.body);
bubble.title=new Date(m.created_at).toLocaleString();row.append(bubble);if(mine){const del=node('button','pvDeleteMessage','Delete');del.type='button';del.title='Delete this message for everyone';del.setAttribute('aria-label','Delete message for everyone');del.onclick=async()=>{if(!confirm('Delete this message for everyone? This cannot be undone.'))return;del.disabled=true;const {error}=await db.from('direct_messages').delete().eq('id',m.id).eq('sender_id',user.id);if(error){alert('Could not delete message: '+error.message);del.disabled=false;return}await renderChat(id);await pvCheckUnread()};row.append(del)}list.append(row)}if(!messages?.length)list.append(node('p','pvChatEmptyMessage','Say hello! 👋'));const form=node('form','pvMessageForm'),input=node('input');input.placeholder='Message…';input.maxLength=2000;input.required=true;input.setAttribute('aria-label','Message');
const emojiButton=node('button','pvChatEmojiButton');emojiButton.type='button';emojiButton.title='Add emoji';emojiButton.setAttribute('aria-label','Add emoji');emojiButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 14c2 3 6 3 8 0"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>';
const emojiTray=node('div','pvChatEmojiTray');emojiTray.hidden=true;for(const emoji of ['❤️','😂','😍','🥰','🔥','👏','🙌','😊','👍','💜','✨','👋']){const item=node('button','',emoji);item.type='button';item.onclick=()=>{input.value+=emoji;emojiTray.hidden=true;input.focus();input.dispatchEvent(new Event('input'))};emojiTray.append(item)}
emojiButton.onclick=()=>{emojiTray.hidden=!emojiTray.hidden};
const send=node('button','primary pvChatSend','Send');send.type='submit';
const composerWrap=node('div','pvChatComposerWrap');form.append(emojiButton,input,send);composerWrap.append(emojiTray,form);
if(pendingOutgoing&&alreadySent){input.disabled=true;send.disabled=true;input.placeholder='Request pending — waiting for acceptance';}form.onsubmit=async e=>{e.preventDefault();const body=input.value.trim();if(!body)return;send.disabled=true;const {error}=await db.from('direct_messages').insert({sender_id:user.id,recipient_id:id,body});if(error){alert(error.message);send.disabled=false;return}await renderChat(id);await pvCheckUnread();};area.append(chatTop);
if(pendingIncoming){const banner=node('div','pvRequestBanner'),description=node('p','','Message request from someone who does not follow you.'),accept=node('button','pvAcceptRequest','Accept'),remove=node('button','pvDeclineRequest','Remove');accept.type=remove.type='button';accept.onclick=async()=>{accept.disabled=true;const {error}=await db.from('message_requests').update({accepted_at:new Date().toISOString()}).eq('recipient_id',user.id).eq('sender_id',id).is('accepted_at',null);if(error){alert('Could not accept request: '+error.message);accept.disabled=false;return}pvInboxTab='Primary';await loadInbox();await pvCheckUnread()};remove.onclick=()=>pvRemoveChat(id);banner.append(description,accept,remove);area.append(banner)}
if(pendingOutgoing){area.append(node('p','pvPendingRequestNote',alreadySent?'Request sent. Wait for acceptance, or follow this account to continue.':'You can send one message request. Follow this account to message freely.'))}
area.append(list,composerWrap);emojiButton.disabled=input.disabled;list.scrollTop=list.scrollHeight}


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
 b.onclick=()=>{document.querySelector('aside.left [data-view="'+key+'"]')?.click();document.body.classList.remove('pvDrawerOpen');pvSyncRail()};
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

async function setSession(session){const nextUser=session?.user||null;if(nextUser&&pvSessionInitializing&&pvSessionInitUser===nextUser.id)return pvSessionInitializing;user=nextUser;overlay.classList.toggle('pvAuthHidden',!!user);signout.style.display=user?'':'none';if(user){pvSessionInitUser=user.id;pvSessionInitializing=(async()=>{try{
await ensureProfile();
const pvSafeSetup=async(label,fn)=>{try{await fn()}catch(err){console.warn('PAVORA '+label+' setup failed:',err);status.textContent=label+' temporarily unavailable: '+err.message}};
await pvSafeSetup('Stories',refreshStoryAvatars);
await pvSafeSetup('Social suite',async()=>window.PVKit?.init?.());
await pvSafeSetup('Home feed',refresh);
await pvSafeSetup('Profile',updateSocialProfile);
pvHiddenChats=new Map();await pvSafeSetup('Hidden chats',pvLoadHiddenChats);
pvConversationSettings=new Map();await pvSafeSetup('Conversation folders',pvLoadConversationSettings);pvUnreadAvailable=true;pvLastNotified=null;pvLastNoticeId=null;pvIncomingBaseline=null;pvUnreadInitialized=false;await pvSafeSetup('Unread messages',()=>pvCheckUnread(true));if(pvUnreadTimer)clearInterval(pvUnreadTimer);pvUnreadTimer=setInterval(()=>{if(!document.hidden)pvCheckUnread()},2500);if(pvActivityUserId!==user.id){pvActivityUserId=user.id;pvActivityReady=false;pvActivityLatest=null;pvActivityLatestTime=null}await pvSafeSetup('Activity notifications',()=>pvCheckActivity(!pvActivityReady));if(pvActivityTimer)clearInterval(pvActivityTimer);pvActivityTimer=setInterval(()=>{if(!document.hidden)pvCheckActivity()},3000);await pvSafeSetup('Saved page',pvRestoreView)}catch(e){console.error('PAVORA startup failed:',e.stack||e);status.textContent='App setup error: '+e.message+' — Please refresh. If this continues, send a screenshot.'}finally{pvSessionInitializing=null}})();await pvSessionInitializing}else{pvSessionInitUser=null;pvSessionInitializing=null;window.PVKit?.cleanup?.();pvCloseActivity();if(pvActivityTimer){clearInterval(pvActivityTimer);pvActivityTimer=null}pvActivityUserId=null;pvActivityReady=false;pvActivityLatest=null;pvActivityLatestTime=null;pvSetActivityCount(0);pvRestoredForUser=null;selectedPeer=null;pvHiddenChats=new Map();pvConversationSettings=new Map();if(pvUnreadTimer){clearInterval(pvUnreadTimer);pvUnreadTimer=null}pvSetUnreadBadge(0);pvLastNotified=null;pvLastNoticeId=null;pvIncomingBaseline=null;pvUnreadInitialized=false;if(chatPoll){clearInterval(chatPoll);chatPoll=null}profile=null;feed=[];document.getElementById('posts').replaceChildren();status.textContent='Sign in to access the cloud feed.'}document.body.classList.remove('pvBooting')}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user){pvCheckUnread();pvCheckActivity()}});
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
document.body.classList.remove('pvBooting');
msg('Could not restore your saved login. Check your connection, then refresh.');
console.warn('Initial session unavailable:',e.message)
}
})();