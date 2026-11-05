'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const motion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const activitySection = byId('actividades');
  const activities = [...activitySection.querySelectorAll('.activity')];
  const guideSection = document.querySelector('section.learning');
  const hero = byId('inicio');
  const route = byId('ruta');
  const evaluation = byId('evaluacion');
  const resources = document.querySelector('.resources');
  const nav = byId('guia-navegacion');
  const headerLinks=[...document.querySelectorAll('header nav a')];
  let selectedReportNav='#informe';
  const steps = [
    {label:'Registro', title:'Prepara tu aprendizaje', description:'Ingresa tu nombre y correo y guarda tus datos para comenzar.', node:byId('registro')},
    {label:'Guía A–P–T–S', title:'Conoce la guía', description:'Revisa las cuatro preguntas que orientarán tus decisiones.', node:guideSection},
    {label:'Diagnóstico', title:'Activa tus conocimientos', description:'Responde las cinco preguntas y comprueba tus respuestas.', node:activities[0]},
    {label:'Casos', title:'Analiza los casos', description:'Revisa las cinco simulaciones y selecciona una respuesta en cada caso.', node:activities[1]},
    {label:'Decisión', title:'Explica tu decisión', description:'Elige una acción y justifícala antes de revisar los requisitos.', node:activities[2]},
    {label:'Informe', title:'Revisa y entrega', description:'Verifica tus resultados y descarga el PDF. Después podrás adjuntarlo a un correo.', node:byId('informe')}
  ];
  let active = Number.isInteger(state.guideStep) && state.guideStep >= 0 && state.guideStep < steps.length ? state.guideStep : 0;
  if (!validStudent() && active > 0) active = 0;
  const visited = new Set(Array.isArray(state.guideVisited) ? state.guideVisited.filter(x => Number.isInteger(x) && x >= 0 && x < steps.length) : []);
  const isComplete = i => [validStudent(), visited.has(1), state.quizChecked, ['A','B','C','D','E'].every(k => !!state.cases[k]), state.decisionChecked && decisionReady(), false][i];
  nav.innerHTML = '<div class="guia-top"><div><span class="eyebrow">TU RECORRIDO</span><h2>Aprende paso a paso<span class="dot">.</span></h2><p id="guiaActual" aria-live="polite"></p></div><div class="guia-total"><span id="guiaCuenta"></span><div class="guia-barra"><span id="guiaBarra"></span></div></div></div><ol class="guia-pasos"></ol><p class="guia-aviso" role="status" aria-live="polite"></p>';
  const list = nav.querySelector('.guia-pasos');
  const buttons = steps.map((s,i) => { const li=document.createElement('li'); const b=document.createElement('button');b.type='button';b.className='guia-paso';b.innerHTML=`<span class="guia-num">${i+1}</span><span>${s.label}</span>`;b.addEventListener('click',()=>go(i));li.append(b);list.append(li);return b; });
  steps.forEach((s,i)=>{const intro=document.createElement('div');intro.className='guia-intro';intro.innerHTML=`<span>PASO ${i+1} DE ${steps.length}</span><h2>${s.title}</h2><p>${s.description}</p>`;s.node.prepend(intro);const actions=document.createElement('div');actions.className='guia-acciones';if(i>0){const back=document.createElement('button');back.type='button';back.className='guia-volver';back.textContent='← Paso anterior';back.addEventListener('click',()=>go(i-1));actions.append(back)}if(i<steps.length-1){const next=document.createElement('button');next.type='button';next.className='btn dark';next.textContent=`Continuar: ${steps[i+1].label} →`;next.addEventListener('click',()=>go(i+1));actions.append(next)}if(i===0){actions.classList.add('registro-continuar-final');route.append(actions)}else{s.node.append(actions)}});
  function pending(){const out=[];if(!validStudent())out.push('Guardar nombre y correo');if(!state.quizChecked)out.push('Completar y comprobar el diagnóstico');if(!['A','B','C','D','E'].every(k=>!!state.cases[k]))out.push('Responder los cinco casos');if(!state.decisionChecked||!decisionReady())out.push('Completar y comprobar la decisión, la reflexión y las tres preguntas de razonamiento');return out}
  function update(){
    if(!validStudent()&&active>0) active=0;
    hero.hidden=active!==0;route.hidden=active!==0;document.querySelector('.registro-obligatorio').hidden=active!==0;
    activitySection.hidden=active<2||active>4;
    steps.forEach((s,i)=>s.node.hidden=active!==i);
    evaluation.hidden=active!==5;resources.hidden=active!==5;
    const currentNav=active===1?'#ruta':active>=2&&active<=4?'#actividades':active===5?selectedReportNav:null;
    headerLinks.forEach(a=>{if(a.getAttribute('href')===currentNav)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    byId('guiaActual').textContent=`Paso ${active+1} de ${steps.length}: ${steps[active].label}`;
    const completed=steps.reduce((n,_,i)=>n+(isComplete(i)?1:0),0);
    byId('guiaCuenta').textContent=`${completed} de 5 pasos completados`;
    byId('guiaBarra').style.width=`${completed/5*100}%`;
    buttons.forEach((b,i)=>{b.classList.toggle('actual',i===active);b.classList.toggle('completo',isComplete(i));b.setAttribute('aria-current',i===active?'step':'false');b.querySelector('.guia-num').textContent=isComplete(i)?'✓':String(i+1)});
    const remaining=pending();byId('reportMissing').textContent=remaining.length?'Para descargar tu informe falta: '+remaining.join(' · ')+'.':'Todo listo para descargar tu informe.';
  }
  function go(i){
    if(i>0&&!validStudent()){nav.querySelector('.guia-aviso').textContent='El registro es obligatorio para navegar. Guarda tu nombre y correo para continuar.';active=0;update();byId('registration').scrollIntoView({behavior:motion(),block:'center'});byId('studentName').focus({preventScroll:true});return}
    if(i>active){const missing=Array.from({length:i},(_,j)=>j).find(j=>!isComplete(j));if(missing!==undefined){const msgs=['Guarda tu nombre y correo para continuar.','Revisa la guía antes de continuar.','Responde las cinco preguntas y pulsa Comprobar diagnóstico.','Responde los cinco casos para continuar.','Completa la decisión y las tres preguntas; luego pulsa Comprobar y obtener nota.'];nav.querySelector('.guia-aviso').textContent=msgs[missing];active=missing;visited.add(active);state.guideVisited=[...visited];state.guideStep=active;save();update();nav.scrollIntoView({behavior:motion(),block:'start'});return}}
    nav.querySelector('.guia-aviso').textContent='';active=i;visited.add(i);state.guideStep=active;state.guideVisited=[...visited];save();update();nav.scrollIntoView({behavior:motion(),block:'start'});nav.querySelector('h2').setAttribute('tabindex','-1');nav.querySelector('h2').focus({preventScroll:true});
  }
  // La cinta explica cada etapa sin navegar ni modificar el progreso.
  const explanations={
    Activar:'Recupera lo que ya sabes mediante un diagnóstico breve. Sus preguntas te ayudan a identificar conceptos que conviene reforzar antes de continuar.',
    Comprender:'Conoce A–P–T–S: anatomía, posicionamiento, técnica y seguridad. Esta guía organiza la observación y las preguntas que debes hacerte ante una imagen.',
    Aplicar:'Utiliza la guía para analizar cinco casos simulados. Identifica el problema principal y contrasta tu elección con la retroalimentación.',
    Decidir:'Ante una situación simulada, elige una acción y justifícala considerando el propósito del estudio, la evidencia y los protocolos de seguridad.',
    Transferir:'Integra lo practicado para comparar casos y comunicar hallazgos. Revisa tu nota de práctica y prepara el informe con los criterios indicados.'
  };
  const stageButtons=[...route.querySelectorAll('.ruta-etapa')];
  stageButtons.forEach((button,index)=>{
    const title=button.querySelector('b').textContent.trim();
    const number=button.querySelector('span').textContent.trim();
    const description=button.querySelector('p').textContent.trim();
    const front=document.createElement('span');front.className='ruta-frente';
    const num=document.createElement('span');num.className='ruta-numero';num.textContent=number;
    const heading=document.createElement('b');heading.textContent=title;
    const desc=document.createElement('span');desc.className='ruta-descripcion';desc.textContent=description;
    const prompt=document.createElement('span');prompt.className='ruta-girar';prompt.textContent='Ver explicación ↻';
    front.append(num,heading,desc,prompt);
    const back=document.createElement('span');back.className='ruta-reverso';back.id=`ruta-detalle-${index+1}`;back.setAttribute('aria-hidden','true');
    const backTitle=document.createElement('strong');backTitle.textContent=title;
    const text=document.createElement('span');text.className='ruta-reverso-texto';text.textContent=explanations[title]||'';
    const close=document.createElement('span');close.className='ruta-volver-texto';close.textContent='Volver ↺';
    back.append(backTitle,text,close);button.replaceChildren(front,back);
    button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',back.id);
    button.addEventListener('click',()=>{
      const opening=button.getAttribute('aria-expanded')!=='true';
      stageButtons.forEach(b=>{const panel=byId(b.getAttribute('aria-controls'));b.setAttribute('aria-expanded','false');b.closest('article').classList.remove('abierta');panel.setAttribute('aria-hidden','true')});
      if(opening){button.setAttribute('aria-expanded','true');button.closest('article').classList.add('abierta');back.setAttribute('aria-hidden','false')}
    });
  });
  // Tarjetas de la guía: explicación ampliada en el reverso.
  const aptDetails={
    A:'Comprueba si están incluidas y visibles las estructuras necesarias para responder al propósito del estudio. Describe qué se observa y qué información falta antes de sacar conclusiones.',
    P:'Examina simetría, rotación, angulación y centrado usando referencias anatómicas pertinentes. Una diferencia visible orienta la revisión, pero no confirma por sí sola la causa.',
    T:'Valora si contraste, resolución espacial, ruido, nitidez y artefactos permiten apreciar los detalles necesarios. Relaciona lo observado con la tarea de la imagen.',
    S:'Antes de proponer una acción, contrasta la imagen con el propósito, el protocolo y los criterios de calidad. Evita repeticiones automáticas y verifica la colimación previa.'
  };
  const aptButtons=[...guideSection.querySelectorAll('.guide article')].map((article,index)=>{
    const letter=article.querySelector('strong').textContent.trim();
    const title=article.querySelector('h3').textContent.trim();
    const description=article.querySelector('p').textContent.trim();
    const button=document.createElement('button');button.type='button';button.className='apts-card';button.setAttribute('aria-label',`${letter}: ${title}`);button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',`apts-detalle-${index+1}`);
    const front=document.createElement('span');front.className='apts-frente';
    const initial=document.createElement('strong');initial.textContent=letter;
    const name=document.createElement('b');name.textContent=title;
    const brief=document.createElement('span');brief.className='apts-breve';brief.textContent=description;
    const prompt=document.createElement('span');prompt.className='apts-accion';prompt.textContent='Ver explicación ↻';
    front.append(initial,name,brief,prompt);
    const back=document.createElement('span');back.className='apts-reverso';back.id=`apts-detalle-${index+1}`;back.setAttribute('aria-hidden','true');
    const backTitle=document.createElement('b');backTitle.textContent=title;
    const detail=document.createElement('span');detail.className='apts-detalle';detail.textContent=aptDetails[letter];
    const close=document.createElement('span');close.className='apts-accion';close.textContent='Volver ↺';
    back.append(backTitle,detail,close);button.append(front,back);article.replaceChildren(button);return button;
  });
  aptButtons.forEach(button=>button.addEventListener('click',()=>{
    const opening=button.getAttribute('aria-expanded')!=='true';
    aptButtons.forEach(b=>{b.setAttribute('aria-expanded','false');document.getElementById(b.getAttribute('aria-controls')).setAttribute('aria-hidden','true')});
    if(opening){button.setAttribute('aria-expanded','true');document.getElementById(button.getAttribute('aria-controls')).setAttribute('aria-hidden','false')}
  }));
  const menuPrincipal=document.querySelector('.menu-principal');
  menuPrincipal.addEventListener('click',e=>{if(e.target.closest('.menu-opciones a'))menuPrincipal.open=false});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuPrincipal.open){menuPrincipal.open=false;menuPrincipal.querySelector('summary').focus()}});
  document.addEventListener('click',e=>{if(menuPrincipal.open&&!menuPrincipal.contains(e.target))menuPrincipal.open=false});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const map={'#registro':0,'#inicio':0,'#ruta':1,'#actividad1':2,'#actividades':2,'#informe':5,'#evaluacion':5};const dest=map[a.getAttribute('href')];if(dest!==undefined){e.preventDefault();if(a.getAttribute('href')==='#evaluacion'||a.getAttribute('href')==='#informe')selectedReportNav=a.getAttribute('href');go(dest);if(a.getAttribute('href')==='#evaluacion'&&active===5)evaluation.scrollIntoView({behavior:motion(),block:'start'});if(a.getAttribute('href')==='#registro'&&active===0)byId('registration').scrollIntoView({behavior:motion(),block:'center'})}});
  document.addEventListener('submit',()=>setTimeout(update,0));document.addEventListener('change',()=>setTimeout(update,0));document.addEventListener('input',()=>setTimeout(update,0));
  document.addEventListener('practice-retry',()=>{active=2;visited.add(2);state.guideStep=2;state.guideVisited=[...visited];save();update();nav.querySelector('.guia-aviso').textContent='Práctica reiniciada. Tus datos se conservaron.';nav.scrollIntoView({behavior:motion(),block:'start'});nav.querySelector('h2').focus({preventScroll:true})});
  byId('reset').addEventListener('click',()=>setTimeout(()=>{if(!validStudent()){active=0;visited.clear();update()}},0));
  const firstMissing=Array.from({length:active},(_,j)=>j).find(j=>!isComplete(j));if(firstMissing!==undefined)active=firstMissing;visited.add(active);state.guideStep=active;state.guideVisited=[...visited];save();update();
})();
