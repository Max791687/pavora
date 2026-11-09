/* PAVORA v38 — lightweight in-chat message search.
   Searches only the messages already loaded for the open conversation.
   No extra server request or cross-conversation data exposure. */
(()=>{
'use strict';
const style=document.createElement('style');
style.textContent=`
#pvInboxView .pvDmSearchButton{width:34px;height:35px;min-width:34px;border:0;background:transparent;color:#f3edf9;border-radius:9px;display:grid;place-items:center;cursor:pointer;flex:none}
#pvInboxView .pvDmSearchButton:hover,#pvInboxView .pvDmSearchButton:focus-visible{background:#ffffff21}
#pvInboxView .pvDmSearchButton svg{width:21px;height:21px}
#pvInboxView .pvDmSearchPanel{position:absolute;z-index:21;inset:63px 0 0;display:flex;flex-direction:column;min-height:0;background:#16141df5;border-top:1px solid #40384a;box-shadow:0 10px 30px #0006;overflow:hidden}
#pvInboxView .pvDmSearchPanel[hidden]{display:none!important}
#pvInboxView .pvDmSearchRow{padding:12px 14px;display:flex;align-items:center;gap:9px;flex:none}
#pvInboxView .pvDmSearchInput{flex:1;width:0;min-width:0;border:1px solid #655572;border-radius:11px;background:#24202c;color:#fff;padding:12px;font-size:14px;outline:0}
#pvInboxView .pvDmSearchInput:focus{border-color:#bd8ef6}
#pvInboxView .pvDmSearchClose{border:0;border-radius:9px;background:#392a48;color:#fff;font-weight:700;padding:10px 12px;cursor:pointer}
#pvInboxView .pvDmSearchCount{font-size:12px;color:#bcb1c8;padding:0 17px 9px;margin:0}
#pvInboxView .pvDmSearchResults{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:0 10px 12px}
#pvInboxView .pvDmSearchResult{width:100%;display:flex;flex-direction:column;gap:6px;text-align:left;border:0;border-bottom:1px solid #ffffff13;background:transparent;color:#eee8f5;padding:13px 11px;cursor:pointer;border-radius:9px}
#pvInboxView .pvDmSearchResult:hover,#pvInboxView .pvDmSearchResult:focus-visible{background:#372b45}
#pvInboxView .pvDmSearchResult small{color:#bcaccf;font-size:11px}
#pvInboxView .pvDmSearchResult span{font-size:13px;line-height:1.45;overflow-wrap:anywhere;max-height:64px;overflow:hidden}
#pvInboxView .pvDmSearchResult mark{background:#8c5fbd;color:white;border-radius:3px;padding:0 1px}
#pvInboxView .pvDmSearchEmpty{padding:25px 15px;text-align:center;color:#bdb3c9;font-size:13px}
#pvInboxView .pvDmSearchHit{animation:pvDmSearchGlow 2.3s ease-out}
@keyframes pvDmSearchGlow{0%,40%{outline:2px solid #b688f1;border-radius:17px;background:#8b55c72d}100%{outline-color:transparent;background:transparent}}
@media(max-width:700px){#pvInboxView .pvDmSearchPanel{inset:63px 0 0}#pvInboxView .pvDmSearchButton{min-width:30px;width:30px;padding:3px}#pvInboxView .pvDmSearchRow{padding:10px}}
@media(prefers-reduced-motion:reduce){#pvInboxView .pvDmSearchHit{animation:none;outline:2px solid #b688f1}}
`;
document.head.append(style);
function open(area){
 if(!area)return;
 const old=area.querySelector('.pvDmSearchPanel');
 if(old){old.remove();return}
 const messageList=area.querySelector('.pvMessages');
 if(!messageList)return;
 const panel=document.createElement('section');panel.className='pvDmSearchPanel';
 panel.setAttribute('aria-label','Search in this conversation');
 const row=document.createElement('div');row.className='pvDmSearchRow';
 const input=document.createElement('input');input.className='pvDmSearchInput';input.type='search';input.placeholder='Search messages…';input.setAttribute('aria-label','Search recent conversation messages');input.maxLength=120;
 const close=document.createElement('button');close.type='button';close.className='pvDmSearchClose';close.textContent='Done';
 close.onclick=()=>{panel.remove()};
 const count=document.createElement('p');count.className='pvDmSearchCount';
 const results=document.createElement('div');results.className='pvDmSearchResults';
 row.append(input,close);panel.append(row,count,results);
 area.append(panel);
 let timer;
 function run(){
  results.replaceChildren();
  const q=input.value.trim().toLocaleLowerCase();
  const rows=[...messageList.querySelectorAll('.pvMessageRow[data-message-id]')];
  if(!q){count.textContent='Search messages currently loaded in this chat';return}
  const matches=rows.filter(r=>r.querySelector('.pvBubble')?.textContent.toLocaleLowerCase().includes(q)).reverse().slice(0,100);
  count.textContent=matches.length+' matching messages'+(matches.length===100?' (showing first 100)':'');
  if(!matches.length){const empty=document.createElement('p');empty.className='pvDmSearchEmpty';empty.textContent='No matching messages in the loaded conversation.';results.append(empty);return}
  for(const target of matches){
   const bubble=target.querySelector('.pvBubble'),body=bubble?.textContent||'';
   const item=document.createElement('button');item.type='button';item.className='pvDmSearchResult';
   const small=document.createElement('small');small.textContent=(target.classList.contains('mine')?'You · ':'Them · ')+(bubble?.title||'');
   const message=document.createElement('span');
   const i=body.toLocaleLowerCase().indexOf(q);
   if(i>=0){message.append(document.createTextNode(body.slice(0,i)));const mark=document.createElement('mark');mark.textContent=body.slice(i,i+q.length);message.append(mark,document.createTextNode(body.slice(i+q.length)))}
   else message.textContent=body;
   item.append(small,message);
   item.onclick=()=>{
    panel.remove();
    target.scrollIntoView({behavior:'smooth',block:'center'});
    target.classList.remove('pvDmSearchHit');void target.offsetWidth;
    target.classList.add('pvDmSearchHit');
    setTimeout(()=>target.classList.remove('pvDmSearchHit'),2600);
   };
   results.append(item);
  }
 }
 input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,120)});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();panel.remove()}});
 run();input.focus({preventScroll:true});
}
window.PAVORA_CHAT_SEARCH={open};
})();