/* PAVORA private browser-to-browser voice and video calls (WebRTC). */
(()=>{
'use strict';
const kit=window.PVKit;if(!kit)return;const db=kit.db,owner=()=>kit.getUser();
const el=(tag,cls='',txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x};
const overlay=el('div','pvCallOverlay');overlay.hidden=true;const box=el('section','pvCallBox'),head=el('h3','','PAVORA Call'),status=el('p','pvCallStatus',''),remote=el('video','pvCallVideo'),local=el('video','pvCallLocal'),buttons=el('div','pvCallButtons'),accept=el('button','pvCallAccept','Accept'),decline=el('button','pvCallDecline','Decline'),end=el('button','pvCallEnd','End call');
remote.autoplay=true;remote.playsInline=true;local.autoplay=true;local.muted=true;local.playsInline=true;
const remoteAudio=el('audio','pvCallRemoteAudio'),playAudio=el('button','pvCallPlayAudio','🔊 Tap to hear call');
remoteAudio.autoplay=true;remoteAudio.playsInline=true;playAudio.type='button';playAudio.hidden=true;
playAudio.onclick=async()=>{try{await (current?.kind==='video'?remote:remoteAudio).play();playAudio.hidden=true;updateStatus('Audio playing')}catch(err){updateStatus('Audio playback blocked. Check silent mode / browser permissions.')}};
remote.setAttribute('aria-label','Remote video');local.setAttribute('aria-label','Your camera preview');buttons.append(accept,decline,end);box.append(head,status,remote,remoteAudio,playAudio,local,buttons);overlay.append(box);document.body.append(overlay);
let current=null,peer=null,mic=null,poll=null,seen=new Set(),requestInFlight=false,connectionTimer=null,callSession=0,ringTimer=null,callSubscription=null;
const mute=el('button','pvCallMute','🎙 Mute'),camera=el('button','pvCallCamera','📷 Camera off');
mute.type=camera.type='button';mute.hidden=camera.hidden=true;buttons.append(mute,camera);
mute.onclick=()=>{if(!mic)return;const tracks=mic.getAudioTracks();if(!tracks.length)return;const enabled=!tracks[0].enabled;tracks.forEach(t=>t.enabled=enabled);mute.textContent=enabled?'🎙 Mute':'🔇 Unmute';mute.setAttribute('aria-pressed',String(!enabled))};
camera.onclick=()=>{if(!mic)return;const tracks=mic.getVideoTracks();if(!tracks.length)return;const enabled=!tracks[0].enabled;tracks.forEach(t=>t.enabled=enabled);camera.textContent=enabled?'📷 Camera off':'📷 Camera on';camera.setAttribute('aria-pressed',String(!enabled))};
function clearRingTimer(){if(ringTimer){clearTimeout(ringTimer);ringTimer=null}}
function scheduleRingTimeout(id){clearRingTimer();ringTimer=setTimeout(async()=>{if(current?.id!==id||current?.status==='accepted')return;updateStatus('No answer · Call timed out');await finish(true)},60000)}
const updateStatus=t=>status.textContent=t;
function pvCallErrorMessage(err,kind){
const name=err?.name||'',message=String(err?.message||'');
if(['NotFoundError','DevicesNotFoundError','OverconstrainedError'].includes(name)||/Requested device not found|device not found/i.test(message))return kind==='video'?'Microphone ya camera nahi mil raha. Windows Settings → Privacy & security → Microphone/Camera mein access ON karo, aur device connect karke dobara try karo.':'Microphone detect nahi ho raha. Mic/headset connect karo, Windows Settings → Privacy & security → Microphone mein access ON karo, phir Chrome address bar ke site settings mein Microphone Allow karo.';
if(['NotAllowedError','PermissionDeniedError','SecurityError'].includes(name))return 'Browser ne microphone/camera permission block ki hai. Chrome mein address bar ke left site controls → Site settings → Microphone/Camera → Allow karke dobara try karo.';
if(['NotReadableError','TrackStartError'].includes(name))return 'Microphone/camera kisi doosre app mein busy ho sakta hai. Zoom, Teams ya recorder band karke dobara try karo.';
if(['AbortError'].includes(name))return 'Device start nahi ho paya. Mic/camera reconnect karke try karo.';
if(/call_signals|schema cache|relation|permission denied|row-level security/i.test(message))return 'Supabase calling setup complete nahi hai. supabase/social-suite.sql ko SQL Editor mein Run karo. Details: '+message;
return 'Call start nahi hua: '+message;
}
async function waitICE(pc){if(pc.iceGatheringState==='complete')return;await new Promise(resolve=>{const timeout=setTimeout(done,18000);function done(){clearTimeout(timeout);pc.removeEventListener('icegatheringstatechange',check);resolve()}function check(){if(pc.iceGatheringState==='complete')done()}pc.addEventListener('icegatheringstatechange',check)})}
function resetUI(){overlay.hidden=true;mute.hidden=camera.hidden=true;mute.textContent='🎙 Mute';camera.textContent='📷 Camera off';remote.srcObject=null;remoteAudio.srcObject=null;remoteAudio.pause();playAudio.hidden=true;local.srcObject=null;local.hidden=true;accept.hidden=true;decline.hidden=true;end.hidden=false}
async function finish(notify=true){const id=current?.id;callSession++;clearRingTimer();if(connectionTimer){clearTimeout(connectionTimer);connectionTimer=null}current=null;if(peer){peer.oniceconnectionstatechange=null;peer.onconnectionstatechange=null;peer.ontrack=null;peer.close();peer=null}if(mic){for(const t of mic.getTracks())t.stop();mic=null}resetUI();if(notify&&id){const r=await db.from('call_signals').update({status:'ended',updated_at:new Date().toISOString()}).eq('id',id).in('status',['ringing','accepted']);if(r.error)console.warn('Call end failed:',r.error.message)}}
async function prepare(kind){
if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection)throw Error('Calls need HTTPS and microphone/camera permission.');
mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:kind==='video'});
const servers=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
// Optional TURN servers must be obtained from a provider; STUN alone won't work on all networks.
if(Array.isArray(window.PAVORA_TURN_SERVERS))servers.push(...window.PAVORA_TURN_SERVERS);
peer=new RTCPeerConnection({iceServers:servers,iceCandidatePoolSize:1});
const thisPeer=peer;mic.getTracks().forEach(t=>peer.addTrack(t,mic));local.srcObject=mic;local.hidden=kind!=='video';remote.hidden=kind!=='video';mute.hidden=false;camera.hidden=kind!=='video';
peer.ontrack=e=>{
const stream=e.streams?.[0]||new MediaStream([e.track]);
if(kind==='audio'){remoteAudio.srcObject=stream;remoteAudio.play().then(()=>{playAudio.hidden=true}).catch(()=>{playAudio.hidden=false;updateStatus('Connected — tap speaker to hear audio')})}
else{remote.srcObject=stream;remote.play().catch(()=>{playAudio.hidden=false;playAudio.textContent='▶ Play incoming video/audio'})}
};
peer.onconnectionstatechange=()=>{
if(peer!==thisPeer)return;
if(thisPeer.connectionState==='connected'){clearRingTimer();if(current)current.status='accepted';if(connectionTimer){clearTimeout(connectionTimer);connectionTimer=null}updateStatus('Connected · '+(kind==='video'?'Video':'Voice')+' call');if((kind==='video'?remote:remoteAudio).paused){playAudio.hidden=false;playAudio.textContent='🔊 Tap to hear call'}}
else if(thisPeer.connectionState==='failed'){updateStatus('Connection failed. Some mobile networks need a TURN relay.');setTimeout(()=>{if(peer===thisPeer&&thisPeer.connectionState==='failed')finish(true)},4000)}
else if(thisPeer.connectionState==='disconnected'){updateStatus('Connection temporarily interrupted — reconnecting…');if(connectionTimer)clearTimeout(connectionTimer);connectionTimer=setTimeout(()=>{if(peer===thisPeer&&thisPeer.connectionState==='disconnected'){updateStatus('Call disconnected. Please try again.');finish(true)}},8000)}
};
peer.oniceconnectionstatechange=()=>{if(peer!==thisPeer)return;console.info('PAVORA call ICE:',thisPeer.iceConnectionState)};
}

