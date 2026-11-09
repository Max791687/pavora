// PAVORA dependency-free static regression checks for pull requests and pushes.
// These checks catch missing references/syntax errors; they are not browser E2E tests.
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = file => { assert.ok(existsSync(file), `Missing file: ${file}`); return readFileSync(file, 'utf8') };
const html=read('index.html'),cloud=read('cloud.js'),suite=read('social-suite.js'),sw=read('sw.js'),compress=read('video-compress.js'),reliable=read('upload-reliable.js'),themes=read('chat-themes.js');
for(const file of ['cloud.js','social-suite.js','calls.js','app-install.js','push.js','sw.js','video-compress.js','upload-reliable.js','chat-themes.js']){
 const code=read(file);
 try {new Function(code)}catch(err){throw Error(`${file} syntax failure: ${err.message}`)}
}
for(const script of ['cloud.js','social-suite.js','calls.js','app-install.js','push.js']){
 assert.ok(html.includes(script), `index.html must load ${script}`);
}
for(const id of ['authOverlay','authEmail','authPassword','posts','profile','stories','pvIconRail']){
 const inMarkup=html.includes('id="'+id+'"')||cloud.includes("id='"+id+"'")||cloud.includes('id="'+id+'"');
 if(id==='pvIconRail')assert.ok(cloud.includes('pvIconRail'), 'Icon rail is missing');
 else assert.ok(inMarkup||cloud.includes("id='"+id+"'"), `Missing critical element ${id}`);
}
assert.ok(!html.includes('pavora-demo-v1'), 'Legacy demo app must not run');
assert.ok(cloud.includes('pvStartPostChanges()'), 'Live new-post subscription missing');
assert.ok(cloud.includes('pvStartComments()'), 'Live comment subscription missing');
assert.ok(cloud.includes('pvStartLikesRealtime()'), 'Live likes subscription missing');
assert.ok(cloud.includes("key:'blocked'"), 'Account blocking settings missing');
assert.ok(cloud.includes('pvCommentReplyComposer')&&cloud.includes('parent_id'), 'Threaded comment replies missing');
assert.ok(cloud.includes('pvDmDecorateRows')&&cloud.includes('message_reactions'), 'DM message reactions missing');
assert.ok(cloud.includes('pvOnChatInput')&&cloud.includes('dm_typing_status'), 'DM typing indicator missing');
assert.ok(cloud.includes('pvDmDecorateContent')&&cloud.includes('pv-dm-media')&&cloud.includes('reply_to'), 'Private DM media and message replies missing');
assert.ok(cloud.includes('pvShowDmMediaGallery')&&cloud.includes('pvForwardDmMessage'), 'DM gallery and forwarding missing');
assert.ok(cloud.includes('pvDmOpenHoldMenu')&&cloud.includes('pvDmAttachHoldGesture'), 'Long-press message menu missing');
assert.ok(cloud.includes('pvDmPinMessage')&&cloud.includes('dm_pinned_messages')&&cloud.includes('pvDmPinnedBar'), 'DM Pin flow missing');
assert.ok(cloud.includes('pvDmHideForMe')&&cloud.includes('dm_hidden_messages'), 'DM Delete-for-You flow missing');
assert.ok(cloud.includes('pv_edit_own_dm'), 'Secure sent-message Edit action missing');
assert.ok(cloud.includes('pvDmPickerTabs')&&cloud.includes('pvStickerSet')&&cloud.includes('pvSelectPickerTab'), 'DM sticker picker missing');
assert.ok(cloud.includes("'image/gif'")&&cloud.includes("mediaFile.type==='image/gif'?'.gif'"), 'GIF attachment support missing');
assert.ok(html.includes('upload-reliable.js?v=20261109-uploads-v30')&&sw.includes('upload-reliable.js'), 'Reliable upload helper not referenced');
assert.ok(html.includes('pvChatSelected .pvChatArea')&&html.includes('--pvDmViewportHeight'), 'Mobile DM pane fix missing');
assert.ok(cloud.includes('pvSyncMobileDmViewport')&&cloud.includes("menu.style.position='fixed'"), 'Keyboard/menu positioning fix missing');
assert.ok(cloud.includes('--pvDmViewportTop')&&cloud.includes("visualViewport?.addEventListener('scroll'")&&html.includes('top:var(--pvDmViewportTop,0px)'), 'Mobile visual viewport offset tracking missing');
assert.ok(html.includes('pvDmKeyboardOpen .pvIconRail')&&html.includes('pvChatSelected) .pvIconRail'), 'Chat must hide mobile bottom nav');
assert.ok(html.includes('video-compress.js')&&html.indexOf('video-compress.js')<html.indexOf('cloud.js?v='), 'Video compressor must load before cloud.js');
assert.ok(compress.includes('MediaRecorder')&&compress.includes('captureStream')&&compress.includes('audioCtx'), 'Local video compression or audio preservation missing');
assert.ok(cloud.includes('window.PAVORA_VIDEO.prepare')&&suite.includes('window.PAVORA_VIDEO.prepare'), 'Reel/story uploader must prepare large videos');
assert.ok(sw.includes('video-compress.js')&&html.includes('video-opt-v29'), 'PWA must cache video optimizer');
assert.ok(html.indexOf('upload-reliable.js')<html.indexOf('cloud.js?v='), 'Reliable upload helper loading order incorrect');
assert.ok(reliable.includes('maxRetries')&&reliable.includes('uncertain&&conflict')&&reliable.includes('navigator.onLine'), 'Upload retry protections missing');
assert.ok(cloud.includes("window.PAVORA_UPLOAD.upload(db,'reel-videos'")&&cloud.includes("window.PAVORA_UPLOAD.upload(db,'post-images'"), 'Post/Reel retry handling missing');
assert.ok(suite.includes('window.PAVORA_UPLOAD.upload(db,bucket'), 'Story retry handling missing');
assert.ok(sw.includes('upload-reliable.js'), 'Upload helper missing from offline shell');
assert.ok(cloud.includes('pvReadableAuthError')&&cloud.includes('pvNotifyAuth')&&cloud.includes('pvAuthBusy'), 'Visible login status logic missing');
assert.ok(cloud.includes("insertAdjacentElement('afterend',document.getElementById('authMsg'))"), 'Login feedback must be near submit button');
assert.ok(cloud.includes("pvNotifyAuth('✓ Login successful!")&&cloud.includes('Login failed. Email or password is incorrect.'), 'Login success/error messaging missing');
assert.ok(html.includes('20261110-profile-reel-views-v35')&&sw.includes('pavora-shell-2026-11-10-profile-reel-views-v35'), 'PWA latest version mismatch');
assert.ok(html.indexOf('chat-themes.js')<html.indexOf('cloud.js?v='), 'Chat themes engine must load before cloud.js');
assert.ok(sw.includes('chat-themes.js')&&themes.includes('PAVORA_CHAT_THEMES'), 'Chat themes shell integration missing');
assert.ok(cloud.includes('pvChatThemeTrigger')&&cloud.includes('PAVORA_CHAT_THEMES?.apply')&&cloud.includes('PAVORA_CHAT_THEMES?.open'), 'Chat theme picker hookup missing');
assert.ok(themes.includes("id:'anime'")&&themes.includes("id:'sakura'")&&themes.includes("id:'galaxy'"), 'Anime and companion themes missing');
assert.ok(themes.includes('pavora-chat-theme-v1:')&&themes.includes('localStorage.setItem'), 'Personal conversation theme persistence missing');
assert.ok(cloud.includes(".limit(120)")&&cloud.includes("count:'exact'"), 'Expanded Reels retrieval missing');
assert.ok(cloud.includes('pvReelDiscoveryText')&&cloud.includes('pvReelRefreshAttention')&&cloud.includes('Discover creators'), 'Reels discovery controls and empty state missing');
assert.ok(html.includes('.pvReelDiscovery')&&html.includes('.pvReelEmpty'), 'Reels mobile discovery CSS missing');
assert.ok(cloud.includes('pvFitReelsViewport')&&cloud.includes('--pvReelsTop')&&cloud.includes('--pvReelsBottom'), 'Mobile Reels viewport sizing missing');
assert.ok(html.includes('body.pvReelsMode .pvReelDiscovery,')&&html.includes('body.pvReelsMode .pvReelUploadToggle{display:none!important}'), 'Mobile Reels must hide toolbar clutter');
assert.ok(html.includes('bottom:var(--pvReelsBottom,63px)!important')&&html.includes('body.pvReelsMode .pvReelMeta'), 'Mobile Reel caption/nav overlap fix missing');
assert.ok(cloud.includes('pvLoadOwnReelViewCounts')&&cloud.includes("db.from('reel_views').select('reel_id')")&&cloud.includes('pvProfileReelViews'), 'Profile Reel view counters missing');
assert.ok(cloud.includes('pvDeleteOwnReel')&&cloud.includes(".eq('author_id',uid).select('id')")&&cloud.includes("pvProfileReelDelete"), 'Owner-verified Reel delete controls missing');
assert.ok(cloud.includes('pvOpenProfileReel')&&cloud.includes('stack.pvResume(index)'), 'Profile tile should open the selected Reel');
assert.ok(suite.includes("video.addEventListener('timeupdate'")&&suite.includes('watchSeconds<2'), 'Watch-time validated Reel view counting missing');
assert.ok(html.includes('pvProfileReelDelete')&&html.includes('pvProfileReelViews'), 'Profile reel action styles missing');
assert.ok(suite.includes('story_views'), 'Story viewer tracking missing');
assert.ok(sw.includes("event.respondWith"), 'PWA offline fallback missing');
console.log('PAVORA static smoke checks passed. Browser integration tests are still required.');
