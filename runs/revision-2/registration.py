"""Mechanical registration of existing art; does not draw or synthesise poses."""
from pathlib import Path
import json, math, statistics
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent

def hip_anchor(im):
    # Upper denim band anchors the pelvis independently of waving hands/feet.
    blue=[(x,y) for y in range(im.height) for x in range(im.width)
          if (lambda p:p[3]>0 and p[2]>=70 and p[2]-p[0]>=30 and p[2]-p[1]>=15)(im.getpixel((x,y)))]
    if not blue: raise ValueError('No denim landmark')
    top=min(y for x,y in blue); bottom=max(y for x,y in blue)
    band=[(x,y) for x,y in blue if y<=top+max(1,round((bottom-top)*.16))]
    return statistics.median(x for x,y in band),statistics.median(y for x,y in band)

def head_width(im):
    pts=[(x,y) for y in range(im.height) for x in range(im.width)
         if (lambda p:p[3]>0 and p[0]>p[1]*1.15 and p[1]>p[2]*1.1 and 20<p[0]<160)(im.getpixel((x,y)))]
    # Dark brown hair, excluding raised skin-coloured arms and hands.
    pts=[(x,y) for x,y in pts if im.getpixel((x,y))[0]<125 and im.getpixel((x,y))[1]<90]
    top=min(y for x,y in pts)
    xs=[x for x,y in pts if y<top+im.height*.10]
    return max(xs)-min(xs)+1

def translate(im,dx,dy):
    b=im.getbbox()
    if b and (b[0]+dx<1 or b[1]+dy<1 or b[2]+dx>im.width-1 or b[3]+dy>im.height-1):
        raise ValueError(f'Would clip opaque art {b}, shift {dx,dy}')
    out=Image.new('RGBA',im.size);out.alpha_composite(im,(dx,dy));return out

def frames(skill,view,action,kind='sheet-clean'):
    cell=128 if view=='street' else 64
    im=Image.open(ROOT/f'runs/{skill}/{view}/final/{action}-{kind}.png').convert('RGBA')
    return [im.crop((i*cell,0,(i+1)*cell,cell)) for i in range(6)]

def register_set(skill,view,write=False):
    cell=128 if view=='street' else 64; floor=cell-6
    originals={a:frames(skill,view,a) for a in ['walk','run','jump']}
    imports={a:frames(skill,view,a,'import') for a in originals}
    widths={a:statistics.median(head_width(f) for f in imports[a]) for a in originals}
    target=widths['walk']; result={}; records=[]
    # One head-size target per character/view. Lower target only if a pose clips.
    for attempt in range(20):
        result={}; records=[]
        walk_scale=target/widths['walk']
        ground_hip=statistics.median(floor-(f.getbbox()[3]-1-hip_anchor(raw)[1])*walk_scale
                                    for f,raw in zip(originals['walk'],imports['walk']))
        try:
            for action,old in originals.items():
                scale=target/widths[action]; new=[]
                source_floor=max(f.getbbox()[3]-1 for f in old)
                for i,(f,raw) in enumerate(zip(old,imports[action])):
                    box=f.getbbox(); crop=f.crop(box)
                    crop=crop.resize((max(1,round(crop.width*scale)),max(1,round(crop.height*scale))),Image.Resampling.NEAREST)
                    hx,hy=hip_anchor(raw)
                    ax=(hx-box[0])*scale; ay=(hy-box[1])*scale
                    x=round(cell/2-ax)
                    if action=='jump' and i in [2,3,4]:
                        lift=cell*{2:.12,3:.18,4:.08}[i]
                        y=round(ground_hip-lift-ay)
                        y=min(y,floor-1-(crop.height-1))
                    elif action=='jump' or view in ['platform','street']:
                        lift=cell*.075 if action=='run' and i in [2,5] else 0
                        y=round(floor-lift-(crop.height-1))
                    else:
                        y=round(floor-(source_floor-box[1])*scale)
                    if crop.width>cell or crop.height>cell:
                        raise ValueError('Crop exceeds cell')
                    out=Image.new('RGBA',(cell,cell));out.alpha_composite(crop,(0,0))
                    out=translate(out,x,y);new.append(out)
                    records.append({'action':action,'frame':i+1,'scale':round(scale,4),'hip_x':round(x+ax,3),'hip_y':round(y+ay,3),'sole_y':out.getbbox()[3]-1})
                result[action]=new
            break
        except ValueError:
            target*=.98
    else: raise ValueError(f'Cannot safely register {skill}-{view}')
    for action,new in result.items() if write else []:
        key=f'{skill}-{view}-{action}'; atlas=Image.new('RGBA',(cell*6,cell))
        for i,f in enumerate(new):atlas.alpha_composite(f,(i*cell,0))
        atlas.save(OUT/f'{key}.png')
        atlas.save(ROOT/f'site/dist/assets/{key}.png')
    return records

if __name__=='__main__':
    report={}
    for skill in 'ab':
        for view in ['platform','street','isometric','rpg']:
            report[f'{skill}-{view}']=register_set(skill,view,write=True)
    (OUT/'registration.json').write_text(json.dumps(report,indent=2))
    # Labelled all-frame proof sheets for independent visual review.
    for skill in 'ab':
        proof=Image.new('RGB',(920,12*160),(238,243,249));d=ImageDraw.Draw(proof)
        for row,(view,action) in enumerate((v,a) for v in ['platform','street','isometric','rpg'] for a in ['walk','run','jump']):
            key=f'{skill}-{view}-{action}';im=Image.open(OUT/f'{key}.png');cell=im.height
            d.text((8,row*160+8),key,fill=(25,40,65))
            for i in range(6):
                f=im.crop((i*cell,0,(i+1)*cell,cell)).resize((128,128),Image.Resampling.NEAREST)
                proof.paste(f,(145+i*128,row*160+22),f)
        proof.save(OUT/f'{skill}-all-frames.png')
    print('Registered 24 strips; originals retained. Wrote pelvis/scale measurements and review sheets.')
