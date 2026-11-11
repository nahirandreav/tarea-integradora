'use strict';
(()=>{
  const id=x=>document.getElementById(x), root=document.documentElement, widget=document.querySelector('.access-widget');
  const toggle=id('access-toggle'), panel=id('access-panel'), message=id('access-message'), sizeText=id('access-size');
  const KEY='radiologia-accesibilidad-v1', levels=[0.9,1,1.15,1.3,1.45];
  let prefs={level:1,contrast:false}, selected='', selectionSource=null, timer;
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(Number.isInteger(saved.level)&&saved.level>=0&&saved.level<levels.length)prefs.level=saved.level;prefs.contrast=saved.contrast===true}catch(_){}
  const originals=new Map();
  function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch(_){}}
  function resizeText(){
    originals.forEach((value,el)=>{if(value.value)el.style.setProperty('font-size',value.value,value.priority);else el.style.removeProperty('font-size')});
    originals.clear();
    if(prefs.level!==1){
      const candidates=[...document.body.querySelectorAll('*')].filter(el=>!widget.contains(el)&&el instanceof HTMLElement&&!['SCRIPT','STYLE'].includes(el.tagName));
      const sizes=candidates.map(el=>parseFloat(getComputedStyle(el).fontSize));
      candidates.forEach((el,i)=>{if(!Number.isFinite(sizes[i])||sizes[i]<=0)return;originals.set(el,{value:el.style.getPropertyValue('font-size'),priority:el.style.getPropertyPriority('font-size')});el.style.setProperty('font-size',`${sizes[i]*levels[prefs.level]}px`,'important')});
    }
    root.classList.toggle('access-text-adjusted',prefs.level!==1);
    root.style.setProperty('--access-ui-scale',String(levels[prefs.level]));
    sizeText.textContent=`Tamaño: ${Math.round(levels[prefs.level]*100)} %`;
    id('access-smaller').disabled=prefs.level===0;id('access-larger').disabled=prefs.level===levels.length-1;
  }
  function render(){root.classList.toggle('access-contrast',prefs.contrast);id('access-contrast').setAttribute('aria-pressed',String(prefs.contrast));id('access-contrast').textContent=`Alto contraste: ${prefs.contrast?'activado':'desactivado'}`;resizeText()}
  function show(open){panel.hidden=!open;root.classList.toggle('access-panel-open',open);toggle.setAttribute('aria-expanded',String(open));if(open)id('access-close').focus({preventScroll:true});else toggle.focus({preventScroll:true})}
  toggle.addEventListener('click',()=>show(panel.hidden));id('access-close').addEventListener('click',()=>show(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();show(false)}});
  document.addEventListener('wheel',e=>{if(!panel.hidden){e.preventDefault();const factor=e.deltaMode===1?16:e.deltaMode===2?panel.clientHeight:1;panel.scrollBy({top:e.deltaY*factor,left:e.deltaX*factor,behavior:'instant'})}},{passive:false});
  document.addEventListener('touchmove',e=>{if(!panel.hidden&&!panel.contains(e.target))e.preventDefault()},{passive:false});
  document.addEventListener('keydown',e=>{if(panel.hidden||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;const amount=e.key==='PageDown'?panel.clientHeight:e.key==='PageUp'?-panel.clientHeight:e.key==='ArrowDown'?48:e.key==='ArrowUp'?-48:0;if(amount){e.preventDefault();panel.scrollBy({top:amount,behavior:'instant'})}});
  id('access-smaller').addEventListener('click',()=>{prefs.level=Math.max(0,prefs.level-1);render();save()});
  id('access-larger').addEventListener('click',()=>{prefs.level=Math.min(levels.length-1,prefs.level+1);render();save()});
  id('access-reset').addEventListener('click',()=>{prefs.level=1;render();save()});
  id('access-contrast').addEventListener('click',()=>{prefs.contrast=!prefs.contrast;render();save()});
  document.addEventListener('selectionchange',()=>{
    const active=document.activeElement;
    if(active&&!widget.contains(active)&&/^(INPUT|TEXTAREA)$/.test(active.tagName)&&typeof active.selectionStart==='number'){
      if(active.type==='password'||active.type==='email')return;
      const text=active.value.slice(active.selectionStart,active.selectionEnd).trim();if(text){selected=text;selectionSource=active}return;
    }
    const selection=window.getSelection();if(selection&&!selection.isCollapsed&&selection.anchorNode&&!widget.contains(selection.anchorNode)){const text=selection.toString().trim();if(text){selected=text;selectionSource=selection.anchorNode.parentElement}}
  });
  const speechAvailable='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
  let speechSession=0;
  function stopSpeech(){speechSession++;window.speechSynthesis.cancel()}
  function speakText(text){
    const parts=text.match(/[^.!?\n]{1,220}(?:[.!?]|\n|$)|[^.!?\n]{1,220}/g)||[];
    if(!parts.length){message.textContent='No hay texto disponible para leer.';return}
    stopSpeech();const session=speechSession;let index=0;
    function next(){
      if(session!==speechSession)return;
      if(index>=parts.length){message.textContent='Lectura finalizada.';return}
      const utterance=new SpeechSynthesisUtterance(parts[index++]);utterance.lang='es';
      utterance.onend=next;
      utterance.onerror=()=>{if(session===speechSession)message.textContent='No se pudo reproducir la lectura en este navegador.'};
      window.speechSynthesis.speak(utterance);
    }
    message.textContent='Leyendo en voz alta. Pulsa Detener lectura para terminar.';next();
  }
  if(!speechAvailable){id('access-read').disabled=true;id('access-read-main').disabled=true;id('access-stop').disabled=true;message.textContent='La lectura en voz alta no está disponible en este navegador.'}
  id('access-read').addEventListener('click',()=>{if(!selected||!selectionSource||!selectionSource.isConnected){message.textContent='Primero selecciona el texto que deseas escuchar.';return}speakText(selected)});
  id('access-read-main').addEventListener('click',()=>{const main=document.querySelector('main');speakText(main?main.innerText.trim():'')});
  id('access-stop').addEventListener('click',()=>{stopSpeech();message.textContent='Lectura detenida.'});
  const sound=id('soundToggle'), soundAccess=id('access-sound');
  function updateSoundAccess(){const muted=sound.getAttribute('aria-pressed')==='false';soundAccess.setAttribute('aria-pressed',String(muted));soundAccess.textContent=muted?'Activar sonidos de respuesta':'Silenciar sonidos de respuesta'}
  soundAccess.addEventListener('click',()=>sound.click());
  new MutationObserver(updateSoundAccess).observe(sound,{attributes:true,attributeFilter:['aria-pressed']});updateSoundAccess();
  new MutationObserver(records=>{if(prefs.level!==1&&records.some(r=>!widget.contains(r.target))){clearTimeout(timer);timer=setTimeout(resizeText,80)}}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>{if(prefs.level!==1){clearTimeout(timer);timer=setTimeout(resizeText,120)}});
  render();
})();
