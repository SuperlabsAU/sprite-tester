# GitHub source repository

Verified 12 October 2026: [SuperlabsAU/sprite-tester](https://github.com/SuperlabsAU/sprite-tester) remains public. The whole-character-corrected Game Studio method E is live from `main` at commit `027e0c9ae9e0da6e40a98454044f43d9ef771ee0`; its initial addition was `9659130cff0d0f08eb2d5288d0e09c55803f4e83`. The original four-method snapshot was `ac08fe1a1d23050f58513ac1b3cadf1177ea00d4`.

The publishing checkout is `.local-tools/sprite-tester-publish` within this workspace. It combines the root project's tracked assets and scripts with the separate `site/` repository. Both original local repositories retain their existing histories. Use the publishing checkout or a fresh GitHub clone for future uploads; do not push either original repository's unrelated history over the public branch.

The public snapshot includes the webpage, 60 animation strips, editable Aseprite files, generation scripts and reviews. It excludes the local Aseprite build, machine-specific runtime configuration, full MCP diagnostic logs and private Sites hosting configuration. It supplies an example MCP configuration.

## Live website — verified 12 October 2026

GitHub Pages is enabled at https://superlabsau.github.io/sprite-tester/. Its source is GitHub Actions; `.github/workflows/pages.yml` in the publishing checkout publishes only `site/dist`. Changes to `site/dist`, `site/tests` or the workflow on `main` trigger the eight playback/asset tests and deployment. A manual workflow dispatch is also available.

Initial deployment on 3 October 2026, run https://github.com/SuperlabsAU/sprite-tester/actions/runs/37119376446, succeeded, including playback verification and Pages deployment. The live browser displayed all sixteen viewers, loaded motion metadata, and correctly selected jump frame 4 and run frame 6 across all viewers. No browser console errors were observed. Playback was left running in walk mode.

The public branch also includes the live-site README link at `f9f7a39`. The saved Git HTTPS credential can push ordinary files but cannot create or update workflow files; the workflow was committed through the signed-in GitHub browser session, then the publishing checkout was rebased onto that commit. No credential scope was changed.

The existing Sites project remains separate and unpublished. Verify current remote status before future publication work.

## Game Studio release — 12 October 2026

[Deployment run 38176063643](https://github.com/SuperlabsAU/sprite-tester/actions/runs/38176063643) succeeded in 24 seconds for commit `9659130`. The existing workflow ran the eight playback/asset tests and deployed `site/dist`; no workflow or audience settings were changed.

The live in-app browser showed the five-method heading and all 20 viewers. All 20 run sprites rendered at frame 6 and all 20 jump sprites rendered at frame 4; E's four view labels and matching frame data were confirmed. Motion metadata loaded with the updated distances. No loading-error messages or console errors were observed. A few sheets arrived after the initial page load; final captures were taken once all viewers rendered. Playback was returned to walk at 1× with ground travel.

E adds twelve clips / 72 frames while retaining all 48 A–D PNG hashes. Prompts, raw strips, native output, packaged frames, measurements, independent review, browser checks and a live proof screenshot are in `runs/e/`. The bundled upstream Game Studio version is 0.1.2. The release record is committed separately after live verification; documentation-only changes do not retrigger this deployment.

## E motion correction — 12 October 2026

[Deployment run 38196099500](https://github.com/SuperlabsAU/sprite-tester/actions/runs/38196099500) succeeded in 21 seconds for commit `0ceb70d12f1ef98ae536b0c6a65a05ccb4a7d6f6`. The existing workflow deployed the corrected twelve E strips and eight-phase playback after its eight site tests passed. No workflow or visibility settings changed.

E now contains 96 frames; the comparison totals 384. A prompt-only retry failed anatomical alternation and was rejected. The accepted correction combines generated character-part artwork with an explicit joint and overlap rig, clearly disclosed on the page. Eleven local/publishing tests pass, and an independent agent inspected all 96 frames. Every shipped cell matches its saved frame, all have non-zero-alpha margins, and all 48 A–D strips retain their hashes.

The published browser rendered all 20 viewers at walk F5, run F8, jump apex F5 and landing F8. E's timeline accepts frame 8 in every action; A–D cards display their own six-frame indices. Metadata supplies corrected travel distances. No console errors were observed. Desktop/mobile local checks and live proof are in `runs/e/revision-2/`; playback was returned to walk, 1×, ground travel. Raster rotation, segment deformation and held-pose stepping remain documented limitations.

The original local repositories retain commits `19c6e7c` (rig/art records) and `93fdd8b` (site). The public release evidence is recorded in a subsequent documentation-only commit.

## E appearance restoration — 12 October 2026

[Deployment run 38197782236](https://github.com/SuperlabsAU/sprite-tester/actions/runs/38197782236) succeeded in 29 seconds for commit `ee201f06539d3c708e4baa373811e9b453b1edb5`. The user selected A as the aesthetic reference. E now retains A’s native head artwork (including the RPG collar/shoulders) and uses regenerated clothing/limb textures anchored to A, fuller limbs and broader overhead body. Generated atlas extraction excludes fragments from neighbouring cells; street neckline and raised RPG shoulder joins are connected.

The eight-pose rig is unchanged. All frames, durations, labels, stride and lift values match revision 2. Eleven tests pass; independent review confirms all 96 silhouettes are connected at alpha>128. Pixel audits confirm 22,128 opaque A head/collar pixels match and all 48 A–D strips retain their hashes. The result still has angular cut-out motion and texture deformation, disclosed in the comparison.

After deployment, the live in-app browser rendered all 20 viewers at walk F1, run F8 and jump F5. A and revised E were compared at the desktop breakpoint; raised RPG shoulders were visible and connected. No console errors were observed. Live proof and A/before/after artwork are in `runs/e/revision-3/`; playback was restored to walk, 1×, ground travel and temporary viewport overrides were reset. Local implementation commits are `0a5e835` (artwork/scripts/docs) and `e56dc56` (site). Live evidence is uploaded separately in a documentation-only commit.


## E whole-character correction — 12 October 2026

[Deployment run 38234137220](https://github.com/SuperlabsAU/sprite-tester/actions/runs/38234137220) succeeded for commit `027e0c9ae9e0da6e40a98454044f43d9ef771ee0`. The existing workflow passed its eight site checks and deployed `site/dist`; the full local/publishing rig and playback suite passed all twelve tests.

The user rejected revision 3’s overall proportions. E now uses A’s complete native character artwork, camera-specific joints, fuller clothing and shoes, upright contacts, stable arm lengths and bounded foreshortening. Review iterations corrected anatomical mask contamination, stretched limbs, exposed shoulder gaps and unequal RPG jump arms. An independent reviewer accepted whole-character likeness across all 96 frames. The page explicitly identifies E as A artwork with corrected motion, extending the Game Studio experiment. The 48 A–D strips remain unchanged.

The published browser rendered all 20 viewers at walk F1, run F8 and jump F5. Updated artwork, eight-frame controls and revised travel distances were visible; no console errors were observed. Playback was restored to walking at 1× with ground travel. Source, before/after comparison, pixel audit, review and live screenshots are in `runs/e/revision-4/`. The original local implementation commits are `e764c3e` (artwork/scripts/docs) and `ea1f8dc` (site). This live evidence is committed separately without retriggering the site deployment.
