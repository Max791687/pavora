/* PAVORA mobile install helper. This never logs out or clears account storage. */
(()=>{
'use strict';
const register=()=>{if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('Offline app shell unavailable',e))};
if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
let deferred=null;
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const shouldShow=()=>!isStandalone()&&sessionStorage.getItem('pavora-install-dismissed')!=='1';
const box=document.createElement('div');box.className='pvInstallPrompt';box.hidden=true;
box.innerHTML='<img src="./app-icon.svg" alt="" width="46" height="46"><div class="pvInstallCopy"><strong>Install PAVORA</strong><small>Your social app, one tap away.</small></div><button class="pvInstallButton" type="button">Install</button><button class="pvInstallDismiss" type="button" aria-label="Dismiss install suggestion">×</button>';
document.body.append(box);
const dismiss=()=>{box.hidden=true;sessionStorage.setItem('pavora-install-dismissed','1')};
box.querySelector('.pvInstallDismiss').onclick=dismiss;
box.querySelector('.pvInstallButton').onclick=async()=>{
if(deferred){try{deferred.prompt();await deferred.userChoice}catch(e){console.warn('Install prompt cancelled',e)}deferred=null;box.hidden=true;return}
if(isIOS())alert('iPhone Safari: Share (square with arrow) → Add to Home Screen → Add. PAVORA then opens as an app.');
else alert('Chrome: open the ⋮ browser menu → Add to Home screen / Install app.');
};
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;if(shouldShow())box.hidden=false});
window.addEventListener('appinstalled',()=>{box.hidden=true;deferred=null});
if(isIOS()&&shouldShow()&&/^((?!CriOS|FxiOS).)*Safari/i.test(navigator.userAgent))setTimeout(()=>{if(shouldShow())box.hidden=false},5000);
})();