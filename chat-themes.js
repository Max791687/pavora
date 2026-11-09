/* PAVORA Chat Themes — original gradient artworks, no third-party imagery.
   Settings are private to this browser/account and conversation. */
(function(){
 'use strict';
 const themes=[
  {id:'classic',name:'Classic Dark',icon:'🌑',bg:'#0d0f12',top:'#0d0f12',bubble:'#7549d8',ink:'#f8f5ff',art:'none'},
  {id:'anime',name:'Anime Dream',icon:'🌸',bg:'#18142d',top:'#201632',bubble:'#9b65de',ink:'#fff6ff',art:'radial-gradient(ellipse at 82% 20%,#ffb9d64d 0%,transparent 36%),radial-gradient(ellipse at 12% 86%,#9982f54a 0%,transparent 48%),linear-gradient(145deg,#242041,#3b2750 48%,#242f57)'},
  {id:'sakura',name:'Sakura',icon:'🌺',bg:'#351c34',top:'#352037',bubble:'#dc6fac',ink:'#fff7fd',art:'radial-gradient(circle at 78% 16%,#ffb9db77 0%,transparent 26%),radial-gradient(circle at 15% 65%,#f871a742 0%,transparent 48%),linear-gradient(140deg,#4d2747,#31203c)'},
  {id:'galaxy',name:'Galaxy',icon:'🌌',bg:'#111231',top:'#141430',bubble:'#6251db',ink:'#f8f7ff',art:'radial-gradient(circle at 20% 25%,#b9a1ff80 0 1px,transparent 2px),radial-gradient(circle at 74% 65%,#f5d8ff99 0 1px,transparent 2px),radial-gradient(ellipse at 70% 30%,#6f4dc85c,transparent 47%),linear-gradient(135deg,#070a25,#201143 64%,#080e31)'},
  {id:'neon',name:'Neon Nights',icon:'💜',bg:'#091920',top:'#081e27',bubble:'#ac26d7',ink:'#fff8ff',art:'radial-gradient(ellipse at 82% 20%,#23cbde40 0%,transparent 45%),linear-gradient(160deg,#061b29,#160b2a 66%,#281039)'},
  {id:'love',name:'Love Hearts',icon:'💕',bg:'#37182c',top:'#371829',bubble:'#d64b84',ink:'#fff7fb',art:'radial-gradient(circle at 16% 20%,#ff77955b,transparent 38%),radial-gradient(circle at 78% 80%,#d757976b,transparent 44%),linear-gradient(140deg,#3b1530,#6b214b)'},
  {id:'sunset',name:'Sunset',icon:'🌅',bg:'#34202c',top:'#38202b',bubble:'#d97465',ink:'#fff9f0',art:'radial-gradient(ellipse at 70% 75%,#f8aa6655,transparent 45%),linear-gradient(150deg,#301f40,#6b3452 70%,#49293e)'},
  {id:'ocean',name:'Ocean',icon:'🌊',bg:'#0a2831',top:'#0d2731',bubble:'#168eaa',ink:'#eefbff',art:'radial-gradient(ellipse at 90% 15%,#48d8d94d,transparent 46%),linear-gradient(145deg,#102f47,#07333f 70%,#0d283b)'},
  {id:'forest',name:'Forest',icon:'🌿',bg:'#112b23',top:'#142d25',bubble:'#368e68',ink:'#f0fff6',art:'radial-gradient(ellipse at 5% 16%,#a0d18a33,transparent 44%),linear-gradient(150deg,#173b2a,#142b31 75%,#1d3021)'},
  {id:'royal',name:'Royal Gold',icon:'👑',bg:'#221b25',top:'#221c25',bubble:'#9e7943',ink:'#fff9ec',art:'radial-gradient(ellipse at 80% 14%,#d2a35033,transparent 40%),linear-gradient(155deg,#231b2b,#393025 60%,#1d1a26)'},
  {id:'cloud',name:'Pastel Clouds',icon:'☁️',bg:'#363447',top:'#393648',bubble:'#8475d5',ink:'#fffaff',art:'radial-gradient(ellipse at 20% 20%,#c6b5f57a,transparent 45%),radial-gradient(ellipse at 83% 80%,#f5b0cc65,transparent 40%),linear-gradient(135deg,#393347,#5d4b6e)'},
  {id:'midnight',name:'Midnight Blue',icon:'🌙',bg:'#111e38',top:'#13223b',bubble:'#3867bd',ink:'#f6faff',art:'radial-gradient(ellipse at 85% 10%,#c7cde04a,transparent 25%),linear-gradient(150deg,#10223b,#10152a 75%,#1a2852)'},
  {id:'coffee',name:'Coffee',icon:'☕',bg:'#2b2421',top:'#2d2621',bubble:'#876246',ink:'#fff8ee',art:'radial-gradient(ellipse at 10% 15%,#b88f6548,transparent 44%),linear-gradient(145deg,#32271f,#221f27)'}
 ];
 const byId=new Map(themes.map(t=>[t.id,t]));
 const css=document.createElement('style');
 css.textContent=`
 #pvInboxView .pvChatArea.pvChatThemed{background:var(--pvt-bg)!important;color:var(--pvt-ink)!important}
 #pvInboxView .pvChatThemed .pvChatTop{background:var(--pvt-top)!important}
 #pvInboxView .pvChatThemed .pvMessages{background:var(--pvt-art)!important;background-color:var(--pvt-bg)!important;background-size:100% 100%;color:var(--pvt-ink)}
 #pvInboxView .pvChatThemed .pvBubble.mine{background:var(--pvt-bubble)!important;color:#fff!important}
 #pvInboxView .pvChatThemed .pvBubble:not(.mine){background:color-mix(in srgb,var(--pvt-bg),#ffffff 14%)!important;color:var(--pvt-ink)!important}
 #pvInboxView .pvChatThemed .pvChatComposerWrap{background:var(--pvt-top)!important}
 #pvInboxView .pvChatThemeTrigger{display:grid;place-items:center;flex:none;min-width:33px;height:35px;padding:4px 6px;border:0;border-radius:10px;background:transparent;color:#f8f4ff;font-size:22px}
 #pvInboxView .pvChatThemeTrigger:hover,#pvInboxView .pvChatThemeTrigger:focus-visible{background:#ffffff20}
 .pvThemeOverlay{position:fixed;inset:0;z-index:700;background:#000b;display:flex;justify-content:center;align-items:center;padding:16px;overscroll-behavior:contain}
 .pvThemeOverlay[hidden]{display:none!important}
 .pvThemeCard{width:min(490px,100%);max-height:min(85dvh,680px);min-height:0;display:flex;flex-direction:column;background:#202027;border:1px solid #42404c;border-radius:20px;box-shadow:0 20px 70px #000c;color:#fff;overflow:hidden}
 .pvThemeHead{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:17px 17px 13px;border-bottom:1px solid #3c3945}
 .pvThemeHead strong{font-size:17px}
 .pvThemeHead button{border:0;border-radius:50%;background:#393742;color:#fff;width:34px;height:34px;font-size:22px}
 .pvThemeHint{font-size:12px;line-height:1.5;color:#bdb6c9;padding:12px 17px 0;margin:0}
 .pvThemeGrid{min-height:0;overflow-y:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;padding:15px;overscroll-behavior:contain}
 .pvThemeOption{min-width:0;display:flex;flex-direction:column;gap:6px;background:transparent;border:2px solid transparent;padding:5px;border-radius:13px;color:white;text-align:center;cursor:pointer}
 .pvThemeOption.active{border-color:#d6a2fb;background:#4b38566b}
 .pvThemeSample{height:90px;width:100%;display:flex;align-items:flex-end;justify-content:flex-end;padding:10px;border:1px solid #ffffff22;border-radius:10px;background:var(--pvt-art);background-color:var(--pvt-bg);overflow:hidden}
 .pvThemeSample span{font-size:23px;display:grid;place-items:center;width:42px;height:31px;background:var(--pvt-bubble);border-radius:14px 14px 4px 14px}
 .pvThemeOption b{font-size:12px;font-weight:700;line-height:1.3;white-space:normal}
 .pvThemeOption small{font-size:10px;color:#c7bfce}
 @media(max-width:700px){.pvThemeOverlay{align-items:flex-end;padding:0}.pvThemeCard{width:100%;max-height:min(82dvh,700px);border-radius:22px 22px 0 0;padding-bottom:env(safe-area-inset-bottom,0px)}.pvThemeGrid{gap:7px;padding:10px}.pvThemeSample{height:78px;padding:7px}}
 `;
 document.head.append(css);
 let overlay=null;
 function key(uid,peer){return 'pavora-chat-theme-v1:'+uid+':'+peer}
 function read(uid,peer){try{const value=localStorage.getItem(key(uid,peer));return byId.has(value)?value:'classic'}catch{return 'classic'}}
 function set(uid,peer,id){if(!byId.has(id))return;try{localStorage.setItem(key(uid,peer),id)}catch{}}
 function decorate(el,theme){
  el.style.setProperty('--pvt-bg',theme.bg);
  el.style.setProperty('--pvt-top',theme.top);
  el.style.setProperty('--pvt-bubble',theme.bubble);
  el.style.setProperty('--pvt-ink',theme.ink);
  el.style.setProperty('--pvt-art',theme.art);
 }
 function apply(area,uid,peer){if(!area||!uid||!peer)return;area.classList.add('pvChatThemed');decorate(area,byId.get(read(uid,peer))||themes[0])}
 function close(){if(overlay){overlay.remove();overlay=null}}
 function open(area,uid,peer){
  if(!area||!uid||!peer)return;
  close();
  overlay=document.createElement('div');overlay.className='pvThemeOverlay';
  const card=document.createElement('div');card.className='pvThemeCard';card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label','Choose chat theme');
  const head=document.createElement('div');head.className='pvThemeHead';
  const title=document.createElement('strong');title.textContent='Chat themes';
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='×';dismiss.setAttribute('aria-label','Close themes');dismiss.onclick=close;
  head.append(title,dismiss);
  const hint=document.createElement('p');hint.className='pvThemeHint';hint.textContent='Pick a look for this conversation. Only you see it on this device.';
  const grid=document.createElement('div');grid.className='pvThemeGrid';
  for(const theme of themes){
   const btn=document.createElement('button');btn.className='pvThemeOption';btn.type='button';btn.setAttribute('aria-label',theme.name);
   decorate(btn,theme);btn.classList.toggle('active',read(uid,peer)===theme.id);btn.setAttribute('aria-pressed',String(read(uid,peer)===theme.id));
   const sample=document.createElement('span');sample.className='pvThemeSample';const glyph=document.createElement('span');glyph.textContent=theme.icon;sample.append(glyph);
   const name=document.createElement('b');name.textContent=theme.name;
   btn.append(sample,name);
   btn.onclick=()=>{set(uid,peer,theme.id);apply(area,uid,peer);close()};
   grid.append(btn);
  }
  card.append(head,hint,grid);overlay.append(card);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}});
  document.body.append(overlay);dismiss.focus({preventScroll:true});
 }
 window.PAVORA_CHAT_THEMES={apply,open,count:themes.length};
})();