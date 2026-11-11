/* PAVORA v81 — native-feeling navigation and feed polish.
   Use the existing navigation and post handlers; only enhance presentation.
*/
(()=>{
'use strict';
const css=document.createElement('style');
css.textContent=`
/* Reduce desktop card noise without changing existing feature layouts. */
body:not(.pvReelsMode):not(.pvMessagesMode) #home .post{
 transition:border-color .18s ease,box-shadow .18s ease;
}
#home .posthead .profilepic,#home .pvDailyCard .profilepic{
 box-shadow:0 0 0 1px #a076ce55;
}
#home .posthead{gap:11px}
#home .postbody{line-height:1.5}
#home .post img{background:#15131a}
#home .postfoot button{transition:color .15s ease,transform .15s ease}
@media(hover:hover){
 #home .postfoot button:hover{color:#e8a6f2}
 .pvRailButton:hover{transform:translateY(-1px)}
}
/* A small underline, not a large flashing tile, for the active destination. */
@media(max-width:600px){
 .pvIconRail{height:calc(59px + env(safe-area-inset-bottom,0px))!important;padding:3px 5px max(3px,env(safe-area-inset-bottom,0px))!important;background:#0b0b10f5!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
 .pvRailButton{min-height:48px;height:48px!important;border-radius:10px!important;position:relative}
 .pvRailButton.active{background:transparent!important;color:#fff!important}
 .pvRailButton.active::after{content:'';position:absolute;bottom:1px;left:50%;width:20px;height:2px;border-radius:9px;transform:translateX(-50%);background:#f2c1f9}
 .pvRailButton svg{width:25px;height:25px;transition:transform .14s ease}
 .pvRailButton:active svg{transform:scale(.87)}
 #home .post{margin:0 0 10px!important;border-radius:0!important;border-left:0!important;border-right:0!important;border-top:0!important;padding:0 0 5px!important}
 #home .posthead{padding:11px 13px!important}
 #home .postbody{padding:0 13px 12px!important;font-size:13px}
 #home .postfoot{padding:11px 13px 12px!important}
 #home .post img{width:100%;max-width:100%;object-fit:contain;display:block}
 #home .pvDailyCard .pvDailyPhotoWrap img{max-height:min(540px,75dvh)}
 #home .story{margin-bottom:8px!important}
 .pvFeedModeTabs{margin:1px 0 10px!important}
 .pvFeedModeTabs button{min-width:92px;min-height:42px}
}
@media(prefers-reduced-motion:no-preference){
 #home:not(.hide),#explore:not(.hide),#profile:not(.hide){
  animation:pvNativeScreenIn .16s ease-out both;
 }
 @keyframes pvNativeScreenIn{from{opacity:.84;transform:translateY(5px)}to{opacity:1;transform:none}}
}
@media(prefers-reduced-motion:reduce){
 #home,#explore,#profile{animation:none!important}
}
`;
document.head.append(css);
const selectors=['home','explore','profile'];
const scrollPositions=new Map();
let lastView='home';
function currentView(){
 const b=document.body;
 if(b.classList.contains('pvMessagesMode'))return 'messages';
 if(b.classList.contains('pvReelsMode'))return 'reels';
 if(b.classList.contains('pvProfileMode'))return 'profile';
 if(b.classList.contains('pvExploreMode'))return 'explore';
 return 'home';
}
function scrollY(){return window.scrollY||document.documentElement.scrollTop||0}
function navigateHint(next){
 if(!next)return;
 const previous=currentView();
 if(previous===next){
  if(next==='home'||next==='explore'||next==='profile'){
   window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  }
  return;
 }
 if(selectors.includes(previous))scrollPositions.set(previous,scrollY());
 // Do not change scroll on the fullscreen Reel/DM views; they own their viewport.
 if(!selectors.includes(next)){lastView=next;return}
 const restore=scrollPositions.get(next)||0;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(currentView()===next)window.scrollTo({top:restore,behavior:'instant'});
 }));
 lastView=next;
}
document.addEventListener('click',event=>{
 const nav=event.target.closest?.('.pvRailButton[data-rail-view], aside.left [data-view]');
 if(!nav)return;
 navigateHint(nav.dataset.railView||nav.dataset.view);
},true);
// Save current position if installed app is backgrounded.
document.addEventListener('visibilitychange',()=>{
 if(document.hidden&&selectors.includes(currentView()))scrollPositions.set(currentView(),scrollY());
});
})();
