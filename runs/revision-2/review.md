# Independent review of revised registration

Reviewed 3 October 2026 against the original 24 strips and the revised proof sheets, registration code and numeric report. This review describes the final version with the stronger denim filter and airborne-floor clamp. The original generated poses remain in use.

## Result

The revised geometry is suitable for demonstrating the retained art with improved registration, consistent ground contact and inspectable travel/timing. It does **not** repair or certify the underlying walk/run anatomy. Near/far leg alternation, several camera changes and some body-proportion differences remain visible source-art limitations.

All 144 revised frames have at least 2 native pixels of transparent margin and no opaque pixels touching a frame edge. No clipping was found. The measured denim anchor sits within 0.5 native pixels of the intended horizontal centre in every frame. This is a much more relevant body-registration reference than the full silhouette bounds used originally.

## Corrections verified

- Side-view walk soles now share one ground line: y58 for the 64-pixel platform sprites and y122 for the 128-pixel street sprites. This removes the previous 1-pixel floor wobble.
- Side-view run flight frames now use the same sole clearance in both halves: 5 pixels for platform and 10 pixels for street. This resolves the previous B street asymmetry of 17 versus 12 pixels. It does not establish a biomechanically correct flight or alternate support leg.
- A common head-width target sets one scale for each entire action strip. No frame is resized independently within an action, so the correction does not introduce per-frame scale pumping. Some run bodies become shorter after head normalisation because the source art had different head/body proportions; scaling alone cannot repair those proportions.
- Jump registration now raises the pelvis through rise and apex, then lowers it during the fall. Crouch, launch and landing remain on the floor. The raised arms no longer determine the vertical placement of airborne frames.
- Isometric and top-down locomotion retain projected foot-depth changes instead of incorrectly forcing every shoe to one screen-space floor.

An initial version of this registration pass misidentified dark blue-tinted head/shirt pixels as denim. The review identified impossible reported hip heights and jump-floor penetration. That version was rejected. The final filter requires B ≥70, B−R ≥30 and B−G ≥15 on the original imports; its upper-denim anchors now correspond to the visible waist. The additional airborne clamp resolves the remaining B street and B RPG descent penetrations.

## Final jump check

Numbers are the lowest opaque shoe pixel in frames 1–6, measured in native pixels. Tucking the knees affects shoe height independently of pelvis height, so this is a floor-intersection check, not a measurement of the physical jump trajectory.

| Sprite | Ground | Shoe y by frame | Floor penetration |
|---|---:|---|---|
| A platform |58|58, 58, 47, 42, 53, 58|None|
| B platform |58|58, 58, 48, 43, 57, 58|None|
| A street |122|122, 122, 110, 90, 118, 122|None|
| B street |122|122, 122, 107, 94, 121, 122|None|
| A isometric |58|58, 58, 46, 41, 54, 58|None|
| B isometric |58|58, 58, 48, 44, 56, 58|None|
| A RPG |58|58, 58, 44, 40, 51, 58|None|
| B RPG |58|58, 58, 52, 45, 57, 58|None|

Rise, apex and fall are now ordered sensibly in the reviewed strips. There are still only six keys, so this is a stylised jump, not a smooth physical simulation. B isometric landing still turns towards the camera and B RPG crouch/landing have different body lean. These are pose-content limitations preserved from the originals.

## Distance evidence and limits

The table follows the front grounded shoe from walk frame 1 to frame 2 using the centre of its bottom two opaque rows. These approximate measurements are affected by changing shoe shape and overlapping foot outlines. They are useful as a local reference, but do not validate later frames.

| Walk strip | Front shoe x, frame 1 | Grounded shoe x, frame 2 | Local backward sweep | Local extrapolation over six 120 ms frames |
|---|---:|---:|---:|---:|
| A platform |39|32|7 px|42 px/cycle|
| B platform |39.5|33|6.5 px|39 px/cycle|
| A street |77|71|6 px|36 px/cycle|
| B street |79.5|69.5|10 px|60 px/cycle|

These are **first-interval estimates**, not full-cycle stride calibrations. The later generated poses do not consistently carry the same planted foot backwards and exchange near/far support. The unexpectedly short A street estimate, despite its larger character, reinforces that limitation. A comparison may use these estimates with that label or use clearly labelled common reference distances; it should not claim zero sliding.

The run frame 1→2 grounded positions are even less reliable: A platform x41→22, B platform x38.5→19, A street x80→43 and B street x82.5→42.5. The apparent supporting shoe changes rather than tracing one unambiguous planted foot. Multiplying these differences by six would imply 114–240 pixels per cycle. Those are invalid calibration results and should not be used as measured running strides.

For running, retain an explicit reference travel distance until valid alternating poses support a genuine stance-foot measurement. For isometric/top-down travel, treat the configured projection vector as a reference as well. The corrected page can expose sliding honestly; the current source art cannot support a foot-lock certification.

## Remaining visible limitations

- Most platform, street and isometric walk/run strips still repeat similar three-pose half-cycles, with ambiguous or missing alternate leg support.
- A isometric walk and B isometric jump retain source camera/facing changes.
- A platform, A RPG and B isometric runs look shorter in the body after matching head size; this reflects source proportions. A matched head is not a matched skeleton.
- The denser timeline and moving ground improve inspection but cannot add missing poses between generated frames.

The revision therefore passes the clipping, registration and jump-floor checks, with the above pose and distance limitations explicitly retained.
