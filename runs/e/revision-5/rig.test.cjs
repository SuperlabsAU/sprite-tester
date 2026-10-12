const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pose,sources}=require('./rig.cjs');
const length=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
test('opposite contacts alternate legs and preserve overlap ownership',()=>{
 for(const [view,s] of Object.entries(sources))for(const action of ['walk','run']){
  const a=pose(view,action,0),b=pose(view,action,4);
  const travel=p=>dot([p.legs.right.foot[0]-p.legs.left.foot[0],p.legs.right.foot[1]-p.legs.left.foot[1]],s.forward);
  assert.ok(travel(a)>0,view);assert.ok(travel(b)<0,view);
  assert.deepEqual(a.drawOrder,b.drawOrder);
  assert.ok(a.drawOrder.indexOf('left-arm')<a.drawOrder.indexOf('body'));
  assert.ok(a.drawOrder.indexOf('right-arm')>a.drawOrder.indexOf('body'));
  if(view!=='rpg')for(const p of [a,b])for(const side of ['right','left']){
   const hand=p.arms[side].hand[0]-p.arms[side].shoulder[0];
   const foot=p.legs[side].foot[0]-(s.feet[side][0]-(side==='right'?1:-1)*s.forward[0]);
   assert.ok(hand*foot<0,`${view} ${action} ${side} counter-swing`);
  }
 }
});
test('stance ankles cancel sampled travel including the cycle seam',()=>{
 for(const view of Object.keys(sources))for(const action of ['walk','run'])for(const side of ['right','left']){
  for(let i=0;i<8;i++){
   const a=pose(view,action,i),b=pose(view,action,(i+1)%8);
   if(!a.legs[side].stance||!b.legs[side].stance)continue;
   for(let axis=0;axis<2;axis++)assert.ok(Math.abs(b.legs[side].foot[axis]-a.legs[side].foot[axis]+a.stride[axis]/8)<1e-8,`${view} ${action} ${i}`);
  }
 }
});
test('articulated arms retain length and elevated donor limbs avoid stretching',()=>{
 for(const [view,s]of Object.entries(sources))for(const action of ['walk','run','jump'])for(let i=0;i<8;i++){
  const p=pose(view,action,i);
  for(const side of ['right','left']){
   const arm=p.arms[side],donor=s.arms[view==='rpg'&&side==='left'?'right':side];
   for(const[a,b]of [['shoulder','elbow'],['elbow','hand']]){
    const ratio=length(arm[a],arm[b])/length(donor[a],donor[b]);
    assert.ok(ratio>0&&ratio<=1.001,`${view} ${action} ${i} arm stretch ${ratio}`);
    if(view!=='rpg')assert.ok(Math.abs(ratio-1)<1e-8);
   }
   const leg=p.legs[side],d=['isometric','rpg'].includes(view)?'right':side;
   const upper=length(leg.hip,leg.knee)/length(s.hips[d],s.legs[d].knee);
   const lower=length(leg.knee,leg.foot)/length(s.legs[d].knee,s.feet[d]);
   assert.ok(upper<1.3&&lower<1.3,`${view} ${action} ${i} leg stretch ${upper},${lower}`);
  }
 }
});
test('flight phases and jump arc retain support, apex and landing order',()=>{
 for(const view of Object.keys(sources)){
  for(const i of [3,7]){const p=pose(view,'run',i);assert.ok(!p.legs.right.stance&&!p.legs.left.stance&&p.lift>0);}
  const jumps=Array.from({length:8},(_,i)=>pose(view,'jump',i));
  assert.equal(jumps.findIndex(p=>p.lift===Math.max(...jumps.map(j=>j.lift))),4);
  assert.equal(jumps[0].lift,0);assert.equal(jumps[7].lift,0);assert.ok(jumps[6].lift>0);
  for(const p of jumps)assert.deepEqual(p.stride,[0,0]);
 }
});
