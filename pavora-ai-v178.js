/* PAVORA AI v178 — independent guided assistant with zero paid API dependency.
   No external AI claims; safe static knowledge and on-device writing prompts.
   Never touches Supabase, auth, Reels playback, DMs or service-worker state. */
(()=>{
'use strict';
if(window.PAVORA_AI)return;
const view=document.createElement('section');
view.id='pvAiView';view.className='hide';view.setAttribute('aria-label','PAVORA AI Assistant');
view.innerHTML=`
 <div class="pvAiShell">
  <div class="pvAiHead"><div class="pvAiBrand"><span class="pvAiMonogram" aria-hidden="true">✦</span><span>PAVORA <b>AI</b></span></div><span class="pvAiMode">✧ PAVORA Assistant</span></div>
  <div class="pvAiHero"><div class="pvAiOrb" aria-hidden="true"><span>✦</span></div><h1>PAVORA AI</h1><p>Ask anything about PAVORA</p></div>
  <div class="pvAiConversation" id="pvAiConversation" aria-live="polite" aria-relevant="additions">
   <div class="pvAiStarter"><span class="pvAiSmallStar">✦</span><p>Hi! I can help you explore PAVORA, write captions and bios, and answer questions about the app.</p><small>Free guided assistant · No external AI service connected</small></div>
  </div>
  <div class="pvAiPrompts" id="pvAiPrompts">
   <button type="button" data-prompt="Who is the owner of PAVORA?">✦ Owner info</button>
   <button type="button" data-prompt="Write a caption for my photo">✎ Write caption</button>
   <button type="button" data-prompt="Help me improve my profile">♙ Profile help</button>
   <button type="button" data-prompt="How do I use PAVORA?">▤ App guide</button>
   <button type="button" data-prompt="Give me creator tips">☆ Creator tips</button>
   <button type="button" data-prompt="How do I get support?">◈ Support</button>
  </div>
  <div class="pvAiCards">
   <button type="button" data-prompt="Give me bio ideas"><span>❧</span><strong>Bio Ideas</strong><small>Catchy bios for your profile</small><em>›</em></button>
   <button type="button" data-prompt="Suggest hashtags for my reel"><span>#</span><strong>Hashtag Help</strong><small>Find relevant hashtag ideas</small><em>›</em></button>
   <button type="button" data-prompt="Explain PAVORA features"><span>▱</span><strong>Feature Guide</strong><small>Learn how PAVORA works</small><em>›</em></button>
  </div>
  <form class="pvAiComposer" id="pvAiForm"><label for="pvAiInput" class="pvAiVisuallyHidden">Message PAVORA AI</label><span aria-hidden="true">✦</span><input id="pvAiInput" type="text" maxlength="400" autocomplete="off" placeholder="Ask PAVORA AI…" required/><button type="submit" aria-label="Send message">➤</button></form>
  <p class="pvAiDisclosure">PAVORA AI currently provides guided answers and writing ideas. It is not a general-purpose generative AI or live support agent.</p>
 </div>`;
const style=document.createElement('style');style.id='pvAiStyle178';
style.textContent=`
#pvAiView.hide{display:none!important}
body.pvAiMode #pvAiView{display:block!important}
body.pvAiMode main{min-width:0!important}
body.pvAiMode #pvAiView{width:100%;max-width:880px;margin:0 auto;min-width:0;padding:0 0 28px;color:#fff}
#pvAiView *{box-sizing:border-box}
#pvAiView .pvAiShell{position:relative;isolation:isolate;overflow:hidden;padding:23px clamp(13px,3vw,34px) 19px;border-radius:28px;
background:radial-gradient(ellipse at 87% 23%,#6074df40,transparent 39%),radial-gradient(ellipse at 12% 13%,#a852fc4a,transparent 44%),linear-gradient(145deg,#15143f,#2b215c 60%,#131a45);
border:1px solid #c6adff61;box-shadow:0 15px 60px #0908234a;min-height:650px}
#pvAiView .pvAiShell:before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;
background:linear-gradient(145deg,transparent 18%,#b998ff18 38%,transparent 59%),radial-gradient(circle at 70% 65%,#529bed1b,transparent 40%)}
#pvAiView button{font-family:inherit;cursor:pointer}
#pvAiView .pvAiHead,#pvAiView .pvAiBrand{display:flex;align-items:center}
#pvAiView .pvAiHead{justify-content:space-between;gap:8px;font-weight:790;font-size:16px}
#pvAiView .pvAiBrand{gap:9px;letter-spacing:.04em}
#pvAiView .pvAiBrand b{font-weight:500;color:#c4b3ff}
#pvAiView .pvAiMonogram{display:grid;place-items:center;width:31px;height:31px;border-radius:12px;color:#fff;font-size:21px;background:linear-gradient(135deg,#9875ff,#5033a3);border:1px solid #e6ddff8c;box-shadow:inset 0 1px #fff8}
#pvAiView .pvAiMode{font-size:10px;color:#e9dfff;padding:8px 12px;border-radius:999px;background:#e9d9ff19;border:1px solid #f2e4ff5e;backdrop-filter:blur(14px);white-space:nowrap}
#pvAiView .pvAiHero{text-align:center;margin:20px 0 24px}
#pvAiView .pvAiOrb{display:grid;place-items:center;margin:0 auto 10px;width:91px;height:91px;border-radius:50%;background:radial-gradient(circle at 30% 18%,#c0fbff,#8190ff 28%,#6232d8 68%,#2c196a);border:2px solid #dee6ffb0;box-shadow:inset 4px 7px 15px #ffffff94,inset -8px -10px 19px #301277a1,0 5px 22px #9c61ff9c}
#pvAiView .pvAiOrb span{font-size:46px;color:#fff;text-shadow:0 0 12px #fff}
#pvAiView .pvAiHero h1{font-size:clamp(29px,5vw,41px);letter-spacing:.035em;margin:0;font-weight:820;text-shadow:0 2px 18px #8656ff}
#pvAiView .pvAiHero p{font-size:clamp(14px,2.4vw,17px);color:#d1c8f8;margin:5px 0 0}
#pvAiView .pvAiConversation{display:flex;flex-direction:column;gap:13px;min-height:145px;max-height:380px;overflow-y:auto;overscroll-behavior:contain;padding:6px 4px 14px;scrollbar-width:thin}
#pvAiView .pvAiStarter,#pvAiView .pvAiMessage{max-width:min(94%,540px);font-size:14px;line-height:1.55;overflow-wrap:anywhere}
#pvAiView .pvAiStarter{align-self:center;text-align:center;padding:20px 24px;border:1px solid #e6ddff49;border-radius:24px;background:#e5dcff18;backdrop-filter:blur(12px);color:#f8f5ff}
#pvAiView .pvAiStarter p{margin:7px 0}
#pvAiView .pvAiStarter small{font-size:10px;color:#cfc1f0}
#pvAiView .pvAiSmallStar{font-size:26px}
#pvAiView .pvAiMessage{border:1px solid #ffffff65;border-radius:22px;padding:13px 16px;box-shadow:inset 0 1px #fff5,0 8px 21px #160f3a3d;white-space:pre-wrap}
#pvAiView .pvAiMessage.user{align-self:flex-end;border-bottom-right-radius:7px;background:linear-gradient(125deg,#af7aff8f,#6036cc97)}
#pvAiView .pvAiMessage.bot{align-self:flex-start;border-bottom-left-radius:7px;background:linear-gradient(125deg,#c5bdf350,#759de84a);backdrop-filter:blur(16px)}
#pvAiView .pvAiMessage small{display:block;margin-top:10px;padding-top:8px;border-top:1px solid #ffffff2c;color:#ded8f8;font-size:10px}
#pvAiView .pvAiPrompts{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:9px 0 18px}
#pvAiView .pvAiPrompts button{padding:9px 13px;border:1px solid #f0dfff75;border-radius:999px;color:white;font-size:12px;background:linear-gradient(130deg,#ab8bff46,#a9caf51c);box-shadow:inset 0 1px #fff6;backdrop-filter:blur(13px)}
#pvAiView .pvAiCards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-bottom:22px}
#pvAiView .pvAiCards button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:7px;min-width:0;min-height:137px;position:relative;
border-radius:22px;padding:16px 13px;background:linear-gradient(148deg,#e4ccff52,#6f74c84a 75%,#a5bdf73b);color:white;border:1px solid #edddff89;box-shadow:inset 0 1px #fff8,0 10px 25px #09062737;backdrop-filter:blur(14px)}
#pvAiView .pvAiCards button>span{font-size:25px;line-height:1}
#pvAiView .pvAiCards strong{font-size:15px}
#pvAiView .pvAiCards small{font-size:11px;line-height:1.35;color:#e3dcfd;max-width:90%}
#pvAiView .pvAiCards em{position:absolute;bottom:8px;right:12px;font-size:23px;font-style:normal}
#pvAiView .pvAiComposer{display:flex;align-items:center;gap:11px;padding:7px 8px 7px 15px;border-radius:999px;
border:1px solid #e9d7ffb3;background:linear-gradient(110deg,#dfd7ff4a,#adc5f141);box-shadow:inset 0 2px #fff5,0 9px 25px #22134d69;backdrop-filter:blur(18px)}
#pvAiView .pvAiComposer>span{font-size:21px;color:#e9d7ff}
#pvAiView .pvAiComposer input{width:100%;flex:1;min-width:0;padding:10px 0!important;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;color:white!important;font-size:15px!important}
#pvAiView .pvAiComposer input::placeholder{color:#d8cdef}
#pvAiView .pvAiComposer button{width:43px;height:43px;flex:0 0 43px;border-radius:50%;border:1px solid #ffffff99;color:white;font-size:20px;background:linear-gradient(135deg,#b889ff,#6232d9);box-shadow:inset 0 1px #fff7,0 3px 15px #9b62ff8c}
#pvAiView .pvAiVisuallyHidden{position:absolute;clip:rect(0,0,0,0);width:1px;height:1px;overflow:hidden}
#pvAiView .pvAiDisclosure{text-align:center;color:#beb2df;font-size:10px;line-height:1.5;margin:12px auto 0;max-width:560px}
#pvAiView .pvAiPrompts button:active,#pvAiView .pvAiCards button:active{transform:scale(.975)}
body.pvAiMode .pvIconRail .pvRailButton[data-rail-view="ai"]{color:#c8adff!important;background:linear-gradient(145deg,#9675f046,#6438d543)!important;box-shadow:inset 0 1px #fff7,0 0 16px #9f70f73b!important;border-radius:15px}
@media(max-width:700px){
 body.pvAiMode #pvAiView{padding:0 0 calc(78px + env(safe-area-inset-bottom,0px))!important;max-width:100vw!important}
 body.pvAiMode #pvAiView .pvAiShell{border-radius:0;min-height:calc(100dvh - 110px);padding:16px 12px 23px;border-left:0;border-right:0}
 #pvAiView .pvAiHero{margin:14px 0 17px}
 #pvAiView .pvAiOrb{width:75px;height:75px}
 #pvAiView .pvAiConversation{max-height:38dvh}
 #pvAiView .pvAiCards{gap:7px}
 #pvAiView .pvAiCards button{padding:12px 9px;min-height:123px;border-radius:18px;gap:6px}
 #pvAiView .pvAiCards strong{font-size:12px}
 #pvAiView .pvAiCards small{font-size:10px}
 #pvAiView .pvAiPrompts button{font-size:11px;padding:8px 10px}
 body .pvIconRail .pvRailButton[data-rail-view="ai"]{order:6}
 body .pvIconRail .pvRailButton[data-rail-view="profile"]{order:7}
}
@media(prefers-reduced-motion:reduce){#pvAiView *{scroll-behavior:auto!important;transition:none!important}}
`;
document.head.append(style);
(document.querySelector('main .feed')||document.querySelector('.feed')||document.body).append(view);
const list=view.querySelector('#pvAiConversation');
const input=view.querySelector('#pvAiInput');
const form=view.querySelector('#pvAiForm');
const respond=raw=>{
 const q=raw.toLowerCase().trim();
 if(/(owner|founder|pavan|pawan|mandal|maalik|malik|kisne.*banaya|kis ka app|ceo)/i.test(q))
  return 'PAVORA was founded and is owned by Pavan Mandal. This is the founder information provided for PAVORA.';
 if(/(caption|कैप्शन)/i.test(q))
  return 'Caption ideas ✨\n\n1. Little moments, big memories. 💜\n2. Creating my own sunshine. ☀️\n3. Just me, my vibe, my story. ✨\n\nTip: Tell me whether your post is about travel, friends, fashion, or food for a more relevant suggestion.';
 if(/(bio|profile help|प्रोफाइल|बायो)/i.test(q))
  return 'Bio ideas ✨\n\n• Dream big. Create daily. ✨\n• Finding beauty in everyday moments. 🌸\n• Creator | Storyteller | Always learning 🎬\n\nFor profile help: open Profile → Edit Profile to update your bio and photo.';
 if(/(hashtag|हैशटैग)/i.test(q))
  return 'Hashtag ideas: #PAVORA #Reels #CreativeCommunity #Creators #NewPost\n\nAdd 2–4 tags that actually describe the topic of your video. These are example tags, not live trending results.';
 if(/(support|help|problem|error|issue|सपोर्ट|मदद)/i.test(q))
  return 'For account or app problems, describe what happened and which screen you were using. Please do not share passwords or OTPs. You can use the app’s available report/help options where shown. I cannot access or fix your account from this chat.';
 if(/(tips|grow|followers|viral|creator|क्रिएटर)/i.test(q))
  return 'Creator tips ✨\n\n• Hook viewers in the first seconds.\n• Keep your videos clear and easy to watch.\n• Post original content consistently.\n• Reply to genuine comments.\n• Check what your audience actually enjoys.\n\nNo one can guarantee viral reach.';
 if(/(app|feature|guide|reels|story|stories|message|chat|call|कैसे|क्या है|how|pavora)/i.test(q))
  return 'Welcome to PAVORA! 💜\n\n• Home: see posts from the community.\n• Reels: watch and share short videos.\n• Messages: chat with other users.\n• Profile: customize your account.\n• Stories: share moments with your followers.\n\nAsk about a specific feature and I’ll explain what I know.';
 return 'I can help with PAVORA features, founder information, bio ideas, captions, hashtag suggestions and creator tips. For open-ended questions, a separate AI service would need to be connected.';
};
function addMessage(text,who){
 const bubble=document.createElement('div');bubble.className='pvAiMessage '+who;bubble.textContent=text;
 if(who==='bot'){const label=document.createElement('small');label.textContent='PAVORA guided knowledge & suggestions';bubble.append(label)}
 list.append(bubble);list.scrollTop=list.scrollHeight;
}
function send(text){
 const value=String(text||'').trim().slice(0,400);if(!value)return;
 addMessage(value,'user');addMessage(respond(value),'bot');input.value='';
}
form.addEventListener('submit',event=>{event.preventDefault();send(input.value)});
view.addEventListener('click',event=>{
 const btn=event.target.closest('button[data-prompt]');
 if(btn&&view.contains(btn))send(btn.dataset.prompt);
});
window.PAVORA_AI={onNavigate(route){view.classList.toggle('hide',route!=='ai');},focus(){input.focus({preventScroll:true})},version:'178',mode:'guided'};
})();
