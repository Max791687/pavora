/* PAVORA v79 — personal Feed Controls (device-local).
 * Works on authentic Supabase posts and clearly-labeled virtual demo posts.
 * No changes to likes, comments, authorization or backend data.
 */
(()=>{
'use strict';
const kit=window.PVKit,root=document.getElementById('posts');
if(!kit||!root)return;
const css=document.createElement('style');
css.textContent=`
#posts article.pvFeedDismissed{display:none!important}
.pvFeedMenuWrap{position:relative;margin-left:auto;flex:0 0 auto}
.pvFeedMenuTrigger{border:0;background:transparent;color:#c9bfce;cursor:pointer;font-size:22px;line-height:1;padding:5px 8px;border-radius:8px}
.pvFeedMenuTrigger:focus-visible,.pvFeedMenu button:focus-visible{outline:2px solid #c49bff;outline-offset:2px}
.pvFeedMenu{position:absolute;right:0;top:100%;z-index:15;background:#211927;border:1px solid #5c4b68;border-radius:11px;min-width:176px;box-shadow:0 12px 24px #0008;overflow:hidden}
.pvFeedMenu[hidden]{display:none!important}
.pvFeedMenu button{width:100%;border:0;background:none;color:#f2e8f6;padding:12px 13px;text-align:left;cursor:pointer;font-size:12px}
.pvFeedMenu button:hover{background:#392a47}
#pvFeedUndoToast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:420;max-width:calc(100vw - 26px);display:flex;align-items:center;gap:12px;background:#292035;border:1px solid #6d5088;color:#fff;padding:12px 14px;border-radius:12px;box-shadow:0 12px 35px #0008;font-size:12px}
#pvFeedUndoToast[hidden]{display:none!important}
#pvFeedUndoToast button,.pvFeedRestoreButton{border:1px solid #8062a3;border-radius:9px;color:white;background:#513672;padding:7px 12px;font-size:12px;cursor:pointer;font-weight:700}
.pvFeedRestoreButton{margin:7px 0 12px}
`;
document.head.append(css);
let account=null,hiddenIds=new Set(),lastDismissed=null;
const key=id=>'pavora-hidden-feed-posts-v1:'+id;
const id=()=>kit.getUser?.()?.id||null;
function persist(){
 if(!account)return;
 try{localStorage.setItem(key(account),JSON.stringify([...hiddenIds].slice(-1000)))}catch(e){}
}
function loadAccount(){
 const current=id();
 if(current===account)return;
 account=current;hiddenIds=new Set();lastDismissed=null;
 try{if(current)hiddenIds=new Set(JSON.parse(localStorage.getItem(key(current))||'[]'))}catch(e){}
 applyHidden();
 renderRestore();
}
function postKey(post){
 if(post.classList.contains('pvDailyCard'))return 'demo:'+post.id;
 if(/^pv-post-/.test(post.id))return 'real:'+post.id;
 return null;
}
function applyHidden(){
 for(const card of root.querySelectorAll(':scope > article.post')){
  const k=postKey(card);
  card.classList.toggle('pvFeedDismissed',!!k&&hiddenIds.has(k));
 }
}
const undoToast=document.createElement('div');undoToast.id='pvFeedUndoToast';undoToast.hidden=true;
undoToast.setAttribute('role','status');
const undoMessage=document.createElement('span');undoMessage.textContent='Post hidden from your feed';
const undoButton=document.createElement('button');undoButton.type='button';undoButton.textContent='Undo';
undoToast.append(undoMessage,undoButton);document.body.append(undoToast);
const restore=document.createElement('button');restore.type='button';restore.className='pvFeedRestoreButton';
restore.textContent='Manage hidden posts';restore.hidden=true;
const tabRoot=document.querySelector('.pvFeedModeTabs');
if(tabRoot)tabRoot.after(restore);
else root.before(restore);
function renderRestore(){
 restore.hidden=!account||hiddenIds.size===0;
 restore.textContent='Restore hidden posts ('+hiddenIds.size+')';
}
function dismiss(card){
 const k=postKey(card);if(!k||!account)return;
 hiddenIds.add(k);persist();applyHidden();renderRestore();
 lastDismissed={key:k,user:account};
 undoToast.hidden=false;
 undoMessage.textContent=card.classList.contains('pvDailyCard')?'Demo post hidden from your feed':'Post hidden from your feed';
}
undoButton.onclick=()=>{
 if(!lastDismissed||lastDismissed.user!==account){undoToast.hidden=true;return}
 hiddenIds.delete(lastDismissed.key);lastDismissed=null;
 persist();applyHidden();renderRestore();undoToast.hidden=true;
};
restore.onclick=()=>{
 if(!account||!hiddenIds.size)return;
 if(!confirm('Restore all '+hiddenIds.size+' posts hidden on this device?'))return;
 hiddenIds.clear();lastDismissed=null;persist();applyHidden();renderRestore();undoToast.hidden=true;
};
function install(card){
 if(card.dataset.pvFeedControl==='1'||!postKey(card))return;
 const head=card.querySelector('.posthead');
 if(!head)return;
 card.dataset.pvFeedControl='1';
 const holder=document.createElement('div');holder.className='pvFeedMenuWrap';
 const trigger=document.createElement('button');trigger.type='button';trigger.className='pvFeedMenuTrigger';
 trigger.textContent='⋯';trigger.setAttribute('aria-label','Post options');trigger.setAttribute('aria-expanded','false');
 const menu=document.createElement('div');menu.className='pvFeedMenu';menu.hidden=true;
 const hide=document.createElement('button');hide.type='button';hide.textContent='Not interested · Hide post';
 menu.append(hide);holder.append(trigger,menu);
 head.append(holder);
 trigger.onclick=()=>{
  const next=menu.hidden;
  document.querySelectorAll('.pvFeedMenu').forEach(m=>{m.hidden=true;m.parentElement?.querySelector('.pvFeedMenuTrigger')?.setAttribute('aria-expanded','false')});
  menu.hidden=!next;trigger.setAttribute('aria-expanded',String(next));
 };
 hide.onclick=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');dismiss(card)};
 card.classList.toggle('pvFeedDismissed',hiddenIds.has(postKey(card)));
}
function attachAll(){
 loadAccount();
 for(const card of root.querySelectorAll(':scope > article.post'))install(card);
}
let queued=false;
const observer=new MutationObserver(()=>{
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;attachAll()});
});
observer.observe(root,{childList:true,subtree:false});
document.addEventListener('click',e=>{
 if(!e.target.closest?.('.pvFeedMenuWrap')){
  document.querySelectorAll('.pvFeedMenu').forEach(menu=>{menu.hidden=true;menu.parentElement?.querySelector('.pvFeedMenuTrigger')?.setAttribute('aria-expanded','false')});
 }
});
kit.db.auth.onAuthStateChange(()=>setTimeout(attachAll,0));
attachAll();
setInterval(loadAccount,3000);
})();
