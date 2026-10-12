'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const {pose,project,FRAME_LABELS}=require('./rig.cjs');
const HERE=__dirname,ROOT=path.resolve(HERE,'../../..'),ASSETS=path.join(ROOT,'site/dist/assets');
const durations={walk:Array(8).fill(90),run:Array(8).fill(67.5),jump:[100,80,70,90,120,90,60,70]};
// Native A head pixels: no regenerated face, scale change or per-frame recrop.
const headSources={platform:[26,13,14,13,1],street:[56,31,22,23,-.5],isometric:[26,12,15,13,.5],rpg:[21,17,19,17,2.5]};
async function main(){
 const metadata=JSON.parse(fs.readFileSync(path.join(ASSETS,'motion.json'))),records={};
 for(const view of ['platform','street','isometric','rpg']){
  const scale=view==='street'?2:1,cell=64*scale,images={};
  for(const name of fs.readdirSync(path.join(HERE,'parts',view)))images[name.slice(0,-4)]=await loadImage(path.join(HERE,'parts',view,name));
  const approved=await loadImage(path.join(HERE,'references',`a-${view}-seed.png`));
  for(const action of ['walk','run','jump']){
   const key=`e-${view}-${action}`,strip=createCanvas(cell*8,cell),sc=strip.getContext('2d'),out=path.join(HERE,'frames',`${view}-${action}`);fs.mkdirSync(out,{recursive:true});
   const frames=[];
   for(let i=0;i<8;i++){
    const model=pose(view,action,i),canvas=createCanvas(cell,cell),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    const floor=view==='street'?118:view==='isometric'?51:view==='rpg'?50:56;
    const p=(point,includeLift=true)=>{const result=project(view,[point[0],point[1],point[2]+(includeLift?model.lift:0)]);return [cell/2+result[0],floor+result[1]];};
    function segment(name,a,b,width){const A=p(a),B=p(b),dx=B[0]-A[0],dy=B[1]-A[1],length=Math.hypot(dx,dy);ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);ctx.drawImage(images[name],-width*scale/2,-scale,width*scale,length+2*scale);ctx.restore();}
    function arm(side){const a=model.arms[side],offset=view==='rpg'?(side==='right'?3.8:-3.8):0;const q=j=>[j[0],j[1]+offset,j[2]];segment(`${side}-upper-arm`,q(a.shoulder),q(a.elbow),4.5);segment(`${side}-forearm`,q(a.elbow),q(a.hand),3.6);}
    function leg(side){const l=model.legs[side];segment(`${side}-thigh`,l.hip,l.knee,6.2);segment(`${side}-shin`,l.knee,l.foot,4.8);const f=p(l.foot),w=(view==='rpg'?5:8)*scale,h=(view==='rpg'?6:4)*scale;ctx.drawImage(images[`${side}-shoe`],f[0]-w*.32,f[1]-h+2*scale,w,h);}
    // Fixed side ownership; no limb changes layer when its swing reverses.
    arm('left');leg('left');leg('right');
    const top=p([model.lean,0,31-model.crouch]),bottom=p([0,0,18-model.crouch]);
    const collarRise=view==='street'?3:0,torsoWidth=(view==='rpg'?16:13)*scale,torsoHeight=view==='rpg'?13:bottom[1]-top[1]+scale+collarRise;
    ctx.drawImage(images.torso,Math.round(top[0]-torsoWidth/2),Math.round(top[1]-collarRise),torsoWidth,Math.round(torsoHeight));
    arm('right');
    const head=p(model.head,false),[sx,sy,hw,hh,dy]=headSources[view],headOrigin=[Math.round(head[0]-hw/2),Math.round(head[1]-hh/2+dy)];
    ctx.drawImage(approved,sx,sy,hw,hh,headOrigin[0],headOrigin[1],hw,hh);
    fs.writeFileSync(path.join(out,`${String(i+1).padStart(2,'0')}.png`),canvas.toBuffer('image/png'));sc.drawImage(canvas,i*cell,0);
    frames.push({frame:i+1,label:FRAME_LABELS[action][i],root:p(model.root,false),head,headOrigin,headSource:[sx,sy,hw,hh],legs:model.legs,arms:model.arms,lift:model.lift*scale,drawOrder:model.drawOrder});
   }
   fs.writeFileSync(path.join(ASSETS,`${key}.png`),strip.toBuffer('image/png'));
   const model=pose(view,action,0);metadata.clips[key]={frames:8,durations:durations[action],labels:FRAME_LABELS[action],stride:model.stride.map(n=>Math.round(n*1000)/1000),calibrated:false,distanceBasis:'Authored stance trajectory: sampled joint displacement matches travel. Raster edges and held frames can still slide.',poseStatus:'A-anchored clothing textures and native A head pixels; eight-pose limb rig with fixed near/far ownership and pelvis registration',source:'OpenAI Game Studio + A appearance restoration + authored rig correction',lift:frames.map(f=>f.lift)};
   records[`${view}-${action}`]={cell,frames};
  }
 }
 metadata.revision=8;fs.writeFileSync(path.join(ASSETS,'motion.json'),JSON.stringify(metadata,null,2)+'\n');
 const original=JSON.parse(fs.readFileSync(path.join(HERE,'baseline-hashes.json')));
 for(const [name,hash]of Object.entries(original))if(crypto.createHash('sha256').update(fs.readFileSync(path.join(ASSETS,name))).digest('hex')!==hash)throw Error(`Changed ${name}`);
 fs.writeFileSync(path.join(HERE,'verification.json'),JSON.stringify({date:'2026-10-12',clips:records,existingAssetsUnchanged:true},null,2)+'\n');console.log('Rendered 96 frames; all 48 A–D strips unchanged.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
