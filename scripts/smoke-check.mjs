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
assert.ok(suite.includes('story_views'), 'Story viewer tracking missing');
assert.ok(sw.includes("event.respondWith"), 'PWA offline fallback missing');
console.log('PAVORA static smoke checks passed. Browser integration tests are still required.');
