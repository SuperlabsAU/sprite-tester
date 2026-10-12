import {MOVES,STAFF} from './content.mjs';
import {approvals,nearest} from './rules.mjs';
const $=id=>document.getElementById(id);
const text=(id,value)=>{if($(id).textContent!==String(value))$(id).textContent=value;};
export function createUI(actions){
 const moves=Object.entries(MOVES);$('move-grid').innerHTML=moves.map(([key,m],i)=>`<button class="move-button" data-move="${key}" title="${m.description}"><strong><span class="move-key">${i+1}</span>${m.name}</strong><span>${m.type} · ${m.heal?'+24 morale':m.power+' power'}${m.guard?' · guard':''}</span></button>`).join('');
 for(const b of document.querySelectorAll('[data-move]'))b.onclick=()=>actions.battle(b.dataset.move);
 const bindings={start:'start',pause:'pause',resume:'pause',help:'pause','dialogue-next':'continue','dialogue-cancel':'cancel','battle-finish':'finish','battle-coffee':'coffee','battle-flee':'flee',interaction:'interact','touch-interact':'interact',sound:'sound',again:'restart'};
 for(const[id,action]of Object.entries(bindings))$(id).onclick=()=>actions[action]();
 let restartArmed=false;$('restart').onclick=()=>{if(!restartArmed){restartArmed=true;text('restart','Discard progress? Click again to restart');return;}restartArmed=false;text('restart','Restart this shift');actions.restart();};
 let lastModal=null;
 function render(s,opts){
  const{started,paused,busy}=opts,b=s.battle,inBattle=s.mode==='battle';document.body.classList.toggle('combat',inBattle);
  text('morale-text',`${s.player.hp} / ${s.player.maxHp}`);$('morale-fill').style.width=`${s.player.hp/s.player.maxHp*100}%`;text('coffee-count',`☕ × ${s.player.coffee}`);
  text('objective',s.defeated.includes('boss')?'HEAD TO THE LIFT':approvals(s)===3?'CHALLENGE BRENDA':`${approvals(s)} / 3 APPROVALS`);
  for(const badge of document.querySelectorAll('[data-badge]')){badge.classList.toggle('earned',s.defeated.includes(badge.dataset.badge));badge.setAttribute('title',({hr:'People',sales:'Sales',product:'Alignment'})[badge.dataset.badge]);}
  $('intro').hidden=started;$('pause-panel').hidden=!paused;$('dialogue').hidden=s.mode!=='dialogue'||paused||!started;$('battle').hidden=!inBattle||!started;$('complete').hidden=s.mode!=='complete'||!started;
  $('pause').setAttribute('aria-label',paused?'Resume game':'Pause game');text('pause-summary',`${approvals(s)} of 3 departmental approvals. ${s.defeated.includes('boss')?'The lift is waiting.':'Coffee in the kitchen restores morale and refills your flask.'}`);
  const near=nearest(s);$('interaction').hidden=!near||s.mode!=='explore'||!started||paused;if(near)text('interaction',`E · ${near.name}`);
  const loc=s.player.y<8?(s.player.x<9?'KITCHEN · BENEFITS DEPARTMENT':s.player.x>20?'MANAGEMENT · THE GLASS CEILING':'MEETING ROOM · THE ALIGNMENT ZONE'):s.player.y>16?'RECEPTION · FREEDOM IS CLOSE':'OPEN PLAN · DEEP WORK NOT PERMITTED';text('location',loc);
  if(s.dialogue){text('dialogue-title',s.dialogue.title);text('dialogue-text',s.dialogue.text);text('dialogue-next',s.dialogue.next==='battle'?'Let’s have that chat →':'Continue →');$('dialogue-cancel').hidden=s.dialogue.next!=='battle';}
  if(inBattle&&b){const n=STAFF.find(n=>n.id===b.id);text('enemy-role',`${n.role} · LV ${n.level}`);text('enemy-name',n.name);text('enemy-hp',`${b.enemyHp} / ${b.maxHp}`);$('enemy-fill').style.width=`${b.enemyHp/b.maxHp*100}%`;text('enemy-weak',`Weakness: ${n.weak}`);text('battle-hp',`${s.player.hp} / ${s.player.maxHp}`);$('battle-fill').style.width=`${s.player.hp/s.player.maxHp*100}%`;
   text('battle-log',b.log.length>2?[b.log[0],b.log.at(-1)].join('\n'):b.log.join('\n'));text('turn-label',b.result==='won'?'APPROVAL SECURED':b.result==='lost'?'PROFESSIONALLY EXHAUSTED':b.result==='fled'?'MEETING DECLINED':busy?'CORPORATE NONSENSE IN PROGRESS':`YOUR TURN · ${b.turn+1}`);
   $('move-grid').hidden=Boolean(b.result);document.querySelector('.battle-extras').hidden=Boolean(b.result);$('battle-finish').hidden=!b.result;
   for(const button of document.querySelectorAll('[data-move]')){button.disabled=busy||(button.dataset.move==='circle'&&b.circle===0);if(button.dataset.move==='circle')button.querySelector(':scope > span').textContent=`+24 morale · guard · ${b.circle}/3 left`;}
   $('battle-coffee').disabled=busy||s.player.coffee===0||s.player.hp===s.player.maxHp;text('battle-coffee',`☕ Coffee (${s.player.coffee}) · +42 morale`);$('battle-flee').disabled=busy;$('battle-finish').disabled=busy;text('battle-finish',b.result==='lost'?'Recover at the coffee machine →':'Back to the floor →');
  }
  if(s.mode==='complete')$('receipt').innerHTML=`<div><span>Departmental approvals</span><b>3 / 3</b></div><div><span>Manager defeated</span><b>YES</b></div><div><span>Turns of corporate nonsense</span><b>${s.turns}</b></div><div><span>Coffees consumed</span><b>${s.coffeesUsed}</b></div><div><span>Salary increase</span><b>$0.00</b></div>`;
  const modal=!started?'intro':paused?'pause-panel':s.mode==='dialogue'?'dialogue':s.mode==='complete'?'complete':null;
  if(modal!==lastModal){lastModal=modal;if(modal){const panel=$(modal);panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');(modal==='dialogue'?$('dialogue-next'):panel.querySelector('button:not([hidden])'))?.focus({preventScroll:true});}else $('world').focus({preventScroll:true});}
 }
 document.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const modal=['intro','pause-panel','dialogue','complete'].map($).find(n=>!n.hidden);if(!modal)return;const buttons=[...modal.querySelectorAll('button:not([hidden]),a')].filter(n=>!n.disabled);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 return {render,toast(message){text('toast',message);},loaded(){ $('loading').hidden=true;},error(message){$('loading').hidden=false;$('loading').querySelector('p').textContent=message;},sound(on){text('sound',on?'Sound on':'Sound off');$('sound').setAttribute('aria-pressed',String(on));}};
}
