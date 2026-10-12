# Sprite Maker

Comparison updated 12 October 2026: twenty animated sprite viewers comparing Character Animation Creator, Pixel Art Agent Skill, Sprite-gen, Pixel-plugin/Aseprite and OpenAI Game Studio across platformer, arcade street, isometric and top-down RPG views. Every sprite supports walking, running and jumping.

## Open locally

Run `python3 -m http.server 4173 --bind 127.0.0.1 --directory site/dist` from this directory, then open http://127.0.0.1:4173.

- `site/dist/`: webpage and 60 transparent PNG animation strips (384 frames).
- `site/EXPERIMENT.md`: method, constraints, workflow differences and verification notes.
- `runs/brief.json`: agreed character and scenario scope.
- `runs/prompts/`: exact image-generation prompts.
- `runs/source/`: original generated images and shared reference.
- `runs/a/` and `runs/b/`: extracted frames, PNG sheets, GIF/WebP previews and audits.
- `runs/process.py`: reproducible asset extraction and processing. Requires Pillow and the vendored skill scripts. It never synthesises character poses.
- `runs/verification.json`: initial file-integrity audits; these do not prove correct gait.
- `runs/motion-review-agent.md`: independent review of all 144 original frames.
- `runs/revision-2/`: current registration script, measurements, tests, revised proof sheets and independent review. The original generated art and previews remain in the initial run directories.
- `vendor/skills/`: downloaded skill snapshots used for this experiment.

## Motion review — 3 October 2026

Columns A and B use revision 2: pelvis-based registration, one head-size target per character/view, equalised side-view run flight clearance, revised jump arc and phase timing, plus ground-travel and in-place modes with a clickable frame timeline. The review found repeated lead-leg poses in many original walk/run loops. Six attempted replacement sheets were rejected for retaining that problem or introducing other defects; the original six poses are retained. This is an improved comparison, not a production-ready gait pack.

All 24 revised sheets pass the pixel audit; all 144 frames have clear margins. Tests confirm jump floor clearance, apex order and body registration, alongside playback timing and movement controls. Travel distances remain estimates: side walking uses measured first-interval foot displacement, while running and elevated views use reference values. Full-cycle foot locking remains unverified. See [the independent revised review](runs/revision-2/review.md).

## Sprite-gen addition — 3 October 2026

