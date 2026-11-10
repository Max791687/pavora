// PAVORA secure recovery-support intake: never discloses passwords or account existence.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const origin='https://max791687.github.io';
const db=createClient(Deno.env.get('SUPABASE_URL')||'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',{auth:{persistSession:false}});
function reply(message,status=200){return new Response(JSON.stringify({message}),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Vary':'Origin'}})}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'}});
 if(req.method!=='POST')return reply('Method not allowed',405);
 if(req.headers.get('origin')!==origin)return reply('Not allowed',403);
 try{
  const input=await req.json();
  const email=String(input?.email||'').trim().toLowerCase();
  const issue=String(input?.issue||'Cannot access my account').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return reply('Enter a valid email address',400);
  if(issue.length>280||issue.length<4)return reply('Describe the account access problem briefly',400);
  // Do not ask for passwords, OTPs or personal identification documents.
  if(/password\s*[:=]\s*\S{4,}|otp\s*[:=]\s*\d{4,}/i.test(issue))return reply('Do not include passwords or verification codes',400);
  const cutoff=new Date(Date.now()-60*60*1000).toISOString();
  const {count,error:checkError}=await db.from('pv_recovery_requests').select('*',{count:'exact',head:true}).eq('email',email).gte('created_at',cutoff);
  if(checkError)throw checkError;
  if(!count){
   const result=await db.from('pv_recovery_requests').insert({email,issue,status:'pending'});
   if(result.error)throw result.error;
  }
  // Identical response whether an account exists or a request was throttled.
  return reply('Support request received. We will review it. Never share your password or verification code with anyone.');
 }catch(e){console.error('Recovery intake failed:',String(e?.message||e));return reply('Request could not be submitted. Please try again later.',500)}
});