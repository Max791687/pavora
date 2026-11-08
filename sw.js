/* PAVORA: Cache only public application shell. Auth / Supabase API always network. */
const CACHE='pavora-shell-2026-11-09-push-v1';
const SHELL=['./','./index.html','./cloud.js','./social-suite.js','./calls.js','./app-install.js','./manifest.webmanifest','./app-icon.svg','./app-icon-maskable.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(err=>console.warn('Shell cache unavailable',err)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith('pavora-shell-')&&n!==CACHE).map(n=>caches.delete(n)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url);
 if(!url.pathname.startsWith('/pavora/'))return;
 if(req.mode==='navigate'||SHELL.filter(x=>x!=='./').some(x=>url.pathname.endsWith(x.slice(2)))){
   event.respondWith(fetch(req).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{})}return response}).catch(()=>caches.match(req).then(cached=>cached||Response.error())));
 }
});
/* Background Web Push works after the app/browser is closed on supported devices.
   Actual alert sound is governed by phone OS notification settings. */
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch(e){data={title:'PAVORA',body:'You have a new notification'}}
 const title=String(data.title||'PAVORA').slice(0,100);
 const options={
  body:String(data.body||'New activity on PAVORA').slice(0,180),
  icon:'./app-icon.svg',badge:'./app-icon.svg',
  tag:String(data.tag||'pavora-activity'),
  renotify:true,
  vibrate:[180,80,180],
  data:{url:(typeof data.url==='string'&&data.url.startsWith('/pavora/'))?data.url:'/pavora/'}
 };
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=new URL(event.notification.data?.url||'/pavora/',self.location.origin).href;
 event.waitUntil((async()=>{
  const clientsList=await clients.matchAll({type:'window',includeUncontrolled:true});
  const match=clientsList.find(c=>c.url.startsWith(self.location.origin+'/pavora/'));
  if(match){await match.focus();if(match.navigate)await match.navigate(target);return}
  await clients.openWindow(target);
 })());
});
