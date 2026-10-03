"""Package generated strips. Never draws or synthesises character poses.

The upstream A assembler fits each frame independently, changing body size and
removing jump elevation. We retain its initial output, then use a common scale
and shared ground line for all six source components. Both workflows use this
same geometric import to keep the comparison fair; palette/export differs.
"""
import argparse, importlib.util, json, shutil, subprocess, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
A = ROOT / 'vendor/skills/character-animation-creator/scripts'
B = ROOT / 'vendor/skills/pixel-art/scripts'
spec = importlib.util.spec_from_file_location('assembler', A / 'assemble_action_sheet.py')
assembler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assembler)

def command(script, *args, report=None):
    p = subprocess.run([sys.executable, str(script), *map(str, args)], capture_output=True, text=True)
    if report:
        Path(report).write_text(p.stdout or p.stderr)
    if p.returncode:
        raise RuntimeError(f'{script.name}: {p.stdout} {p.stderr}')
    return p.stdout

def process(key, source):
    workflow, view, action = key.split('-')
    cell = 128 if view == 'street' else 64
    direction = {'platform':'east','street':'east','isometric':'south-east','rpg':'south'}[view]
    run = ROOT / 'runs' / workflow / view
    for folder in ['generated','frames','final','qa','previews']:
        (run/folder).mkdir(parents=True,exist_ok=True)
    copied = ROOT/'runs/source'/f'{key}.png'
    shutil.copy2(source,copied)
    strip = run/'generated'/f'{action}-{direction}.png'
    shutil.copy2(source,strip)
    if workflow == 'a':
        command(A/'assemble_action_sheet.py','--input-dir',run/'generated','--output',run/'qa'/f'{action}-upstream-assembly.png','--action',action,'--directions',direction,'--cell',cell,'--columns',6,'--frames-dir',run/'qa/upstream-frames')
    image = Image.open(source).convert('RGBA')
    alpha = image.getchannel('A').point(lambda a:255 if a>=100 else 0)
    image.putalpha(alpha)
    comps = assembler.components(image,100)
    largest = max(c['area'] for c in comps)
    seeds = sorted([c for c in comps if c['area']>largest*.15],key=lambda c:c['area'],reverse=True)[:6]
    seeds.sort(key=lambda c:c['center_x'])
    if len(seeds)!=6:
        raise RuntimeError(f'{key}: expected six figures, found {len(seeds)}')
    groups = [[c] for c in seeds]
    for c in comps:
        if any(c is s for s in seeds) or c['area']<20:
            continue
        nearest = min(range(6),key=lambda i:abs(c['center_x']-seeds[i]['center_x']))
        groups[nearest].append(c)
    bounds=[]
    for group in groups:
        bounds.append((min(c['bbox'][0] for c in group),min(c['bbox'][1] for c in group),max(c['bbox'][2] for c in group),max(c['bbox'][3] for c in group)))
    top=min(b[1] for b in bounds)
    baseline=max(b[3] for b in bounds)
    heights=sorted(b[3]-b[1] for b in bounds)
    target_height=cell*(.72 if view!='rpg' else .65)
    scale=target_height/heights[3]
    if action=='jump':
        scale=cell*.84/(baseline-top)
    scale=min(scale,(cell-8)/max(b[2]-b[0] for b in bounds))
    frames=[]
    frame_dir=run/'frames'/action
    frame_dir.mkdir(parents=True,exist_ok=True)
    for i,(group,bbox) in enumerate(zip(groups,bounds)):
        crop=assembler.component_image(image,group,0)
        w,h=max(1,round(crop.width*scale)),max(1,round(crop.height*scale))
        crop=crop.resize((w,h),Image.Resampling.NEAREST)
        frame=Image.new('RGBA',(cell,cell))
        x=(cell-w)//2
        y=round(cell-5-(baseline-bbox[1])*scale)
        if y<2 or y+h>cell-2:
            raise RuntimeError(f'{key} frame {i}: clipping y={y} h={h}')
        frame.alpha_composite(crop,(x,y))
        # Remove isolated sampling specks, never connected body pixels.
        px=frame.load(); orphan=[]
        for yy in range(cell):
            for xx in range(cell):
                if px[xx,yy][3] and not any(0<=xx+dx<cell and 0<=yy+dy<cell and px[xx+dx,yy+dy][3] for dx in [-1,0,1] for dy in [-1,0,1] if dx or dy):
                    orphan.append((xx,yy))
        for pos in orphan: px[pos]=(0,0,0,0)
        frame.save(frame_dir/f'{i:02d}.png')
        frames.append(frame)
    raw=run/'final'/f'{action}-import.png'
    atlas=Image.new('RGBA',(cell*6,cell))
    for i,frame in enumerate(frames): atlas.alpha_composite(frame,(i*cell,0))
    atlas.save(raw)
    final=run/'final'/f'{action}-sheet-clean.png'
    if workflow=='a':
        command(A/'pixel_snap.py','--input',raw,'--output',final,'--cell',cell,'--palette',48 if view=='street' else 32,'--alpha-threshold',100)
    else:
        for path in sorted(frame_dir.glob('*.png')):
            command(B/'palette_remap.py','--image',path,'--palette',ROOT/'vendor/skills/pixel-art/palettes/db32.json','--output',path,'--json')
        command(B/'atlas_pack.py','--frames-dir',frame_dir,'--output',final,'--cols',6,'--json',report=run/'qa'/f'{action}-pack.json')
    command(B/'quality_audit.py','--image',final,'--grid',cell,'--max-colors',48 if workflow=='a' and view=='street' else 32,'--json',report=run/'qa'/f'{action}-pixel-audit.json')
    command(A/'validate_sheet.py','--input',final,'--rows',1,'--columns',6,'--cell',cell,'--row-names',direction,'--json-out',run/'qa'/f'{action}-validation.json','--contact-sheet',run/'qa'/f'{action}-contact-sheet.png','--fail-on-warnings')
    command(A/'audit_sprite_motion.py','--input',final,'--rows',1,'--columns',6,'--cell',cell,'--row-names',direction,'--json-out',run/'qa'/f'{action}-motion.json','--fail-on-warnings')
    command(A/'export_animation_previews.py','--atlas',final,'--out-dir',run/'previews','--rows',1,'--columns',6,'--cell',cell,'--scale',3 if cell==64 else 2,'--duration',120 if action=='walk' else 90 if action=='run' else 160,'--prefix',action,'--row-names',direction)
    target=ROOT/'site/dist/assets'/f'{key}.png'
    shutil.copy2(final,target)
    record={'key':key,'workflow':workflow,'view':view,'action':action,'cell':cell,'frames':6,'direction':direction,'method':'imagegen','source':str(copied.relative_to(ROOT)),'prompt':f'runs/prompts/{key}.txt','final':str(target.relative_to(ROOT)),'geometry':'shared component extraction; uniform scale and ground line','palette':'adaptive 48' if workflow=='a' and cell==128 else 'adaptive 32' if workflow=='a' else 'DB32','pixel_audit':'pass','geometry_audit':'pass','motion_audit':'pass'}
    (run/'qa'/f'{action}-provenance.json').write_text(json.dumps(record,indent=2))
    print(json.dumps(record))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('key');parser.add_argument('source')
    args=parser.parse_args();process(args.key,args.source)
