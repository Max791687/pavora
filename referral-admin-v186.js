/* PAVORA Referral Pro v187 — server-verified owner-only dashboard with invite funnel.
  No automatic payment. Mark Paid only AFTER external UPI transfer and reference. */
(()=>{
'use strict';
if(window.PAVORA_REFERRAL_ADMIN)return;
const db=()=>window.PVKit?.db;
const me=()=>window.PVKit?.getUser?.();
const css=document.createElement('style');
css.id='pvReferralAdminCSS186';
css.textContent=[
'#pvRefAdmin186[hidden]{display:none!important}#pvRefAdmin186{position:fixed;inset:0;z-index:12500;padding:16px;display:grid;place-items:center;background:#070518ed;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#faf6ff}',
'#pvRefAdmin186 *{box-sizing:border-box}#pvRefAdmin186 .praPanel{width:min(1120px,100%);height:min(92dvh,900px);display:flex;flex-direction:column;min-width:0;overflow:hidden;border:1px solid #ad8cff8f;border-radius:24px;background:radial-gradient(ellipse at 20% 0%,#8660cb41,transparent 54%),linear-gradient(140deg,#221b3b,#0f1329 72%);box-shadow:0 30px 110px #000d}',
'#pvRefAdmin186 .praHeader{display:flex;gap:10px;align-items:center;border-bottom:1px solid #cab0eb3d;padding:15px 20px}#pvRefAdmin186 h2{font-size:20px;margin:0}#pvRefAdmin186 h3{font-size:15px;margin:0 0 12px}#pvRefAdmin186 small{color:#d3c5e6}',
'#pvRefAdmin186 button{font:inherit;cursor:pointer;border-radius:10px;background:#6747a6;color:#fff;border:1px solid #b594ef7b;padding:8px 12px}#pvRefAdmin186 button:disabled{opacity:.45;cursor:default}#pvRefAdmin186 .praClose{margin-left:auto;font-size:19px}',
'#pvRefAdmin186 .praBody{min-height:0;overflow:auto;padding:17px}#pvRefAdmin186 .praKpi{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:15px}#pvRefAdmin186 .praMetric{background:#ffffff12;border:1px solid #ffffff27;border-radius:14px;padding:12px}#pvRefAdmin186 .praMetric strong{display:block;font-size:23px}#pvRefAdmin186 .praMetric small{font-size:11px}',
'#pvRefAdmin186 .praSection{border:1px solid #c6a6ef58;border-radius:17px;background:#ffffff0c;padding:14px;margin-bottom:14px}#pvRefAdmin186 .praControls{display:flex;flex-wrap:wrap;align-items:end;gap:11px}#pvRefAdmin186 label{font-size:12px;color:#e7d9fd;display:grid;gap:5px}#pvRefAdmin186 input,#pvRefAdmin186 select{background:#131332;color:white;padding:10px;border-radius:10px;border:1px solid #c0a6eb73;max-width:100%}#pvRefAdmin186 input[type=number]{width:140px}#pvRefAdmin186 .praTable{overflow:auto;max-height:295px;border-radius:11px;border:1px solid #ffffff23}#pvRefAdmin186 table{width:100%;border-collapse:collapse;font-size:12px}#pvRefAdmin186 th,#pvRefAdmin186 td{padding:10px 9px;text-align:left;white-space:nowrap;border-bottom:1px solid #ffffff20}#pvRefAdmin186 td:last-child{white-space:normal;min-width:145px}#pvRefAdmin186 th{color:#e9d8fd;background:#ffffff10;position:sticky;top:0}#pvRefAdmin186 .praActions{display:flex;flex-wrap:wrap;gap:5px}#pvRefAdmin186 .praActions button{font-size:11px;padding:6px 9px}#pvRefAdmin186 .praReject{background:#763c5e}#pvRefAdmin186 .praMuted{font-size:12px;color:#d6c8ee;line-height:1.55}#pvRefAdmin186 .praMessage{min-height:20px;font-size:12px;color:#ffdf9f}#pvRefAdmin186 .praTag{display:inline-block;border:1px solid #bea1ec79;background:#a279ec25;border-radius:9px;padding:3px 7px}#pvRefAdmin186 .praReload{background:#ffffff18}',
'.pvRefAdminOpen186{border:1px solid #cfb5ff86!important;background:#6c4b9b!important;color:white!important;border-radius:11px!important;padding:8px 12px!important;font-weight:750!important;font-size:12px!important;cursor:pointer!important}',
'@media(max-width:700px){#pvRefAdmin186{padding:0}#pvRefAdmin186 .praPanel{height:100dvh;border-radius:0}#pvRefAdmin186 .praBody{padding:10px}#pvRefAdmin186 .praHeader{padding:12px}#pvRefAdmin186 .praKpi{grid-template-columns:repeat(2,minmax(0,1fr))}#pvRefAdmin186 .praSection{padding:11px}}'
].join('\n');document.head.append(css);
const modal=document.createElement('div');modal.id='pvRefAdmin186';modal.hidden=true;
modal.innerHTML='<div class="praPanel" role="dialog" aria-modal="true" aria-label="Referral Pro owner controls">'+
'<div class="praHeader"><span style="font-size:25px">🛡</span><div><h2>Referral Pro · Owner</h2><small>Payout review · Fraud checks · Budget controls</small></div><button class="praClose" type="button" id="praClose">×</button></div>'+
'<div class="praBody"><p class="praMessage" id="praMessage" role="status">Loading…</p>'+
'<div class="praKpi"><div class="praMetric"><strong id="praVerified">—</strong><small>Approved referrals</small></div><div class="praMetric"><strong id="praToReview">—</strong><small>Awaiting review</small></div><div class="praMetric"><strong id="praPaid">—</strong><small>Marked paid</small></div><div class="praMetric"><strong id="praCommitted">—</strong><small>Paid + pending requests</small></div></div>'+
'<section class="praSection"><h3>Campaign budget & safety</h3><div class="praControls"><label>Campaign status <select id="praEnabled"><option value="false">Paused — no new requests</option><option value="true">Active</option></select></label><label>Total payout budget (₹) <input type="number" id="praBudget" min="0" max="1000000" step="1" value="0"></label><button type="button" id="praSave">Save controls</button><button class="praReload" type="button" id="praRefresh">↻ Refresh</button></div><p class="praMuted" id="praRemaining">No budget configured.</p><p class="praMuted">Limits are checked on the server. Existing approved + pending commitments cannot be erased by decreasing the budget. Approval never sends UPI money.</p></section>'+
'<section class="praSection"><h3>🔗 Invite link → Signup funnel</h3><p class="praMuted">See who shared an invite link and whether link opens converted into verified signups and app launches. Link opens are approximate browser sessions, NOT identified users or qualifying referrals.</p><div class="praTable" id="praFunnelTable">Loading link activity…</div></section>'+
'<section class="praSection"><h3>Referral anti-fraud review</h3><p class="praMuted">Approve only after independently checking that the signup is genuine and the app was installed and opened. Standalone detection is only a browser signal, not proof. Recent referral bursts are flagged for review.</p><div class="praTable" id="praJoinTable">Loading referrals…</div></section>'+
'<section class="praSection"><h3>UPI payout requests & history</h3><p class="praMuted">To mark a request paid: send the UPI transfer outside PAVORA, verify it succeeded, then record the transaction reference. Reject requests with a reason. No automatic UPI transfer exists.</p><div class="praTable" id="praPayoutTable">Loading payout history…</div></section>'+
'</div></div>';
document.body.append(modal);
const $=s=>modal.querySelector(s),status=$('#praMessage'),money=p=>'₹'+(Number(p||0)/100).toFixed(2);
let data=null,busy=false,authorized=false;
function textEl(tag,text){const e=document.createElement(tag);e.textContent=String(text??'');return e}
function cell(tr,value){const td=textEl('td',value);tr.append(td);return td}
function button(text,fn,cls=''){const b=textEl('button',text);b.type='button';if(cls)b.className=cls;b.onclick=fn;return b}
async function checkAdmin(){
 if(!db()||!me())return false;
 try{const {data:ok,error}=await db().rpc('pv_referral_is_admin');return !error&&ok===true}catch(e){return false}
}
async function call(name,args){
 const {data:result,error}=await db().rpc(name,args);
 if(error)throw error;return result;
}
async function load(){
 if(busy)return;busy=true;status.textContent='Loading secure referral records…';
 try{
  authorized=await checkAdmin();
  if(!authorized){modal.hidden=true;status.textContent='Admin access required';return}
  data=await call('pv_referral_admin_dashboard');
  $('#praVerified').textContent=data.approved||0;
  $('#praToReview').textContent=data.pending_review||0;
  $('#praPaid').textContent=money(data.paid_paise);
  $('#praCommitted').textContent=money(data.committed_paise);
  $('#praEnabled').value=String(!!data.campaign?.enabled);
  $('#praBudget').value=(Number(data.campaign?.budget_paise||0)/100).toFixed(0);
  $('#praRemaining').textContent='Committed: '+money(data.committed_paise)+' · Remaining budget: '+money(Math.max(0,(data.campaign?.budget_paise||0)-(data.committed_paise||0)))+' · Campaign '+(data.campaign?.enabled?'ACTIVE':'PAUSED');
  renderJoins();renderPayouts();
  await loadFunnel();status.textContent='Updated · '+new Date().toLocaleTimeString();
 }catch(err){status.textContent='Could not load referral admin records: '+(err.message||err)}
 finally{busy=false}
}
async function change(name,args,success){
 if(busy||!authorized)return;
 busy=true;status.textContent='Checking admin action…';
 try{const result=await call(name,args);if(result!=='saved'){status.textContent='Not changed: '+result;return}
  status.textContent=success||'Saved';busy=false;await load();
 }catch(e){status.textContent='Action failed: '+(e.message||e)}finally{busy=false}
}
async function loadFunnel(){
 const root=$('#praFunnelTable');root.textContent='Loading link activity…';
 try{
  const result=await call('pv_referral_admin_funnel');root.replaceChildren();
  const t=document.createElement('p');t.className='praMuted';t.textContent='Total link opens: '+(result.totals?.link_opens??0)+' · Verified signups: '+(result.totals?.verified_signups??0)+' · App launches: '+(result.totals?.app_launches??0);root.append(t);
  const list=result.senders||[];if(!list.length){root.append(textEl('p','No invite links generated yet.'));return}
  const tbl=document.createElement('table'),head=document.createElement('thead'),headrow=document.createElement('tr');
  ['Sent by','Link opens','IDs created','App launched','Admin approved'].forEach(x=>headrow.append(textEl('th',x)));head.append(headrow);tbl.append(head);
  const body=document.createElement('tbody');for(const x of list){const row=document.createElement('tr');cell(row,'@'+(x.username||String(x.sender_id||'').slice(0,8)));cell(row,String(x.link_opens||0));cell(row,String(x.verified_signups||0));cell(row,String(x.app_launches||0));cell(row,String(x.approved||0));body.append(row)}
  tbl.append(body);root.append(tbl)
 }catch(e){root.textContent='Unable to load link activity: '+(e.message||e)}
}
function renderJoins(){
 const root=$('#praJoinTable');root.replaceChildren();
 const list=data?.referrals||[];
 if(!list.length){root.append(textEl('p','No referred signups yet.'));return}
 const tbl=document.createElement('table'),head=document.createElement('thead'),tr=document.createElement('tr');
 ['Invited','Inviter','Joined','App signal','Risk / review','Action'].forEach(t=>tr.append(textEl('th',t)));head.append(tr);tbl.append(head);
 const body=document.createElement('tbody');
 for(const x of list){
  const row=document.createElement('tr');
  cell(row,'@'+(x.invited||String(x.id).slice(0,8)));
  cell(row,'@'+(x.inviter||String(x.inviter_id).slice(0,8)));
  cell(row,new Date(x.created_at).toLocaleDateString('en-IN'));
  cell(row,x.installed?'Opened':'Not seen');
  cell(row,(x.review_status||'pending')+' · '+(x.risk||'Check manually'));
  const actions=cell(row,'');const wrap=document.createElement('div');wrap.className='praActions';
  if(x.review_status==='pending'){
   wrap.append(button('Approve',()=>{if(!x.installed){status.textContent='No installed-app signal for this referral.';return}if(confirm('Have you independently verified this referral is legitimate?'))void change('pv_referral_review_join',{p_user_id:x.id,p_decision:'approved',p_note:'Manual verification'},'Referral approved')}));
   wrap.append(button('Reject',()=>{const reason=prompt('Reason for rejection (visible to owner/admin review only):');if(reason&&reason.trim())void change('pv_referral_review_join',{p_user_id:x.id,p_decision:'rejected',p_note:reason.trim()},'Referral rejected')},'praReject'));
  }else{wrap.append(textEl('span','Reviewed'))}
  actions.append(wrap);body.append(row)
 }
 tbl.append(body);root.append(tbl);
}
function renderPayouts(){
 const root=$('#praPayoutTable');root.replaceChildren();const list=data?.payouts||[];
 if(!list.length){root.append(textEl('p','No payout requests yet.'));return}
 const tbl=document.createElement('table'),head=document.createElement('thead'),tr=document.createElement('tr');
 ['User','UPI ID','Amount','Requested','Status','Reference / note','Action'].forEach(t=>tr.append(textEl('th',t)));head.append(tr);tbl.append(head);
 const body=document.createElement('tbody');
 for(const x of list){
  const row=document.createElement('tr');
  cell(row,'@'+(x.username||String(x.user_id).slice(0,8)));cell(row,x.upi);cell(row,money(x.amount_paise));
  cell(row,new Date(x.created_at).toLocaleString('en-IN'));cell(row,x.status);
  cell(row,[x.reference,x.review_note].filter(Boolean).join(' · ')||'—');
  const wrap=document.createElement('div');wrap.className='praActions';
  if(x.status==='pending'){
   wrap.append(button('Mark Paid',()=>{
    const ref=prompt('Only AFTER sending UPI money: enter verified UPI transaction reference / UTR (6–120 characters):');
    if(!ref||ref.trim().length<6)return;
    if(!confirm('Confirm that you have ALREADY transferred '+money(x.amount_paise)+' to '+x.upi+' externally, and recorded the correct reference?'))return;
    void change('pv_referral_review_payout',{p_payout_id:x.id,p_decision:'paid',p_reference:ref.trim(),p_note:'Manually verified transfer'},'Payment recorded after external transfer')
   }));
   wrap.append(button('Reject',()=>{const reason=prompt('Why was this payout rejected?');if(reason&&reason.trim().length>=5&&confirm('Reject this payout request?'))void change('pv_referral_review_payout',{p_payout_id:x.id,p_decision:'rejected',p_reference:null,p_note:reason.trim()},'Payout rejected')},'praReject'))
  }else{wrap.append(textEl('span','Final'))}
  cell(row,'').append(wrap);body.append(row)
 }
 tbl.append(body);root.append(tbl)
}
$('#praSave').onclick=()=>{
 if(!authorized||busy)return;
 const budget=Number($('#praBudget').value),enabled=$('#praEnabled').value==='true';
 if(!Number.isSafeInteger(budget)||budget<0||budget>1000000){status.textContent='Budget must be a whole rupee amount from ₹0 to ₹10,00,000.';return}
 if(enabled&&budget===0){status.textContent='Set a positive budget before activating.';return}
 if(!confirm((enabled?'Activate':'Pause')+' cash referral campaign with a total payout budget of ₹'+budget+'?'))return;
 void change('pv_referral_admin_settings',{p_enabled:enabled,p_budget_paise:budget*100},'Campaign settings saved')
};
$('#praRefresh').onclick=()=>void load();
$('#praClose').onclick=()=>modal.hidden=true;
modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)modal.hidden=true});
async function open(){
 if(!me())return;
 modal.hidden=false;status.textContent='Checking owner permissions…';
 await load()
}
function attach(){
 const header=document.querySelector('#pvOwnerRoot .pvoHead');
 if(!header)return false;
 if(header.querySelector('.pvRefAdminOpen186'))return true;
 const b=button('💸 Referral Pro',()=>{void open()},'pvRefAdminOpen186');
 const close=header.querySelector('.pvoClose');
 if(close)header.insertBefore(b,close);else header.append(b);
 return true
}
if(!attach()){const obs=new MutationObserver(()=>{if(attach())obs.disconnect()});obs.observe(document.body,{childList:true,subtree:true})}
window.PAVORA_REFERRAL_ADMIN={open,version:'187'};
})();
