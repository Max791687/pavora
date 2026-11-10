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
const heading=E('div','pvDailyHead'),title=E('h2','','Daily Creator Showcase'),meta=E('p','pvDailyIntro');
heading.append(title,meta);
const cards=E('div','pvDailyCards');
const footer=E('div','pvDailyFooter'),more=E('button','pvDailyMore','Show 12 more demo posts');
more.type='button';footer.append(more);
container.append(heading,cards,footer);
// Keep all real uploaded posts first, then append scheduled virtual posts in the same Home feed.
realPosts.after(container);
const style=E('style');
style.textContent=`
.pvDailyShowcase{margin:20px auto 28px;max-width:710px;min-width:0}
.pvDailyHead{padding:14px 16px 10px;border:1px solid #3c2c4b;border-radius:15px 15px 0 0;background:#21172d}
.pvDailyHead h2{font-size:19px;margin:0 0 5px;color:#fff}
.pvDailyIntro{font-size:12px;color:#c1b5cd;line-height:1.6;margin:0}
.pvDailyCards{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;padding:12px 0}
.pvDailyCard{min-width:0;border:1px solid #393048;background:#17131f;border-radius:14px;overflow:hidden;max-width:620px;width:100%;margin-inline:auto}
.pvDailyWho{display:flex;align-items:center;gap:7px;padding:11px 12px;min-width:0}
.pvDailyWho strong{font-size:12px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pvDailyBadge{font-size:9px;border:1px solid #71538c;color:#dfc5ff;border-radius:999px;padding:3px 5px;white-space:nowrap}
.pvDailyArt{padding:22px 18px;min-height:155px;display:flex;flex-direction:column;justify-content:center;gap:10px;background:linear-gradient(135deg,#443167,#242038)}
.pvDailyCard[data-theme=tech] .pvDailyArt{background:linear-gradient(135deg,#19435a,#252341)}
.pvDailyCard[data-theme=travel] .pvDailyArt{background:linear-gradient(135deg,#285749,#38304f)}
.pvDailyCard[data-theme=style] .pvDailyArt{background:linear-gradient(135deg,#633947,#42294f)}
.pvDailyCard[data-theme=studio] .pvDailyArt{background:linear-gradient(135deg,#68462e,#3d274b)}
.pvDailyArt small{font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#f1d9ff}
.pvDailyArt strong{font-size:20px;line-height:1.18;color:white;overflow-wrap:anywhere}
.pvDailyText{padding:12px 13px;color:#d1c6df;font-size:12px;line-height:1.65}
.pvDailyText p{margin:0 0 10px}
.pvDailyText .pvDailyPrompt{color:#f2e4ff;font-weight:650}
.pvDailyFooter{text-align:center;padding:10px}
.pvDailyMore{background:#654198;border:1px solid #9670cc;border-radius:11px;color:#fff;cursor:pointer;padding:11px 16px;font-weight:750}
@media(max-width:630px){.pvDailyCards{grid-template-columns:1fr}.pvDailyArt{min-height:110px}.pvDailyShowcase{margin-top:12px}}
@media(prefers-reduced-motion:reduce){.pvDailyShowcase *{animation:none!important;transition:none!important}}
`;
document.head.append(style);
let renderedDay=null,shown=0,entries=[];
function cardFor(p){
 const c=E('article','pvDailyCard');c.dataset.theme=p.kind;
 const top=E('div','pvDailyWho'),who=E('strong','','@'+p.creator.username),badge=E('span','pvDailyBadge','VIRTUAL · DEMO');
 top.append(who,badge);
 const art=E('div','pvDailyArt'),kind=E('small','',p.creator.theme),headline=E('strong','',p.title);
 art.append(kind,headline);
 const main=E('div','pvDailyText'),fact=E('p','',p.insight),prompt=E('p','pvDailyPrompt',p.exercise),date=E('small','',p.date+' · Editorial concept');
 main.append(fact,prompt,date);
 c.append(top,art,main);return c;
}
function drawNext(){
 const next=Math.min(entries.length,shown+12);
 const frag=document.createDocumentFragment();
 for(let i=shown;i<next;i++)frag.append(cardFor(entries[i]));
 cards.append(frag);shown=next;
 more.hidden=shown>=entries.length;
 more.textContent='Load more creator posts ('+shown+'/'+entries.length+')';
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
 meta.textContent='100 virtual creators published 1 curated DEMO post each today · '+dateLabel(day)+' · One curated demo post per profile per day at 9 AM IST (60-day editorial rotation). Clearly labeled virtual content; real uploaded posts appear above. No fake likes or automated DMs.';
 drawNext();
}
sync(true);
setInterval(()=>sync(),60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
window.addEventListener('pageshow',()=>sync());
})();