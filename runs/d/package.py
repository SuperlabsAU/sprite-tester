"""Verify and publish exact Aseprite exports, with no image resampling."""
import json,shutil
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[2]
views=['platform','street','isometric','rpg'];actions=['walk','run','jump']
def package():
    motion=json.loads((ROOT/'site/dist/assets/motion.json').read_text());report={}
    proof=Image.new('RGB',(950,12*155),(234,239,245));draw=ImageDraw.Draw(proof)
    for vi,view in enumerate(views):
        for ai,action in enumerate(actions):
            folder=ROOT/f'runs/d/{view}/{action}';im=Image.open(folder/'strip.png').convert('RGBA');pose=json.loads((folder/'pose-metadata.json').read_text());export=json.loads((folder/'strip.json').read_text());n=128 if view=='street' else 64
            assert im.size==(n*6,n)
            assert [f['duration'] for f in export['frames'].values()]==pose['timing']
            bounds=[]
            for i in range(6):
                frame=im.crop((i*n,0,(i+1)*n,n));box=frame.getbbox();assert box and box[0]>0 and box[1]>0 and box[2]<n and box[3]<n
                bounds.append(box)
                shown=frame.resize((128,128),Image.Resampling.NEAREST);proof.paste(shown,(170+128*i,(vi*3+ai)*155+20),shown)
            key=f'd-{view}-{action}';draw.text((8,(vi*3+ai)*155+6),key,fill=(22,34,58));shutil.copyfile(folder/'strip.png',ROOT/f'site/dist/assets/{key}.png')
            record={'frames':6,'durations':pose['timing'],'stride':pose['frames'][0]['stride'],'calibrated':False,'distanceBasis':'Authored stance trajectory; pixel rounding and frame holds still permit sliding','method':'pixel-plugin 0.5.0 dee3506 / Aseprite 1.3.18.6 source build','poseStatus':'Detailed pixel poses via draw_pixels; original movement retained'}
            motion['clips'][key]=record
            # Authored feet must alternate support and cancel ground travel at sampled stance frames.
            residual=[]
            if action!='jump':
                for side in [-1,1]:
                    support=[(i,next(f for f in frame['feet'] if f['side']==side)) for i,frame in enumerate(pose['frames']) if next(f for f in frame['feet'] if f['side']==side)['stance']]
                    world=[(f['screen'][0]+i/6*record['stride'][0],f['screen'][1]+i/6*record['stride'][1]) for i,f in support]
                    residual.append(max(max(x[d] for x in world)-min(x[d] for x in world) for d in [0,1]))
                assert max(residual)<.002
                assert len({tuple(frame['headOrigin']) for frame in pose['frames']})==(1 if action=='walk' else 2)
                if action=='run':
                    assert all(not foot['stance'] for i in [2,5] for foot in pose['frames'][i]['feet'])
            else:assert [f['rootLift'] for f in pose['frames']].index(max(f['rootLift'] for f in pose['frames']))==3
            report[key]={'bounds':bounds,'frames':6,'exactAsepriteExport':True,'authoredStanceResidualPx':residual,'headOrigins':[f['headOrigin'] for f in pose['frames']],'rootLift':[f['rootLift'] for f in pose['frames']]}
    motion['revision']=5
    (ROOT/'site/dist/assets/motion.json').write_text(json.dumps(motion,indent=2));(ROOT/'runs/d/verification.json').write_text(json.dumps(report,indent=2));proof.save(ROOT/'runs/d/all-frames.png')
    print('Verified12 Aseprite strips /72 frames: margins, timing, stable head template, alternating support and sampled stance trajectory.')
if __name__=='__main__':package()
