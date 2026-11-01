---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-01 20 - Minimum speed of the scroll hero (one scroll plays the print)

## Prompt

> ok, can you set up a minimal speed of the scrolling effect, I would like it faster so it can be smoother

Before it (in the same session): the author asked whether a 60 fps video would help, found a slow scroll still jumpy, and then saw that production (entry 19) is already smooth: "you can remove all changes you made now". A blend of neighbouring frames (two canvases) was built and then removed on that request; nothing of it is in the code.

Then:

> When user scrolls the website, video must be faster. What does it mean? It means like user can go with one scroll through the entire transformation. So then there won't be any overlapping or frame drops. The problem is it is frame dropping a little bit, like machine is frame dropping, the printing machine. So if that's possible, so the minimum speed of scroll of video running is like a normal speed of the video or a little bit faster, it would be good. But let's try what will happen.

## Goal

The picture follows the scroll faster, without the slow crawl at the end of a swipe.

## Result

- `smoothTowards` (`print-scroll.ts`) takes `minSpeed` (progress per second): the step is the easing's step or the minimum speed, whichever is larger, and never passes the target. The easing alone covers 12 % of the rest per frame, so it crawled over the last frames of every swipe.
- `PrintOnScroll` has a `minSpeed` prop (default 0); the hero sets `minSpeed={0.5}`: at least half of the print per second, so the last frame (about 1/78) comes within about 25 ms.
- `vp check`, `vp test` (306, two new), the build, and the e2e tests `home` and `budgets` pass.

### Second step: one scroll plays the print

- The hero no longer only follows the scroll: **a scroll forwards plays the whole print to the end by itself**, in `playSeconds` (2 s; the video's print is 78 frames at 30 fps, 2.6 s, so a little faster than filmed), or faster where the scroll is ahead (`playTowards` in `print-scroll.ts`, with tests). A scroll back stops it and rewinds with the scroll; a few pixels back (scroll anchoring while the page loads, `REWIND_PX` 24) do not stop it: the first phone test stopped at a third without that.
- `minSpeed` stays for the rewind.
- e2e: "one scroll plays the print, a scroll back rewinds it" replaces "follows the scroll forwards and backwards". Tested on the author's dev server (`BASE_URL`, no build while it ran), then on a production build: `home` and `budgets` 24 passed; `vp test` 309. The dev page stayed fine.

## Changed files

- `src/features/home/print-scroll.ts`, `src/features/home/__tests__/print-scroll.test.ts`
- `src/islands/PrintOnScroll.tsx`, `src/features/home/Hero.tsx`
- `e2e/home.spec.ts`

## Decisions

- A floor on the speed instead of a stronger easing (`smoothing`): the start of a swipe keeps its soft follow, only the slow end goes. Faster still: raise `minSpeed`, or `smoothing` (0.12) for a quicker follow overall.

## Open items

- The author looks at it on the phone (does the print play smoothly; is 2 s right; does a scroll back feel right). Committed on `main` (the author: "Good, commit"), not pushed.
- On a slow network the first play can outrun the frames (they load on the first scroll): the nearest loaded frame stands in.
