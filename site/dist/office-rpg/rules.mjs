import {STAFF,MOVES,STATIONS} from './content.mjs';
import {blocked,POINTS} from './world.mjs';
export function createState(){return {version:1,mode:'explore',player:{x:14,y:17,face:'up',hp:96,maxHp:96,coffee:2},defeated:[],staff:STAFF.map(n=>({id:n.id,x:n.x,y:n.y,step:0})),battle:null,dialogue:null,encounterGrace:0,steps:0,turns:0,coffeesUsed:0,toast:'Three approvals. One manager. Absolutely no unpaid overtime.'};}
export function approvals(s){return ['hr','sales','product'].filter(id=>s.defeated.includes(id)).length;}
export function engage(s,id){
 if(s.mode!=='explore')return false;const n=STAFF.find(n=>n.id===id);if(!n)return false;
 const done=s.defeated.includes(id),locked=id==='boss'&&approvals(s)<3;
 s.dialogue={title:`${n.name} · ${n.role}`,text:done?n.after:locked?'“You need sign-off from People, Sales and Product before you can ask me for sign-off. It’s called efficiency.”':n.intro,next:done||locked?'explore':'battle',id};s.mode='dialogue';return true;
}
export function beginBattle(s){
 if(s.mode!=='dialogue'||s.dialogue?.next!=='battle')return false;const n=STAFF.find(n=>n.id===s.dialogue.id);
 s.battle={id:n.id,enemyHp:n.hp,maxHp:n.hp,turn:0,circle:3,result:null,log:[`${n.name} wants a quick chat. This will not be quick.`]};s.mode='battle';s.dialogue=null;return true;
}
export function movePlayer(s,dx,dy){
 if(s.mode!=='explore'||Math.abs(dx)+Math.abs(dy)!==1)return false;
 s.player.face=dx===1?'right':dx===-1?'left':dy===1?'down':'up';const x=s.player.x+dx,y=s.player.y+dy;
 const n=s.staff.find(n=>n.x===x&&n.y===y);if(n){if(s.encounterGrace<=0)engage(s,n.id);return false;}
 if(STATIONS.some(n=>n.x===x&&n.y===y)){interact(s);return false;}
 if(blocked(x,y))return false;s.player.x=x;s.player.y=y;s.steps++;s.encounterGrace=Math.max(0,s.encounterGrace-1);return true;
}
export function nearest(s){
 const list=[...s.staff.map(n=>({...n,name:STAFF.find(a=>a.id===n.id).name})),...STATIONS];
 return list.filter(n=>Math.abs(n.x-s.player.x)+Math.abs(n.y-s.player.y)<=1).sort((a,b)=>(Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y))-(Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
}
export function interact(s){
 if(s.mode!=='explore')return false;const n=nearest(s);if(!n)return false;
 if(STAFF.some(a=>a.id===n.id))return engage(s,n.id);
 if(n.id==='lift'){
  if(s.defeated.includes('boss')){s.mode='complete';return true;}
  s.dialogue={title:'LIFT ACCESS DENIED',text:'Leaving on time requires three departmental approvals and a manager’s sign-off. The fire stairs have been rebranded as a collaboration space.',next:'explore'};
 }else if(n.id==='coffee'){
  s.player.hp=s.player.maxHp;s.player.coffee=2;
  s.dialogue={title:'COFFEE · THE REAL BENEFITS PACKAGE',text:'Morale restored. Flask refilled for two battleside coffees. The machine understands your needs better than your manager.',next:'explore'};
 }else if(n.id==='printer'){
  s.dialogue={title:'PC LOAD LETTER',text:'The printer demands cyan ink to print a black-and-white resignation letter. Somewhere, Procurement smiles.',next:'explore'};
 }else{
  s.dialogue={title:'ALEX · UNPAID STRATEGIC RESOURCE',text:'“Pat hates boundaries. Chad can’t handle evidence. Morgan fears an email with everyone copied. The coffee machine heals you for free. I’ve learned a lot for zero dollars.”',next:'explore'};
 }
 s.mode='dialogue';return true;
}
export function closeDialogue(s){if(s.mode==='dialogue'){s.dialogue=null;s.mode='explore';s.encounterGrace=2;}}
export function takeTurn(s,key){
 const b=s.battle;if(s.mode!=='battle'||!b||b.result)return false;const n=STAFF.find(n=>n.id===b.id);b.log=[];
 if(key==='flee'){b.result='fled';b.log=['“Let’s take this offline.” You escape with no action items.'];return true;}
 let guard=0;
 if(key==='coffee'){
  if(s.player.coffee<=0){b.log=['The flask is empty. The kitchen offers free refills.'];return false;}
  if(s.player.hp===s.player.maxHp){b.log=['Your morale is already full. Save the coffee for later.'];return false;}
  s.player.coffee--;s.coffeesUsed++;s.player.hp=Math.min(s.player.maxHp,s.player.hp+42);b.log.push('You drink coffee. +42 morale. A legal performance enhancer.');
 }else{
  const move=MOVES[key];if(!move)return false;
  if(move.heal){if(b.circle<=0){b.log=['You can’t circle back forever. Pick another move.'];return false;}b.circle--;s.player.hp=Math.min(s.player.maxHp,s.player.hp+move.heal);}
  else{const strong=move.type===n.weak,damage=Math.round(move.power*(strong?1.6:1));b.enemyHp=Math.max(0,b.enemyHp-damage);b.log.push(`${move.name} deals ${damage} morale damage.${strong?' It’s painfully effective!':''}`);}
  b.log.push(move.quote);guard=move.guard||0;
 }
 b.turn++;s.turns++;
 if(b.enemyHp===0){b.result='won';b.log.push(`${n.name} has run out of corporate jargon. ${n.badge} earned!`);return true;}
 const [name,power,line]=n.moves[(b.turn-1)%n.moves.length],damage=Math.max(1,Math.round(power*(1-guard)));
 s.player.hp=Math.max(0,s.player.hp-damage);b.log.push(`${name}! ${line} −${damage} morale.${guard?' Your boundaries softened the blow.':''}`);
 if(s.player.hp===0){b.result='lost';b.log.push('You are professionally exhausted. The kitchen will see you now.');}
 return true;
}
export function finishBattle(s){
 const b=s.battle;if(!b?.result)return false;
 if(b.result==='won'&&!s.defeated.includes(b.id)){s.defeated.push(b.id);s.player.hp=Math.min(s.player.maxHp,s.player.hp+14);s.toast=b.id==='boss'?'Sign-off secured. Head to the lift and reclaim your evening.':`${STAFF.find(n=>n.id===b.id).badge} secured. +14 morale.`;}
 if(b.result==='lost'){s.player.x=4;s.player.y=4;s.player.hp=s.player.maxHp;s.player.coffee=2;s.toast='Back at the coffee machine. Approvals kept. Dignity pending.';}
 if(b.result==='fled')s.toast='Meeting declined. No explanation required.';
 s.mode='explore';s.battle=null;s.encounterGrace=3;return true;
}
export function wander(s){
 if(s.mode!=='explore')return;
 for(const n of s.staff){const def=STAFF.find(a=>a.id===n.id);if(def.route.length<2)continue;const step=(n.step+1)%def.route.length,[x,y]=def.route[step];
  if(blocked(x,y)||s.staff.some(a=>a.id!==n.id&&a.x===x&&a.y===y))continue;
  if(s.player.x===x&&s.player.y===y){if(s.encounterGrace<=0&&!s.defeated.includes(n.id)){engage(s,n.id);return;}continue;}
  n.x=x;n.y=y;n.step=step;
 }
}
export function saveGame(s){
 // Persist a settled outcome even while the player is reading the result screen.
 // Keep the visible battle untouched so its final morale and dialogue stay clear.
 if(s.battle?.result){s=structuredClone(s);finishBattle(s);}
 return JSON.stringify({version:1,player:s.player,defeated:s.defeated,steps:s.steps,turns:s.turns,coffeesUsed:s.coffeesUsed,complete:s.mode==='complete'});
}
export function loadGame(raw){
 const s=createState();try{const d=JSON.parse(raw);if(d?.version!==1)return s;const p=d.player;
  if(p&&Number.isFinite(p.hp)&&p.hp>0&&p.hp<=96)s.player.hp=p.hp;
  if(p&&Number.isInteger(p.coffee)&&p.coffee>=0&&p.coffee<=2)s.player.coffee=p.coffee;
  if(p&&!blocked(p.x,p.y)&&!STAFF.some(n=>n.x===p.x&&n.y===p.y)&&!STATIONS.some(n=>n.x===p.x&&n.y===p.y)){s.player.x=p.x;s.player.y=p.y;}
  s.defeated=[...new Set(Array.isArray(d.defeated)?d.defeated.filter(id=>['hr','sales','product'].includes(id)):[])];if(s.defeated.length===3&&d.defeated.includes('boss'))s.defeated.push('boss');
  for(const k of['steps','turns','coffeesUsed'])if(Number.isSafeInteger(d[k])&&d[k]>=0)s[k]=d[k];if(d.complete&&s.defeated.includes('boss'))s.mode='complete';s.encounterGrace=3;
 }catch{}return s;
}
