'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const {pose,FRAME_LABELS,sources}=require('./rig.cjs');
const HERE=__dirname,ROOT=path.resolve(HERE,'../../..'),ASSETS=path.join(ROOT,'site/dist/assets');
const durations={walk:Array(8).fill(90),run:Array(8).fill(67.5),jump:[100,80,70,90,120,90,60,70]};
function clearRasterSpecks(ctx,cell){
 const pixels=ctx.getImageData(0,0,cell,cell),pending=new Set();
 for(let i=0;i<cell*cell;i++)if(pixels.data[i*4+3]>128)pending.add(i);
 const components=[];
 while(pending.size){const first=pending.values().next().value,queue=[first];pending.delete(first);for(let j=0;j<queue.length;j++){const p=queue[j],x=p%cell,y=Math.floor(p/cell);for(let yy=Math.max(0,y-1);yy<=Math.min(cell-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(cell-1,x+1);xx++){const q=yy*cell+xx;if(pending.delete(q))queue.push(q);}}components.push(queue);}
 components.sort((a,b)=>b.length-a.length);let removed=0;
 for(const c of components.slice(1)){if(c.length>3)throw Error(`Disconnected anatomy: ${c.length} pixels`);for(const p of c){pixels.data[p*4+3]=0;removed++;}}
 ctx.putImageData(pixels,0,0);return removed;
}
async function main(){
 const metadata=JSON.parse(fs.readFileSync(path.join(ASSETS,'motion.json'))),records={};
 for(const [view,s]of Object.entries(sources)){
  const {cell}=s,seed=await loadImage(path.join(HERE,'references',`a-${view}-seed.png`)),parts=require('./parts.cjs').makeParts(seed,s,view);
  const pd=path.join(HERE,'parts',view);fs.mkdirSync(pd,{recursive:true});for(const[n,c]of Object.entries(parts))fs.writeFileSync(path.join(pd,n+'.png'),c.toBuffer('image/png'));
  for(const action of ['walk','run','jump']){
   const key=`e-${view}-${action}`,strip=createCanvas(cell*8,cell),sc=strip.getContext('2d'),out=path.join(HERE,'frames',`${view}-${action}`);fs.mkdirSync(out,{recursive:true});const frames=[];
   for(let i=0;i<8;i++){
    const model=pose(view,action,i),canvas=createCanvas(cell,cell),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    function segment(name,a,b,A,B){const da=[b[0]-a[0],b[1]-a[1]],db=[B[0]-A[0],B[1]-A[1]],sa=Math.hypot(...da),sb=Math.hypot(...db),aa=Math.atan2(da[1],da[0]),ab=Math.atan2(db[1],db[0]);ctx.save();ctx.translate(A[0],A[1]);ctx.rotate(ab);ctx.scale(sb/sa,1);ctx.rotate(-aa);ctx.translate(-a[0],-a[1]);ctx.drawImage(parts[name],0,0);ctx.restore();}
    function arm(side){const donor=view==='rpg'&&side==='left'?'right':side,a=s.arms[donor],b=model.arms[side];segment(`${donor}-upper`,a.shoulder,a.elbow,b.shoulder,b.elbow);segment(`${donor}-fore`,a.elbow,a.hand,b.elbow,b.hand);}
    function leg(side){const donor=['isometric','rpg'].includes(view)&&side==='left'?'right':side,a=s.legs[donor],b=model.legs[side];segment(`${donor}-thigh`,s.hips[donor],a.knee,b.hip,b.knee);segment(`${donor}-shin`,a.knee,s.feet[donor],b.knee,b.foot);ctx.drawImage(parts[`${donor}-shoe`],Math.round(b.foot[0]-s.feet[donor][0]),Math.round(b.foot[1]-s.feet[donor][1]));}
    arm('left');leg('left');leg('right');ctx.drawImage(parts.body,Math.round(model.body[0]),Math.round(model.body[1]));arm('right');ctx.drawImage(parts.head,Math.round(model.body[0]),Math.round(model.body[1]));
    let removedSpecks;try{removedSpecks=clearRasterSpecks(ctx,cell);}catch(e){throw Error(`${view} ${action} F${i+1}: ${e.message}`);}
    fs.writeFileSync(path.join(out,`${String(i+1).padStart(2,'0')}.png`),canvas.toBuffer('image/png'));sc.drawImage(canvas,i*cell,0);frames.push({frame:i+1,removedSpecks,...model});
   }
   fs.writeFileSync(path.join(ASSETS,`${key}.png`),strip.toBuffer('image/png'));const model=pose(view,action,0);
   metadata.clips[key]={frames:8,durations:durations[action],labels:FRAME_LABELS[action],stride:model.stride.map(n=>Math.round(n*1000)/1000),calibrated:false,distanceBasis:'A-derived projected stance trajectory; travel cancels the sampled planted ankle displacement. Held frames still step.',poseStatus:'Native A body, clothing and face pixels articulated with view-specific proportions; alternating limbs and fixed near/far ownership',source:'OpenAI Game Studio motion correction + native A artwork rig',lift:frames.map(f=>f.lift)};records[`${view}-${action}`]={cell,frames};
  }
 }
 metadata.revision=9;fs.writeFileSync(path.join(ASSETS,'motion.json'),JSON.stringify(metadata,null,2)+'\n');
 for(const[name,hash]of Object.entries(JSON.parse(fs.readFileSync(path.join(HERE,'baseline-hashes.json')))))if(crypto.createHash('sha256').update(fs.readFileSync(path.join(ASSETS,name))).digest('hex')!==hash)throw Error(`Changed ${name}`);
 fs.writeFileSync(path.join(HERE,'verification.json'),JSON.stringify({date:'2026-10-12',clips:records,existingAssetsUnchanged:true},null,2)+'\n');console.log('Rendered 96 A-derived frames; all 48 A–D strips unchanged.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
