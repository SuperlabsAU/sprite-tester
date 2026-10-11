# Browser checks — 12 October 2026

Local tester checked in the Codex in-app browser at `http://127.0.0.1:4173/`.

- At 1280 × 900, all five method columns fit together. Full-page screenshots showed all four rows and all 20 rendered sprites at jump frame 4.
- At 390 × 844, page controls and timeline wrap; the comparison board scrolls horizontally without widening the outer page. Keyboard right-arrow scrolling reached D and E, with all four E sprites visible in the full-page capture.
- Shared controls selected jump frame 4, then run frame 6, paused playback, 1.5× speed and in-place mode. The DOM reported the selected frame, action, speed and mode across all 20 viewers.
- The initial walk state rendered all four E views. No browser console errors were captured.
- Temporary viewport overrides were reset after verification.

The independently reviewed proof sheets cover every new frame. These browser checks establish layout and control integration; they do not certify the generated gait or estimated movement distances. Live deployment verification is recorded in `../../docs/GITHUB.md` after publication.

## Live checks

GitHub Pages deployment run `38176063643` succeeded for commit `9659130`. At https://superlabsau.github.io/sprite-tester/ all 20 run sprites rendered at frame 6, then all 20 jump sprites rendered at frame 4, with E present in each view. Metadata-backed distance readouts, speed and in-place controls were confirmed. No loading-error messages or console errors remained. `live-page.png` records the published jump-apex comparison at the verified desktop breakpoint. Playback was returned to walk / 1× / ground travel and the viewport override reset.
