/* PAVORA v50 self-managed password hints + verified recovery link password update.
 * Never stores a password or password fragment; never exposes hints to support/admin. */
(()=>{
'use strict';
const kit=window.PVKit;if(!kit)return;
const db=kit.db,who=()=>kit.getUser()?.id;
const el=(tag,cls='',text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
const styles=el('style');styles.textContent=`
#pvPasswordModal[hidden],#pvPasswordResetModal[hidden],#pvHintLauncher[hidden]{display:none!important}
#pvPasswordModal,#pvPasswordResetModal{position:fixed;inset:0;z-index:1000;background:#100a1be8;display:grid;place-items:center;padding:16px}
.pvPasswordCard{background:#fff;color:#231b30;border-radius:18px;width:min(460px,100%);box-shadow:0 20px 80px #0008;padding:22px;max-height:90dvh;overflow:auto;font:14px/1.5 Inter,system-ui,sans-serif}
.pvPasswordCard h2{margin:0 0 10px}.pvPasswordCard p{color:#62576d;font-size:13px}
.pvPasswordCard textarea,.pvPasswordCard input{display:block;box-sizing:border-box;width:100%;border:1px solid #d1c4db;border-radius:11px;padding:12px;background:#fff;color:#221c2d;margin:10px 0;font:inherit}
.pvPasswordCard button,#pvHintLauncher{border:0;border-radius:10px;padding:11px 13px;background:#6b44b8;color:#fff;font-weight:750;cursor:pointer;margin-right:8px}
.pvPasswordCard button.secondary{background:#eae6f1;color:#3e3252}
.pvPasswordCard .pvPasswordStatus{min-height:18px;font-weight:700}
#pvHintLauncher{margin:8px 0}
`;document.head.append(styles);
const hintBtn=el('button','','🔐 Password hint');hintBtn.type='button';hintBtn.id='pvHintLauncher';hintBtn.hidden=true;document.querySelector('#profile > .panel')?.prepend(hintBtn);
const hintModal=el('section');hintModal.id='pvPasswordModal';hintModal.hidden=true;hintModal.setAttribute('role','dialog');hintModal.setAttribute('aria-modal','true');
const hintCard=el('div','pvPasswordCard');hintCard.append(el('h2','','Your Password Reminder'),el('p','','Set a clue you will remember. Do NOT use the real password, its first/last letters, an OTP or an answer to a security question.'));
const hintInput=el('textarea');hintInput.rows=3;hintInput.maxLength=120;hintInput.placeholder='Example: Name of my favourite childhood cartoon + a year (not the actual password)';hintInput.setAttribute('aria-label','Non-secret password hint');
const hintStatus=el('p','pvPasswordStatus');const save=el('button','','Save hint'),remove=el('button','secondary','Remove hint'),close=el('button','secondary','Close');save.type=remove.type=close.type='button';
hintCard.append(hintInput,save,remove,close,hintStatus);hintModal.append(hintCard);document.body.append(hintModal);
hintBtn.onclick=async()=>{if(!who())return;const id=who();hintModal.hidden=false;hintStatus.textContent='Loading your hint…';try{const {data,error}=await db.from('pv_password_hints').select('hint').eq('user_id',id).maybeSingle();if(error)throw error;if(id!==who())return;hintInput.value=data?.hint||'';hintStatus.textContent=data?'Your private hint is saved.':'No hint saved yet.'}catch(e){hintStatus.textContent='Could not load hint: '+e.message}};
save.onclick=async()=>{const id=who(),hint=hintInput.value.trim();if(!id)return;if(hint.length<4||hint.length>120){hintStatus.textContent='Hint must be 4–120 characters.';return}hintStatus.textContent='Saving…';save.disabled=true;try{const {error}=await db.from('pv_password_hints').upsert({user_id:id,hint,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;hintStatus.textContent='Hint saved for your account only.'}catch(e){hintStatus.textContent='Save failed: '+e.message}finally{save.disabled=false}};
remove.onclick=async()=>{const id=who();if(!id)return;remove.disabled=true;try{const {error}=await db.from('pv_password_hints').delete().eq('user_id',id);if(error)throw error;hintInput.value='';hintStatus.textContent='Hint removed.'}catch(e){hintStatus.textContent=e.message}finally{remove.disabled=false}};
close.onclick=()=>hintModal.hidden=true;
const resetModal=el('section');resetModal.id='pvPasswordResetModal';resetModal.hidden=true;resetModal.setAttribute('role','dialog');resetModal.setAttribute('aria-modal','true');
const resetCard=el('div','pvPasswordCard');resetCard.append(el('h2','','Set a new PAVORA password'),el('p','','You opened a verified reset link. Choose a strong new password. Your existing password cannot be viewed.'));
const resetPass=el('input');resetPass.type='password';resetPass.minLength=10;resetPass.autocomplete='new-password';resetPass.placeholder='New password (at least 10 characters)';
const resetConfirm=el('input');resetConfirm.type='password';resetConfirm.minLength=10;resetConfirm.autocomplete='new-password';resetConfirm.placeholder='Confirm new password';
const resetSave=el('button','','Update password'),resetStatus=el('p','pvPasswordStatus');resetSave.type='button';resetCard.append(resetPass,resetConfirm,resetSave,resetStatus);resetModal.append(resetCard);document.body.append(resetModal);
let hasRecovery=false,finished=false;
const clearRecovery=()=>{hasRecovery=false;finished=true;resetModal.hidden=true;resetPass.value='';resetConfirm.value=''};
resetSave.onclick=async()=>{if(!hasRecovery)return;const password=resetPass.value;if(password.length<10){resetStatus.textContent='Use at least 10 characters.';return}if(password!==resetConfirm.value){resetStatus.textContent='Passwords do not match.';return}resetSave.disabled=true;resetStatus.textContent='Updating securely…';try{const {error}=await db.auth.updateUser({password});if(error)throw error;resetStatus.textContent='Password updated successfully. You can now use your new password.';setTimeout(clearRecovery,1500)}catch(e){resetStatus.textContent='Could not update password: '+e.message}finally{resetSave.disabled=false}};
db.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY'&&session?.user){hasRecovery=true;finished=false;resetModal.hidden=false;resetStatus.textContent='';resetPass.focus()}if(event==='SIGNED_OUT'){hintBtn.hidden=true;hintModal.hidden=true}});
let lastUser=null;setInterval(()=>{const id=who();if(id!==lastUser){lastUser=id;hintBtn.hidden=!id;if(!id)hintModal.hidden=true}},2500);
})();
