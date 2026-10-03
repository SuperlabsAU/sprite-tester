"""Explicit pixel poses for the pixel-plugin test; pixels are drawn by its MCP tool.

No image-generation or post-export registration. World coordinates are forward,
right and up. The stance foot moves backwards linearly; opposite feet alternate.
"""
import math
P={'ink':'#19202D','hair':'#302B2C','hairLight':'#574037','skin':'#DCA16C','skinLight':'#F2BD84','skinShade':'#B77753','shirt':'#222730','shirtLight':'#353C46','shirtDark':'#161B23','denim':'#426C9D','denimLight':'#628BB7','denimDark':'#29496C','shoe':'#929FAB','sole':'#E2E7E6','lens':'#92BFC8'}
class Pixels:
    def __init__(self,n):self.n=n;self.data={}
    def put(self,x,y,col):
        x,y=round(x),round(y)
        if not(0<=x<self.n and 0<=y<self.n):raise ValueError(f'Pixel outside canvas: {x},{y}')
        self.data[x,y]=P.get(col,col)
    def rect(self,x0,y0,x1,y1,col):
        for y in range(round(y0),round(y1)+1):
            for x in range(round(x0),round(x1)+1):self.put(x,y,col)
    def line(self,a,b,col,width=1):
        ax,ay=a;bx,by=b;steps=max(1,math.ceil(max(abs(bx-ax),abs(by-ay))*2))
        r=(width-1)/2
        for i in range(steps+1):
            t=i/steps;x=round(ax+(bx-ax)*t);y=round(ay+(by-ay)*t)
            self.rect(x-math.floor(r),y-math.floor(r),x+math.ceil(r),y+math.ceil(r),col)
    def poly(self,pts,col):
        lo=math.ceil(min(p[1] for p in pts));hi=math.floor(max(p[1] for p in pts))
        for y in range(lo,hi+1):
            xs=[]
            for i,(x1,y1) in enumerate(pts):
                x2,y2=pts[(i+1)%len(pts)]
                if (y1<=y<y2) or(y2<=y<y1):xs.append(x1+(y-y1)*(x2-x1)/(y2-y1))
            xs.sort()
            for j in range(0,len(xs)-1,2):self.rect(math.ceil(xs[j]),y,math.floor(xs[j+1]),y,col)
        for i,p in enumerate(pts):self.line(p,pts[(i+1)%len(pts)],col)
    def batch(self):return [{'x':x,'y':y,'color':c} for (x,y),c in sorted(self.data.items(),key=lambda t:(t[0][1],t[0][0]))]

