# Browser checks — 12 October 2026

The local tester rendered all 20 cards at walk frame 8 (platform knee repair), run frame 7, jump frame 5 and walk frame 6 (RPG sleeve repair). The eight-frame controls and updated status text were visible. No console errors were returned. Full-page captures are `local-walk-f8.png`, `local-run-f7.png`, `local-jump-f5.png` and `local-walk-f6.png`.

The automated pixel check covers every shipped E cell, including all identified anatomical holes and the exact 589 additions. Browser screenshots establish that the website loads and displays these assets; they are not substitutes for native-resolution raster comparison.

GitHub Pages deployment [38236391063](https://github.com/SuperlabsAU/sprite-tester/actions/runs/38236391063) succeeded for `36bb3c9`. The published tester was reloaded and the updated pixel-repair status confirmed. All 20 viewers rendered at walk F6, run F7, jump F5 and walk F8; no console errors were returned. Live captures are `live-walk-f6.png`, `live-run-f7.png`, `live-jump-f5.png`, `live-walk-f8.png` and the header/platform proof `live-platform.png`. Playback was restored to walk at 1× with ground travel; the live tab remains available.
