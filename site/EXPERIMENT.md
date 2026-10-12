# Sprite skill comparison — updated 12 October 2026

Current output: twenty animated sprite viewers, five workflows across four views. Every viewer contains walk, run and jump (A–D six frames/action, E eight: 384 final frames). The original eight-viewer comparison was expanded at the user’s request.

Character: adult male with rectangular black glasses, short dark hair, black T-shirt, blue jeans and grey/white sneakers. A shared image-generated identity reference grounds A–C; E uses shipped A frames as view-specific seeds. A–C and E use the built-in image generator. D uses explicitly authored pixel poses through Pixel-plugin/Aseprite.

## Scope

| View | Output cell | Direction |
|---|---|---|
| Platformer | 64 × 64 | Right |
| Arcade street | 128 × 128 | Right |
| Isometric | 64 × 64 | Southeast |
| Top-down RPG | 64 × 64 | South |

The cell sizes are packaged output sizes. Raw image generation returns larger raster strips prompted for those pixel budgets, then the importer reduces them with nearest-neighbour sampling. These are not a benchmark of native-resolution generation or full directional asset packs.

## Workflows

- A: [Character Animation Creator](https://github.com/tachikomared/character-animation-creator-skill). Uses per-action strips, identity and pose guidance, bundled assembly, pixel snapping, validation, motion audit and preview export. Adaptive palette: 32 colours for 64px cells, 48 for the detailed 128px cells.
- B: [Pixel Art Agent Skill](https://github.com/ervareza/agent-skill-pixel-art), v4.3.0. Uses pose-to-pose animation guidance, a palette locked before generation to DawnBringer 32, bundled palette remapping, atlas packing and quality audit. Its strips are generated, processed and audited sequentially.

Both use the same six-frame budget, character reference and image generator. The actual generator is not different between columns. Variation includes generation randomness and workflow guidance; this first sample does not establish a statistical ranking.

## Import correction

The A assembler is run and its original results retained for diagnosis. Its independent fitting and centring would change size between crouched and extended poses and remove jump elevation. A shared component importer therefore preserves one scale and one ground line across a strip. This same geometry step is applied to B for comparability. It performs extraction, nearest-neighbour fitting, binary-alpha thresholding and isolated-pixel cleanup only. Character poses remain generated artwork.

Local experiment records live in `../runs`: `brief.json`, all 24 prompts, original source strips, processing script, individual frames, final sheets, QA reports and GIF/WebP previews. The vendored skill snapshots live in `../vendor/skills`. The published site contains only the final 24 PNG strips and the viewer.

## Initial validation

- All 24 initial sheets passed file/pixel geometry checks; all 144 cells contained artwork. The initial motion audit measured image differences but did not establish correct limb alternation or foot locking.
- Each pair shared the same action clock and frame index. Initial timing was walk 120ms, run 90ms, jump 160ms per frame.
- Browser checks cover all eight viewers, Walk/Run/Jump switching, pause/play, stepping and speed selection. Reduced-motion users start paused.
- Visual judgement remains with the viewer. Some walk poses and camera angles are approximate, and temporal consistency would need further art direction before production use.

## Motion revision 2 — 3 October 2026

An independent agent reviewed every original frame and the revised results. The review identified whole-silhouette centring drift, inconsistent action scale, uneven run flight clearance, uniform jump timing and repeated lead-leg poses. Replacement image generation failed the visual review; no rejected replacement art is shipped. Six original poses per action remain.

Current assets are mechanically registered by an upper-denim landmark, excluding blue-tinted black outlines. Each character/view shares an approximate median hair-width target across actions; action-wide nearest-neighbour scaling preserves within-action pose proportions. Side-view support soles align to the ground and the two run flight phases have equal clearance. Jump rise/apex/fall use a hip-based arc with an explicit above-ground constraint; crouch, launch and landing meet the ground. Elevated locomotion retains projected depth instead of floor-aligning every foot.

Jump durations are now 140/70/100/140/100/130ms (680ms/cycle). Walk remains 6×120ms; run remains 6×90ms. The page adds a frame timeline, moving-ground travel, an in-place option and native-pixel distance readouts, driven by `dist/assets/motion.json`. Side-walk distances42/39/36/60px for A-platform/B-platform/A-street/B-street estimate only the first contact interval. Run uses1.5× that distance percycle; iso uses24,12 walk /36,18 run, RPG0,18 walk /0,27 run. These are comparison references; no full-cycle calibration or zero-slip claim is made.

Verification: all24 current strips pass alpha/palette/orphan/grid audits, all144 frames retain transparent margins, body-anchor error is≤0.5 native pixels, and all jump feet clear the floor in flight. Three registration tests and seven playback tests pass. Browser checks step all18 action/frame combinations across eight viewers. Source leg alternation, some camera drift and some cross-action body-proportion differences remain unresolved; they need reliable redrawn poses before production use.

Reproduce geometry with `../runs/revision-2/registration.py` using Pillow. Initial sources/previews remain unchanged; current proof sheets, numeric records, pixel audits, generation rejections and independent review are in `../runs/revision-2/`. Run browser tests with `node --test tests/playback.test.cjs` from this Site directory.

## Sprite-gen column C — 3 October 2026

Source: https://github.com/gpwork4u/sprite-gen, vendored revision `a23e846`. The adapter uses the upstream templates and unmodified `process_sheet` pipeline. Each six-frame action is generated as two three-frame chunks. Both chunks use the canonical identity reference; chunk two also references the preceding raw sheet. Generation runs through the app image tool instead of invoking the upstream nested Codex CLI. The same image backend is used for all three columns.

The native processor crops and centres each pose and applies one scale per chunk. It uses soft alpha and Lanczos resizing; C receives no DB32 remap, binary-alpha conversion or A/B pelvis correction. Packaging concatenates both chunks and applies one constant vertical offset per action to fit the stage, with an alpha-preservation assertion. Ground travel remains a reference estimate, not a foot-lock calibration.

Visual review of all 72 new frames finds repeated lead-leg poses, variation across chunk boundaries, and a weak jump arc caused by native pose centring. The RPG jump camera also turns towards southeast. These shortcomings remain visible in the comparison. Upstream QC size-outlier warnings are retained in `../runs/c/verification.json`; they are not silently treated as passes. See `../runs/c/REVIEW.md` for measurements and reproducibility.

## Pixel-plugin / Aseprite column D — 3 October 2026

The user requested this method and authorised building Aseprite locally. Tested pixel-plugin v0.5.0 (`dee3506`) with its unmodified bundled arm64 MCP server and Aseprite1.3.18.6 compiled from official source. The agent supplies explicit pixel poses through draw_pixels; actual MCP tools create frames, set durations/tags and export the PNG sheets. The host is a local stdio adapter instead of Claude Code.

D differs substantially from A–C: deterministic pixel geometry and fixed templates, with no image-generation backend or post-export registration. Its artwork is simpler and six-pose motion is rigid. The intent is to test control over limb alternation, body registration and camera consistency. Running has flight phases3/6; jumping peaks at4. Isometric projection is2:1. Travel follows authored foot trajectories; sampled anchors cancel configured movement, but raster rounding and frame holds still allow sliding.

Independent review identified shin outlines below the soles; corrected by ending strokes at the ankle. Final review verified all72 corrected exports match served pixels with no clipping or remaining below-sole ink. Full provenance, setup caveats, editable originals, MCP logs, measurements and proof sheet: `../runs/d/REVIEW.md`. All48 current strips/288 frames are available; A–C PNGs are unchanged. Seven playback tests pass.

## Hosting

Private Sites project: `appgprj_6ac08d7982e08191b8656c6f3fa55719`. Read `.openai/hosting.json` and verify the live project before future publication. Preserve its audience.

## Pixel-plugin detail pass — 3 October 2026

At the user's request, D now has richer hair and face shading, clearer glasses, fitted shirt shading and folds, denim seams and cuffs, and layered trainers. Fine marks use native pixels, particularly at128px, rather than doubling every detail. All artwork was redrawn through the existing Pixel-plugin MCP/Aseprite workflow.

All72 pose records (feet, root, head anchors, lift and stride) and exported durations are unchanged from the accepted movement. The visual silhouette has slightly fuller thighs and shirt shoulders; movement coordinates remain identical. Original artwork and motion metadata are preserved in `runs/d/detail-pass/before/` in the root project. The updated style remains explicitly authored pixel art; this pass does not claim to reproduce the generated columns' artwork exactly.

## OpenAI Game Studio column E — 12 October 2026

Game Studio 0.1.2's sprite-pipeline skill builds a transparent reference canvas from each shipped A walk seed, generates a complete six-frame strip in one image edit, then runs the upstream shared-scale, bottom-centre normaliser and preview renderer. E uses the same image backend as A–C; this is a workflow comparison. No frame-1 lock is applied because a walking seed is not the opening run/jump pose.

The upstream scripts remain unmodified in `../vendor/skills/game-studio/`. `../runs/e/package.py` uses one scale per action, fits the full airborne envelope and restores only measured raw vertical offsets after native bottom alignment. No replacement poses or synthetic jump arc are drawn. Walk keeps native bottom alignment; ground distances are comparison estimates marked uncalibrated. All 48 A–D PNG strips are unchanged.

All 72 new frames were independently reviewed. Repeated lead-leg silhouettes, native whole-silhouette centring drift, modest action-switch scale differences and RPG jump's early frame-5 touchdown remain visible and are disclosed on the page. No empty frame, clipping or packaged/source mismatch was found. Eight tests pass; actual browser checks covered all 20 sprites, jump/run selection, pause, frame selection, speed, in-place mode and horizontal scrolling at desktop/mobile widths.

The current public site contains 60 PNG strips and `motion.json` revision 6. Full prompts, raw strips, native and packaged frames, proof sheets, measurements and review: [E's record](../runs/e/README.md). Reproduce with `python3 runs/e/package.py` from the repository root.

## E limb correction — 12 October 2026

The user requested applying explicit contact/arm phases, depth ownership and body registration. A pose-guided full-strip retry still repeated the lead leg and was rejected. The accepted E correction uses image-generated part atlases and an authored Canvas limb rig: eight poses/action, constant head/torso art, opposite R/L contacts at F1/F5, counter-arm swing, fixed near/far layers, sampled stance-trajectory travel, and jump descent through F7 before landing F8. This hybrid extends Game Studio's native pipeline and changes the appearance somewhat.

Cycle durations remain 720/540/680ms; the shared timeline follows E's eight phases and each card shows its own frame/count. A–D's 48 PNGs are unchanged. Eleven local tests pass and all 96 E frames retain transparent margins. Cut-out joints, raster rotation, held-frame movement and simplified biomechanics remain visible; zero jitter/foot slip is not claimed. Generation, rejected candidate, prior output, rig, measurements, review and reproduction are in [revision 2](../runs/e/revision-2/README.md).
