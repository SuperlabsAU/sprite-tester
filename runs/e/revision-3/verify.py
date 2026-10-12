"""Audit shipped raster cells, transparent margins and unchanged comparison assets."""
from pathlib import Path
import hashlib
import json
from PIL import Image
from collections import deque

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ASSETS = ROOT / 'site/dist/assets'
records = []
rig_records = json.loads((HERE / 'verification.json').read_text())['clips']
old_motion = json.loads((HERE / 'before/motion.json').read_text())['clips']
new_motion = json.loads((ASSETS / 'motion.json').read_text())['clips']
head_pixels = 0
def connected_silhouette(cell):
    width,height = cell.size
    pending = {i for i,alpha in enumerate(cell.getchannel('A').tobytes()) if alpha>128}
    assert pending
    queue = deque([pending.pop()])
    while queue:
        point = queue.popleft(); x,y = point%width,point//width
        for dx in (-1,0,1):
            for dy in (-1,0,1):
                nx,ny=x+dx,y+dy
                neighbour=ny*width+nx
                if 0<=nx<width and 0<=ny<height and neighbour in pending:
                    pending.remove(neighbour);queue.append(neighbour)
    return not pending
for view in ('platform', 'street', 'isometric', 'rpg'):
    size = 128 if view == 'street' else 64
    for action in ('walk', 'run', 'jump'):
        name = f'{view}-{action}'
        key = f'e-{name}'
        for field in ('frames','durations','labels','stride','lift'):
            assert new_motion[key][field] == old_motion[key][field], (key, field, 'motion changed')
        strip = Image.open(ASSETS / f'e-{name}.png').convert('RGBA')
        assert strip.size == (size * 8, size), name
        for i in range(8):
            cell = strip.crop((i * size, 0, (i + 1) * size, size))
            saved = Image.open(HERE / 'frames' / name / f'{i+1:02}.png').convert('RGBA')
            assert cell.tobytes() == saved.tobytes(), (name, i+1, 'cell mismatch')
            bounds = cell.getchannel('A').getbbox()
            assert bounds and min(bounds[:2]) > 0 and max(bounds[2:]) < size, (name, i+1, bounds)
            assert connected_silhouette(cell), (name,i+1,'detached limb or head')
            frame_record = rig_records[name]['frames'][i]
            sx,sy,hw,hh = frame_record['headSource']; dx,dy = frame_record['headOrigin']
            approved = Image.open(HERE / 'references' / f'a-{view}-seed.png').convert('RGBA')
            for y in range(hh):
                for x in range(hw):
                    pixel = approved.getpixel((sx+x,sy+y))
                    if pixel[3] == 255:
                        assert cell.getpixel((dx+x,dy+y)) == pixel, (name,i+1,'A head pixel changed',x,y)
                        head_pixels += 1
            records.append({'clip': name, 'frame': i+1, 'bounds': bounds})
baseline = json.loads((HERE / 'baseline-hashes.json').read_text())
assert len(baseline) == 48
for name, expected in baseline.items():
    assert hashlib.sha256((ASSETS / name).read_bytes()).hexdigest() == expected, name
(HERE / 'pixel-audit.json').write_text(json.dumps({'frames': records, 'unchangedComparisonStrips': 48}, indent=2) + '\n')
assert (HERE/'rig.cjs').read_bytes() == (HERE.parent/'revision-2/rig.cjs').read_bytes(), 'rig changed'
print(f'96 shipped cells match, all bounds have clearance, {head_pixels} opaque A head pixels match, 48 A–D hashes and gait metadata unchanged.')
