---
tags: [prompt-log]
date: 2026-11-03
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-03 07 - CI axe timeouts from the language list

## Prompt

> @"C:\Users\IbrahimHodžić\AppData\Local\Temp\6_Run vp run e2e (1).txt" @"C:\Users\IbrahimHodžić\AppData\Local\Temp\0_quality (1).txt"
> there has been some issues on the CI (e2e tests are failing)  on the last commit

> Yes, skip them

## Goal

Find why CI's e2e job failed on `042d71d` and fix it; then (the author's answer to "skip the reviews band tests while the band is hidden?") skip the band's tests.

## Result

- **The failures** (CI log, job `quality`): 32 failed, 106 passed. 26 are the axe tests (`e2e/a11y.spec.ts`) on the **desktop** project only, every page, both themes: "Test timeout of 30000ms exceeded" in the `page.evaluate` that waits for the time-based animations to finish. The phone axe tests passed. The other 6 are the reviews band tests (the band is hidden since `74894a2`), as before.
- **The cause:** the header's language list (`LanguageSwitcher`, desktop header only; phones have the list in their menu) got a starting-style transition in `042d71d`. Its `<ul>` sits in a closed `<details>`, which does not render its content; a style read (`getAnimations()` does one) started the opacity and scale transitions there. Locally they finished after about 1 s; on CI's Chromium they never finished, so the wait timed out.
- **The fix:** the list animates only while it is open: `.menu-pop` in `globals.css` (an animation on `details[open] > .menu-pop`, `menu-pop`: from 97 % and transparent, 150 ms, `--ease-out`; reduced motion: `fade`). The `<ul>` has no transition any more.
- **Checked** (production build on port 3002, `BASE_URL`): a style read of the closed list starts no animation; opening still grows the list (Chromium and Firefox); e2e `a11y`, `smoke`, `services`: 87 passed. The CI hang itself did not show on Windows, so the next CI run confirms the fix.

- **The reviews band tests skip** while the band is hidden (`e2e/home.spec.ts`: `REVIEWS_SHOWN = false`, a `test.skip` in each of the four band tests; set it to `true` when `<Testimonials />` is back on the home page).
- **Full e2e** against the build (port 3002): 132 passed, 42 skipped (36 light theme while the site is dark only, as on CI, and the 6 band tests), 0 failed.

## Changed files

- `src/islands/LanguageSwitcher.tsx`, `src/app/globals.css` (`.menu-pop`)
- `e2e/home.spec.ts` (`REVIEWS_SHOWN`)
- `CLAUDE.md` (the language list note, with the rule: no transition on the content of a closed `<details>`)

## Decisions

- An animation keyed to `[open]` instead of a transition: it exists only while the list shows, so nothing can wait on it while it is closed.
- The axe test's wait stays as it is: it found a real stray animation.

## Open items

- Confirm on CI after the push. When the reviews band comes back: `REVIEWS_SHOWN = true` in `e2e/home.spec.ts`. Not committed.
