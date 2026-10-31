---
tags: [prompt-log, architecture, configurator, refactoring]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (committed on refactor/architecture, not pushed)
---
# 2026-11-01 01 - Configuration module

## Prompt

> Yes, start coding

## Goal

Build candidate 1 of the second architecture review, as decided in [[2026-10-31 04 - Configuration module grilling]]: one configuration module that owns the product rules, so the page, the store, and the quote e-mail cannot disagree.

## Result

- `src/features/configurator/model/configuration.ts` (new, pure) holds the product rules: `OUTDOOR_WALL` (moved from `room.ts`), `DISABLED_FITS` (moved from `Panel.tsx`), and `applyProductRules`. A rule corrects a configuration and never rejects one. The file also holds `sharedConfigurationOf` (a share link, read and corrected), `startConfiguration` (the first configuration from the search params: a share link, `?area=`, or the defaults), `presetImage`, and `StartContent`. `start.ts` is deleted.
- **Store:** `createConfiguratorStore` wraps `set`, so every change (and the initial configuration) passes `applyProductRules`. `setEnvironment` is just `set({ environment })`. `selectWall` outdoors and `setFit('contain')` are now corrected; before, nothing checked them.
- **Server:** `parseDesign` → `parseConfiguration` and `QuoteDesign` → `QuoteConfiguration` (the glossary term). The quote reads the link with `sharedConfigurationOf`. A link with `wall=e&fit=contain&env=out` now gives an e-mail with the front wall ("di fronte"), "l'immagine riempie l'area", and a corrected link. Before, it described the east wall and "immagine intera".
- `src/features/configurator/content.ts` (new, server only): `configuratorContent(locale)` gives the presets, area starts, areas, price rates, and machine height in one shape. `try-your-wall/page.tsx` and `quote/actions.ts` both use it.
- **Tests:** new `model/__tests__/configuration.test.ts` (the rules, a link that breaks them, and the `startConfiguration` cases moved from `store.test.ts`, plus an outdoor link fitted to the front wall). `store.test.ts` has a new "product rules in the store" block, and its `contain` area test uses `placementOf` directly, because the store keeps `contain` off. `handle-quote.test.ts` has the server-path test.
- **Checks:** `vp check` is clean, `vp test` 266 passed, `vp run build` passed. `vp run e2e e2e/configurator.spec.ts e2e/budgets.spec.ts`: 20 passed, 14 skipped (tests for the other device), 0 failed. The full e2e suite was not run.
- `CLAUDE.md`: a new architecture rule, "Product rules live in `model/configuration.ts` only". The configurator views rule and the code layout now name the new files. `Glossary.md` is added to the documentation table.

## Changed files

- `src/features/configurator/model/configuration.ts` (new), `src/features/configurator/content.ts` (new), `src/features/configurator/start.ts` (deleted)
- `src/features/configurator/store.ts`, `model/room.ts`, `model/share.ts` (`SearchParams` exported)
- `src/features/quote/quote.ts`, `handle-quote.ts`, `actions.ts`
- `src/app/[locale]/(pages)/try-your-wall/page.tsx`, `src/islands/configurator/Panel.tsx`, `ImagePicker.tsx`
- Tests: `model/__tests__/configuration.test.ts` (new), `__tests__/store.test.ts`, `src/features/quote/__tests__/handle-quote.test.ts`
- `CLAUDE.md`, `swiss-wallprinting/Specs/Architecture review.md`, this entry, `swiss-wallprinting/Prompt Log/Prompt Log.md`

## Decisions

- The design is the author's answers to rounds 1 and 2 of [[2026-10-31 04 - Configuration module grilling]].
- `OUTDOOR_WALL` moved into the configuration module, because it is a product rule and the store no longer needs it.
- The `contain` area test stays, through `placementOf`: the placement still supports "whole image" for the day it is turned on again.

## Open items

- Committed on `refactor/architecture` on the author's request ("Yes, commit"), not pushed; the `.claude/` deletion and `swiss-wallprinting.rar` were left out.
- The behaviour in the browser has not been checked by hand (outdoors, then a wall click; old links with `fit=contain`). The e2e configurator tests pass.
- Next candidate: 2, the configurator readout (formats, price, and link in one module for the panel, the dialog, and the e-mail).
- `.claude/` is still missing from the working tree.
