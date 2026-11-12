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
 // Coarse device family only. Do not collect serials, exact models or fingerprint signals.
 const deviceName=/iPhone/i.test(ua)?'iPhone':
   /iPad/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1)?'iPad':
   /Android/i.test(ua)?(
     /Samsung|SM-[A-Z0-9]/i.test(ua)?'Samsung Galaxy':
     /Pixel/i.test(ua)?'Google Pixel':
     device==='tablet'?'Android tablet':'Android phone'):
   /Windows/i.test(ua)?'Windows PC':
   /Macintosh|Mac OS X/i.test(ua)?'Mac':
   /Linux/i.test(ua)?'Linux PC':'Other device';
 // Only a browser-reported model. Never infer an iPhone model from its screen size.
 const deviceModelPromise=(async()=>{
  let model='';
  try{
   if(navigator.userAgentData?.getHighEntropyValues){
    const info=await navigator.userAgentData.getHighEntropyValues(['model']);
    model=String(info?.model||'').trim();
   }
  }catch{}
  if(!model&&/Android/i.test(ua)){
   // Some Android browsers still expose an explicit model in the UA.
   const match=ua.match(/Android[^;)]*;\s*(?:[a-z]{2}-[a-z]{2};\s*)?([^;)]+?)(?:\s+Build\/|[;)])/i);
   if(match)model=match[1].trim();
  }
  if(!/^[a-zA-Z0-9 _+().-]{3,48}$/.test(model)||/unknown|generic|build|linux|windows|iphone|ipad|macintosh|android/i.test(model))return null;
  return model;
 })();
 // Approximate session timings: server timestamps, one anonymous visit ID
 // for each opened PAVORA view. Browser termination is best-effort.
 let activeVisit=null;
 const endpoint='https://iyqmjaomslffqfwbsydr.supabase.co/functions/v1/pavora-visit';
 function timingPayload(active,event,reason){
  return {page:active.page,session,device,deviceName,visitId:active.id,event,...(reason?{reason}:{})};
 }
 function beacon(active,reason){
  try{
   const payload=JSON.stringify(timingPayload(active,'exit',reason));
   if(navigator.sendBeacon)navigator.sendBeacon(endpoint,new Blob([payload],{type:'text/plain'}));
  }catch{}
 }
 function eventAsync(active,event,reason){
  return db.functions.invoke('pavora-visit',{body:timingPayload(active,event,reason)}).catch(()=>{});
 }
 function enter(page){
  if(activeVisit?.page===page)return;
  if(activeVisit)beacon(activeVisit,'navigate');
  const current={id:crypto.randomUUID(),page};
  activeVisit=current;
  void eventAsync(current,'start');
 }
 // A recent heartbeat is more reliable than assuming that an app was closed.
 setInterval(()=>{
  if(activeVisit&&!document.hidden)void eventAsync(activeVisit,'pulse');
 },30000);
 document.addEventListener('visibilitychange',()=>{
  if(!activeVisit)return;
  if(document.hidden)beacon(activeVisit,'hidden');
  else void eventAsync(activeVisit,'pulse');
 });
 window.addEventListener('pagehide',()=>{
  if(activeVisit)beacon(activeVisit,'pagehide');
 });
 let last='',lastAt=0;
 async function visit(page){
  const path=String(page||'').toLowerCase().replace(/[^a-z0-9_/-]/g,'').slice(0,110);
  if(!/^\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)?$/.test(path))return;
  if(document.hidden)return;
  enter(path);
  const now=Date.now();if(path===last&&now-lastAt<45000)return;
  last=path;lastAt=now;
  try{const deviceModel=await deviceModelPromise;await db.functions.invoke('pavora-visit',{body:{page:path,session,device,deviceName,deviceModel}})}catch(e){console.warn('Anonymous analytics unavailable')}
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