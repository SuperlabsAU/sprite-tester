# E revision 2 independent review

Reviewed 12 October 2026. Inspected the complete 96-frame contact sheet, all four generated 12-part atlases, extracted parts, `prepare_parts.py`, `rig.cjs`, `render.cjs`, `verification.json`, shipped E strips and current site integration. No sprites or implementation code were changed by this review.

**The revision addresses the repeated lead-leg and redraw-jitter problems through an explicit rig.** It is a disclosed hybrid: generated textures supply appearance, while authored anatomical joints, layering and timing supply motion. It should not be presented as the unchanged native Game Studio strip generator. The rejected prompt-only pilot is retained separately.

## Movement and occlusion

For all four views, walk/run F1 puts the anatomical right foot forward, while F5 puts the anatomical left foot forward. The other leg reverses its forward/back position. The corresponding arm swings backwards, with opposite arm swinging forwards. The contacts are no longer two copies of the same named lead leg.

In `render.cjs`, far left arm/leg draw before the near right leg; the torso covers the hips, near right arm draws over torso, and head draws last. Ownership does not change when the swing reverses. The side-view atlases provide separately shaded right/left limb textures, so the renderer preserves that distinction rather than mirroring one complete sprite. At contacts, the visual result is readable; at passing poses, projected limbs partly overlap and can become difficult to distinguish at 64 px.

| Clip | F1–F8 review |
|---|---|
| Platform walk | Right contact; right down; left passing; right up; left contact; left down; right passing; left up. Fixed right/near limb remains in front; head texture is unchanged. |
| Platform run | Right contact; right stance; left passing; flight; left contact; left stance; right passing; flight. Two unsupported flight phases are F4/F8. Sole-bottom positions are 58/58/58/55/58/58/58/55 px. |
| Platform jump | Crouch; launch; rise; higher rise; apex tuck; fall; lower fall; landing. Sole bottoms 58/58/52/46/40/46/52/58 px. F7 remains above floor. |
| Street walk | Same eight alternating walk phases at double-size output. Fixed limb ownership and stable face/torso artwork are more legible than compact side view. |
| Street run | Same eight alternating run phases. F4/F8 clear the sole baseline by 6 px; F1/F5 exchange named contact legs and arm swings. |
| Street jump | Crouch/launch/rise/rise/apex/fall/fall/landing. Sole bottoms 122/122/110/98/86/98/110/122 px; descent continues through F7. |
| Isometric walk | Same eight alternating walk phases, projected southeast. Foot height varies with projected depth, so a single horizontal sole baseline is inappropriate. Body registration stays fixed. |
| Isometric run | Named contacts exchange at F1/F5. F4/F8 are flight with both support flags false; projected shoe depths differ by side. Passing knees remain compact and angular. |
| Isometric jump | Clear rise/tuck/fall sequence; sole bottoms 55/55/50/45/40/45/50/55 px. Camera and head artwork remain unchanged. |
| RPG walk | Right/left contact exchange follows the screen’s vertical travel axis, with distinct lateral leg ownership. Passing legs are foreshortened and can overlap behind the torso. |
| RPG run | Right contact; stance; left passing; flight; left contact; stance; right passing; flight. Camera remains south-facing; fixed head/torso avoid independent redraw variation. |
| RPG jump | Crouch/launch/rise/rise/apex/fall/fall/landing. Sole bottoms 54/54/49/45/44/45/49/54 px. F7 is airborne, correcting the earlier candidate’s F5 touchdown. |

Jump lift records are `[0,0,4,8,12,8,4,0]` in 64 px views, doubled for street. Maximum lift is F5. Crouch/tuck offsets mean the head has the same top position through F4–F6, although the feet continue rising to F5 then descend. This is an authored compact apex, not a failed elevation curve. Crouch F1 and landing F8 are pixel-identical in all four jump strips, giving a consistent loop seam.

## Registration, anatomy and remaining limitations

