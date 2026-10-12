'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const {pose,project,FRAME_LABELS}=require('./rig.cjs');
const HERE=__dirname,ROOT=path.resolve(HERE,'../../..'),ASSETS=path.join(ROOT,'site/dist/assets');
const durations={walk:Array(8).fill(90),run:Array(8).fill(67.5),jump:[100,80,70,90,120,90,60,70]};
async function main(){
 const metadata=JSON.parse(fs.readFileSync(path.join(ASSETS,'motion.json'))),records={};
 for(const view of ['platform','street','isometric','rpg']){
  const scale=view==='street'?2:1,cell=64*scale,images={};
  for(const name of fs.readdirSync(path.join(HERE,'parts',view)))images[name.slice(0,-4)]=await loadImage(path.join(HERE,'parts',view,name));
  for(const action of ['walk','run','jump']){
   const key=`e-${view}-${action}`,strip=createCanvas(cell*8,cell),sc=strip.getContext('2d'),out=path.join(HERE,'frames',`${view}-${action}`);fs.mkdirSync(out,{recursive:true});
   const frames=[];
   for(let i=0;i<8;i++){
    const model=pose(view,action,i),canvas=createCanvas(cell,cell),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    const floor=view==='street'?118:view==='isometric'?51:view==='rpg'?50:56;
    const p=(point,includeLift=true)=>{const result=project(view,[point[0],point[1],point[2]+(includeLift?model.lift:0)]);return [cell/2+result[0],floor+result[1]];};
    function segment(name,a,b,width){const A=p(a),B=p(b),dx=B[0]-A[0],dy=B[1]-A[1],length=Math.hypot(dx,dy);ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);ctx.drawImage(images[name],-width*scale/2,-scale,width*scale,length+2*scale);ctx.restore();}
    function arm(side){const a=model.arms[side];segment(`${side}-upper-arm`,a.shoulder,a.elbow,3.8);segment(`${side}-forearm`,a.elbow,a.hand,2.8);}
    function leg(side){const l=model.legs[side];segment(`${side}-thigh`,l.hip,l.knee,5);segment(`${side}-shin`,l.knee,l.foot,3.8);const f=p(l.foot),w=(view==='rpg'?5:8)*scale,h=(view==='rpg'?6:4)*scale;ctx.drawImage(images[`${side}-shoe`],f[0]-w*.32,f[1]-h+2*scale,w,h);}
    // Fixed side ownership; no limb changes layer when its swing reverses.
    arm('left');leg('left');leg('right');
    const top=p([model.lean,0,31-model.crouch]),bottom=p([0,0,18-model.crouch]);
    ctx.drawImage(images.torso,top[0]-6.5*scale,top[1],13*scale,bottom[1]-top[1]+scale);
    arm('right');
    const head=p(model.head,false);ctx.drawImage(images.head,head[0]-6.5*scale,head[1]-7*scale,13*scale,14*scale);
    fs.writeFileSync(path.join(out,`${String(i+1).padStart(2,'0')}.png`),canvas.toBuffer('image/png'));sc.drawImage(canvas,i*cell,0);
    frames.push({frame:i+1,label:FRAME_LABELS[action][i],root:p(model.root,false),head,legs:model.legs,arms:model.arms,lift:model.lift*scale,drawOrder:model.drawOrder});
   }
   fs.writeFileSync(path.join(ASSETS,`${key}.png`),strip.toBuffer('image/png'));
   const model=pose(view,action,0);metadata.clips[key]={frames:8,durations:durations[action],labels:FRAME_LABELS[action],stride:model.stride.map(n=>Math.round(n*1000)/1000),calibrated:false,distanceBasis:'Authored stance trajectory: sampled joint displacement matches travel. Raster edges and held frames can still slide.',poseStatus:'Generated part textures; explicit eight-pose limb rig with fixed near/far ownership and pelvis registration',source:'OpenAI Game Studio + authored rig correction',lift:frames.map(f=>f.lift)};
   records[`${view}-${action}`]={cell,frames};
  }
 }
 metadata.revision=7;fs.writeFileSync(path.join(ASSETS,'motion.json'),JSON.stringify(metadata,null,2)+'\n');
 const original=JSON.parse(fs.readFileSync(path.join(HERE,'baseline-hashes.json')));
 for(const [name,hash]of Object.entries(original))if(crypto.createHash('sha256').update(fs.readFileSync(path.join(ASSETS,name))).digest('hex')!==hash)throw Error(`Changed ${name}`);
 fs.writeFileSync(path.join(HERE,'verification.json'),JSON.stringify({date:'2026-10-12',clips:records,existingAssetsUnchanged:true},null,2)+'\n');console.log('Rendered 96 frames; all 48 A–D strips unchanged.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
