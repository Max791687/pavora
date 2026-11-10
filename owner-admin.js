/* PAVORA Owner Dashboard v47: UI only. Server Edge Function verifies admin access for every operation. */
(()=>{
'use strict';
const kit=window.PVKit;if(!kit)return;
const db=kit.db;
const E=(tag,cls='',txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x};
const css=E('style');css.textContent=`
#pvOwnerRoot[hidden],#pvOwnerLauncher[hidden]{display:none!important}
#pvOwnerRoot{position:fixed;inset:0;z-index:500;background:#080910e8;display:grid;place-items:center;padding:16px;color:#f7f5ff}
.pvoPanel{width:min(1150px,100%);height:min(820px,96dvh);display:flex;flex-direction:column;overflow:hidden;border:1px solid #52436e;border-radius:22px;background:#161522;box-shadow:0 24px 90px #000c;font:14px/1.5 Inter,system-ui,sans-serif}
.pvoHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px;border-bottom:1px solid #332e40;background:linear-gradient(110deg,#29203b,#1b1927)}
.pvoHead h2{margin:0;font-size:20px;color:white}.pvoHead small{color:#bcaccd}
.pvoClose{border:0;border-radius:10px;color:#fff;background:#40354f;padding:8px 14px;font-weight:800;cursor:pointer}
.pvoTabs{display:flex;gap:6px;overflow-x:auto;flex:none;padding:11px 18px;border-bottom:1px solid #353042}
.pvoTab{border:0;border-radius:9px;background:transparent;color:#c9bdd6;padding:10px 13px;font-weight:700;white-space:nowrap;cursor:pointer}
.pvoTab.active{background:#7147b5;color:#fff}
.pvoMain{flex:1;overflow:auto;padding:20px}
.pvoStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.pvoStat,.pvoCard{background:#242033;border:1px solid #463a5b;border-radius:14px;padding:16px;overflow-wrap:anywhere}
.pvoStat b{display:block;font-size:28px;color:white}.pvoStat span,.pvoMuted{font-size:12px;color:#b5acc3}
.pvoCard{margin:10px 0;display:flex;gap:14px;justify-content:space-between;align-items:center}
.pvoCard strong{color:white}.pvoCard small{display:block;color:#b5abc3;margin-top:4px}
.pvoActions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.pvoBtn,#pvOwnerLauncher{background:#724bbb;border:1px solid #8d6ccc;border-radius:10px;color:#fff;padding:9px 13px;cursor:pointer;font-weight:750;font-size:12px}
.pvoBtn.secondary{background:#332c42;border-color:#5b4d6f}
.pvoBtn.danger{background:#9e3855;border-color:#c55e7d}
.pvoBtn:disabled{opacity:.55;cursor:progress}
.pvoSearch{background:#211d2a;color:white;padding:12px 14px;border:1px solid #635279;border-radius:11px;width:min(440px,100%);font-size:14px}
.pvoToolbar{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:16px}
.pvoAlert{padding:12px;border-radius:11px;border:1px solid #be657a;color:#ffdcdf;background:#45232e;margin-bottom:12px}
.pvoOk{border-color:#528f6c;background:#20392b;color:#d6ffe4}
.pvoFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px}
#pvOwnerLauncher{margin:8px 0;background:#3a2b55}
@media(max-width:700px){#pvOwnerRoot{padding:0}.pvoPanel{height:100dvh;width:100%;border-radius:0}.pvoMain{padding:12px}.pvoStats{grid-template-columns:repeat(2,minmax(0,1fr))}.pvoCard{align-items:flex-start;flex-direction:column}.pvoActions{justify-content:flex-start}.pvoHead{padding:13px}.pvoTab{font-size:12px;padding:8px}}

/* v52 premium owner console: compact KPI cards, balanced sections, mobile-safe layouts */
.pvoPanel{width:min(1240px,calc(100vw - 28px));height:min(850px,94dvh);border:1px solid #67518b;border-radius:22px;background:#12101c;box-shadow:0 32px 110px #000d}
.pvoHead{padding:23px 26px;background:radial-gradient(ellipse at 80% 0%,#6c33a545,transparent 58%),linear-gradient(108deg,#29203c,#161322)}
.pvoHead h2{font-size:23px;letter-spacing:-.5px}.pvoHead small{font-size:12px}
.pvoTabs{padding:12px 20px;gap:8px;background:#171421;scrollbar-width:thin}
.pvoTab{padding:10px 15px;border-radius:10px}.pvoTab.active{background:linear-gradient(130deg,#8652e2,#6033ad)}
.pvoMain{padding:24px;overflow-x:hidden;background:radial-gradient(ellipse at 45% 0%,#3b215c22,transparent 70%),#120f1a}
.pvoToolbar h3{font-size:19px;font-weight:800;letter-spacing:-.3px;margin:0}
.pvoToolbar{margin:0 0 18px}
.pvoStats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:0 0 23px}
.pvoStat{min-width:0;display:flex;flex-direction:column;gap:6px;padding:17px;background:linear-gradient(165deg,#29213a,#1b1728);border:1px solid #514166;box-shadow:0 8px 22px #0003;border-radius:15px}
.pvoStat span{font-size:12px;color:#bfb0d2;font-weight:650}
.pvoStat b{font-size:30px;line-height:1.2;letter-spacing:-1px;margin:4px 0;color:#fff}
.pvoStat .pvoKpiIcon{font-size:19px;color:#ba8bff}
.pvoStat small{font-size:10px;color:#a799ba}
.pvoPanels{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}
.pvoSection{background:linear-gradient(170deg,#201b2e,#171321);border:1px solid #433553;border-radius:16px;padding:19px;min-width:0}
.pvoSection h3{font-size:16px;color:#f7f2ff;margin:0 0 7px}
.pvoSection p{margin:3px 0 13px;color:#b6a8c9;font-size:12px}
.pvoSection .pvoSectionEmpty{background:#171320;border:1px dashed #534463;border-radius:10px;padding:20px 13px;font-size:13px;color:#ae9fc3}
.pvoSectionWide{grid-column:1 / -1}
.pvoEvent{padding:12px 0;border-bottom:1px solid #3b3149;color:#f3eaff;font-size:12px}
.pvoEvent:last-child{border-bottom:0}
.pvoEvent small{color:#a99bbb;display:block;margin-top:4px}
.pvoCard{border-color:#403550;background:#221c30}
.pvoAlert{width:100%;box-sizing:border-box;max-width:700px;padding:18px;border-radius:14px;margin:0 auto}
.pvoEmptyState{min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px dashed #55446a;border-radius:16px;background:#21192a55;padding:26px;text-align:center;gap:10px}
.pvoEmptyState h3{font-size:18px;margin:0;color:#fff}
.pvoEmptyState p{font-size:13px;color:#c4b7d2;max-width:540px;margin:0 0 9px}
.pvoEmptyState .pvoBtn{min-width:110px}
@media(max-width:930px){.pvoStats{grid-template-columns:repeat(2,minmax(0,1fr))}.pvoPanels{grid-template-columns:1fr}.pvoSectionWide{grid-column:auto}}
@media(max-width:700px){#pvOwnerRoot{padding:0}.pvoPanel{width:100%;height:100dvh;border:0;border-radius:0}.pvoMain{padding:14px 12px 96px}.pvoStats{gap:9px}.pvoStat{padding:13px}.pvoStat b{font-size:26px}.pvoHead{padding:15px}.pvoTabs{padding:9px 10px}}
`;document.head.append(css);
const launcher=E('button','','🛡 Owner Dashboard');launcher.id='pvOwnerLauncher';launcher.type='button';launcher.hidden=true;document.querySelector('#profile > .panel')?.prepend(launcher);
const overlay=E('section');overlay.id='pvOwnerRoot';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','PAVORA Owner Admin Dashboard');
const panel=E('div','pvoPanel'),head=E('div','pvoHead'),heading=E('div'),tabs=E('nav','pvoTabs'),main=E('main','pvoMain'),close=E('button','pvoClose','Close ×');
heading.append(E('h2','','🛡 PAVORA Owner'),E('small','','Secure administration · Access logged'));head.append(heading,close);panel.append(head,tabs,main);overlay.append(panel);document.body.append(overlay);
let active='overview',allowed=false,seq=0,search='',page=0;
const names={overview:'Overview',users:'Users',reports:'Reports',posts:'Posts',reels:'Reels',audit:'Audit Logs',recovery:'Recovery Support'};
const current=()=>kit.getUser()?.id;
async function api(action,more={}){
 const r=await db.functions.invoke('pavora-owner-admin',{body:{action,...more}});
 if(r.error){
  let detail=r.data?.error;
  const response=r.error.context;
  if(response?.json){try{const body=await response.clone().json();detail=body.error||body.message||detail}catch{}}
  const status=response?.status;
  if(status===401)detail='Session expired. Log out and log back in.';
  if(status===403)detail='Owner permission denied. Only verified owners can access this dashboard.';
  if(status===503)detail='Admin backend is temporarily unavailable.';
  throw new Error(detail||(status?'Server returned HTTP '+status:r.error.message)||'Admin request failed');
 }
 if(r.data?.error)throw new Error(r.data.error);
 return r.data;
}
function clear(){main.replaceChildren()}
function line(t){main.append(E('p','pvoMuted',t))}
function alertText(msg,ok=false){const a=E('div','pvoAlert'+(ok?' pvoOk':''),msg);main.prepend(a)}
function makeButton(t,action,style=''){const b=E('button','pvoBtn '+style,t);b.type='button';b.onclick=async()=>{b.disabled=true;try{await action()}catch(e){alertText(e.message)}finally{b.disabled=false}};return b}
function card(title,subtitle='',actions=[]){const box=E('div','pvoCard'),text=E('div');text.append(E('strong','',title),E('small','',subtitle));box.append(text);if(actions.length){const opts=E('div','pvoActions');actions.forEach(a=>opts.append(a));box.append(opts)}main.append(box);return box}
function stat(n,label){const b=E('div','pvoStat');b.append(E('b','',Number(n||0).toLocaleString('en-IN')),E('span','',label));return b}
function tabsRender(){tabs.replaceChildren();for(const [key,value] of Object.entries(names)){const button=E('button','pvoTab'+(active===key?' active':''),value);button.onclick=()=>{active=key;page=0;tabsRender();render()};tabs.append(button)}}
function requireReason(verb){const reason=prompt('Reason for '+verb+' (minimum 5 characters). This will be saved in the audit log:');if(reason===null)return null;if(reason.trim().length<5){alert('Please enter at least 5 characters.');return null}return reason.trim().slice(0,250)}
async function actionConfirm(label,action,params,refresh=true){const reason=requireReason(label);if(!reason)return;if(!confirm('Confirm '+label+'? This action will be recorded in the admin audit log.'))return;await api(action,{...params,reason});if(refresh)await render()}
function toolbar(text){const bar=E('div','pvoToolbar');bar.append(E('h3','',text));main.append(bar);return bar}
async function render(){
 const ticket=++seq;clear();if(!allowed||!current()){closePanel();return}
 main.append(E('p','pvoMuted','Loading secure admin data…'));
 try{
  if(active==='overview'){
   const d=await api('summary');if(ticket!==seq)return;clear();
   toolbar('Platform overview');
   const metrics=[['♙','Total Users',d.users],['✦','New Signups · 7d',d.newUsers],['◉','Active · 15 min',d.activeNow],['▤','Posts',d.posts],['▣','Reels',d.reels],['⚑','Pending Reports',d.pending],['✉','Recovery Requests',d.recoveries],['◎','Total Reports',d.reports]];
   const grid=E('div','pvoStats');
   for(const [icon,label,value] of metrics){
    const statbox=E('div','pvoStat');
    statbox.append(E('div','pvoKpiIcon',icon),E('span','',label),E('b','',Number(value||0).toLocaleString('en-IN')));
    statbox.append(E('small','', 'Live Supabase data'));
    grid.append(statbox);
   }
   main.append(grid);
   const sections=E('div','pvoPanels'),left=E('section','pvoSection'),right=E('section','pvoSection'),bottom=E('section','pvoSection pvoSectionWide');
   left.append(E('h3','','⚑ Recent reports'),E('p','','Latest reports from the PAVORA community'));
   right.append(E('h3','','◷ Admin activity'),E('p','','Most recent moderation and security actions'));
   bottom.append(E('h3','','⚡ Quick access'),E('p','','Manage accounts, moderation and recovery from one place'));
   const makeLink=(text,to,parent)=>{
     const btn=E('button','pvoBtn secondary',text);btn.type='button';btn.onclick=()=>{active=to;tabsRender();render()};parent.append(btn)
   };
   const results=await Promise.allSettled([api('reports'),api('audit')]);
   if(ticket!==seq)return;
   if(results[0].status==='fulfilled'&&results[0].value.reports?.length){
    for(const r of results[0].value.reports.slice(0,5)){
     const line=E('div','pvoEvent',r.target_kind+' · '+String(r.reason||'Report'));line.append(E('small','',(r.status||'pending')+' · '+new Date(r.created_at).toLocaleString('en-IN')));left.append(line)
    }
   }else left.append(E('div','pvoSectionEmpty',results[0].status==='rejected'?'Reports are temporarily unavailable.':'No reports filed yet.'));
   makeLink('View reports', 'reports',left);
   if(results[1].status==='fulfilled'&&results[1].value.entries?.length){
    for(const a of results[1].value.entries.slice(0,5)){
     const line=E('div','pvoEvent',a.action);line.append(E('small','',new Date(a.created_at).toLocaleString('en-IN')+' · '+a.target_kind));right.append(line)
    }
   }else right.append(E('div','pvoSectionEmpty',results[1].status==='rejected'?'Activity logs are temporarily unavailable.':'No admin actions recorded yet.'));
   makeLink('View audit logs','audit',right);
   for(const [label,to] of [['Manage users','users'],['Review Reels','reels'],['Moderate posts','posts'],['Recovery support','recovery']])makeLink(label,to,bottom);
   sections.append(left,right,bottom);main.append(sections);
   line('All figures and actions come from live Supabase data. No sample analytics or fake reports are displayed.');
  }else if(active==='users'){
   const d=await api('users',{search,page});if(ticket!==seq)return;clear();
   const bar=toolbar('User management'),input=E('input','pvoSearch');input.placeholder='Search username or display name';input.value=search;input.setAttribute('aria-label','Search users');const go=makeButton('Search',async()=>{search=input.value.trim();page=0;await render()});input.addEventListener('keydown',e=>{if(e.key==='Enter')go.click()});bar.append(input,go);
   line('Showing '+d.users.length+' of '+d.total+' matching users. Suspensions block new sign-ins; existing sessions may remain until token expiry.');
   for(const u of d.users){const subtitle=[u.email||'No email',u.confirmed?'Verified':'Unverified',u.suspended?'Suspended':'Active',u.is_official?'Official account':'',u.created_at?new Date(u.created_at).toLocaleDateString('en-IN'):''].filter(Boolean).join(' · ');
    const acts=[];if(!u.is_official){acts.push(makeButton(u.suspended?'Unban':'Suspend',()=>actionConfirm(u.suspended?'unban user':'suspend user',u.suspended?'user.unban':'user.suspend',{id:u.id}),u.suspended?'secondary':'danger'))}
    card('@'+u.username+(u.display_name?' · '+u.display_name:''),subtitle,acts);
   }
   const foot=E('div','pvoFoot'),label=E('span','pvoMuted','Page '+(page+1)),prev=makeButton('Previous',async()=>{page--;await render()},'secondary'),next=makeButton('Next',async()=>{page++;await render()},'secondary');
   prev.disabled=page===0;next.disabled=(page+1)*20>=d.total;foot.append(prev,label,next);main.append(foot);
  }else if(active==='reports'){
   const d=await api('reports');if(ticket!==seq)return;clear();toolbar('Reported content and accounts');
   if(!d.reports.length)line('No reports to review.');
   for(const r of d.reports){const acts=['reviewing','resolved','dismissed'].filter(s=>s!==r.status).map(s=>makeButton(s,()=>actionConfirm('mark report '+s,'report.set',{id:r.id,status:s}),'secondary'));card(r.target_kind+' · '+r.reason,(r.details||'No details').slice(0,170)+' · Status: '+r.status+' · Target: '+r.target_id,acts)}
  }else if(active==='posts'||active==='reels'){
   const kind=active==='posts'?'post':'reel',d=await api('content',{kind});if(ticket!==seq)return;clear();toolbar(kind==='post'?'Post moderation':'Reel moderation');
   line('Hide removes content from regular feeds but preserves database rows and media. Restore reverses the action.');
   for(const p of d.items){const hidden=!!p.moderation?.hidden;const action=hidden?'content.restore':'content.hide';card((p.caption||'Untitled '+kind).slice(0,100),(hidden?'Hidden · ':'Visible · ')+new Date(p.created_at).toLocaleString('en-IN')+' · Author '+p.author_id,[makeButton(hidden?'Restore':'Hide',()=>actionConfirm(hidden?'restore '+kind:'hide '+kind,action,{kind,id:p.id}),hidden?'secondary':'danger')])}
  }else if(active==='recovery'){
   const d=await api('recovery.list');if(ticket!==seq)return;clear();toolbar('Account recovery support');
   line('Review access requests without ever asking for passwords, OTPs or ID documents. Verify account ownership using a trusted channel before assisting with a reset.');
   if(!d.entries.length)line('No recovery requests yet.');
   for(const r of d.entries){
    const acts=['reviewing','closed'].filter(s=>s!==r.status).map(s=>makeButton(s,()=>actionConfirm('mark recovery '+s,'recovery.review',{id:r.id,status:s}),'secondary'));
    if(r.status!=='closed')acts.unshift(makeButton('✉ Send reset email',()=>actionConfirm('send a password reset email','recovery.send_reset',{id:r.id}),'secondary'));
    card(r.email+' · '+r.status,(r.issue||'Account access request')+' · '+new Date(r.created_at).toLocaleString('en-IN'),acts);
   }
  }else{
   const d=await api('audit');if(ticket!==seq)return;clear();toolbar('Owner action audit');
   line('Latest 100 administrative actions, newest first. Audit entries cannot be changed from the app.');
   if(!d.entries.length)line('No admin actions recorded yet.');
   for(const a of d.entries)card(a.action+' · '+a.target_kind, (a.reason||'')+' · '+a.target_id+' · '+new Date(a.created_at).toLocaleString('en-IN'));
  }
 }catch(e){if(ticket!==seq)return;clear();
  const area=E('div','pvoEmptyState');area.append(E('div','','⚠️'),E('h3','','Unable to load dashboard data'),E('p','',e.message||'Please try again.'));
  const retry=E('button','pvoBtn','↻ Retry');retry.type='button';retry.onclick=()=>render();
  area.append(retry);main.append(area);
 }
}
function closePanel(){overlay.hidden=true;seq++;document.body.classList.remove('pvOwnerOpen')}
close.onclick=closePanel;overlay.addEventListener('click',e=>{if(e.target===overlay)closePanel()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closePanel()});
launcher.onclick=()=>{if(!allowed)return;overlay.hidden=false;active='overview';tabsRender();render()};
async function verify(){const id=current();if(!id){allowed=false;launcher.hidden=true;closePanel();return}const {data,error}=await db.from('pv_app_admins').select('user_id').eq('user_id',id).maybeSingle();if(id!==current())return;allowed=!error&&!!data;launcher.hidden=!allowed;if(!allowed)closePanel()}
db.auth.onAuthStateChange(()=>setTimeout(verify,100));setTimeout(verify,800);
// Cloud session restoration can complete after INITIAL_SESSION; recheck hidden owner entry safely.
setInterval(()=>{if(current()&&!allowed)verify();else if(!current()&&allowed)verify()},10000);
window.PAVORA_OWNER={open:()=>{if(allowed)launcher.click()}};
})();
