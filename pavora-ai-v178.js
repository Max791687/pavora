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
  <div class="pvAiLearnTools">
    <button type="button" id="pvAiTeachToggle">✦ Teach PAVORA AI something</button>
    <p>Share an app-related fact voluntarily. Nothing from your private chats is collected. Submissions need admin approval before other users can see them.</p>
    <form id="pvAiTeachForm" hidden>
      <label for="pvAiTeachQuestion">Question people might ask</label>
      <input id="pvAiTeachQuestion" required maxlength="240" minlength="5" placeholder="e.g. How do I report a Reel?">
      <label for="pvAiTeachAnswer">Suggested answer</label>
      <textarea id="pvAiTeachAnswer" required maxlength="1200" minlength="5" rows="3" placeholder="Write a factual answer, without personal details"></textarea>
      <button type="submit">Submit for review</button>
      <span id="pvAiTeachStatus" role="status"></span>
    </form>
    <div id="pvAiAdminReview" hidden><button type="button" id="pvAiReviewRefresh">Review user suggestions</button><div id="pvAiPending"></div></div>
  </div>
  <p class="pvAiDisclosure">PAVORA AI currently offers guided answers plus admin-reviewed community knowledge. It does not automatically train a generative model or read private messages.</p>
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
#pvAiView .pvAiTyping{align-self:flex-start;display:flex;flex-direction:column;align-items:flex-start;gap:7px;margin:1px 0 3px;max-width:220px}
#pvAiView .pvAiTypingLabel{font-size:11px;color:#d7cbfa;padding-left:8px;font-weight:600}
#pvAiView .pvAiTypingDots{display:flex;align-items:center;gap:5px;min-height:35px;padding:8px 15px;border:1px solid #ffffff69;border-radius:19px 19px 19px 6px;background:linear-gradient(125deg,#c5bdf350,#759de84a);backdrop-filter:blur(16px);box-shadow:inset 0 1px #fff5,0 8px 21px #160f3a3d}
#pvAiView .pvAiTypingDots i{display:block;width:7px;height:7px;border-radius:50%;background:#f4efff;opacity:.45;animation:pvAiDot179 1.05s ease-in-out infinite}
#pvAiView .pvAiTypingDots i:nth-child(2){animation-delay:.16s}
#pvAiView .pvAiTypingDots i:nth-child(3){animation-delay:.32s}
@keyframes pvAiDot179{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}
@media(prefers-reduced-motion:reduce){#pvAiView .pvAiTypingDots i{animation:none!important;opacity:.85}}

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
#pvAiView .pvAiLearnTools{margin:20px 0 4px;padding:14px;border-radius:18px;background:#d2b4ff20;border:1px solid #dbc4ff56}
#pvAiView .pvAiLearnTools>button,#pvAiView .pvAiLearnTools form button,#pvAiView #pvAiAdminReview button{border:1px solid #ddc2ff83;background:linear-gradient(120deg,#ab7dff88,#6553bb8a);color:#fff;border-radius:12px;padding:10px 13px;font-size:12px}
#pvAiView .pvAiLearnTools>p{margin:8px 0 0;color:#dbd0f6;font-size:11px;line-height:1.5}
#pvAiView #pvAiTeachForm{display:flex;flex-direction:column;gap:8px;margin-top:12px}
#pvAiView #pvAiTeachForm[hidden],#pvAiView #pvAiAdminReview[hidden]{display:none!important}
#pvAiView #pvAiTeachForm label{font-size:12px;font-weight:700}
#pvAiView #pvAiTeachForm input,#pvAiView #pvAiTeachForm textarea{width:100%;padding:10px;border:1px solid #d2b5ff78;border-radius:12px;background:#0d10387c;color:#fff;outline:none;resize:vertical;min-width:0}
#pvAiView #pvAiTeachForm input::placeholder,#pvAiView #pvAiTeachForm textarea::placeholder{color:#cbc0eb}
#pvAiView #pvAiTeachStatus{font-size:11px;line-height:1.4;color:#e3d5ff}
#pvAiView #pvAiAdminReview{margin-top:15px;padding-top:12px;border-top:1px solid #ffffff40}
#pvAiView .pvAiReviewItem{padding:11px 0;border-bottom:1px solid #fff3;overflow-wrap:anywhere;font-size:12px}
#pvAiView .pvAiReviewItem p{white-space:pre-wrap}
#pvAiView .pvAiReviewItem button{margin-right:8px}

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
// Knowledge is read from RLS-protected, admin-approved records only.
// No user messages are stored or trained on by this module.
let knowledgeCache=[],knowledgeAt=0;
const dbForAi=()=>window.PAVORA_AI_DB||null;
const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9\u0900-\u097f ]/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set(['the','and','for','how','who','what','where','when','does','can','are','is','of','to','a','an','my','me','in','on','do','i','pavora','ai','hai','ka','ki','ke','kya','se','ko']);
const tokens=s=>new Set(normalize(s).split(' ').filter(x=>x.length>2&&!stop.has(x)));
async function loadApproved(){
 const db=dbForAi();if(!db)return knowledgeCache;
 if(Date.now()-knowledgeAt<60000)return knowledgeCache;
 try{
  const {data,error}=await db.from('pv_ai_knowledge').select('id,question,answer').eq('status','approved').limit(150);
  if(error)throw error;
  knowledgeCache=data||[];knowledgeAt=Date.now();
 }catch(err){console.warn('AI knowledge temporarily unavailable',err?.message||err)}
 return knowledgeCache;
}
async function learnedAnswer(question){
 // Official founder attribution cannot be overwritten by community submissions.
 if(/(owner|founder|pavan|pawan|mandal|maalik|malik|kisne.*banaya|kis ka app|ceo)/i.test(question))return respond(question);
 const items=await loadApproved(),query=normalize(question),qt=tokens(question);
 let best=null,score=0;
 for(const item of items){
  const saved=normalize(item.question);
  const st=tokens(item.question);
  const overlap=[...qt].filter(word=>st.has(word)).length;
  const similarity=query===saved?1:st.size&&qt.size?overlap/Math.max(qt.size,st.size):0;
  if(similarity>score){score=similarity;best=item}
 }
 if(best&&score>=.72)return best.answer+'\n\n✓ Verified PAVORA community knowledge';
 return respond(question);
}
const teachForm=view.querySelector('#pvAiTeachForm'),teachStatus=view.querySelector('#pvAiTeachStatus');
view.querySelector('#pvAiTeachToggle').addEventListener('click',()=>{
 teachForm.hidden=!teachForm.hidden;
 if(!teachForm.hidden)view.querySelector('#pvAiTeachQuestion').focus({preventScroll:true});
});
teachForm.addEventListener('submit',async e=>{
 e.preventDefault();
 const question=view.querySelector('#pvAiTeachQuestion').value.trim();
 const answer=view.querySelector('#pvAiTeachAnswer').value.trim();
 if(question.length<5||answer.length<5)return;
 const db=dbForAi();if(!db){teachStatus.textContent='Sign in to submit knowledge.';return}
 const btn=teachForm.querySelector('button[type=submit]');btn.disabled=true;
 teachStatus.textContent='Submitting for review…';
 try{
  const {data:auth}=await db.auth.getUser();
  if(!auth?.user)throw Error('Please sign in first.');
  const {error}=await db.from('pv_ai_knowledge').insert({question,answer});
  if(error)throw error;
  teachForm.reset();
  teachStatus.textContent='Suggestion saved for admin review. It will not be public until approved.';
 }catch(err){teachStatus.textContent='Could not submit: '+(err?.message||'Try again.')}
 finally{btn.disabled=false}
});
const reviewBox=view.querySelector('#pvAiAdminReview'),pending=view.querySelector('#pvAiPending');
async function loadReview(){
 const db=dbForAi();if(!db)return;
 pending.textContent='Loading suggestions…';
 try{
  const {data,error}=await db.from('pv_ai_knowledge').select('id,question,answer,created_at').eq('status','pending').order('created_at',{ascending:false}).limit(40);
  if(error)throw error;
  pending.replaceChildren();
  if(!data?.length){pending.textContent='No pending suggestions.';return}
  for(const item of data){
   const card=document.createElement('div');card.className='pvAiReviewItem';
   const title=document.createElement('strong');title.textContent=item.question;
   const answer=document.createElement('p');answer.textContent=item.answer;
   card.append(title,answer);
   for(const [label,status] of [['Approve','approved'],['Reject','rejected']]){
    const btn=document.createElement('button');btn.type='button';btn.textContent=label;
    btn.onclick=async()=>{
     btn.disabled=true;
     const {error}=await db.from('pv_ai_knowledge').update({status,reviewed_at:new Date().toISOString()}).eq('id',item.id);
     if(error){btn.disabled=false;alert('Review unavailable: '+error.message);return}
     knowledgeAt=0;card.remove();
    };
    card.append(btn);
   }
   pending.append(card);
  }
 }catch(err){pending.textContent='Could not load reviews: '+(err?.message||err)}
}
view.querySelector('#pvAiReviewRefresh').addEventListener('click',loadReview);
async function detectAdmin(){
 const db=dbForAi();if(!db)return;
 try{
  const {data:auth}=await db.auth.getUser();
  if(!auth?.user)return;
  const {data}=await db.from('pv_app_admins').select('user_id').eq('user_id',auth.user.id).maybeSingle();
  reviewBox.hidden=!data;
 }catch(err){reviewBox.hidden=true}
}
setTimeout(detectAdmin,1800);

