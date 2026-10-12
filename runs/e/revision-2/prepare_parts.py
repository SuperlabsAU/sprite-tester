"""Extract generated part cells; no painted/replacement character art."""
from PIL import Image
from pathlib import Path
import hashlib,json,shutil
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).resolve().parent
names=['head','torso','right-upper-arm','right-forearm','left-upper-arm','left-forearm','right-thigh','right-shin','left-thigh','left-shin','right-shoe','left-shoe']
for view in ['platform','street','isometric','rpg']:
 im=Image.open(HERE/f'raw/{view}-parts.png').convert('RGBA');out=HERE/'parts'/view;out.mkdir(parents=True,exist_ok=True)
 for i,name in enumerate(names):
  row,col=divmod(i,4);part=im.crop((round(col*im.width/4),round(row*im.height/3),round((col+1)*im.width/4),round((row+1)*im.height/3)))
  bbox=part.getchannel('A').point(lambda a:255 if a>16 else 0).getbbox();assert bbox
  part.crop(bbox).save(out/f'{name}.png')
assets=ROOT/'site/dist/assets';before=HERE/'before';before.mkdir(exist_ok=True)
for p in assets.glob('e-*.png'):shutil.copy2(p,before/p.name)
shutil.copy2(assets/'motion.json',before/'motion.json')
(HERE/'baseline-hashes.json').write_text(json.dumps({p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in assets.glob('[abcd]-*.png')},indent=2)+'\n')
