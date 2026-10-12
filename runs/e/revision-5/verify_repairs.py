"""Check every pixel, all intended negative spaces, unchanged art and timing."""
from pathlib import Path
from PIL import Image
import json,hashlib
from inspect_pixels import holes
H=Path(__file__).resolve().parent;ROOT=H.parents[2];ASSETS=ROOT/'site/dist/assets'
manifest=json.loads((H/'pixel-repairs.json').read_text())['clips']
report=[];count=0;unchanged=0;checked=0
for clip,frames in manifest.items():
 size=128 if clip.startswith('street') else 64
 before=Image.open(H/f'before/e-{clip}.png').convert('RGBA')
 after=Image.open(ASSETS/f'e-{clip}.png').convert('RGBA')
 for i,rec in enumerate(frames):
  old=before.crop((i*size,0,(i+1)*size,size));new=after.crop((i*size,0,(i+1)*size,size));patch={(p['x'],p['y']):tuple(p['rgba']) for p in rec['pixels']}
  assert hashlib.sha256(old.tobytes()).hexdigest()==rec['beforeSha256']
  for y in range(size):
   for x in range(size):
    checked+=1;a,b=old.getpixel((x,y)),new.getpixel((x,y))
    if (x,y) in patch:
     assert a[3]==0 and b==patch[x,y],(clip,i+1,x,y,'missing/incorrect repair',a,b)
     count+=1
    else:
     assert a==b,(clip,i+1,x,y,'unplanned pixel change',a,b)
     unchanged+=a[3]>0
  # Every visible enclosed hole in an isolated limb/head has been repaired.
  # Cross-limb negative space is deliberately excluded from this condition.
  for layer in (H/f'raw-layers/{clip}/{i+1:02}').glob('*.png'):
   for region in holes(Image.open(layer).convert('RGBA')):
    for x,y in region:
     assert new.getpixel((x,y))[3]>0,(clip,i+1,layer.stem,x,y,'unfilled anatomical hole')
  report.append({'clip':clip,'frame':i+1,'pixelsAdded':len(patch),'remainingCompositeNegativeSpaces':holes(new)})
# Independent examples of intentional negative spaces must stay open.
for clip,frame,coords in [('isometric-walk',1,[(31,47),(31,48)]),('rpg-walk',1,[(24,41),(25,41)])]:
 im=Image.open(ASSETS/f'e-{clip}.png').convert('RGBA');size=im.height
 for x,y in coords:assert im.getpixel((x+(frame-1)*size,y))[3]==0,(clip,frame,x,y,'intentional gap filled')
old=json.loads((H/'before/motion.json').read_text());new=json.loads((ASSETS/'motion.json').read_text())
assert old['clips']==new['clips'],'Motion metadata changed'
for name in ['rig.cjs','source-rig.cjs','parts.cjs']:
 assert (H/name).read_bytes()==(H.parent/'revision-4'/name).read_bytes(),f'{name} changed'
result={'date':'2026-10-12','framesChecked':len(report),'rgbaPixelsChecked':checked,'addedPixels':count,'existingVisiblePixelsUnchanged':unchanged,'isolatedAnatomicalHoles':'all covered','intentionalNegativeSpaceRegressions':'passed','motionAndSourceGeometry':'unchanged','frames':report}
(H/'repair-audit.json').write_text(json.dumps(result,indent=2)+'\n')
print({k:v for k,v in result.items() if k!='frames'})
