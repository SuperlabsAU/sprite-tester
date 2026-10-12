"""Inspect all RGBA pixels and make nearest-neighbour proofs; no sprite edits."""
from PIL import Image,ImageDraw
from pathlib import Path
import json
H=Path(__file__).resolve().parent

def holes(im):
 w,h=im.size;p=im.load();pending={(x,y) for y in range(h) for x in range(w) if p[x,y][3]<128};cs=[]
 while pending:
  q=[pending.pop()]
  for x,y in q:
   for nb in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
    if nb in pending:pending.remove(nb);q.append(nb)
  if all(0<x<w-1 and 0<y<h-1 for x,y in q):cs.append(sorted(q,key=lambda a:(a[1],a[0])))
 return sorted(cs,key=lambda c:(c[0][1],c[0][0]))

def main():
 (H/'inspection').mkdir(exist_ok=True);records={}
 for view in ['platform','street','isometric','rpg']:
  size=128 if view=='street' else 64
  for action in ['walk','run','jump']:
   key=f'{view}-{action}';strip=Image.open(H/f'before/e-{key}.png').convert('RGBA')
   proof=Image.new('RGB',(1536,800),'#241f2c');draw=ImageDraw.Draw(proof);records[key]=[]
   for i in range(8):
    im=strip.crop((i*size,0,(i+1)*size,size));cs=holes(im);records[key].append(cs)
    bg=Image.new('RGBA',im.size,'#e9acd9');bg.alpha_composite(im)
    proof.paste(bg.convert('RGB').resize((384,384),Image.Resampling.NEAREST),((i%4)*384,(i//4)*400+16))
    draw.text(((i%4)*384+6,(i//4)*400+2),f'{key} F{i+1} | {len(cs)} enclosed regions',fill='white')
   proof.save(H/f'inspection/{key}-before.png')
 (H/'before-holes.json').write_text(json.dumps(records,indent=2)+'\n')
if __name__=='__main__':main()
