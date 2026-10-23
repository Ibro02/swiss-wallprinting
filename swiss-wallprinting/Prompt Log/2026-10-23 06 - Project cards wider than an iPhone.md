---
tags: [prompt-log]
date: 2026-10-23
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-23 06 - Project cards wider than an iPhone

## Prompt

> Ok, it's all good now, but there is a new issue
>
> Project cards are too wide for mobile, and it is not responsive at all
>  /responsive-design

(With the `responsive-design` skill. Answers to my questions: the cards are wider than the screen, on a real iPhone in Safari.)

## Goal

On an iPhone, every project card as wide as the screen allows, at every width, in every language.

## Result

- **Not reproduced in the emulators:** Chromium (Pixel 7), Playwright's Firefox and WebKit, from 320 to 1536 px, fresh loads and a window narrowed step by step, all four languages: the page was never wider than the screen, every card was the screen minus the margins. Playwright's WebKit is a newer engine than Safari on the iPhone.
- **The cause (most likely):** a WebKit sizing quirk. Since [[2026-10-23 03 - Project cards of one size, lightbox swipe]] the photo box has `aspect-ratio: 4/3` and grows (`flex: 1 0 auto`) to fill the equal-height card. Safari can take such a box's width from its height (4:3 of a 500 px card is 667 px). The list's column (an implicit `auto` column) and the card's inner grid both had a content minimum, so one wide photo box made every card wider than the screen, and the phone zoomed the page out ("not responsive at all").
- **Proven with a simulation** (Chromium, 390 px): giving one photo box a 667 px minimum width made every card 685 px and the page 714 px, before the fix; after it, the cards stay 334 px and the page 390 px.
- **The fix: a card's width no longer depends on what is in it.**
  - The list's columns are `minmax(0, 1fr)` (`grid-cols-1`, as `md:grid-cols-2` already was), the cards `min-w-0`, and the card's inner grid (`.flip-card__inner`) `minmax(0, 1fr)`.
  - Each face is a size container (`@container`), so nothing inside it can make it wider.
  - The photo's 4:3 minimum is `min-h-[75cqw]` (75 % of the face's width), not `aspect-ratio`; it still grows to fill the card.
- **Checked** in Chromium, Firefox, and WebKit at 320, 390, 430, 640, 767, 768, 1024, 1280, and 1536 px: one card size per width, the photo at least 4:3 (the smallest ratio exactly 0.75), the page as wide as the screen. All four languages at 300 to 320 px (Safari's text size makes the page narrower): nothing wider than the screen from 312 px; at 300 px (below every phone) only the Bosnian header pill is 3 px over, without a scroll.
- **New browser test:** wide content in one card changes neither the card widths nor the page width (desktop and phone).
- **Checks:** `vp check` clean, `vp test` 243 passed, production build passed, `vp run e2e` **130 passed** (the new width test on desktop and phone among them), 24 skipped by design, none failed. First-load JS of the projects page unchanged: 159.73 KB gzip (CSS only).

## Changed files

- `src/features/projects/ProjectList.tsx` (`grid-cols-1`, `min-w-0`, `@container` faces, `min-h-[75cqw]` photo box)
- `src/app/globals.css` (`.flip-card__inner` columns)
- `e2e/projects.spec.ts` (the width test)
- `CLAUDE.md`, `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- **Width from the column only**, three times over (grid columns, inner grid, size containers), instead of chasing one Safari version's sizing: whatever a browser computes inside a card, the card cannot grow.
- **`75cqw` instead of `aspect-ratio`** for a minimum on a box that grows.

## Open items

- The author checks on the iPhone (the dev server on the computer's network address).
- With 130 % text at 320 px, the closing card's "Open the configurator" button is 16 px wider than the screen (another page part, not the cards; seen while measuring).
