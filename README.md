# Sprite Tester

A browser comparison of five sprite-animation workflows using one character: a man with glasses, a black T-shirt, jeans and trainers.

**20 viewers · 5 methods · 4 views · 3 actions · 6–8 frames per clip · 384 frames**

Compare platformer, arcade street, isometric and top-down RPG views. Switch between walking, running and jumping, pause and step through frames, adjust playback speed, and inspect ground travel or in-place motion.

## View online

[Open Sprite Tester](https://superlabsau.github.io/sprite-tester/).

GitHub Pages publishes `site/dist` through `.github/workflows/pages.yml`. Changes to the site, playback tests or deployment workflow on `main` automatically run the tests and deploy. The workflow can also be run manually from GitHub Actions. No build step is required.

## Run locally

Requires Python3. No JavaScript build or package installation is needed.

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory site/dist
```

Open http://127.0.0.1:4173/.

## Methods

| Column | Workflow | Approach |
|---|---|---|
| A | [Character Animation Creator](https://github.com/tachikomared/character-animation-creator-skill) | Image-generated poses, adaptive palette and corrected registration |
| B | [Pixel Art Agent Skill](https://github.com/ervareza/agent-skill-pixel-art) | Image-generated poses, fixed DB32 palette and corrected registration |
| C | [Sprite-gen](https://github.com/gpwork4u/sprite-gen) | Image-generated three-frame chunks and native processing |
| D | [Pixel-plugin / Aseprite](https://github.com/willibrandon/pixel-plugin) | Explicitly authored pixel poses drawn and exported through its MCP server |
| E | [OpenAI Game Studio](https://github.com/openai/plugins/tree/main/plugins/game-studio) | Native A head artwork and A-anchored clothing parts with the corrected eight-pose rig |

D includes a detail pass with textured hair, clearer faces and glasses, clothing folds, denim seams and trainer detail. Its original motion coordinates and timing are preserved.

E extends Game Studio 0.1.2 with generated clothing/limb textures and an explicit eight-pose rig. The latest appearance restoration (12 October 2026) retains native A face/hair pixels, fuller denim/arms, broader overhead body proportions and connected neck/shoulder joins. Timing, foot trajectories, stride and jump heights are unchanged. All 48 A–D strips retain their hashes. This hybrid explicitly borrows A’s head artwork rather than providing an independent full-strip generation result. See [appearance restoration](runs/e/revision-3/README.md), [A/before/after artwork](runs/e/revision-3/appearance-comparison.png), [independent review](runs/e/revision-3/REVIEW.md) and [browser checks](runs/e/revision-3/browser-checks.md). Earlier [motion correction](runs/e/revision-2/README.md) and [native-strip experiment](runs/e/README.md) are retained.

This is an exploratory visual comparison, not a controlled ranking. Held-frame animation remains visibly stepped, and ground distances do not certify zero foot sliding. See [experiment notes](site/EXPERIMENT.md), [D’s review](runs/d/REVIEW.md) and [before/after artwork](runs/d/detail-pass/before-after.png).

## Files and checks

- `site/dist/`: standalone webpage and all 60 PNG animation strips.
- `site/tests/`: playback tests. Run `node --test site/tests/playback.test.cjs` with Node.js.
- `runs/`: prompts, generated sources, editable Aseprite files, processing scripts and reviews.
- `runs/d/poses.py`: deterministic artwork and animation coordinates for D.
- `vendor/skills/`: upstream workflow snapshots and their supplied licences.

The local Aseprite build, platform binaries, machine configuration and full MCP diagnostic logs are excluded. Existing PNGs require none of these to view. Regenerating D requires Aseprite1.3.18.6 (or compatible), pixel-plugin0.5.0's MCP binary for your platform, Python3 and Pillow for packaging. See [setup notes](runs/d/REVIEW.md) and [configuration example](runs/d/pixel-mcp-config.example.json). Historical audit records may refer to the original local generation paths.

Upstream components retain their respective licences. No new licence is asserted over those components.