kit.addCallActions=(recipient,header)=>{if(!owner()||header.querySelector('.pvCallActionGroup'))return;const wrap=el('div','pvCallActionGroup');for(const [kind,label] of [['audio','☎'],['video','▣']]){const b=el('button','pvCallAction',label);b.type='button';b.title=kind==='audio'?'Voice call':'Video call';b.setAttribute('aria-label',b.title);b.onclick=()=>start(recipient,kind);wrap.append(b)}header.append(wrap)};
async function start(recipient,kind){if(!owner())return;if(recipient===owner().id)return alert('You cannot call yourself.');if(current)return alert('Finish your current call first.');const session=++callSession;overlay.hidden=false;head.textContent=kind==='video'?'Video call':'Voice call';updateStatus('Requesting microphone'+(kind==='video'?' and camera':'')+'…');accept.hidden=decline.hidden=true;end.hidden=false;try{await prepare(kind);if(session!==callSession)return;const offer=await peer.createOffer();await peer.setLocalDescription(offer);await waitICE(peer);if(session!==callSession)return;const result=await db.from('call_signals').insert({caller_id:owner().id,callee_id:recipient,kind,status:'ringing',offer_sdp:JSON.stringify(peer.localDescription)}).select('id,caller_id,callee_id,kind,status,offer_sdp,answer_sdp').single();if(result.error)throw result.error;if(session!==callSession){await db.from('call_signals').update({status:'ended'}).eq('id',result.data.id);return;}current=result.data;updateStatus('Calling… Waiting for answer');scheduleRingTimeout(current.id);}catch(e){await finish(false);alert(pvCallErrorMessage(e,kind))}}
async function pollCall(){if(!owner()||requestInFlight)return;requestInFlight=true;try{
if(current?.id){const {data,error}=await db.from('call_signals').select('id,status,answer_sdp,caller_id,callee_id,kind,offer_sdp').eq('id',current.id).maybeSingle();if(error)throw error;if(!data||['ended','declined'].includes(data.status)){await finish(false);return}if(data.status==='accepted'){clearRingTimer();if(current)current.status='accepted';}
if(data.caller_id===owner().id&&data.status==='accepted'&&data.answer_sdp&&peer&&!peer.currentRemoteDescription){await peer.setRemoteDescription(JSON.parse(data.answer_sdp));updateStatus('Connecting peer-to-peer…')}
return}
const {data,error}=await db.from('call_signals').select('id,caller_id,callee_id,kind,status,offer_sdp').eq('callee_id',owner().id).eq('status','ringing').gt('created_at',new Date(Date.now()-120000).toISOString()).order('created_at',{ascending:false}).limit(1);
if(error){console.warn('Calling setup:',error.message);return}
const incoming=data?.[0];if(incoming&&!seen.has(incoming.id)){seen.add(incoming.id);current=incoming;overlay.hidden=false;try{window.focus()}catch{};head.textContent='Incoming '+incoming.kind+' call';updateStatus('Someone is calling you');accept.hidden=decline.hidden=false;end.hidden=true;remote.hidden=incoming.kind!=='video';local.hidden=true;scheduleRingTimeout(incoming.id)}
}catch(e){console.warn('Call update:',e)}finally{requestInFlight=false}}
accept.onclick=async()=>{if(!current||!owner())return;accept.disabled=true;const id=current.id,kind=current.kind,session=callSession;try{updateStatus('Connecting…');await prepare(current.kind);if(session!==callSession)return;await peer.setRemoteDescription(JSON.parse(current.offer_sdp));const answer=await peer.createAnswer();await peer.setLocalDescription(answer);await waitICE(peer);if(session!==callSession)return;const {data,error}=await db.from('call_signals').update({answer_sdp:JSON.stringify(peer.localDescription),status:'accepted',updated_at:new Date().toISOString()}).eq('id',id).eq('callee_id',owner().id).eq('status','ringing').select('id').maybeSingle();if(error)throw error;if(!data)throw Error('This call was already ended or answered on another device.');clearRingTimer();current.status='accepted';accept.hidden=decline.hidden=true;end.hidden=false;updateStatus('Connecting peer-to-peer…')}catch(e){await finish(true);alert(pvCallErrorMessage(e,kind))}finally{accept.disabled=false}};
decline.onclick=async()=>{if(!current)return;const id=current.id;const {error}=await db.from('call_signals').update({status:'declined',updated_at:new Date().toISOString()}).eq('id',id).eq('callee_id',owner().id);if(error)console.warn('Decline failed',error.message);await finish(false)};
end.onclick=()=>finish(true);
const originalInit=kit.init;kit.init=async()=>{if(originalInit)await originalInit();if(poll)clearInterval(poll);poll=setInterval(pollCall,1800);pollCall()};
window.addEventListener('load',()=>{if(owner()&&!poll)kit.init().catch(e=>console.warn('Call bootstrap:',e))},{once:true});
// An open authenticated app can answer calls. Browsers suspend scripts when fully closed.
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&owner())pollCall()});
const originalCleanup=kit.cleanup;kit.cleanup=()=>{if(originalCleanup)originalCleanup();if(poll){clearInterval(poll);poll=null}finish(true)};
})();
