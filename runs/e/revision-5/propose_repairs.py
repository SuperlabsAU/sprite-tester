"""Create a reviewable pixel manifest. This is NOT a blanket final-silhouette fill.
Candidates come from each isolated anatomical layer; intentional inter-limb gaps
are excluded. Review inspection/*-repair-review.png before accepting edits.
"""
from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw
import json,hashlib,math
from inspect_pixels import holes
H=Path(__file__).resolve().parent
poses=json.loads((H/'verification.json').read_text())['clips']
manual=json.loads((H/'manual-repairs.json').read_text())
records={};totals={};layer_order=['left-arm','left-leg','right-leg','body','right-arm','head']
for clip,rec in poses.items():
 size=rec['cell'];scale=size/64;view,action=clip.split('-');strip=Image.open(H/f'before/e-{clip}.png').convert('RGBA')
 records[clip]=[]
 for i,model in enumerate(rec['frames']):
  final=strip.crop((i*size,0,(i+1)*size,size));patches={}
  for layer in layer_order:
   im=Image.open(H/f'raw-layers/{clip}/{i+1:02}/{layer}.png').convert('RGBA');alpha=im.getchannel('A');coords={p:'enclosed hole in isolated '+layer for c in holes(im) for p in c}
   if layer!='head':
    closed=alpha.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    if layer.endswith('leg'):
     leg=model['legs'][layer.split('-')[0]];centres=[(leg['knee'],4*scale),(leg['foot'],3*scale)]
    elif layer.endswith('arm'):
     arm=model['arms'][layer.split('-')[0]];centres=[(arm['elbow'],2.5*scale),(arm['shoulder'],3*scale)]
    else:centres=[(a['shoulder'],3*scale) for a in model['arms'].values()]
    for y in range(size):
     for x in range(size):
      if alpha.getpixel((x,y))==0 and closed.getpixel((x,y))==255 and any(math.dist((x+.5,y+.5),c)<r for c,r in centres):
       coords.setdefault((x,y),'open raster seam in isolated '+layer)
   solid=[(x,y) for y in range(size) for x in range(size) if im.getpixel((x,y))[3]==255]
   for (x,y),reason in coords.items():
    if final.getpixel((x,y))[3]!=0:continue
    # Sample this anatomical layer, never a neighbouring limb/background.
    # Distance tie uses y/x; the explicit selected donor remains reviewable.
    donor=min(solid,key=lambda p:((p[0]-x)**2+(p[1]-y)**2,p[1],p[0]))
    if layer=='head':
     # The hole is a one-pixel lens interior: match adjacent warm lens/face,
     # not the surrounding black spectacle outline.
     donor=(x-1,y)
     assert im.getpixel(donor)[0]>100,(clip,i,donor,im.getpixel(donor))
    patches[x,y]={'x':x,'y':y,'rgba':list(im.getpixel(donor)),'layer':layer,'donor':list(donor),'reason':reason}
  for p in manual.get(f'{clip}/{i+1}',[]):
   assert final.getpixel((p['x'],p['y']))[3]==0
   patches[p['x'],p['y']]=p
  rows=sorted(patches.values(),key=lambda p:(p['y'],p['x']))
  records[clip].append({'frame':i+1,'beforeSha256':hashlib.sha256(final.tobytes()).hexdigest(),'pixels':rows})
  totals[clip]=totals.get(clip,0)+len(rows)
manifest={'revision':5,'date':'2026-10-12','description':'Reviewed native-pixel additions only. RGBA existing pixels, rig, timings and layer ownership preserved.','clips':records}
(H/'pixel-repairs.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(totals,'TOTAL',sum(totals.values()))
# Each of the 96 frames at 4x (street 2x), before/after; green identifies edits.
for clip,frames in records.items():
 size=128 if clip.startswith('street') else 64;strip=Image.open(H/f'before/e-{clip}.png').convert('RGBA');proof=Image.new('RGB',(1536,1104),'#241f2c');d=ImageDraw.Draw(proof)
 for i,rec in enumerate(frames):
  before=strip.crop((i*size,0,(i+1)*size,size));after=before.copy();diff=before.copy()
  for p in rec['pixels']:
   after.putpixel((p['x'],p['y']),tuple(p['rgba']));diff.putpixel((p['x'],p['y']),(0,255,90,255))
  for col,(label,im) in enumerate([('Before',before),('After',after),('Added',diff)]):
   bg=Image.new('RGBA',(size,size),'#e9acd9');bg.alpha_composite(im)
   x=(i%2)*768+col*256;y=(i//2)*276
   proof.paste(bg.convert('RGB').resize((256,256),Image.Resampling.NEAREST),(x,y+20));d.text((x+4,y+3),f'{clip} F{i+1} {label} ({len(rec["pixels"])})',fill='white')
 proof.save(H/f'inspection/{clip}-repair-review.png')
