/* PAVORA Daily Creator Showcase v71.
   100 explicitly fictional editorial profiles. 1 curated new demo card per creator
   per India-local day. This is NOT a Supabase post, bot account, or simulated real engagement.
   Content rotates across a 60-day editorial slate, never fabricated news. */
(()=>{
'use strict';
const creators=window.PAVORA_VIRTUAL_CREATORS;
if(!Array.isArray(creators)||creators.length!==100)return;
const E=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const topics={
frames:[
['Composition with breathing room','Leave empty space beside the subject so the eye knows where to rest.','Frame the same scene with the subject in the center and then at one-third.'],
['Window-light portraits','A window can create a soft portrait without expensive lighting.','Turn the face slightly toward the window and compare shadow edges.'],
['Color pairs that work','One strong accent color becomes clearer against a quieter background.','Choose one dominant color, one supporting color, and one neutral.'],
['Visual storytelling in three shots','A wide shot gives context, a medium shot shows action, and a detail shot adds emotion.','Plan those three shots before recording a short scene.'],
['Foreground adds depth','Shooting past a nearby object can make a simple photograph feel layered.','Use a plant, doorway, or railing without hiding the subject.'],
['Make reflections intentional','Reflections can repeat shapes and create a strong visual rhythm.','Find a clean reflection and move until unwanted clutter disappears.'],
['Cropping without losing context','A tighter crop improves focus only if key information stays visible.','Check the edges and protect faces, products, and important text.'],
['Working with shadows','A clear shadow can be the subject rather than a flaw.','Try late-afternoon light and observe the direction of the shadow.'],
['Create a consistent photo series','A series feels connected through repeating framing and color decisions.','Pick one focal length and color treatment for five photographs.'],
['Design for small screens','A cover image needs a readable focal point at thumbnail size.','Shrink the draft to a phone thumbnail before publishing.']
],
tech:[
['Make an app feel faster','Immediate visual feedback is often more useful than a decorative loading animation.','Show an action state as soon as the user taps a control.'],
['Write helpful empty states','An empty screen should explain what is missing and provide the next action.','Replace a generic blank panel with one clear suggestion.'],
['Accessible touch targets','Small controls make mobile apps harder to use.','Aim for comfortably spaced targets and test them with one hand.'],
['Loading only what is needed','Large images and videos should not block the first useful screen.','Load visible content first and defer off-screen media.'],
['Prevent accidental double submits','A submit button should reflect in-progress work.','Disable repeated submission while keeping visible progress feedback.'],
['Design a useful search','Good search offers clear results and a helpful no-results state.','Test searches with typos, partial names, and zero matches.'],
['Account security basics','A password reset link should expire and never reveal an existing password.','Use verified email recovery and a clear confirmation screen.'],
['Build humane notifications','A notification should tell people what happened and where the tap will lead.','Write a concise title and verify the deep link works.'],
['Offline-friendly interaction','Some edits can be saved locally before the network returns.','Store a non-sensitive draft locally and explain sync status.'],
['Measure before optimizing','Performance work starts with observing real bottlenecks.','Compare first meaningful content on a slow phone and a desktop.']
],
travel:[
['Plan a walk around one theme','A neighborhood walk becomes memorable when the stops connect through a common idea.','Choose architecture, street food, or public art as the route theme.'],
['Photograph places respectfully','Good travel stories consider the comfort and privacy of people nearby.','Ask before photographing a person as the main subject.'],
['Build a weather backup','A flexible travel plan needs an indoor alternative.','Pair each outdoor stop with a nearby indoor option.'],
['Pack for movement','A lighter day bag makes walking and transit easier.','Carry water, power, basic care items, and only essentials.'],
['Notice local design details','Doorways, signs, and textures can say as much about a place as landmarks.','Collect three details that share one visual pattern.'],
['Travel without rushing','Fewer stops often produce a better experience than a packed itinerary.','Leave a free hour to explore without a checklist.'],
['Make a responsible food trail','A food trail should balance curiosity, hygiene, and realistic distances.','Choose two places nearby rather than crossing the entire city.'],
['Think about accessibility','A useful route should account for ramps, crossings, and places to rest.','Check accessibility details before suggesting a stop.'],
['Keep a place journal','Short observations preserve the atmosphere better than a list of location names.','Record one sound, one color, and one memorable detail.'],
['Be honest about travel guides','A moodboard is not proof that a venue is open or a route is available.','Verify timings and transport before publishing practical advice.']
],
style:[
['Build around one statement piece','A strong outfit can work best when other pieces are understated.','Pair one standout item with simple textures and neutral colors.'],
['Use a three-color palette','Repeating a limited palette creates a coordinated look.','Try two neutrals and one accent across an outfit.'],
['Texture changes the mood','Denim, linen, cotton, and knitwear read differently even in the same color.','Compare two textures before adding more accessories.'],
['Fit before trends','Comfort and proportion can matter more than a trend label.','Check shoulders, sleeve length, and how the outfit moves.'],
['Repeat outfits creatively','Restyling what you own is often more useful than constantly buying.','Change one layer and one accessory to make a new combination.'],
['Keep accessories purposeful','Accessories should support the look, not compete with every detail.','Remove one accessory and compare both versions.'],
['Try a monochrome look','Different shades and textures keep one-color styling interesting.','Use two tones and one contrasting fabric texture.'],
['Plan for the occasion','A good outfit should suit the weather, movement, and setting.','Decide on practicality before selecting colors.'],
['Style a simple base','A plain base can support many distinct looks.','Start with one neutral top and build three combinations.'],
['Present outfits clearly','A style photo needs light that shows actual color and fabric.','Avoid strong filters that hide texture or misrepresent the product.']
],
studio:[
['Start with a clear brief','Creative work improves when the audience and purpose are defined early.','Write a one-sentence goal before designing.'],
['Sketch before polishing','Quick rough concepts reveal weak ideas before much time is spent.','Draw three different layouts in five minutes.'],
['Use a visual hierarchy','Viewers should immediately know what to read first.','Choose one headline, one supporting line, and one action.'],
['Make feedback specific','Useful critique names a problem and suggests a direction.','Replace “make it better” with one observable issue.'],
['Protect the focal point','Too many competing elements weaken a composition.','Remove an element that does not support the central message.'],
['Create a reusable system','Shared spacing, type sizes, and components save repeated effort.','Define a small style guide before designing the next page.'],
['Tell a story with contrast','Contrast can guide attention without relying on excessive decoration.','Try size, spacing, and value contrast before adding effects.'],
['Test the first frame','The first screen should communicate meaning instantly.','Show it for three seconds and ask what viewers remember.'],
['Build from audience needs','A beautiful concept must still solve the real user problem.','Write two real user tasks and evaluate your design against them.'],
['Finish with a quality pass','Polish includes checking copy, spacing, accessibility, and export quality.','Review the draft at full size and at phone scale.']
]
};
const nameIdx=name=>creators.indexOf(name);
const category=['frames','tech','travel','style','studio'];
const startUTC=Date.UTC(2026,10,10);
function indiaParts(){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 const get=k=>Number(parts.find(p=>p.type===k)?.value||0);
 return {year:get('year'),month:get('month'),day:get('day'),hour:get('hour')};
}
function dayIndex(){
 const p=indiaParts();
 const midnight=Date.UTC(p.year,p.month-1,p.day);
 return Math.max(0,Math.floor((midnight-startUTC)/86400000)-(p.hour<9?1:0));
}
function dateLabel(offset=0){
 const d=new Date(startUTC+offset*86400000);
 return d.toLocaleDateString('en-IN',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'});
}
const intros=[
'Creator note: a practical idea you can try today.',
'A quick creative exercise for your next project.',
'One focused experiment, not an empty trend.',
'A small improvement with a clear reason behind it.',
'A useful checklist item for a more thoughtful result.',
'An editorial prompt you can adapt to your own work.'
];
function postFor(person,day){
 const n=nameIdx(person);if(n<0||day<0)return null;
 const j=n%5,i=Math.floor(n/5),kind=category[j];
 const list=topics[kind],topic=list[(day+i)%list.length];
 const angle=(Math.floor(day/list.length)+Math.floor(i/10))%6;
 const [title,insight,exercise]=topic;
 const caption=title+' — '+insight+' '+exercise+' '+intros[angle];
 return {id:person.id+'-'+day,creator:person,kind,day,caption,title,insight,exercise,angle,date:dateLabel(day)};
}
function history(person,limit=3){
 const d=dayIndex(),out=[];
 for(let i=0;i<limit;i++){const entry=postFor(person,d-i);if(entry)out.push(entry)}
 return out;
}
window.PAVORA_DAILY={history,today:()=>creators.map(p=>postFor(p,dayIndex())),dayIndex};
const home=document.getElementById('home'),realPosts=document.getElementById('posts');if(!home||!realPosts)return;
const container=E('section','pvDailyShowcase');
container.id='pvDailyShowcase';
container.setAttribute('aria-label','Daily curated virtual creator posts');
const cards=E('div','pvDailyCards');
const footer=E('div','pvDailyFooter'),more=E('button','pvDailyMore','Show 12 more demo posts');
more.type='button';footer.append(more);
container.append(cards,footer);
// Keep all real uploaded posts first, then append scheduled virtual posts in the same Home feed.
realPosts.after(container);
const style=E('style');
style.textContent=`
.pvDailyShowcase{margin:0 0 24px;width:100%;max-width:none;min-width:0}
.pvDailyHead{padding:12px 14px;border-bottom:1px solid #332b3b}
.pvDailyHead h2{font-size:15px;margin:0 0 4px;color:#fff}
.pvDailyIntro{font-size:11px;color:#aea4b9;line-height:1.55;margin:0}
.pvDailyCards{display:block;padding:0}
.pvDailyCard{min-width:0;background:transparent;border:0;border-bottom:1px solid #343042;border-radius:0;overflow:hidden;max-width:none;width:100%;margin:0 0 18px}
.pvDailyWho{display:flex;align-items:center;gap:12px;padding:15px;min-width:0}
.pvDailyAvatar{width:46px;height:46px;display:grid;place-items:center;border-radius:50%;flex:none;color:white;font-size:16px;font-weight:850;background:linear-gradient(130deg,#8650d3,#d2549e)}
.pvDailyIdentity{display:flex;flex-direction:column;min-width:0;gap:3px;flex:1}
.pvDailyWho strong{font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pvDailyMeta{font-size:10px;color:#b7a9c5}
.pvDailyBadge{font-size:9px;border:1px solid #71538c;color:#dfc5ff;border-radius:999px;padding:3px 6px;white-space:nowrap}
.pvDailyPhotoWrap{background:#292330;width:100%;max-height:540px;position:relative;overflow:hidden}
.pvDailyPhotoWrap .pvDailyPhoto{display:block;width:100%;height:auto;max-height:540px;object-fit:cover}
.pvDailyPhotoCredit{position:absolute;bottom:8px;right:9px;padding:4px 7px;background:#08050ab8;color:#fff;border-radius:6px;font-size:9px;text-decoration:none}
.pvDailyPhotoFallback{display:none;position:absolute;inset:0;align-items:center;justify-content:center;padding:25px;color:#eee;text-align:center;background:#302640;font-weight:750}
.pvDailyCard.photoFailed .pvDailyPhotoFallback{display:flex}
.pvDailyCard.photoFailed .pvDailyPhoto{display:none}
.pvDailyPostTools{display:flex;align-items:center;gap:14px;padding:14px 16px 5px}
.pvDailyPostTools button{border:0;background:none;color:#eee6f9;font-size:23px;line-height:1;padding:4px;cursor:pointer}
.pvDailyPostTools button:focus-visible{outline:2px solid #c89aff;outline-offset:3px;border-radius:4px}
.pvDailyPostTools button.saved{color:#c897ff}
.pvDailyPostTools button[aria-pressed=true]{color:#e68cc5}
.pvDailySpacer{flex:1}
.pvDailyText{padding:6px 16px 15px;color:#ded5e6;font-size:13px;line-height:1.55}
.pvDailyText p{margin:0 0 9px}
.pvDailyText strong{color:white}
.pvDailyPrompt{color:#b9aac9;font-size:12px}
.pvDailyTime{font-size:10px;color:#8f859a}
.pvDailyFooter{text-align:center;padding:10px}
.pvDailyMore{background:#654198;border:1px solid #9670cc;border-radius:11px;color:#fff;cursor:pointer;padding:11px 16px;font-weight:750}
@media(max-width:630px){.pvDailyShowcase{margin:0}.pvDailyPhotoWrap{max-height:540px}.pvDailyCard{border-radius:0}}
@media(prefers-reduced-motion:reduce){.pvDailyShowcase *{animation:none!important;transition:none!important}}
`;
document.head.append(style);
let renderedDay=null,shown=0,entries=[];
// Stable editorial stock-photo selections, varied by creator and day.
// Images are illustrative licensed-platform references, not photos taken by the fictional profiles.
const photoIds={
 frames:['photo-1541701494587-cb58502866ab','photo-1497366811353-6870744d04b2','photo-1513364776144-60967b0f800f','photo-1500534314209-a25ddb2bd429'],
 tech:['photo-1498050108023-c5249f4df085','photo-1516321318423-f06f85e504b3','photo-1558655146-9f40138edfeb','photo-1518770660439-4636190af475'],
 travel:['photo-1500530855697-b586d89ba3ee','photo-1476514525535-07fb3b4ae5f1','photo-1469474968028-56623f02e42e','photo-1488646953014-85cb44e25828'],
 style:['photo-1483985988355-763728e1935b','photo-1529139574466-a303027c1d8b','photo-1485968579580-b6d095142e6e','photo-1503342217505-b0a15ec3261c'],
 studio:['photo-1493612276216-ee3925520721','photo-1541462608143-67571c6738dd','photo-1455390582262-044cdead277a','photo-1523726491678-bf852e717f6a']
};
function imageFor(p,retry=0){
 const list=photoIds[p.kind]||photoIds.frames;
 const id=list[(nameIdx(p.creator)+p.day+retry)%list.length];
 return 'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w=1100&q=78';
}
function draftStorageKey(){return 'pavora-demo-saved:'+((window.PVKit?.getUser?.()?.id)||'guest')}
function getSaved(){
 try{return new Set(JSON.parse(localStorage.getItem(draftStorageKey())||'[]'))}catch{return new Set()}
}
function toggleSaved(postId,button){
 const saved=getSaved();
 if(saved.has(postId))saved.delete(postId);else saved.add(postId);
 try{localStorage.setItem(draftStorageKey(),JSON.stringify([...saved].slice(-500)))}catch(e){}
 const on=saved.has(postId);button.classList.toggle('saved',on);button.setAttribute('aria-pressed',String(on));button.textContent=on?'▣':'▢';
 button.setAttribute('aria-label',on?'Remove demo post from saved':'Save demo post on this device');
}
function cardFor(p){
 const c=E('article','post pvDailyCard');c.dataset.theme=p.kind;
 const top=E('div','posthead pvDailyWho'),avatar=E('span','pvDailyAvatar',p.creator.initial);
 const identity=E('div','pvDailyIdentity'),who=E('strong','','@'+p.creator.username),date=E('small','pvDailyMeta',p.creator.theme+' · '+p.date);
 const badge=E('span','pvDailyBadge','VIRTUAL · DEMO');
 identity.append(who,date);top.append(avatar,identity,badge);
 const visual=E('div','pvDailyPhotoWrap'),img=E('img','pvDailyPhoto');
 img.src=imageFor(p);img.alt='Illustrative photograph for '+p.title;
 img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
 let retries=0;
 img.onerror=()=>{if(retries<3){retries++;img.src=imageFor(p,retries)}else c.classList.add('photoFailed')};
 const fallback=E('div','pvDailyPhotoFallback',p.title);
 const credit=E('a','pvDailyPhotoCredit','Illustrative photo · Unsplash');
 credit.href='https://unsplash.com/';credit.target='_blank';credit.rel='noopener noreferrer';
 visual.append(img,fallback,credit);
 const actions=E('div','postfoot pvDailyPostTools');
 const heart=E('button','','♡'),share=E('button','','↗'),spacer=E('span','pvDailySpacer'),bookmark=E('button','','▢');
 heart.type=share.type=bookmark.type='button';
 heart.setAttribute('aria-label','Appreciate demo post');heart.setAttribute('aria-pressed','false');
 heart.onclick=()=>{const on=heart.getAttribute('aria-pressed')!=='true';heart.setAttribute('aria-pressed',String(on));heart.textContent=on?'♥':'♡'};
 share.setAttribute('aria-label','Share link to this demo post');
 share.onclick=async()=>{
  const link=location.origin+location.pathname+'#virtual-post-'+encodeURIComponent(p.id);
  try{if(navigator.share)await navigator.share({title:p.title,url:link});else if(navigator.clipboard)await navigator.clipboard.writeText(link);else throw Error('Share is unavailable')}
  catch(e){if(e.name!=='AbortError')alert('Could not share this post');return}
 };
 bookmark.type='button';const saved=getSaved().has(p.id);
 bookmark.textContent=saved?'▣':'▢';bookmark.classList.toggle('saved',saved);bookmark.setAttribute('aria-pressed',String(saved));bookmark.setAttribute('aria-label',saved?'Remove demo post from saved':'Save demo post on this device');
 bookmark.onclick=()=>toggleSaved(p.id,bookmark);
 actions.append(heart,share,spacer,bookmark);
 const main=E('div','postbody pvDailyText'),caption=E('p'),author=E('strong','','@'+p.creator.username+' '),content=document.createTextNode(p.insight);
 caption.append(author,content);
 const prompt=E('p','pvDailyPrompt',p.exercise),time=E('small','pvDailyTime','Virtual editorial post · '+p.date);
 main.append(caption,prompt,time);
 c.id='virtual-post-'+p.id;
 c.append(top,visual,actions,main);return c;
}
function drawNext(){
 const next=Math.min(entries.length,shown+8);
 const frag=document.createDocumentFragment();
 for(let i=shown;i<next;i++)frag.append(cardFor(entries[i]));
 cards.append(frag);shown=next;
 more.hidden=shown>=entries.length;
 more.textContent='Load more posts ('+shown+'/'+entries.length+')';
}
more.addEventListener('click',drawNext);
// When visitors scroll Home Feed, load every scheduled post progressively.
// All 100 are ready immediately; rendering is chunked to preserve phone performance.
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(items=>{
  if(items.some(item=>item.isIntersecting)&&!more.hidden&&shown<entries.length&&!container.closest('.hide')){
   drawNext();
  }
 },{rootMargin:'850px 0px',threshold:0});
 observer.observe(footer);
}
function sync(force=false){
 const day=dayIndex();
 if(!force&&renderedDay===day)return;
 renderedDay=day;shown=0;cards.replaceChildren();
 // Rotate the starting creator so the same accounts don't dominate the screen daily.
 entries=creators.map(person=>postFor(person,day)).sort((a,b)=>((nameIdx(a.creator)*37+day*17)%101)-((nameIdx(b.creator)*37+day*17)%101));
 drawNext();
}
sync(true);
// Open a shared demo post by progressively rendering the required card.
function openSharedPost(){
 const id=decodeURIComponent(location.hash.slice(1));if(!id.startsWith('virtual-post-'))return;
 let target=document.getElementById(id);
 while(!target&&shown<entries.length){drawNext();target=document.getElementById(id)}
 if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
}
window.addEventListener('hashchange',openSharedPost);setTimeout(openSharedPost,250);
setInterval(()=>sync(),60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
window.addEventListener('pageshow',()=>sync());
})();