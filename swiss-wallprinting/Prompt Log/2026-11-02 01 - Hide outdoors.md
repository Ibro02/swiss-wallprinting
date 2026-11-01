---
tags: [prompt-log]
date: 2026-11-02
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-02 01 - Hide outdoors

## Prompt

> hide outdoors option

## Goal

The configurator no longer offers "Outdoors"; it can come back quickly.

## Result

- A product rule, like "Whole image": `DISABLED_ENVIRONMENTS = ['exterior']` in `model/configuration.ts`, and `ENVIRONMENTS` (the choosable ones). `applyProductRules` turns an outdoor configuration into indoors, on its own wall; so an old share link with `env=out`, `?area=` of an outdoor area (facade), the store, and the quote on the server all agree. It takes the disabled list as an optional argument, so the tests of the outdoor one-wall rule still run with `[]`.
- `Panel.tsx`: the "Where" section (desktop) and the "Dove" tab (phones) are left out while one environment is left; the phone tabs are five columns then.
- The outdoor scene (`OutdoorWall`), `OUTDOOR_WALL`, the messages, and the price per environment stay.
- Tests: configuration and store tests now expect indoors (the outdoor rule tested with outdoors on); the quote e-mail test expects the indoor right-hand wall and no `env=out`; the configurator e2e follows `ENVIRONMENTS` (no "Dove" tab now; it comes back with the list).
- Checks: `vp test` 311, `vp check` (the known `hasMock` warning), build, full e2e 138 passed (36 skipped). Phone at 360 × 740: five tabs; `?area=facade` opens indoors with the facade's wall size.

## Changed files

- `src/features/configurator/model/configuration.ts`
- `src/islands/configurator/Panel.tsx`
- `src/features/configurator/model/__tests__/configuration.test.ts`, `src/features/configurator/__tests__/store.test.ts`, `src/features/quote/__tests__/handle-quote.test.ts`
- `e2e/configurator.spec.ts`
- `CLAUDE.md`

## Decisions

- A correcting product rule, not a removal: old links keep opening (indoors), and an empty `DISABLED_ENVIRONMENTS` brings outdoors back.

## Open items

- The outdoor application area (facade) still links to the configurator, which opens it indoors with the facade's size. Keep, or change the link?
- Not committed.
