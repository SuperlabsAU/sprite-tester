const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pose,project,FRAME_LABELS}=require('./rig.cjs');
test('opposite contacts preserve anatomical identity and counter-swing',()=>{
 for(const view of ['platform','street','isometric','rpg'])for(const action of ['walk','run']){
  const right=pose(view,action,0),left=pose(view,action,4);
  assert.ok(right.legs.right.foot[0]>right.legs.left.foot[0]);
  assert.ok(left.legs.left.foot[0]>left.legs.right.foot[0]);
  for(const p of [right,left])for(const side of ['right','left'])
   assert.ok(p.arms[side].hand[0]*p.legs[side].foot[0]<0);
  assert.deepEqual(right.drawOrder,left.drawOrder);
  assert.ok(right.drawOrder.indexOf('left-arm')<right.drawOrder.indexOf('torso'));
  assert.ok(right.drawOrder.indexOf('right-arm')>right.drawOrder.indexOf('torso'));
 }
});
test('stance feet cancel configured travel and preserve bone lengths',()=>{
 for(const view of ['platform','street','isometric','rpg'])for(const action of ['walk','run']){
  for(const side of ['right','left']){
   const points=Array.from({length:8},(_,i)=>pose(view,action,i));
   const planted=points.flatMap((p,i)=>p.legs[side].stance?[{i,p}]:[]);
   for(let j=1;j<planted.length;j++){
    const a=planted[j-1],b=planted[j];if(b.i-a.i!==1)continue;
    const ap=project(view,a.p.legs[side].foot),bp=project(view,b.p.legs[side].foot);
    for(let axis=0;axis<2;axis++)assert.ok(Math.abs(bp[axis]-ap[axis]+a.p.stride[axis]/8)<1e-8);
   }
   for(const p of points){const {hip,knee,foot}=p.legs[side];
    assert.ok(Math.abs(Math.hypot(knee[0]-hip[0],knee[2]-hip[2])-11)<1e-8);
    assert.ok(Math.abs(Math.hypot(foot[0]-knee[0],foot[2]-knee[2])-11)<1e-8);
   }
  }
 }
});
test('run has two unsupported flight phases; jump lands after descent',()=>{
 for(const view of ['platform','street','isometric','rpg']){
  for(const i of [3,7]){const p=pose(view,'run',i);assert.ok(!p.legs.right.stance&&!p.legs.left.stance);assert.ok(p.lift>0);}
  const jumps=Array.from({length:8},(_,i)=>pose(view,'jump',i));
  assert.equal(jumps[0].lift,0);assert.equal(jumps[7].lift,0);
  assert.equal(jumps.findIndex(p=>p.lift===Math.max(...jumps.map(p=>p.lift))),4);
  assert.ok(jumps[6].lift>0);
  for(const [i,p] of jumps.entries())for(const side of ['right','left'])
   assert.equal(p.legs[side].stance,[0,1,7].includes(i));
  assert.ok(jumps.every(p=>p.stride.every(n=>n===0)));
 }
 assert.equal(FRAME_LABELS.walk.length,8);
});
