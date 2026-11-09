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
let seen=false;
video.addEventListener('play',()=>{
 if(seen)return;
 seen=true;
 db.from('saved_media').select('reel_id').eq('user_id',user.id).eq('reel_id',reel.id).maybeSingle().then(({data})=>setSaved(!!data)).catch(()=>{});
 db.from('reel_views').upsert({user_id:user.id,reel_id:reel.id,last_viewed_at:new Date().toISOString()},{onConflict:'user_id,reel_id'})
 .then(()=>refresh()).catch(e=>console.warn('Reel statistics:',e));
});

};
kit.addSavedTab=panel=>{if(!panel)return;const tabs=panel.querySelector('.pvTabs');if(!tabs||tabs.querySelector('.pvSavedTab'))return;const b=el('button','pvSavedTab','☆ SAVED');b.type='button';tabs.append(b);b.onclick=async()=>{tabs.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const grid=document.getElementById('pvPostGrid');grid.replaceChildren(el('p','','Loading saved items…'));const user=owner();if(!user)return;const {data,error}=await db.from('saved_media').select('post_id,reel_id').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100);if(error){grid.textContent='Run supabase/social-suite.sql first: '+error.message;return}const ids=(data||[]).filter(x=>x.post_id).map(x=>x.post_id),rids=(data||[]).filter(x=>x.reel_id).map(x=>x.reel_id);const [p,r]=await Promise.all([ids.length?db.from('posts').select('id,caption,image_path').in('id',ids):{data:[]},rids.length?db.from('reels').select('id,caption,video_path').in('id',rids):{data:[]}]);grid.replaceChildren();for(const x of p.data||[]){const tile=el('button','pvTile'),img=el('img');img.src=imageUrl('post-images',x.image_path);tile.append(img);tile.onclick=()=>{const body=open('Saved post'),photo=el('img','pvSuiteMedia');photo.src=img.src;body.append(photo,el('p','',x.caption||''),saveButton('post',x.id))};grid.append(tile)}for(const x of r.data||[]){const tile=el('button','pvTile'),vid=el('video');vid.src=imageUrl('reel-videos',x.video_path);vid.preload='metadata';vid.muted=true;tile.append(vid,el('span','pvSuiteVideoBadge','▶'));tile.onclick=()=>{const body=open('Saved Reel'),video=el('video','pvSuiteMedia');video.src=vid.src;video.controls=true;video.autoplay=true;body.append(video,el('p','',x.caption||''),saveButton('reel',x.id))};grid.append(tile)}if(!grid.children.length)grid.append(el('p','pvNoPosts','Nothing saved yet.'))};
};
kit.addSavedTab(document.querySelector('#profile > .panel'));
for(const id of ['pvAllMediaTab','pvReelsMediaTab'])document.getElementById(id)?.addEventListener('click',()=>document.querySelector('.pvSavedTab')?.classList.remove('active'));

// Real 24-hour stories: upload, viewer, view count, automatic expiration.
let stories=[];

