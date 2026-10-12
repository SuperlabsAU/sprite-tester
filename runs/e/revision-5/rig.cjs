'use strict';
const sources=require('./source-rig.cjs');
const FRAME_LABELS={walk:['R contact','R down','L passing','R up','L contact','L down','R passing','L up'],run:['R contact','R stance','L passing','Flight','L contact','L stance','R passing','Flight'],jump:['Crouch','Launch','Rise','Rise','Apex','Fall','Fall','Landing']};
const add=(a,b)=>a.map((n,j)=>n+b[j]),sub=(a,b)=>a.map((n,j)=>n-b[j]),mul=(a,s)=>a.map(n=>n*s),mix=(a,b,t)=>add(a,mul(sub(b,a),t));
function knee(hip,foot,sourceHip,sourceKnee,sourceFoot,bend=1){
 const l1=Math.hypot(...sub(sourceKnee,sourceHip)),l2=Math.hypot(...sub(sourceFoot,sourceKnee));
 const delta=sub(foot,hip),dist=Math.hypot(...delta),stretch=Math.max(1,dist/(l1+l2-.001)),a=l1*stretch,b=l2*stretch;
 const along=(a*a-b*b+dist*dist)/(2*dist),h=Math.sqrt(Math.max(0,a*a-along*along));
 return add(hip,add(mul(delta,along/dist),mul([delta[1],-delta[0]],h/dist*bend)));
}
function pose(view,action,i){
 const s=sources[view],scale=s.cell/64,phase=i/8,amp=action==='run'?1.22:1,stance=action==='run'?.375:.5;
 const lift=(action==='jump'?[0,0,3,7,10,7,3,0][i]:action==='run'&&i%4===3?1.5:0)*scale;
 const bob=(action==='jump'?[2,0,0,1,2,1,0,2][i]:action==='run'?[.6,.9,0,-.4][i%4]:[0,.45,0,-.35][i%4])*scale;
 const lean=(action==='run'?1.2:0)*scale,body=[lean,bob-lift];
 const legs={},arms={};
 for(const [side,sign]of [['right',1],['left',-1]]){
  const u=(phase+(sign===1?0:.5))%1,src=s.legs[side],hip=add(s.hips[side],body);let f,z=0,support=false;
  if(action==='jump'){f=sign*.25;z=[0,0,1,3,4,3,1,0][i]*scale;support=lift===0&&z===0;}
  else if(u<stance){f=amp*(1-2*u/stance);support=true;}
  else{const t=(u-stance)/(1-stance);f=amp*(-1+2*t);z=Math.sin(Math.PI*t)*(action==='run'?5.2:3.2)*scale;}
  const base=sub(s.feet[side],mul(s.forward,sign));
  const foot=add(base,add(mul(s.forward,f),[0,-z-lift]));
  let k;
  if(view==='platform'||view==='street') k=knee(hip,foot,s.hips[side],src.knee,s.feet[side]);
  else{
   // Foreshortened projected limbs retain the approved camera's native offset.
   const mid=mix(hip,foot,.5),offset=sub(src.knee,mix(s.hips[side],s.feet[side],.5));
   k=add(mid,add(offset,[(view==='isometric'?1:.25)*z, -z*.18]));
  }
  legs[side]={hip,knee:k,foot,stance:support,phase:u};
  const a=s.arms[side],shoulder=add(a.shoulder,add(body,view==='street'&&side==='left'?[-4,-1]:[0,0])),c=Math.cos(2*Math.PI*phase);
  const upper=sub(a.elbow,a.shoulder),fore=sub(a.hand,a.elbow);
  let upperLength=Math.hypot(...upper),foreLength=Math.hypot(...fore);
  let upperAngle=Math.PI/2+(Math.atan2(upper[1],upper[0])-Math.PI/2)*c;
  let foreAngle=Math.PI/2+(Math.atan2(fore[1],fore[0])-Math.PI/2)*c;
  if(view==='rpg'){
   const foreshorten=side==='right'?.8+.2*c:1.3-.3*c;
   upperLength=Math.min(upperLength*foreshorten,Math.hypot(...sub(s.arms.right.elbow,s.arms.right.shoulder)));foreLength=Math.min(foreLength*foreshorten,Math.hypot(...sub(s.arms.right.hand,s.arms.right.elbow)));
   upperAngle=Math.PI/2+(side==='right'?-.05:.05);
   foreAngle=Math.PI/2+(side==='right'?.12:-.05);
  }
  if(action==='run'&&view!=='rpg'){
   upperAngle=Math.PI/2+(upperAngle-Math.PI/2)*1.25;
   foreAngle=upperAngle-.35;
  }
  if(action==='jump'){
   const raise=[.25,.65,.85,1,1,.85,.6,.25][i];
   const direction=side==='right'?1:-1;
   upperAngle=Math.PI/2+direction*(.65+.6*raise);
   foreAngle=Math.PI/2+direction*(.7+1.7*raise);
   if(view==='rpg'){upperLength=Math.hypot(...sub(s.arms.right.elbow,s.arms.right.shoulder));foreLength=Math.hypot(...sub(s.arms.right.hand,s.arms.right.elbow));}
  }
  const elbow=add(shoulder,[Math.cos(upperAngle)*upperLength,Math.sin(upperAngle)*upperLength]);
  const hand=add(elbow,[Math.cos(foreAngle)*foreLength,Math.sin(foreAngle)*foreLength]);
  arms[side]={shoulder,elbow,hand};
 }
 return {body,legs,arms,lift,bob,stride:action==='jump'?[0,0]:mul(s.forward,2*amp/stance),drawOrder:['left-arm','left-leg','right-leg','body','right-arm'],label:FRAME_LABELS[action][i]};
}
module.exports={pose,FRAME_LABELS,sources};