// Show realistic chat feedback before each reply, without blocking input.
// The assistant remains a local guided responder; timing is a UI effect.
const replyQueue=[];
let replying=false;
function showTyping(){
 const indicator=document.createElement('div');
 indicator.className='pvAiTyping';
 indicator.setAttribute('role','status');
 indicator.setAttribute('aria-label','PAVORA AI is typing');
 const label=document.createElement('span');label.className='pvAiTypingLabel';label.textContent='PAVORA AI is typing…';
 const dots=document.createElement('span');dots.className='pvAiTypingDots';dots.setAttribute('aria-hidden','true');
 for(let i=0;i<3;i++)dots.append(document.createElement('i'));
 indicator.append(label,dots);list.append(indicator);list.scrollTop=list.scrollHeight;
 return indicator;
}
async function drainReplies(){
 if(replying)return;
 replying=true;
 try{
  while(replyQueue.length){
   const question=replyQueue.shift();
   const indicator=showTyping();
   // Readable, human-paced visual feedback rather than an instant response.
   // Avoid excessive delays for long answers and keep each message in order.
   const delay=Math.min(1750,Math.max(800,650+question.length*12));
   await new Promise(resolve=>setTimeout(resolve,delay));
   indicator.remove();
   addMessage(await learnedAnswer(question),'bot');
  }
 }finally{replying=false}
}
function send(text){
 const value=String(text||'').trim().slice(0,400);if(!value)return;
 addMessage(value,'user');input.value='';
 replyQueue.push(value);
 void drainReplies();
}
form.addEventListener('submit',event=>{event.preventDefault();send(input.value)});
view.addEventListener('click',event=>{
 const btn=event.target.closest('button[data-prompt]');
 if(btn&&view.contains(btn))send(btn.dataset.prompt);
});
window.PAVORA_AI={onNavigate(route){view.classList.toggle('hide',route!=='ai');if(route==='ai'){void detectAdmin();void loadApproved();}},focus(){input.focus({preventScroll:true})},version:'180',mode:'reviewed-knowledge'};
})();
