# Out of Office release — 12 October 2026

Destination: the existing public [Sprite Tester GitHub Pages site](https://superlabsau.github.io/sprite-tester/office-rpg/). Source is `site/dist/office-rpg/`; Sprite Lab links to the new page.

Prepublication verification: all 23 site tests pass (12 RPG rule/save tests, 3 input regression tests and 8 existing Sprite Lab tests). JavaScript syntax checks pass. The local browser playthrough completed all four encounters, loss recovery, escape, coffee, victory reload and the lift ending. Mobile keyboard/tap/battle checks passed. No browser console errors were recorded.

Independent review found two defects: completed results were not saved until the result button was pressed, and playtesting movement bypassed pause. Both were corrected, covered by regression tests and accepted on recheck. A separate phone check led to immediate single-tap movement and improved battle spacing.

The existing deployment workflow continues to run its eight Sprite Lab tests. The complete 23-test suite is run locally and again in the publishing checkout before pushing. No hosting, repository visibility, credential scopes or workflow files are changed.

## Verified live release

[GitHub Pages run 38240602270](https://github.com/SuperlabsAU/sprite-tester/actions/runs/38240602270) completed successfully for public commit `8fb69cd90e0b338f0316c543b98bfef376c43d40`.

The published Sprite Lab link opened the new game. The browser loaded the complete floor and sprite artwork, walked to Pat, completed all four battle turns, awarded People approval and returned to exploration. No console errors were recorded. The test save was reset through the game menu; the live tab is left at reception with full morale and no approvals. Temporary phone viewport overrides were reset.

Live proof: `runs/office-rpg/live-floor.png` and `live-battle.png`. The local completion and phone captures sit beside them. Local source commits are `f9cdefe` (site) and `a79e44e` (design/playtest). This verification record is committed separately as a documentation-only update.
