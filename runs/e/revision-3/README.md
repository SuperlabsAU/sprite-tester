# E revision 3 — restore A’s appearance

12 October 2026. User rejected revision 2’s changed aesthetics and selected the first sprite method (A) as the visual reference. Scope: method E in four cameras and three actions. The corrected eight-pose gait is retained; A–D remain unchanged.

## Findings and correction

The prior regenerated atlases invented a different face/hair design, thin arms and strongly saturated narrow denim. RPG’s torso was too narrow. A large illustrated atlas used as a second reference dominated the first retry; that retry was rejected (`raw/rejected-layout-anchored.png`). Accepted atlases reference only nearest-neighbour enlargements of A’s first walk pose per camera.

The accepted correction combines native A head pixels (including RPG collar/shoulders) with newly generated clothing and limb textures. The renderer copies each approved head patch at native size, without recolouring or per-frame recropping. It restores fuller forearms and jean legs, broader RPG shirt/shoulders, and a connected street neckline. This is explicitly A appearance restoration plus an authored cut-out rig, not the unmodified Game Studio strip workflow.

Generated atlas rows were not perfectly aligned with nominal cells. Naïve alpha bounds included fragments from the previous row, shrinking the actual part during joint placement and creating gaps. `prepare_parts.py` now selects the largest connected object in each cell and crops its original pixels. This extracts parts without repainting them. RPG raised arms move inward one pixel to meet the torso; rig poses and timing stay unchanged.

## Retained movement and validation

- `rig.cjs` is byte-identical to revision 2. Anatomical contacts, counter-swing, layer ownership, foot trajectories and jump lift are unchanged.
- All twelve E clips retain their eight frames, durations, labels, stride and lift metadata. Walk/run/jump cycles remain 720/540/680ms.
- Every one of the 96 shipped cells matches its saved frame and retains non-zero-alpha margins. All 48 A–D PNG hashes match the previous baseline.
- Pixel audit confirms 22,128 opaque A head/collar pixels across all frames match the approved source exactly. Original partial alpha is retained through Canvas compositing.
- Eleven rig/playback tests pass. Independent review checks all 96 frames have one connected alpha>128 silhouette and documents remaining limitations: `REVIEW.md`.

Art comparison: `appearance-comparison.png` (A / previous E / corrected E). Full frame review: `all-frames.png`. Raw generation and exact accepted prompts: `raw/`, `prompts/`. The layout-guided rejected attempt’s prompt is retained separately. Generated assets used the built-in image tool; saved source atlases are required for reproduction, with no API credentials.

## Reproduce

Requires Python 3/Pillow and Node.js with `@napi-rs/canvas`. Set `NODE_PATH` to its install location when it is outside the repository.

```sh
python3 runs/e/revision-3/prepare_parts.py
node runs/e/revision-3/render.cjs
python3 runs/e/revision-3/verify.py
python3 runs/e/revision-3/proofs.py
node --test runs/e/revision-3/rig.test.cjs site/tests/playback.test.cjs
```

`before/` preserves revision 2’s shipped clips/metadata. Do not rerun earlier revision renderers to build this revision. The result is closer to A’s visual identity, not pixel-identical clothing or continuous hand-drawn motion. Rotated part textures still deform and eight held poses remain angular.
