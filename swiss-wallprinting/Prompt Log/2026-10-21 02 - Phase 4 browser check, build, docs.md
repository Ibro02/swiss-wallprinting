---
tags: [prompt-log]
date: 2026-10-21
agent: Claude Code (Claude Opus 5.5)
status: done
---
# 2026-10-21 02 - Phase 4 browser check, build, docs

## Prompt

> Continue Phase 4: fix the dark walls, finish the browser check, build, bundle check, and docs.

## Goal

Finish Phase 4 after [[2026-10-21 01 - Phase 4 configurator MVP]]: light walls, a full browser check, the production build, a check that three.js stays on the configurator page, and the docs.

## Result

- **Dark walls fixed (two causes):**
  - The model's plaster texture is a dark beige (average RGB 158/140/120). `vp run models` now keeps only its relief (greyscale grain) on a warm white (`#f3f0ea`) in both GLB tiers.
  - The lights were too weak for three.js physical light units (a diffuse surface reflects intensity / π). The new values are hemisphere 2.4 and directional 2.2.
- **Preset images:** the transparent parts of the artworks are now white (they were black). Checked in the browser.
- **Fixed during the check:**
  - The "Adjusted to …" mark of a length field stayed on after the limit text changed (for example, after the room got higher). It now shows only while the value and the limit text are the same as when the value was adjusted.
  - The header pill was 65 % graphite, so the desktop nav links over the light page had 4.05:1 contrast (Lighthouse desktop accessibility 96). It is now 85 %, about 7.4:1, on every page.
- **Browser check (dev server, desktop):**
  - Preset switch: the print and the price change (lake: 5.25 m², ca. 980 CHF).
  - A click on the left wall selects "west" and the camera turns to it. The print fits the 4 m wall.
  - Limits: room height 9.5 → 8.00 m and print height 5 → 2.70 m (wall), each with "Adattato a …". On an 8 m wall, print height 5 → 3.80 m with the machine reason.
  - Position: 10 m from the left gives the right end of the wall; "Centra" centres the print.
  - "Immagine intera": the area follows the image proportions.
  - The panel closes: the canvas gets the full width, and a price button opens the panel again.
  - Upload: a `.txt` file shows the type error. A PNG becomes a square 2.80 × 2.80 m print, and the error goes away.
  - Before and after views work.
  - `?area=facade` starts with a 9 × 3.80 m wall, the peaks preset, and "outdoors" (ca. 3930 CHF). An unknown area gives the defaults.
  - No console errors.
- **Languages:** the server HTML of all four locales has the title and the price (`ca. 1290 CHF`, `ca. 1.290 CHF`, `approx. CHF 1,520` with `?area=hotel`, `oko 1.290 CHF`).
- **Phone (375 px):** no horizontal scroll, the low-tier model loads, and the room is above the panel. The first load on the dev server is slow (compile).
- **Build:** `vp run build` passes; the configurator route is dynamic (ƒ), and all other pages stay static. `vp check` is clean (122 files) and `vp test` passes (154 tests).
- **Bundle check (production server):**
  - Method: list every JS chunk that the page loads, and search it for `WebGLRenderer`.
  - The home, services, and gallery pages load no chunk with three.js and no model.
  - On the configurator, three.js is in one chunk (1017 KB, 269 KB compressed) that is not in the page HTML: the scene loads it after the page renders.
- **Lighthouse (production):**
  - Configurator, desktop: 87 / 100 / 100 / 92 (LCP 1.1 s, TBT 260 ms). Services, desktop: 100 / 100 / 100 / 92.
  - Configurator, mobile: 42 / 100 / 100 / 92. Running the 3D chunk takes about 2.2 s on the slowed CPU (TBT 2.5 s), and that delays the paint of the panel text (the LCP element).
  - SEO 92 everywhere: the canonical URL points to the real domain, not to localhost.

## Changed files

- `scripts/optimize-models.ts` (light plaster), `public/models/room-{high,low}.glb` (rebuilt; the props files are rebuilt with the same content)
- `scripts/mockups.ts` (white background for preset images), `public/mock/presets/*.jpg`, `src/content/images/mock.ts`
- `src/islands/configurator/Scene.tsx` (lights), `src/islands/configurator/MetreField.tsx` (adjusted mark)
- `src/components/site/SiteHeader.tsx` (85 % header pill)
- `CLAUDE.md` (three.js rule, configurator texts, store rule, code layout, commands), [[Development Plan]] (Phase 4 done, "Built in Phase 4" in 4.7, Phase 5 additions)

## Decisions

- **Light plaster comes from the pipeline**, not from a shader or a second texture file. The GLB stays the only 3D asset, and the budget tests still cover it.
- **The print is not lit**: multiply blending over the lit wall gives the printed look without a normal map on the print (the plan said normal map plus multiply).
- **Mobile performance is for Phase 5.** The Phase 4 target is desktop. Phase 5 has the poster frame, the bottom sheet, and the low tier; it also gets "load the 3D after idle on phones".
- **The print centre stays centred** when the room height changes: the store keeps the centre offset. The position fields show distances from the left end and from the floor.
- **The header fix is site-wide**: the contrast problem was in the Phase 1 header; only a desktop audit shows it, because phones hide the nav links in the menu.

## Open items

- **Client:** real price rates (Q5), whether the company charges VAT, the print resolution threshold (Q11, for the Phase 5 warning).
- **Mobile performance 42:** Phase 5 (poster frame, load the 3D after idle or on intent).
- **Not tested on a real phone or a low-end GPU.**
- **Facade in a room:** `?area=facade` shows the facade wall inside the room scene. An outdoor scene is a later idea.
- **German price format:** `de` gives `1.290 CHF`; the Swiss format (`CHF 1’290`) comes with regional locales (Phase 7 domain decision).
- **Translations:** DE, EN, BS configurator texts are drafts.
- **Commit:** nothing is committed. The author has staged the files in git; `user.name` and `user.email` must be set before the first commit.
- **Next phase:** Phase 5 (configurator complete).
