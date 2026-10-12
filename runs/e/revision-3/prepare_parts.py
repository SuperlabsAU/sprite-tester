"""Extract the regenerated atlas cells without repainting their artwork."""
from pathlib import Path
from PIL import Image
from collections import deque
HERE = Path(__file__).resolve().parent
NAMES = ['head','torso','right-upper-arm','right-forearm','left-upper-arm','left-forearm','right-thigh','right-shin','left-thigh','left-shin','right-shoe','left-shoe']
def main_part_bounds(cell):
    # Generated rows can bleed into adjacent cells. Choose the main connected
    # object, then crop its original pixels (including original edge alpha).
    alpha = cell.getchannel('A')
    width, height = cell.size
    pending = {i for i, value in enumerate(alpha.tobytes()) if value > 16}
    largest = []
    while pending:
        start = pending.pop()
        queue = deque([start]); component = [start]
        while queue:
            point = queue.popleft(); x, y = point % width, point // width
            neighbours = []
            if x: neighbours.append(point-1)
            if x+1 < width: neighbours.append(point+1)
            if y: neighbours.append(point-width)
            if y+1 < height: neighbours.append(point+width)
            for neighbour in neighbours:
                if neighbour in pending:
                    pending.remove(neighbour); queue.append(neighbour); component.append(neighbour)
        if len(component) > len(largest): largest = component
    assert largest
    xs = [i % width for i in largest]; ys = [i // width for i in largest]
    return (max(0,min(xs)-1),max(0,min(ys)-1),min(width,max(xs)+2),min(height,max(ys)+2))
for view in ('platform','street','isometric','rpg'):
    source = HERE / 'raw' / f'{view}-parts.png'
    if not source.exists():
        continue
    im = Image.open(source).convert('RGBA')
    out = HERE / 'parts' / view
    out.mkdir(parents=True, exist_ok=True)
    for i, name in enumerate(NAMES):
        row, col = divmod(i, 4)
        cell = im.crop((round(col*im.width/4),round(row*im.height/3),round((col+1)*im.width/4),round((row+1)*im.height/3)))
        bounds = main_part_bounds(cell)
        assert bounds, (view, name)
        cell.crop(bounds).save(out / f'{name}.png')
