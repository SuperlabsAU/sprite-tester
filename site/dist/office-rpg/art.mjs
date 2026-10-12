import {TILE,COLS,ROWS,wall,PROPS} from './world.mjs';
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function pixel(ctx,c,x,y,w,h){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
const ink='#283b42',shadow='#a2b4b0',wood='#c99462',woodLight='#e8bd84';
function plant(c,x,y){pixel(c,'#879f91',x+1,y+24,30,7);pixel(c,'#a77458',x+9,y+18,16,11);pixel(c,'#d3a176',x+11,y+19,12,4);pixel(c,'#285d4d',x+13,y+7,6,14);for(const[a,b,w,h,col]of[[4,7,12,7,'#3a8168'],[14,2,12,8,'#4b9b71'],[17,12,11,7,'#306c52'],[7,1,9,9,'#68a57e'],[2,14,10,5,'#689c72']])pixel(c,col,x+a,y+b,w,h);}
function chair(c,x,y,col='#43857e'){pixel(c,'#97aaa7',x+1,y+10,22,11);pixel(c,ink,x+6,y+18,12,3);pixel(c,ink,x+10,y+11,3,12);pixel(c,'#315b5b',x+2,y+1,19,12);pixel(c,col,x+4,y+1,15,10);pixel(c,'#81b4a2',x+4,y+1,15,2);}
function desk(c,x,y,w){
 pixel(c,shadow,x+3,y+10,w-1,26);pixel(c,'#92633f',x,y+8,w,24);pixel(c,wood,x,y+4,w,23);pixel(c,woodLight,x+1,y+4,w-2,3);pixel(c,'#ab774d',x+2,y+27,w-4,3);
 for(let a=6;a<w-18;a+=42){pixel(c,'#716752',x+a+13,y+17,3,5);pixel(c,ink,x+a+3,y+3,26,16);pixel(c,'#657d81',x+a+5,y+5,22,12);pixel(c,'#a4d3c3',x+a+7,y+7,13,2);pixel(c,'#c5e4d3',x+a+7,y+11,17,1);pixel(c,'#ced1b8',x+a+6,y+23,23,4);pixel(c,'#9a9f90',x+a+7,y+24,19,1);chair(c,x+a+8,y+34);}
 pixel(c,'#ede9d0',x+w-15,y+15,10,8);pixel(c,'#a2b1ae',x+w-13,y+17,7,1);pixel(c,'#efb37c',x+4,y+20,4,5);
}
function sofa(c,x,y,w){pixel(c,shadow,x+2,y+24,w,9);pixel(c,'#426664',x,y+5,w,22);pixel(c,'#77a598',x+4,y+9,w-8,14);pixel(c,'#8cb5a5',x+4,y+4,w-8,7);for(let a=22;a<w-8;a+=24)pixel(c,'#547b72',x+a,y+11,1,13);pixel(c,ink,x+4,y+27,3,4);pixel(c,ink,x+w-7,y+27,3,4);}
export function floorArt(){
 const c=canvas(COLS*TILE,ROWS*TILE),g=c.getContext('2d');g.imageSmoothingEnabled=false;
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  let col=(x+y)%2?'#bcc7bd':'#c4cec4';if(y<8&&x<9)col=(x+y)%2?'#ded6ba':'#e4dec8';if(y<8&&x>20)col=(x+y)%2?'#bac4b3':'#c3ccb8';if(y<8&&x>9&&x<20)col=(x+y)%2?'#b6cbd0':'#bdd2d4';
  pixel(g,col,x*32,y*32,32,32);pixel(g,'#ffffff18',x*32,y*32,32,1);for(let i=0;i<3;i++)pixel(g,'#697f7614',x*32+(x*7+y*3+i*11)%31,y*32+(x*3+y*7+i*13)%31,1,1);
 }
 // A carpeted circulation spine makes entrances and the exit easy to read.
 pixel(g,'#a4b6af',32,288,896,24);pixel(g,'#91a8a1',432,280,64,316);pixel(g,'#a8bab0',437,288,54,303);
 for(let y=298;y<586;y+=32)pixel(g,'#bccbc0',460,y,7,3);
 // Windows and architectural partitions are hand-authored pixel tiles.
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(wall(x,y)){
  const glass=(y===8&&x>9&&x<20)||(x===20&&y<8)||(x===9&&y<8);
  if(glass){pixel(g,'#526f75',x*32,y*32+15,32,13);pixel(g,'#a5c9cd',x*32+2,y*32+2,28,20);pixel(g,'#e0ece2',x*32+5,y*32+4,2,14);pixel(g,'#76969c',x*32,y*32,32,3);}
  else{pixel(g,'#7d948d',x*32,y*32+24,32,8);pixel(g,'#d9ddca',x*32,y*32,32,24);pixel(g,'#f1eed8',x*32,y*32,32,4);pixel(g,'#c4cdbb',x*32,y*32+21,32,3);}
 }
 for(let x=2;x<28;x+=4){pixel(g,'#718f94',x*32,2,82,21);pixel(g,'#b4d8da',x*32+3,4,76,15);pixel(g,'#e3eee0',x*32+20,4,3,15);pixel(g,'#d4e9e0',x*32+61,4,2,15);}
 for(const p of PROPS){const x=p.x*32,y=p.y*32,w=p.w*32;
  if(p.type==='plant')plant(g,x,y);
  if(p.type==='desk')desk(g,x,y,w);
  if(p.type==='sofa')sofa(g,x,y,w);
  if(p.type==='counter'){pixel(g,'#637f72',x,y+5,w,24);pixel(g,'#c2c9b0',x,y,w,15);pixel(g,'#f0e4c7',x,y,w,3);for(let n=0;n<w;n+=32){pixel(g,'#496e62',x+n+1,y+17,30,12);pixel(g,'#c2c9b0',x+n+17,y+20,7,2);}pixel(g,'#728f8d',x+10,y+4,27,8);pixel(g,'#314c4e',x+18,y+5,15,4);}
  if(p.type==='coffee'){pixel(g,shadow,x+3,y+22,27,8);pixel(g,ink,x+5,y+1,23,24);pixel(g,'#798f8b',x+7,y+2,19,9);pixel(g,'#e7d4aa',x+16,y+17,7,7);pixel(g,'#c4eee0',x+11,y+5,7,3);pixel(g,'#ef9764',x+23,y+6,2,2);}
  if(p.type==='fridge'){pixel(g,'#91a7a0',x+3,y+3,29,59);pixel(g,'#e7e6d4',x,y,28,57);pixel(g,'#b9c9bf',x+1,y+24,26,2);pixel(g,'#5b7671',x+23,y+9,2,10);pixel(g,'#5b7671',x+23,y+32,2,13);pixel(g,'#eab781',x+4,y+6,9,11);}
  if(p.type==='table'||p.type==='meeting'){pixel(g,shadow,x+3,y+8,w,32*p.h);pixel(g,'#7f664a',x,y+7,w,32*p.h-3);pixel(g,wood,x,y,w,32*p.h-4);pixel(g,woodLight,x+2,y+1,w-4,3);for(let n=15;n<w;n+=38){pixel(g,'#f1e9d2',x+n,y+12,16,10);pixel(g,'#a4b9b5',x+n+2,y+14,11,1);if(p.type==='meeting'){chair(g,x+n-1,y+32*p.h+3);pixel(g,'#c27a53',x+n+23,y+11,5,7);}}}
  if(p.type==='board'){pixel(g,'#617b76',x,y,w,25);pixel(g,'#eff0da',x+2,y+2,w-4,20);for(let n=0;n<5;n++){pixel(g,['#e9bd74','#9ac2b8','#dda292'][n%3],x+8+n*28,y+7,17,10);}}
  if(p.type==='printer'){pixel(g,shadow,x+1,y+26,32,6);pixel(g,ink,x+3,y+9,27,21);pixel(g,'#d5dfd0',x+1,y+7,28,17);pixel(g,'#f1ead5',x+7,y,19,12);pixel(g,'#637b77',x+7,y+16,17,4);pixel(g,'#88c7a1',x+24,y+11,3,3);pixel(g,'#eae6d0',x+8,y+21,16,9);}
 }
 // Lift doors, waiting mat, noticeboard and mundane corporate decorations.
 pixel(g,ink,432,608,64,32);pixel(g,'#6d8b85',435,610,58,30);pixel(g,'#b3c5b8',438,610,23,30);pixel(g,'#bacbbd',466,610,24,30);pixel(g,'#eaa375',499,617,5,7);
 pixel(g,'#668981',430,580,69,23);pixel(g,'#93b3a5',434,583,61,17);
 pixel(g,'#9b7553',34,385,23,90);pixel(g,'#d2ac7d',36,387,19,86);for(let y=393;y<467;y+=19)pixel(g,['#d8c99d','#e0dcd0','#96b4a4'][(y-393)/19%3|0],39,y,12,14);
 return c;
}
export function peopleSheet({shirt='#252b2e',hair='#50392a',skin='#e8a66f',tie=false,back=false}={}){
 const c=canvas(64*8,64),g=c.getContext('2d');g.imageSmoothingEnabled=false;
 for(let f=0;f<8;f++){const ox=f*64,bob=[0,0,0,1,0,0,0,1][f],stride=[0,1,2,1,0,-1,-2,-1][f];
  const r=(col,x,y,w,h)=>pixel(g,col,ox+x,y+bob,w,h);
  for(const[x,step]of[[26,stride],[33,-stride]]){r('#1d2931',x-1,43+step,8,14);r('#305376',x,43+step,6,11);r('#477299',x+1,44+step,2,9);r('#aebcae',x,55+step,6,2);r('#26383e',x,57+step,7,2);}
  r('#28383e',22,29,20,16);r(shirt,23,29,18,14);r('#ffffff16',25,30,3,11);r('#131f263d',37,31,3,12);r('#25343c',24,43,15,2);
  for(const[x,step]of[[20,-stride],[40,stride]]){r('#68432f',x,34+step,5,12);r(skin,x,34+step,4,10);r('#ffd2a2',x,35+step,1,7);}
  r('#342a27',23,15,18,16);r(hair,22,15,20,13);r(hair,25,12,15,4);r('#ffffff20',26,14,9,2);
  if(back){r('#402e28',24,24,16,5);r('#76503a',26,16,2,8);r('#654b36',35,15,3,9);r(skin,29,28,7,3);}
  else{r(skin,25,21,14,11);r('#fac292',27,21,7,9);r('#b9794e',36,23,3,7);r(hair,24,18,15,4);r('#273135',24,23,7,4);r('#273135',33,23,7,4);r('#273135',30,24,4,1);r('#d2c3a1',26,24,3,1);r('#d2c3a1',35,24,3,1);r('#985f41',31,29,4,1);if(tie){r('#e9e5cd',29,32,7,3);r('#bc6657',32,33,2,8);}}
 }
 return c;
}
export function battleArt(){const c=canvas(960,640),g=c.getContext('2d');pixel(g,'#a8c1ba',0,0,960,640);pixel(g,'#d8decb',0,0,960,190);for(let x=48;x<960;x+=190){pixel(g,'#657f80',x,23,154,129);pixel(g,'#b9d8d7',x+5,28,144,119);pixel(g,'#e1ece0',x+72,28,4,119);pixel(g,'#dce9dc',x+8,32,4,107);}pixel(g,'#78988e',0,188,960,8);for(let y=212;y<640;y+=40)pixel(g,'#8fad9f',0,y,960,1);for(let x=-100;x<960;x+=64){g.strokeStyle='#94b2a5';g.beginPath();g.moveTo(480+(x-480)*.45,196);g.lineTo(x,640);g.stroke();}plant(g,80,162);plant(g,850,162);pixel(g,'#eff0d9',382,51,191,89);pixel(g,'#63817b',388,58,179,4);g.fillStyle='#526d66';g.font='bold 19px monospace';g.fillText('QUICK SYNC',420,96);g.font='11px monospace';g.fillText('Scheduled: 5 min',423,119);return c;}
// Palette variants preserve the approved native E pixel texture and registration.
// The rear view replaces facial colours with a stable hair silhouette; limbs and
// clothing retain the original eight poses rather than a second generated cycle.
export function nativePeopleSheet(source,{shirt=null,hair=null,back=false,tie=false}={}){
 const c=canvas(512,64),g=c.getContext('2d');g.drawImage(source,0,0);const image=g.getImageData(0,0,512,64),d=image.data;
 const rgb=hex=>hex.match(/\w\w/g).map(v=>parseInt(v,16));const outfit=shirt?rgb(shirt.slice(1)):null,hairColour=rgb((hair||'#51382a').slice(1));
 for(let y=0;y<64;y++)for(let xx=0;xx<512;xx++){const x=xx%64,i=(y*512+xx)*4;if(!d[i+3])continue;let r=d[i],green=d[i+1],b=d[i+2];
  if(back&&y<31){const oldHair=r<115&&r>green&&green>=b;const shade=oldHair?Math.max(.45,Math.min(1.6,(r+green+b)/135)):.68+((x*7+y*3)%5)*.065;for(let k=0;k<3;k++)d[i+k]=Math.round(hairColour[k]*shade);}
  else if(hair&&y<26&&r<115&&r>green&&green>=b){const shade=Math.max(.4,Math.min(1.65,(r+green+b)/130));for(let k=0;k<3;k++)d[i+k]=Math.round(hairColour[k]*shade);}
  if(outfit&&y>=32&&y<=42&&Math.max(r,green,b)-Math.min(r,green,b)<20&&r<90){const shade=Math.min(1.08,(r+green+b)/145);for(let k=0;k<3;k++)d[i+k]=Math.round(outfit[k]*shade);}
  if(tie&&!back&&y>=34&&y<=39&&x>=31&&x<=32){d[i]=175;d[i+1]=89;d[i+2]=68;}
 }
 g.putImageData(image,0,0);return c;
}
