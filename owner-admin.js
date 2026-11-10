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
`;document.head.append(css);
const launcher=E('button','','🛡 Owner Dashboard');launcher.id='pvOwnerLauncher';launcher.type='button';launcher.hidden=true;document.querySelector('#profile > .panel')?.prepend(launcher);
const overlay=E('section');overlay.id='pvOwnerRoot';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','PAVORA Owner Admin Dashboard');
const panel=E('div','pvoPanel'),head=E('div','pvoHead'),heading=E('div'),tabs=E('nav','pvoTabs'),main=E('main','pvoMain'),close=E('button','pvoClose','Close ×');
heading.append(E('h2','','🛡 PAVORA Owner'),E('small','','Secure administration · Access logged'));head.append(heading,close);panel.append(head,tabs,main);overlay.append(panel);document.body.append(overlay);
let active='overview',allowed=false,seq=0,search='',page=0;
const names={overview:'Overview',users:'Users',reports:'Reports',posts:'Posts',reels:'Reels',audit:'Audit Logs'};
const current=()=>kit.getUser()?.id;
async function api(action,more={}){const r=await db.functions.invoke('pavora-owner-admin',{body:{action,...more}});if(r.error)throw new Error(r.data?.error||r.error.message||'Admin request failed');if(r.data?.error)throw new Error(r.data.error);return r.data}
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
   const grid=E('div','pvoStats');[['Users',d.users],['New users · 7d',d.newUsers],['Posts',d.posts],['Reels',d.reels],['Reports',d.reports],['Pending review',d.pending]].forEach(([l,v])=>grid.append(stat(v,l)));main.append(grid);
   line('Counts are live database totals. Private messages and passwords are not shown in this dashboard.');
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
  }else{
   const d=await api('audit');if(ticket!==seq)return;clear();toolbar('Owner action audit');
   line('Latest 100 administrative actions, newest first. Audit entries cannot be changed from the app.');
   if(!d.entries.length)line('No admin actions recorded yet.');
   for(const a of d.entries)card(a.action+' · '+a.target_kind, (a.reason||'')+' · '+a.target_id+' · '+new Date(a.created_at).toLocaleString('en-IN'));
  }
 }catch(e){if(ticket!==seq)return;clear();alertText('Admin dashboard: '+e.message)}
}
function closePanel(){overlay.hidden=true;seq++;document.body.classList.remove('pvOwnerOpen')}
close.onclick=closePanel;overlay.addEventListener('click',e=>{if(e.target===overlay)closePanel()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closePanel()});
launcher.onclick=()=>{if(!allowed)return;overlay.hidden=false;active='overview';tabsRender();render()};
async function verify(){const id=current();if(!id){allowed=false;launcher.hidden=true;closePanel();return}const {data,error}=await db.from('pv_app_admins').select('user_id').eq('user_id',id).maybeSingle();if(id!==current())return;allowed=!error&&!!data;launcher.hidden=!allowed;if(!allowed)closePanel()}
db.auth.onAuthStateChange(()=>setTimeout(verify,100));setTimeout(verify,800);
window.PAVORA_OWNER={open:()=>{if(allowed)launcher.click()}};
})();
