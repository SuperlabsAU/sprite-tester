export const TILE=32, COLS=30, ROWS=20;
export const POINTS={coffee:{x:4,y:4},hr:{x:6,y:12},sales:{x:24,y:13},product:{x:14,y:5},boss:{x:25,y:4},exit:{x:14,y:18}};
export const PROPS=[
 {type:'counter',x:2,y:2,w:5,h:1},{type:'coffee',x:4,y:3,w:1,h:1},
 {type:'fridge',x:7,y:2,w:1,h:2},{type:'table',x:3,y:5,w:3,h:1},
 {type:'plant',x:1,y:1,w:1,h:1},{type:'plant',x:8,y:7,w:1,h:1},
 {type:'meeting',x:12,y:2,w:5,h:2},{type:'board',x:12,y:1,w:5,h:1},
 {type:'desk',x:23,y:2,w:4,h:1},{type:'plant',x:28,y:1,w:1,h:1},{type:'sofa',x:26,y:6,w:3,h:1},
 {type:'desk',x:3,y:10,w:3,h:1},{type:'desk',x:7,y:10,w:3,h:1},
 {type:'desk',x:12,y:11,w:3,h:1},{type:'desk',x:16,y:11,w:3,h:1},
 {type:'desk',x:22,y:10,w:3,h:1},{type:'desk',x:26,y:10,w:3,h:1},
 {type:'desk',x:3,y:15,w:3,h:1},{type:'desk',x:7,y:15,w:3,h:1},
 {type:'desk',x:22,y:15,w:3,h:1},{type:'desk',x:26,y:15,w:3,h:1},
 {type:'printer',x:17,y:13,w:1,h:1},{type:'plant',x:1,y:18,w:1,h:1},{type:'plant',x:28,y:18,w:1,h:1},
 {type:'plant',x:20,y:10,w:1,h:1},{type:'plant',x:20,y:16,w:1,h:1},
 {type:'sofa',x:10,y:18,w:3,h:1},{type:'sofa',x:16,y:18,w:3,h:1}
];
export function wall(x,y){
 if(x===0||x===29||y===0||y===19)return true;
 if(x===9&&y<8&&y!==6)return true;
 if(x===20&&y<9&&y!==6)return true;
 if(y===8&&x<10&&x!==6)return true;
 if(y===8&&x>=10&&x<20&&x!==14&&x!==15)return true;
 if(y===8&&x>20&&x!==24)return true;
 return false;
}
export function blocked(x,y){return !Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=COLS||y<0||y>=ROWS||wall(x,y)||PROPS.some(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h);}
export function findPath(from,to,occupied=[]){
 const start=`${from.x},${from.y}`,goal=`${to.x},${to.y}`,q=[from],prev=new Map([[start,null]]),taken=new Set(occupied.map(p=>`${p.x},${p.y}`));
 for(let i=0;i<q.length;i++){
  const p=q[i],key=`${p.x},${p.y}`;if(key===goal){const path=[];let k=key;while(k!==start){const[x,y]=k.split(',').map(Number);path.unshift({x,y});k=prev.get(k);}return path;}
  for(const[dx,dy]of[[0,-1],[1,0],[0,1],[-1,0]]){const x=p.x+dx,y=p.y+dy,k=`${x},${y}`;if(!prev.has(k)&&!blocked(x,y)&&(!taken.has(k)||k===goal)){prev.set(k,key);q.push({x,y});}}
 }return [];
}
