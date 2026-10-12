# Office RPG playtest — 12 October 2026

One floor, four battles, a complete lift ending. Tested in the Codex in-app browser at desktop size and a 390 × 844 phone viewport. Browser playtesting uses real pathfinding and commands; no teleportation, health override or approval grant is exposed.

## Completed playthrough

- Walked from reception to People, Sales and Product through the furnished floor. Collision and pathfinding use the same map as keyboard/touch movement. Coworkers patrol and open encounter dialogue when bumped.
- Defeated Pat with four Set Boundaries turns, Chad with three Bring Receipts turns, and Morgan with three Reply All turns. Tested a battle coffee and free kitchen healing/refill.
- Three departmental approvals unlocked Brenda. Deliberately lost using five Reply All turns: recovered at the coffee machine with 96 morale, two coffees and all three approvals.
- Declined a manager battle with Take it offline: returned to exploration without an approval or forced immediate re-encounter.
- Defeated Brenda using four Bring Receipts turns. Reloaded on the victory screen: boss approval and +14 morale recovery persisted. Walked to the lift and completed the game. The receipt recorded 20 turns and one consumed coffee, including the deliberate loss.
- Started a fresh shift from the ending. Tested a short phone D-pad tap and keyboard arrow press; each moved one tile. Checked mobile encounter dialogue and a battle command.
- Checked pause/resume and verified movement cannot advance while paused. E advances an encounter while its primary button is focused. Battle buttons lock during responses. Circle Back retains shortcut 4 while showing uses remaining.

## Review fixes

Independent code review found victory/loss results could be lost on a reload before pressing Back to the floor, and playtesting movement could bypass pause. Save data now serialises settled outcomes without disturbing the visible result screen. Playtesting movement gates each step. Two save regressions pass; the reviewer rechecked both fixes and keyboard dialogue focus.

Phone testing found short taps could be released before a render tick; initial keyboard/touch input now immediately invokes the normal movement step. Held keys still repeat at the normal speed. Narrow-screen battle positions, fixed log height and canvas width were adjusted to keep the characters and commands visible.

## Scope and limits

A prototype with one authored floor and deterministic tactical encounters. NPC appearances are palette/tie variations of the approved E artwork; the rear head is an authored texture adaptation and sideways movement reuses the existing isometric strip. This is not a complete eight-direction character pack. Furniture and the meeting-room background are original Canvas artwork. Audio is optional synthesised feedback; no soundtrack. Saves remain local to one browser/device. Accessibility includes semantic commands, focus indicators and modal keyboard handling; canvas exploration is not a fully screen-reader-playable mode.

Evidence: `runs/office-rpg/local-ending.png`, `mobile-battle.png`, plus live release captures. Final automated input/rule/playback counts and deployment evidence are recorded in RELEASE.md.
