/* PAVORA Photo Adjustments v70 — on-device preview and canvas export. */
(()=>{
'use strict';
const upload=document.getElementById('photo'),caption=document.getElementById('caption');
if(!upload||!caption)return;
const composer=caption.closest('.composer');if(!composer)return;
const button=document.createElement('button');button.type='button';button.textContent='✧ Adjust photo';
button.className='pvPhotoEditBtn';button.hidden=true;
const panel=document.createElement('section');panel.className='pvPhotoAdjust';panel.hidden=true;
panel.setAttribute('aria-label','Photo adjustments');
const preview=document.createElement('img');preview.alt='Photo adjustment preview';preview.loading='lazy';
const brightness=document.createElement('input'),contrast=document.createElement('input');
const status=document.createElement('small');status.setAttribute('role','status');
for(const input of [brightness,contrast]){input.type='range';input.min='50';input.max='150';input.value='100';input.step='5'}
brightness.setAttribute('aria-label','Photo brightness');contrast.setAttribute('aria-label','Photo contrast');
const bLabel=document.createElement('label'),cLabel=document.createElement('label');
bLabel.textContent='Brightness';cLabel.textContent='Contrast';bLabel.append(brightness);cLabel.append(contrast);
const apply=document.createElement('button'),reset=document.createElement('button');
apply.type=reset.type='button';apply.textContent='Apply adjustments';reset.textContent='Reset';
const tools=document.createElement('div');tools.className='pvPhotoAdjustTools';tools.append(bLabel,cLabel,apply,reset);
panel.append(preview,tools,status);
const style=document.createElement('style');
style.textContent='.pvPhotoEditBtn,.pvPhotoAdjust button{background:#493166;color:#fff;border:1px solid #8060a1;border-radius:9px;padding:8px 12px;font-size:12px;font-weight:750;cursor:pointer}.pvPhotoEditBtn{margin:9px 0}.pvPhotoAdjust{margin:10px 0;border:1px solid #54416c;background:#1f192b;padding:12px;border-radius:13px}.pvPhotoAdjust img{display:block;max-width:100%;height:auto;max-height:320px;object-fit:contain;margin:auto;border-radius:8px}.pvPhotoAdjustTools{display:flex;align-items:end;gap:12px;flex-wrap:wrap;margin:12px 0}.pvPhotoAdjustTools label{font-size:12px;display:flex;flex-direction:column;gap:6px}.pvPhotoAdjustTools input{accent-color:#a078e3}.pvPhotoAdjust small{display:block;color:#bdacd1;font-size:12px}';
document.head.append(style);composer.append(button,panel);
let blobURL=null,origFile=null;
function clearURL(){if(blobURL){URL.revokeObjectURL(blobURL);blobURL=null}}
function updateFilter(){preview.style.filter='brightness('+brightness.value+'%) contrast('+contrast.value+'%)'}
function resetControls(){brightness.value='100';contrast.value='100';updateFilter()}
function load(){
 clearURL();origFile=upload.files?.[0]||null;button.hidden=!origFile;panel.hidden=true;resetControls();
 if(origFile&&origFile.type.startsWith('image/')){blobURL=URL.createObjectURL(origFile);preview.src=blobURL;status.textContent='Adjust locally before uploading.'}
}
upload.addEventListener('change',load);
button.onclick=()=>{panel.hidden=!panel.hidden};
brightness.oninput=contrast.oninput=updateFilter;
reset.onclick=resetControls;
apply.onclick=async()=>{
 if(!origFile)return;
 apply.disabled=true;status.textContent='Applying adjustments…';
 try{
  const img=new Image();img.src=blobURL;
  await img.decode();
  const max=1800,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
  ctx.filter='brightness('+brightness.value+'%) contrast('+contrast.value+'%)';
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.85));
  if(!blob)throw Error('Could not export photo');
  if(blob.size>5*1024*1024)throw Error('Edited image exceeds 5 MB. Try a smaller photo.');
  const file=new File([blob],(origFile.name||'photo').replace(/\.[^.]+$/,'')+'-edited.jpg',{type:'image/jpeg'});
  const transfer=new DataTransfer();transfer.items.add(file);
  upload.files=transfer.files;load();status.textContent='Adjustments applied to selected photo';panel.hidden=false;
 }catch(e){status.textContent='Photo adjustment failed: '+(e.message||e)}
 finally{apply.disabled=false}
};
document.addEventListener('pv:post-published',()=>{clearURL();origFile=null;button.hidden=true;panel.hidden=true});
})();
