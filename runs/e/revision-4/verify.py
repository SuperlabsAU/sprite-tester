"""Raster and identity audit; visual judgement is recorded separately in REVIEW.md."""
from pathlib import Path
from PIL import Image
from collections import deque
import json,hashlib,math
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
ASSETS=ROOT/'site/dist/assets'
poses=json.loads((HERE/'verification.json').read_text())['clips']
results=[];head_count=0
for view in ('platform','street','isometric','rpg'):
    size=128 if view=='street' else 64
    head=Image.open(HERE/f'parts/{view}/head.png').convert('RGBA')
    for action in ('walk','run','jump'):
        strip=Image.open(ASSETS/f'e-{view}-{action}.png').convert('RGBA')
        assert strip.size==(size*8,size)
        for i in range(8):
            frame=strip.crop((i*size,0,(i+1)*size,size))
            saved=Image.open(HERE/f'frames/{view}-{action}/{i+1:02}.png').convert('RGBA')
            assert frame.tobytes()==saved.tobytes()
            bounds=frame.getchannel('A').getbbox()
            assert bounds and min(bounds[:2])>0 and max(bounds[2:])<size,(view,action,i,bounds)
            pending={j for j,a in enumerate(frame.getchannel('A').tobytes()) if a>128}
            queue=deque([pending.pop()])
            while queue:
                p=queue.popleft();x,y=p%size,p//size
                for xx in range(max(0,x-1),min(size,x+2)):
                    for yy in range(max(0,y-1),min(size,y+2)):
                        q=yy*size+xx
                        if q in pending:pending.remove(q);queue.append(q)
            assert not pending,(view,action,i,'detached pixels')
            pose=poses[f'{view}-{action}']['frames'][i]
            # JavaScript Math.round uses ties towards positive infinity.
            dx,dy=[math.floor(n+.5) for n in pose['body']]
            for y in range(size):
                for x in range(size):
                    p=head.getpixel((x,y))
                    if p[3]==255:
                        assert frame.getpixel((x+dx,y+dy))==p,(view,action,i,'head changed',x,y)
                        head_count+=1
            for x,y in {'platform':[(32,29),(33,29),(32,30),(32,31)],'isometric':[(36,28),(36,29),(36,30)]}.get(view,[]):
                assert frame.getpixel((x+dx,y+dy))[3]>128,(view,action,i,'shoulder gap')
            results.append({'clip':f'{view}-{action}','frame':i+1,'bounds':bounds,'removedSpecks':pose['removedSpecks']})
for name,expected in json.loads((HERE/'baseline-hashes.json').read_text()).items():
    assert hashlib.sha256((ASSETS/name).read_bytes()).hexdigest()==expected,name
# No source denim should be attached to an articulated RPG arm.
for name in ('right-upper','right-fore'):
    arm=Image.open(HERE/f'parts/rpg/{name}.png').convert('RGBA')
    for y in range(41,size):
        for x in range(size):
            r,g,b,a=arm.getpixel((x,y))
            assert not(a>128 and b>r*1.25 and b>g*1.15 and b>60),(name,x,y)
report={'frames':results,'unchangedComparisonStrips':48,'nativeHeadPixelsMatched':head_count,'shoulderRegressionChecks':'passed','armDenimContamination':'none'}
(HERE/'pixel-audit.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'96 cells exact; connected silhouettes and clear margins; {head_count} native head pixels match; shoulder/texture checks pass; 48 A–D strips unchanged.')
