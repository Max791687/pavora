/* PAVORA Owner Dashboard v53: UI only. Server Edge Function verifies admin access for every operation. */
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

/* v53: consistent action-bar sizing and visible, spacious owner console */
#pvOwnerRoot .pvoPanel{width:min(1200px,calc(100vw - 40px));max-width:1200px;min-height:min(620px,90dvh)}
#pvOwnerRoot .pvoMain{min-height:0;overflow-y:auto}
#pvOwnerRoot .pvoStat{transition:transform .15s ease,border-color .15s ease}
#pvOwnerRoot .pvoStat:hover{transform:translateY(-2px);border-color:#9266d6}
#pvOwnerRoot .pvoSection{min-height:175px}
#pvOwnerRoot .pvoSectionWide{min-height:88px}
#pvOwnerRoot .pvoBtn{margin:4px 8px 4px 0}
#pvOwnerRoot .pvoEmptyState{width:auto;max-width:none;margin:16px auto;min-height:250px}
#pvOwnerRoot .pvoEmptyState .pvoBtn{margin-top:8px}
#pvOwnerLauncher{display:inline-flex;align-items:center;justify-content:center;max-width:100%;min-height:39px;background:#302440;border-color:#75589f;border-radius:12px;white-space:nowrap}
#pvOwnerLauncher:hover{background:#4c3470}
@media(max-width:700px){#pvOwnerRoot .pvoPanel{width:100%;max-width:none;min-height:100dvh}#pvOwnerRoot .pvoSection{min-height:0}}

/* v54: isolate owner UI from the PAVORA application's global main grid */
#pvOwnerRoot .pvoMain{display:block!important;grid-template-columns:none!important;max-width:none!important;width:100%!important;margin:0!important;gap:0!important;justify-content:initial!important}
#pvOwnerRoot .pvoMain > *{max-width:100%;min-width:0}
#pvOwnerRoot .pvoToolbar{display:flex!important;flex-direction:row!important;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:0 0 18px;padding:0}
#pvOwnerRoot .pvoToolbar h3{flex:0 0 auto;margin:0;font-size:19px}
#pvOwnerRoot .pvoToolbar .pvoSearch{flex:1 1 280px;min-width:180px;max-width:400px;width:auto}
#pvOwnerRoot .pvoToolbar .pvoBtn{flex:0 0 auto;min-width:88px;margin:0}
#pvOwnerRoot .pvoCard{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;gap:20px;width:100%;margin:0 0 10px;padding:14px 18px;min-height:76px}
#pvOwnerRoot .pvoCard > div:first-child{flex:1 1 auto;min-width:0;max-width:calc(100% - 115px)}
#pvOwnerRoot .pvoCard strong{font-weight:750;font-size:14px;line-height:1.45;display:block;overflow-wrap:anywhere}
#pvOwnerRoot .pvoCard small{display:block;line-height:1.5;overflow-wrap:anywhere}
#pvOwnerRoot .pvoActions{display:flex!important;flex-direction:row!important;flex:0 0 auto;align-items:center;justify-content:flex-end;max-width:45%;gap:8px}
#pvOwnerRoot .pvoActions .pvoBtn{display:inline-flex!important;align-items:center;justify-content:center;writing-mode:horizontal-tb!important;white-space:nowrap!important;overflow-wrap:normal!important;word-break:normal!important;min-width:85px;min-height:36px;padding:9px 15px;margin:0!important}
#pvOwnerRoot .pvoUserList{display:flex;flex-direction:column;gap:10px;margin:14px 0 18px}
#pvOwnerRoot .pvoUserList .pvoCard{margin:0}
#pvOwnerRoot .pvoUserHint{width:100%;margin:0 0 13px;color:#ac9ebf;font-size:12px}
#pvOwnerRoot .pvoUserMeta{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 0}
#pvOwnerRoot .pvoUserMeta span{font-size:11px;color:#bdb0cf;padding:3px 8px;border:1px solid #554767;background:#292239;border-radius:30px}
#pvOwnerRoot .pvoUserMeta .isSuspended{color:#ffd5e0;border-color:#97516b;background:#432335}
@media(max-width:700px){
#pvOwnerRoot .pvoToolbar{align-items:stretch;flex-wrap:wrap}
#pvOwnerRoot .pvoToolbar h3{flex-basis:100%}
#pvOwnerRoot .pvoToolbar .pvoSearch{flex:1 1 160px;min-width:0}
#pvOwnerRoot .pvoCard{align-items:flex-start!important;flex-wrap:wrap;gap:10px}
#pvOwnerRoot .pvoCard > div:first-child{max-width:100%;flex-basis:100%}
#pvOwnerRoot .pvoActions{width:100%;max-width:none;justify-content:flex-start}
}

/* v55 admin presence and media viewer */
/* prevent generic user-card first-child sizing from stretching media thumbnails */
#pvOwnerRoot .pvoMediaRow > .pvoMediaThumb:first-child{flex:0 0 76px!important;max-width:76px!important;min-width:76px!important}
#pvOwnerRoot .pvoMediaRow > .pvoMediaDetails{min-width:0;flex:1 1 auto}
#pvOwnerRoot .pvoMediaRow > .pvoActions{flex:0 0 auto;min-width:0}
@media(max-width:700px){#pvOwnerRoot .pvoMediaRow > .pvoMediaThumb:first-child{flex-basis:62px!important;max-width:62px!important;min-width:62px!important}}

#pvOwnerRoot .pvoUserMeta .pvoOnline{color:#64e4a1;border-color:#338a68;background:#173c2c}
#pvOwnerRoot .pvoOnline::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#50e49a;margin-right:6px;box-shadow:0 0 8px #50e49a88}
#pvOwnerRoot .pvoMediaRow{display:flex!important;align-items:center;gap:14px}
#pvOwnerRoot .pvoMediaThumb{flex:none;width:76px;height:76px;display:grid;place-items:center;overflow:hidden;border:1px solid #534264;border-radius:12px;background:#2d2240;color:#cdb1f2;font-size:22px}
#pvOwnerRoot .pvoMediaThumb img,#pvOwnerRoot .pvoMediaThumb video{height:100%;width:100%;object-fit:cover}
#pvOwnerRoot .pvoMediaCaption{font-size:13px;font-weight:700;color:#eee8fb;max-width:640px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
#pvOwnerRoot .pvoMediaUploader{font-size:12px;color:#c0a4f1;font-weight:750;margin-top:5px}
#pvOwnerRoot .pvoMediaInfo{font-size:11px;color:#ada2bc;margin-top:4px}
#pvOwnerRoot .pvoMediaRow .pvoActions{max-width:none;min-width:185px}
#pvOwnerViewer[hidden]{display:none!important}
#pvOwnerViewer{position:fixed;inset:0;z-index:510;background:rgba(6,4,13,.93);display:grid;place-items:center;padding:16px}
#pvOwnerViewer .pvoViewerBox{width:min(740px,96vw);max-height:94dvh;overflow:auto;background:#191424;border:1px solid #644a83;border-radius:20px;padding:18px;box-shadow:0 30px 90px #000b}
#pvOwnerViewer .pvoViewerHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:15px;color:#fff}
#pvOwnerViewer .pvoViewerHead strong{font-size:16px}
#pvOwnerViewer .pvoViewerHead button{background:#332741;border:1px solid #625078;color:#fff;border-radius:9px;padding:8px 12px;cursor:pointer}
#pvOwnerViewer .pvoViewerMedia{display:grid;place-items:center;background:#07050c;border-radius:12px;overflow:hidden;min-height:180px}
#pvOwnerViewer video,#pvOwnerViewer img{max-width:100%;max-height:min(65dvh,610px);width:auto;object-fit:contain}
#pvOwnerViewer .pvoViewerInfo{font-size:12px;color:#cbbfd9;overflow-wrap:anywhere;margin:12px 2px 0}
@media(max-width:700px){#pvOwnerRoot .pvoMediaRow{flex-wrap:wrap}#pvOwnerRoot .pvoMediaRow>.pvoActions{width:100%;min-width:0}#pvOwnerRoot .pvoMediaThumb{width:62px;height:62px}}

/* v56 owner presence filters and readable last-seen timestamps */
#pvOwnerRoot .pvoUserFilters{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 13px}
#pvOwnerRoot .pvoFilter{border:1px solid #574367;border-radius:10px;padding:9px 17px;min-width:82px;background:#261e32;color:#c8bad7;font-weight:750;font-size:12px;cursor:pointer;white-space:nowrap}
#pvOwnerRoot .pvoFilter.active{border-color:#a07be4;background:linear-gradient(135deg,#7943cd,#6030a7);color:#fff;box-shadow:0 3px 16px #7145c44a}
#pvOwnerRoot .pvoFilter .pvoFilterDot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px;background:#aaa}
#pvOwnerRoot .pvoFilter .pvoFilterDot.online{background:#4ee7a3}
#pvOwnerRoot .pvoFilter .pvoFilterDot.offline{background:#a49bb6}
#pvOwnerRoot .pvoLastSeen{margin-top:7px;color:#b9aecd;font-size:12px}
#pvOwnerRoot .pvoLastSeen.online{color:#62e3a3}
#pvOwnerRoot .pvoUserHint{line-height:1.6;margin-bottom:11px}

/* v57 active chat metadata only, no message content */
#pvOwnerRoot .pvoActiveChat{border-left:3px solid #a677ea;background:linear-gradient(110deg,#261e35,#1b1727)}
#pvOwnerRoot .pvoActiveChat strong{font-size:15px}
#pvOwnerRoot .pvoActiveChat small{font-size:12px;color:#6fe1ac}
#pvOwnerRoot .pvoSectionEmpty{border:1px dashed #544363;background:#241a30;color:#cbbbd9;border-radius:12px;padding:25px;margin:15px 0;font-size:13px}
`;document.head.append(css);
const launcher=E('button','','🛡 Owner Dashboard');launcher.id='pvOwnerLauncher';launcher.type='button';launcher.hidden=true;document.querySelector('#profile > .panel')?.prepend(launcher);
const overlay=E('section');overlay.id='pvOwnerRoot';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','PAVORA Owner Admin Dashboard');
const panel=E('div','pvoPanel'),head=E('div','pvoHead'),heading=E('div'),tabs=E('nav','pvoTabs'),main=E('div','pvoMain'),close=E('button','pvoClose','Close ×');
heading.append(E('h2','','🛡 PAVORA Owner'),E('small','','LIVE ADMIN CONSOLE · PAVORA v77 · Access logged'));head.append(heading,close);panel.append(head,tabs,main);overlay.append(panel);document.body.append(overlay);
let active='overview',allowed=false,seq=0,search='',page=0,statusFilter='all';
let pvOwnerRestoredFor=null,pvOwnerSavedScroll=0;
const pvOwnerStateKey=()=>current()?'pavora-owner-view:'+current():null;
function pvSaveOwnerView(){
 const key=pvOwnerStateKey();if(!key)return;
 try{sessionStorage.setItem(key,JSON.stringify({open:!overlay.hidden,active,search,page,statusFilter,scroll:main.scrollTop}))}catch(e){}
}
function pvRestoreOwnerView(){
 const key=pvOwnerStateKey();if(!key||pvOwnerRestoredFor===current())return;
 pvOwnerRestoredFor=current();
 let saved;try{saved=JSON.parse(sessionStorage.getItem(key)||'null')}catch(e){}
 if(!saved||!saved.open)return;
 active=Object.hasOwn(names,saved.active)?saved.active:'overview';
 search=typeof saved.search==='string'?saved.search.slice(0,48):'';
 page=Number.isInteger(saved.page)?Math.max(0,Math.min(50,saved.page)):0;
 statusFilter=['all','online','offline'].includes(saved.statusFilter)?saved.statusFilter:'all';
 pvOwnerSavedScroll=Number(saved.scroll)||0;
 overlay.hidden=false;tabsRender();render();
}

const names={overview:'Overview',users:'Users',chats:'Active Chats',testchat:'Test Chat Viewer',reports:'Reports',posts:'Posts',reels:'Reels',audit:'Audit Logs',recovery:'Recovery Support'};
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
function tabsRender(){tabs.replaceChildren();for(const [key,value] of Object.entries(names)){const button=E('button','pvoTab'+(active===key?' active':''),value);button.onclick=()=>{active=key;page=0;tabsRender();pvSaveOwnerView();render()};tabs.append(button)}}
function requireReason(verb){const reason=prompt('Reason for '+verb+' (minimum 5 characters). This will be saved in the audit log:');if(reason===null)return null;if(reason.trim().length<5){alert('Please enter at least 5 characters.');return null}return reason.trim().slice(0,250)}
async function actionConfirm(label,action,params,refresh=true){const reason=requireReason(label);if(!reason)return;if(!confirm('Confirm '+label+'? This action will be recorded in the admin audit log.'))return;await api(action,{...params,reason});if(refresh)await render()}
function toolbar(text){const bar=E('div','pvoToolbar');bar.append(E('h3','',text));main.append(bar);return bar}
// v59: Keep the Active Chats DOM mounted while refreshing; never flash a loading screen.
let pvChatsLayout=null,pvChatsSignature='',pvChatsRequestBusy=false;
function pvName(p){return p?.username?'@'+p.username:p?.display_name||'User'}
function buildChatsLayout(){
 const bar=toolbar('Live Chats & Message Activity');
 bar.append(makeButton('↻ Refresh',async()=>refreshChatsLive(true),'secondary'));
 line('Automatically updates while this tab stays open. Shows who has a chat open and who messaged whom, even if the receiver is offline. Messages and attachments remain private.');
 const open=E('section','pvoSection'),openTitle=E('h3','','Open chats'),openList=E('div');
 open.append(openTitle,openList);main.append(open);
 const messages=E('section','pvoSection'),messagesTitle=E('h3','','Recent sent messages'),messageList=E('div');
 messages.style.marginTop='14px';messages.append(messagesTitle,messageList);main.append(messages);
 const status=E('small','pvoMuted','Live updates active');status.style.display='block';status.style.marginTop='10px';main.append(status);
 pvChatsLayout={openTitle,openList,messagesTitle,messageList,status};pvChatsSignature='';
}
function updateChatsData(d){
 if(!pvChatsLayout||active!=='chats'||overlay.hidden)return;
 const chats=d.openChats||[],messages=d.messages||[];
 const signature=JSON.stringify([chats,messages]);
 if(signature===pvChatsSignature)return;
 pvChatsSignature=signature;
 const {openTitle,openList,messagesTitle,messageList,status}=pvChatsLayout;
 openTitle.textContent='Open chats · '+chats.length;
 messagesTitle.textContent='Recent sent messages · '+messages.length;
 const fmtTime=date=>{const v=new Date(date);return Number.isNaN(v.getTime())?'Recently':v.toLocaleString('en-IN')};
 const makeRow=(title,detail,cls='pvoCard')=>{
  const box=E('div',cls),info=E('div');
  info.append(E('strong','',title),E('small','',detail));box.append(info);return box;
 };
 const openFragment=document.createDocumentFragment();
 if(!chats.length)openFragment.append(E('p','pvoMuted','No open chat windows detected right now.'));
 for(const row of chats)openFragment.append(makeRow(pvName(row.viewer)+' → '+pvName(row.peer),(row.mutual?'● Both viewing':'● One person viewing')+' · '+fmtTime(row.updated_at),'pvoCard pvoActiveChat'));
 openList.replaceChildren(openFragment);
 const msgFragment=document.createDocumentFragment();
 if(!messages.length)msgFragment.append(E('p','pvoMuted','No sent messages yet.'));
 for(const row of messages)msgFragment.append(makeRow(pvName(row.sender)+' → '+pvName(row.recipient),'✉ '+fmtTime(row.created_at)+' · '+(row.seen?'Seen':'Not seen')));
 messageList.replaceChildren(msgFragment);
 status.textContent='Live updates active · last synced '+new Date().toLocaleTimeString('en-IN');
}
async function refreshChatsLive(force=false){
 if(!allowed||overlay.hidden||active!=='chats'||document.hidden||pvChatsRequestBusy||!pvChatsLayout)return;
 pvChatsRequestBusy=true;
 try{
  const d=await api('chat.activity');
  if(active==='chats'&&!overlay.hidden)updateChatsData(d);
 }catch(e){
  if(pvChatsLayout&&active==='chats')pvChatsLayout.status.textContent='Sync interrupted: '+(e.message||'Network error')+' · retrying';
 }finally{pvChatsRequestBusy=false}
}

let pvUsersLiveUI=null,pvUsersLiveBusy=false,pvUsersLiveSignature='';
function renderLiveUserRows(d){
 if(!pvUsersLiveUI)return;
 const {userList}=pvUsersLiveUI;
 const signature=JSON.stringify([d.users,d.total,statusFilter,page]);
 if(signature===pvUsersLiveSignature)return;
 pvUsersLiveSignature=signature;
 const listScroll=main.scrollTop;
 userList.replaceChildren();
   if(!d.users.length)userList.append(E('div','pvoSectionEmpty','No matching users found.'));
   for(const u of d.users){
    const entry=E('div','pvoCard');
    const identity=E('div','pvoIdentity');identity.append(E('strong','', '@'+(u.username||'unknown')+(u.display_name?' · '+u.display_name:'')),E('small','',u.email||'No email'));
    const badges=E('div','pvoUserMeta');
    const lastActive=u.last_active_at?new Date(u.last_active_at):null;
    let lastLabel='Last seen unavailable (no activity recorded)';
    if(lastActive&&!Number.isNaN(lastActive.getTime())){
      const seconds=Math.max(0,Math.floor((Date.now()-lastActive.getTime())/1000));
      const relative=seconds<60?'just now':seconds<3600?Math.floor(seconds/60)+' min ago':seconds<86400?Math.floor(seconds/3600)+' hr ago':Math.floor(seconds/86400)+' days ago';
      lastLabel=(u.online?'Online now · Last heartbeat ':'Last seen ')+relative+' · '+lastActive.toLocaleString('en-IN');
    }
    for(const [value,cls] of [[u.online?'Online now':'Offline',u.online?'pvoOnline':''],[u.confirmed?'Verified':'Unverified',''],[u.suspended?'Suspended':'Active',u.suspended?'isSuspended':''],[u.is_official?'Official':'',''],[u.created_at?new Date(u.created_at).toLocaleDateString('en-IN'):'','']]){
      if(value)badges.append(E('span',cls,value));
    }
    identity.append(badges,E('div','pvoLastSeen'+(u.online?' online':''),lastLabel));entry.append(identity);
    if(!u.is_official){
      const opts=E('div','pvoActions');
      opts.append(makeButton(u.suspended?'Unban':'Suspend',()=>actionConfirm(u.suspended?'unban user':'suspend user',u.suspended?'user.unban':'user.suspend',{id:u.id}),u.suspended?'secondary':'danger'));
      entry.append(opts);
    }
    userList.append(entry);
   }

 pvUsersLiveUI.heading.textContent='Users · '+d.total;
 pvUsersLiveUI.hint.textContent='Showing '+d.users.length+' of '+d.total+' '+(statusFilter==='all'?'users':statusFilter+' users')+' · Live auto-sync · Online means a recent heartbeat within 5 minutes (including background when supported). Last seen is the last recorded activity.';
 pvUsersLiveUI.prev.disabled=page===0;
 pvUsersLiveUI.next.disabled=(page+1)*20>=d.total;
 main.scrollTop=listScroll;
}
async function refreshUsersLive(){
 if(!allowed||overlay.hidden||active!=='users'||document.hidden||!pvUsersLiveUI||pvUsersLiveBusy)return;
 pvUsersLiveBusy=true;
 const ui=pvUsersLiveUI,seenPage=page,seenFilter=statusFilter,seenSearch=search;
 try{
  const d=await api('users',{search:seenSearch,page:seenPage,status:seenFilter});
  if(active==='users'&&!overlay.hidden&&pvUsersLiveUI===ui&&page===seenPage&&statusFilter===seenFilter&&search===seenSearch){
    renderLiveUserRows(d);
    ui.live.textContent='● Live · Updated '+new Date().toLocaleTimeString('en-IN');
  }
 }catch(e){
  if(pvUsersLiveUI===ui)ui.live.textContent='Sync interrupted · Retrying automatically';
 }finally{pvUsersLiveBusy=false}
}
async function render(){
 pvUsersLiveUI=null;pvUsersLiveSignature='';
 pvChatsLayout=null;pvChatsSignature='';
 const ticket=++seq;clear();if(!allowed||!current()){closePanel();return}
 if(active==='chats'){buildChatsLayout();pvChatsLayout.status.textContent='Connecting live activity…';}
 else main.append(E('p','pvoMuted','Loading secure admin data…'));
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
   const d=await api('users',{search,page,status:statusFilter});if(ticket!==seq)return;clear();
   const bar=toolbar('Users · '+d.total),heading=bar.querySelector('h3'),input=E('input','pvoSearch');input.placeholder='Search username or display name';input.value=search;input.setAttribute('aria-label','Search users');const go=makeButton('Search',async()=>{search=input.value.trim();page=0;pvSaveOwnerView();await render()});input.addEventListener('keydown',e=>{if(e.key==='Enter')go.click()});bar.append(input,go);
   const filters=E('div','pvoUserFilters');filters.setAttribute('role','group');filters.setAttribute('aria-label','Filter users by online status');
   for(const [state,label] of [['all','All users'],['online','Online'],['offline','Offline']]){
    const button=E('button','pvoFilter'+(statusFilter===state?' active':''));button.type='button';button.setAttribute('aria-pressed',String(statusFilter===state));
    if(state!=='all')button.append(E('span','pvoFilterDot '+state));
    button.append(document.createTextNode(label));
    button.onclick=()=>{if(statusFilter===state)return;statusFilter=state;page=0;pvSaveOwnerView();render()};
    filters.append(button);
   }
   const refresh=E('button','pvoFilter','↻ Refresh');refresh.type='button';refresh.title='Refresh online status from Supabase';refresh.onclick=()=>render();filters.append(refresh);main.append(filters);
   const hint=E('p','pvoUserHint','Live users loading…');main.append(hint);
   const userList=E('div','pvoUserList');main.append(userList);
   const live=E('small','pvoMuted','● Live · Automatically syncing');live.style.display='block';live.style.margin='8px 0';main.append(live);
   const foot=E('div','pvoFoot'),label=E('span','pvoMuted','Page '+(page+1)),prev=makeButton('Previous',async()=>{page--;pvSaveOwnerView();await render()},'secondary'),next=makeButton('Next',async()=>{page++;pvSaveOwnerView();await render()},'secondary');
   foot.append(prev,label,next);main.append(foot);
   pvUsersLiveUI={heading,hint,userList,prev,next,live};renderLiveUserRows(d);
   if(pvOwnerSavedScroll){main.scrollTop=pvOwnerSavedScroll;pvOwnerSavedScroll=0}
  }else if(active==='reports'){
   const d=await api('reports');if(ticket!==seq)return;clear();toolbar('Reported content and accounts');
   if(!d.reports.length)line('No reports to review.');
   for(const r of d.reports){const acts=['reviewing','resolved','dismissed'].filter(s=>s!==r.status).map(s=>makeButton(s,()=>actionConfirm('mark report '+s,'report.set',{id:r.id,status:s}),'secondary'));card(r.target_kind+' · '+r.reason,(r.details||'No details').slice(0,170)+' · Status: '+r.status+' · Target: '+r.target_id,acts)}
  }else if(active==='posts'||active==='reels'){
   const kind=active==='posts'?'post':'reel',d=await api('content',{kind});if(ticket!==seq)return;clear();toolbar(kind==='post'?'Post moderation':'Reel moderation');
   line('Hide removes content from regular feeds but preserves database rows and media. Restore reverses the action.');
   if(!d.items.length)line('No '+(kind==='reel'?'Reels':'posts')+' uploaded yet.');
   for(const p of d.items){
    const hidden=!!p.moderation?.hidden,action=hidden?'content.restore':'content.hide';
    const row=E('div','pvoCard pvoMediaRow'),thumb=E('div','pvoMediaThumb');
    const path=kind==='reel'?p.video_path:p.image_path;
    if(path){
      const url=db.storage.from(kind==='reel'?'reel-videos':'post-images').getPublicUrl(path).data.publicUrl;
      if(kind==='post'){const image=E('img');image.src=url;image.loading='lazy';image.alt='Post thumbnail';thumb.append(image)}
      else thumb.append(E('span','','▶'));
    }else thumb.append(E('span','',kind==='reel'?'▶':'▧'));
    const detail=E('div','pvoMediaDetails');
    detail.append(E('div','pvoMediaCaption',p.caption||('Untitled '+kind)));
    const displayName=p.author?.display_name||p.author?.username||'Unknown user';
    const username=p.author?.username?'@'+p.author.username:'ID '+String(p.author_id||'').slice(0,8);
    detail.append(E('div','pvoMediaUploader','Uploaded by '+username+' · '+displayName));
    detail.append(E('div','pvoMediaInfo',new Date(p.created_at).toLocaleString('en-IN')+' · '+(hidden?'Hidden from feeds':'Visible')));
    const actions=E('div','pvoActions');
    actions.append(makeButton(kind==='reel'?'▶ Open Reel':'▧ View Post',()=>openOwnerMedia(p,kind),'secondary'));
    actions.append(makeButton(hidden?'Restore':'Hide',()=>actionConfirm(hidden?'restore '+kind:'hide '+kind,action,{kind,id:p.id}),hidden?'secondary':'danger'));
    row.append(thumb,detail,actions);main.append(row);
   }
  }else if(active==='chats'){
   const d=await api('chat.activity');if(ticket!==seq)return;
   updateChatsData(d);
  }else if(active==='testchat'){
   const d=await api('chat.test');if(ticket!==seq)return;clear();
   const bar=toolbar('Consent-based Test Chat Viewer');
   bar.append(makeButton('↻ Refresh',()=>render(),'secondary'));
   line('Shows only messages SENT by accounts that turned on Test Message Sharing. Messages sent before enabling are excluded. Sharing expires after one hour and can be switched off anytime. Other participants’ messages remain private.');
   if(!(d.messages||[]).length){
    const empty=E('div','pvoSectionEmpty','No opted-in test messages yet. Log into your test account, enable sharing, then send a fresh message.');main.append(empty);
   }
   const fmt=p=>p?.username?'@'+p.username:p?.display_name||'User';
   for(const msg of d.messages||[]){
    const item=E('div','pvoCard'),body=E('div');
    body.style.whiteSpace='pre-wrap';body.style.minWidth='0';body.style.width='100%';
    body.append(E('strong','',fmt(msg.sender)+' → '+fmt(msg.recipient)),
                E('small','','Sent '+new Date(msg.created_at).toLocaleString('en-IN')),
                E('p','',msg.body||'[Empty text]'));
    item.append(body);main.append(item);
   }
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
const viewer=E('section');viewer.id='pvOwnerViewer';viewer.hidden=true;
viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');viewer.setAttribute('aria-label','View PAVORA content');
const viewerBox=E('div','pvoViewerBox'),viewerHead=E('div','pvoViewerHead'),viewerTitle=E('strong','','Content preview'),viewerClose=E('button','','Close ×'),viewerMedia=E('div','pvoViewerMedia'),viewerInfo=E('p','pvoViewerInfo');
viewerClose.type='button';viewerHead.append(viewerTitle,viewerClose);viewerBox.append(viewerHead,viewerMedia,viewerInfo);viewer.append(viewerBox);document.body.append(viewer);
function closeViewer(){viewer.hidden=true;viewerMedia.querySelectorAll('video').forEach(video=>{video.pause();video.removeAttribute('src');video.load()});viewerMedia.replaceChildren()}
viewerClose.onclick=closeViewer;viewer.addEventListener('click',event=>{if(event.target===viewer)closeViewer()});
function openOwnerMedia(item,kind){
 const path=kind==='reel'?item.video_path:item.image_path;
 if(!path){alert('No uploaded media is attached to this '+kind+'.');return}
 const bucket=kind==='reel'?'reel-videos':'post-images';
 const mediaUrl=db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
 if(!mediaUrl){alert('Media is unavailable.');return}
 viewerMedia.replaceChildren();
 const medium=E(kind==='reel'?'video':'img');
 if(kind==='reel'){medium.controls=true;medium.playsInline=true;medium.preload='metadata';medium.autoplay=false}
 else medium.alt=item.caption||'PAVORA post image';
 medium.src=mediaUrl;viewerMedia.append(medium);
 const uploader=item.author?.username?'@'+item.author.username:'User '+String(item.author_id||'').slice(0,8);
 viewerTitle.textContent=(kind==='reel'?'Reel':'Post')+' by '+uploader;
 viewerInfo.textContent=(item.caption||'No caption')+' · '+new Date(item.created_at).toLocaleString('en-IN');
 viewer.hidden=false;
}
function closePanel(){closeViewer();overlay.hidden=true;seq++;document.body.classList.remove('pvOwnerOpen');pvSaveOwnerView()}
close.onclick=closePanel;overlay.addEventListener('click',e=>{if(e.target===overlay)closePanel()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!viewer.hidden){closeViewer();return}if(e.key==='Escape'&&!overlay.hidden)closePanel()});
launcher.onclick=()=>{if(!allowed)return;overlay.hidden=false;active='overview';tabsRender();pvSaveOwnerView();render()};
async function verify(){const id=current();if(!id){allowed=false;launcher.hidden=true;closePanel();return}const {data,error}=await db.from('pv_app_admins').select('user_id').eq('user_id',id).maybeSingle();if(id!==current())return;allowed=!error&&!!data;launcher.hidden=!allowed;if(!allowed)closePanel();else pvRestoreOwnerView()}
db.auth.onAuthStateChange(()=>setTimeout(verify,100));setTimeout(verify,800);
// Cloud session restoration can complete after INITIAL_SESSION; recheck hidden owner entry safely.
setInterval(()=>{if(current()&&!allowed)verify();else if(!current()&&allowed)verify()},10000);
setInterval(()=>{refreshChatsLive()},2000);
setInterval(()=>{refreshUsersLive()},1500);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshUsersLive();refreshChatsLive()}});
window.addEventListener('pagehide',()=>{if(allowed&&!overlay.hidden)pvSaveOwnerView()});
main.addEventListener('scroll',()=>{if(allowed&&!overlay.hidden)pvSaveOwnerView()},{passive:true});
window.PAVORA_OWNER={open:()=>{if(allowed)launcher.click()}};
})();
