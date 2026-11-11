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
    sizeText.textContent=`Tamaño: ${Math.round(levels[prefs.level]*100)} %`;
    id('access-smaller').disabled=prefs.level===0;id('access-larger').disabled=prefs.level===levels.length-1;
  }
  function render(){root.classList.toggle('access-contrast',prefs.contrast);id('access-contrast').setAttribute('aria-pressed',String(prefs.contrast));id('access-contrast').textContent=`Alto contraste: ${prefs.contrast?'activado':'desactivado'}`;resizeText()}
  function show(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)id('access-close').focus();else toggle.focus()}
  toggle.addEventListener('click',()=>show(panel.hidden));id('access-close').addEventListener('click',()=>show(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();show(false)}});
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
  if(!speechAvailable){id('access-read').disabled=true;id('access-stop').disabled=true;message.textContent='La lectura en voz alta no está disponible en este navegador.'}
  id('access-read').addEventListener('click',()=>{if(!selected||!selectionSource||!selectionSource.isConnected){message.textContent='Primero selecciona el texto que deseas escuchar.';return}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(selected);utterance.lang='es';utterance.onend=()=>{message.textContent='Lectura finalizada.'};utterance.onerror=()=>{message.textContent='No se pudo reproducir la lectura en este navegador.'};window.speechSynthesis.speak(utterance);message.textContent='Leyendo el texto seleccionado.'});
  id('access-stop').addEventListener('click',()=>{window.speechSynthesis.cancel();message.textContent='Lectura detenida.'});
  new MutationObserver(records=>{if(prefs.level!==1&&records.some(r=>!widget.contains(r.target))){clearTimeout(timer);timer=setTimeout(resizeText,80)}}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>{if(prefs.level!==1){clearTimeout(timer);timer=setTimeout(resizeText,120)}});
  render();
})();
