// PAVORA dependency-free static regression checks for pull requests and pushes.
// These checks catch missing references/syntax errors; they are not browser E2E tests.
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = file => { assert.ok(existsSync(file), `Missing file: ${file}`); return readFileSync(file, 'utf8') };
const html=read('index.html'),cloud=read('cloud.js'),suite=read('social-suite.js'),sw=read('sw.js');
for(const file of ['cloud.js','social-suite.js','calls.js','app-install.js','push.js','sw.js']){
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
assert.ok(html.includes('dm-mobile-layout-v28-1')&&sw.includes('dm-mobile-layout-v28-1'), 'PWA version mismatch');
assert.ok(html.includes('pvChatSelected .pvChatArea')&&html.includes('--pvDmViewportHeight'), 'Mobile DM pane fix missing');
assert.ok(cloud.includes('pvSyncMobileDmViewport')&&cloud.includes("menu.style.position='fixed'"), 'Keyboard/menu positioning fix missing');
assert.ok(suite.includes('story_views'), 'Story viewer tracking missing');
assert.ok(sw.includes("event.respondWith"), 'PWA offline fallback missing');
console.log('PAVORA static smoke checks passed. Browser integration tests are still required.');
