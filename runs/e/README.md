Current appearance restoration (12 October 2026): [revision 3](revision-3/README.md) retains A’s native head artwork and generated clothing textures around the corrected eight-pose rig. Earlier runs below are preserved.

# E · OpenAI Game Studio

**Current output:** [revision 2](revision-2/README.md) applies an authored eight-pose rig correction to generated parts. The six-frame process below is the original experiment, preserved for comparison; `package.py` rebuilds that historical result.

Added 12 October 2026 using OpenAI's [Game Studio](https://github.com/openai/plugins/tree/main/plugins/game-studio) `sprite-pipeline` skill, plugin version 0.1.2. The complete installed bundle is retained in `../../vendor/skills/game-studio`; local installer cache identifier `bd2122cb` is a cache version, not a verified Git commit. The upstream manifest declares MIT licensing; its metadata and supplied files are preserved.

The same character brief, four views, output cells, three actions and six-frame budget are used. E adds 12 clips / 72 frames, bringing the tester to 20 viewers / 60 clips / 360 frames. The image backend is the same built-in generator used for A–C; this compares workflows, not different models.

## Generation

1. Extract the first shipped A walk frame for each view as the approved seed. `seeds/manifest.json` records its bounds; these are the revised, currently displayed A assets.
2. Run the unmodified `build_sprite_edit_canvas.py` with six 256 px slots on a 1536 px square canvas. Keep `reference/*-square.png`, then crop the transparent horizontal slot band to `reference/*.png` (1536 × 256). This crop removes unused canvas, without changing the seed artwork.
3. Request each complete six-frame animation in a single image edit using that view's reference canvas. The exact twelve requests are in `prompts/`; untouched returned RGBA strips are in `raw/` (2172 × 724). No poses are drawn by local code.
4. Run the upstream shared-scale, bottom-centre normaliser. Use the seed as a scale anchor; do not lock frame 1 to a walking pose for every action. Preserve the native frames in `native/`.
5. Package the frames into the original 64 px or 128 px cell. For run/jump only, restore the vertical sole-bottom displacement measured in the raw strip, because native bottom alignment otherwise erases flight. Fit the complete flight envelope with one scale per strip to avoid clipping; no synthetic jump curve is added. Walk retains native bottom alignment.
6. Run the upstream preview renderer and inspect all 72 final frames. Ground travel is an explicit comparison estimate, with `calibrated: false` in motion metadata.

## Reproduce packaging

From the repository root, with Python 3 and Pillow installed:

```sh
python3 runs/e/package.py
node --test site/tests/playback.test.cjs
```

This rebuilds E from the retained raw strips and updates E's records in `site/dist/assets/motion.json`. It asserts that all 48 existing A–D PNG strips are unchanged. Image generation is not deterministic; the retained raw sources make the packaging reproducible without another generation request.

## Evidence and limits

- `verification.json`: raw/final bounds, shared scales, measured flight lifts, durations and hashes of the 48 existing strips.
- `all-frames.png`, `preview-*.png`: visual proof sheets from the packaged frames.
- `REVIEW.md`: independent frame-by-frame review, including source and registration limitations.
- `browser-checks.md`: actual desktop/mobile layout, shared-control and live deployment checks.
- `live-page.png`: published five-column jump-apex comparison.

Review found no empty frame, clipped art or mismatched exported cell. Repeated lead-leg poses, silhouette-centre drift and modest cross-action scale differences remain. RPG jump touches down early at frame 5 in the generated source. Shared scaling does not establish a locked body root, correct alternating gait or calibrated ground travel. These limitations are shown in the page's comparison notes.
