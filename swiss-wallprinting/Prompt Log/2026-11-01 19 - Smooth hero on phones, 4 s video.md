---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-01 19 - Smooth hero on phones, 4 s video

## Prompt

> video at hero section needs to be more smooth, when I scroll on mobile it is "lagging" (Bumpy and uneven)

Added while the agent worked:

> I know the cause! It is because the last video was 4 sec long, and this one is 6 secs
>
> i believe settings hasn't been changed after the video change
>
> I have a shorter video now downloaded (SWP_WebVideo2_4sekunde)
>
> we could also make this faster, so when user scrolls one time it prints out ont the wall

## Goal

The scroll hero must play smoothly on a phone, with the 4 s video, and print the wall in about one scroll.

## Result

- **Measured first** (production build, Playwright Chromium as a Pixel 7, CPU 4× slower, finger drags through the hero; script in the agent's scratchpad). Before: frames p50 33 ms, p90 67 ms, 215 of 597 frames over 34 ms. Two causes on the main thread:
  1. **Every frame drawn was decoded again** (`Decode Image` on the main thread, 99 of 99 draws, about 18 ms each): the browser drops the decoded data of `<img>` frames over its memory limit (all frames decoded are 370 MB on phones), and `img.decode()` does not help a canvas.
  2. **The whole stage restyled on every scroll frame** (about 9 ms): `--p` is inherited, so each new value restyled the 53 elements on the stage, made dearer by the finished `data-rise` animations (fill `both`) and the always-running loading bar; and the phone pan repainted the poster on every frame.
- The video length was not the cause: the hero always gets at most 100 frames. The shorter video and scroll were done too, as the author asked.
- **Fix in `PrintOnScroll`:** the frames download as files (`fetch`), `createImageBitmap(blob)` decodes only the frames near the scroll position off the main thread (`decodeWindow`, 64 MB: 18 phone or 11 desktop frames, two ahead for one behind), and frees the others. `--p` is written only while the intro or the outro moves (`overlayProgress`); the pan is a number on the frame (`focusAt`, `@property --focus` not inherited); the frame is its own layer; the poster is hidden once the canvas has drawn (`data-drawn`); `data-rise` fills only backwards; the loading bar runs only while shown.
- **Video:** `vp run frames` with `SWP_WebVideo2_4sekunde.mp4`: 78 frames (21 … 98 and 119), desktop 3.4 MB, phone 2.1 MB (was 4.9 and 3.2). The 6 s video is in `Assets/Videos/old/hero 2026-11-01 18-58.mp4`.
- **Scroll length:** `400vh` → `200vh`: the print takes about one screen of scroll (one swipe on a phone).
- After (same test): frames p50 16.7 ms, 2 of 371 over 34 ms, no decode on the main thread, style 0.86 s instead of 7.4 s.
- `vp check` (0 errors; the one warning is `hasMock` in `Testimonials.tsx`, from before), `vp test` (304), the build, and the e2e tests `home`, `smoke`, `budgets` (54 passed) pass.

## Changed files

- `src/islands/PrintOnScroll.tsx`
- `src/features/home/print-scroll.ts`, `src/features/home/__tests__/print-scroll.test.ts` (`decodeWindow`, `focusAt`, `overlayProgress`)
- `src/app/globals.css` (`--focus` property, frame layer, hidden poster, loading bar, `data-rise` fill)
- `src/features/home/Hero.tsx` (`200vh`)
- `public/frames/hero/**`, `src/content/images/frames.ts` (new video, made by `vp run frames`)
- `e2e/home.spec.ts` (the middle of the scroll checks the canvas's `data-frame`; `--p` stays at 0.1 there)
- `CLAUDE.md` (scroll hero rules)

## Decisions

- ImageBitmaps from the files, not from `<img>`: Chromium decodes `createImageBitmap(img)` again on the main thread (measured), from a Blob off it.
- A bounded window of decoded frames instead of all of them, for the phones' memory.
- The `.premium-glow` lights (process section) also restyle every frame on phones, but cost little (measured); not changed.

## Open items

- **Look at it on the real phone.** Safari on an iPhone may decode `createImageBitmap(blob)` on its main thread (WebKit); the style fixes help there in any case. If it still stutters on the iPhone, the next step is to keep `img.decode()` + `createImageBitmap(img)` for WebKit, or a WebCodecs stream.
- The poster's alt text (`Home.hero.imageAlt`) is unchanged: the 4 s video shows the same picture, to check.
- Committed on `main` (the author: "Smooth now, commit") and pushed.
