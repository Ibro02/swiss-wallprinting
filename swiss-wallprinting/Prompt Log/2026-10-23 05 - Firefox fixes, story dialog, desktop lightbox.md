---
tags: [prompt-log]
date: 2026-10-23
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-23 05 - Firefox fixes, story dialog, desktop lightbox

## Prompt

> We have some bugs:
>
> At hero section, hover effect on "process-title" on other all cards are lime, but it is supposed to be magenta (except for the first card)
>
> Then, show more link in projects tab: I like it on mobile, but it messes up mobile responsivnes after it's open. Then, it is messed up when there is more text, and there is overload in cards with text. Also the way "show more" opens in desktop currently isn't good, it is unprofesional
>
> At the projects tab, in desktop mode, images can't be opened and there is a white horizontal scroll across the div. In desktop it shouldn't be visible at all
>
> Don't create new branch, do it on main, just don't push it until I don't say so
>
> Something happened to you during merging  to the main. Just saying that you should be careful and use /no-ui-flash

(With the `/no-ui-flash` skill. Answers to my questions: the images that cannot be opened are the gallery photos, the scrollbar is in the open photo view, and the lime light shows in Firefox, light theme.)

## Goal

Fix the three reports on `main` (no branch, no push): the process light, "Show more" on phones and on a desktop, and the gallery's lightbox on a desktop.

## Result

- **The author's browser is Firefox** (158, the default browser on this computer); every check so far ran in Chromium. Firefox has no CSS scroll timelines, which explains the projects report: there, "Show more" and the fade were on **every** story (the fallback), so a desktop showed a button on stories that fit, which opened the same text again in a small card.
- **Not reproduced:** the lime light on process cards 02–04 and the broken lightbox. Both were checked in Chromium and in Playwright's Firefox 157, headless and in a window, light and dark, at 1280, 1366 × 650, 1536 × 730, and 1920 × 940, with real mouse moves and clicks: magenta, and the photo opened. The fixes below remove the parts these bugs could come from; the author should check them again in the author's own Firefox (a hard reload, Ctrl+F5).
- **Process light:** the colour no longer comes from Tailwind arbitrary properties with a lime fallback in the gradient (`rgb(var(--glow-rgb, lime) / …)`). `GlowCard` has a `tone` prop (`lime` | `magenta`); each tone is one class in `globals.css` with its whole colour and strength, light and dark (magenta 22 % / 30 %, lime 32 %, as measured in [[2026-10-23 04 - FAQ lift hover, magenta process glow]]).
- **"Show more", only when needed, in every browser:** Chrome and Safari keep the CSS scroll timeline (right in the first frame). For Firefox, `StoryFit` (a small island) marks a story box that overflows (`data-overflow`, with a ResizeObserver on the box and its text, so a resize or the fonts arriving update it). Until it is set the back shows no button (no-ui-flash: no button rather than a wrong one; the back is hidden until the card turns anyway). Checked in Firefox and WebKit: on a phone only Barber House and Caviezel get the button, at 1024 px only Caviezel, at 1536 px none.
- **Measured where stories overflow** (all four languages): on phones the two long stories (and at 360 px some others); on a desktop between 768 and about 1280 px the long ones (Caviezel even at 1280 in German and English); from 1536 px none. So a desktop needs "Show more" too.
- **Desktop story view (the author: unprofessional):** from 640 px "Show more" opens a dialog with the project's photo beside the whole story (the place, the title, the close button, the story and its closing line), up to 60 rem wide, scaling in from 96 % in 220 ms with a soft shadow and a blurred backdrop. The photo loads only when the dialog opens. Phones keep the bottom sheet (the author likes it), text only.
- **Phone sheet:** the page under the sheet is no longer scroll-locked (`overflow: hidden` on `<html>` can resize a phone's viewport, its address bar showing, and move the page under the sheet; the most likely cause of "messes up mobile responsiveness after it's open", which I could not reproduce in the emulators). The sheets are now rendered after the list, outside the cards, so the cards' 3D (`perspective`, reveal transforms) can never become a sheet's containing block. A reduced-motion gap was closed (the starting style still moved the sheet).
- **"Overload" on the card's back:** the fade now ends before the edge, so the line the edge cuts through is not seen (it was half a line under the fade).
- **Lightbox on a desktop (the author: no horizontal scroll there at all):** with a mouse there is no row any more: the slides lie on top of each other in one grid cell, the open one fades in (200 ms), and the arrows and keys change the open photo. Nothing can scroll, so no browser can draw a scrollbar. Touch screens keep the swipe row (scroll snapping); its scrollbar is hidden for WebKit too (`::-webkit-scrollbar`). On phones the row is as wide as the dialog, not `100vw` (which counts a desktop browser's scrollbar, so a narrow desktop window got a horizontal scrollbar). The caption is centred under the photo on wider screens.
- **Checks:** `vp check` clean, `vp test` 243 passed, production build passed, `vp run e2e` **128 passed**, 24 skipped by design, none failed (with the new tests: the whole story at 1024 px with its photo, and the desktop lightbox with nothing to scroll; axe clean on every page, light and dark, desktop and phone). In Playwright's Firefox and WebKit (scratch scripts): the buttons only on overflowing stories (phone, 1024, 1536 px), the dialog in both themes, the focus back on "Show more" after Escape, the lightbox in a Firefox window at three desktop sizes. First-load JS of the projects page: **159.73 KB** gzip (was 159.57; the budget fails from 160.5), services 159.21.

## Changed files

- `src/islands/GlowCard.tsx` (`tone`), `src/features/home/ProcessSection.tsx`, `src/app/globals.css` (`.glow-card--magenta`, the story overflow for every browser, the fade, the story dialog, no scroll lock, `.lightbox`)
- `src/features/projects/ProjectList.tsx` (`StorySheet` after the list, the photo beside the story), `src/islands/StoryFit.tsx` (new)
- `src/islands/GalleryGrid.tsx` (one photo at a time with a mouse, the row's width)
- `e2e/projects.spec.ts` (the card locators, the story at 1024 px with its photo, the desktop lightbox)
- `CLAUDE.md` (Firefox, the tones, the story dialog, the lightbox), `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- **A small island for Firefox** instead of a button on every story: the author tests in Firefox, and a button that opens the same text is the "unprofessional" part. Chrome and Safari still decide in CSS.
- **The photo beside the story** on wider screens: a story view like a case study, not a text card.
- **No lightbox row with a mouse:** the row was only there for the swipe.

## Open items

- The author checks the process light and the lightbox again in their own Firefox; if the lime light or the broken lightbox are still there, a screenshot and Firefox's console would show what differs from Playwright's Firefox.
- A real phone: the sheet without the scroll lock.
- The e2e tests run in Chromium only; a Firefox project in `playwright.config.ts` (and CI) would cover the author's browser.
