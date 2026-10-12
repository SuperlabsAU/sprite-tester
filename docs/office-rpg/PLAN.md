# Office RPG implementation plan

Goal: deliver and playtest one complete office floor, reusing the approved character and existing hosting.
Architecture: deterministic simulation and collision map, Phaser renderer, DOM battle and dialogue UI. Buildless JavaScript modules. Spec: [DESIGN.md](DESIGN.md).

- [x] Rules and world: write failing tests for blocking furniture, reachable encounters, boss gate, tactical turns, coffee limits, escape, loss recovery, victory and validated saves. Implement content/world/rules, then run tests.
- [x] Playable presentation: author office furniture and NPC artwork; reuse E strips; implement exploration, wandering encounters, dialogue, battle effects, morale and approval HUD, sound toggle, keyboard/touch, pause and save. Add navigation from Sprite Lab.
- [x] Verify: run complete site tests, play through normal movement and all four battles to the lift, test loss/escape/reload/mobile, inspect screenshots, obtain independent code review and address defects. Publish within the existing repository and verify live.

Review focus: repeated keypresses during battles, focus loss while moving, corrupted local saves, NPC/furniture path obstruction, narrow viewport controls.

Execution: implement in the existing checkout with separate feature branches; native inline work and a fresh final reviewer. Existing public publishing authorisation and repository audience are preserved. No new Sites project is registered because this is part of the established GitHub Pages project.
