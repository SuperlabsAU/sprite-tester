# GitHub source repository

Verified 12 October 2026: [SuperlabsAU/sprite-tester](https://github.com/SuperlabsAU/sprite-tester) remains public. Game Studio method E was published from `main` at commit `9659130cff0d0f08eb2d5288d0e09c55803f4e83`. The original four-method snapshot was `ac08fe1a1d23050f58513ac1b3cadf1177ea00d4`.

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
