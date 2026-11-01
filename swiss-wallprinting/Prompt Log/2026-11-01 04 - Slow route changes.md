---
tags: [prompt-log, performance, navigation]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (fix in 2026-11-01 05)
---
# 2026-11-01 04 - Slow route changes

## Prompt

> when I switch routes, it renders soo slow, can we somehow fast it up

## Goal

Find out why a page change feels slow, and make it faster.

## Result

The agent measured a click on a header link: the time from the click until the new page's `h1` is in the DOM, in the browser pane.

| Server | First visit of a page | Page seen before |
|---|---|---|
| Dev (`vp run dev`, port 3000, the author's server) | 1.5–1.8 s (`/it/note-legali` 1841 ms, `/it/privacy` 1540 ms) | 125–215 ms |
| Production (`vp run start`, port 3001) | 12–64 ms (every page, the configurator 64 ms) | same |

- The server's HTML is fast in dev too (0.2–0.4 s with `curl`), and there were no long tasks after the swap. The first-visit time in dev is Next.js compiling the route on demand (slower in a OneDrive folder on Windows). A production build prefetches the header links and swaps a page in a few tens of milliseconds.
- After the swap, every page plays the entrance animation again: `data-rise` is 0.8 s with delays up to 0.28 s (`globals.css`), so the first screen is complete only about 1.1 s after the click. That is the slow feel that a production build also has.
- No code changed yet.

## Changed files

- This entry; `swiss-wallprinting/Prompt Log/Prompt Log.md`.

## Decisions

## Open items

- Answered "Yes, short fade": built in [[2026-11-01 05 - Short fade on page changes]].
