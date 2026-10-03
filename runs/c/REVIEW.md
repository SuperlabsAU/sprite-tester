# Sprite-gen review — 3 October 2026

Column C adds four characters, twelve clips and 72 frames. Source: [gpwork4u/sprite-gen](https://github.com/gpwork4u/sprite-gen), snapshot `a23e846`. `workflow.py` retains exact prompts and spec, calls upstream templates and processing, and substitutes the app image tool for nested Codex CLI generation. Second chunks reference the canonical identity and previous raw chunk. No generated poses were redrawn.

## Independent review

The motion-review agent inspected all 72 frames and checked served pixels against upstream processed output. All frames match the native output plus the declared action-wide vertical offset; no material packaging bug was found. Every frame retains at least four pixels of transparent edge margin.

The native method does not resolve the jitter. Walks often repeat the same leading leg; RPG walking is almost static. Runs bob and shift silhouette centres. Isometric output often reads as an ordinary three-quarter side camera. The RPG jump turns from south towards a three-quarter camera.

Native centring removes much of the jump trajectory: the platform crouch floats seven pixels above the configured floor while rise touches it; street crouch floats sixteen pixels and apex clears only two. These are method failures retained for comparison, not physically correct jumps. A/B contain previous registration corrections, so this is not a controlled ranking of unmodified workflows.

Scale is shared within each three-frame chunk, not across the whole six-frame animation. Chunk boundary size differences can therefore survive. Soft alpha and Lanczos resampling are preserved, so C also looks softer than the pixel-quantised A/B output. No palette or pixel-perfect claim is made for C.

## Measurements

Sole positions are native pixels, threshold alpha>=100. Floors are y58 for 64px and y122 for128px. All QC size-outlier warnings are retained; changing widths may reflect genuine pose changes rather than clipping. Pixel-preservation checks establish packaging integrity only.

| Clip | Sole y, frames1–6 | Upstream warnings |
|---|---|---|
| c-platform-walk | 58, 58, 58, 58, 58, 58 | 2 |
| c-platform-run | 57, 57, 58, 55, 57, 58 | 2 |
| c-platform-jump | 51, 56, 58, 53, 58, 52 | 2 |
| c-street-walk | 122, 121, 122, 121, 122, 121 | 0 |
| c-street-run | 121, 119, 122, 114, 121, 122 | 1 |
| c-street-jump | 106, 117, 122, 120, 122, 109 | 2 |
| c-isometric-walk | 58, 58, 58, 58, 58, 57 | 0 |
| c-isometric-run | 58, 57, 57, 54, 57, 58 | 1 |
| c-isometric-jump | 52, 57, 58, 54, 58, 53 | 1 |
| c-rpg-walk | 57, 57, 58, 58, 58, 58 | 0 |
| c-rpg-run | 57, 56, 58, 51, 57, 58 | 1 |
| c-rpg-jump | 51, 55, 58, 57, 58, 54 | 2 |

Ground distances remain reference estimates with `calibrated:false`; no full-cycle foot-lock calibration is claimed. All columns share the existing action timing.

## Verification and reproduction

- `python runs/c/package.py` concatenates native outputs and applies a constant stage offset; asserts alpha is preserved, all frames exist and dimensions match.
- All36 served PNG strips contain six non-empty correctly sized frames (216 total); A/B strips are unchanged.
- `node --test tests/playback.test.cjs` from `site`: seven playback tests pass.
- Live browser: all18 action/frame combinations show twelve synchronised viewers, without asset errors. Three-column layout has no horizontal overflow at558px.
- Inputs and native processor outputs are stored by view/action/chunk. `all-frames.png` shows all72 C frames; `verification.json` stores bounds, warnings and stage offsets.
