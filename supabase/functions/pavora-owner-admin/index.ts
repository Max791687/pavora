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
const read=async(q)=>{if(q.error)throw q.error;return q.data};
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
  if(memberError||!membership)return fail('Owner admin access required',403);
  const body=await req.json().catch(()=>({}));
  const action=String(body.action||'');
  const id=String(body.id||'');
  const reason=String(body.reason||'').trim().slice(0,250);
  if(action==='summary'){
   const since=new Date(Date.now()-7*86400000).toISOString();
   const count=async(table,query)=>{let q=admin.from(table).select('*',{head:true,count:'exact'});if(query)q=query(q);const r=await q;if(r.error)throw r.error;return r.count||0};
   const [users,newUsers,posts,reels,reports,pending,suspended]=await Promise.all([
    count('profiles'),count('profiles',q=>q.gte('created_at',since)),count('posts'),count('reels'),count('content_reports'),count('content_reports',q=>q.in('status',['pending','open','reviewing'])),
    admin.from('pv_admin_audit').select('target_id').eq('action','user.suspend').order('created_at',{ascending:false}).limit(50)
   ]);
   return send({users,newUsers,posts,reels,reports,pending,latestSuspensions:suspended.data?.length||0});
  }
  if(action==='users'){
   const term=String(body.search||'').trim().slice(0,48).replace(/[,()%]/g,'');
   const page=Math.min(50,Math.max(0,Number(body.page)||0));
   let q=admin.from('profiles').select('id,username,display_name,created_at,is_private,is_official',{count:'exact'}).order('created_at',{ascending:false});
   if(term)q=q.or('username.ilike.%'+term+'%,display_name.ilike.%'+term+'%');
   const {data,error,count}=await q.range(page*20,page*20+19);
   if(error)throw error;
   const users=await Promise.all((data||[]).map(async p=>{
    const r=await admin.auth.admin.getUserById(p.id);
    const account=r.data?.user;
    return {...p,email:account?.email||null,confirmed:!!account?.email_confirmed_at,suspended:!!(account?.banned_until&&new Date(account.banned_until)>new Date())};
   }));
   return send({users,total:count||0,page});
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
    read(admin.from(table).select('id,author_id,caption,created_at').order('created_at',{ascending:false}).limit(100)),
    read(admin.from('pv_content_moderation').select('kind,content_id,hidden,reason,updated_at').eq('kind',kind))
   ]);
   const statuses=new Map(moderated.map(m=>[m.content_id,m]));
   return send({items:items.map(item=>({...item,moderation:statuses.get(item.id)||null}))});
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
