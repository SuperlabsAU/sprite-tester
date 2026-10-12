# E appearance restoration review

Reviewed 12 October 2026 by an independent appearance reviewer.

**Assessment: no material blockers found for publishing this appearance restoration.** The final candidate is substantially closer to A than the previous E artwork. This assessment covers appearance and sprite continuity; it does not certify a smooth or calibrated gait.

## Visual findings

- Native A face and hair patches restore the reference character across platform, street, isometric and RPG views. The previous E head design no longer drives the character's identity.
- Fuller denim and arms bring the body closer to A's proportions. The RPG shoulder/collar patch restores the broader silhouette and removes the generated orange U-shaped neckline.
- The final street collar meets the chin. Earlier floating shins, feet and arm fragments are absent in the refreshed proof sheets.
- RPG jump frames 04–06 were checked enlarged after the final arm placement correction. The raised left forearm now meets its shoulder; the previously visible background gap is closed.

The body remains more angular and mechanically posed than A. Limb textures compress and rotate with the existing rig, especially in bent knees and raised arms. These are visible limitations of the current animation, rather than remaining disconnected parts or a change of character identity.

## Independent checks

- Reviewed `appearance-comparison.png`, `all-frames.png`, the native A references, renderer source and enlarged RPG jump frames.
- Scanned all 96 rendered frames using alpha greater than 128 and 8-neighbour connectivity. Every frame has exactly one connected component, with no extra isolated pixel islands at that threshold.
- Confirmed all 96 shipped strip cells match the saved frame outputs byte-for-byte after decoding to RGBA.
- Confirmed non-zero-alpha bounds stay inside every frame cell.
- Recomputed all 48 A–D comparison asset hashes against `baseline-hashes.json`; all match.
- Confirmed `rig.cjs` is byte-identical to revision 2. The final shoulder correction changes renderer placement, rather than the authored joint trajectory.

No implementation files were changed by this review.
