/* PAVORA: Cache only public application shell. Auth / Supabase API always network. */
const CACHE='pavora-shell-2026-11-09-dm-composer-polish-v24';
const SHELL=['./','./index.html','./cloud.js','./social-suite.js','./calls.js','./app-install.js','./push.js','./manifest.webmanifest','./app-icon.svg','./app-icon-maskable.svg','./notify-icon.png','./notify-badge.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(err=>console.warn('Shell cache unavailable',err)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith('pavora-shell-')&&n!==CACHE).map(n=>caches.delete(n)))),self.clients.claim()]))});
/* Public shell: network first when online, offline cache fallback.
   Avoid returning outdated HTML/JS after a new GitHub deployment, which
   previously left some devices running old Story view recording code. */
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||!url.pathname.startsWith('/pavora/'))return;
 const isNavigation=req.mode==='navigate';
 const shellFile=SHELL.some(x=>x!=='./'&&url.pathname.endsWith(x.slice(2)));
 if(!isNavigation&&!shellFile)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const fallback=new URL('./index.html',self.registration.scope).href;
  try{
   const response=await fetch(req);
   if(response.ok&&response.type==='basic'){
    event.waitUntil(cache.put(req,response.clone()).catch(()=>{}));
    return response;
   }
   if(!isNavigation)return response;
  }catch(err){/* Offline: use last known public shell. */}
  const cached=await cache.match(req,{ignoreSearch:true})
   ||await cache.match(isNavigation?fallback:req,{ignoreSearch:true})
   ||await caches.match(isNavigation?fallback:req,{ignoreSearch:true});
  return cached||Response.error();
 })());
});

/* Background Web Push works after the app/browser is closed on supported devices.
   Actual alert sound is governed by phone OS notification settings. */
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch(e){data={title:'PAVORA',body:'You have a new notification'}}
 const title=String(data.title||'PAVORA').slice(0,100);
 const category=String(data.category||'activity').slice(0,25);
 const options={
  body:String(data.body||'Someone interacted with you on PAVORA').slice(0,180),
  // Android's system UI controls card colors/layout; actual PNG assets provide
  // a crisp branded large icon and a monochrome small-status-bar badge.
  icon:'./notify-icon.png',badge:'./notify-badge.png',
  tag:String(data.tag||'pavora-'+category).slice(0,120),
  renotify:true,
  vibrate:[160,65,180],
  timestamp:Date.now(),
  data:{url:(typeof data.url==='string'&&data.url.startsWith('/pavora/'))?data.url:'/pavora/'},
  actions:[{action:'open',title:category==='message'?'Open chat':'View on PAVORA'}]
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