- Root x is exactly 32 px in every 64 px frame and 64 px in every street frame. There is no silhouette-centre recropping. The same head and torso textures retain fixed draw dimensions throughout every action; no independent frame redraw or random body scale is introduced.
- Walk bob repeats deliberately over both half-cycles: 64 px platform head y is 18.5/19.5/17.5/16.5, repeated at F5–F8. Run head y is 19.5/19.5/19.5/16.5, repeated. The 2 px walk and 3 px run F8→F1 vertical changes are expected held-pose transitions, not a mathematically smooth seam.
- Model thigh/shin lengths remain 11 units each. Joints stay connected in the skeleton. The textures are fitted to each projected segment, so their folds, outline widths and shapes deform as a segment rotates or shortens in projection. This is cut-out animation; it does not reproduce individually drawn cloth and limb foreshortening.
- Arms use restrained, angular motion and the jump torso stays upright. Passing silhouettes can look narrow; run poses remain somewhat mechanical. Eight held frames do not provide continuous articulation.
- Canvas rotation/subpixel placement and generated source edges leave partial-alpha pixels. This is transparent raster artwork, not a binary-alpha, palette-limited pixel pipeline. Fixed textures reduce redraw jitter but do not remove every edge shimmer or aliasing change.
- The camera bases stay fixed. Isometric and RPG artwork read as stylised elevated views, with limb projection controlled mathematically but head/torso drawn as fixed textured rectangles. They are not a physically exact rotating 3D character.
- The replacement part atlases preserve the brief’s hair/glasses/shirt/jeans/shoes, but alter the earlier complete-strip character’s face and proportions. The corrected hybrid should be compared as revised artwork, not claimed pixel-identical to the original seed.

The initial diagnostic naming issue was resolved: jump F1/F2/F8 now record `legs.*.stance: true` when foot z and body lift are both zero. Airborne jump frames record false. The rig test explicitly asserts support state for both legs across all eight jump phases. This changes diagnostic records without changing the poses.

## File and distance verification

Bundled Python/Pillow independently confirmed every one of the 96 saved RGBA frames exactly matches its shipped strip cell. All strips have eight cells: 512×64, or 1024×128 for street. Every frame is non-empty and has transparent clearance even when **all non-zero alpha** is counted. Minimum top clearance is 5 px; minimum bottom clearance is 5 px; minimum side clearance is 15 px. No clipped head, hand, shoe or limb was found. All 48 A–D strip SHA-256 hashes match `baseline-hashes.json`.

| View | Authored walk stride per 720 ms cycle | Authored run stride per 540 ms cycle |
|---|---|---|
| Platform | (32, 0) native px | (53.333, 0) native px |
| Street | (64, 0) native px | (106.667, 0) native px |
| Isometric | (27.712, 13.856) native px | (46.187, 23.093) native px |
| RPG | (0, 19.84) native px | (0, 33.067) native px |

The rig tests independently exercise each view, both actions and both named feet: adjacent sampled stance-joint displacements cancel one eighth of the configured cycle stride. This supports sampled trajectory consistency, not zero slip at raster shoe edges. The displayed metadata rounds stride to three decimals; any rounding error is tiny compared with pixel quantisation and movement during held poses. `calibrated` remains false. Jump travel remains (0,0); jump durations total 680 ms.

`node --test site/tests/playback.test.cjs runs/e/revision-2/rig.test.cjs` passed all 11 tests. The three rig tests cover named leg exchange, counter-swing, fixed ownership, bone lengths, sampled stance displacement, run flight and jump descent/landing. The eight site tests cover complete sheets/metadata, timing/seams, controls, reduced motion and WebMCP validation.

## Site integration audit

The source loads eight-frame E strips alongside unchanged six-frame A–D strips. The shared clock follows `e-platform-*`; custom phase labels feed the eight-button timeline. Per-card labels display the actual sampled F#/count, avoiding a false common frame number. All methods retain equal action cycle totals (720/540/680 ms), so differing frame counts remain synchronised by elapsed time. WebMCP accepts E frames 1–8 and rejects 9. Hybrid method copy discloses generated parts, an authored correction, fixed layering and held-frame limitations.

The initial publication copy inconsistency was resolved: the first About paragraph now explicitly says A–D use six transparent frames per action and E uses eight. The site tests mock DOM controls; this review does not claim live browser layout or published-page verification.

The resolved copy and contact-record changes were rechecked, and all 11 tests pass again. No blocking sprite geometry, missing leg exchange, broken occlusion ownership, clipping or jump landing failure was found. The disclosed cut-out/raster limitations remain relevant; this verification supports sampled rig behaviour rather than a complete physical contact model.
