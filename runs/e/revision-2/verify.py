"""Audit shipped raster cells, transparent margins and unchanged comparison assets."""
from pathlib import Path
import hashlib
import json
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ASSETS = ROOT / 'site/dist/assets'
records = []
for view in ('platform', 'street', 'isometric', 'rpg'):
    size = 128 if view == 'street' else 64
    for action in ('walk', 'run', 'jump'):
        name = f'{view}-{action}'
        strip = Image.open(ASSETS / f'e-{name}.png').convert('RGBA')
        assert strip.size == (size * 8, size), name
        for i in range(8):
            cell = strip.crop((i * size, 0, (i + 1) * size, size))
            saved = Image.open(HERE / 'frames' / name / f'{i+1:02}.png').convert('RGBA')
            assert cell.tobytes() == saved.tobytes(), (name, i+1, 'cell mismatch')
            bounds = cell.getchannel('A').getbbox()
            assert bounds and min(bounds[:2]) > 0 and max(bounds[2:]) < size, (name, i+1, bounds)
            records.append({'clip': name, 'frame': i+1, 'bounds': bounds})
baseline = json.loads((HERE / 'baseline-hashes.json').read_text())
assert len(baseline) == 48
for name, expected in baseline.items():
    assert hashlib.sha256((ASSETS / name).read_bytes()).hexdigest() == expected, name
(HERE / 'pixel-audit.json').write_text(json.dumps({'frames': records, 'unchangedComparisonStrips': 48}, indent=2) + '\n')
print('96 shipped cells match, all non-zero-alpha bounds have clearance, 48 A–D hashes unchanged.')
