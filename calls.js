/* PAVORA private browser-to-browser voice and video calls (WebRTC). */
(()=>{
'use strict';
const kit=window.PVKit;if(!kit)return;const db=kit.db,owner=()=>kit.getUser();
const el=(tag,cls='',txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x};
const overlay=el('div','pvCallOverlay');overlay.hidden=true;const box=el('section','pvCallBox'),head=el('h3','','PAVORA Call'),status=el('p','pvCallStatus',''),remote=el('video','pvCallVideo'),local=el('video','pvCallLocal'),buttons=el('div','pvCallButtons'),accept=el('button','pvCallAccept','Accept'),decline=el('button','pvCallDecline','Decline'),end=el('button','pvCallEnd','End call');
remote.autoplay=true;remote.playsInline=true;local.autoplay=true;local.muted=true;local.playsInline=true;
const remoteAudio=el('audio','pvCallRemoteAudio'),playAudio=el('button','pvCallPlayAudio','🔊 Tap to hear call');
remoteAudio.autoplay=true;remoteAudio.playsInline=true;playAudio.type='button';playAudio.hidden=true;
playAudio.onclick=async()=>{try{await remoteAudio.play();playAudio.hidden=true;updateStatus('Audio playing')}catch(err){updateStatus('Audio playback blocked. Check silent mode / browser permissions.')}};
remote.setAttribute('aria-label','Remote video');local.setAttribute('aria-label','Your camera preview');buttons.append(accept,decline,end);box.append(head,status,remote,remoteAudio,playAudio,local,buttons);overlay.append(box);document.body.append(overlay);
let current=null,peer=null,mic=null,poll=null,seen=new Set(),requestInFlight=false,connectionTimer=null,callSession=0;
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
function resetUI(){overlay.hidden=true;remote.srcObject=null;remoteAudio.srcObject=null;remoteAudio.pause();playAudio.hidden=true;local.srcObject=null;local.hidden=true;accept.hidden=true;decline.hidden=true;end.hidden=false}
async function finish(notify=true){const id=current?.id;callSession++;if(connectionTimer){clearTimeout(connectionTimer);connectionTimer=null}current=null;if(peer){peer.oniceconnectionstatechange=null;peer.close();peer=null}if(mic){for(const t of mic.getTracks())t.stop();mic=null}resetUI();if(notify&&id){const r=await db.from('call_signals').update({status:'ended',updated_at:new Date().toISOString()}).eq('id',id);if(r.error)console.warn('Call end failed:',r.error.message)}}
async function prepare(kind){
if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection)throw Error('Calls need HTTPS and microphone/camera permission.');
mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:kind==='video'});
const servers=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
// Optional TURN servers must be obtained from a provider; STUN alone won't work on all networks.
if(Array.isArray(window.PAVORA_TURN_SERVERS))servers.push(...window.PAVORA_TURN_SERVERS);
peer=new RTCPeerConnection({iceServers:servers,iceCandidatePoolSize:1});
const thisPeer=peer;mic.getTracks().forEach(t=>peer.addTrack(t,mic));local.srcObject=mic;local.hidden=kind!=='video';remote.hidden=kind!=='video';
peer.ontrack=e=>{
const stream=e.streams?.[0]||new MediaStream([e.track]);
if(kind==='audio'){remoteAudio.srcObject=stream;remoteAudio.play().then(()=>{playAudio.hidden=true}).catch(()=>{playAudio.hidden=false;updateStatus('Connected — tap speaker to hear audio')})}
else{remote.srcObject=stream;remote.play().catch(()=>{playAudio.hidden=false;playAudio.textContent='▶ Play incoming video/audio'})}
};
peer.onconnectionstatechange=()=>{
if(peer!==thisPeer)return;
if(thisPeer.connectionState==='connected'){if(connectionTimer){clearTimeout(connectionTimer);connectionTimer=null}updateStatus('Connected · '+(kind==='video'?'Video':'Voice')+' call');playAudio.hidden=false;playAudio.textContent='🔊 Audio';}
else if(thisPeer.connectionState==='failed')updateStatus('Unable to connect peer-to-peer. Try both phones on the same Wi-Fi; other networks may need a TURN server.');
else if(thisPeer.connectionState==='disconnected'){updateStatus('Connection temporarily interrupted — reconnecting…');if(connectionTimer)clearTimeout(connectionTimer);connectionTimer=setTimeout(()=>{if(peer===thisPeer&&thisPeer.connectionState==='disconnected')updateStatus('Connection still interrupted. Try same Wi-Fi or use a TURN relay.')},8000)}
};
peer.oniceconnectionstatechange=()=>{if(peer!==thisPeer)return;console.info('PAVORA call ICE:',thisPeer.iceConnectionState)};
}

