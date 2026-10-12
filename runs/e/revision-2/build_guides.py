"""Pose-planning diagrams only; final sprite art is made with imagegen."""
from pathlib import Path
from PIL import Image,ImageDraw
import math,json
OUT=Path(__file__).resolve().parent
VIEWS={'platform':((1,0),(0,0),1),'street':((1,0),(0,0),1),'isometric':((.866,.433),(-.866,.433),.88),'rpg':((0,.62),(1,0),.72)}
records={}
for view,(forward,right,zscale) in VIEWS.items():
 for action in ['walk','run','jump']:
  sheet=Image.new('RGBA',(2048,300),'white');d=ImageDraw.Draw(sheet);frames=[]
  for i in range(8):
   cx=256*i+128;floor=252
   lift=([0,0,6,12,17,12,6,0][i] if action=='jump' else (3 if action=='run' and i%4==3 else 0))
   crouch=([5,0,0,0,2,0,0,5][i] if action=='jump' else [0,1,-1,-2][i%4] if action=='walk' else 1)
   lean=2 if action=='run' else 0
   def p(f,r,z):return (cx+4*(forward[0]*f+right[0]*r),floor+4*(forward[1]*f+right[1]*r-zscale*(z+lift)))
   hips={};knees={};feet={};arms={};support={}
   for side in [1,-1]:
    u=(i/8+(0 if side==1 else .5))%1;stance=.5 if action=='walk' else .375;amp=8 if action=='walk' else 10
    if action=='jump':f=side*2;z=[0,0,2,4,6,4,2,0][i];support[side]=False
    elif u<stance:f=amp*(1-2*u/stance);z=0;support[side]=True
    else:v=(u-stance)/(1-stance);f=amp*(-1+2*v);z=(6 if action=='walk' else 9)*math.sin(math.pi*v);support[side]=False
    r=side*2.3;hip=(0,r,18-crouch);foot=(f,r,z);dx=f;dz=z-hip[2];dist=math.hypot(dx,dz);h=math.sqrt(max(0,11**2-dist**2/4));knee=(dx/2+h*(-dz)/dist,r,hip[2]+dz/2+h*dx/dist)
    hips[side]=p(*hip);knees[side]=p(*knee);feet[side]=p(*foot)
    swing=-math.cos(2*math.pi*u)*(6 if action=='walk' else 8)
    shoulder=(lean,side*4,30-crouch)
    if action=='jump':elbow=(-3,side*6,31-crouch);hand=(-2,side*8,34+[0,0,3,5,7,5,3,0][i]-crouch)
    else:elbow=(lean+swing*.5,side*4,23-crouch);hand=(lean+swing,side*4,19-crouch)
    arms[side]=[p(*shoulder),p(*elbow),p(*hand)]
   def limb(points,col,w):d.line(points,fill=col,width=w,joint='curve');[d.ellipse((x-4,y-4,x+4,y+4),fill=col) for x,y in points]
   limb(arms[-1],'#bd4964',12)
   for side in [-1,1]:
    col='#bd4964' if side==-1 else '#2981bd';limb([hips[side],knees[side],feet[side]],col,16);x,y=feet[side];d.line((x-5,y,x+12,y),fill=col,width=8)
   top=p(lean,0,30-crouch);bot=p(0,0,18-crouch);d.polygon([(top[0]-20,top[1]),(top[0]+20,top[1]),(bot[0]+20,bot[1]),(bot[0]-20,bot[1])],fill='#343c46')
   limb(arms[1],'#2981bd',12);hx,hy=p(lean,0,36-crouch);d.ellipse((hx-22,hy-26,hx+22,hy+16),fill='#707882')
   d.text((256*i+10,8),f'F{i+1} '+(['R contact','R down','L passing','R up','L contact','L down','R passing','L up'][i] if action=='walk' else ['R contact','R stance','L passing','Flight R','L contact','L stance','R passing','Flight L'][i] if action=='run' else ['Crouch','Launch','Rise','Rise','Apex','Fall','Fall','Land'][i]),fill='#243344')
   d.text((256*i+10,280),'BLUE=RIGHT / RED=LEFT',fill='#243344')
   frames.append({'frame':i+1,'right_foot':feet[1],'left_foot':feet[-1],'right_stance':support[1],'left_stance':support[-1],'pelvis':p(0,0,18-crouch),'right_arm':arms[1],'left_arm':arms[-1],'lift':lift})
  key=f'{view}-{action}';sheet.save(OUT/f'guides/{key}.png');records[key]=frames
(OUT/'pose-plan.json').write_text(json.dumps(records,indent=2)+'\n')
