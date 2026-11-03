---
tags: [prompt-log]
date: 2026-11-03
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-03 06 - Before-after peek and language list motion

## Prompt

> Find potential animations on the website
>
> /find-animation-opportunities
> /no-ui-flash

> Build 1, 2 and 5

## Goal

First a sweep for missing motion (read only), then three of its suggestions: the before/after peek, the divider easing back, and the language list growing from its button.

## Result

- **The sweep** (the skill `find-animation-opportunities`, which is in the untracked `.agents/skills/` folder, not in the app's skill list; with `no-ui-flash`): six suggestions and five places to keep still. Suggested: 1 the before/after peek, 2 the divider easing back, 3 the quote dialog's open and close, 4 the gallery lightbox's open and close, 5 the language list, 6 the configurator's "link copied" note. Kept still: the configurator price, the why-card numbers, the gallery filter, the configurator's phone tabs, the hero and the header.
- **1, the peek** (`BeforeAfter.tsx`, `.before-after` in `globals.css`): once per card, when 60 % of it is in view and its "before" photo has loaded, the divider goes to 28 % and back in 1.1 s (`--ease-in-out`), with the divider and the "before" label shown. A touch, a mouse entering, or a key first cancels it. It starts from the print, as the server renders it (no flash); reduced motion: no peek.
- **2, easing back:** when the mouse leaves, the divider slides back to the print in 220 ms (`--ease-out`) instead of jumping; under the mouse it still follows at once. `--split` is now a registered `@property` (a percentage), so CSS can transition and animate it.
- **5, the language list** (`LanguageSwitcher.tsx`): it grows from the button's corner (`origin-top-right`, from 97 % and transparent, 150 ms, `starting:` classes, no script); reduced motion: a fade.
- **Measured** (production build, Chromium, Firefox, a phone in Chromium): the peek reaches 28 % and comes back to 0; after a hover at 70 %, the divider is at 6 % after 50 ms and at 0 after 150 ms; the language list is at full size within about 80 ms. No errors in the console.
- Checks: `vp check` (the two old warnings), `vp test` 322, build, e2e `services`, `a11y`, `smoke`, `home`, `budgets` against the build: 80 passed, 6 failed (the reviews band tests; the band is hidden since `74894a2`).
- **The e2e tests reuse any server on port 3001.** A dev server from another path (`C:\Users\IbrahimHodzic\…`) ran there, and one run tested it instead of the build (it failed "a browser without AVIF" and took 7.6 minutes). The run above used my build on port 3002 with `BASE_URL=http://localhost:3002`.

## Changed files

- `src/islands/BeforeAfter.tsx`, `src/islands/LanguageSwitcher.tsx`
- `src/app/globals.css` (`@property --split`, `.before-after`, `split-peek`)
- `CLAUDE.md` (the before/after and language list notes)

## Decisions

- The peek is a CSS animation on the registered `--split`: an animation wins over the inline `--split` while it runs, and React renders nothing per frame.
- Once per card, not once per page: the services page shows the cards one group at a time.

## Open items

- Suggestions 3, 4, and 6 (the quote dialog, the gallery lightbox, the "link copied" note) are not built.
- Look at the peek on a real phone. The reviews band e2e tests fail while the band is hidden. Not committed.
