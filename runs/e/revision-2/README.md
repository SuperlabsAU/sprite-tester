# E revision 2 — limb and registration correction

12 October 2026. User requested applying walk-cycle anatomy, limb overlap and jitter-reduction guidance to current sprites. Scope: E, all four views and three actions; A–D remain unchanged. Current comparison: 20 viewers, 60 clips, 384 frames (A–D 288, E 96).

## Root cause and chosen correction

Original E whole-strip generation repeats the same lead leg and arm. Native bottom-centre placement also lets silhouette changes move the body. A new eight-frame request with an explicit colour-coded pose/occlusion guide still repeated the lead leg; it was rejected, preserved in `raw/rejected-platform-walk.png`, and never shipped.

We therefore extend the Game Studio workflow with an explicit cut-out rig. Imagegen edits the accepted E character reference into four 12-part transparent atlases. It retains the brief and detail family, although the regenerated part art changes the face/silhouette modestly. Exact prompts, raw atlases and pose guides are retained. `prepare_parts.py` extracts the part cells. `rig.cjs` defines anatomical joints and `render.cjs` uses standard Canvas transforms to pose those textures. This is generated artwork plus authored motion, not an unmodified Game Studio full-strip result.

## Motion contract

- Eight poses/action. Walk contacts at F1/F5 exchange right and left support; arms swing opposite their anatomical legs. Left/right refer to the character, not screen coordinates.
- Fixed ownership for side cameras: anatomical right is near, left is far. Draw order: far arm, far leg, near leg, torso, near arm, head. Swing direction does not swap depth. Elevated cameras retain their generated face direction and projected joint layout.
- One head/torso texture and size per camera across all actions. No silhouette fitting or per-frame recentering. Pelvis X remains stable; walking bob, run flight and jump lift are explicit.
- Two constant 11-unit leg segments use inverse kinematics; supporting feet follow linear backward paths. Configured travel cancels that displacement at sampled joints. This does not certify continuous foot locking: held frames, pixel rounding, shoe silhouettes and segment joins can still slide or shimmer.
- Run includes unsupported flight at F4/F8. Jump apex is F5; both descending F6/F7 stay airborne, F8 lands. Rise/descent replace the generated source's early F5 touchdown.
- Walk/run/jump cycle durations remain 720/540/680ms. E's eight-frame timeline controls the shared clock; each A–D card reports its own sampled frame from its original six-frame sequence.

## Reproduce

Requires Python 3/Pillow and Node.js with `@napi-rs/canvas` installed. The original prepared parts and previous E strips are retained; rerunning preparation refreshes `before/`, so preserve the accepted baseline before doing so.

```sh
python3 runs/e/revision-2/prepare_parts.py
node runs/e/revision-2/render.cjs
python3 runs/e/revision-2/verify.py
node --test runs/e/revision-2/rig.test.cjs site/tests/playback.test.cjs
```

Set `NODE_PATH` to your dependency directory if Canvas is provided outside the repository. No machine runtime paths or credentials are required by the renderer. Do not rerun historical `runs/e/package.py` to build this revision: that intentionally rebuilds the original six-frame E result.

## Verification

All 96 output frames retain transparent margins. All 48 A–D PNG hashes match `baseline-hashes.json`. Eleven tests pass: three rig checks (limb identity, depth ownership, bone lengths, sampled stance travel and flight) plus eight playback/asset checks including E frame 8 and reduced-motion pause. Independent visual review: `REVIEW.md`. Artwork remains visibly a cut-out rig and eight held poses; avoid claiming fully natural biomechanics or zero jitter.

References used: [Game Studio sprite pipeline](https://github.com/openai/plugins/tree/main/plugins/game-studio), [Adobe walk cycles](https://www.adobe.com/creativecloud/animation/discover/animation-walk-cycle.html), [Adobe limb setup](https://helpx.adobe.com/in/adobe-character-animator/desktop/behaviors/learn-more-about-behaviors/body-directly-controlled.html), [Aseprite layers](https://www.aseprite.org/docs/basics/), [onion skins](https://www.aseprite.org/docs/onion-skinning/).
