"""Create inspection sheets without modifying the shipped sprite pixels."""
from pathlib import Path
from PIL import Image, ImageDraw
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
VIEWS = ['platform','street','isometric','rpg']
proof = Image.new('RGB',(960,820),'#e8eaf0'); draw=ImageDraw.Draw(proof)
for v,view in enumerate(VIEWS):
    size = 128 if view == 'street' else 64
    for r,(label,path) in enumerate([
        ('A reference',ROOT/f'site/dist/assets/a-{view}-walk.png'),
        ('E before',HERE/f'before/e-{view}-walk.png'),
        ('E revised',ROOT/f'site/dist/assets/e-{view}-walk.png')]):
        im = Image.open(path).convert('RGBA').crop((0,0,size,size)).resize((192,192),Image.Resampling.NEAREST)
        draw.text((v*240+14,r*270+12),f'{label} / {view}',fill='black')
        proof.paste(im,(v*240+14,r*270+42),im)
proof.save(HERE/'appearance-comparison.png')
proof = Image.new('RGB',(1190,1920),'#e8eaf0'); draw=ImageDraw.Draw(proof)
for v,view in enumerate(VIEWS):
    for a,action in enumerate(['walk','run','jump']):
        y = (v*3+a)*160; draw.text((10,y+4),f'E {view} {action}',fill='black')
        for i in range(8):
            im = Image.open(HERE/f'frames/{view}-{action}/{i+1:02}.png').convert('RGBA').resize((128,128),Image.Resampling.NEAREST)
            proof.paste(im,(10+i*146,y+23),im); draw.text((12+i*146,y+146),str(i+1),fill='black')
proof.save(HERE/'all-frames.png')
