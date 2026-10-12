'use strict';
const {createCanvas}=require('@napi-rs/canvas');
const inside=([x,y],poly)=>{let v=false;for(let a=0,b=poly.length-1;a<poly.length;b=a++){const [ax,ay]=poly[a],[bx,by]=poly[b];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)v=!v;}return v;};
const masks={
 platform:{head:27,waist:40,split:[[29.5,40],[30.5,45],[30,60]],shoe:{right:54,left:54},arms:{right:[[24,28],[29,30],[28,34],[26,38],[26,45],[18,45],[18,32]],left:[[32,29],[36,30],[38,35],[45,37],[46,44],[38,44],[34,38],[33,34]]}},
 street:{head:56,waist:80,split:[[63,80],[66,90],[64,97],[63,128]],shoe:{right:113,left:112},arms:{right:[[51,59],[59,62],[58,68],[55,74],[55,82],[56,86],[54,91],[43,91],[43,72],[47,65]],left:[[74,59],[80,62],[81,66],[82,71],[87,76],[92,80],[92,89],[82,88],[77,78],[76,71]]}},
 isometric:{head:28,waist:40,split:[[31.5,40],[32,45],[33.5,49],[33.5,60]],shoe:{right:54,left:48},arms:{right:[[24,28],[29,31],[28,35],[28,43],[21,43],[20,33]],left:[[36,28],[41,31],[44,38],[44,43],[39,43],[38,37],[37,34]]}},
 rpg:{head:34,waist:41,split:[[28.5,41],[29.5,46],[29.5,52],[27,64]],shoe:{right:54,left:46},arms:{right:[[20,33],[25,34],[25,40],[25,42],[28,44],[27,48],[20,48]],left:[[37,33],[42,33],[42,43],[36,43],[36,37]]}}
};
function splitX(points,y){for(let i=1;i<points.length;i++)if(y<=points[i][1]){const a=points[i-1],b=points[i],t=(y-a[1])/(b[1]-a[1]);return a[0]+(b[0]-a[0])*t;}return points.at(-1)[0];}
function makeParts(seed,s,view){
 const {cell}=s,m=masks[view],original=createCanvas(cell,cell);original.getContext('2d').drawImage(seed,0,0);const pixels=original.getContext('2d').getImageData(0,0,cell,cell);
 const names=['head','body',...['left','right'].flatMap(side=>['upper','fore','thigh','shin','shoe'].map(p=>`${side}-${p}`))],parts={},data={};
 for(const n of names){parts[n]=createCanvas(cell,cell);data[n]=parts[n].getContext('2d').createImageData(cell,cell);}
 const put=(name,i)=>{for(let j=0;j<4;j++)data[name].data[i*4+j]=pixels.data[i*4+j];};
 const along=(p,a,b)=>{const d=[b[0]-a[0],b[1]-a[1]],len=Math.hypot(...d);return((p[0]-b[0])*d[0]+(p[1]-b[1])*d[1])/len;};
 for(let y=0;y<cell;y++)for(let x=0;x<cell;x++){
  const i=y*cell+x;if(!pixels.data[i*4+3])continue;const point=[x+.5,y+.5];
  if(y<m.head){put('head',i);continue;}
  const arm=['right','left'].find(side=>inside(point,m.arms[side]));
  const denim=view==='rpg'&&y>=m.waist&&pixels.data[i*4+2]>pixels.data[i*4]*1.25&&pixels.data[i*4+2]>pixels.data[i*4+1]*1.15&&pixels.data[i*4+2]>60;
  if(arm&&!denim){const a=s.arms[arm],q=along(point,a.shoulder,a.elbow);if(q<=1)put(`${arm}-upper`,i);if(q>=-1)put(`${arm}-fore`,i);continue;}
  if(y<m.waist){put('body',i);continue;}
  const side=x+.5>=splitX(m.split,y+.5)?'right':'left',leg=s.legs[side];
  if(y>=m.shoe[side]){put(`${side}-shoe`,i);continue;}
  const q=along(point,s.hips[side],leg.knee);if(q<=1.1)put(`${side}-thigh`,i);if(q>=-1.1)put(`${side}-shin`,i);
  // The two-pixel waistband caps the shared hip seam under limb rotation.
  if(y<m.waist+2)put('body',i);
 }
 // Original contact artwork hides part of the shirt behind the arms.
 // Repeat only the native central shirt texture beneath those articulated roots.
 const backing={
  platform:{rect:[28,30,5,9],poly:[[28,27],[31,27],[35,30],[35,34],[34,40],[26,41],[26,35],[25,32]]},
  street:{rect:[60,61,12,18],poly:[[60,56],[70,56],[77,62],[77,70],[76,82],[57,82],[55,75],[56,62]]},
  isometric:{rect:[29,30,7,9],poly:[[28,27],[36.5,27],[39,30],[37,39],[35,41],[28,41],[27,37],[27,31]]},
  rpg:{rect:[26,35,9,6],poly:[[25,33],[35,33],[38,35],[36,41],[32,42],[26,41],[24,35]]}
 }[view];
 const [sx,sy,sw,sh]=backing.rect;
 for(let y=0;y<cell;y++)for(let x=0;x<cell;x++)if(inside([x+.5,y+.5],backing.poly)&&!data.body.data[(y*cell+x)*4+3]){
  const xx=sx+((x-sx)%sw+sw)%sw,yy=sy+((y-sy)%sh+sh)%sh,q=yy*cell+xx;
  for(let j=0;j<4;j++)data.body.data[(y*cell+x)*4+j]=pixels.data[q*4+j];
 }
 for(const n of names)parts[n].getContext('2d').putImageData(data[n],0,0);
 return parts;
}
module.exports={makeParts};
