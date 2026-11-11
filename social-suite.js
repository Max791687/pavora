/* PAVORA Social Suite — isolated enhancements. No external JS dependencies. */
(()=>{
'use strict';
const kit=window.PVKit;if(!kit)return;
const db=kit.db,owner=()=>kit.getUser();
const el=(tag,cls='',value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
const info=e=>alert(e?.message||String(e));
const imageUrl=(bucket,path)=>db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
const modal=el('div','pvSuiteModal');modal.hidden=true;modal.innerHTML='<div class="pvSuiteBox"><button class="pvSuiteClose" type="button" aria-label="Close">×</button><h3 class="pvSuiteTitle"></h3><div class="pvSuiteBody"></div></div>';
let pvStopStoryWatcher=()=>{};
document.body.append(modal);modal.querySelector('.pvSuiteClose').onclick=()=>{pvStopStoryWatcher();modal.hidden=true;modal.querySelectorAll('video').forEach(v=>v.pause())};modal.addEventListener('click',e=>{if(e.target===modal){pvStopStoryWatcher();modal.hidden=true;modal.querySelectorAll('video').forEach(v=>v.pause())}});
function open(title){pvStopStoryWatcher();modal.querySelector('.pvSuiteTitle').textContent=title;const body=modal.querySelector('.pvSuiteBody');body.replaceChildren();modal.hidden=false;return body}
async function save(kind,id,button){const user=owner();if(!user)return;button.disabled=true;const key=kind==='reel'?'reel_id':'post_id';try{const {data,error}=await db.from('saved_media').select(key).eq('user_id',user.id).eq(key,id).maybeSingle();if(error)throw error;const r=data?await db.from('saved_media').delete().eq('user_id',user.id).eq(key,id):await db.from('saved_media').insert({user_id:user.id,[key]:id});if(r.error)throw r.error;if(button.classList.contains('pvSuiteIconAction')){button.innerHTML=icon('bookmark',!data)+'<span class="pvSuiteCount"></span>';button.classList.toggle('pvSuiteIsSaved',!data)}else button.textContent=data?'☆ Save':'★ Saved'}catch(e){alert('Saved feature needs supabase/social-suite.sql: '+e.message)}finally{button.disabled=false}}
function saveButton(kind,id){const b=el('button','pvSuiteSave','☆ Save');b.type='button';b.onclick=()=>save(kind,id,b);if(owner())db.from('saved_media').select('user_id').eq('user_id',owner().id).eq(kind==='reel'?'reel_id':'post_id',id).maybeSingle().then(({data})=>{if(data)b.textContent='★ Saved'});return b}
const icon=(name,filled=false)=>{const paths={
heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
comment:'<path d="M20.8 11.5a8.8 8.8 0 0 1-9.1 8.9 9.5 9.5 0 0 1-4-.8L3 21l1.4-4.4A8.7 8.7 0 0 1 3 11.5 8.8 8.8 0 0 1 12 2.7a8.8 8.8 0 0 1 8.8 8.8Z"/>',
bookmark:'<path d="M6 3.5h12a1 1 0 0 1 1 1V22l-7-5.1L5 22V4.5a1 1 0 0 1 1-1Z"/>'
};return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="'+(filled?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>'};
kit.addPostSave=(post,foot)=>foot.append(saveButton('post',post.id));
kit.addReel=(reel,actions,video)=>{
const user=owner();if(!user)return;
const area=el('div','pvSuiteReelActions'),
like=el('button','pvSuiteIconAction'),comments=el('button','pvSuiteIconAction'),views=el('span','pvSuiteCount pvSuiteViews','0 views'),
bookmark=el('button','pvSuiteIconAction');

function decorate(button,name,count=''){button.type='button';button.innerHTML=icon(name)+'<span class="pvSuiteCount"></span>';button.querySelector('.pvSuiteCount').textContent=count;button.title=name==='heart'?'Like Reel':name==='comment'?'Comment on Reel':'Save Reel';button.setAttribute('aria-label',button.title)}
decorate(like,'heart','0');decorate(comments,'comment','0');decorate(bookmark,'bookmark','');
area.append(like,comments);
const nativeShare=Array.from(actions.querySelectorAll('.pvReelAction')).find(b=>b.title==='Share reel');
if(nativeShare){nativeShare.classList.add('pvSuiteIconAction','pvSuiteShare');area.append(nativeShare)}
area.append(bookmark);
const nativeMore=Array.from(actions.querySelectorAll('.pvReelAction')).find(b=>b.title==='More options'||b.title==='Block account');
if(nativeMore){nativeMore.classList.add('pvSuiteIconAction','pvSuiteMore');area.append(nativeMore)}
area.append(views);actions.prepend(area);
bookmark.onclick=()=>save('reel',reel.id,bookmark);
function setSaved(on){bookmark.innerHTML=icon('bookmark',on)+'<span class="pvSuiteCount"></span>';bookmark.classList.toggle('pvSuiteIsSaved',on);bookmark.setAttribute('aria-label',on?'Remove saved Reel':'Save Reel');bookmark.title=bookmark.getAttribute('aria-label')}

const refresh=async()=>{const [likes,comm,v]=await Promise.all([db.from('reel_likes').select('user_id').eq('reel_id',reel.id),db.from('reel_comments').select('id,body,user_id,created_at').eq('reel_id',reel.id).order('created_at',{ascending:false}).limit(80),db.from('reel_views').select('*',{count:'exact',head:true}).eq('reel_id',reel.id)]);if(likes.error){like.title='Run supabase/social-suite.sql';return}const mine=(likes.data||[]).some(x=>x.user_id===user.id);like.innerHTML=icon('heart',mine)+'<span class="pvSuiteCount">'+(likes.data||[]).length+'</span>';like.classList.toggle('pvSuiteIsLiked',mine);comments.querySelector('.pvSuiteCount').textContent=(comm.data||[]).length;views.textContent=(v.count||0)+' views';return {mine,comments:comm.data||[]}};
like.onclick=async()=>{like.disabled=true;try{const existing=await db.from('reel_likes').select('user_id').eq('reel_id',reel.id).eq('user_id',user.id).maybeSingle();if(existing.error)throw existing.error;const result=existing.data?await db.from('reel_likes').delete().eq('user_id',user.id).eq('reel_id',reel.id):await db.from('reel_likes').insert({user_id:user.id,reel_id:reel.id});if(result.error)throw result.error;await refresh()}catch(e){info(e)}finally{like.disabled=false}};
comments.onclick=async()=>{const body=open('Reel comments'),list=el('div','pvSuiteCommentList'),form=el('form','pvSuiteCommentForm'),input=el('input'),send=el('button','','Post');input.required=true;input.maxLength=500;input.placeholder='Write a comment';form.append(input,send);body.append(list,form);const draw=async()=>{const result=await refresh();if(!result){list.textContent='Run supabase/social-suite.sql to enable comments.';return}list.replaceChildren();for(const comment of result.comments)list.append(el('div','pvSuiteComment',comment.body));if(!result.comments.length)list.append(el('p','','No comments yet.'))};form.onsubmit=async e=>{e.preventDefault();send.disabled=true;const result=await db.from('reel_comments').insert({reel_id:reel.id,user_id:user.id,body:input.value.trim()});send.disabled=false;if(result.error)return info(result.error);input.value='';draw()};draw()};
// Only the currently playing Reel requests its statistics and saved status.
// A feed of 40 reels previously triggered 160+ requests before playback.
let viewed=false,statsLoaded=false,lastStatsRefresh=0,watchSeconds=0,lastWatchTime=0,lastWatchReported=0;
function pvCommitWatchProgress(){
 if(watchSeconds<3||watchSeconds-lastWatchReported<3)return;
 lastWatchReported=watchSeconds;
 const completed=Number.isFinite(video.duration)&&video.duration>0
  &&(watchSeconds>=video.duration*.8||video.currentTime>=video.duration*.85);
 window.PAVORA_SMART_REELS?.recordWatch(db,user.id,reel.id,watchSeconds,completed);
}
video.addEventListener('pause',pvCommitWatchProgress);
video.addEventListener('ended',pvCommitWatchProgress);
video.addEventListener('play',()=>{
 const now=Date.now();lastWatchTime=video.currentTime||0;
 if(now-lastStatsRefresh>10000){
  lastStatsRefresh=now;refresh().catch(e=>console.warn('Reel stats:',e));
 }
 if(!statsLoaded){
  statsLoaded=true;
  db.from('saved_media').select('reel_id').eq('user_id',user.id).eq('reel_id',reel.id).maybeSingle().then(({data})=>setSaved(!!data)).catch(()=>{});
 }
});
video.addEventListener('timeupdate',()=>{
 if(viewed||video.paused||document.hidden||!video.isConnected)return;
 const current=video.currentTime||0;
 const delta=current-lastWatchTime;lastWatchTime=current;
 if(delta>0&&delta<1.5){watchSeconds+=delta;if(watchSeconds-lastWatchReported>=10)pvCommitWatchProgress()}
 // Require meaningful playback rather than counting a failed autoplay attempt.
 if(watchSeconds<2&&!(video.duration>0&&video.duration<2&&watchSeconds>=video.duration*.75))return;
 viewed=true;
 db.from('reel_views').upsert({user_id:user.id,reel_id:reel.id,last_viewed_at:new Date().toISOString()},{onConflict:'user_id,reel_id'})
 .then(({error})=>{if(error){console.warn('Reel view recording:',error.message);viewed=false;return}return refresh()})
 .catch(e=>{viewed=false;console.warn('Reel statistics:',e)});
});
video.addEventListener('seeked',()=>{lastWatchTime=video.currentTime||0});

};
kit.addSavedTab=panel=>{if(!panel)return;const tabs=panel.querySelector('.pvTabs');if(!tabs||tabs.querySelector('.pvSavedTab'))return;const b=el('button','pvSavedTab','☆ SAVED');b.type='button';tabs.append(b);b.onclick=async()=>{tabs.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const grid=document.getElementById('pvPostGrid');grid.replaceChildren(el('p','','Loading saved items…'));const user=owner();if(!user)return;const {data,error}=await db.from('saved_media').select('post_id,reel_id').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100);if(error){grid.textContent='Run supabase/social-suite.sql first: '+error.message;return}const ids=(data||[]).filter(x=>x.post_id).map(x=>x.post_id),rids=(data||[]).filter(x=>x.reel_id).map(x=>x.reel_id);const [p,r]=await Promise.all([ids.length?db.from('posts').select('id,caption,image_path').in('id',ids):{data:[]},rids.length?db.from('reels').select('id,caption,video_path').in('id',rids):{data:[]}]);grid.replaceChildren();for(const x of p.data||[]){const tile=el('button','pvTile'),img=el('img');img.src=imageUrl('post-images',x.image_path);tile.append(img);tile.onclick=()=>{const body=open('Saved post'),photo=el('img','pvSuiteMedia');photo.src=img.src;body.append(photo,el('p','',x.caption||''),saveButton('post',x.id))};grid.append(tile)}for(const x of r.data||[]){const tile=el('button','pvTile'),vid=el('video');vid.src=imageUrl('reel-videos',x.video_path);vid.preload='metadata';vid.muted=true;tile.append(vid,el('span','pvSuiteVideoBadge','▶'));tile.onclick=()=>{const body=open('Saved Reel'),video=el('video','pvSuiteMedia');video.src=vid.src;video.controls=true;video.autoplay=true;body.append(video,el('p','',x.caption||''),saveButton('reel',x.id))};grid.append(tile)}if(!grid.children.length)grid.append(el('p','pvNoPosts','Nothing saved yet.'))};
};
kit.addSavedTab(document.querySelector('#profile > .panel'));
for(const id of ['pvAllMediaTab','pvReelsMediaTab'])document.getElementById(id)?.addEventListener('click',()=>document.querySelector('.pvSavedTab')?.classList.remove('active'));

// Real 24-hour stories: upload, viewer, view count, automatic expiration.
let stories=[];

const pvStoryExtraStyle=el('style');pvStoryExtraStyle.textContent="\n.pvStoryAudience{padding:12px;background:#2b2534;border:1px solid #554062;border-radius:12px;color:#fff;display:grid;gap:7px;font-weight:700;font-size:13px}\n.pvStoryAudience select{background:#211b29;color:#fff;border:1px solid #685678;padding:11px;border-radius:10px;font:inherit}\n.pvStoryHighlightBtn{border:1px solid #795e91!important;background:#45304f!important;border-radius:12px!important;padding:12px 15px!important;color:#f5e6ff!important}\n.pvHighlights{margin:15px 0;padding:10px 1px}.pvHighlights h3{font-size:16px;margin:4px 0 12px}.pvHighlightsRow{display:flex;gap:14px;overflow-x:auto;padding:4px 0 10px}\n.pvHighlightItem{display:flex;flex-direction:column;gap:5px;align-items:center;flex:0 0 76px;color:inherit;background:none;border:0;cursor:pointer}\n.pvHighlightCover{height:66px;width:66px;display:grid;place-items:center;overflow:hidden;border-radius:50%;border:2px solid #9c6ad5;background:#372447;font-weight:900;font-size:22px}\n.pvHighlightCover img{width:100%;height:100%;object-fit:cover}.pvHighlightItem small{font-size:11px;max-width:76px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}\n.pvCloseFriendRow{display:flex;gap:11px;align-items:center;padding:12px 4px;border-bottom:1px solid #413548}\n.pvCloseFriendRow strong{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:13px}\n.pvCloseFriendRow button{background:#7044a0;color:white;border:0;padding:9px 12px;border-radius:9px;cursor:pointer}\n.pvCloseFriendRow button.active{background:#49334d;color:#eed6f5}\n";document.head.append(pvStoryExtraStyle);
const pvStoryComposerStyle=el('style');
pvStoryComposerStyle.textContent="\n.pvSuiteModal.pvStoryComposerModal{background:rgba(0,0,0,.8);backdrop-filter:blur(8px)}\n.pvStoryComposerModal .pvSuiteBox{width:min(480px,calc(100vw - 28px));padding:0;background:#222329;border:1px solid #393942;border-radius:22px;max-height:92dvh;box-shadow:0 28px 90px #000b;scrollbar-width:thin}\n.pvStoryComposerModal .pvSuiteTitle{text-align:center;font-size:18px;letter-spacing:-.3px;margin:0;border-bottom:1px solid #343640;padding:21px 48px}\n.pvStoryComposerModal .pvSuiteClose{right:12px;top:12px;width:38px;height:38px;display:grid;place-items:center;font-size:24px;border-radius:50%;background:#30313a;z-index:3}\n.pvStoryComposerModal .pvSuiteBody{padding:20px;gap:13px}\n.pvStoryUploadDrop{width:100%;min-height:236px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:13px;border:1.5px dashed #665a75;border-radius:16px;background:linear-gradient(135deg,#302639,#1b1b24);cursor:pointer;overflow:hidden;outline:none}\n.pvStoryUploadDrop:hover,.pvStoryUploadDrop:focus-visible{border-color:#cf92f4}\n.pvStoryUploadGlyph{width:73px;height:73px;border-radius:22px;background:#3e304f;display:grid;place-items:center;font-size:32px;color:#dfb5ff}\n.pvStoryUploadDrop strong{color:#fff;font-size:15px}\n.pvStoryUploadDrop small{color:#b9b1c4;font-size:12px;text-align:center;line-height:1.6}\n.pvStoryUploadDrop.has-file{min-height:290px;border-style:solid;background:#111116}\n.pvStoryUploadDrop.has-file .pvStoryUploadGlyph,.pvStoryUploadDrop.has-file strong,.pvStoryUploadDrop.has-file small{display:none}\n.pvStoryPreview{width:100%;height:300px;max-height:42dvh;object-fit:contain;border-radius:13px;background:#101015}\n.pvStoryReplace{font-size:12px;color:#d6afff;text-align:center;cursor:pointer}\n.pvStoryComposerModal .pvSuiteBody .pvStoryCaption{box-sizing:border-box;min-height:78px;max-height:140px;width:100%;resize:vertical;border:1px solid #504b5b;border-radius:12px;background:#2d2a36;color:white;padding:13px 14px;outline:none;font-size:14px;font:inherit}\n.pvStoryCaption:focus{border-color:#c18ced}\n.pvStoryFooter{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:#bfb7c7}\n.pvStoryComposerModal .pvSuiteBody .pvStoryShareBtn{width:100%;min-height:49px;border:0;border-radius:12px;background:linear-gradient(105deg,#844ded,#b266d9);color:#fff;font-weight:800;font-size:14px}\n.pvStoryShareBtn:disabled{opacity:.48;cursor:not-allowed}\n.pvStoryFeedback{color:#cca5ee;line-height:1.45;font-size:12px;text-align:center;margin:0;min-height:18px;overflow-wrap:anywhere}\n.pvStoryHiddenInput{display:none!important}\n@media(max-width:600px){.pvStoryComposerModal .pvSuiteBody{padding:16px}.pvStoryUploadDrop{min-height:216px}.pvStoryPreview{height:260px}}\n";
document.head.append(pvStoryComposerStyle);
const launch=async()=>{
 if(!owner())return;
 const body=open('Create story');
 modal.classList.add('pvStoryComposerModal');
 const input=el('input','pvStoryHiddenInput');
 input.type='file';input.accept='image/jpeg,image/png,image/webp,video/*';
 const picker=el('div','pvStoryUploadDrop'),glyph=el('span','pvStoryUploadGlyph','▧');
 picker.tabIndex=0;picker.setAttribute('role','button');picker.setAttribute('aria-label','Choose photo or video');
 picker.append(glyph,el('strong','','Choose photo or video'),el('small','','Share your moment · Large videos automatically optimized'));
 const change=el('div','pvStoryReplace','Tap preview to choose another file');change.hidden=true;
 const caption=el('textarea','pvStoryCaption');caption.placeholder='Add a caption (optional)…';caption.maxLength=500;
 const footer=el('div','pvStoryFooter'),counter=el('span','','0 / 500');
 footer.append(el('span','','◷ Visible for 24 hours'),counter);
 const audienceLabel=el('label','pvStoryAudience','Story audience'),audience=el('select');
 for(const [value,title] of [['everyone','Everyone allowed to see my Stories'],['close_friends','★ Close Friends only']]){const opt=el('option','',title);opt.value=value;audience.append(opt)}
 audienceLabel.append(audience);
 const friendsManage=el('button','','Manage Close Friends');friendsManage.type='button';friendsManage.style.cssText='color:#d6aaff;background:none;border:0;font-size:12px;cursor:pointer;text-align:left';
 friendsManage.onclick=()=>pvOpenCloseFriends();
 const submit=el('button','pvStoryShareBtn','Share to your story');submit.disabled=true;
 const feedback=el('p','pvStoryFeedback','');
 body.append(input,picker,change,caption,audienceLabel,friendsManage,footer,submit,feedback);
 let selected=null,objectUrl=null,busy=false;
 const reset=()=>{
  if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}
  modal.classList.remove('pvStoryComposerModal');
 };
 const close=modal.querySelector('.pvSuiteClose'),previous=close.onclick;
 const onBackdrop=e=>{if(e.target!==modal||busy)return;reset();close.onclick=previous;modal.removeEventListener('click',onBackdrop);modal.hidden=true};
 close.onclick=()=>{if(busy)return;reset();close.onclick=previous;modal.removeEventListener('click',onBackdrop);previous()};
 modal.addEventListener('click',onBackdrop);
 input.onchange=()=>{
  const file=input.files?.[0];if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)&&!file.type.startsWith('video/')){feedback.textContent='Choose JPG, PNG, WebP or a browser-supported video.';return}
  if(objectUrl)URL.revokeObjectURL(objectUrl);
  objectUrl=URL.createObjectURL(file);selected=file;
  const preview=el(file.type.startsWith('video/')?'video':'img','pvStoryPreview');
  preview.src=objectUrl;
  if(file.type.startsWith('video/')){preview.controls=true;preview.muted=true;preview.playsInline=true;preview.preload='metadata'}
  picker.replaceChildren(preview);picker.classList.add('has-file');
  change.hidden=false;submit.disabled=false;feedback.textContent=file.name;
 };
 picker.onclick=e=>{if(!busy&&!e.target.closest('video'))input.click()};
 picker.onkeydown=e=>{if(!busy&&(e.key==='Enter'||e.key===' ')){e.preventDefault();input.click()}};
 change.onclick=()=>{if(!busy)input.click()};
 caption.oninput=()=>{counter.textContent=caption.value.length+' / 500'};
 submit.onclick=async()=>{
  if(!selected||busy||!owner())return;
  busy=true;submit.disabled=true;submit.textContent='Sharing…';feedback.textContent='Uploading your story…';
  try{
   const uploadFile=selected.type.startsWith('video/')?await window.PAVORA_VIDEO.prepare(selected,status=>{feedback.textContent=status}):selected;
   if(uploadFile.size>50*1024*1024)throw Error('File exceeds the 50 MB upload limit.');
   feedback.textContent='Uploading your story ('+(uploadFile.size/1048576).toFixed(1)+' MB)…';
   const path=owner().id+'/'+crypto.randomUUID()+'/'+uploadFile.name.replace(/[^a-zA-Z0-9.-]/g,'_');
   const audienceValue=audience.value;
   if(audienceValue==='close_friends'){
    const {count,error:friendError}=await db.from('close_friends').select('friend_id',{count:'exact',head:true}).eq('owner_id',owner().id);
    if(friendError)throw friendError;
    if(!count)throw Error('Add at least one Close Friend in Settings first.');
   }
   const bucket=audienceValue==='close_friends'?'pv-close-stories':'story-media';
   await window.PAVORA_UPLOAD.upload(db,bucket,path,uploadFile,{onStatus:status=>{feedback.textContent=status}});
   const saved=await db.from('stories').insert({author_id:owner().id,media_path:path,media_type:selected.type.startsWith('video/')?'video':'image',caption:caption.value.trim(),audience:audienceValue});
   if(saved.error){await db.storage.from(bucket).remove([path]);throw saved.error}
   reset();close.onclick=previous;modal.removeEventListener('click',onBackdrop);modal.hidden=true;
   await kit.renderStories(document.getElementById('stories'),{force:true});
  }catch(err){feedback.textContent='Upload failed: '+err.message}
  finally{busy=false;submit.textContent='Share to your story';submit.disabled=!selected}
 };
};


