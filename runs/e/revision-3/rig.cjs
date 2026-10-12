'use strict';
const CAMERAS={platform:[[1,0],[0,0],1],street:[[1,0],[0,0],1],isometric:[[.866,.433],[-.866,.433],.88],rpg:[[0,.62],[1,0],.72]};
const FRAME_LABELS={walk:['R contact','R down','L passing','R up','L contact','L down','R passing','L up'],run:['R contact','R stance','L passing','Flight','L contact','L stance','R passing','Flight'],jump:['Crouch','Launch','Rise','Rise','Apex','Fall','Fall','Landing']};
function project(view,[f,r,z]){const [forward,right,vertical]=CAMERAS[view],s=view==='street'?2:1;return [s*(forward[0]*f+right[0]*r),s*(forward[1]*f+right[1]*r-vertical*z)];}
function pose(view,action,i){
 const lift=action==='jump'?[0,0,4,8,12,8,4,0][i]:action==='run'&&i%4===3?3:0;
 const crouch=action==='jump'?[4,0,0,2,6,2,0,4][i]:action==='walk'?[0,1,-1,-2][i%4]:1;
 const lean=action==='run'?2:0,legs={},arms={},amp=action==='walk'?8:10,stance=action==='walk'?.5:.375;
 for(const [side,sign] of [['right',1],['left',-1]]){
  const u=(i/8+(sign===1?0:.5))%1;let f,z,support=false;
  if(action==='jump'){f=sign*2;z=[0,0,2,4,6,4,2,0][i];support=z===0&&lift===0;}
  else if(u<stance){f=amp*(1-2*u/stance);z=0;support=true;}
  else{const t=(u-stance)/(1-stance);f=amp*(-1+2*t);z=(action==='walk'?6:9)*Math.sin(Math.PI*t);}
  const r=sign*2.3,hip=[0,r,18-crouch],foot=[f,r,z],dx=f,dz=z-hip[2],dist=Math.hypot(dx,dz),h=Math.sqrt(Math.max(0,121-dist*dist/4));
  const knee=[dx/2+h*(-dz)/dist,r,hip[2]+dz/2+h*dx/dist];
  legs[side]={hip,knee,foot,stance:support,phase:u};
  const swing=-Math.cos(2*Math.PI*u)*(action==='walk'?6:8),shoulder=[lean,sign*4,30-crouch];
  const elbow=action==='jump'?[-3,sign*6,29-crouch]:[lean+swing*.5,sign*4,23-crouch];
  const hand=action==='jump'?[-2,sign*8,27+[0,0,3,5,7,5,3,0][i]-crouch]:[lean+swing,sign*4,18-crouch];
  arms[side]={shoulder,elbow,hand};
 }
 const travel=action==='jump'?[0,0]:project(view,[2*amp/stance,0,0]);
 return {legs,arms,lift,crouch,lean,root:[0,0,18-crouch+lift],head:[lean,0,37.5-crouch+lift],stride:travel,drawOrder:['left-arm','left-leg','right-leg','torso','right-arm','head']};
}
module.exports={pose,project,FRAME_LABELS};
