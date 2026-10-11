# Method E movement review

Reviewed 12 October 2026. Evidence: `all-frames.png`, all twelve `raw/*.png` strips and `preview-*.png` sheets, `package.py`, `verification.json`, `seeds/manifest.json`, the native `normalize_sprite_strip.py`, and `site/dist/assets/motion.json`. All 12 clips / 72 frames were inspected. This is a candidate-output comparison, not a production gait certification.

## Findings relevant before publication

- **Generated gait limitation:** platform, street and isometric walks repeat the same broad lead-leg stance at F1/F4 and similar recovery poses at F2/F5. Their runs repeat contact F1/F4 and flight F3/F6 without a convincing exchange of the near/far legs. Repacking cannot supply missing opposite-leg anatomy. Keep this limitation visible and avoid claiming correct six-phase alternation or foot locking.
- **Generated early touchdown:** RPG jump F5 is already at the floor, although the shared timeline calls it “Fall”. Its raw F5 bottom equals the raw landing bottom, and `verification.json` records lift `[0,0,12,16,0,0]`. The package preserves this; it did not accidentally remove F5 flight.
- **Native registration limitation:** the normaliser centres each cropped whole silhouette horizontally and bottom-aligns it. Changing arm/leg spread therefore moves the body relative to the cell. Street jump shows the largest lateral change: a rough upper-head centre proxy shifts from about +12.7 px relative to silhouette centre at F2 to −2.2 px at F4. Some of that is intended leaning; the output does not distinguish a stable body root from silhouette-centre movement. An optional body-anchor registration pass would alter native output and must be disclosed if used.
- **Cross-action scale limitation:** the package chooses one shared scale per action strip, not one scale across all actions. This retains within-strip proportions but gives modest action-switch size changes: the upper fifth of the street head silhouette is about 22 px wide in walk and 23–24 px in run/jump; isometric walk is about 15 px, jump 13–14 px. These are approximate alpha-width proxies, not anatomical calibration. RPG jump’s wider full silhouette mostly comes from arms and crouching; its head proxy remains about 15 px across all three actions.

No empty frame, visibly severed limb, transparent-background failure, wrong sheet geometry or packaged-edge clipping was found. Identity remains recognisable: brown hair, black glasses, black shirt, blue jeans and grey/white shoes. Platform remains right-facing side view; street remains right-facing three-quarter side view. Isometric remains southeast, but reads as a shallow elevated view rather than a rigorously controlled 2:1 camera. RPG consistently faces south with prominent head-top/foreshortening. No RPG jump turn to southeast was found.

## Frame-by-frame observations

Each sequence below describes F1 → F6. “Contact” and “flight” describe visible sole clearance, not physically measured support or centre-of-mass motion.

