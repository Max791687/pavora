// PAVORA dependency-free static regression checks for pull requests and pushes.
// These checks catch missing references/syntax errors; they are not browser E2E tests.
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = file => { assert.ok(existsSync(file), `Missing file: ${file}`); return readFileSync(file, 'utf8') };
const html=read('index.html'),cloud=read('cloud.js'),suite=read('social-suite.js'),sw=read('sw.js'),compress=read('video-compress.js'),reliable=read('upload-reliable.js'),themes=read('chat-themes.js'),presence=read('presence.js'),presenceSql=read('supabase/user-presence.sql'),chatSearch=read('chat-search.js'),smart=read('smart-reels.js'),smartSql=read('supabase/smart-reels.sql'),smartWatchSql=read('supabase/smart-reels-watch.sql'),reelSeek=read('reel-seek.js'),hub=read('creator-hub.js'),hubSql=read('supabase/creator-hub-v41.sql');
for(const file of ['cloud.js','social-suite.js','calls.js','app-install.js','push.js','sw.js','video-compress.js','upload-reliable.js','chat-themes.js','presence.js','chat-search.js','smart-reels.js','reel-seek.js','creator-hub.js']){
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
assert.ok(cloud.includes("addEventListener('invalid'")&&cloud.includes("pvAuthSubmit.addEventListener('click'")&&cloud.includes('Checking your login details'), 'Login button validation feedback missing');
assert.ok(html.includes('cloud.js?v=20261110-login-hidden-fields-v51')&&cloud.includes("setAuthMode('login');")&&cloud.includes("document.getElementById('authUsername').disabled=!signup")&&cloud.includes("!input.closest('[hidden]')"), 'Hidden signup username must not block login');
assert.ok(cloud.includes('pvRecoverySupportDialog')&&cloud.includes('pvRecoverySupportButton')&&cloud.includes("db.functions.invoke('pavora-recovery-support'"), 'Recovery request UI and secure submission missing');
const recoverySql=read('supabase/recovery-support-v49.sql'),recoveryFn=read('supabase/functions/pavora-recovery-support/index.ts');
assert.ok(recoverySql.includes('enable row level security')&&recoverySql.includes('revoke all'), 'Support tickets must remain restricted');
assert.ok(recoveryFn.includes('pv_recovery_requests')&&recoveryFn.includes('count'), 'Support intake or throttle missing');

const owner=read('owner-admin.js'),ownerFunction=read('supabase/functions/pavora-owner-admin/index.ts');
assert.ok(owner.includes('Online now')&&owner.includes('last_active_at')&&owner.includes('Open Reel')&&owner.includes('View Post')&&owner.includes('pvOwnerViewer'), 'Owner presence badges and content preview missing');
assert.ok(ownerFunction.includes('onlineCount:users.filter(u=>u.online).length')&&ownerFunction.includes('last_active_at')&&ownerFunction.includes('video_path')&&ownerFunction.includes('image_path')&&ownerFunction.includes('author:authors.get(item.author_id)'), 'Owner backend uploader and online status missing');
const passwordHelp=read('password-help.js'),hintSql=read('supabase/password-hints-v50.sql');
try {new Function(passwordHelp)}catch(err){throw Error('Password help syntax: '+err.message)}
assert.ok(html.includes('password-help.js?v=20261110-password-help-v50')&&sw.includes('./password-help.js'),'Password hint UI must ship in PWA');
assert.ok(hintSql.includes('pv_password_hints')&&hintSql.includes('enable row level security')&&hintSql.includes('user_id=(select auth.uid())'),'Password hints must be private');
assert.ok(passwordHelp.includes('pvHintLauncher')&&passwordHelp.includes('pv_password_hints')&&passwordHelp.includes("event==='PASSWORD_RECOVERY'")&&passwordHelp.includes('db.auth.updateUser({password})'),'User-managed hint and verified reset support missing');
assert.ok(owner.includes('recovery.send_reset')&&ownerFunction.includes("action==='recovery.send_reset'")&&ownerFunction.includes('resetPasswordForEmail')&&ownerFunction.includes('pv_admin_audit'),'Admin-assisted reset must be audited and never expose tokens');

assert.ok(owner.includes("recovery.list")&&owner.includes("recovery.review")&&ownerFunction.includes("recovery.list")&&ownerFunction.includes("recovery.review"), 'Owner support recovery review not wired');
assert.ok(html.includes('owner-admin.js?v=20261110-owner-dashboard-v55')&&sw.includes('./owner-admin.js'), 'Owner dashboard not included in PWA');
assert.ok(owner.includes("db.functions.invoke('pavora-owner-admin'")&&owner.includes('pvOwnerLauncher')&&owner.includes('pvOwnerRoot'), 'Owner UI not securely calling Edge Function');
assert.ok(owner.includes('pvoPanels')&&owner.includes('Recent reports')&&owner.includes('Admin activity')&&owner.includes('↻ Retry')&&owner.includes('d.recoveries'), 'Premium owner dashboard overview or retry missing');
const backendGrants=read('supabase/owner-admin-backend-grants-v53.sql');
assert.ok(backendGrants.includes('grant select on public.pv_app_admins to service_role')&&backendGrants.includes('grant select,insert,update on public.pv_content_moderation to service_role'), 'Owner backend table grants missing');
assert.ok(owner.includes('LIVE ADMIN CONSOLE · v55')&&owner.includes('pvoPanels')&&owner.includes('pvoStats'), 'Updated owner admin UI not shipped');
assert.ok(owner.includes("main=E('div','pvoMain')")&&owner.includes('pvoUserList')&&owner.includes('writing-mode:horizontal-tb!important')&&owner.includes('pvoUserMeta'), 'Owner users must be isolated from main grid and action labels must remain horizontal');
for(const command of ['user.suspend','user.unban','content.hide','content.restore','report.set','summary','users','audit']) assert.ok(ownerFunction.includes(command), 'Missing server admin command '+command);
assert.ok(ownerFunction.includes('pv_app_admins')&&ownerFunction.includes('admin.auth.getUser')&&ownerFunction.includes("ban_duration")&&ownerFunction.includes('pv_admin_audit'), 'Admin authorization and audit must remain server-side');
const calls=read('calls.js');
assert.ok(html.includes('calls.js?v=20261110-calling-v46')&&sw.includes('./calls.js'), 'Fresh WebRTC calling script missing from PWA');
assert.ok(calls.includes('scheduleRingTimeout')&&calls.includes('clearRingTimer')&&calls.includes('60000'), 'Unanswered call timeout missing');
assert.ok(calls.includes('pvCallMute')&&calls.includes('pvCallCamera')&&calls.includes('getAudioTracks()')&&calls.includes('getVideoTracks()'), 'In-call microphone/camera controls missing');
assert.ok(calls.includes('session!==callSession')&&calls.includes(".eq('status','ringing')"), 'Call cancellation and answer-race protection missing');
assert.ok(calls.includes("setInterval(pollCall,1800)")&&calls.includes("document.addEventListener('visibilitychange'"), 'Call polling / resume refresh missing');
assert.ok(calls.includes('pvCallErrorMessage')&&calls.includes("connectionState==='failed'"), 'WebRTC failure feedback missing');

assert.ok(cloud.includes('pvSignupEmailLimitMessage')&&cloud.includes('pvShowSignupEmailLimit')&&cloud.includes('pvSignupEmailCooldownUntil'), 'Auth quota guidance and retry cooldown missing');
assert.ok(cloud.includes('email_address_not_authorized')&&cloud.includes('Custom SMTP')&&cloud.includes('pvAuthBackToLogin'), 'Auth email delivery guidance and login fallback missing');
assert.ok(cloud.includes('signInWithPassword')&&cloud.includes('db.auth.signUp(credentials)')&&!cloud.includes('pvGoogleButton'), 'Original email/password login and signup must remain in place');
assert.ok(cloud.includes('<p id="authMsg" role="status" aria-live="polite" hidden></p>')&&cloud.includes('#authBox #authMsg:empty{display:none!important}'), 'Empty auth feedback must not display a pink outlined placeholder');
assert.ok(cloud.includes('db.auth.resetPasswordForEmail(email')&&cloud.includes('setAuthMode(\'reset\')')&&cloud.includes('db.auth.getSession()')&&cloud.includes("event==='SIGNED_OUT'"), 'Reset-password, session restore and logout handlers must remain wired');
assert.ok(cloud.includes("insertAdjacentElement('afterend',document.getElementById('authMsg'))"), 'Login feedback must be near submit button');
assert.ok(cloud.includes("pvNotifyAuth('✓ Login successful!")&&cloud.includes('Login failed. Email or password is incorrect.'), 'Login success/error messaging missing');
assert.ok(html.includes('20261110-login-hidden-fields-v51')&&sw.includes('pavora-shell-2026-11-10-owner-v55'), 'PWA latest version mismatch');
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
assert.ok(cloud.includes('function pvBindDoubleTap(')&&cloud.includes('pvPostDoubleLike')&&cloud.includes('pvBindDoubleTap(video,'), 'Double-tap Likes for posts and Reels missing');
assert.ok(cloud.includes('function pvPauseAllReels()')&&cloud.includes("if(view!=='reels')pvPauseAllReels()")&&cloud.includes("window.addEventListener('pagehide',pvPauseAllReels"), 'Reel playback cleanup on navigation/background missing');
assert.ok(html.includes('pvDoubleLikeHeart')&&html.includes('pvLikeBurst'), 'Double-tap heart animation missing');
assert.ok(html.indexOf('presence.js?v=')<html.indexOf('cloud.js?v=')&&sw.includes('presence.js'), 'Presence script must load before cloud app and be cached');
assert.ok(cloud.includes('PAVORA_PRESENCE?.start')&&cloud.includes('PAVORA_PRESENCE?.stop')&&cloud.includes("PAVORA_PRESENCE?.attach"), 'Presence not wired to session and chat/profile');
assert.ok(presence.includes('visibilitychange')&&presence.includes('HEARTBEAT_MS')&&presence.includes('ONLINE_AGE_MS')&&presence.includes('last_active_at'), 'Heartbeat/last seen lifecycle missing');
assert.ok(presenceSql.includes('enable row level security')&&presenceSql.includes('p.is_private=false')&&presenceSql.includes('account_blocks')&&presenceSql.includes('auth.uid()'), 'Presence privacy policy missing');
assert.ok(html.indexOf('chat-search.js?v=')<html.indexOf('cloud.js?v=')&&sw.includes('chat-search.js'), 'Chat search must be loaded before app and cached');
assert.ok(cloud.includes('pvDmSearchButton')&&cloud.includes('PAVORA_CHAT_SEARCH?.open(area)'), 'Message search action missing');
assert.ok(chatSearch.includes('pvDmSearchPanel')&&chatSearch.includes('pvDmSearchResult')&&chatSearch.includes('scrollIntoView')&&chatSearch.includes('pvDmSearchHit'), 'Chat search navigation missing');
assert.ok(html.includes('.pvChatTop .pvDmRealtimeLabel{display:none!important}'), 'Mobile chat header overflow prevention missing');
assert.ok(html.indexOf('smart-reels.js?v=')<html.indexOf('cloud.js?v=')&&sw.includes('smart-reels.js'), 'Smart Reels engine must load before feed');
assert.ok(smart.includes('function rank(')&&smart.includes("getMode(uid)")&&smart.includes("selected==='following'"), 'For You and Following ranking missing');
assert.ok(smart.includes('myLikes')&&smart.includes('mySaves')&&smart.includes('myViews')&&smart.includes('watchSignals')&&smart.includes('ageDays'), 'Personal ranking signals missing');
assert.ok(smart.includes('async function notInterested(')&&cloud.includes('pvSmartNotInterested'), 'Not interested preference flow missing');
assert.ok(cloud.includes('PAVORA_SMART_REELS?.rank')&&cloud.includes('PAVORA_SMART_REELS?.createTabs'), 'Smart Reels not connected to feed');
assert.ok(suite.includes('pvCommitWatchProgress')&&suite.includes('PAVORA_SMART_REELS?.recordWatch'), 'Playback metrics not connected');
assert.ok(smartSql.includes('enable row level security')&&smartSql.includes('auth.uid()')&&smartWatchSql.includes('enable row level security')&&smartWatchSql.includes('auth.uid()'), 'Smart Reels per-user RLS missing');
assert.ok(html.indexOf('reel-seek.js?v=')<html.indexOf('cloud.js?v=')&&sw.includes('reel-seek.js'), 'Reel seek engine must load before app and be cached');
assert.ok(cloud.includes('PAVORA_REEL_SEEK?.attach(screen,video)'), 'Reel seek bar must be attached to each video');
assert.ok(reelSeek.includes("track.type='range'")&&reelSeek.includes("video.currentTime=requested")&&reelSeek.includes('loadedmetadata')&&reelSeek.includes('durationchange')&&reelSeek.includes('timeupdate'), 'Reel duration and seek logic missing');
assert.ok(reelSeek.includes("e.stopPropagation()")&&reelSeek.includes('touch-action:pan-x')&&reelSeek.includes('pvReelSeekTime'), 'Mobile touch-scrubbing and duration display missing');
assert.ok(html.includes('creator-hub.js?v=20261110-creator-hub-v41')&&sw.includes('creator-hub.js'), 'Creator Hub not loaded/cached');
assert.ok(hub.includes('Your Creator Analytics')&&hub.includes('pv_creator_reel_stats')&&hub.includes('Completion')===false, 'Aggregate Creator Analytics not present');
assert.ok(hub.includes('Moderation Queue')&&hub.includes('pv_app_admins')&&hub.includes('content_reports'), 'Admin-only moderation review missing');
assert.ok(hub.includes('Discover Rising Creators')&&hub.includes("db.from('follows').insert"), 'Creator Growth follow workflow missing');
assert.ok(hub.includes('Data Saver')&&hub.includes('pavora-data-saver')&&cloud.includes('PAVORA_CREATOR_HUB?.dataSaver()'), 'Reel performance data saver missing');
assert.ok(hubSql.includes('enable row level security')&&hubSql.includes('pv_creator_reel_stats')&&hubSql.includes('from public,anon')&&hubSql.includes('pv_guard_official_profile'), 'Creator Hub security migration missing');
assert.ok(suite.includes('story_views'), 'Story viewer tracking missing');
assert.ok(sw.includes("event.respondWith"), 'PWA offline fallback missing');
console.log('PAVORA static smoke checks passed. Browser integration tests are still required.');
