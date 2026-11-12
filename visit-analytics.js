/* PAVORA v150 — minimal analytics, no persistent visitor ID. */
(()=>{
 'use strict';
 if(window.__pvVisitTracker)return;window.__pvVisitTracker=true;
 const db=window.PVKit?.db;if(!db)return;
 // Respect browser privacy signals and explicit opt-out.
 if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||localStorage.getItem('pv_analytics_opt_out')==='1')return;
 let session;
 try{
  const key='pv_visit_session_v1';
  session=sessionStorage.getItem(key);
  if(!session){session=crypto.randomUUID();sessionStorage.setItem(key,session)}
 }catch{return}
 const ua=navigator.userAgent||'';
 const device=/iPad|Tablet/i.test(ua)||(/Android/i.test(ua)&&!/Mobile/i.test(ua))?'tablet':/iPhone|Android.*Mobile|Mobile/i.test(ua)?'mobile':'desktop';
 let last='',lastAt=0;
 async function visit(page){
  const path=String(page||'').toLowerCase().replace(/[^a-z0-9_/-]/g,'').slice(0,110);
  if(!/^\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)?$/.test(path))return;
  if(document.hidden)return;
  const now=Date.now();if(path===last&&now-lastAt<45000)return;
  last=path;lastAt=now;
  try{await db.functions.invoke('pavora-visit',{body:{page:path,session,device}})}catch(e){console.warn('Anonymous analytics unavailable')}
 }
 window.PAVORA_VISITS={visit};
 const start=()=>visit('/entry');
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 document.addEventListener('pv-analytics-view',event=>{
  const view=String(event.detail?.view||'');
  if(/^(home|explore|profile|reels|messages|creator)$/.test(view))visit('/'+view);
 });
 window.addEventListener('hashchange',()=>{
  const hash=location.hash.slice(1);
  if(/^reel-[a-z0-9_-]{1,70}$/i.test(hash))visit('/reels/detail');
 });
})();