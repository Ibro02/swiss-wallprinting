---
tags: [prompt-log]
date: 2026-10-23
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-23 03 - Project cards of one size, lightbox swipe

## Prompt

> it is better,
>
> but i found new UI errors on mobile:
>
> Projects tab:
>
> 1. Flip cards are sometimes huge on mobile, that must be fixed. All Cards should be the same size always, what we can do is when the card is flipped have a "show more" link at the end (when there is not enough space) and then when user clicks it then expand the card or make the card scrollable. If you have a better solution, then use it
> 2. When I run the gallery view on mobile (canvas), we could make it mobile friendly, switching images with a swipe of a finger

(With the `/no-ui-flash` skill.)

## Goal

On the projects page: every flip card the same size, a way to read a long story, and a lightbox that changes photos with a swipe on phones.

## Result

- **Why the cards were huge:** both faces of a flip card shared one grid cell, so the card was as tall as its longer face. On a 375 px phone the fronts were 408 to 498 px, but Barber House (story 524 characters) was 673 px and Caviezel (762) 803 px.
- **Cards of one size:** the back is now laid over the front (absolute, the same grid area) and never makes a card taller; the list has equal rows (`auto-rows-fr`), as tall as the tallest front. The photo takes the extra height (at least 4:3, `object-cover`), so a card with a short text shows more photo instead of an empty pane. Measured: every card 500 px on a Pixel 7 (412 px), 498 px at 375 px, 616 px on a 1280 px desktop, turned or not.
- **A long story:** chosen over the two options in the prompt, because both change something the author wants fixed:
  - *expanding the card* would make that card (and, with equal rows, every row) taller;
  - *a scrollable card* traps the finger: a swipe over the card scrolls the story, not the page.
  
  Instead the back shows as much of the story as fits, it fades out at the bottom, and **"Show more"** (IT "Mostra di più") opens the whole story in a **sheet**: an HTML popover with `role="dialog"`, a bottom sheet on phones (up to 85 % of the screen, the page under it does not scroll), a centred card from 640 px. It works without JavaScript; Escape and a tap outside close it, and the focus returns to "Show more". It rises in 280 ms (transform only) and fades with reduced motion.
- **"Show more" only when needed, right in the first frame (no-ui-flash):** the story box is a scroll container (`overflow: hidden`) with a CSS scroll timeline, which is active only while there is overflow; the fade and the button are animations on that timeline, so they apply only to a story that does not fit, with no measuring script and no change after hydration. On phones: Barber House and Caviezel; on a desktop no story needs it. Browsers without scroll timelines show the fade and the button on every story (the sheet then shows the same text). An `!important` rule keeps the button hidden and out of the tab order while the card shows its front.
- **Lightbox swipe:** the lightbox is now a row of slides with CSS scroll snapping (`snap-mandatory`, `snap-always`): a swipe moves exactly one photo with the browser's own touch physics, a short swipe springs back, and there is no gesture code. The arrow buttons and keys scroll the same row (smooth; instant with reduced motion), and they stop at the first and last photo (`aria-disabled`) instead of jumping around. Opening jumps straight to the photo before the first frame. Only the open photo and its neighbours load. On phones the row uses the full width under the buttons; the caption moves with its photo, the position ("3 di 16") stays at the top left. The backdrop's blur is gone on phones (under a 92 % dark layer it was invisible and cost a redraw per swipe frame).
- **Checked:** with touch events on the emulated Pixel 7 (swipe left, left, right, a short swipe: 3 → 4 → 5 → 4 → 4), arrow keys, Escape, focus return; screenshots of the cards (dark and light, front, back, sheet), the lightbox on a phone and a desktop.
- **New browser tests** (`e2e/projects.spec.ts`): one card size before and after turning, the story sheet (phone), the lightbox swipe with touch events (phone).
- **Checks:** `vp check` clean (one lint hint, `prefer-tag-over-role`, turned off at the sheet with the reason), `vp test` 243 passed, production build passed. `vp run e2e`: 122 passed (the new project tests among them), 24 skipped by design, **4 failed**: the axe test of the projects page, light and dark, desktop and phone, timed out. It waits for every animation to finish before axe runs, and the new "Show more" animations follow a scroll position, so they never finish. The test now waits only for animations in time; fixed and run again in [[2026-10-23 04 - FAQ lift hover, magenta process glow]].
- **JavaScript:** the projects page is 159.6 KB gzip (the budget is 160): the lightbox code added about 0.4 KB. The services page was already 159.2 KB. Headroom needs the known Phase 6 item: the client islands get their texts from the server, so next-intl (about 15 KB) leaves the browser.

## Changed files

- `src/features/projects/ProjectList.tsx` (equal rows, the back over the front, `Story`, "Show more", the sheet, the photo box that grows)
- `src/app/globals.css` (`.flip-card__story`, `.flip-card__more`, `.story-sheet`)
- `src/islands/GalleryGrid.tsx` (the scroll-snap lightbox)
- `messages/*.json` (`Projects.moreStory`, `Projects.closeSheet`)
- `e2e/projects.spec.ts` (new)
- `CLAUDE.md`, `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- **A sheet for the whole story**, not a taller or scrollable card: every card keeps its size, the page scrolls normally, and the full text is comfortable to read on a phone.
- **Overflow from CSS** (scroll timeline), not from a script: no flash, no extra JavaScript on a page at 159 of 160 KB.
- **The swipe from CSS scroll snapping**, not a gesture library: native touch physics on every phone, almost no code.

## Open items

- Check on a real phone: the swipe, the sheet, and Safari's scroll timelines (supported since Safari 26).
