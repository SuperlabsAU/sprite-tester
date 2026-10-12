# E revision 5 — pixel gap repairs

12 October 2026. The user reported missing colouring and asked for inspection of every frame and pixel, with hand filling where needed. This corrects revision 4 without regenerating the character or changing its motion.

## Findings and repair

A connected silhouette can still contain internal holes. Independently rotating masked native textures leaves missing pixels at knees, ankles and elbows; the source street head also contains a transparent spectacle-lens pixel. A fixed RPG collar and moving arm expose a three-pixel sleeve slit in walk frame 6.

The review covered every one of the 96 E frames on a contrasting pink background, then isolated each arm, leg, torso and head to distinguish internal holes from background between limbs. `inspect_pixels.py` scans all alpha pixels. `propose_repairs.py` proposes enclosed per-part holes and small open seams close to joints; its morphological operation is only a review aid, never a runtime blanket fill. The accepted exact coordinates, colours, anatomical layer and colour donor are in `pixel-repairs.json`. The sleeve slit is explicitly hand-filled in `manual-repairs.json`.

The exporter applies 589 additions across 95 frames after raster cleanup. It compares the raw frame’s RGBA hash with its reviewed baseline and refuses stale repairs or overwrites of existing colour. It preserves all 82,994 previously visible pixels exactly, all rig geometry, joint ownership, durations, stride and lift. The 48 A–D strips retain their hashes. The street spectacle interior uses its adjacent warm lens/face colour; seam repairs use the same anatomical part’s existing palette.

Large and small intended spaces between limbs remain. The audit does **not** assume that all enclosed transparent regions are defects. Pixel additions resolve the identified gaps; eight held poses and angular raster edges remain characteristics of the existing animation.

## Reproduction

Requires Node.js with `@napi-rs/canvas` and Python 3 with Pillow:

```sh
node runs/e/revision-5/render.cjs
python3 runs/e/revision-5/verify.py
python3 runs/e/revision-5/verify_repairs.py
node --test runs/e/revision-5/rig.test.cjs site/tests/playback.test.cjs
python3 runs/e/revision-5/proofs.py
```

`render.cjs` regenerates raw anatomical layers for diagnosis, applies the already-reviewed manifest and exports the 12 strips. Do not regenerate the proposal manifest automatically when geometry changes: re-review all proposed pixels first. Source changes that invalidate the manifest fail export.

`before/` preserves revision 4. `inspection/*-before.png` and `inspection/*-repair-review.png` show all frames before, after and with added pixels highlighted green. `all-frames.png` shows the final result; `repair-audit.json` records all 688,128 RGBA pixel comparisons and remaining composite negative spaces. `pixel-audit.json` retains the silhouette, head, margin and comparison-asset checks. See [independent review](REVIEW.md).

Published and browser-verified on 12 October 2026 at `36bb3c9`. See [browser checks](browser-checks.md) and [live proof](live-walk-f8.png).
