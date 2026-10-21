---
tags: [prompt-log]
date: 2026-10-21
agent: Claude Code (Claude Opus 5.5)
status: done
---
# 2026-10-21 03 - Phase 5 configurator complete

## Prompt

> Start Phase 5: configurator complete.

## Goal

Phase 5 of [[Development Plan#8. Phases]]: mobile bottom sheet, quality tiers, poster frame, intent prefetch, mobile performance, window and door props, drag on the wall, share link, quote request with screenshot, resolution warning. Done when: 60 FPS on a mid-range phone; the quote request arrives by e-mail.

## Result

- **Share link** (`model/share.ts`, tests): `?room=5x4x2.7&wall=n&image=lake&print=3.5x1.5&pos=0x0&fit=contain&env=out`. Every value is checked and kept in the limits; a link to an uploaded image opens with the first preset. The page reads it before `?area=`; `ShareLinkSync` keeps the address up to date (`history.replaceState`); a copy button gives feedback, including that an upload is not in the link.
- **Quote request** (`src/features/quote/`, `QuoteDialog.tsx`, tests): the button opens a native `<dialog>` with a summary (wall, print, image, price), a JPEG screenshot of the front view (1200 px wide, about 30–50 KB), and a form (name, e-mail, phone, place, notes, consent). The Server Action validates like the question form, reads the configuration like a share link, computes area and price on the server, and sends an Italian e-mail with the share link and the screenshot attached. `src/lib/mail.ts` now sends attachments (outbox files, nodemailer buffers, Resend base64).
- **Resolution warning** (`model/resolution.ts`, tests; `src/content/print-quality.ts`, mock 20 px/cm): pixels per centimetre of the printed part of an upload, the largest sharp size, and a button that applies it.
- **Drag on the wall:** the print follows the pointer on the wall plane (store action `movePrint`); dragging elsewhere turns the camera.
- **Window and door** from the two models, on the walls left and right of the print, hidden when the camera is behind their wall. The model pipeline keeps only the used nodes (`keep` in `scripts/lib/models.ts`): room-high 2.1 → 1.5 MB, room-low 981 → 329 KB, props 1 MB → 63–75 KB.
- **Bottom sheet (phones):** a price bar (price, quote button, copy link); open, it takes 60 % of the screen and the room shrinks above it, with the wall framed again. Escape closes it. The WhatsApp button is hidden on this page (the quote dialog offers WhatsApp).
- **Poster frame and loading:** a flat front view of the configured wall (SSR, the LCP element), updated live by the panel, also for uploads (local blob URL). The 3D code loads on desktops on the first mouse move, key, or scroll; on phones on "Open the 3D view" or a tap on the room. The header link prefetches it on mouse hover or keyboard focus (`ConfiguratorIntent.tsx`).
- **Quality tiers:** phones get the low models and no multisampling.
- **Texts** in four languages (`Configurator.quote`, `share`, `resolution`, `stage.open3d`, new `stage.hint`); the quote form reuses the question form texts for name, e-mail, phone, and consent. A test checks every quote field error and upload error in all locales.

Validation:

- `vp check` is clean (134 files) and `vp test` passes (20 files, 193 tests). `vp run build` passes.
- The production server returns 200 for all 32 localized pages, each with the right `lang`.
- **Browser (desktop, 1280 px):**
  - The poster appears first; a mouse move loads the 3D, which fades in over it.
  - The door and the window are on the side walls.
  - Dragging the print moves it, stops at the wall edge, and updates the address.
  - The camera turns normally after a print drag. This was a bug, fixed during the check.
  - A share link with east wall, contain, and outdoors opens with the same values.
  - The resolution warning appears for a 600 × 400 px upload (2 px/cm), and its button applies 0.30 × 0.20 m.
  - Copy link works.
- **Quote request:** an empty submit gives 3 field errors and the focus moves to the name field. A valid submit writes the e-mail to the outbox, with the server price, the share link, the place, the notes, and `configurazione.jpg` (26 KB, the room with print, window, and door).
- **Phone (375 px):** no horizontal scroll, the low models, a 200 px sheet bar, and the title stays in the page while the sheet is closed. Open, the sheet is 487 px and the room above it is 225 px. Escape closes it. No 3D before the button; the poster shows an upload; the button loads the 3D.
- **Bundle:** no page's first scripts contain three.js (home, services, contact, configurator).
- **Lighthouse (production, configurator):**
  - Before the new loading strategy: mobile 46, desktop 64.
  - After it: mobile 92 / 100 / 100 / 91 (LCP 3.1 s, TBT 130 ms) and desktop 100 / 100 / 100 / 92 (LCP 0.7 s).
  - SEO: only the canonical URL (real domain, not localhost).
- **Frame rate:** not measured. The browser pane was hidden, so the browser throttles animation frames, and no phone is available. The scene has about 500 triangles and draws only after a change.

## Changed files

- New:
  - Model: `src/features/configurator/model/{share,resolution}.ts` with tests
  - Quote: `src/features/quote/{fields,quote,handle-quote,actions}.ts` with tests (`handle-quote.test.ts`, `messages.test.ts`)
  - Islands: `src/islands/configurator/QuoteDialog.tsx`, `src/islands/ConfiguratorIntent.tsx`
  - Content: `src/content/print-quality.ts`
- Changed:
  - Store: `src/features/configurator/{store,start}.ts` (`movePrint`, `sharedConfigOf`, share link start, upload `src`)
  - Model: `src/features/configurator/model/room.ts` (`neighbours`, `CAMERA_MARGIN`)
  - Islands: `src/islands/configurator/{Configurator,Panel,Stage,Scene,ImagePicker,prepare-upload}.tsx|ts`
  - Mail: `src/lib/mail.ts` (attachments) with tests
  - Content: `src/content/{schema,index}.ts`, `src/content/__tests__/content.test.ts`
  - Components: `src/components/icons.tsx` (`LinkIcon`), `src/components/site/{SiteHeader,WhatsAppButton}.tsx`
  - Pipeline: `scripts/{optimize-models.ts,lib/models.ts}` (`keep`); `public/models/*.glb`
  - Page: `src/app/[locale]/(pages)/try-your-wall/page.tsx`
  - Texts and docs: `messages/*.json`, `CLAUDE.md`, [[Development Plan]]

## Decisions

- **No 3D on a timer or on idle.** Idle loading (planned after Phase 4) still blocked the phone main thread for about 2 s without the visitor asking for 3D (Lighthouse mobile 46). Now the poster and the panel are the configurator until a person moves the mouse (desktop) or taps the 3D button or the room (phone). The 3D cost did not change; it comes only when a person asks for it, after the poster painted.
- **The poster is a real preview**, not only a placeholder: it follows every setting, also an upload. A phone visitor can configure, see the price, and send a quote without 3D.
- **Screenshot: front view.** The capture renders the standard framing for one frame and then restores the visitor's camera: the clearest picture for the client.
- **Prices are computed again on the server** from the share link parameters: the e-mail never shows a number the browser made up.
- **Camera lock in the same event.** camera-controls listens to the canvas DOM events, so R3F's `stopPropagation` does not reach it; a React state update came too late and left the controls stuck after a print drag.
- **Camera stays above the floor:** the lowest view angle is a little below eye level (`maxPolarAngle` 0.52 π).
- **The sheet opens to 60 %, not 85 %**, so the room stays visible while the visitor changes settings.
- **WhatsApp button hidden on the configurator** (it covered the panel and the sheet); the quote dialog offers WhatsApp.
- **No `sessionStorage`, no `PerformanceMonitor`:** the quote form is a dialog on the same page, and with `frameloop="demand"` there is no steady frame rate to monitor.

## Open items

- **Client:** price rates and VAT (Q5), the sharpness threshold (Q11, mock 20 px/cm), real presets, the final mailbox (Q6).
- **E-mail:** real delivery of the quote e-mail (with attachment) needs the SMTP or Resend settings (`vp run mail:test`).
- **Real phone:** frame rate and touch drag not tested on a device.
- **Phones without 3D send no screenshot** in the quote e-mail (the share link opens the configuration).
- **Translations:** DE, EN, BS configurator texts are drafts.
- **Commit:** nothing is committed. Git `user.name` and `user.email` are not set.
- **Next phase:** Phase 6 (quality: performance budgets in CI, accessibility audit, SEO with JSON-LD and sitemap, Playwright E2E).
