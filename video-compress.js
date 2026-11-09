/* PAVORA video size optimizer: local, in-browser, no upload before compression.
   MediaRecorder transcodes in real time. Recompression is lossy by definition. */
(function(){
 'use strict';
 const MAX=50*1024*1024;
 const TARGET=46*1024*1024;
 const supported=()=>typeof MediaRecorder!=='undefined'&&typeof HTMLCanvasElement!=='undefined'&&typeof HTMLCanvasElement.prototype.captureStream==='function';
 function preferredMime(){
  for(const mime of ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'])
   if(MediaRecorder.isTypeSupported(mime))return mime;
  return null;
 }
 function getMeta(file){
  return new Promise((resolve,reject)=>{
   const video=document.createElement('video'),url=URL.createObjectURL(file);
   const clean=()=>{video.removeAttribute('src');video.load();URL.revokeObjectURL(url)};
   const timeout=setTimeout(()=>{clean();reject(Error('Cannot read video metadata on this device.'))},20000);
   video.preload='metadata';video.muted=true;video.playsInline=true;
   video.onloadedmetadata=()=>{
    clearTimeout(timeout);
    const data={duration:video.duration,width:video.videoWidth,height:video.videoHeight};
    clean();if(!Number.isFinite(data.duration)||data.duration<=0||!data.width||!data.height)return reject(Error('Video format not supported by this browser.'));
    resolve(data);
   };
   video.onerror=()=>{clearTimeout(timeout);clean();reject(Error('This video cannot be decoded by the browser. Try an MP4 file.'))};
   video.src=url;
  });
 }
 function transcode(file,meta,attempt,onProgress,signal){
  return new Promise(async(resolve,reject)=>{
   let url,video,audioCtx,stream,recorder,timer,finished=false;
   const chunks=[],canvas=document.createElement('canvas');
   const maxSide=attempt?720:1080;
   const scale=Math.min(1,maxSide/Math.max(meta.width,meta.height));
   canvas.width=Math.max(2,Math.round(meta.width*scale/2)*2);
   canvas.height=Math.max(2,Math.round(meta.height*scale/2)*2);
   const ctx=canvas.getContext('2d',{alpha:false});
   if(!ctx)return reject(Error('Canvas video encoding unavailable.'));
   const cleanup=()=>{
    clearInterval(timer);signal?.removeEventListener('abort',abort);
    try{stream?.getTracks().forEach(t=>t.stop())}catch{}
    try{video?.pause();video?.removeAttribute('src');video?.load()}catch{}
    try{audioCtx?.close()}catch{}
    if(url)URL.revokeObjectURL(url);
   };
   const fail=err=>{if(finished)return;finished=true;try{if(recorder?.state==='recording')recorder.stop()}catch{}cleanup();reject(err instanceof Error?err:Error(String(err)))};
   const abort=()=>fail(Error('Video compression cancelled.'));
   if(signal?.aborted)return fail(Error('Video compression cancelled.'));
   signal?.addEventListener('abort',abort,{once:true});
   try{
    url=URL.createObjectURL(file);
    video=document.createElement('video');video.src=url;video.playsInline=true;video.preload='auto';video.muted=false;
    await new Promise((ok,no)=>{
     const timeout=setTimeout(()=>no(Error('Could not load video for compression.')),25000);
     video.onloadeddata=()=>{clearTimeout(timeout);ok()};
     video.onerror=()=>{clearTimeout(timeout);no(Error('This device cannot decode the video.'))};
    });
    if(finished)return;
    const frameStream=canvas.captureStream(24);
    stream=new MediaStream(frameStream.getVideoTracks());
    try{
     const AC=window.AudioContext||window.webkitAudioContext;
     if(AC){
      audioCtx=new AC();
      const source=audioCtx.createMediaElementSource(video),destination=audioCtx.createMediaStreamDestination();
      source.connect(destination); // Preserve sound, don't send it to speakers.
      destination.stream.getAudioTracks().forEach(track=>stream.addTrack(track));
      await audioCtx.resume();
     }
    }catch(err){console.warn('PAVORA: Audio capture unsupported:',err);throw Error('Audio preservation is not supported for this video on this device.')}
    const mime=preferredMime();if(!mime)throw Error('Video encoding is unavailable in this browser.');
    const audioRate=stream.getAudioTracks().length?96000:0;
    const bitrate=Math.max(180000,Math.floor((TARGET*8/meta.duration)-audioRate-(attempt?220000:100000)));
    recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:bitrate,audioBitsPerSecond:audioRate||undefined});
    recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
    recorder.onerror=e=>fail(e.error||Error('Video encoder failed.'));
    recorder.onstop=()=>{
     if(finished)return;finished=true;
     const blob=new Blob(chunks,{type:'video/webm'});
     cleanup();
     if(!blob.size)return reject(Error('Video compression produced an empty result.'));
     const name=(file.name||'pavora-video').replace(/\.[^/.]+$/,'')+'-optimized.webm';
     resolve(new File([blob],name,{type:'video/webm',lastModified:Date.now()}));
    };
    let lastFrame=0;
    const draw=()=>{if(finished)return;try{ctx.drawImage(video,0,0,canvas.width,canvas.height)}catch{}};
    timer=setInterval(()=>{
     if(finished)return;
     if(!video.paused&&!video.ended){draw();const elapsed=video.currentTime||0;
      if(elapsed>lastFrame){lastFrame=elapsed;onProgress?.(Math.min(99,Math.round(elapsed/meta.duration*100)))}
     }
     if(video.ended&&recorder.state==='recording')recorder.stop();
    },40);
    video.onended=()=>{draw();if(recorder.state==='recording')recorder.stop()};
    recorder.start(1000);
    await video.play();
   }catch(e){fail(e)}
  });
 }
 async function prepare(file,onProgress,signal){
  if(!file||!file.type.startsWith('video/'))throw Error('Choose a video file.');
  if(file.size<=MAX&&['video/mp4','video/webm'].includes(file.type))return file;
  if(!supported())throw Error('This browser cannot compress large videos automatically. Try a recent Chrome browser.');
  const meta=await getMeta(file);
  if(meta.duration>1800)throw Error('Videos longer than 30 minutes need external compression on this device.');
  if(onProgress)onProgress('Optimizing video locally… 0%');
  let output=null;
  for(let attempt=0;attempt<2;attempt++){
   output=await transcode(file,meta,attempt,p=>onProgress?.('Optimizing video locally… '+p+'%'+(attempt?' (second pass)':'')),signal);
   if(output.size<=MAX)return output;
  }
  throw Error('This video still exceeds 50 MB after compression. Try a shorter clip or external compression.');
 }
 window.PAVORA_VIDEO={prepare,MAX};
})();