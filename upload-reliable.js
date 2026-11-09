/* PAVORA v30: transparent transient-upload retry without duplicate object names.
   No false progress percentages: Supabase storage upload does not report byte progress here. */
(function(){
 'use strict';
 const RETRIES=2;
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function retryable(error){
  if(!error)return false;
  const status=Number(error.statusCode||error.status||0);
  const value=String(error.message||error).toLowerCase();
  if([408,425,429,500,502,503,504].includes(status))return true;
  if(status>=400&&status<500)return false;
  return /network|failed to fetch|fetch failed|timeout|timed out|connection|temporarily unavailable|load failed/i.test(value);
 }
 function conflict(error){
  const status=Number(error?.statusCode||error?.status||0);
  return status===409||/already exists|duplicate|resource already exists/i.test(String(error?.message||''));
 }
 function description(error){
  if(!navigator.onLine)return 'Internet disconnected. Reconnect and tap Share again.';
  const message=String(error?.message||'Upload failed');
  if(/exceeded|too large|payload too large|entity too large|maximum file size/i.test(message))
   return 'Storage rejected the file size. Please try a smaller video or check the Supabase bucket limit.';
  if(/unauthorized|permission|row-level security|not allowed|forbidden/i.test(message))
   return 'Upload permission denied. Please sign in again or contact the app administrator.';
  return message;
 }
 async function upload(db,bucket,path,file,{onStatus=()=>{},maxRetries=RETRIES}={}){
  if(!db||!bucket||!path||!file)throw Error('Invalid upload request.');
  if(!navigator.onLine)throw Error('Internet disconnected. Reconnect and tap Share again.');
  let uncertain=false;
  for(let attempt=0;attempt<=maxRetries;attempt++){
   if(attempt>0){
    onStatus('Connection issue. Retrying upload ('+attempt+'/'+maxRetries+')…');
    await pause(Math.min(3600,750*Math.pow(2,attempt-1)));
    if(!navigator.onLine)throw Error('Internet disconnected. Reconnect and tap Share again.');
   }else onStatus('Uploading '+(file.size/1048576).toFixed(1)+' MB…');
   let result;
   try{
    result=await db.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
   }catch(err){result={error:err}}
   if(!result?.error)return {path,bucket};
   if(uncertain&&conflict(result.error)){
    // Previous request may have committed before the connection was lost.
    // Verify the same object exists before considering it uploaded.
    const segments=path.split('/');
    const name=segments.pop(),folder=segments.join('/');
    const found=await db.storage.from(bucket).list(folder,{search:name,limit:30});
    if(!found.error&&found.data?.some(entry=>entry.name===name))return {path,bucket};
   }
   if(!retryable(result.error)||attempt>=maxRetries)throw Error(description(result.error));
   uncertain=true;
  }
  throw Error('Upload could not finish.');
 }
 window.PAVORA_UPLOAD={upload,retryable};
})();