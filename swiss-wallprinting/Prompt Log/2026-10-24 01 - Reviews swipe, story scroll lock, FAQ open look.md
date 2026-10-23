---
tags: [prompt-log]
date: 2026-10-24
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-24 01 - Reviews swipe, story scroll lock, FAQ open look

## Prompt

> We have our first version of the website, and client is happy
>
> But I need to do some fixes
>
> Hero page [mobile]
>
> 1.  testimonials-title section, the list of testimonial cards that flows slowly gets lagy. I would like to make a mobile version with a little different approach: make it drag-and-swipe, and only when user holds the track it stops running
>
>
> Projects:
>
> 1. Don't allow scrolling when story sheet is on
>
>
> FAQ [mobile]
>
> 1. When <details> is open, keep that hover effect

## Goal

Three fixes after the client's approval of the first version: on phones the reviews band is a band the visitor can drag and swipe, which stops only while a finger holds it; the page under an open project story does not scroll; on phones an open FAQ question keeps the lift card's hover look.

## Result

- **Reviews band on touch screens (`MarqueeSwipe`, a new island):** where the primary pointer is coarse, a script runs the band after hydration instead of the CSS animation. It reads the CSS animation's current offset and turns it off in the same task (`data-swipe` on the band), so nothing jumps. It keeps running at the CSS speed (one list per `loopSeconds`: 30 px/s with six reviews); a finger on the band holds it still; a drag moves it one to one; on release it glides on with the swipe's speed and fades back into its run (`GLIDE_MS` 450 ms; a release 80 ms after the last move is a hold, not a swipe); the stop control brings it to rest with the same glide. The strip is the list twice, so the offset wraps by one list in either direction. `touch-action: pan-y` leaves a vertical swipe to the page (the browser cancels the pointer, and the band runs on); a finger that holds the band selects no text and opens no callout. One transform per frame, written straight to the strip (no React render), `will-change: transform` only in this mode, and the loop stops while the band is out of view. Screens with a mouse keep the CSS band (pause on hover and focus); reduced motion keeps the still band that scrolls by hand.
- **Why it lagged:** not measured on the author's phone. The old band is a compositor animation of `transform` on a strip about 3600 px wide under a `mask-image`; the likely causes are the size of the moving layer at a phone's pixel ratio and the slow sub-pixel motion. The new band has the same layer, but the script owns its position, so a finger can take it. If it still stutters on the phone, record it (remote debugging) before the next change.
- **Story sheet scroll lock:** with a mouse (`hover: hover` and `pointer: fine`), CSS: `:root:has(.story-sheet:popover-open)` gets `overflow: hidden` and `scrollbar-gutter: stable` (wheel, keys, and scrollbar stop; nothing moves sideways). On touch screens `overflow` on the root could resize the viewport (the address bar), the reason the lock was removed on 2026-10-23, so `ScrollLock` (a new island) cancels touch moves while a sheet is open, except a move that began on a sheet that scrolls (its `overscroll-behavior: contain` keeps the page still at its ends). A touch on the backdrop can have the sheet as its target, so the touch point decides. The non-passive `touchmove` listener exists only while a sheet is open. The layout never changes, a tap outside still closes the sheet, and the page scrolls again after.
- **FAQ open look on phones:** a new Tailwind variant `touch` (`hover: none`, `pointer: coarse`, or under 640 px). There an open question (`.lift-card[open]`) keeps the hover's look: the lime rim and glow, the 6 px rise, the paper ground (`touch:open:bg-paper`), and one sweep as it opens; reduced motion keeps the rim and the glow. A wide window with a mouse is as before (hover only).
- **Checked (Playwright, scratch scripts in the session's scratchpad):** Chromium Pixel 7 against the dev server: the band runs at 31 px/s, a held finger keeps it still (0.00 px in 800 ms), a 100 px drag moves it 100.0 px, it runs again after release, a swipe glides on, a vertical swipe on the band scrolls the page by 185 px and the band runs on, the stop control stops it. The story sheet: the page does not move under backdrop or sheet drags; at 360 × 600 the sheet itself scrolls (186 px) and the page stays; a tap outside closes it and the page scrolls again. Desktop Chromium and **Firefox** (1024 px): wheel and PageDown do not move the page under the dialog, the header does not shift, the page scrolls after Escape; the band keeps the CSS animation. Firefox at 375 px: the open question has the lift look; at 1280 px it is at rest.
- **Checks:** `vp check` clean, `vp test` 247 passed, production build passed, `vp run e2e` **138 passed**, 28 skipped by design, none failed (new: the finger holds, drags, and lets go of the band; the stop control by the strip's position; the page still under an open story, by touch on a phone and by wheel at 1024 px; the open FAQ question on a phone). First-load JS (gzip): home 158.60 KB, **projects 159.99 KB** (was 159.73; `ScrollLock` adds 0.26 KB, and the guard fails from 160.5), services 159.21, FAQ 152.

## Changed files

- `src/islands/MarqueeSwipe.tsx` (new), `src/features/home/Testimonials.tsx` (band id, `loopSeconds`, the island)
- `src/islands/ScrollLock.tsx` (new), `src/features/projects/ProjectList.tsx`
- `src/app/globals.css` (`touch` variant, `.marquee-band[data-swipe]`, the sheet's mouse lock, `.lift-card[open]`), `src/app/[locale]/(pages)/faq/page.tsx`
- `e2e/home.spec.ts` (band tests by the strip's position: mouse pause, finger hold, drag and release, stop control), `e2e/projects.spec.ts` (the page under an open story), `e2e/faq.spec.ts` (new)
- `CLAUDE.md` (Motion, the FAQ cards, the story sheet lock, islands, e2e)

## Decisions

- **A script only on touch screens.** The author asked for a phone version; the desktop band runs on the compositor and pauses under the mouse, so it stays CSS. A finger must own the position, which a CSS animation cannot give.
- **Pointer events with `touch-action: pan-y`, not a native horizontal scroller.** A native scroller would need a script to scroll it slowly anyway, and Safari keeps scroll positions in whole pixels (steps at 30 px/s); a transform moves smoothly and makes "held = still" exact.
- **Two locks for the story sheet:** CSS with a mouse (it also stops keys and the scrollbar), a touch-move lock on touch screens (no layout change, so no address bar or viewport jump, the cause suspected on 2026-10-23).
- **The FAQ look on phone widths too, not only on touch screens,** so a narrow desktop window (and a responsive view) shows it as well.

## Open items

- Look at the band and the sheet on a real phone (iPhone Safari and the author's Firefox): smoothness, the hold, the glide, and that the page stays still under the sheet.
- The projects page is 0.5 KB under the JS guard: its next island must take bytes out first (or the client islands get their texts from the server, the Phase 6 open item).
- Committed on `main` on the author's request (author and committer Ibro02); not pushed. The demo speech's log entry (09), its `.gitignore` rule, and its `CLAUDE.md` row are still uncommitted: they were not part of this request.