def pose(view,action,i):
    n=128 if view=='street' else 64; detailed=view=='street';scale=2 if detailed else 1
    # Tall street proportions are set in world space, rather than stretching output.
    leg=21 if detailed else 17;torso=15 if detailed else 12;headsize=10 if detailed else 12
    hipz=leg;shoulderz=leg+torso;headz=shoulderz+3
    forward={'platform':(1,0),'street':(1,0),'isometric':(.866,.433),'rpg':(0,.62)}[view]
    right={'platform':(0,0),'street':(0,0),'isometric':(-.866,.433),'rpg':(1,0)}[view]
    zv={'platform':1,'street':1,'isometric':.88,'rpg':.72}[view]
    origin=(n/2, n-7-(3 if view=='isometric' else 5 if view=='rpg' else 0))
    if action=='jump':lift=[0,1,7,10,7,0][i];crouch=[4,0,0,2,0,4][i]
    else:lift=(2 if action=='run' and i%3==2 else 0);crouch=0
    lean=2 if action=='run' else 0
    # Fixed torso/root in locomotion removes arbitrary body drift.
    def project(f,r,z):return (origin[0]+scale*(forward[0]*f+right[0]*r),origin[1]+scale*(forward[1]*f+right[1]*r-zv*(z+lift)))
    art=Pixels(n);feet=[];joint=[]
    amp=(7 if action=='walk' else 10)*(1.15 if detailed else 1)
    for side in [-1,1]:
        u=(i/6+(1/12 if action=='run' else 0)+(0 if side==1 else .5))%1
        if action=='jump':f=(2 if side==1 else -2);z=0 if i in [0,1,5] else (3 if i==3 else 1)
        elif u<(1/3 if action=='run' else .5):
            stance=1/3 if action=='run' else .5;f=amp*(1-2*u/stance);z=0
        else:
            stance=1/3 if action=='run' else .5;v=(u-stance)/(1-stance);f=amp*(-1+2*v);z=(5 if action=='walk' else 8)*math.sin(math.pi*v)
        r=side*2.3;hip=(0,r,hipz-crouch);foot=(f,r,z)
        # Two equal-length segments solve the knee in forward/up plane.
        dx=f;dz=z-hip[2];dist=math.hypot(dx,dz);length=(leg+2)/2
        h=math.sqrt(max(0,length*length-dist*dist/4))
        knee=(dx/2+h*(-dz)/dist,r,hip[2]+dz/2+h*dx/dist)
        feet.append({'side':side,'phase':round(u,5),'stance':action!='jump' and u<(1/3 if action=='run' else .5),'world':foot,'screen':project(*foot)})
        joint.append((side,hip,knee,foot))
    # Far side is drawn first. Limbs have fixed widths and a darker far palette.
    def limb(a,b,c,width):art.line(project(*a),project(*b),'ink',width+2*scale);art.line(project(*a),project(*b),c,width)
    def legdraw(item):
        side,hip,knee,foot=item;color='denim' if side==1 else 'denimDark'
        ankle=(foot[0],foot[1],foot[2]+3.5)
        limb(hip,knee,color,3*scale);limb(knee,ankle,color,3*scale)
        if side==1:art.line(project(hip[0]-.7,hip[1],hip[2]),project(knee[0]-.7,knee[1],knee[2]),'denimLight',scale)
        sx,sy=project(*foot);toe=project(foot[0]+3,foot[1],foot[2])
        art.line((sx,sy-2*scale),(toe[0],toe[1]-2*scale),'ink',3*scale)
        art.line((sx,sy-2*scale),(toe[0],toe[1]-2*scale),'shoe',2*scale)
        art.line((sx-scale,sy),(toe[0]+scale,toe[1]),'sole',scale)
        if detailed:art.line((sx+scale,sy-3*scale),(sx+3*scale,sy-3*scale),'sole',1)
    # Arm swing opposes the leg on the same side.
    def arm(side):
        swing=-math.cos(2*math.pi*(i/6+(0 if side==1 else .5)))*(5 if action=='walk' else 8)
        r=side*4.5;shoulder=(lean,r,shoulderz-1-crouch)
        if action=='jump' and i in [2,3]:elbow=(-5,r*1.6,shoulderz+1);hand=(-6,r*1.8,shoulderz+8)
        else:elbow=(swing*.6+lean,r,shoulderz-7-crouch);hand=(swing+lean+(3 if action=='run' else 0),r,shoulderz-(8 if action=='run' else 12)-crouch)
        limb(shoulder,elbow,'shirtDark' if side==-1 else 'shirt',3*scale)
        limb(elbow,hand,'skinShade' if side==-1 else 'skin',2*scale)
        x,y=project(*hand);art.rect(x-scale,y-scale,x+scale,y+scale,'skinLight' if side==1 else 'skin')
    arm(-1);legdraw(joint[0]);legdraw(joint[1])
    # Stable torso silhouette, collar and hem.
    tx,ty=project(lean,0,shoulderz-crouch);bx,by=project(0,0,hipz-crouch)
    width=(5.5 if view in ['rpg','isometric'] else 4.5)*scale
    pts=[(tx-width+scale,ty),(tx+width-scale,ty),(tx+width,ty+3*scale),(bx+width-scale,by),(bx-width+scale,by),(tx-width,ty+3*scale)]
    art.poly(pts,'ink');art.poly([(x+(scale if x<tx else -scale),y+scale if y==ty else y-scale) for x,y in pts],'shirt')
    art.line((bx-width+2*scale,by-scale),(bx+width-2*scale,by-scale),'shirtLight',scale)
    if detailed:art.line((tx-width+2*scale,ty+5*scale),(bx-width+2*scale,by-3*scale),'shirtLight',scale)
    arm(1)
    hx,hy=project(lean+(.5 if view in ['platform','street'] else 0),0,headz-crouch)
    # Head is a fixed pixel template per camera (never rescaled between poses).
    unit=scale;w=headsize*unit;h=(headsize+1)*unit;left=round(hx-w/2);bottom=round(hy);top=bottom-h
    art.rect(hx-unit,bottom,hx+2*unit,bottom+3*unit,'skinShade')
    if view in ['platform','street']:
        art.poly([(left+2*unit,top),(left+w-2*unit,top),(left+w,top+3*unit),(left+w,top+6*unit),(left+w+unit,top+8*unit),(left+w-unit,top+9*unit),(left+w-unit,bottom-unit),(left+3*unit,bottom),(left+unit,bottom-3*unit),(left,top+4*unit)],'ink')
        art.rect(left+3*unit,top+3*unit,left+w-unit,bottom-2*unit,'skin');art.rect(left+w-unit,top+7*unit,left+w,top+8*unit,'skinLight')
        art.poly([(left,top+5*unit),(left,top+2*unit),(left+3*unit,top-unit),(left+w-2*unit,top),(left+w,top+2*unit),(left+w-2*unit,top+4*unit),(left+4*unit,top+3*unit),(left+3*unit,top+7*unit),(left+unit,top+7*unit)],'hair')
        art.line((left+2*unit,top+2*unit),(left+w-3*unit,top+unit),'hairLight',unit)
        art.rect(left+2*unit,top+6*unit,left+4*unit,top+8*unit,'skinShade')
        art.line((left+4*unit,top+6*unit),(left+w,top+6*unit),'ink',unit)
        art.rect(left+w-4*unit,top+5*unit,left+w,top+8*unit,'ink');art.rect(left+w-3*unit,top+6*unit,left+w-unit,top+7*unit,'lens');art.put(left+w-unit,top+6*unit,'ink')
        art.line((left+w-4*unit,bottom-2*unit),(left+w-2*unit,bottom-2*unit),'skinShade',unit)
    else:
        # Elevated face: broad crown, low glasses and a fixed three-quarter offset for iso.
        shift=unit if view=='isometric' else 0
        art.poly([(left+2*unit,top),(left+w-2*unit,top),(left+w,top+3*unit),(left+w-unit,bottom-2*unit),(left+w-4*unit,bottom),(left+3*unit,bottom-unit),(left,bottom-4*unit),(left,top+3*unit)],'ink')
        art.rect(left+unit,top+4*unit,left+w-unit,bottom-3*unit,'skin');art.rect(left+3*unit,bottom-3*unit,left+w-3*unit,bottom-unit,'skinShade')
        art.poly([(left,top+5*unit),(left,top+2*unit),(left+3*unit,top-unit),(left+w-3*unit,top-unit),(left+w,top+2*unit),(left+w,top+5*unit),(left+w-3*unit,top+4*unit),(left+3*unit,top+5*unit)],'hair')
        art.line((left+3*unit,top+unit),(left+w-3*unit,top+unit),'hairLight',unit)
        ey=bottom-5*unit
        for gx in [left+unit+shift,left+6*unit+shift]:
            art.rect(gx,ey,gx+4*unit,ey+3*unit,'ink');art.rect(gx+unit,ey+unit,gx+3*unit,ey+2*unit,'lens');art.put(gx+2*unit,ey+unit,'ink')
        art.line((left+4*unit,ey+unit),(left+8*unit,ey+unit),'ink',unit)
        art.put(left+w/2+shift,bottom-2*unit,'skinLight')
    # Vertical margins are tested before the MCP server receives a pixel.
    stride=[round(amp*(6 if action=='run' else 4)*scale*forward[0],3),round(amp*(6 if action=='run' else 4)*scale*forward[1],3)] if action!='jump' else [0,0]
    return art.batch(),{'feet':feet,'stride':stride,'rootLift':lift*scale*zv,'root':project(0,0,hipz-crouch),'headOrigin':[hx,hy],'cell':n}
