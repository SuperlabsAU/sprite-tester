"""Sprite-gen experiment using its templates/processor and the app image tool.

The installed app supplies image_gen directly, so no nested Codex CLI process
is needed. Unmodified upstream prompts and chunk processing are preserved.
"""
import json, sys, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'vendor/skills/sprite-gen'))
from sprite_gen.templates import TemplateInputs, render
from sprite_gen.postprocess import ProcessOptions, process_sheet
from PIL import Image

VIEWS={'platform':('side',64,'Compact 3-head-tall platformer sprite.'),
       'street':('side',128,'Detailed arcade street sprite, adult 6-head-tall proportions.'),
       'isometric':('3/4',64,'Isometric30 degree overhead view, facing southeast/lower-right; fixed2:1 ground projection.'),
       'rpg':('topdown',64,'RPG55 degree overhead view, facing due south/downscreen; visible top of head.')}
DESIGN=['Adult corporate male with black rectangular glasses, short dark-brown hair and warm skin.',
        'Plain black T-shirt, blue jeans, grey sneakers with white soles. No props.',
        'Readable pixel-art clusters, consistent face and hair, fixed palette and camera within each action.']

def prepare():
    for view,(camera,cell,detail) in VIEWS.items():
        for action in ['walk','run','jump']:
            for chunk in [1,2]:
                folder=ROOT/f'runs/c/{view}/{action}/chunk-{chunk:02d}';folder.mkdir(parents=True,exist_ok=True)
                notes=detail+' '+('Vertical jump; preserve crouch/launch/rise/apex/fall/land poses.' if action=='jump' else 'Full loop with visibly alternating left and right legs. Near leg lighter blue, far leg darker; keep limb identity fixed.')
                inp=TemplateInputs(animation_type=action,animation_details=notes,character_design=DESIGN+[detail],from_reference=True,view=camera,frames_per_image=3,num_images=2,image_index=chunk,total_frames_override=6,frame_start_override=1 if chunk==1 else 4,frame_size_px=cell)
                prompt=render('sidescroller_character',inp)
                if chunk==2:
                    prompt='CHUNK CONTINUATION: Render frames4..6 of the SAME six-frame animation. Image2 is the previous3-frame strip. Continue from its rightmost pose; match character, camera, scale and colours. Do not restart frame1.\n\n'+prompt
                (folder/'prompt.txt').write_text(prompt)
    (ROOT/'runs/c/spec.json').write_text(json.dumps({'upstream':'https://github.com/gpwork4u/sprite-gen','template':'sidescroller_character','views':VIEWS,'frames':6,'chunks':[3,3],'design':DESIGN,'generation_transport':'app built-in image_gen; no CLI subprocess','processor':'unmodified sprite_gen.postprocess.process_sheet','reference':'runs/source/character-reference.png'},indent=2))

def process(view,action,chunk,source):
    folder=ROOT/f'runs/c/{view}/{action}/chunk-{chunk:02d}'
    raw=folder/'raw.png';shutil.copy2(source,raw)
    result=process_sheet(raw,folder/'processed',ProcessOptions(rows=1,cols=3,chroma_key=False,also_auto_rembg=True,duration_ms=120 if action=='walk' else 90 if action=='run' else 110,label_prefix=f'{action}-c{chunk}',output_frame_size=VIEWS[view][1],normalize_per_frame_size=False))
    print(json.dumps({'view':view,'action':action,'chunk':chunk,'warnings':result.qc_warnings,'strip':str(result.transparent_strip),'frames':[str(p) for p in result.transparent_frame_paths]}))

if __name__=='__main__':
    if sys.argv[1]=='prepare':prepare()
    else:process(sys.argv[2],sys.argv[3],int(sys.argv[4]),sys.argv[5])
