---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-01 28 - CI quality fixes

## Prompt

> @"C:\Users\IbrahimHodžić\AppData\Local\Temp\0_quality.txt"
> github is complaining, we have quality errors

Then, while the agent worked, the other step logs of the same run (`1_Set up job` … `21_Complete job`, `system.txt`).

## Goal

The CI job `quality` passes again.

## Result

- **CI's failure:** `e2e/faq.spec.ts` (phone) expected the open FAQ question's background to be white, the light theme's paper; the site is dark only since entry 24, so it is navy `rgb(49, 64, 88)`. The page was right. The test now reads the paper colour from the `bg-paper` token in the page, so it holds in either theme. The agent had run only the theme, axe, smoke, and home e2e after entry 24, not the full suite.
- **A second failure, found by the full suite locally** (after the CI run): `e2e/configurator.spec.ts` "phones show one part at a time": the "Stampa" tab scrolled by 5 px. The "Prezzo finale su accordo" line (entry 27) made the phone price bar about 15 px taller, out of the fixed tool panel. On phones the "Prezzo indicativo" label is now `sr-only` (screen readers keep it; "ca." already says it is an estimate), and the price has no top margin there; with mock rates the label and its "Example" badge stay visible.
- The other step logs: no errors; one GitHub warning (`actions/upload-artifact` targets Node 20 and is forced onto Node 24), which does not fail the job.
- Checks: full e2e 138 passed (36 skipped: light theme, desktop-only, phone-only), `vp test` 310, `vp check`, and Lighthouse CI as in CI (server with `SITE_URL=http://localhost:3001`): all five pages pass; home performance 76 (floor 75; 79–80 before).
- A first local Lighthouse run failed SEO on the configurator (canonical to the live domain): the configurator renders per request, so it reads `SITE_URL` from the running server, and the agent had started it without the variable. CI sets it for the whole job; with it, SEO is 100.

## Changed files

- `e2e/faq.spec.ts`
- `src/islands/configurator/Panel.tsx`

## Decisions

- The phone label goes instead of a taller tool panel, so the 3D room keeps its height.

## Open items

- Home Lighthouse performance 76 is close to the 75 floor: a slow CI runner could fail it. Worth a look (the hero frames, the poster).
- After a change, run the full `vp run e2e`, not a subset. To run Lighthouse locally, start the server with `SITE_URL=http://localhost:3001 vp run start --port 3001` (the `start` script alone uses port 3000).
- Not committed; CI runs again after the push.
