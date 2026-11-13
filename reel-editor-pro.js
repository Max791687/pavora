/* PAVORA Reel Editor Pro v183 — optional enhancement of existing uploader.
   Only the selected file is processed locally; no gallery scanning.
   Existing Reels feed, auth, messages and Supabase operations stay intact. */
(()=>{
'use strict';
if(window.PAVORA_REEL_EDITOR)return;
const style=document.createElement('style');style.id='pvReelEditor183';
style.textContent=[
'#pvEd183[hidden]{display:none!important}#pvEd183{position:fixed;inset:0;z-index:20000;display:grid;place-items:center;background:#07051ddc;backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);padding:12px;color:white}',
'#pvEd183 *{box-sizing:border-box}#pvEd183 .edCard{width:min(860px,100%);max-height:95dvh;overflow:hidden;display:flex;flex-direction:column;background:radial-gradient(circle at 10% 0%,#9e68f44a,transparent 70%),linear-gradient(150deg,#251e56,#111530 80%);border:1px solid #e3cfff81;border-radius:24px;box-shadow:0 25px 85px #000c}',
'#pvEd183 .edHead,#pvEd183 .edFoot{display:flex;align-items:center;gap:10px;padding:13px 17px;background:#ffffff11;border-bottom:1px solid #ffffff2b}#pvEd183 .edHead strong{font-size:17px}#pvEd183 .edHead small{display:block;color:#cfbef4}#pvEd183 .edHead button{margin-left:auto}',
'#pvEd183 button{cursor:pointer}#pvEd183 .edFoot{border-bottom:0;border-top:1px solid #ffffff2b;justify-content:flex-end;flex-wrap:wrap}#pvEd183 .edFoot span{margin-right:auto;max-width:45%;font-size:11px;color:#e5dbfc}#pvEd183 .edFoot button,#pvEd183 .edHead button,#pvEd183 .edButtons button{border:1px solid #dac7ff81;border-radius:13px;background:#b99bff37;color:white;padding:10px 14px}',
'#pvEd183 .edFoot .edApply{background:linear-gradient(130deg,#b78aff,#7249d3);font-weight:750}#pvEd183 button:disabled{opacity:.45;cursor:default}',
'#pvEd183 .edBody{min-height:0;overflow-y:auto;padding:16px;display:grid;grid-template-columns:minmax(0,1fr) minmax(245px,1fr);gap:16px}#pvEd183 .edPreview{width:min(100%,315px);aspect-ratio:9/16;max-height:62dvh;margin:auto;position:relative;border:1px solid #e7dbff83;border-radius:23px;overflow:hidden;background:#03030d}',
'#pvEd183 .edPreview video{width:100%;height:100%;object-fit:contain}#pvEd183 .edTextOnVideo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:max-content;max-width:90%;font-weight:800;text-align:center;text-shadow:0 2px 9px black;white-space:pre-wrap;overflow-wrap:anywhere;touch-action:none;user-select:none}#pvEd183 .edTextOnVideo:empty{pointer-events:none}',
'#pvEd183 .edTools{display:flex;flex-direction:column;gap:11px}#pvEd183 section{border-radius:18px;border:1px solid #e7d8ff4a;background:#ffffff14;padding:12px}#pvEd183 section h3{margin:0 0 8px;font-size:14px}#pvEd183 section label{display:block;font-size:12px;color:#e8dcff;margin:7px 0}#pvEd183 input[type=range]{width:100%;accent-color:#caa2ff}#pvEd183 input[type=text]{width:100%;background:#17133c;border:1px solid #e8d4ff70;border-radius:10px;color:white;padding:9px}#pvEd183 .edRow{display:flex;gap:10px;align-items:center;flex-wrap:wrap}#pvEd183 .edRow img{width:55px;height:89px;object-fit:cover;background:#0b0a20;border:1px solid #ffffff4d;border-radius:9px}#pvEd183 .edInfo{font-size:11px;color:#d4c7f1}#pvEd183 .edColors{display:flex;gap:9px;margin-top:10px}#pvEd183 .edColors button{width:29px;height:29px;border-radius:50%;border:2px solid #fff8}#pvEd183 .edColors button[aria-pressed=true]{outline:2px solid #fff;outline-offset:2px}',
'.pvOpenReelEditor183{background:linear-gradient(135deg,#9663e9,#603daf)!important;border:1px solid #cda3ff!important;color:white!important;border-radius:12px!important;padding:9px 13px!important}',
'@media(max-width:700px){#pvEd183{padding:0}#pvEd183 .edCard{width:100%;max-height:100dvh;border-radius:0}#pvEd183 .edBody{grid-template-columns:1fr;padding:11px}#pvEd183 .edPreview{width:min(60vw,250px);max-height:38dvh}#pvEd183 .edFoot span{max-width:100%;flex-basis:100%}}'
].join('\n');
document.head.append(style);
const modal=document.createElement('div');modal.id='pvEd183';modal.hidden=true;
modal.innerHTML='<div class="edCard" role="dialog" aria-modal="true" aria-label="PAVORA Reel Editor Pro">'+
'<div class="edHead"><span>✦</span><div><strong>PAVORA Reel Editor Pro</strong><small>Trim · Cover · Text · Preview</small></div><button type="button" data-action="close" aria-label="Close editor">×</button></div>'+
'<div class="edBody"><div class="edPreview"><video playsinline muted controls preload="metadata"></video><div class="edTextOnVideo"></div></div><div class="edTools">'+
'<section><h3>✂ Trim Video</h3><label>Start <output id="edFromTime">0:00</output><input id="edFrom" type="range" min="0" max="100" step=".1" value="0"></label><label>End <output id="edToTime">0:00</output><input id="edTo" type="range" min="0" max="100" step=".1" value="100"></label><div class="edRow"><button type="button" data-action="play">▶ Preview trim</button><span class="edInfo" id="edDuration">Loading…</span></div></section>'+
'<section><h3>▧ Choose Cover</h3><div class="edRow"><img id="edCover" alt="Selected cover"><div style="flex:1;min-width:115px"><label>Frame <input type="range" id="edCoverTime" min="0" max="100" step=".1"></label><button type="button" data-action="cover">Use this frame</button><p class="edInfo">Selected cover preview is local. Separate cover publishing is not connected yet.</p></div></div></section>'+
'<section><h3>Aa Text Overlay</h3><label>Text<input type="text" maxlength="100" id="edText" placeholder="Your Reel text"></label><label>Font size<input type="range" min="16" max="52" id="edSize" value="28"></label><div class="edColors"><button type="button" data-color="#ffffff" style="background:white" aria-label="White" aria-pressed="true"></button><button type="button" data-color="#d3a3ff" style="background:#d3a3ff" aria-label="Purple"></button><button type="button" data-color="#ff8dc1" style="background:#ff8dc1" aria-label="Pink"></button><button type="button" data-color="#ffcf68" style="background:#ffcf68" aria-label="Gold"></button></div><p class="edInfo">Drag text to reposition it on the preview.</p></section>'+
'</div></div><div class="edFoot"><span id="edStatus" role="status">Edits are processed on your device.</span><button type="button" data-action="close">Cancel</button><button type="button" class="edApply" data-action="apply">Apply video</button></div></div>';
document.body.append(modal);
const $=s=>modal.querySelector(s),vid=$('video'),from=$('#edFrom'),to=$('#edTo'),coverRange=$('#edCoverTime'),txt=$('#edText'),size=$('#edSize'),overlay=$('.edTextOnVideo'),status=$('#edStatus'),apply=$('[data-action=apply]');
let selected=null,input=null,url=null,seconds=0,processing=false,shade='#ffffff',pos={x:.5,y:.5};
const fmt=s=>Number.isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function labels(){
 $('#edFromTime').textContent=fmt(+from.value);$('#edToTime').textContent=fmt(+to.value);
 $('#edDuration').textContent=fmt(+to.value- +from.value)+' selected / '+fmt(seconds);
}
function textPreview(){
 overlay.textContent=txt.value;overlay.style.color=shade;overlay.style.fontSize=size.value+'px';
 overlay.style.left=(pos.x*100)+'%';overlay.style.top=(pos.y*100)+'%';
}
function dismiss(){
 if(processing)return;
 vid.pause();vid.removeAttribute('src');vid.load();vid.onloadedmetadata=null;
 if(url)URL.revokeObjectURL(url);
 url=null;selected=null;input=null;modal.hidden=true;
}
function launch(file,fileInput){
 if(processing||!file||!file.type.startsWith('video/'))return;
 selected=file;input=fileInput;seconds=0;shade='#ffffff';pos={x:.5,y:.5};txt.value='';size.value=28;textPreview();
 $('#edCover').removeAttribute('src');modal.hidden=false;apply.disabled=true;status.textContent='Reading video…';
 url=URL.createObjectURL(file);vid.src=url;vid.muted=true;vid.load();
 vid.onloadedmetadata=()=>{
  seconds=vid.duration;
  if(!Number.isFinite(seconds)||seconds<=0){status.textContent='Unsupported video metadata.';return}
  for(const el of [from,to,coverRange]){el.max=seconds;el.step='.1'}
  from.value=0;to.value=seconds;coverRange.value=seconds*.2;
  labels();apply.disabled=false;status.textContent='Choose your edits and preview before applying.';
 };
 vid.onerror=()=>{status.textContent='This video cannot be decoded on your browser.';apply.disabled=true};
}
for(const el of [from,to]){
 el.addEventListener('input',()=>{
  const gap=Math.min(.2,seconds/2);
  if(el===from)from.value=Math.min(+from.value,+to.value-gap);
  else to.value=Math.max(+to.value,+from.value+gap);
  labels();vid.pause();vid.currentTime=+from.value;
 });
}
coverRange.addEventListener('input',()=>{vid.pause();vid.currentTime=+coverRange.value});
$('[data-action=cover]').onclick=()=>{
 if(!vid.videoWidth)return;
 try{
  const c=document.createElement('canvas');c.width=180;c.height=320;
  const ctx=c.getContext('2d');ctx.fillStyle='#09091a';ctx.fillRect(0,0,180,320);
  const k=Math.min(180/vid.videoWidth,320/vid.videoHeight);
  ctx.drawImage(vid,(180-vid.videoWidth*k)/2,(320-vid.videoHeight*k)/2,vid.videoWidth*k,vid.videoHeight*k);
  $('#edCover').src=c.toDataURL('image/jpeg',.75);
  status.textContent='Cover frame selected for preview. Published cover is not yet saved.';
 }catch(e){status.textContent='Frame capture is unsupported on this browser.'}
};
$('[data-action=play]').onclick=async()=>{
 if(!seconds)return;
 if(!vid.paused){vid.pause();return}
 if(vid.currentTime<+from.value||vid.currentTime>=+to.value)vid.currentTime=+from.value;
 try{await vid.play()}catch(e){status.textContent='Playback unavailable.'}
};
vid.addEventListener('timeupdate',()=>{if(!processing&&seconds&&vid.currentTime>=+to.value){vid.pause();vid.currentTime=+from.value}});
txt.oninput=textPreview;size.oninput=textPreview;
modal.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{
 shade=b.dataset.color;modal.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));textPreview();
});
let pointer=null;
overlay.addEventListener('pointerdown',e=>{if(!txt.value)return;pointer=e.pointerId;overlay.setPointerCapture(pointer);e.preventDefault()});
overlay.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;const r=$('.edPreview').getBoundingClientRect();pos={x:clamp((e.clientX-r.left)/r.width,.08,.92),y:clamp((e.clientY-r.top)/r.height,.08,.92)};textPreview()});
overlay.addEventListener('pointerup',()=>pointer=null);
overlay.addEventListener('pointercancel',()=>pointer=null);
modal.querySelectorAll('[data-action=close]').forEach(b=>b.onclick=dismiss);
const mime=()=>typeof MediaRecorder!=='undefined'?['video/webm;codecs=vp8,opus','video/webm;codecs=vp9,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x)):null;
function paint(ctx,w,h){
 ctx.fillStyle='#060614';ctx.fillRect(0,0,w,h);
 const k=Math.min(w/vid.videoWidth,h/vid.videoHeight);
 ctx.drawImage(vid,(w-vid.videoWidth*k)/2,(h-vid.videoHeight*k)/2,vid.videoWidth*k,vid.videoHeight*k);
 if(!txt.value.trim())return;
 const font=Number(size.value)*w/320;ctx.font='800 '+Math.round(font)+'px system-ui, sans-serif';ctx.fillStyle=shade;ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#000';ctx.shadowBlur=8;
 const words=txt.value.trim().split(/\s+/),lines=[''];
 for(const word of words){const l=lines.length-1,next=(lines[l]?lines[l]+' ':'')+word;if(ctx.measureText(next).width>w*.88&&lines[l])lines.push(word);else lines[l]=next}
 lines.slice(0,5).forEach((line,i)=>ctx.fillText(line,pos.x*w,pos.y*h+(i-(Math.min(lines.length,5)-1)/2)*font*1.2,w*.9));
 ctx.shadowBlur=0;
}
async function render(){
 const type=mime();
 if(!type||!HTMLCanvasElement.prototype.captureStream)throw Error('This browser cannot export edited video. Try recent Chrome desktop. Original video remains unchanged.');
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC)throw Error('Audio-preserving export is unavailable here. Original video unchanged.');
 vid.pause();const first=+from.value,last=+to.value;
 if(last-first<.2)throw Error('Select at least 0.2 seconds.');
 vid.currentTime=first;
 await new Promise((ok,no)=>{
  if(Math.abs(vid.currentTime-first)<.15&&vid.readyState>=2)return ok();
  const tid=setTimeout(()=>{vid.removeEventListener('seeked',done);no(Error('Cannot seek this video.'))},10000);
  const done=()=>{clearTimeout(tid);ok()};
  vid.addEventListener('seeked',done,{once:true});
 });
 const canvas=document.createElement('canvas'),k=Math.min(1,900/Math.max(vid.videoWidth,vid.videoHeight));
 canvas.width=Math.max(2,Math.round(vid.videoWidth*k/2)*2);canvas.height=Math.max(2,Math.round(vid.videoHeight*k/2)*2);
 const ctx=canvas.getContext('2d',{alpha:false}),capture=canvas.captureStream(24),audio=new AC(),dest=audio.createMediaStreamDestination();
 let raf=0,timer=0,stopped=false,recorder=null;
 try{
  const source=audio.createMediaElementSource(vid);source.connect(dest);
  if(!dest.stream.getAudioTracks().length)throw Error('Sound cannot be preserved by this browser.');
  const stream=new MediaStream([...capture.getVideoTracks(),...dest.stream.getAudioTracks()]);
  recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:2100000,audioBitsPerSecond:96000});
  const chunks=[];
  const complete=new Promise((ok,no)=>{
   recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
   recorder.onerror=e=>no(e.error||Error('Encoder error'));
   recorder.onstop=()=>chunks.length?ok(new File([new Blob(chunks,{type:'video/webm'})],(selected.name||'reel').replace(/\.[^.]+$/,'')+'-edited.webm',{type:'video/webm'})):no(Error('No video produced'));
  });
  const frame=()=>{
   if(stopped)return;
   try{paint(ctx,canvas.width,canvas.height)}catch(e){}
   if(vid.currentTime>=last||vid.ended){stopped=true;vid.pause();if(recorder.state==='recording')recorder.stop();return}
   raf=requestAnimationFrame(frame);
  };
  recorder.start(400);frame();
  timer=setTimeout(()=>{if(!stopped){stopped=true;if(recorder.state==='recording')recorder.stop()}},Math.ceil((last-first+7)*1000));
  await audio.resume();await vid.play();
  return await complete;
 }finally{
  stopped=true;cancelAnimationFrame(raf);clearTimeout(timer);vid.pause();capture.getTracks().forEach(t=>t.stop());audio.close().catch(()=>{});
 }
}
apply.onclick=async()=>{
 if(processing||!selected||!input||!seconds)return;
 processing=true;apply.disabled=true;status.textContent='Rendering video locally… Keep editor open.';
 try{
  const unchanged=+from.value<.1&&seconds- +to.value<.1&&!txt.value.trim();
  const file=unchanged?selected:await render();
  const dt=new DataTransfer();dt.items.add(file);
  input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  processing=false;dismiss();
 }catch(e){status.textContent=e.message||'Export failed; original video remains selected.';processing=false;apply.disabled=false}
};
function attach(){
 const card=document.querySelector('.pvUnifiedCreate'),inputEl=card?.querySelector('.pvUnifiedFile'),buttons=card?.querySelector('.pvCreateButtons');
 if(!inputEl||!buttons)return false;
 if(buttons.querySelector('.pvOpenReelEditor183'))return true;
 const button=document.createElement('button');button.type='button';button.className='pvOpenReelEditor183';button.textContent='✦ Edit Reel Pro';
 const sync=()=>{button.hidden=!inputEl.files?.[0]?.type?.startsWith('video/')};
 button.onclick=()=>launch(inputEl.files[0],inputEl);
 inputEl.addEventListener('change',sync);buttons.insertBefore(button,buttons.firstChild);sync();return true;
}
if(!attach()){
 const obs=new MutationObserver(()=>{if(attach())obs.disconnect()});obs.observe(document.body,{subtree:true,childList:true});
}
window.PAVORA_REEL_EDITOR={open:launch,version:'183'};
})();