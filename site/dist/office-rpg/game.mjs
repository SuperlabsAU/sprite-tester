import {STAFF,MOVES,STATIONS} from './content.mjs';
import {TILE,COLS,ROWS,findPath,blocked} from './world.mjs';
import {createState,loadGame,saveGame,movePlayer,engage,beginBattle,takeTurn,finishBattle,interact,closeDialogue,wander,approvals} from './rules.mjs';
import {floorArt,battleArt,nativePeopleSheet} from './art.mjs';
import {createUI} from './ui.mjs';
const SAVE='out-of-office-v1',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state;try{state=loadGame(localStorage.getItem(SAVE));}catch{state=createState();}
let started=false,paused=false,busy=false,scene=null,sound=false,audio=null,keys=new Set(),route=[],destination=null,lastStep=0,lastWander=0,toastUntil=0,game=null;
function save(){try{localStorage.setItem(SAVE,saveGame(state));}catch{document.getElementById('status').textContent='Device storage unavailable. This shift will not persist after reload.';}}
function tone(freq=440,duration=.07){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{sound=false;ui.sound(false);}}
function render(){ui.render(state,{started,paused,busy});save();}
function notify(message){ui.toast(message);toastUntil=performance.now()+5500;}
function resetInput(){keys.clear();route=[];destination=null;}
function modeChanged(){resetInput();render();if(state.mode==='battle')tone(200,.15);}
function doInteract(){if(!started||paused||busy)return;const before=state.mode;interact(state);if(state.mode!==before)modeChanged();}
function continueDialogue(){if(busy||paused)return;if(state.mode==='dialogue'){if(state.dialogue?.next==='battle')beginBattle(state);else closeDialogue(state);modeChanged();}}
async function battleMove(key){if(!started||paused||busy||state.mode!=='battle')return false;const hp=state.player.hp,enemy=state.battle.enemyHp;const acted=takeTurn(state,key);if(!acted){render();return false;}busy=true;render();tone(key==='coffee'?650:310,.12);scene?.battleEffect(enemy>state.battle.enemyHp?'enemy':'player');await new Promise(r=>setTimeout(r,reduced?120:650));if(state.player.hp<hp){scene?.battleEffect('player');tone(130,.12);}busy=false;render();return true;}
function endBattle(){if(busy||paused)return;if(finishBattle(state)){notify(state.toast);modeChanged();}}
function togglePause(){if(!started||state.mode==='complete')return;paused=!paused;resetInput();render();}
function restart(){state=createState();started=true;paused=false;busy=false;resetInput();scene?.syncPositions(true);notify(state.toast);render();}
const ui=createUI({start(){started=true;render();notify(state.toast);tone(520);},pause:togglePause,continue:continueDialogue,cancel(){closeDialogue(state);modeChanged();},finish:endBattle,interact:doInteract,battle:battleMove,coffee:()=>battleMove('coffee'),flee:()=>battleMove('flee'),restart,sound(){sound=!sound;ui.sound(sound);tone(660);}});
const dirs={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
function focusUI(){return !started||paused||state.mode!=='explore';}
function nudge(key){if(focusUI()||busy||!scene)return;keys.add(key);route=[];destination=null;lastStep=-Infinity;step(scene.time.now);}
document.addEventListener('keydown',e=>{
 const key=e.key.length===1?e.key.toLowerCase():e.key;
 if(key==='Escape'){e.preventDefault();togglePause();return;}
 if(dirs[key]&&!focusUI()){e.preventDefault();if(!e.repeat)nudge(key);return;}
 if(key==='Shift'){keys.add(key);return;}
 if(e.repeat)return;
 if(state.mode==='battle'&&!paused){const move=Object.keys(MOVES)[Number(key)-1];if(move){e.preventDefault();battleMove(move);}else if(key==='c')battleMove('coffee');else if(key==='r')battleMove('flee');}
 if(key==='e'||(key===' '&&!['BUTTON','A'].includes(document.activeElement?.tagName))){e.preventDefault();if(state.mode==='dialogue')continueDialogue();else if(state.mode==='battle'&&state.battle?.result)endBattle();else doInteract();}
});
document.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>{resetInput();if(started&&!paused&&state.mode!=='complete'){paused=true;render();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){resetInput();if(started&&state.mode!=='complete')paused=true;render();}});
for(const button of document.querySelectorAll('[data-dir]')){const key={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[button.dataset.dir];button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);nudge(key);});for(const name of['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>keys.delete(key));}
function walkTo(target){
 if(focusUI()||busy)return false;
 const object=typeof target==='string'?[...state.staff,...STATIONS].find(n=>n.id===target):target;if(!object)return false;
 const occupied=[...state.staff,...STATIONS],candidates=object.id?[[0,1],[1,0],[-1,0],[0,-1]].map(([dx,dy])=>({x:object.x+dx,y:object.y+dy})).filter(p=>!blocked(p.x,p.y)&&!occupied.some(n=>n.x===p.x&&n.y===p.y)):[object];
 let best=null;for(const p of candidates){const path=findPath(state.player,p,occupied);if((path.length||p.x===state.player.x&&p.y===state.player.y)&&(!best||path.length<best.length))best=path;}
 if(!best){notify('That spot is blocked. Even the floor plan has dependencies.');return false;}
 keys.clear();route=best;destination=object.id?object:null;
 if(route.length===0&&destination){if(STAFF.some(n=>n.id===destination.id)){const n=state.staff.find(n=>n.id===destination.id);if(Math.abs(n.x-state.player.x)+Math.abs(n.y-state.player.y)<=1)engage(state,n.id);}else interact(state);modeChanged();}
 return true;
}
function step(time){
 if(focusUI()||busy)return;const duration=keys.has('Shift')?100:160;if(time-lastStep<duration)return;
 let direction=[...keys].map(k=>dirs[k]).find(Boolean);if(!direction&&route.length){const n=route[0];direction=[n.x-state.player.x,n.y-state.player.y];if(Math.abs(direction[0])+Math.abs(direction[1])!==1){route=[];destination=null;return;}}
 if(!direction)return;lastStep=time;const before=state.mode,moved=movePlayer(state,...direction);
 if(moved){if(route.length)route.shift();scene.movingUntil=time+duration;scene.walkDuration=duration;if(route.length===0&&destination){const target=destination;destination=null;if(STAFF.some(n=>n.id===target.id)){const n=state.staff.find(n=>n.id===target.id);if(Math.abs(n.x-state.player.x)+Math.abs(n.y-state.player.y)<=1)engage(state,n.id);else walkTo(target.id);}else interact(state);}}
 else if(route.length){route=[];destination=null;}
 if(state.mode!==before)resetInput();render();
}
class OfficeScene extends Phaser.Scene{
 constructor(){super('office');this.movingUntil=0;this.walkDuration=160;this.actors=new Map();}
 preload(){this.load.spritesheet('player-front','../assets/e-rpg-walk.png',{frameWidth:64,frameHeight:64});this.load.spritesheet('player-side','../assets/e-isometric-walk.png',{frameWidth:64,frameHeight:64});this.load.on('loaderror',file=>ui.error(`Could not load ${file.key}. Reload to try again.`));}
 create(){
  scene=this;this.textures.addCanvas('floor',floorArt());this.textures.addCanvas('battle-room',battleArt());
  const addSheet=(key,c)=>{const t=this.textures.addCanvas(key,c);for(let i=0;i<8;i++)t.add(i,0,i*64,0,64,64);};
  const native=this.textures.get('player-front').getSourceImage();addSheet('player-back',nativePeopleSheet(native,{back:true}));for(const n of STAFF){addSheet(n.id,nativePeopleSheet(native,{shirt:n.colour,hair:n.id==='hr'?'#755d43':n.id==='product'?'#6b4e39':'#393936',skin:n.id==='product'?'#bb805e':'#e8aa75',tie:n.id==='boss'||n.id==='sales'}));}
  addSheet('intern',nativePeopleSheet(native,{shirt:'#d3c997',hair:'#724d32'}));
  this.worldRoot=this.add.container();this.worldRoot.add(this.add.image(0,0,'floor').setOrigin(0));
  for(const[x,y,name]of[[3,7,'COFFEE / CARE'],[12,7,'ALIGNMENT'],[22,7,'MANAGEMENT'],[3,13,'PEOPLE'],[24,17,'GROWTH & VIBES']]){const t=this.add.text(x*32,y*32+9,name,{fontFamily:'monospace',fontSize:'9px',color:'#48675e',fontStyle:'bold'});this.worldRoot.add(t);}
  this.worldRoot.add(this.add.text(432,582,'CLOCK OFF',{fontFamily:'monospace',fontSize:'9px',color:'#e7edda',fontStyle:'bold'}));
  for(const n of [...state.staff,{id:'intern',x:11,y:16}]){
   const sprite=this.add.sprite(n.x*32+16,n.y*32+30,n.id,0).setOrigin(.5,1),label=this.add.text(n.x*32+16,n.y*32-30,n.id==='intern'?'?':'!',{fontFamily:'monospace',fontSize:'13px',fontStyle:'bold',color:'#20363b',backgroundColor:n.id==='intern'?'#e7deaa':'#edb085',padding:{x:4,y:1}}).setOrigin(.5,1);
   this.actors.set(n.id,{sprite,label});this.worldRoot.add([sprite,label]);
  }
  this.player=this.add.sprite(state.player.x*32+16,state.player.y*32+30,'player-back',0).setOrigin(.5,1);this.playerRing=this.add.ellipse(this.player.x,this.player.y-3,25,10,0xb4eccd,.5).setStrokeStyle(1,0x376858,.7);this.worldRoot.add([this.playerRing,this.player]);
  this.battleRoot=this.add.container().setScrollFactor(0).setVisible(false);this.battleBg=this.add.image(0,0,'battle-room').setOrigin(0).setScrollFactor(0);this.enemy=this.add.sprite(0,0,'hr',0).setOrigin(.5,1).setScrollFactor(0);this.battlePlayer=this.add.sprite(0,0,'player-back',0).setOrigin(.5,1).setScrollFactor(0);this.battleRoot.add([this.battleBg,this.battlePlayer,this.enemy]);
  this.input.on('pointerdown',pointer=>{if(focusUI())return;const p=this.cameras.main.getWorldPoint(pointer.x,pointer.y),x=Math.floor(p.x/32),y=Math.floor(p.y/32),n=[...state.staff,...STATIONS].find(n=>n.x===x&&n.y===y);walkTo(n?.id||{x,y});});
  this.scale.on('resize',()=>this.resize());this.resize();this.syncPositions(true);ui.loaded();render();
 }
 resize(){this.w=this.scale.width;this.h=this.scale.height;this.exploreZoom=this.w<650?1.3:Math.min(this.w/960,this.h/640);this.cameras.main.setRoundPixels(true);}
 syncPositions(snap=false){if(!this.player)return;const p=state.player;if(snap)this.player.setPosition(p.x*32+16,p.y*32+30);for(const n of state.staff){const a=this.actors.get(n.id);if(snap)a.sprite.setPosition(n.x*32+16,n.y*32+30);}}
 battleEffect(who){if(reduced)return;const sprite=who==='enemy'?this.enemy:this.battlePlayer;sprite.setTint(0xffffff);this.tweens.add({targets:sprite,alpha:.25,duration:90,yoyo:true,repeat:1,onComplete:()=>sprite.setAlpha(1)});}
 update(time,delta){
  const battle=state.mode==='battle';this.worldRoot.setVisible(!battle);this.battleRoot.setVisible(battle);const cam=this.cameras.main;
  if(battle){cam.stopFollow();cam.setZoom(1);cam.setScroll(0,0);cam.removeBounds();this.battleBg.setDisplaySize(this.w,this.h);const mobile=this.w<650,scale=mobile?2.05:3.6;this.enemy.setTexture(state.battle.id,0).setScale(scale).setPosition(this.w*.75,mobile?185:this.h*.44);this.battlePlayer.setScale(scale).setPosition(this.w*.26,mobile?282:this.h*.7);return;}
  cam.setZoom(this.exploreZoom);cam.stopFollow();cam.removeBounds();const vw=this.w/this.exploreZoom,vh=this.h/this.exploreZoom;cam.setScroll(vw>=960?(960-vw)/2:Math.max(0,Math.min(960-vw,this.player.x-vw/2)),vh>=640?(640-vh)/2:Math.max(0,Math.min(640-vh,this.player.y-vh/2)));step(time);
  if(!focusUI()&&!busy&&time-lastWander>2200&&route.length===0){const mode=state.mode;wander(state);lastWander=time;if(mode!==state.mode)modeChanged();}
  const factor=Math.min(1,delta/60),p=state.player;this.player.x+=(p.x*32+16-this.player.x)*factor;this.player.y+=(p.y*32+30-this.player.y)*factor;
  const moving=!focusUI()&&time<this.movingUntil;const frame=moving?Math.floor(time/(this.walkDuration*.55))%8:0,key=p.face==='up'?'player-back':p.face==='down'?'player-front':'player-side';this.player.setTexture(key,frame).setFlipX(p.face==='left');this.playerRing.setPosition(this.player.x,this.player.y-3);this.player.setDepth(p.y*32+1);this.playerRing.setDepth(p.y*32);
  for(const n of state.staff){const a=this.actors.get(n.id),dx=n.x*32+16-a.sprite.x,dy=n.y*32+30-a.sprite.y;const moving=Math.abs(dx)+Math.abs(dy)>1;a.sprite.x+=dx*factor;a.sprite.y+=dy*factor;a.sprite.setFrame(moving?Math.floor(time/110)%8:0).setDepth(n.y*32);a.label.setPosition(a.sprite.x,a.sprite.y-57).setText(state.defeated.includes(n.id)?'✓':n.id==='boss'&&approvals(state)<3?'…':'!').setStyle({backgroundColor:state.defeated.includes(n.id)?'#bce6bb':'#edb085'}).setDepth(n.y*32+2);}
  this.worldRoot.sort('depth');if(toastUntil&&performance.now()>toastUntil){ui.toast('');toastUntil=0;}
 }
}
function boot(){if(!window.Phaser){ui.error('The game engine could not load. Reload this page to try again.');return;}game=new Phaser.Game({type:Phaser.CANVAS,parent:'world',backgroundColor:'#afc4b6',pixelArt:true,antialias:false,roundPixels:true,scale:{mode:Phaser.Scale.RESIZE,width:'100%',height:'100%'},audio:{noAudio:true},scene:OfficeScene,banner:false});}
// DOM-facing play controls. They use the same paths, collisions and commands as
// a player; no teleport, health override or progression bypass is exposed.
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'office_rpg_action',title:'Play Out of Office',description:'Play the office RPG through normal controls. Start, walk to a named coworker or station, interact, continue dialogue, choose a battle move, finish a battle, pause or resume. Navigate walks along the real collision map; it cannot teleport or grant progress.',inputSchema:{type:'object',properties:{action:{type:'string',enum:['start','navigate','interact','continue','cancel','move','battle','finish','pause','resume','status']},target:{type:'string',enum:['hr','sales','product','boss','coffee','printer','intern','lift']},direction:{type:'string',enum:['up','down','left','right']},steps:{type:'integer',minimum:1,maximum:8},move:{type:'string',enum:['reply','receipts','boundaries','circle','coffee','flee']}},required:['action'],additionalProperties:false},async execute(input){
 if(input.action==='start'){started=true;paused=false;render();}
 if(input.action==='navigate'){walkTo(input.target);const deadline=performance.now()+18000;while(route.length&&state.mode==='explore'&&!paused&&performance.now()<deadline)await new Promise(r=>setTimeout(r,100));}
 if(input.action==='move'){resetInput();for(let i=0;i<(input.steps||1)&&!focusUI()&&!busy;i++){movePlayer(state,...({up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[input.direction]||[0,0]));render();await new Promise(r=>setTimeout(r,180));}}
 if(input.action==='interact')doInteract();if(input.action==='continue')continueDialogue();if(input.action==='cancel'){closeDialogue(state);modeChanged();}if(input.action==='battle')await battleMove(input.move);if(input.action==='finish')endBattle();if(input.action==='pause'&&!paused)togglePause();if(input.action==='resume'&&paused)togglePause();
 return {content:[{type:'text',text:JSON.stringify({mode:state.mode,paused,position:{x:state.player.x,y:state.player.y},morale:state.player.hp,coffee:state.player.coffee,approvals:state.defeated,dialogue:state.dialogue,battle:state.battle})}]};
 }}).catch?.(()=>{});}catch{}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
