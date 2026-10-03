'use strict';

// Pure timing functions are also exercised by the Node test suite.
const SpritePlayback = (() => {
  const defaults = {walk:Array(6).fill(120),run:Array(6).fill(90),jump:[140,70,100,140,100,130]};
  const jumpLabels=['Crouch','Launch','Rise','Apex','Fall','Landing'];
  function clip(key, metadata={}) {
    const [,view,action] = key.split('-');
    if(!defaults[action]) throw new Error('Unknown action');
    const raw=metadata.clips?.[key] || {};
    const expected=Number.isInteger(raw.frames)&&raw.frames>=1&&raw.frames<=8?raw.frames:defaults[action].length;
    const durations=Array.isArray(raw.durations)&&raw.durations.length===expected&&raw.durations.every(v=>Number.isFinite(v)&&v>0)?raw.durations.slice():Array.from({length:expected},(_,i)=>defaults[action][i%defaults[action].length]);
    const projected=view==='isometric'?(action==='walk'?[24,12]:[40,20]):view==='rpg'?(action==='walk'?[0,24]:[0,40]):[(action==='walk'?40:64)*(view==='street'?2:1),0];
    const stride=action==='jump'?[0,0]:Array.isArray(raw.stride)&&raw.stride.length===2&&raw.stride.every(Number.isFinite)?raw.stride.slice():projected;
    return {frames:expected,durations,stride,labels:action==='jump'&&expected===6?jumpLabels:Array.from({length:expected},(_,i)=>`Phase ${i+1}`),total:durations.reduce((a,b)=>a+b,0),measured:raw.calibrated===true||raw.calibration!==undefined,raw};
  }
  function sample(elapsed, config, travelling=true) {
    const time=Math.max(0,Number.isFinite(elapsed)?elapsed:0), cycle=time/config.total, local=time%config.total;
    let start=0,frame=config.frames-1;
    for(let i=0;i<config.frames;i++){if(local<start+config.durations[i]){frame=i;break;}start+=config.durations[i];}
    return {frame,local,cycle,frameProgress:(local-start)/config.durations[frame],distance:config.stride.map(value=>travelling?value*cycle:0)};
  }
  function frameTime(frame,config,cycle=0){if(!Number.isInteger(frame)||frame<0||frame>=config.frames)throw new Error('Invalid frame');return cycle*config.total+config.durations.slice(0,frame).reduce((a,b)=>a+b,0);}
  function advance(elapsed,delta,speed,playing){return elapsed+(playing?Math.max(0,delta)*speed:0);}
  return {clip,sample,frameTime,advance};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=SpritePlayback;
if(typeof document!=='undefined')initialiseSpriteLab();

function initialiseSpriteLab(){
  const views=[{id:'platform',name:'2D platformer',note:'Side view · compact character',badge:'SIDE / 64 × 64',cell:64},{id:'street',name:'Arcade street view',note:'Side view · larger, detailed character',badge:'SIDE / 128 × 128',cell:128},{id:'isometric',name:'Isometric',note:'Elevated view · facing southeast',badge:'ISOMETRIC / 64 × 64',cell:64},{id:'rpg',name:'Top-down RPG',note:'Overhead view · facing south',badge:'TOP-DOWN / 64 × 64',cell:64}];
  const actions=['walk','run','jump'],images=new Map(),viewers=[],reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let action='walk',playing=!reduced.matches,speed=1,elapsed=0,lastTime=null,mode='travel',metadata={},ready=false;
  const capital=s=>s[0].toUpperCase()+s.slice(1);
  const keyFor=v=>`${v.skill}-${v.view}-${action}`;
  const master=()=>SpritePlayback.clip(`a-platform-${action}`,metadata);
  document.querySelector('#comparisons').innerHTML=views.map(view=>`<section class="comparison ${view.id}" aria-labelledby="title-${view.id}"><div class="row-title"><h3 id="title-${view.id}">${view.name}</h3><span>${view.note}</span></div><div class="pair">${['a','b','c','d'].map(skill=>`<article class="sprite-card" aria-label="${({a:'Character Animation Creator',b:'Pixel Art Agent Skill',c:'Sprite-gen',d:'Pixel-plugin / Aseprite'})[skill]}: ${view.name}"><div class="stage"><div class="ground-plane" aria-hidden="true"></div><span class="view-badge">${view.badge}</span><canvas width="${view.cell}" height="${view.cell}" data-view="${view.id}" data-skill="${skill}" aria-label="${view.name} animation"></canvas></div><div class="card-meta"><span class="current-action">Walk</span><span class="skill-tag">${skill.toUpperCase()} · 6 FRAMES</span></div><div class="motion-readout" aria-label="Travel distance"></div></article>`).join('')}</div></section>`).join('');
  document.querySelectorAll('canvas').forEach(canvas=>viewers.push({canvas,ctx:canvas.getContext('2d'),view:canvas.dataset.view,skill:canvas.dataset.skill,cell:canvas.width,card:canvas.closest('.sprite-card'),ground:canvas.parentElement.querySelector('.ground-plane'),scale:3}));
  function resize(){for(const v of viewers){const rect=v.canvas.getBoundingClientRect(),stage=v.canvas.parentElement.getBoundingClientRect();v.scale=rect.width/v.cell;v.ground.style.setProperty('--ground-bottom',`${stage.bottom-rect.bottom+6*v.scale}px`);v.ground.style.setProperty('--tile-size',`${8*v.scale}px`);}draw();}
  function draw(){
    const primary=master(),current=SpritePlayback.sample(elapsed,primary,mode==='travel');
    for(const v of viewers){const key=keyFor(v),config=SpritePlayback.clip(key,metadata),state=SpritePlayback.sample(elapsed,config,mode==='travel'),img=images.get(key);v.ctx.clearRect(0,0,v.cell,v.cell);v.ctx.imageSmoothingEnabled=false;
      if(img?.complete&&img.naturalWidth){const available=Math.floor(img.naturalWidth/v.cell);if(state.frame<available)v.ctx.drawImage(img,state.frame*v.cell,0,v.cell,v.cell,0,0,v.cell,v.cell);}
      v.ground.style.backgroundPosition=`${-state.distance[0]*v.scale}px ${-state.distance[1]*v.scale}px`;
      v.canvas.dataset.frame=String(state.frame+1);v.ground.dataset.distance=state.distance.map(n=>n.toFixed(3)).join(',');
    }
    document.querySelector('#frame-status').textContent=ready?`Frame ${current.frame+1} / ${primary.frames} · ${primary.labels[current.frame]}`:'Loading motion data…';
    document.querySelectorAll('#timeline button').forEach((button,i)=>{button.classList.toggle('active',i===current.frame);button.setAttribute('aria-pressed',String(i===current.frame));});
  }
  function timeline(){const config=master();document.querySelector('#timeline').style?.setProperty('--frame-count',config.frames);document.querySelector('#timeline').innerHTML=config.labels.map((label,i)=>`<button type="button" data-frame="${i}" aria-label="Pause at frame ${i+1}: ${label}, ${config.durations[i]} milliseconds"><span>${i+1} · ${label}</span><small>${config.durations[i]} ms</small></button>`).join('');}
  function syncControls(){
    document.body.classList.toggle('paused',!playing);document.body.dataset.motionMode=mode;
    const play=document.querySelector('#play');play.innerHTML=playing?'Ⅱ <span>Pause</span>':'▶ <span>Play</span>';play.setAttribute('aria-label',`${playing?'Pause':'Play'} all animations`);
    document.querySelectorAll('[data-action]').forEach(button=>{const selected=button.dataset.action===action;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    document.querySelector('#motion-mode').value=mode;
    document.querySelector('#motion-note').textContent=mode==='travel'?(action==='jump'?'Vertical jump · ground stays fixed.':'Ground moves opposite travel so you can inspect planted feet. Distances are native sprite pixels per complete cycle.'):'In place · ground stays fixed for pose and body-registration inspection.';
    for(const v of viewers){const config=SpritePlayback.clip(keyFor(v),metadata),[dx,dy]=config.stride;v.card.querySelector('.current-action').textContent=capital(action);v.card.querySelector('.skill-tag').textContent=`${v.skill.toUpperCase()} · ${config.frames} FRAMES`;v.card.querySelector('.motion-readout').textContent=action==='jump'?`Vertical jump · ${config.total} ms`:`Δx ${dx} · Δy ${dy} px/cycle · ${config.total} ms${mode==='in-place'?' · stationary':''}`;v.canvas.setAttribute('aria-label',`${v.view} ${action} animation from skill ${v.skill.toUpperCase()}`);}
  }
  function setAction(value){if(!actions.includes(value))throw new Error('Unknown animation');action=value;elapsed=0;lastTime=null;timeline();syncControls();draw();}
  function setFrame(frame){elapsed=SpritePlayback.frameTime(frame,master());playing=false;lastTime=null;syncControls();draw();}
  function tick(time){if(lastTime!==null&&ready)elapsed=SpritePlayback.advance(elapsed,time-lastTime,speed,playing);lastTime=time;draw();requestAnimationFrame(tick);}
  for(const v of viewers)for(const a of actions){const key=`${v.skill}-${v.view}-${a}`,img=new Image();images.set(key,img);img.onload=draw;img.onerror=()=>{if(!v.canvas.parentElement.querySelector('.error')){const message=document.createElement('p');message.className='error';message.textContent='An animation could not load. Refresh to try again.';v.canvas.parentElement.append(message);}};img.src=`assets/${key}.png`;}
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>setAction(button.dataset.action)));
  document.querySelector('#play').addEventListener('click',()=>{playing=!playing;lastTime=null;syncControls();});
  document.querySelector('#step').addEventListener('click',()=>{const config=master(),state=SpritePlayback.sample(elapsed,config),next=(state.frame+1)%config.frames;elapsed=SpritePlayback.frameTime(next,config,Math.floor(state.cycle)+(next===0?1:0));playing=false;lastTime=null;syncControls();draw();});
  document.querySelector('#timeline').addEventListener('click',event=>{const button=event.target.closest('[data-frame]');if(button)setFrame(Number(button.dataset.frame));});
  document.querySelector('#speed').addEventListener('change',event=>{speed=Number(event.target.value);lastTime=null;});
  document.querySelector('#motion-mode').addEventListener('change',event=>{mode=event.target.value;syncControls();draw();});
  document.addEventListener('visibilitychange',()=>{lastTime=null;});
  reduced.addEventListener('change',event=>{if(event.matches){playing=false;lastTime=null;syncControls();}});
  document.addEventListener('keydown',event=>{if(event.code==='Space'&&event.target===document.body){event.preventDefault();playing=!playing;lastTime=null;syncControls();}});
  if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(resize);viewers.forEach(v=>observer.observe(v.canvas));}else addEventListener('resize',resize);
  fetch('assets/motion.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('Motion metadata unavailable');return response.json();}).then(data=>{metadata=data;}).catch(()=>{document.querySelector('#metadata-status').textContent='Using preview distance estimates; measured motion data could not load.';}).finally(()=>{ready=true;timeline();syncControls();resize();});
  timeline();syncControls();resize();requestAnimationFrame(tick);
  if(document.modelContext?.registerTool){
    const lifecycle=new AbortController();
    const readState=()=>({action,playing,speed,mode,frame:SpritePlayback.sample(elapsed,master()).frame+1,frames:master().frames,spriteCount:viewers.length});
    const tool={name:'configure_sprite_playback',title:'Configure sprite playback',description:'Choose animation, speed, ground travel, pause state and frame across sixteen sprite comparisons. Frame counts and durations follow the selected clip metadata. Current sheets have six frames.',inputSchema:{type:'object',properties:{action:{type:'string',enum:actions},playing:{type:'boolean'},speed:{type:'number',enum:[0.5,1,1.5]},mode:{type:'string',enum:['travel','in-place']},frame:{type:'integer',minimum:1,maximum:8}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
      if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['action','playing','speed','mode','frame'].includes(k)))throw new Error('Invalid playback settings');
      if(input.action!==undefined&&!actions.includes(input.action))throw new Error('Invalid action');
      if(input.playing!==undefined&&typeof input.playing!=='boolean')throw new Error('Invalid playing flag');
      if(input.speed!==undefined&&![0.5,1,1.5].includes(input.speed))throw new Error('Invalid speed');
      if(input.mode!==undefined&&!['travel','in-place'].includes(input.mode))throw new Error('Invalid mode');
      const target=SpritePlayback.clip(`a-platform-${input.action??action}`,metadata);
      if(input.frame!==undefined&&(!Number.isInteger(input.frame)||input.frame<1||input.frame>target.frames))throw new Error(`Frame must be 1–${target.frames} for ${input.action??action}`);
      if(input.action!==undefined)setAction(input.action);
      if(input.speed!==undefined){speed=input.speed;document.querySelector('#speed').value=String(speed);}
      if(input.mode!==undefined)mode=input.mode;
      if(input.playing!==undefined)playing=input.playing;
      if(input.frame!==undefined)setFrame(input.frame-1);
      lastTime=null;syncControls();draw();return readState();
    }};
    try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
    addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
}
