#!/usr/bin/env python3
"""Run Game Studio's normaliser and preserve the strip's vertical motion."""
from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess
import sys
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
RUN = ROOT / 'runs/e'
SCRIPTS = ROOT / 'vendor/skills/game-studio/scripts'
spec = importlib.util.spec_from_file_location('normalise', SCRIPTS / 'normalize_sprite_strip.py')
normalise = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normalise)
VIEWS = {'platform': 64, 'street': 128, 'isometric': 64, 'rpg': 64}
DURATIONS = {'walk': [120] * 6, 'run': [90] * 6, 'jump': [140, 70, 100, 140, 100, 130]}

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    assets = ROOT / 'site/dist/assets'
    original_hashes = {p.name: digest(p) for p in assets.glob('[abcd]-*.png')}
    motion = json.loads((assets / 'motion.json').read_text())
    records = {}
    sheet = Image.new('RGB', (6 * 160 + 170, 12 * 180), '#eff3f7')
    draw = ImageDraw.Draw(sheet)
    for row, (view, action) in enumerate((v, a) for v in VIEWS for a in DURATIONS):
        cell = VIEWS[view]
        seed = Image.open(RUN / f'seeds/{view}.png').convert('RGBA')
        seed_bbox = seed.getbbox()
        target = seed_bbox[3] - seed_bbox[1]
        floor = cell - 5
        key = f'{view}-{action}'
        raw = Image.open(RUN / f'raw/{key}.png').convert('RGBA')
        assert raw.getchannel('A').getextrema()[0] == 0, f'{key}: missing transparency'
        slots = normalise.split_strip(raw, 6)
        bboxes = [normalise.threshold_bbox(s, 8) for s in slots]
        assert all(bboxes), f'{key}: empty slot'
        contents = [normalise.crop_to_content(s, 8) for s in slots]
        maximum = normalise.max_content_size([*contents, seed.crop(seed_bbox)])
        raw_floor = max(b[3] for b in bboxes)
        # Include airborne travel in the fit, rather than clipping the apex.
        envelope = max(raw_floor - b[1] for b in bboxes)
        if action != 'walk':
            target = min(target, int((floor - 3) * max(maximum) / envelope))
        scale = min(target / maximum[0], target / maximum[1])
        native = RUN / 'native' / key
        subprocess.run([sys.executable, str(SCRIPTS / 'normalize_sprite_strip.py'),
                        '--input', str(RUN / f'raw/{key}.png'), '--out-dir', str(native),
                        '--frames', '6', '--frame-size', str(target),
                        '--anchor', str(RUN / f'seeds/{view}.png')], check=True)
        # Native bottom alignment erases flight. Recover only vertical position
        # measured in the generated strip; no poses or height curve are invented.
        lift = [round((raw_floor - b[3]) * scale) if action != 'walk' else 0 for b in bboxes]
        out = RUN / 'frames' / key
        out.mkdir(parents=True, exist_ok=True)
        strip = Image.new('RGBA', (cell * 6, cell))
        frame_records = []
        draw.text((10, row * 180 + 12), key, fill='#344966')
        for i in range(6):
            inner = Image.open(native / f'{i + 1:02}.png').convert('RGBA')
            frame = Image.new('RGBA', (cell, cell))
            offset = ((cell - target) // 2, floor - target - lift[i])
            frame.alpha_composite(inner, offset)
            bbox = normalise.threshold_bbox(frame, 8)
            assert bbox and min(bbox[:2]) >= 1 and max(bbox[2:]) < cell, f'{key}: clipping'
            frame.save(out / f'{i + 1:02}.png')
            strip.alpha_composite(frame, (i * cell, 0))
            display = frame.resize((144, 144), Image.Resampling.NEAREST)
            sheet.paste(display, (170 + i * 160, row * 180 + 18), display)
            draw.text((170 + i * 160, row * 180 + 162), f'F{i + 1} / lift {lift[i]}', fill='#344966')
            frame_records.append({'frame': i + 1, 'raw_bbox': bboxes[i], 'bbox': bbox,
                                  'lift': lift[i], 'duration': DURATIONS[action][i]})
        strip.save(assets / f'e-{key}.png')
        subprocess.run([sys.executable, str(SCRIPTS / 'render_sprite_preview_sheet.py'),
                        '--frames-dir', str(out), '--out', str(RUN / f'preview-{key}.png'),
                        '--columns', '6'], check=True)
        stride = [0, 0] if action == 'jump' else ([0, 24 if action == 'walk' else 40] if view == 'rpg' else
                 ([24, 12] if action == 'walk' else [40, 20]) if view == 'isometric' else
                 [(40 if action == 'walk' else 64) * (2 if view == 'street' else 1), 0])
        motion['clips'][f'e-{key}'] = {'frames': 6, 'durations': DURATIONS[action], 'stride': stride,
            'calibrated': False, 'distanceBasis': 'Comparison reference estimate; generated stance travel is not calibrated',
            'poseStatus': 'Full-strip image edit from shipped A seed; native shared-scale normalisation; source vertical flight restored',
            'source': 'OpenAI Game Studio sprite-pipeline 0.1.2', 'lift': lift}
        records[key] = {'cell': cell, 'raw_size': raw.size, 'native_frame_size': target,
                        'shared_scale': scale, 'ground_baseline_exclusive': floor,
                        'frame1_locked': False, 'frames': frame_records}
    motion['revision'] = 6
    (assets / 'motion.json').write_text(json.dumps(motion, indent=2) + '\n')
    assert all(digest(assets / name) == value for name, value in original_hashes.items())
    (RUN / 'verification.json').write_text(json.dumps({'date': '2026-10-12', 'clips': records,
        'existing_asset_hashes': original_hashes, 'existing_assets_unchanged': True,
        'new_clips': 12, 'new_frames': 72}, indent=2) + '\n')
    sheet.save(RUN / 'all-frames.png')
    print('Packaged 12 clips / 72 frames; all 48 existing PNG strips unchanged.')

if __name__ == '__main__':
    main()