const pvStoryComposerStyle=el('style');
pvStoryComposerStyle.textContent="\n.pvSuiteModal.pvStoryComposerModal{background:rgba(0,0,0,.8);backdrop-filter:blur(8px)}\n.pvStoryComposerModal .pvSuiteBox{width:min(480px,calc(100vw - 28px));padding:0;background:#222329;border:1px solid #393942;border-radius:22px;max-height:92dvh;box-shadow:0 28px 90px #000b;scrollbar-width:thin}\n.pvStoryComposerModal .pvSuiteTitle{text-align:center;font-size:18px;letter-spacing:-.3px;margin:0;border-bottom:1px solid #343640;padding:21px 48px}\n.pvStoryComposerModal .pvSuiteClose{right:12px;top:12px;width:38px;height:38px;display:grid;place-items:center;font-size:24px;border-radius:50%;background:#30313a;z-index:3}\n.pvStoryComposerModal .pvSuiteBody{padding:20px;gap:13px}\n.pvStoryUploadDrop{width:100%;min-height:236px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:13px;border:1.5px dashed #665a75;border-radius:16px;background:linear-gradient(135deg,#302639,#1b1b24);cursor:pointer;overflow:hidden;outline:none}\n.pvStoryUploadDrop:hover,.pvStoryUploadDrop:focus-visible{border-color:#cf92f4}\n.pvStoryUploadGlyph{width:73px;height:73px;border-radius:22px;background:#3e304f;display:grid;place-items:center;font-size:32px;color:#dfb5ff}\n.pvStoryUploadDrop strong{color:#fff;font-size:15px}\n.pvStoryUploadDrop small{color:#b9b1c4;font-size:12px;text-align:center;line-height:1.6}\n.pvStoryUploadDrop.has-file{min-height:290px;border-style:solid;background:#111116}\n.pvStoryUploadDrop.has-file .pvStoryUploadGlyph,.pvStoryUploadDrop.has-file strong,.pvStoryUploadDrop.has-file small{display:none}\n.pvStoryPreview{width:100%;height:300px;max-height:42dvh;object-fit:contain;border-radius:13px;background:#101015}\n.pvStoryReplace{font-size:12px;color:#d6afff;text-align:center;cursor:pointer}\n.pvStoryComposerModal .pvSuiteBody .pvStoryCaption{box-sizing:border-box;min-height:78px;max-height:140px;width:100%;resize:vertical;border:1px solid #504b5b;border-radius:12px;background:#2d2a36;color:white;padding:13px 14px;outline:none;font-size:14px;font:inherit}\n.pvStoryCaption:focus{border-color:#c18ced}\n.pvStoryFooter{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:#bfb7c7}\n.pvStoryComposerModal .pvSuiteBody .pvStoryShareBtn{width:100%;min-height:49px;border:0;border-radius:12px;background:linear-gradient(105deg,#844ded,#b266d9);color:#fff;font-weight:800;font-size:14px}\n.pvStoryShareBtn:disabled{opacity:.48;cursor:not-allowed}\n.pvStoryFeedback{color:#cca5ee;line-height:1.45;font-size:12px;text-align:center;margin:0;min-height:18px;overflow-wrap:anywhere}\n.pvStoryHiddenInput{display:none!important}\n@media(max-width:600px){.pvStoryComposerModal .pvSuiteBody{padding:16px}.pvStoryUploadDrop{min-height:216px}.pvStoryPreview{height:260px}}\n";
document.head.append(pvStoryComposerStyle);
const launch=async()=>{
 if(!owner())return;
 const body=open('Create story');
 modal.classList.add('pvStoryComposerModal');
 const input=el('input','pvStoryHiddenInput');
 input.type='file';input.accept='image/jpeg,image/png,image/webp,video/mp4,video/webm';
 const picker=el('div','pvStoryUploadDrop'),glyph=el('span','pvStoryUploadGlyph','▧');
 picker.tabIndex=0;picker.setAttribute('role','button');picker.setAttribute('aria-label','Choose photo or video');
 picker.append(glyph,el('strong','','Choose photo or video'),el('small','','Share your moment · Photos and videos up to 50 MB'));
 const change=el('div','pvStoryReplace','Tap preview to choose another file');change.hidden=true;
 const caption=el('textarea','pvStoryCaption');caption.placeholder='Add a caption (optional)…';caption.maxLength=500;
 const footer=el('div','pvStoryFooter'),counter=el('span','','0 / 500');
 footer.append(el('span','','◷ Visible for 24 hours'),counter);
 const submit=el('button','pvStoryShareBtn','Share to your story');submit.disabled=true;
 const feedback=el('p','pvStoryFeedback','');
 body.append(input,picker,change,caption,footer,submit,feedback);
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
  if(!['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(file.type)){feedback.textContent='Choose a JPG, PNG, WebP, MP4 or WebM file.';return}
  if(file.size>50*1024*1024){feedback.textContent='Maximum story size is 50 MB.';return}
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
   const path=owner().id+'/'+crypto.randomUUID()+'/'+selected.name.replace(/[^a-zA-Z0-9.-]/g,'_');
   const result=await db.storage.from('story-media').upload(path,selected,{contentType:selected.type});
   if(result.error)throw result.error;
   const saved=await db.from('stories').insert({author_id:owner().id,media_path:path,media_type:selected.type.startsWith('video/')?'video':'image',caption:caption.value.trim()});
   if(saved.error)throw saved.error;
   reset();close.onclick=previous;modal.removeEventListener('click',onBackdrop);modal.hidden=true;
   await kit.renderStories(document.getElementById('stories'),{force:true});
  }catch(err){feedback.textContent='Upload failed: '+err.message}
  finally{busy=false;submit.textContent='Share to your story';submit.disabled=!selected}
 };
};


