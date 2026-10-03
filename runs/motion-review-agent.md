# Independent frame-by-frame motion review

Reviewed 3 October 2026. Read-only review of the original 24 six-frame atlases, both all-frame overview images, individual enlarged action strips, `runs/process.py` and `site/dist/app.js`. Frames below are numbered 1–6. This is the review of the original assets before the corrective pass.

## Conclusion

The previous geometric audit is insufficient to claim correct motion. Most side/isometric locomotion strips contain two similar three-pose half-cycles without reliably alternating the foreground and background legs. The character stays in one canvas location, so no distance travelled or ground-relative foot sliding can currently be judged. Bounding-box recentring also allows the body to shift as limbs change silhouette width. These need correction before the comparison is a convincing movement test.

The eight jump strips generally have the correct semantic pose sequence. Their import, phase durations and registration need work more than their pose order. B isometric jump also changes facing between crouch and landing.

## Per-sprite/action findings

| Sprite | Walk | Run | Jump |
|---|---|---|---|
| A platform | Frames 1/4 and 3/6 are similar open-stride poses; 2/5 are similar recoil poses. Foreground leg does not convincingly perform a complete contact-to-recovery-to-opposite-contact cycle. Shoe baseline alternates by 1 px. Regenerate. | 1/4 contact, 2/5 knee-drive and 3/6 split flight repeat the same lead-side impression. Head remains at exactly y13 while soles jump from y58 to52 in flight; much of the apparent flight comes from leg pose. Regenerate. | Correct crouch, launch, tuck, apex, extension, landing. Large head x change from crouch to tuck partly comes from silhouette centring. Sole lifts 17 px at apex, versus original requested 10 px. Preserve poses, register by hip and recalibrate vertical arc. |
| B platform | Better passing silhouettes at 2/5 than A, but the second half still does not clearly exchange near/far legs. Head/body facing changes subtly; near arm remains on one side too long. Regenerate. | Same three-key pattern repeated. Frames 3/6 have only 4 px sole lift; no clear alternate-leg recovery. Regenerate. | Correct six stages. Crouch/landing have similar ground height; apex sole lift16 px. Head x drifts as arms go up and legs tuck. Preserve poses and correct registration/timing. |
| A street | Frames1/4 same open stride;2/5 same bent-leg overlap;3/6 same open stride with near arm swung differently. The arms change more convincingly than the leg cycle. Regenerate. | All six frames read with foreground thigh pointing forward and far leg trailing; knee raised at2/3/5/6. This produces a skip/gallop impression. Regenerate. | Correct semantic stages. Rise-to-apex changes silhouette width and centres head differently; lower shirt/waist stays much steadier than head. Peak sole lift40 px against requested20 px. Correct anchor and arc, retain art if scale is consistent. |
| B street | Essentially the same half-cycle repetition as A; slightly different head orientation in1/4/5. Ground baseline stable within1 px. Regenerate. | Repeated lead side; airborne frames3/6 disagree: sole lift17 vs12 px, head top y26 vs29. Visible uneven hop. Regenerate. | Correct stages, large forward lean at crouch and larger registration change into launch. Peak sole lift36 px. Preserve with hip anchor, scale check and variable phase durations. |
| A isometric | Face/camera changes noticeably across1/4/6; head-band centre shifts x32.2→30→29. Foot placements do not establish a stable southeast travel plane or reliable alternate stance. Regenerate. | Frames1/4,2/5,3/6 repeat general leg shape. Arms swap more than legs; camera/face also changes. Regenerate. | Valid sequence with southeast interpretation, but crouch and take-off lean differ and silhouette centring moves the body. Peak sole lift19 px. Preserve if camera correction is acceptable; re-anchor. |
| B isometric | Head is comparatively stable, but1/4,2/5,3/6 read as repeated leg poses. Regenerate with explicit foreground/background leg assignment. | Strong repeated-leg pattern. Frames1/4 place same shoe down-forward;3/6 split same way. Regenerate. | Stages are readable; final landing turns towards the viewer compared with starting crouch. Peak sole lift19 px. Regeneration is preferable to enforce one southeast camera; offsets cannot repair view rotation. |
| A RPG | Alternation is more plausible than side views, but exact foot contact/passing order is hard to read at this resolution;1/4 and3/6 feel repetitive. The upper body is stable. Low-priority replacement for a clear eight-frame sequence. | 1/4 look like the same lead-leg pose; the other half does not produce a comparable opposite extended-leg contact. Regenerate. | Clear matched crouch/landing and rise/fall. Good x stability. Preserve, correct arc/timing; do not floor-align every pose. |
| B RPG | Good head registration; weakly differentiated gait stages and repeated contacts. Low-priority replacement to make support-leg order explicit. | Best visible near/opposite leg switching of the set. Could be preserved if validating on its own; replace only if adopting one eight-frame locomotion contract across the experiment. | Correct order and good x stability. Tucked knee changes are slightly asymmetric, which is acceptable. Preserve with arc/timing correction. |

