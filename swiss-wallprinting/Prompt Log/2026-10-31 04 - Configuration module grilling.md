---
tags: [prompt-log, architecture, configurator]
date: 2026-10-31
agent: Claude Code (Opus 5.5)
status: done (author confirmed; built in 2026-11-01 01)
---
# 2026-10-31 04 - Configuration module grilling

## Prompt

> 1: configuration module

## Goal

Use the `grilling` skill to work through the design decisions for candidate 1 of the second review ([[Specs/Architecture review#Second review (2026-10-31, branch `refactor/architecture`)]]). Candidate 1 is a configuration module that owns the product rules (outdoors means one wall, no "whole image"), so the page, the store, and the quote e-mail cannot disagree. Write no code until the author confirms a shared understanding.

## Result

- The agent read `start.ts`, `model/share.ts`, `store.ts`, `quote.ts` (`parseDesign`, `quoteMail`), `quote/actions.ts`, `try-your-wall/page.tsx`, and the outdoor and fit parts of `Panel.tsx`. Facts:
  - The rules are applied in `startConfig` (a share link: outdoor wall, `cover`) and in `setEnvironment`. `selectWall` and `setFit` do not guard them. `DISABLED_FITS` is a constant in the panel only.
  - The server reads the quote's configuration with `fromSearchParams` and goes straight to `placementOf`, without `startConfig`.
  - `share.ts` is a codec: it clamps values but knows no product rule.
- **Round 1** (five questions, each with the agent's recommendation): where the rules are enforced; what the module covers; whether the server corrects or rejects a configuration that breaks a rule; what "whole image is off" is (temporary or removed); whether the share-link codec stays rule-free.

## Changed files

- This entry; `swiss-wallprinting/Prompt Log/Prompt Log.md`.

## Decisions

- **The author chose candidate 1**, the configuration module.
- **Round 1, answered "Yes to all" on 2026-11-01:**
  - Q1: the rules **correct a configuration on the way in**: one function makes any configuration valid (outdoors → `OUTDOOR_WALL`, a turned-off fit → `cover`). The types do not change; the 3D code is not touched.
  - Q2: the module covers the rules **and** the way from input (share link, `?area=`, defaults) to the first configuration. It absorbs `startConfig`. `placementOf` stays derived and separate.
  - Q3: the server **corrects** a configuration that breaks a rule, like the page. It does not reject it.
  - Q4: "whole image" is **turned off for now**: `contain` stays in the model, the module owns the list of turned-off fits, and the panel reads it.
  - Q5: `share.ts` **stays a rule-free codec** (it encodes, decodes, and keeps values within their limits). Its round-trip test of `fit=contain&env=out` stays; the module's tests check the correction.
- **Round 2, answered "Yes to all" on 2026-11-01:**
  - Q6: the store sends **every** change through the correction once, inside `createConfiguratorStore`, so every action (also a future one) is covered.
  - Q7: the rule function reads and corrects only the fields that the rules touch (`wall`, `fit`, `environment`) and passes the rest through, so the store state and the server's share-link configuration both fit.
  - Q8: the module is `src/features/configurator/model/configuration.ts` (pure, tested). `start.ts` is merged into it and deleted. Content comes in as data; the module never imports `src/content`.
  - Q9: one small mapping `src/features/configurator/content.ts` (presets, area starts, areas, price rates, machine height) for `try-your-wall/page.tsx` and `quote/actions.ts`. Only the configurator's data; the content catalogue (candidate 4) stays separate.
  - Q10: `DISABLED_FITS` moves into the module; the panel imports it. Hiding the wall choice and the depth outdoors stays in the panel (display).
  - Q11: new `configuration.test.ts` (link, `?area=`, defaults; the correction of `env=out&wall=e&fit=contain`; `selectWall` outdoors and `setFit('contain')` through the store); a server-path test (`parseConfiguration` + `quoteMail` with a link that breaks a rule: the e-mail says "di fronte" and the filled area); the outdoor tests in `store.test.ts` and `share.test.ts` stay.
  - Q12: [[Glossary]] made with **Configuration**, **Product rule**, **Share link**; `QuoteDesign` → `QuoteConfiguration`, `parseDesign` → `parseConfiguration`.

## Open items

- None. The author confirmed the shared understanding ("Yes, start coding"); the build is [[2026-11-01 01 - Configuration module]].
