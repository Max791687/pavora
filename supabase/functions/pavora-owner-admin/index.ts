// PAVORA v47 Owner Admin: authenticated, admin-only server-side mutations.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const projectUrl=Deno.env.get('SUPABASE_URL')||'';
const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const admin=createClient(projectUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
const allowedOrigin='https://max791687.github.io';
const send=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':allowedOrigin,'Vary':'Origin'}});
const fail=(message,status=400)=>send({error:message},status);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const compact=e=>String(e?.message||'Server error').slice(0,250);
const read=async(q)=>{const r=await q;if(r.error)throw r.error;return r.data||[]};
async function log(actor,action,kind,id,reason,detail={}) {
 const {error}=await admin.from('pv_admin_audit').insert({actor_id:actor,action,target_kind:kind,target_id:id,reason,detail});
 if(error)throw new Error('Audit trail failed: '+error.message);
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':allowedOrigin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Vary':'Origin'}});
 if(req.method!=='POST')return fail('Method not allowed',405);
 if(req.headers.get('origin')&&req.headers.get('origin')!==allowedOrigin)return fail('Origin not permitted',403);
 if(!projectUrl||!serviceKey)return fail('Admin backend not configured',503);
 const bearer=req.headers.get('authorization')||'';
 if(!bearer.startsWith('Bearer '))return fail('Please log in',401);
 try{
  const {data:auth,error:authError}=await admin.auth.getUser(bearer.slice(7));
  if(authError||!auth?.user?.id)return fail('Invalid or expired login',401);
  const actor=auth.user.id;
  const {data:membership,error:memberError}=await admin.from('pv_app_admins').select('user_id').eq('user_id',actor).maybeSingle();
  if(memberError){console.error('PAVORA admin membership lookup failed:',memberError.message);return fail('Admin membership check is temporarily unavailable',503)}
  if(!membership)return fail('Owner admin access required',403);
  const body=await req.json().catch(()=>({}));
  const action=String(body.action||'');
  const id=String(body.id||'');
  const reason=String(body.reason||'').trim().slice(0,250);
  if(action==='summary'){
   const since=new Date(Date.now()-7*86400000).toISOString();
   const count=async(table,query)=>{let q=admin.from(table).select('*',{head:true,count:'exact'});if(query)q=query(q);const r=await q;if(r.error)throw r.error;return r.count||0};
   const [users,newUsers,activeNow,posts,reels,reports,pending,recoveries]=await Promise.all([
    count('profiles'),count('profiles',q=>q.gte('created_at',since)),count('pv_user_presence',q=>q.gte('last_active_at',new Date(Date.now()-15*60000).toISOString())),count('posts'),count('reels'),count('content_reports'),count('content_reports',q=>q.in('status',['pending','open','reviewing'])),
    count('pv_recovery_requests',q=>q.in('status',['pending','reviewing']))
   ]);
   return send({users,newUsers,activeNow,posts,reels,reports,pending,recoveries});
  }
  if(action==='users'){
   const term=String(body.search||'').trim().slice(0,48).replace(/[,()%]/g,'');
   const page=Math.min(50,Math.max(0,Number(body.page)||0));
   const status=['all','online','offline'].includes(body.status)?body.status:'all';
   const cutoff=new Date(Date.now()-75000).toISOString();
   let onlineIds=[];
   if(status!=='all'){
    const {data:present,error:presentError}=await admin.from('pv_user_presence')
      .select('user_id').eq('is_active',true).gte('last_active_at',cutoff).limit(10000);
    if(presentError)throw presentError;
    onlineIds=(present||[]).map(row=>row.user_id);
    if(status==='online'&&!onlineIds.length)return send({users:[],total:0,page,onlineCount:0,status});
   }
   let q=admin.from('profiles').select('id,username,display_name,created_at,is_private,is_official',{count:'exact'}).order('created_at',{ascending:false});
   if(term)q=q.or('username.ilike.%'+term+'%,display_name.ilike.%'+term+'%');
   if(status==='online')q=q.in('id',onlineIds);
   if(status==='offline'&&onlineIds.length)q=q.not('id','in','('+onlineIds.join(',')+')');
   const {data,error,count}=await q.range(page*20,page*20+19);
   if(error)throw error;
   const userIds=(data||[]).map(p=>p.id);
   let onlineState=new Map();
   if(userIds.length){
    const {data:presence,error:presenceError}=await admin.from('pv_user_presence')
      .select('user_id,is_active,last_active_at').in('user_id',userIds);
    if(presenceError)throw presenceError;
    onlineState=new Map((presence||[]).map(row=>[row.user_id,row]));
   }
   const users=await Promise.all((data||[]).map(async p=>{
    const r=await admin.auth.admin.getUserById(p.id);
    const account=r.data?.user;
    const last=onlineState.get(p.id);
    const age=last?.last_active_at?Date.now()-new Date(last.last_active_at).getTime():Infinity;
    return {...p,email:account?.email||null,confirmed:!!account?.email_confirmed_at,
      suspended:!!(account?.banned_until&&new Date(account.banned_until)>new Date()),
      online:!!last?.is_active&&age>=0&&age<75000,
      last_active_at:last?.last_active_at||null};
   }));
   return send({users,total:count||0,page,onlineCount:users.filter(u=>u.online).length,status});
  }
  if(action==='chat.activity'){
   // Owner-only metadata: no message bodies, attachments or private content are read.
   const cutoff=new Date(Date.now()-45000).toISOString();
   const presence=await read(admin.from('pv_chat_presence').select('user_id,peer_id,updated_at').gte('updated_at',cutoff).order('updated_at',{ascending:false}).limit(500));
   const byUser=new Map(presence.map(row=>[row.user_id,row]));
   const openChats=presence.map(row=>({viewer_id:row.user_id,peer_id:row.peer_id,updated_at:row.updated_at,mutual:byUser.get(row.peer_id)?.peer_id===row.user_id}));
   const messages=await read(admin.from('direct_messages').select('id,sender_id,recipient_id,created_at,read_at').order('created_at',{ascending:false}).limit(80));
   const ids=[...new Set([...openChats.flatMap(p=>[p.viewer_id,p.peer_id]),...messages.flatMap(m=>[m.sender_id,m.recipient_id])])];
   const profiles=ids.length?await read(admin.from('profiles').select('id,username,display_name').in('id',ids)):[]; 
   const names=new Map(profiles.map(u=>[u.id,{username:u.username,display_name:u.display_name}]));
   const named=id=>names.get(id)||{username:null,display_name:'User'};
   return send({
    openChats:openChats.map(row=>({...row,viewer:named(row.viewer_id),peer:named(row.peer_id)})),
    messages:messages.map(m=>({id:m.id,sender:named(m.sender_id),recipient:named(m.recipient_id),created_at:m.created_at,seen:!!m.read_at})),
    updated_at:new Date().toISOString(),
    note:'Only chat-open status and sender/recipient/timestamp/read metadata. No message bodies or media.'
   });
  }
  if(action==='chat.test'){
   // Available only to verified owners, and only for messages explicitly sent AFTER opt-in.
   // Never fetch or expose other participants' message bodies.
   const messages=await read(admin.rpc('pv_owner_test_sent_messages'));
   const ids=[...new Set(messages.flatMap(m=>[m.sender_id,m.recipient_id]))];
   const profiles=ids.length?await read(admin.from('profiles').select('id,username,display_name').in('id',ids)):[];
   const names=new Map(profiles.map(p=>[p.id,{username:p.username,display_name:p.display_name}]));
   return send({messages:messages.map(m=>({sender:names.get(m.sender_id)||null,recipient:names.get(m.recipient_id)||null,body:m.body,created_at:m.created_at})),notice:'Only messages composed by an explicitly opted-in account after consent. Access expires after one hour.'});
  }
  if(action==='recovery.list'){
   const entries=await read(admin.from('pv_recovery_requests').select('id,email,issue,status,created_at').order('created_at',{ascending:false}).limit(100));
   return send({entries});
  }
  if(action==='recovery.send_reset'){
   if(!uuid.test(id))return fail('Invalid recovery request');
   if(reason.length<5)return fail('Provide an audit reason');
   const {data:request,error:requestError}=await admin.from('pv_recovery_requests')
     .select('id,email,status').eq('id',id).maybeSingle();
   if(requestError)throw requestError;
   if(!request||request.status==='closed')return fail('Open support request not found',404);
   // Only mail a reset link to the address in the recovery ticket.
   // No reset token or readable password is returned to any support staff.
   const cutoff=new Date(Date.now()-30*60*1000).toISOString();
   const {data:recent,error:recentError}=await admin.from('pv_admin_audit')
     .select('id').eq('action','recovery.reset_email_sent').eq('target_id',id).gte('created_at',cutoff).limit(1);
   if(recentError)throw recentError;
   if(recent?.length)return fail('Reset already requested recently. Try again later',429);
   const {error:mailError}=await admin.auth.resetPasswordForEmail(request.email,{
     redirectTo:'https://max791687.github.io/pavora/'
   });
   if(mailError)throw mailError;
   const {error:updateError}=await admin.from('pv_recovery_requests').update({
     status:'reviewing',updated_at:new Date().toISOString()
   }).eq('id',id);
   if(updateError)throw updateError;
   await log(actor,'recovery.reset_email_sent','recovery_request',id,reason);
   return send({ok:true,message:'Password reset email requested. No passwords or reset tokens were revealed.'});
  }
  if(action==='recovery.review'){
   if(!uuid.test(id))return fail('Invalid request');
   const status=String(body.status||'');
   if(!['reviewing','closed'].includes(status))return fail('Invalid status');
   if(reason.length<5)return fail('Provide an audit reason');
   const {data,error}=await admin.from('pv_recovery_requests').update({status,updated_at:new Date().toISOString()}).eq('id',id).select('id').maybeSingle();
   if(error)throw error;
   if(!data)return fail('Request not found',404);
   await log(actor,'recovery.'+status,'recovery_request',id,reason);
   return send({ok:true});
  }
  if(action==='reports'){
   const reports=await read(admin.from('content_reports').select('id,reporter_id,target_kind,target_id,reason,details,status,created_at').order('created_at',{ascending:false}).limit(100));
   return send({reports});
  }
  if(action==='content'){
   const kind=body.kind==='post'?'post':body.kind==='reel'?'reel':null;
   if(!kind)return fail('Unknown content type');
   const table=kind==='post'?'posts':'reels';
   const [items,moderated]=await Promise.all([
    read(admin.from(table).select(kind==='reel'?'id,author_id,caption,video_path,created_at':'id,author_id,caption,image_path,created_at').order('created_at',{ascending:false}).limit(100)),
    read(admin.from('pv_content_moderation').select('kind,content_id,hidden,reason,updated_at').eq('kind',kind))
   ]);
   const authorIds=[...new Set(items.map(item=>item.author_id).filter(Boolean))];
   const people=authorIds.length?await read(admin.from('profiles').select('id,username,display_name,avatar_url').in('id',authorIds)):[];
   const authors=new Map(people.map(person=>[person.id,{username:person.username,display_name:person.display_name,avatar_url:person.avatar_url}]));
   const statuses=new Map(moderated.map(m=>[m.content_id,m]));
   return send({items:items.map(item=>({...item,author:authors.get(item.author_id)||null,moderation:statuses.get(item.id)||null}))});
  }
  if(action==='audit'){
   const entries=await read(admin.from('pv_admin_audit').select('id,actor_id,action,target_kind,target_id,reason,created_at').order('created_at',{ascending:false}).limit(100));
   return send({entries});
  }
  if(action==='user.suspend'||action==='user.unban'){
   if(!uuid.test(id))return fail('Invalid user ID');
   if(id===actor)return fail('You cannot suspend your own admin account');
   const {data:otherAdmin}=await admin.from('pv_app_admins').select('user_id').eq('user_id',id).maybeSingle();
   if(otherAdmin)return fail('Admin accounts cannot be suspended from this dashboard');
   if(reason.length<5)return fail('Provide a reason (at least 5 characters)');
   const {data:target,error:getError}=await admin.auth.admin.getUserById(id);
   if(getError||!target?.user)return fail('User not found',404);
   // Supabase Auth Admin API revokes future logins. Active JWTs can persist until expiry.
   const {error}=await admin.auth.admin.updateUserById(id,{ban_duration:action==='user.suspend'?'876000h':'none'});
   if(error)throw error;
   await log(actor,action,'account',id,reason);
   return send({ok:true});
  }
  if(action==='content.hide'||action==='content.restore'){
   const kind=body.kind==='post'?'post':body.kind==='reel'?'reel':null;
   if(!kind||!uuid.test(id))return fail('Invalid content target');
   if(reason.length<5)return fail('Provide a reason (at least 5 characters)');
   const table=kind==='post'?'posts':'reels';
   const {data:target,error:targetError}=await admin.from(table).select('id').eq('id',id).maybeSingle();
   if(targetError||!target)return fail('Content not found',404);
   const {error}=await admin.from('pv_content_moderation').upsert({kind,content_id:id,hidden:action==='content.hide',reason,updated_by:actor,updated_at:new Date().toISOString()},{onConflict:'kind,content_id'});
   if(error)throw error;
   await log(actor,action,kind,id,reason);
   return send({ok:true});
  }
  if(action==='report.set'){
   if(!uuid.test(id))return fail('Invalid report ID');
   const status=String(body.status||'');
   if(!['pending','reviewing','resolved','dismissed'].includes(status))return fail('Invalid review status');
   if(reason.length<5)return fail('Provide a reason (at least 5 characters)');
   const {data,error}=await admin.from('content_reports').update({status}).eq('id',id).select('id').maybeSingle();
   if(error)throw error;
   if(!data)return fail('Report not found',404);
   await log(actor,'report.'+status,'report',id,reason);
   return send({ok:true});
  }
  return fail('Unknown admin action');
 }catch(error){console.error('PAVORA owner admin:',compact(error));return fail(compact(error),500)}
});