## Numeric observations

All values here are measured in native atlas pixels, not CSS or enlarged-preview pixels. Sole y is the lowest opaque pixel; in elevated views it conflates depth, stance and height, so it must not be used as a universal floor anchor.

| Strip | Lowest opaque y, frames1–6 |
|---|---|
| A platform walk |57,58,57,58,58,57|
| B platform walk |58,58,58,58,58,58|
| A street walk |121,122,121,121,122,122|
| B street walk |121,122,122,122,122,122|
| A isometric walk |58,56,57,57,57,56|
| B isometric walk |58,58,57,58,57,58|
| A RPG walk |58,56,58,58,55,58|
| B RPG walk |58,55,58,58,55,58|
| A platform run |58,58,52,58,58,52|
| B platform run |58,58,54,58,58,54|
| A street run |122,122,114,122,122,114|
| B street run |122,122,105,122,122,110|
| A isometric run |58,55,52,58,55,52|
| B isometric run |58,54,53,57,54,54|
| A RPG run |58,54,54,58,54,55|
| B RPG run |58,55,50,58,56,54|
| A platform jump |58,58,50,41,55,58|
| B platform jump |58,58,49,42,55,58|
| A street jump |122,121,106,82,115,122|
| B street jump |122,120,104,86,117,122|
| A isometric jump |57,56,46,39,53,58|
| B isometric jump |58,58,46,39,54,58|
| A RPG jump |58,58,47,39,55,58|
| B RPG jump |58,57,49,40,56,57|

Top15% silhouette centroid is a rough head-x proxy for walk/run only; arms make it invalid for launch poses. A isometric walk measures x=[32.2,31.8,32.0,30.0,32.2,29.0], a3.2 px span. B isometric walk spans only0.8 px. B street run head top y=[31,30,26,31,29,29] demonstrates unequal flight bob. A platform run top y is13 in all six frames, while the legs lift6 px in each flight frame.

## Correction contract

1. Replace the failed gait art through image generation. Do not try to fix repeated leg poses by translating or mirroring the whole character: those operations cannot change which leg leads while keeping facing.
2. Use eight keys with a persistent near/far leg identity: contact, down, passing, up, opposite contact, opposite down, opposite passing, opposite up. Keep the foreground jeans a consistent lighter shade. The opposite arm and leg swing together.
3. Register each frame around a torso/pelvis landmark. Preserve deliberate forward lean and up/down hip bob; do not centre by whole-silhouette bounds. Use one body scale per character/view across walk, run and jump, estimated from head/torso landmarks rather than total posed bounding height.
4. Add a distance reference: moving-floor travel or character travel. Define native pixels per complete cycle and the projection direction. A planted foot should remain nearly stationary relative to the scrolling ground through consecutive stance frames. Sample contact feet, not total body bounds.
5. Use unequal jump durations. A160 ms hold on each of crouch, launch, rise, apex, fall and landing creates an excessively held launch and uniform six-step rhythm. Keep launch short, ensure slower motion near apex, and allow landing compression. Vertical distance should follow the pelvis/root arc; feet tucking is additional pose movement.
6. Include the loop seam in validation (last-to-first). Existing audit diffs only list five adjacent pairs and do not establish support-leg alternation, planted-foot slip, world speed or joint continuity.

Suggested side-view walk guide at64 pixels (a generation target, not a measurement of current art): pelvis x32, ground y58; near shoe x=[42,37,32,27,22,25,32,39], y=[58,58,58,57,58,54,51,54]; far shoe half-cycle shifted. During stance the foot moves backwards about5 px per frame relative to the pelvis. With100 ms frames that gives approximately40 native px per full800 ms cycle and50 px/s travel. Double these coordinates/distances for128-pixel street characters. Final travel speed should be recalibrated to actual generated landmarks, not assumed from this guide.

For isometric use projected southeast displacement proportional to(dx,dy)=(2,1), and place foot lanes perpendicular to that direction. For top-down use southwards displacement(0,dy), with left/right lanes around±4 native pixels. The deepest foot in these views is not necessarily the lowest vertical point in world space.
