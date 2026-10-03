# Pixel-plugin test — 3 October 2026

Tested the actual [willibrandon/pixel-plugin](https://github.com/willibrandon/pixel-plugin) v0.5.0 snapshot `dee3506`, using its bundled native arm64 `pixel-mcp` server. The Creator, Animator and Exporter skills guided canvas creation, explicit pixel drawing, animation tags, timing and horizontal-sheet export. A small stdio MCP client replaces the Claude Code host, not the server or drawing engine. `tool-schemas.json` records the actual discovered API.

## Setup and provenance

Aseprite was not installed. The user explicitly chose a local source build. Built official `Aseprite-v1.3.18.6-Source.zip` with Apple Clang21, CMake4.4.3 and Ninja1.13.2. The `none` graphics backend supports the required batch/Lua operations without Skia. Binary reports `Aseprite1.3.18.6-dev`. Source and build stay in ignored `.local-tools/`; these are not distributed in this repository.

The build’s pinned libjpeg-turbo3.0.2 archive was downloaded separately because the sandbox had no DNS; CMake verified its upstream SHA512. On this Mac, Aseprite's initial NSApplication registration aborts inside the sandbox, including `--version`. Approved execution outside the sandbox succeeds. All sprite drawing and export used that verified executable.

The bundled server ignores the plugin manifest's `PIXEL_MCP_CONFIG` environment variable. Its required `~/.config/pixel-mcp/config.json` was created with an approved write and points into this project; a copy is stored here. No global Codex plugin configuration or Claude installation was added. Runtime setup remains local to this machine.

## What D measures

D contains12 clips /72 frames and editable `.aseprite` documents. Unlike A–C, the artwork is explicitly authored geometry in `poses.py`, submitted as colour/coordinate batches to the real `draw_pixels` MCP tool. `generate.py` uses create_canvas, add_layer, add_frame, set_frame_duration, create_tag, save_as and export_spritesheet. The final PNGs are exact unmodified Aseprite exports: no image generator, palette remapping or post-export registration.

The character keeps the requested glasses, black shirt, jeans and trainers. Head templates and proportions are fixed per view. Near/far legs alternate; a planted foot moves backwards linearly in character space. Running uses shorter support intervals and two flight phases (frames3 and6). Jump rise and fall are symmetric with the apex at frame4. Isometric projection is2:1; RPG travel is south/downscreen.

This tests the agent's explicitly authored motion through pixel-plugin's tools. It does not show that the plugin automatically invents good gait or artwork. The drawings are simpler and more rigid than A–C, especially the street detail and nearly frontal isometric face. Six held poses still visibly step. Sampled foot-anchor cancellation is not a claim of rendered zero-slip between frames.

## Independent review and correction

The motion-review agent confirmed actual leg alternation, deliberate run flight, stable walk registration and ordered jump height. It caught thick shin caps extending below the shoe soles. Shin strokes now end above the contact point at the ankle. Isometric projection was also corrected from30° to2:1.

Final agent check: all72 served frames match the corrected Aseprite exports, with transparent margins, no clipping and no remaining below-sole ink defect. Grounded street soles reach y122. Platform soles reach y57, one pixel above the shared y58 reference. The remaining stiffness is a limitation of this authored six-pose test, not random frame misregistration.

## Reproduction and checks

- `python3 runs/d/generate.py` draws all12 clips through MCP; optionally pass a view and action for a pilot.
- `python3 runs/d/package.py` (with Pillow) validates dimensions, margins, exported durations, stable head placement, run flight, jump apex and sampled stance cancellation, then copies exact exports to the site. Pillow is used for audit/proof sheets, not drawing the production frames.
- `poses.py` records all drawing and kinematic choices. Pose metadata captures feet, head origins, root lift and configured stride for each frame. `verification.json` stores the audit.
- `mcp-calls.jsonl.gz` preserves actual request/response history, including initial attempts. `mcp-audit.json` summarises tool usage. Exported `.aseprite` files preserve frame durations and tags.
- Seven existing playback tests pass. Live browser checks cover sixteen viewers and all18 action/frame combinations; no asset errors or horizontal overflow at558px.

The comparison has48 clips /288 frames in total. A–C source PNGs remain unchanged. Local webpage: http://127.0.0.1:4173/. No publishing was attempted.

## Pixel-plugin detail pass — 3 October 2026

At the user's request, D now has richer hair and face shading, clearer glasses, fitted shirt shading and folds, denim seams and cuffs, and layered trainers. Fine marks use native pixels, particularly at128px, rather than doubling every detail. All artwork was redrawn through the existing Pixel-plugin MCP/Aseprite workflow.

All72 pose records (feet, root, head anchors, lift and stride) and exported durations are unchanged from the accepted movement. The visual silhouette has slightly fuller thighs and shirt shoulders; movement coordinates remain identical. Original artwork and motion metadata are preserved in `runs/d/detail-pass/before/` in the root project. The updated style remains explicitly authored pixel art; this pass does not claim to reproduce the generated columns' artwork exactly.

Detail-pass verification: all72 exported frames exactly match submitted MCP pixels. Independent review confirmed unchanged motion records, no below-sole regression, no clipping and at least3px transparent margins. Browser checks passed allthree actions across16 viewers. Before/after comparison: `detail-pass/before-after.png`; numeric records: `detail-pass/verification.json`.
