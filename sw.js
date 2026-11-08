/* PAVORA: Cache only public application shell. Auth / Supabase API always network. */
const CACHE='pavora-shell-2026-11-08-v2';
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