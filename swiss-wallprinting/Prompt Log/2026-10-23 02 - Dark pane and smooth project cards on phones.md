---
tags: [prompt-log]
date: 2026-10-23
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-23 02 - Dark pane and smooth project cards on phones

## Prompt

> cool, but i have found a bug, in the dark mode on mobile apps in projects tab, card inside a flip card is light color (even if it's supposed to be dark)
>
> then, for mobiles, these cars are lagging little bit. Maybe to compress images for mobile env, or do you have a better solution so our website can be smooth?

## Goal

On phones: the glass pane of the project flip cards must be dark in the dark theme, and the projects page must scroll smoothly.

## Result

- **The light pane:** not reproducible in the emulator (there the pane was dark), so the cause is how real phones render it. The site already declares `color-scheme`, so it is not the browsers' automatic dark mode. The pane used `backdrop-filter` inside a card that turns in 3D (`preserve-3d`, `backface-visibility`); phone browsers, Safari above all, are known to draw such a pane without its own background and show only the blurred photo behind it, which is light. **Fix:** no `backdrop-filter` on the pane; the frost is a gradient (light: white 80 % → 95 %; dark: paper 90 % → 97 %) with the bright rim. Text contrast over the photos: light 6.22, dark 5.05 (AA).
- **The lag**, found from what is expensive on a phone's GPU and decoder (the headless emulator renders in software and shows a steady 16.7 ms per frame whatever the variant, so it cannot measure this):
  1. **`backdrop-filter: blur(24px)`** on every card, redrawn while the cards rise in with the scroll: removed (above).
  2. **The hidden back face** of every card was a drawn layer too: now the face turned away is `visibility: hidden`, switched 300 ms into the turn (after edge-on; the spring passes 90° after about 120 ms). Checked: at rest only the front is drawn, both during the turn, only the back after it, and the front again after turning back.
  3. **Big decodes for a small view:** each card decoded a 924 × 2000 portrait photo to show a 4:3 slice. Now each project has a 4:3 cover crop (1200 × 900, `projects/*-cover`, sharp's attention strategy; Milly Torte centred, because attention chose the ceiling light), about a third of the pixels. The first card's cover loads at once (`loading="eager"`, high priority: the LCP image); the others lazily.
  4. **The gallery on phones:** two columns instead of one, with `sizes="(min-width: 1024px) 33vw, 50vw"`, so a phone loads and decodes photos about half as wide; all lazy (it is below the cards now); smaller captions on phones.
  - Compressing the files further would not have helped much: `next/image` already serves WebP/AVIF in the width the `sizes` ask for. Measured on the emulated phone after the change: 22 images, about 1 MB for the whole page.
- **Build:** one `next build` failed with `EPERM` on `.next/static` (OneDrive locking a file, as `CLAUDE.md` warns); the second run passed.
- **Checks:** `vp check` clean, `vp test` 243 passed, production build passed, `vp run e2e` 122 passed and 22 skipped by design (axe clean on every page, light and dark, desktop and phone); first-load JS of the projects page 159 KB gzip, unchanged. Screenshots on the phone (dark front, dark back, gallery).

## Changed files

- `src/features/projects/ProjectList.tsx` (pane gradient without `backdrop-filter`, `flip-card__face--front`, eager first cover)
- `src/app/globals.css` (`.flip-card` faces: visibility switch)
- `scripts/images.ts` (`cover` and `position` options, six cover crops), `src/content/images/photos.ts`, `public/photos/projects/*-cover.jpg` (generated)
- `src/content/projects.ts` (covers first)
- `src/islands/GalleryGrid.tsx` (two phone columns, `sizes`, lazy, captions)
- `CLAUDE.md`, `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- **No `backdrop-filter` inside the flip cards**, not only on phones: the same bug can hit desktop Safari, and the gradient looks almost the same over the photo's edge.
- **Crops at build time**, not CSS cropping of big images: the phone decodes what it shows.
- **Two gallery columns on phones:** less to load and scroll; the lightbox shows each photo large.

## Open items

- Check on the real phone (the bug and the lag are about real phone rendering, which the emulator cannot show).