kit.addCallActions=(recipient,header)=>{if(!owner()||header.querySelector('.pvCallActionGroup'))return;const wrap=el('div','pvCallActionGroup');for(const [kind,label] of [['audio','☎'],['video','▣']]){const b=el('button','pvCallAction',label);b.type='button';b.title=kind==='audio'?'Voice call':'Video call';b.setAttribute('aria-label',b.title);b.onclick=()=>start(recipient,kind);wrap.append(b)}header.append(wrap)};
async function start(recipient,kind){if(!owner())return;if(current)return alert('Finish your current call first.');overlay.hidden=false;head.textContent=kind==='video'?'Video call':'Voice call';updateStatus('Requesting microphone'+(kind==='video'?' and camera':'')+'…');accept.hidden=decline.hidden=true;end.hidden=false;try{await prepare(kind);const offer=await peer.createOffer();await peer.setLocalDescription(offer);await waitICE(peer);const result=await db.from('call_signals').insert({caller_id:owner().id,callee_id:recipient,kind,status:'ringing',offer_sdp:JSON.stringify(peer.localDescription)}).select('id,caller_id,callee_id,kind,status,offer_sdp,answer_sdp').single();if(result.error)throw result.error;current=result.data;updateStatus('Calling… Waiting for answer');}catch(e){await finish(false);alert(pvCallErrorMessage(e,kind))}}
async function pollCall(){if(!owner()||document.hidden||requestInFlight)return;requestInFlight=true;try{
if(current?.id){const {data,error}=await db.from('call_signals').select('id,status,answer_sdp,caller_id,callee_id,kind,offer_sdp').eq('id',current.id).maybeSingle();if(error)throw error;if(!data||['ended','declined'].includes(data.status)){await finish(false);return}
if(data.caller_id===owner().id&&data.status==='accepted'&&data.answer_sdp&&peer&&!peer.currentRemoteDescription){await peer.setRemoteDescription(JSON.parse(data.answer_sdp));updateStatus('Connecting peer-to-peer…')}
return}
const {data,error}=await db.from('call_signals').select('id,caller_id,callee_id,kind,status,offer_sdp').eq('callee_id',owner().id).eq('status','ringing').gt('created_at',new Date(Date.now()-120000).toISOString()).order('created_at',{ascending:false}).limit(1);
if(error){console.warn('Calling setup:',error.message);return}
const incoming=data?.[0];if(incoming&&!seen.has(incoming.id)){seen.add(incoming.id);current=incoming;overlay.hidden=false;head.textContent='Incoming '+incoming.kind+' call';updateStatus('Someone is calling you');accept.hidden=decline.hidden=false;end.hidden=true;remote.hidden=incoming.kind!=='video';local.hidden=true}
}catch(e){console.warn('Call update:',e)}finally{requestInFlight=false}}
accept.onclick=async()=>{if(!current||!owner())return;accept.disabled=true;const id=current.id,kind=current.kind;try{updateStatus('Connecting…');await prepare(current.kind);await peer.setRemoteDescription(JSON.parse(current.offer_sdp));const answer=await peer.createAnswer();await peer.setLocalDescription(answer);await waitICE(peer);const {error}=await db.from('call_signals').update({answer_sdp:JSON.stringify(peer.localDescription),status:'accepted',updated_at:new Date().toISOString()}).eq('id',id).eq('callee_id',owner().id);if(error)throw error;accept.hidden=decline.hidden=true;end.hidden=false;updateStatus('Connecting peer-to-peer…')}catch(e){await finish(true);alert(pvCallErrorMessage(e,kind))}finally{accept.disabled=false}};
decline.onclick=async()=>{if(!current)return;const id=current.id;const {error}=await db.from('call_signals').update({status:'declined',updated_at:new Date().toISOString()}).eq('id',id).eq('callee_id',owner().id);if(error)console.warn('Decline failed',error.message);await finish(false)};
end.onclick=()=>finish(true);
const originalInit=kit.init;kit.init=async()=>{if(originalInit)await originalInit();if(poll)clearInterval(poll);poll=setInterval(pollCall,3500);pollCall()};
window.addEventListener('load',()=>{if(owner()&&!poll)kit.init().catch(e=>console.warn('Call bootstrap:',e))},{once:true});
const originalCleanup=kit.cleanup;kit.cleanup=()=>{if(originalCleanup)originalCleanup();if(poll){clearInterval(poll);poll=null}finish(false)};
})();
