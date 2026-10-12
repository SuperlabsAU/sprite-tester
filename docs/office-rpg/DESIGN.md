# Out of Office — one-floor RPG prototype

12 October 2026. User brief: a Pokémon-like office RPG where the existing corporate character meets and battles coworkers; satirical office culture, one test floor. Direct implementation and verification are authorised by the user's build request and persistent working preferences.

## Experience

Top-down tile exploration on one original office floor. Keyboard arrows/WASD and touch controls; Shift to run; E/Space to interact. Coworkers wander and trigger a dialogue when bumped; choosing to engage opens a turn-based battle. Three departmental approvals unlock a manager encounter. Defeat the manager and use the lift to clock off. Expected first playthrough: 5–10 minutes.

Morale replaces HP. Four moves have readable tactical effects: Reply All (noise), Bring Receipts (evidence), Set Boundaries (guarding) and Circle Back (limited recovery). Opponents have announced weaknesses and themed moves. Coffee heals, fleeing is reliable, losing returns to the kitchen without removing earned approvals. The coffee station heals and refills the flask. A printer and intern provide optional jokes and hints. No account or backend. Local progress is saved, with a deliberate restart action.

## Reference lock

Primary: the user's existing A/E character art and requested classic top-down exploration / separate command battle loop. Pokémon's official [battle guide](https://diamondpearl.pokemon.com/en-gb/trainersguide/fundamentals/battling/) grounds the unhurried, discrete command loop; no franchise artwork is used.

Secondary: Game Studio game UI guidance — canvas playfield, compact DOM HUD and contextual commands. Refero live research was unavailable (inactive subscription); bundled craft-details and motion references guide visible keyboard focus, touch targets, semantic buttons, short feedback and reduced-motion support.

| Decision | Source | Adaptation |
| --- | --- | --- |
| Pixel office, native E player | Existing project/user | Existing character appears in a furnished, original office tilemap |
| Separate battle screen | User / official battle guide | Morale bars, four moves, coffee and escape; no real-time pressure |
| Ink, mint, fluorescent coral, office paper | Office satire brief | Dark workstation shell, mint navigation, coral danger and restrained paper dialogue |
| Playfield first | Game Studio UI | Small upper status strip; controls below, no dashboard card grid |
| Stable pixels | Previous sprite work | Nearest-neighbour sprites, shared anchors, no regenerating player frames |

## Technical boundaries

Phaser 3.90.0 pinned locally under vendor, MIT licence retained. ES modules in the existing buildless static site. `content.mjs` owns role and move data; `world.mjs` owns map/collisions; `rules.mjs` owns serialisable state and deterministic turns; `art.mjs` draws original office textures; `game.mjs` adapts Phaser to simulation; `ui.mjs` owns accessible DOM controls/dialogue/battle. Existing Sprite Lab remains at `/`; the game is `/office-rpg/`.

The renderer does not own progression. Save data is validated and stores only persistent state. No external runtime request. NPC paths must not obstruct permanent access; all required encounters, coffee and exit are reachable. Battle commands lock during response animation; input clears on blur/pause. Touch and keyboard use the same actions. Public playtesting tools use normal controls and cannot grant approvals, health or teleportation.