const pvViewStyle=el('style');pvViewStyle.textContent="\n.pvLiveViews{padding:15px;background:#26212e;border:1px solid #43364e;border-radius:14px;margin:7px 0}\n.pvLiveViewsTop{display:flex;justify-content:space-between;align-items:center;gap:12px}\n.pvLiveViewsTop strong{font-size:17px}.pvLiveViewsTop strong span{color:#d9afff;font-variant-numeric:tabular-nums}\n.pvLiveViewsTop small{color:#bca4d3;font-size:11px}\n.pvLiveViewList{display:flex;flex-direction:column;max-height:290px;overflow:auto;margin-top:10px}\n.pvLiveViewRow{display:flex;align-items:center;gap:11px;padding:11px 2px;border-bottom:1px solid #403648}\n.pvLiveViewRow:last-child{border-bottom:0}\n.pvLiveViewAvatar{height:39px;width:39px;flex:none;display:grid;place-items:center;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,#8852dd,#c85d9f);font-weight:800}\n.pvLiveViewAvatar img{width:100%;height:100%;object-fit:cover}\n.pvLiveViewIdentity{flex:1;min-width:0}.pvLiveViewIdentity strong{display:block;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pvLiveViewIdentity small{display:block;font-size:11px;color:#b9aac9}\n.pvLiveViewTime{white-space:nowrap;color:#ad9dbd;font-size:11px}.pvLiveViewEmpty{color:#bba9cf;font-size:12px;line-height:1.6;padding:16px 3px}\n";document.head.append(pvViewStyle);
const showStory=async story=>{
 const viewer=owner();if(!viewer)return;
 const body=open('Story'),media=el(story.media_type==='video'?'video':'img','pvSuiteMedia');
 media.src=imageUrl('story-media',story.media_path);
 if(story.media_type==='video'){media.controls=true;media.autoplay=true;media.playsInline=true}
 body.append(media);
 if(story.caption)body.append(el('p','',story.caption));
 if(story.author_id!==viewer.id){
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
 pvStopStoryWatcher=stop;
 if(db.channel){
  channel=db.channel('pavora-story-views-'+story.id);
  channel.on('postgres_changes',{event:'INSERT',schema:'public',table:'story_views',filter:'story_id=eq.'+story.id},schedule);
  channel.subscribe(state=>{if(!active())return;if(state==='SUBSCRIBED')schedule();else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT')status.textContent='Reconnecting…'});
 }
 timer=setInterval(()=>{if(active()&&!document.hidden)sync()},5000);
 sync();
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
  const {data,error}=await db.from('stories').select('id,author_id,media_path,media_type,caption,created_at,expires_at').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(75);
  if(error){console.warn('Stories unavailable:',error.message);return}
  const nextStories=data||[];
  const people=[...new Set(nextStories.map(x=>x.author_id))];
  const {data:profiles,error:profileError}=people.length?await db.from('profiles').select('id,username,avatar_url').in('id',people):{data:[],error:null};
  if(profileError)console.warn('Stories profile info:',profileError.message);
  const names=new Map((profiles||[]).map(p=>[p.id,p]));
  const signature=JSON.stringify({user:person.id,stories:nextStories.map(x=>[x.id,x.author_id,x.media_path]),profiles:(profiles||[]).map(p=>[p.id,p.username,p.avatar_url])});
  stories=nextStories;
  pvStoriesLastCheck=Date.now();
  if(signature===pvStoriesSignature&&bar.childElementCount)return;
  const fragment=document.createDocumentFragment();
  const add=el('button','pvStoryAdd'),circle=el('span','pvStoryPlus','+');
  add.append(circle,el('small','','Your story'));add.onclick=launch;fragment.append(add);
  const grouped=new Set();
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
kit.init=async()=>{kit.addSavedTab(document.querySelector('#profile > .panel'));await kit.renderStories(document.getElementById('stories'))};
})();
