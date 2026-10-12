import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as rules from '../dist/office-rpg/rules.mjs';
import * as world from '../dist/office-rpg/world.mjs';
import * as content from '../dist/office-rpg/content.mjs';

const source=readFileSync(new URL('../dist/office-rpg/game.mjs',import.meta.url),'utf8');

function inputHarness(){
 const listeners=new Map(),buttons=new Map(),storage=new Map();
 let actions,tool;
 for(const direction of ['up','down','left','right']){
  const events=new Map();
  buttons.set(direction,{dataset:{dir:direction},events,setPointerCapture(){},addEventListener(name,handler){events.set(name,handler);}});
 }
 const context=vm.createContext({
  ...rules,...world,...content,structuredClone,performance,setTimeout,
  matchMedia:()=>({matches:false}),
  localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
  window:{addEventListener(){}},
  document:{
   readyState:'loading',activeElement:{tagName:'DIV'},
   querySelectorAll:selector=>selector==='[data-dir]'?[...buttons.values()]:[],
   addEventListener:(name,handler)=>listeners.set(name,handler),
   modelContext:{registerTool(value){tool=value;return Promise.resolve();}}
  },
  Phaser:{Scene:class{}},
  createUI(value){actions=value;return {render(){},toast(){},sound(){}};}
 });
 // Run the real input adapter and rules with only DOM/rendering dependencies
 // stubbed. The fake scene supplies the clock normally owned by Phaser.
 vm.runInContext(source.replace(/^import .*;\n/gm,''),context);
 vm.runInContext('scene={time:{now:0}}',context);
 return {
  start:()=>actions.start(),pause:()=>actions.pause(),
  key(type,key){listeners.get(type)({key,repeat:false,preventDefault(){}});},
  pointer(type,direction){buttons.get(direction).events.get(type)({pointerId:1,preventDefault(){}});},
  tick(milliseconds){vm.runInContext(`scene.time.now+=${milliseconds};step(scene.time.now)`,context);},
  async action(input){return JSON.parse((await tool.execute(input)).content[0].text);},
  async position(){return (await this.action({action:'status'})).position;}
 };
}

test('keyboard and pointer taps move once even when released before the next frame',async()=>{
 for(const control of ['keyboard','pointer']){
  const game=inputHarness();game.start();
  if(control==='keyboard'){game.key('keydown','ArrowRight');game.key('keyup','ArrowRight');}
  else{game.pointer('pointerdown','right');game.pointer('pointerup','right');}
  assert.deepEqual(await game.position(),{x:15,y:17},`${control}: quick tap moves immediately`);
  game.tick(1000);
  assert.deepEqual(await game.position(),{x:15,y:17},`${control}: release prevents repeated movement`);
 }
});

test('keyboard, pointer and playtesting movement respect onboarding and pause',async()=>{
 const game=inputHarness();
 for(const mode of ['onboarding','paused']){
  if(mode==='paused'){game.start();game.pause();}
  game.key('keydown','ArrowRight');game.key('keyup','ArrowRight');
  game.pointer('pointerdown','right');game.pointer('pointerup','right');
  await game.action({action:'move',direction:'right',steps:2});
  game.tick(1000);
  assert.deepEqual(await game.position(),{x:14,y:17},`${mode}: all movement stays blocked`);
 }
 game.pause();game.tick(1000);
 assert.deepEqual(await game.position(),{x:14,y:17},'resuming does not replay blocked input');
});

test('pausing interrupts a playtesting move before its remaining steps',async()=>{
 const game=inputHarness();game.start();
 const movement=game.action({action:'move',direction:'right',steps:8});
 game.pause();
 const result=await movement;
 assert.equal(result.paused,true);
 assert.deepEqual(result.position,{x:15,y:17});
});