const pvOwnStoryStyle=el('style');
pvOwnStoryStyle.textContent=`
#stories .pvStoryMine{position:relative;overflow:visible;background:#efe3ff;color:#573276}
#stories .pvStoryMine img{border-radius:50%;overflow:hidden}
#stories .pvStoryMinePlus{position:absolute;right:-5px;bottom:-3px;display:grid;place-items:center;
 width:21px;height:21px;background:#8d43df;color:#fff;font:800 15px/1 system-ui,sans-serif;
 border:2px solid #fff;border-radius:50%;box-shadow:0 2px 5px #55357830}
#stories .pvStoryMine.pvStoryIsActive{border:3px solid #bd4ee4}
`;
document.head.append(pvOwnStoryStyle);
const pvViewStyle=el('style');pvViewStyle.textContent="\n.pvLiveViews{padding:15px;background:#26212e;border:1px solid #43364e;border-radius:14px;margin:7px 0}\n.pvLiveViewsTop{display:flex;justify-content:space-between;align-items:center;gap:12px}\n.pvLiveViewsTop strong{font-size:17px}.pvLiveViewsTop strong span{color:#d9afff;font-variant-numeric:tabular-nums}\n.pvLiveViewsTop small{color:#bca4d3;font-size:11px}\n.pvLiveViewList{display:flex;flex-direction:column;max-height:290px;overflow:auto;margin-top:10px}\n.pvLiveViewRow{display:flex;align-items:center;gap:11px;padding:11px 2px;border-bottom:1px solid #403648}\n.pvLiveViewRow:last-child{border-bottom:0}\n.pvLiveViewAvatar{height:39px;width:39px;flex:none;display:grid;place-items:center;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,#8852dd,#c85d9f);font-weight:800}\n.pvLiveViewAvatar img{width:100%;height:100%;object-fit:cover}\n.pvLiveViewIdentity{flex:1;min-width:0}.pvLiveViewIdentity strong{display:block;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pvLiveViewIdentity small{display:block;font-size:11px;color:#b9aac9}\n.pvLiveViewTime{white-space:nowrap;color:#ad9dbd;font-size:11px}.pvLiveViewEmpty{color:#bba9cf;font-size:12px;line-height:1.6;padding:16px 3px}\n";document.head.append(pvViewStyle);
const pvPlaybackStyle=el('style');pvPlaybackStyle.textContent=".pvStoryControls{display:flex;flex-direction:column;gap:9px}.pvStoryBars{display:flex;gap:4px}.pvStoryTrack{height:3px;flex:1;background:#ffffff50;border-radius:3px;overflow:hidden}.pvStoryFill{display:block;background:#fff;height:100%;width:0}.pvStoryNav{display:flex;justify-content:space-between;gap:10px}.pvStoryNav button{border-radius:999px!important;font-size:12px!important}.pvStoryNav button:disabled{opacity:.4}.pvStoryHoldHint{text-align:center;color:#b8aac8;font-size:11px}";document.head.append(pvPlaybackStyle);
const showStory=async story=>{
 const viewer=owner();if(!viewer)return;
 const body=open('Story'),media=el(story.media_type==='video'?'video':'img','pvSuiteMedia');
 if(story.audience==='close_friends'){
  const {data,error}=await db.storage.from('pv-close-stories').createSignedUrl(story.media_path,600);
  if(error||!data?.signedUrl){body.append(el('p','','This private story cannot be loaded: '+(error?.message||'Access denied')));return}
  media.src=data.signedUrl;
 }else media.src=imageUrl('story-media',story.media_path);
 if(story.media_type==='video'){media.controls=true;media.autoplay=true;media.playsInline=true}
 const sequence=stories.filter(x=>x.author_id===story.author_id).slice().reverse();
 const currentIndex=Math.max(0,sequence.findIndex(x=>x.id===story.id));
 const controls=el('div','pvStoryControls'),bars=el('div','pvStoryBars'),fills=[];
 sequence.forEach((x,i)=>{const track=el('div','pvStoryTrack'),fill=el('span','pvStoryFill');track.append(fill);bars.append(track);fills.push(fill)});
 const nav=el('div','pvStoryNav'),prev=el('button','','← Previous'),next=el('button','','Next →');
 prev.disabled=currentIndex===0;prev.type=next.type='button';
 let progressTimer=null,seconds=0,holding=false,activePlayback=true;
 const stopPlayback=()=>{activePlayback=false;if(progressTimer)clearInterval(progressTimer);if(media.tagName==='VIDEO')media.pause()};
 const travel=step=>{
  if(!activePlayback)return;
  const target=currentIndex+step;
  if(step<0&&target<0)return;
  stopPlayback();
  if(target<sequence.length){showStory(sequence[target]);return}
  const authorOrder=[...new Set(stories.map(x=>x.author_id))];
  const followingAuthor=authorOrder[authorOrder.indexOf(story.author_id)+1];
  const nextStory=followingAuthor?stories.filter(x=>x.author_id===followingAuthor).slice().reverse()[0]:null;
  if(nextStory)showStory(nextStory);else{pvStopStoryWatcher();modal.hidden=true}
 };
 prev.onclick=()=>travel(-1);next.onclick=()=>travel(1);
 nav.append(prev,el('small','',String(currentIndex+1)+' / '+sequence.length),next);
 controls.append(bars,media,nav,el('span','pvStoryHoldHint','Hold photo or video to pause'));
 body.append(controls);
 if(story.caption)body.append(el('p','',story.caption));
 // The account owner keeps their story and live audience list open.
 const viewerOwnsStory=story.author_id===viewer.id;
 function tick(){
  if(!activePlayback||modal.hidden||!controls.isConnected)return;
  if(document.hidden||holding||viewerOwnsStory)return;
  const duration=media.tagName==='VIDEO'&&Number.isFinite(media.duration)&&media.duration>0?Math.min(120,media.duration):5;
  seconds=media.tagName==='VIDEO'?media.currentTime:seconds+0.05;
  fills.forEach((fill,i)=>{fill.style.width=(i<currentIndex?100:i>currentIndex?0:Math.min(100,seconds/duration*100))+'%'});
  if(seconds>=duration)travel(1);
 }
 fills.forEach((fill,i)=>{fill.style.width=(i<currentIndex?100:0)+'%'});
 progressTimer=setInterval(tick,50);
 media.addEventListener('pointerdown',()=>{holding=true;if(media.tagName==='VIDEO')media.pause()});
 const release=()=>{if(!holding)return;holding=false;if(media.tagName==='VIDEO')media.play().catch(()=>{})};
 for(const event of ['pointerup','pointercancel','pointerleave'])media.addEventListener(event,release);
 if(media.tagName==='VIDEO'){media.controls=false;media.onended=()=>{if(!viewerOwnsStory)travel(1)};media.play().catch(()=>{media.controls=true})}
 pvStopStoryWatcher=stopPlayback;
 if(story.author_id!==viewer.id){
  // Archived Highlights remain viewable, but their 24-hour Story view window
  // is over. Do not attempt an INSERT the database must reject.
  if(new Date(story.expires_at).getTime()<=Date.now()){
   const label=el('p','pvStoryViewReceipt','★ Highlight');
   label.style.cssText='text-align:center;color:#d9b5fc;font-size:12px';
   body.append(label);
   const report=el('button','pvSuiteSave','⚑ Report Highlight');
   report.type='button';report.onclick=()=>{pvStopStoryWatcher();modal.hidden=true;media.pause?.();window.PAVORAReport?.('story',story.id)};
   body.append(report);
   return;
  }
  // Each signed-in account counts once. Keep a visible result so failures
  // aren't silently hidden in DevTools and mistaken for a recorded view.
  const indicator=el('p','pvStoryViewReceipt','Recording your view…');
  indicator.style.cssText='font-size:12px;color:#c4b6d6;text-align:center;margin:4px 0';
  body.append(indicator);
  try{
   const {error}=await db.from('story_views').insert({story_id:story.id,viewer_id:viewer.id});
   if(error&&error.code!=='23505')throw error;
   indicator.textContent='✓ View recorded';
   indicator.style.color='#a6dfbd';
  }catch(err){
   indicator.textContent='View not recorded: '+(err?.message||'Network issue')+'. Please try again.';
   indicator.style.color='#ff9caf';
   console.warn('Story view could not be recorded:',err);
  }
  const report=el('button','pvSuiteSave','⚑ Report Story');report.type='button';
  report.onclick=()=>{pvStopStoryWatcher();modal.hidden=true;media.pause?.();window.PAVORAReport?.('story',story.id)};
  body.append(report);
  return;
 }
 const panel=el('section','pvLiveViews'),top=el('div','pvLiveViewsTop');
 const label=el('strong','','Views: '),count=el('span','','0'),status=el('small','','Connecting…'),list=el('div','pvLiveViewList');
 label.append(count);top.append(label,status);panel.append(top,list);body.append(panel);
 list.append(el('p','pvLiveViewEmpty','No viewers yet. When someone watches, their account will appear here.'));
 let running=true,timer=null,debounce=null,channel=null,loading=false;
 const active=()=>running&&!modal.hidden&&owner()?.id===viewer.id&&document.body.contains(panel);
 const sync=async()=>{
  if(!active()||loading)return;
  loading=true;
  try{
   const {data,error,count:total}=await db.from('story_views').select('viewer_id,viewed_at',{count:'exact'}).eq('story_id',story.id).order('viewed_at',{ascending:false}).limit(150);
   if(error)throw error;
   if(!active())return;
   count.textContent=String(total??(data||[]).length);
   const viewers=data||[],ids=[...new Set(viewers.map(x=>x.viewer_id))];
   const result=ids.length?await db.from('profiles').select('id,username,display_name,avatar_url').in('id',ids):{data:[],error:null};
   if(!active())return;
   const people=new Map((result.data||[]).map(p=>[p.id,p])),fragment=document.createDocumentFragment();
   for(const v of viewers){
    const p=people.get(v.viewer_id)||{},row=el('div','pvLiveViewRow'),avatar=el('div','pvLiveViewAvatar');
    if(p.avatar_url){const img=el('img');img.src=p.avatar_url;img.alt='';img.loading='lazy';avatar.append(img)}
    else avatar.textContent=(p.display_name||p.username||'?')[0].toUpperCase();
    const info=el('div','pvLiveViewIdentity');
    info.append(el('strong','',p.display_name||p.username||'PAVORA user'),el('small','','@'+(p.username||'user')));
    const time=el('span','pvLiveViewTime',new Date(v.viewed_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));
    row.append(avatar,info,time);fragment.append(row);
   }
   if(!viewers.length)fragment.append(el('p','pvLiveViewEmpty','No views yet. When someone watches, their account will appear here.'));
   list.replaceChildren(fragment);status.textContent='● Live';
  }catch(e){if(active()){status.textContent='Reconnecting…';console.warn('Story viewers:',e.message)}}
  finally{loading=false}
 };
 const schedule=()=>{if(debounce)clearTimeout(debounce);debounce=setTimeout(()=>{debounce=null;sync()},160)};
 const stop=()=>{
  if(!running)return;running=false;
  if(timer)clearInterval(timer);if(debounce)clearTimeout(debounce);
  if(channel){const old=channel;channel=null;try{db.removeChannel(old).catch(()=>{})}catch(e){}}
 };
 pvStopStoryWatcher=()=>{stop();stopPlayback()};
 if(db.channel){
  channel=db.channel('pavora-story-views-'+story.id);
  channel.on('postgres_changes',{event:'INSERT',schema:'public',table:'story_views',filter:'story_id=eq.'+story.id},schedule);
  channel.subscribe(state=>{if(!active())return;if(state==='SUBSCRIBED')schedule();else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT')status.textContent='Reconnecting…'});
 }
 timer=setInterval(()=>{if(active()&&!document.hidden)sync()},5000);
 sync();
 const highlight=el('button','pvStoryHighlightBtn',story.is_highlighted?'★ Remove from Highlights':'☆ Add to Highlights');
 highlight.type='button';
 highlight.onclick=async()=>{
  const next=!story.is_highlighted;
  const title=next?prompt('Highlight title (up to 40 characters)',story.highlight_title||'Highlights'):null;
  if(next&&title===null)return;
  highlight.disabled=true;
  const {error}=await db.from('stories').update({is_highlighted:next,highlight_title:next?(title||'Highlights').slice(0,40):''}).eq('id',story.id).eq('author_id',viewer.id);
  highlight.disabled=false;
  if(error)return info(error);
  story.is_highlighted=next;story.highlight_title=next?(title||'Highlights').slice(0,40):'';
  highlight.textContent=next?'★ Remove from Highlights':'☆ Add to Highlights';
  pvRenderHighlights(document.querySelector('#profile > .panel'),viewer.id);
 };
 body.append(highlight);
 const del=el('button','pvSuiteSave','Delete story');del.onclick=async()=>{
  if(!confirm('Delete this story?'))return;
  const result=await db.from('stories').delete().eq('id',story.id).eq('author_id',viewer.id);
  if(result.error)return info(result.error);
  stop();modal.hidden=true;kit.renderStories(document.getElementById('stories'),{force:true});
 };
 body.append(del);
};

let pvStoriesPromise=null,pvStoriesLastCheck=0,pvStoriesSignature='',pvStoriesUserId=null;
kit.renderStories=async(bar,opts={})=>{
 const person=owner();
 if(!person||!bar)return;
 if(pvStoriesUserId!==person.id){pvStoriesSignature='';pvStoriesLastCheck=0;pvStoriesUserId=person.id}
 if(pvStoriesPromise)return pvStoriesPromise;
 if(!opts.force&&pvStoriesLastCheck&&Date.now()-pvStoriesLastCheck<20000&&bar.childElementCount)return;
 pvStoriesPromise=(async()=>{
  const {data,error}=await db.from('stories').select('id,author_id,media_path,media_type,caption,created_at,expires_at,audience,is_highlighted,highlight_title').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(75);
  if(error){console.warn('Stories unavailable:',error.message);return}
  const nextStories=(data||[]).filter(x=>new Date(x.expires_at).getTime()>Date.now());
  const people=[...new Set(nextStories.map(x=>x.author_id))];
  const {data:profiles,error:profileError}=people.length?await db.from('profiles').select('id,username,avatar_url').in('id',people):{data:[],error:null};
  if(profileError)console.warn('Stories profile info:',profileError.message);
  const names=new Map((profiles||[]).map(p=>[p.id,p]));
  // Your Story always uses the current account's real profile picture,
  // even when there is no active Story (so that user is absent from 'people').
  if(!names.has(person.id)){
   const {data:selfProfile,error:selfError}=await db.from('profiles')
    .select('id,username,avatar_url').eq('id',person.id).maybeSingle();
   if(!selfError&&selfProfile)names.set(person.id,selfProfile);
  }
  const signature=JSON.stringify({user:person.id,stories:nextStories.map(x=>[x.id,x.author_id,x.media_path]),profiles:[...names.values()].map(p=>[p.id,p.username,p.avatar_url])});
  stories=nextStories;
  pvStoriesLastCheck=Date.now();
  if(signature===pvStoriesSignature&&bar.childElementCount)return;
  const fragment=document.createDocumentFragment();
  const myActiveStory=nextStories.find(x=>x.author_id===person.id)||null;
  const add=el('button','pvStoryAdd'),circle=el('span','pvStoryAvatar pvStoryMine');
  const myDetails=names.get(person.id)||{};
  if(myDetails.avatar_url){
   const img=el('img');img.src=myDetails.avatar_url;img.alt='Your profile picture';
   img.onerror=()=>{img.remove();circle.textContent=(myDetails.username||'?')[0].toUpperCase()};
   circle.append(img);
  }else circle.textContent=(myDetails.username||'?')[0].toUpperCase();
  if(myActiveStory)circle.classList.add('pvStoryIsActive');
  else{
   const plus=el('span','pvStoryMinePlus','+');
   circle.append(plus);
  }
  add.append(circle,el('small','','Your story'));
  add.onclick=()=>myActiveStory?showStory(myActiveStory):launch();
  fragment.append(add);
  const grouped=new Set([person.id]);
  for(const x of stories){
   if(grouped.has(x.author_id))continue;
   grouped.add(x.author_id);
   const p=names.get(x.author_id)||{},button=el('button','pvStoryAdd'),avatar=el('span','pvStoryAvatar');
   if(p.avatar_url){const im=el('img');im.src=p.avatar_url;avatar.append(im)}
   else avatar.textContent=(p.username||'?')[0].toUpperCase();
   button.append(avatar,el('small','',x.author_id===person.id?'You':p.username||'Story'));
   button.onclick=()=>showStory(x);fragment.append(button);
  }
  // One atomic update; existing story thumbnails are preserved if nothing changed.
  if(owner()?.id===person.id){bar.replaceChildren(fragment);pvStoriesSignature=signature}
 })();
 try{return await pvStoriesPromise}finally{pvStoriesPromise=null}
};
kit.onNavigate=view=>{if(view==='home')kit.renderStories(document.getElementById('stories'))};

async function pvOpenCloseFriends(){
 const person=owner();if(!person)return;
 const body=open('★ Close Friends');modal.classList.remove('pvStoryComposerModal');
 body.append(el('p','','Only people you choose can view your Close Friends Stories. People are not notified when you add or remove them.'));
 const list=el('div','');list.append(el('p','','Loading people…'));body.append(list);
 const [people,members]=await Promise.all([
  db.from('profiles').select('id,username,display_name').neq('id',person.id).order('username').limit(150),
  db.from('close_friends').select('friend_id').eq('owner_id',person.id)
 ]);
 if(modal.hidden||!list.isConnected)return;
 list.replaceChildren();
 if(people.error||members.error){list.append(el('p','','Unable to load: '+(people.error||members.error).message));return}
 const chosen=new Set((members.data||[]).map(m=>m.friend_id));
 for(const p of people.data||[]){
  const row=el('div','pvCloseFriendRow'),name=el('strong','',(p.display_name||p.username)+' (@'+p.username+')'),button=el('button');
  const render=()=>{button.textContent=chosen.has(p.id)?'✓ Added':'+ Add';button.classList.toggle('active',chosen.has(p.id))};
  render();button.onclick=async()=>{
   button.disabled=true;
   const adding=!chosen.has(p.id);
   const result=adding?await db.from('close_friends').insert({owner_id:person.id,friend_id:p.id})
    :await db.from('close_friends').delete().eq('owner_id',person.id).eq('friend_id',p.id);
   if(result.error)info(result.error);else{if(adding)chosen.add(p.id);else chosen.delete(p.id);render()}
   button.disabled=false;
  };
  row.append(name,button);list.append(row);
 }
 if(!people.data?.length)list.append(el('p','','No other PAVORA accounts yet.'));
}
async function pvRenderHighlights(panel,profileId){
 if(!panel||!profileId||!owner())return;
 let section=panel.querySelector('.pvHighlights');
 if(!section){section=el('section','pvHighlights');const tabs=panel.querySelector('.pvTabs');if(tabs)tabs.before(section);else panel.append(section)}
 if(!section.isConnected)return;
 const {data,error}=await db.from('stories').select('id,author_id,media_path,media_type,caption,created_at,expires_at,audience,is_highlighted,highlight_title').eq('author_id',profileId).eq('is_highlighted',true).order('created_at',{ascending:false}).limit(60);
 if(!section.isConnected)return;
 section.replaceChildren();
 if(error){section.append(el('p','','Highlights unavailable: '+error.message));return}
 if(!data?.length){if(profileId===owner().id)section.append(el('p','','No Highlights yet. Open your Story and choose Add to Highlights.'));return}
 section.append(el('h3','','Story Highlights'));
 const row=el('div','pvHighlightsRow'),group=new Map();
 for(const item of data){const title=item.highlight_title||'Highlights';if(!group.has(title))group.set(title,[]);group.get(title).push(item)}
 for(const [title,items] of group){
  const b=el('button','pvHighlightItem'),cover=el('span','pvHighlightCover','★');
  const first=items[0];
  if(first.media_type==='image'&&first.audience!=='close_friends'){const img=el('img');img.alt='';img.src=imageUrl('story-media',first.media_path);cover.replaceChildren(img)}
  b.append(cover,el('small','',title));b.onclick=()=>{
   // Keep highlight sequence independent from the 24-hour active Story row.
   const active=stories;stories=items.slice().reverse();
   showStory(items[items.length-1]).finally(()=>{stories=active});
  };
  row.append(b);
 }
 section.append(row);
}
kit.openCloseFriends=pvOpenCloseFriends;
kit.renderHighlights=pvRenderHighlights;

kit.init=async()=>{kit.addSavedTab(document.querySelector('#profile > .panel'));await kit.renderStories(document.getElementById('stories'));pvRenderHighlights(document.querySelector('#profile > .panel'),owner()?.id)};

})();
