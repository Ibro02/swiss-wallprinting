---
tags: [prompt-log, performance, navigation]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (committed on main, not pushed)
---
# 2026-11-01 11 - Instant page changes

## Prompt

> @"C:\Users\IbrahimHodžić\Downloads\Firefox 2026-11-01 13.06 profile.json.gz"
> This is performance of my website when I switch between pages
>
> It needs to be instant switch, currently it takes a lot of time to make that move

## Goal

Page changes must feel instant. The author sent a Firefox profile of page changes (the phone menu, a narrow window).

## Result

**The profile** (Firefox 159, 65 s, the tab `http://localhost:3000/en`, the dev server). Six page changes from the phone menu:

| Page | Click → server answer (RSC) | Then |
|---|---|---|
| About | 119 ms (compiled before) | 0.8 s of scrolling up |
| Services | 1572 ms | — |
| Projects | 1399 ms | 0.7 s of scrolling up |
| FAQ | 1353 ms | 0.6 s of scrolling up |
| Contact | 1427 ms | — |
| Try your wall | 1596 ms | — |

- **Cause 1, the dev server (dev only):** during the wait the Next.js dev badge animates "Compiling…" (`slotMachineEnter`, `ellipsisFade` in the profile). Each page is compiled on its first visit. The browser's own work after the answer is 40–50 ms. A warm dev server answers in 0.18–0.37 s (measured with `curl`), and dev does not prefetch.
- **Cause 2, smooth scrolling (also in production):** the root has `scroll-behavior: smooth` (`globals.css`, for in-page anchors). Since Next.js 16, Next.js turns it off during a page change only when `<html>` has `data-scroll-behavior="smooth"`; the dev log warned about it. Without the attribute, a page change from far down showed the new page and then scrolled it up for 0.6–0.8 s (76 scroll events after "About").
- **Fix:** `data-scroll-behavior="smooth"` on `<html>` (`src/app/[locale]/layout.tsx`). In-page anchors stay smooth. The global 404 page links with a plain `<a>` and needs no change.
- **Test:** `e2e/page-change.spec.ts`, "a page changed to from far down starts at the top at once" (desktop and phone menu): from 2000 px down on Services, change to Projects; one frame later `scrollY` is 0. It failed before the fix (472 px still to go on the phone) and passes after it.
- **Measured in Firefox (Playwright Firefox, production build on port 3001)**, click → new page in the DOM, from 800–1500 px down, after 1.2 s on the page (the prefetch):

| | Projects | FAQ | Contact | About | Services |
|---|---|---|---|---|---|
| Desktop, header pill | 115 ms | 37 ms | 38 ms | 56 ms | 39 ms |
| Phone width, menu | 91 ms | 34 ms | 43 ms | 41 ms | 132 ms |
| Dev server (warm), desktop | 441 ms | 542 ms | 295 ms | 347 ms | 231 ms |

  Each new page was at the top in the same frame. Then the 150 ms fade of the first screen ([[2026-11-01 05 - Short fade on page changes]]).
- **Checks:** `vp check` clean; `vp run build` passed; full `vp run e2e`: 143 passed, 29 skipped, 0 failed. `vp test` was not run (no unit-tested code changed).
- `CLAUDE.md`, the motion rule: the dev and production numbers, and why `data-scroll-behavior` must stay.

## Changed files

- `src/app/[locale]/layout.tsx`
- `e2e/page-change.spec.ts`
- `CLAUDE.md`, this entry, `Prompt Log.md`

## Decisions

- The fix is Next.js's own switch, not a removal of smooth scrolling: in-page anchor links keep the smooth scroll.
- No dev-only change: a dev server cannot be instant (it compiles on the first visit and renders every request, without prefetch). Judge speed with `vp run build` and `vp run start` (http://localhost:3001).

## Open items

- Committed on `main` with entries 12 and 13 ("Yes, commit"), not pushed.
- Optional: a dev warm-up that requests every page once after `vp run dev` starts, so the first visit is about 0.3 s instead of 1.4–1.6 s. The author said yes: built in [[2026-11-01 12 - Dev warm-up]].
- Not checked on a real phone or in the author's own Firefox (Playwright's Firefox only).