Column C uses the [Sprite-gen workflow](https://github.com/gpwork4u/sprite-gen) at vendored commit `a23e846`: its prompt templates, two three-frame continuation chunks per action, green removal and native shared-scale processing. The app image tool substitutes for the upstream nested Codex CLI transport; all three columns use the same image backend. There are now 36 clips and 216 displayed frames.

C preserves native per-frame placement, with only a constant stage offset per clip. This is intentionally different from the corrected A/B registration. It still has inconsistent leg alternation, loses much of the jump arc during native centring, and the RPG jump drifts to a three-quarter camera. Adding the method does not solve the jitter. See [C’s review](runs/c/REVIEW.md), [all 72 new frames](runs/c/all-frames.png), prompts, raw chunks, native processed frames and `verification.json` in `runs/c/`.

## Pixel-plugin addition — 3 October 2026

D tests pixel-plugin v0.5.0 (`dee3506`) through its actual bundled MCP server and a locally compiled Aseprite1.3.18.6. User-authorised source build and runtime live in `.local-tools/`. This method draws explicitly authored pixels rather than generating raster poses. Four views each have walk/run/jump, with editable Aseprite originals. Total:16 viewers,48 clips,288 frames.

Its fixed templates and alternating support improve registration consistency; the art is simpler and six-pose motion is rigid. An independent review caught and verified a correction to below-sole shin outlines. See [D’s setup, test and review](runs/d/REVIEW.md) and [all72 new frames](runs/d/all-frames.png). No plugin/model quality ranking or continuous zero-slip claim is made.

## Publication status — 3 October 2026

A private Sites project has been registered in `site/.openai/hosting.json`, but it is not yet published. Automatic review rejected sending the temporary publishing credential to the helper running outside the sandbox. The same official helper was then tried inside the sandbox; credential handling was accepted but network DNS was unavailable. No private deployment was completed. Await the user's approval before retrying the rejected external-sandbox credential mechanism. Preserve the local webpage and verify the live project state before any future publishing attempt.

## Pixel-plugin detail pass — 3 October 2026

At the user's request, D now has richer hair and face shading, clearer glasses, fitted shirt shading and folds, denim seams and cuffs, and layered trainers. Fine marks use native pixels, particularly at128px, rather than doubling every detail. All artwork was redrawn through the existing Pixel-plugin MCP/Aseprite workflow.

All72 pose records (feet, root, head anchors, lift and stride) and exported durations are unchanged from the accepted movement. The visual silhouette has slightly fuller thighs and shirt shoulders; movement coordinates remain identical. Original artwork and motion metadata are preserved in `runs/d/detail-pass/before/` in the root project. The updated style remains explicitly authored pixel art; this pass does not claim to reproduce the generated columns' artwork exactly.

## GitHub repository — 3 October 2026

The source and webpage are now uploaded to the public [SuperlabsAU/sprite-tester repository](https://github.com/SuperlabsAU/sprite-tester). See [the local publishing guide](docs/GITHUB.md) for the unified checkout and update procedure. The comparison is now live on [GitHub Pages](https://superlabsau.github.io/sprite-tester/), with automatic deployment for site changes on `main`.

## OpenAI Game Studio addition — 12 October 2026

Column E uses Game Studio 0.1.2's native sprite pipeline: a shipped A seed, a complete six-frame image edit, shared-scale normalisation and native previews. Packaging restores measured source flight offsets and fits the full jump envelope. All 48 existing A–D PNG strips remain unchanged. The tester now contains 20 viewers, 60 clips and 360 frames.

All 72 new frames received an independent review; eight playback/asset tests pass. Desktop and mobile browser checks cover the fifth column, horizontal scrolling and shared playback controls. Generated lead-leg repetition, silhouette-centre drift and early RPG-jump touchdown remain visible; travel distances are estimates. See [E's generation record](runs/e/README.md), [review](runs/e/REVIEW.md) and [browser checks](runs/e/browser-checks.md).

## E limb correction — 12 October 2026

E now uses eight poses per action with explicit anatomical limb alternation, opposing arm swing, fixed near/far overlap and pelvis registration. A pose-guided image generation retry failed and was rejected. The accepted correction combines generated character parts with an authored Canvas rig, clearly labelled on the page. This extends the native Game Studio workflow. All 48 A–D strips remain unchanged; the tester now displays 384 frames. See [revision 2](runs/e/revision-2/README.md) and its independent review for reproduction, verification and remaining cut-out/raster limitations.

## E appearance restoration — 12 October 2026

The rig correction changed the face, hair and proportions too far from A. E now retains A’s native head pixels, uses regenerated clothing/limb atlases anchored only to A, and restores fuller denim, arms and overhead body width. Atlas extraction selects the main connected part to prevent fragments from adjacent rows distorting joints. The corrected eight-frame gait, timings, foot trajectories and jump heights are unchanged. See [revision 3](runs/e/revision-3/README.md), [visual comparison](runs/e/revision-3/appearance-comparison.png) and [independent review](runs/e/revision-3/REVIEW.md).

## E whole-character correction — 12 October 2026

Revision 3 restored the face but retained the wrong body proportions. E now reuses A’s full character artwork with view-specific joints, upright contacts, native clothing volume and correctly sized trainers. Anatomical masks, stable arm lengths, full-length texture donors and shirt backing correct the deformation and shoulder gaps found during independent review. E is explicitly labelled as A artwork with corrected motion. All 96 frames were reviewed; 12 rig/playback tests and raster checks pass. See [revision 4](runs/e/revision-4/README.md), [comparison](runs/e/revision-4/appearance-comparison.png) and [review](runs/e/revision-4/REVIEW.md).

### E pixel gap cleanup — 12 October 2026

[Revision 5](runs/e/revision-5/README.md) inspects all 96 E frames and applies 589 reviewed pixel additions at spectacle, clothing and joint gaps. All original visible pixels, motion and A–D comparisons are preserved. The exporter uses a hash-guarded exact repair manifest; the audit checks all 688,128 RGBA pixels. Before/after/added-pixel sheets and independent review are included.

## Out of Office RPG — 12 October 2026

[Play the office RPG](https://superlabsau.github.io/sprite-tester/office-rpg/). One furnished office floor, wandering coworkers, four turn-based encounters, coffee recovery and a complete clock-off ending. Collect three departmental approvals, defeat Brenda and escape through the lift. Keyboard: arrows/WASD, Shift to run, E/Space to interact; mouse destinations and phone controls are supported. Progress saves locally.

The game reuses the approved E character artwork with role colour variants. Phaser 3.90.0 is bundled locally under its MIT licence. No build or account is required. Locally visit `/office-rpg/` on the existing server. Run `node --test site/tests/*.test.*` for rules, input and Sprite Lab checks. See the [design](docs/office-rpg/DESIGN.md), [playtest](docs/office-rpg/PLAYTEST.md) and [release record](docs/office-rpg/RELEASE.md).
