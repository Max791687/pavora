// Supabase Edge Function: send-push
// Deploy with "Verify JWT" OFF because Supabase Database Webhooks use a private
// x-pavora-webhook-secret header, not a user JWT.
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (managed by Supabase),
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_CONTACT_EMAIL, PUSH_WEBHOOK_SECRET.
// Never put the private key / service role / webhook secret in GitHub Pages.
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const url=Deno.env.get('SUPABASE_URL')||'';
const role=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const webhookSecret=Deno.env.get('PUSH_WEBHOOK_SECRET')||'';
const publicKey=Deno.env.get('VAPID_PUBLIC_KEY')||'';
const privateKey=Deno.env.get('VAPID_PRIVATE_KEY')||'';
const contact=Deno.env.get('PUSH_CONTACT_EMAIL')||'mailto:admin@example.com';
if(publicKey&&privateKey)webpush.setVapidDetails(contact.startsWith('mailto:')?contact:'mailto:'+contact,publicKey,privateKey);
const db=createClient(url,role,{auth:{persistSession:false,autoRefreshToken:false}});
const typeInfo:Record<string,{title:string;body:string;url:string}>={
 message:{title:'New message',body:'You received a new message on PAVORA.',url:'/pavora/#messages'},
 like:{title:'New like ❤️',body:'Someone liked your post.',url:'/pavora/#notifications'},
 comment:{title:'New comment 💬',body:'Someone commented on your post.',url:'/pavora/#notifications'},
 follow:{title:'New follower',body:'Someone started following you.',url:'/pavora/#notifications'},
 reel_like:{title:'Reel liked ❤️',body:'Someone liked your Reel.',url:'/pavora/#notifications'},
 reel_comment:{title:'Reel comment 💬',body:'Someone commented on your Reel.',url:'/pavora/#notifications'},
 story_view:{title:'Story activity 👀',body:'Someone viewed your story.',url:'/pavora/#notifications'}
};
Deno.serve(async req=>{
 if(req.method==='GET')return Response.json({publicKey:publicKey||null},{headers:{'Cache-Control':'public, max-age=300'}});
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 if(!webhookSecret||req.headers.get('x-pavora-webhook-secret')!==webhookSecret)return new Response('Unauthorized',{status:401});
 if(!url||!role||!publicKey||!privateKey)return new Response('Push secrets are not configured',{status:503});
 try{
  const payload=await req.json();
  if(payload?.type!=='INSERT'||payload?.table!=='push_jobs'||payload?.schema!=='public')return new Response('Ignored',{status:200});
  const jobId=payload?.record?.id;
  if(typeof jobId!=='string'||!/^[0-9a-f-]{36}$/i.test(jobId))return new Response('Invalid job',{status:400});
  const {data:job,error:jobError}=await db.from('push_jobs').select('id,recipient_id,actor_id,event_kind,processed_at').eq('id',jobId).maybeSingle();
  if(jobError)throw jobError;
  if(!job||job.processed_at)return new Response('Already handled',{status:200});
  const info=typeInfo[job.event_kind];
  if(!info)return new Response('Unknown event',{status:200});
  const {data:subs,error:subError}=await db.from('push_subscriptions').select('id,endpoint,p256dh,auth').eq('user_id',job.recipient_id);
  if(subError)throw subError;
  let actorName='';
  if(job.actor_id){
   const {data:actor}=await db.from('profiles').select('username').eq('id',job.actor_id).maybeSingle();
   actorName=typeof actor?.username==='string'?actor.username.slice(0,24):'';
  }
  const body=actorName?'@'+actorName+': '+info.body:info.body;
  const message=JSON.stringify({title:info.title,body,url:info.url,tag:'pavora-'+job.id});
  const results=await Promise.allSettled((subs||[]).map(async sub=>{
   try{
    await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},message,{TTL:3600,urgency:'normal'});
   }catch(e){
    if(e?.statusCode===404||e?.statusCode===410){
     await db.from('push_subscriptions').delete().eq('id',sub.id);
     return;
    }
    throw e;
   }
  }));
  if(results.some(x=>x.status==='rejected')){console.error('Push delivery failed',results.filter(x=>x.status==='rejected').length);return new Response('Delivery unavailable',{status:503})}
  const {error:updateError}=await db.from('push_jobs').update({processed_at:new Date().toISOString()}).eq('id',job.id).is('processed_at',null);
  if(updateError)throw updateError;
  return Response.json({ok:true,devices:(subs||[]).length});
 }catch(e){console.error('Push webhook error',e);return new Response('Internal push error',{status:500})}
});