| Clip | Six-frame observation | Assessment |
|---|---|---|
| Platform walk | broad split stride; rear heel raised; bent crossing recovery; broad split stride again; rear heel raised again; crossing recovery again | Readable walking poses, weak opposite-leg exchange. Head height stays at y13. |
| Platform run | split contact; knee passing; wide airborne stride; similar split contact; similar knee passing; similar airborne stride | F3/F6 sole clearance 7/5 px; repeated lead-leg anatomy. Head top y13–14, so much clearance comes from leg tuck. |
| Platform jump | crouch; extending launch on floor; rise with tucked legs; highest compact pose; extending descent; crouched landing | Clear arc, apex F4; sole lifts 0/0/10/18/7/0 px. |
| Street walk | split stride; rear-foot recovery; similar rear-foot recovery; split stride again; recovery again; raised forward knee | F2/F3 and F2/F5 repeat similar recovery; alternate lead not established. Head top stable y31. |
| Street run | split contact; knee passing; airborne stride; split contact again; knee passing again; airborne stride again | F3/F6 clearance 14/14 px; readable flight but repeated lead silhouettes. |
| Street jump | crouch; forward lean/extension on floor; rising bent-knee pose; highest tucked pose; extending descent; bent-knee landing | Arc preserved, apex F4; lifts 0/0/10/46/12/0 px. Abrupt F3→F4 rise and lateral body movement remain visible. |
| Isometric walk | split projected stride; rear heel raised; knee crossing; similar split stride; raised heel; crossing recovery | Facing remains southeast; repeated lead-leg pattern and modest shoe/denim redraw variation. |
| Isometric run | split projected stride; knee recovery; tucked airborne stride; similar split stride; bent recovery; tucked airborne stride | F3/F6 clearance 8/7 px; contact phases are uneven (F1/F2 1 px, F4 0, F5 3). These lift differences exist in raw output. |
| Isometric jump | crouch; extension/launch; rise with knees bent; compact apex; descending bent legs; crouched landing | Apex F4; lifts 0/2/10/19/7/0 px. F2 is already slightly clear of the floor. |
| RPG walk | screen-right foot extended; screen-left extended; screen-right extended; screen-left extended; screen-left extended again; screen-right extended | More visible leg exchange than side views, but uneven sequence and repeated F4/F5 plus F6→F1 lead. Bottom alignment produces y17–19 head bob. |
| RPG run | screen-right extended; screen-left extended; compact airborne feet; screen-right extended again; screen-left extended; airborne with asymmetric feet | Arm/leg changes read better frontally; F3/F6 lifts 6/5 px. Flight poses are unequal and do not establish a fully calibrated run. |
| RPG jump | wide crouch; asymmetric extension; compact rise; highest compact pose; extended leg already on floor; wide crouched landing | Apex F4; F5 early touchdown makes descent abrupt. South-facing camera stays recognisable. |

## Packaging and distance checks

Read-only verification with bundled Python/Pillow confirmed that every `frames/<clip>/01–06.png` is byte-for-byte identical in RGBA pixels to its corresponding cell in the shipped `e-<clip>.png` strip. Each strip is 384×64, or 768×128 for street, with transparent pixels. All 48 A–D PNG SHA-256 hashes still match `verification.json`.

The package uses the actual upstream normaliser, a single nearest-neighbour scale per strip, and restores the source’s measured sole-bottom offset for run/jump. It does not draw replacement poses or invent an apex curve. All jump maxima occur at F4; F1/F6 meet baseline 59 (64 px cells) or 123 (street). Minimum measured top clearance is 3 px for street/isometric apex and 4 px for platform; all frames retain side and bottom margins. The 3 px apex margin is tight but presently unclipped.

Walk bottom alignment deliberately discards raw foot-bottom variation. It also converts changes in projected leg length into small body-height shifts, notably RPG walk. Thus “shared scale” does not mean a locked body root or zero jitter.

| View | Walk distance per 720 ms cycle | Run distance per 540 ms cycle |
|---|---|---|
| Platform | (40, 0) native px | (64, 0) native px |
| Street | (80, 0) native px | (128, 0) native px |
| Isometric | (24, 12) native px | (40, 20) native px |
| RPG | (0, 24) native px | (0, 40) native px |

All twelve E records set `calibrated: false`; `package.py:81–85` assigns these comparison estimates without tracking stance feet. Jump distance is (0, 0), with timing 140/70/100/140/100/130 ms. Moving the ground at those estimates cannot prove planted feet or travel accuracy. Sole lift is not a measured real-world jump height.

## Site integration

The final source integration was rechecked after implementation. `site/dist/app.js:37` now creates A–E viewers in all four views (20 canvases) and loads all three actions per viewer, including the 12 E sheets. The page title, counts, method heading, source link, explanatory copy and WebMCP description include E. The CSS uses five columns inside a horizontally scrollable board for narrow panels. The E explanation explicitly discloses silhouette-centre drift, repeated gait poses and estimated travel distance.

`node --test site/tests/playback.test.cjs` passed all eight tests. These cover 60 complete six-frame sheets with matching metadata, E apex/endpoint lift records, timing and cycle seams, speed/pause/in-place travel, reduced-motion initial state and WebMCP frame validation. The browser-control test uses mocked DOM elements; this review does not claim visual browser layout verification or a live publication check. No remaining asset-loading or metadata integration blocker was found in the source audit.
