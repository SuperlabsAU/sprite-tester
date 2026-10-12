# E revision 2 browser checks

12 October 2026. Local preview checked in the Codex in-app browser at 1280×900 and 390×844.

- All 20 viewers render. E uses eight cells; A–D retain six. Each card shows its own sampled frame.
- Walk F1/F5 exchange anatomical contact legs and arm swings. The timeline labels right/left phases explicitly.
- Run F8 and jump F7/F8 are accessible. F7 remains airborne; F8 lands.
- Mobile timeline wraps into two rows; the horizontal comparison region reaches column E using keyboard scrolling.
- No browser console errors observed. Desktop proof: `browser-preview.png`; mobile timeline: `mobile-preview.png`.

## Published verification

[GitHub Pages run 38196099500](https://github.com/SuperlabsAU/sprite-tester/actions/runs/38196099500) succeeded in 21 seconds for `0ceb70d12f1ef98ae536b0c6a65a05ccb4a7d6f6`. Reloaded https://superlabsau.github.io/sprite-tester/ after deployment.

All 20 viewers rendered. The published WebMCP control accepts walk/run frame 8; jump F5 is apex, F7 descending and F8 landing. Walk F5 screenshot confirms E F5/8 alongside A–D F4/6 and current configured stride values. Run F8 and jump F8 were also visually checked across all viewers. No console errors were observed. `live-page.png` is the published walk F5 proof. Playback was restored to walk at 1× with ground travel; viewport override reset.

Motion metadata and some PNGs arrive after the first page load. Verification and captures were taken after loading completed.
