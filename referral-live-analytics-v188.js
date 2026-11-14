/* PAVORA Referral Live Analytics v188 — owner-only, read-only, near-live.
   Reuses pvRefAdmin186; no changes to auth, Reels, Chat or payout processing. */
(()=>{
'use strict';
if(window.PAVORA_REFERRAL_ANALYTICS)return;
const root=document.querySelector('#pvRefAdmin186');
if(!root)return;
const panel=root.querySelector('.praBody');
if(!panel)return;
const style=document.createElement('style');style.id='pvReferralAnalyticsStyle188';
style.textContent=[
'#praLive188{background:linear-gradient(130deg,#281d40,#12162c);border:1px solid #d1b5f473;border-radius:18px;padding:17px;margin:0 0 16px;color:#fff}#praLive188 *{box-sizing:border-box}',
'#praLive188 .praLiveHead{display:flex;justify-content:space-between;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:11px}#praLive188 h3{font-size:16px;font-weight:800;margin:0}#praLive188 .praLiveBtns{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#praLive188 button,#praLive188 select{color:#fff;background:#59417d;border:1px solid #d1b8f681;border-radius:11px;padding:8px 10px;cursor:pointer;font:inherit;font-size:12px}',
'#praLive188 .praLiveSummary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:13px 0}#praLive188 .praLiveMetric{padding:11px;border:1px solid #ffffff2b;border-radius:14px;background:#ffffff11;min-width:0}#praLive188 .praLiveMetric b{display:block;font-size:23px}#praLive188 .praLiveMetric small{font-size:11px;color:#e4d4fa}',
'#praLive188 .praLiveInfo{font-size:11px;color:#d8c7ee;line-height:1.5;margin:9px 0 13px}#praLive188 .praLiveStatus{font-size:11px;color:#e5d7fb}#praLive188 .praLiveStatus[role=status]{min-height:17px}',
'#praLive188 .praLiveLegend{font-size:11px;color:#ead9fc;margin:6px 0}#praLive188 .praLiveLegend em{display:inline-block;width:10px;height:10px;border-radius:3px;margin:0 4px 0 10px;background:#b593ff}#praLive188 .praLiveLegend em.praSecond{background:#5fd6c3}',
'#praLive188 .praLiveScroll{overflow-x:auto;max-width:100%;border:1px solid #ffffff25;background:#0d1030ad;border-radius:13px;padding:14px 12px 8px}#praLive188 .praLiveBars{display:flex;align-items:stretch;gap:6px;height:172px;min-width:100%;width:max-content}',
'#praLive188 .praLiveDay{width:25px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;flex:none;gap:4px}#praLive188 .praLiveDouble{display:flex;align-items:flex-end;justify-content:center;gap:3px;height:132px;width:100%}#praLive188 .praLiveBar{width:9px;min-height:2px;border-radius:4px 4px 2px 2px;background:linear-gradient(#d3b6ff,#9265df)}#praLive188 .praLiveBar.praLiveSignup{background:linear-gradient(#7ce3cb,#39ab9e)}#praLive188 .praLiveDay span{font-size:9px;color:#e4d6f2;white-space:nowrap;height:15px}',
'#praLive188 .praLiveTable{overflow:auto;max-height:260px;margin-top:10px;border-radius:12px;border:1px solid #ffffff29}#praLive188 table{border-collapse:collapse;width:100%;font-size:12px}#praLive188 th,#praLive188 td{padding:9px 10px;border-bottom:1px solid #ffffff1c;text-align:left;white-space:nowrap}#praLive188 th{background:#ffffff1c;position:sticky;top:0;color:#ead9fc}#praLive188 .praLiveRate{font-weight:750;color:#bcebdd}',
'@media(max-width:700px){#praLive188{padding:12px}#praLive188 .praLiveSummary{grid-template-columns:repeat(2,minmax(0,1fr))}#praLive188 .praLiveMetric b{font-size:22px}}'
].join('\n');document.head.append(style);
const section=document.createElement('section');section.id='praLive188';
section.innerHTML='<div class="praLiveHead"><div><h3>📊 Live Referral Analytics</h3><small>Verified campaign funnel · Daily trends</small></div><div class="praLiveBtns"><label for="praLiveRange" style="font-size:11px">Date range</label><select id="praLiveRange"><option value="7">7 days</option><option value="14">14 days</option><option value="30" selected>30 days</option><option value="90">90 days</option></select><button id="praLiveReload" type="button">↻ Refresh</button></div></div>'+
'<div class="praLiveSummary"><div class="praLiveMetric"><b id="praLiveOpens">—</b><small>Link-open sessions</small></div><div class="praLiveMetric"><b id="praLiveSignups">—</b><small>Verified signups</small></div><div class="praLiveMetric"><b id="praLiveLaunches">—</b><small>App-launch signals</small></div><div class="praLiveMetric"><b id="praLiveApproved">—</b><small>Approved referrals</small></div></div>'+
'<p class="praLiveInfo">Link opens count approximate browser sessions, not unique people. Metrics are recorded events within the selected UTC date range; signups, launches and approvals may happen on different days. Signups/open percentage is indicative, not a tracked-user conversion rate.</p>'+
'<div class="praLiveStatus" id="praLiveState" role="status">Open Referral Pro to load analytics.</div>'+
'<div class="praLiveLegend">Daily events <em></em>Link opens <em class="praSecond"></em>Signups (UTC)</div><div class="praLiveScroll"><div class="praLiveBars" id="praLiveBars" aria-label="Daily referral opens and signup chart">No data loaded</div></div>'+
'<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin:16px 0 5px"><h3 style="margin:0">Top inviters</h3><span id="praLiveRatio" style="font-size:11px;color:#bfe7d8">—</span></div>'+
'<div class="praLiveTable" id="praLiveTable">No data loaded</div>';
const before=panel.querySelector('.praSection');
if(before)panel.insertBefore(section,before);else panel.append(section);
const $=sel=>section.querySelector(sel);
const status=$('#praLiveState');
let inFlight=false,lastLoad=0,lastUid=null,nonce=0,interval=null;
const n=v=>Number(v||0).toLocaleString('en-IN');
const text=(tag,s)=>{const el=document.createElement(tag);el.textContent=String(s??'');return el};
function render(data){
 const t=data?.totals||{};
 $('#praLiveOpens').textContent=n(t.link_opens);
 $('#praLiveSignups').textContent=n(t.signups);
 $('#praLiveLaunches').textContent=n(t.app_launches);
 $('#praLiveApproved').textContent=n(t.approved);
 const ratio=Number(t.link_opens)>0?(Number(t.signups)*100/Number(t.link_opens)).toFixed(1)+'%':'N/A';
 $('#praLiveRatio').textContent='Indicative signups / link opens: '+ratio;
 const bars=$('#praLiveBars');bars.replaceChildren();
 const days=Array.isArray(data?.daily)?data.daily:[];
 if(!days.length)bars.textContent='No daily data.';
 const max=Math.max(1,...days.map(x=>Math.max(Number(x.link_opens)||0,Number(x.signups)||0)));
 days.forEach((day,i)=>{
  const item=document.createElement('div');item.className='praLiveDay';
  const pair=document.createElement('div');pair.className='praLiveDouble';
  const op=document.createElement('div');op.className='praLiveBar';
  const su=document.createElement('div');su.className='praLiveBar praLiveSignup';
  const opens=Number(day.link_opens)||0,signups=Number(day.signups)||0;
  op.style.height=(opens?Math.max(3,opens/max*126):2)+'px';su.style.height=(signups?Math.max(3,signups/max*126):2)+'px';
  item.title=day.day+' UTC · Link opens: '+opens+' · Signups: '+signups+' · App launches: '+(day.app_launches||0)+' · Approved: '+(day.approved||0);
  pair.append(op,su);item.append(pair);
  const label=text('span',i===0||i===days.length-1||i%Math.max(1,Math.round(days.length/8))===0?String(day.day).slice(5):'');
  item.append(label);bars.append(item);
 });
 const root=$('#praLiveTable');root.replaceChildren();
 const senders=data?.top_senders||[];
 if(!senders.length){root.textContent='No inviters yet.';return}
 const table=document.createElement('table'),thead=document.createElement('thead'),head=document.createElement('tr');
 ['User','Link opens','Verified IDs','App launches','Approved','Signups / opens*'].forEach(label=>head.append(text('th',label)));
 thead.append(head);table.append(thead);
 const tbody=document.createElement('tbody');
 senders.forEach(user=>{
  const row=document.createElement('tr');
  const cols=['@'+(user.username||String(user.sender_id||'').slice(0,8)),n(user.link_opens),n(user.signups),n(user.app_launches),n(user.approved),user.signup_rate===null?'N/A':String(user.signup_rate)+'%'];
  cols.forEach((value,i)=>{const td=text('td',value);if(i===5)td.className='praLiveRate';row.append(td)});
  tbody.append(row);
 });table.append(tbody);root.append(table);
}
async function load(force=false){
 if(root.hidden||document.hidden||inFlight)return;
 const kit=window.PVKit;
 if(!kit?.db||!kit?.getUser?.())return;
 const uid=kit.getUser().id;
 if(!force&&uid===lastUid&&Date.now()-lastLoad<25000)return;
 inFlight=true;const current=++nonce;
 status.textContent='Refreshing referral analytics…';
 try{
  // Security is enforced by the server's pv_referral_is_admin() check, not by hidden UI.
  const {data,error}=await kit.db.rpc('pv_referral_live_analytics',{p_days:Number($('#praLiveRange').value)});
  if(error)throw error;
  if(root.hidden||uid!==kit.getUser?.()?.id||current!==nonce)return;
  render(data);lastLoad=Date.now();lastUid=uid;
  status.textContent='Updated '+new Date().toLocaleTimeString('en-IN')+' · Dates in UTC · Auto-refresh approximately every 30 seconds while open.';
 }catch(e){status.textContent='Analytics unavailable: '+(e.message||e)}
 finally{inFlight=false}
}
$('#praLiveRange').addEventListener('change',()=>{lastLoad=0;void load(true)});
$('#praLiveReload').onclick=()=>{lastLoad=0;void load(true)};
function visibility(){
 if(!root.hidden){
  if(!interval)interval=setInterval(()=>{if(!document.hidden)void load()},30000);
  void load();
 }else{
  if(interval){clearInterval(interval);interval=null}
  nonce++;lastUid=null;lastLoad=0;
  $('#praLiveBars').replaceChildren();$('#praLiveTable').replaceChildren();
  ['#praLiveOpens','#praLiveSignups','#praLiveLaunches','#praLiveApproved'].forEach(s=>$(s).textContent='—');
  status.textContent='Open Referral Pro to load analytics.';
 }
}
const observer=new MutationObserver(visibility);
observer.observe(root,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!root.hidden)void load()});
visibility();
window.PAVORA_REFERRAL_ANALYTICS={refresh:()=>load(true),version:'188'};
})();