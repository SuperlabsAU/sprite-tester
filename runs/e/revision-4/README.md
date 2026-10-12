# E revision 4 — whole-character match to A

12 October 2026. The user rejected revision 3 because its restored head sat on an undersized, angular body. The target is the complete Character Animation Creator character (A), across four views and three actions.

E now uses A’s native head, torso, shirt, denim, arms and trainers. This is a disclosed hybrid: Game Studio’s animation experiment corrected with A’s artwork and an authored Canvas rig, not a fresh independent Game Studio art sample. No new image generation was used in this revision; the existing editable Canvas pipeline was revised.

## What changed

- Measured joints in each native A view replace generic projected body dimensions. Side-view contact poses are upright with fuller legs and correctly sized shoes.
- Anatomical source masks separate clothing, limbs and shoes before articulation. Shirt backing uses A’s central shirt texture beneath moving shoulder roots, so arms cannot expose transparent holes.
- Arms rotate with fixed lengths in the side/isometric views. Top-down foreshortening uses bounded projected lengths; both arms spread to comparable lengths in the jump.
- Elevated far limbs use full-length native source texture rather than stretching an already foreshortened limb 2–3 times. This preserves fabric and limb volume.
- Eight poses retain alternating contacts, opposing side-view arm swing and stable overlap ownership. Frame timings stay 720/540/680ms for walk/run/jump. Strides and lift were recalibrated to the revised geometry.
- Final nearest-neighbour rasterisation can leave tiny detached edge specks. The exporter removes components of at most three pixels; larger detached parts fail export. This is a final cleanup, not a substitute for correct texture ownership.

The development loop caught and fixed mask bleed, stretched arms, tiny far legs, shoulder gaps and unequal RPG jump arms. [Independent review](REVIEW.md) accepts whole-character likeness after those corrections. See [A / previous E / revised E](appearance-comparison.png) and [all 96 frames](all-frames.png).

## Verification and reproduction

Requires Python 3/Pillow and Node.js with `@napi-rs/canvas` available on `NODE_PATH` when installed outside the project:

```sh
node runs/e/revision-4/render.cjs
python3 runs/e/revision-4/verify.py
python3 runs/e/revision-4/proofs.py
node --test runs/e/revision-4/rig.test.cjs site/tests/playback.test.cjs
```

The 12 tests cover complete assets, playback, contact alternation, sampled foot travel, limb-length bounds and jump/flight order. Raster audit verifies all 96 saved/shipped cells, connected silhouettes, clear margins, 23,880 unchanged native head pixels, shoulder-gap regressions, no denim contamination in the RPG arms and all 48 unchanged A–D strips. Tests do not determine aesthetic quality; that is covered by visual comparison and independent review.

`references/` contains A’s source frames and measurement grids; `parts/` holds the extracted native artwork. `source-rig.cjs`, `parts.cjs`, `rig.cjs` and `render.cjs` are the editable source. `before/` preserves revision 3. Rerunning older revision exporters will overwrite E with their earlier appearance.

Eight held frames still produce stepping. Rotated pixel textures can retain angular edges and some deformation; this is not continuous hand-drawn animation. Sampled ankle travel matches the rig, but does not certify zero sliding at every raster edge between held frames.

Published and browser-verified on 12 October 2026 at `027e0c9`. See [browser checks](browser-checks.md) and [live proof](live-page.png).
