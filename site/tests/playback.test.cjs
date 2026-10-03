const {test}=require('node:test');
const assert=require('node:assert/strict');
const motion=require('../dist/app.js');

test('walk frame boundaries and cycle seam use all six frames',()=>{
 const clip=motion.clip('a-platform-walk');
 assert.equal(clip.frames,6);
 for(let frame=0;frame<6;frame++){
  assert.equal(motion.sample(frame*120,clip).frame,frame);
  assert.equal(motion.sample(frame*120+119.999,clip).frame,frame);
 }
 assert.equal(motion.sample(720,clip).frame,0);
 assert.deepEqual(motion.sample(720,clip).distance,[40,0]);
 assert.equal(motion.sample(1439.9,clip).frame,5);
 assert.deepEqual(motion.sample(1440,clip).distance,[80,0]);
});
test('per-frame jump durations have correct boundaries and zero ground travel',()=>{
 const clip=motion.clip('b-street-jump',{clips:{'b-street-jump':{stride:[99,99]}}});
 const starts=[0,140,210,310,450,550];
 starts.forEach((time,frame)=>{assert.equal(motion.sample(time,clip).frame,frame);assert.equal(motion.frameTime(frame,clip),time);});
 assert.equal(motion.sample(680,clip).frame,0);
 assert.equal(motion.sample(679.9,clip).frame,5);
 assert.deepEqual(motion.sample(340,clip).distance,[0,0]);
 assert.throws(()=>motion.frameTime(6,clip),/Invalid frame/);
});
test('metadata controls calibrated stride and individual frame durations',()=>{
 const config=motion.clip('b-isometric-walk',{clips:{'b-isometric-walk':{frames:8,durations:[80,90,100,110,80,90,100,110],stride:[20,10]}}});
 assert.equal(config.frames,8);assert.equal(config.labels[4],'Phase 5');assert.equal(config.total,760);assert.equal(motion.sample(80,config).frame,1);
 assert.deepEqual(motion.sample(380,config).distance,[10,5]);
 assert.deepEqual(motion.sample(760,config).distance,[20,10]);
});
test('projection defaults scale street distance and keep top-down travel vertical',()=>{
 assert.deepEqual(motion.clip('a-street-run').stride,[128,0]);
 assert.deepEqual(motion.clip('a-isometric-run').stride,[40,20]);
 assert.deepEqual(motion.clip('a-rpg-walk').stride,[0,24]);
});
test('speed affects pose and ground distance together; pause and in-place stay still',()=>{
 const clip=motion.clip('a-platform-run');
 assert.equal(motion.advance(0,100,1.5,true),150);
 assert.equal(motion.advance(42,100,1.5,false),42);
 const slow=motion.sample(motion.advance(0,270,.5,true),clip);
 const fast=motion.sample(motion.advance(0,270,1.5,true),clip);
 assert.equal(slow.frame,1);assert.equal(fast.frame,4);
 assert.equal(fast.distance[0],slow.distance[0]*3);
 assert.deepEqual(motion.sample(500,clip,false).distance,[0,0]);
});
test('frame stepping preserves distance across the last-to-first boundary',()=>{
 const clip=motion.clip('a-platform-walk');
 const before=motion.sample(motion.frameTime(5,clip),clip);
 const after=motion.sample(motion.frameTime(0,clip,1),clip);
 assert.ok(Math.abs(after.distance[0]-before.distance[0]-40/6)<1e-9);
 assert.equal(after.frame,0);
});

test('browser controls initialise, reduced motion pauses, and WebMCP validates action-specific frames',async()=>{
 const vm=require('node:vm'),fs=require('node:fs');
 const elements=new Map(),mediaListeners={};let registered;
 const element=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',value:'',dataset:{},listeners:{},classList:{toggle(){}},setAttribute(){},addEventListener(name,handler){this.listeners[name]=handler;}});return elements.get(selector);};
 const context={module:{exports:{}},console,AbortController,Image:class{},ResizeObserver:class{observe(){}},requestAnimationFrame(){},addEventListener(){},fetch:async()=>({ok:true,json:async()=>({clips:{}})}),matchMedia:()=>({matches:true,addEventListener(name,handler){mediaListeners[name]=handler;}}),document:{body:element('body'),querySelector:element,querySelectorAll:()=>[],addEventListener(){},modelContext:{registerTool(tool){registered=tool;}}}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../dist/app.js'),'utf8'),context);
 await new Promise(resolve=>setImmediate(resolve));
 assert.ok(registered);
 let state=registered.execute({});assert.equal(state.playing,false);assert.equal(state.frames,6);
 state=registered.execute({action:'walk',frame:6});assert.equal(state.frame,6);assert.equal(state.playing,false);
 assert.throws(()=>registered.execute({action:'jump',frame:7}),/1–6/);
 state=registered.execute({});assert.equal(state.action,'walk');assert.equal(state.frame,6);
 state=registered.execute({action:'jump',frame:6,mode:'in-place'});assert.equal(state.frames,6);assert.equal(state.frame,6);assert.equal(state.mode,'in-place');
 registered.execute({playing:true});mediaListeners.change({matches:true});assert.equal(registered.execute({}).playing,false);
});
