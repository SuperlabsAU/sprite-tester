"""Package native sprite-gen output without altering its per-frame registration."""
import json
from pathlib import Path
from PIL import Image, ImageDraw
from workflow import ROOT, VIEWS

def bounds(im,threshold=100):
    return im.getchannel('A').point(lambda a:255 if a>=threshold else 0).getbbox()

def package():
    report={}; metadata=json.loads((ROOT/'site/dist/assets/motion.json').read_text())
    proof=Image.new('RGB',(920,1920),(238,243,249));d=ImageDraw.Draw(proof);row=0
    for view,(_,cell,_) in VIEWS.items():
        for action in ['walk','run','jump']:
            folder=ROOT/f'runs/c/{view}/{action}';frames=[];warnings=[]
            for chunk in [1,2]:
                src=folder/f'chunk-{chunk:02d}/processed'
                paths=sorted((src/'transparent').glob(f'{action}-c{chunk}-*.png'))
                if len(paths)!=3:raise ValueError(f'Expected3 {src}, found{len(paths)}')
                frames.extend(Image.open(p).convert('RGBA') for p in paths)
                qa=json.loads((src/'pipeline-meta.json').read_text())
                warnings.extend(qa.get('qc',{}).get('warnings',[]))
            assert all(f.size==(cell,cell) and bounds(f) for f in frames)
            floor=cell-6
            offset=min(floor-max(bounds(f)[3]-1 for f in frames),cell-1-max(f.getbbox()[3] for f in frames))
            final=folder/'final';final.mkdir(exist_ok=True)
            native=Image.new('RGBA',(cell*6,cell));atlas=Image.new('RGBA',native.size)
            for i,frame in enumerate(frames):
                native.paste(frame,(i*cell,0))
                shifted=Image.new('RGBA',(cell,cell));shifted.paste(frame,(0,offset))
                # Assert that the stage offset has not discarded any opaque pixels.
                assert sum(frame.getchannel('A').getdata())==sum(shifted.getchannel('A').getdata())
                atlas.paste(shifted,(i*cell,0))
                enlarged=shifted.resize((128,128),Image.Resampling.NEAREST)
                proof.paste(enlarged,(145+i*128,row*160+22),enlarged)
            key=f'c-{view}-{action}';native.save(final/'native-strip.png');atlas.save(final/'stage-strip.png');atlas.save(ROOT/f'site/dist/assets/{key}.png')
            d.text((8,row*160+8),key,fill=(25,40,65));row+=1
            stride={'platform':[40,0],'street':[48,0],'isometric':[24,12],'rpg':[0,18]}[view]
            if action=='run':stride=[x*1.5 for x in stride]
            if action=='jump':stride=[0,0]
            metadata['clips'][key]={'frames':6,'durations':[120]*6 if action=='walk' else [90]*6 if action=='run' else [140,70,100,140,100,130],'stride':stride,'calibrated':False,'distanceBasis':'Reference preview only; no foot-lock claim','method':'sprite-gen a23e846; app image tool transport','stageOffsetY':offset,'poseStatus':'Native generated poses; motion review required'}
            report[key]={'frames':6,'cell':cell,'stageOffsetY':offset,'alphaMode':'native soft alpha; no palette remap','soleY':[bounds(f)[3]-1+offset for f in frames],'nativeBounds':[bounds(f) for f in frames],'qcWarnings':warnings,'clippedPixels':0}
    metadata['revision']=3
    (ROOT/'site/dist/assets/motion.json').write_text(json.dumps(metadata,indent=2))
    (ROOT/'runs/c/verification.json').write_text(json.dumps(report,indent=2))
    proof.save(ROOT/'runs/c/all-frames.png')
    print(f'Packaged{len(report)} strips,72 frames; no clipping. Native processor output retained.')

if __name__=='__main__':package()
