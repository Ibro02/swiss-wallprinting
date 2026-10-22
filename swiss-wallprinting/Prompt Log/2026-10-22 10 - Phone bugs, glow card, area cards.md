---
tags: [prompt-log]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-22 10 - Phone bugs, glow card, area cards

## Prompt

> I notices some UI bugs when I'm in mobile, which are crucial for websites flow, so we need to fix it
>
> 1. Hero section video: when I swap it down, the print-scroll video wannish. Investigate this if it's even possible for mobile apps, If this feature is not possible to make on the mobile devices, then don't use animation, just repeatedly play the video printing the wall print over end over (just reverse the video when it comes to the end) /no-ui-flash  /emil-design-eng . Make camera following the printing maschine
> 2. In "process-title" section, for mobile, make the the second <li> card  (with the button) more "shinny". Use lime and graphite colors and out of it make a gradient card, just like this: https://framer.com/m/PremiumGlowCards-Mr2oxE.js@S2BlxpJufjYsfEZSMJ34
> 3. Can't change dark mode when I run mobile
> 4. 3D doesn't work at all on mobile, it is frozen
>
>
> additional task:
> I would actually like to try to make mobile and for the desktop cards in "areas-title" to look like this: https://framer.com/m/Programs-fpaSe9.js@XeUSDe9VIrW0d2C0bOjk , just on hover instead of blue color, use lime

## Goal

Fix the phone bugs (hero, dark mode switch, 3D), make the hero's camera follow the printer, give the process step "Design and preview" a lime and graphite glow on phones, and restyle the application area cards after Framer's "Programs" with lime.

## Result

- **One cause for bugs 1, 3, and 4: the page never hydrated on the phone.** The author opens the dev server from the phone at `http://192.168.1.19:3000`. Next.js 16 refuses its dev resources (the HMR WebSocket) to any host but localhost unless it is in `allowedDevOrigins`; then React never starts. Checked with a phone emulator (Pixel 7) on that address: no hydration, the HMR socket refused; on localhost: hydrated. Without JavaScript the theme switch does nothing, the 3D never loads, and the hero's CSS hides the poster while the canvas stays empty (the "vanishing" video). **Fix:** `next.config.ts` adds this computer's own IPv4 addresses to `allowedDevOrigins` in development only. After the fix, on the LAN address: the page hydrates, the hero draws frames all the way, the menu switch turns dark on, and the 3D view is ready in about 1 s and answers touch (a drag moves the print). The production site never had this problem.
- **The scroll hero works on phones**, so it stays (no ping-pong video). A canvas image sequence is the usual technique for this on phones; the emulator played all 121 frames by touch scroll.
- **Hardening:** the poster (frame 0) now stays under the canvas until the outro (before: hidden as soon as `--p` > 0). A swipe that is faster than a slow mobile network, or a page whose JavaScript failed, shows the blank wall instead of an empty dark stage; under the outro it still gives way, so the call to action never stands over the blank wall. The same before and after hydration (no-ui-flash).
- **The camera follows the printer.** The printer's x was measured in every frame from its violet UV lights (median x of the violet pixels in the top half): 0.205 at the start, 0.849 at the end, slow at both ends. A phone shows about a quarter of the frame width, and the old straight pan (0.2 → 0.75) lost the printer at the edge in the second half. Now `focus` in `hero-video.ts` is 11 points (every 12th frame), and the new pure `focusTrack()` (`print-scroll.ts`, with tests) turns them into a CSS expression of `--p` (straight lines between the points), set on the frame element. It works before hydration too. The last point turns from the printer behind the pillar to the signature (0.8). Checked at 5, 35, 65, and 95 % on the phone: the printer stays in the middle.
- **Process step 2 on phones** (`.premium-glow`, after "Premium Glow Cards"): a lime tint from the top left, two blurred lime lights that drift slowly (CSS transform, 11 and 14 s; still with reduced motion), a lime glow along the bottom edge, and a thin bright rim. Desktop keeps the mouse light and the shine. The framer component animates its lights with a `requestAnimationFrame` loop and loads `phosphor-react`; this is CSS only. **Contrast** was measured with the text hidden, over a full drift cycle: the first version failed AA (paragraph 4.24 light, 3.73 dark). The paragraph is now white/90 and the lights a little dimmer: paragraph 5.75 light / 4.92 dark, title 7.82 / 6.42.
- **Area cards** (`.area-card`, after "Programs", lime instead of blue): dark graphite cards with a faint rim, the icon in a lime-tinted tile, the title, the line, and at the foot "Prova nel configuratore →" (lime) and the number 01 … 06. Under the mouse: the card rises 6 px, the rim and the glow turn lime, and a band of lime light sweeps across once (on the way out it fades first and jumps back unseen). Mouse only; reduced motion keeps the rim and the glow. CSS only: the cards no longer use `GlowCard` (no tilt, less JavaScript). Phones keep the compact row (icon, text, arrow), now dark.
- **Checks:** `vp check` clean, `vp test` 238 passed (4 new for `focusTrack`), production build passed, `vp run e2e` 114 passed and 20 skipped by design (axe clean on every page in the light and the dark theme, desktop and phone); first-load JS of home 158 KB gzip (guard 160).

## Changed files

- `next.config.ts` (`allowedDevOrigins` in development)
- `src/features/home/print-scroll.ts` (`focusTrack`), `src/features/home/__tests__/print-scroll.test.ts`
- `src/islands/PrintOnScroll.tsx` (`focus` as a track, `--focus` on the frame)
- `src/content/hero-video.ts` (the measured track), `src/content/schema.ts` (`focus` is an array)
- `src/app/globals.css` (the frame's `--focus`, the poster until the outro, `.premium-glow`, `.area-card`)
- `src/features/home/ProcessSection.tsx`, `src/features/home/ApplicationAreas.tsx`
- `CLAUDE.md` (scroll hero, motion rules, code layout, testing on a phone)

## Decisions

- **Keep the scroll hero on phones**: the vanishing was the dev server, not the phone. The ping-pong video was the author's fallback only "if this feature is not possible".
- **`allowedDevOrigins` from the network interfaces**, not a wildcard like `192.168.*.*`: only this computer's own addresses, only in development. A new address needs a restart of `vp run dev`.
- **The poster stays until the outro**: a frame 0 under the middle of the print is better than an empty stage; the rule "never frame 0 under the wrong text" still holds for the outro, the only text there.
- **The glow card only on phones**, as asked; desktop has the mouse effects.
- **No `framer-motion` and no Framer code**: both looks are rebuilt in CSS (the rule in `CLAUDE.md`).

## Open items

- **Author:** reload the page on the phone (the dev server restarted on its own with the new config) and check the four points on the real device. Not checked on an iPhone (no Safari here).
- The area cards on desktop are a little taller than before (more padding, larger title, as in "Programs"); they still fit one screen at 1440 × 900.
- Committed on `main` on the author's next prompt ("Commit these changes on main (no push)."); not pushed.
