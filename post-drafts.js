/* PAVORA v69 — Private local post caption drafts.
   No backend permissions, no draft messages uploaded. Drafts are saved per account
   on this browser only, and discarded once a post is published successfully. */
(()=>{
 'use strict';
 const kit=window.PVKit;
 if(!kit)return;
 const input=document.getElementById('caption'),publish=document.getElementById('publish');
 if(!input||!publish)return;
 const composer=input.closest('.composer');
 if(!composer)return;
 input.maxLength=2200;
 const key=id=>'pavora-post-caption-draft:'+id;
 let owner=null,saveTimeout=null,lastKnown='',hasLoaded=false;
 const bar=document.createElement('div');
 bar.className='pvDraftTools';
 const status=document.createElement('small'),save=document.createElement('button'),discard=document.createElement('button'),count=document.createElement('span');
 status.textContent='Drafts stay on this device only';
 save.type=discard.type='button';
 save.textContent='Save draft';discard.textContent='Discard draft';
 count.textContent='0 / 2200';
 bar.append(status,save,discard,count);
 const style=document.createElement('style');
 style.textContent='.pvDraftTools{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:10px;color:#bdb1ce;font-size:12px}.pvDraftTools button{border:1px solid #625077;border-radius:9px;background:#322542;color:#f8ecff;font-size:12px;padding:7px 10px;font-weight:700;cursor:pointer}.pvDraftTools button:hover{background:#49335f}.pvDraftTools span{margin-left:auto;font-variant-numeric:tabular-nums}.pvDraftTools small{min-width:0;overflow-wrap:anywhere}.pvDraftTools [disabled]{opacity:.5;cursor:default}';
 document.head.append(style);composer.append(bar);
 const who=()=>kit.getUser()?.id||null;
 const updateCount=()=>{count.textContent=input.value.length+' / 2200';count.style.color=input.value.length>2100?'#f9acb2':''};
 function store(){
  const id=who();
  if(!id||owner!==id)return;
  const value=input.value;
  try{
   if(value.trim())localStorage.setItem(key(id),JSON.stringify({caption:value,updatedAt:Date.now()}));
   else localStorage.removeItem(key(id));
   status.textContent=value.trim()?'Draft saved on this device':'No saved draft';
  }catch(e){status.textContent='Could not save draft (storage unavailable)'}
 }
 function schedule(){updateCount();status.textContent='Saving draft…';clearTimeout(saveTimeout);saveTimeout=setTimeout(store,450)}
 function sync(){
  const id=who();
  if(id===owner&&hasLoaded)return;
  clearTimeout(saveTimeout);const priorOwner=owner;owner=id;hasLoaded=true;lastKnown='';if(priorOwner&&priorOwner!==id)input.value='';
  if(!id){input.value='';status.textContent='Sign in to save a private draft';save.disabled=discard.disabled=true;updateCount();return}
  save.disabled=discard.disabled=false;
  try{
   const draft=JSON.parse(localStorage.getItem(key(id))||'null');
   // Never overwrite text the user has already started composing.
   if(draft?.caption&&!input.value.trim()){input.value=String(draft.caption).slice(0,2200);status.textContent='Draft restored from this device'}
   else status.textContent='Drafts stay on this device only';
  }catch(e){status.textContent='Draft storage unavailable'}
  updateCount();
 }
 input.addEventListener('input',schedule);
 save.addEventListener('click',()=>{clearTimeout(saveTimeout);store()});
 discard.addEventListener('click',()=>{
  if(!input.value.trim()||confirm('Discard this saved post caption?')){
   clearTimeout(saveTimeout);
   input.value='';const id=who();if(id)try{localStorage.removeItem(key(id))}catch(e){}
   status.textContent='Draft discarded';updateCount();
  }
 });
 document.addEventListener('pv:post-published',()=>{
  const id=who();clearTimeout(saveTimeout);
  if(id)try{localStorage.removeItem(key(id))}catch(e){}
  input.value='';status.textContent='Published · Draft cleared';updateCount();
 });
 window.addEventListener('pagehide',()=>{if(saveTimeout)store()});
 kit.db.auth.onAuthStateChange(()=>setTimeout(sync,0));
 sync();setInterval(sync,1000);
})();
