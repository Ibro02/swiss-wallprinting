---
tags: [plan, architecture, handover]
status: Phase 5 done, Phase 6 next
updated: 2026-10-21
---
# Development Plan

The plan for the new Swiss Wall Printing website. The author's requirements are in [[README]]. The facts from the old site are in [[Old Website]]. Read both first.

> [!important] Status
> The author approved the plan on 2026-10-20. The answers are in section 9. Phases 0 (setup), 1 (design system and shell), 2 (home page), 3 (inner pages, e-mail transport), 4 (configurator MVP), and 5 (configurator complete) are done; Phase 6 (quality) is next. Read [[2026-10-20 03 - Phase 0 setup]], [[2026-10-20 04 - Phase 1 design system and shell]], [[2026-10-20 05 - Phase 2 home page]], [[2026-10-20 06 - Phase 3 inner pages and e-mail]], [[2026-10-21 02 - Phase 4 browser check, build, docs]], and [[2026-10-21 03 - Phase 5 configurator complete]].

---

## 1. Goal

A fast, modern, multilingual presentation site for a direct-to-wall printing company in Camignolo (Ticino). The hook is the **wall configurator**: the visitor puts an image on a 3D wall, sets the sizes, sees an estimated price, and sends a quote request.

Success criteria:

| Area | Target |
|---|---|
| Conversion | Each page leads to the configurator or a quote request in one click |
| Speed (marketing pages) | LCP ≤ 2.5 s on a mid-range phone over 4G, CLS ≤ 0.05, INP ≤ 200 ms, Lighthouse mobile ≥ 90 |
| Speed (configurator) | 60 FPS on a mid-range phone (iPhone 12, Pixel 6a class), first frame ≤ 4 s on 4G |
| JavaScript | No three.js on marketing pages. ≤ 150 KB gzip first-load JS on the home page |
| Accessibility | WCAG 2.2 AA. The configurator works with keyboard and without pointing in 3D |
| Languages | Italian (default), German, English on `.ch`; plus Bosnian on `.com` |

---

## 2. Technology

### 2.1 Stack

| Layer | Choice | Version (2026-10-20) |
|---|---|---|
| Framework | Next.js App Router (Server Components) | 16.4 |
| UI | React | 19.3 |
| Toolchain | Vite+ (`vp`): install, check (Oxfmt + Oxlint + type check), test (Vitest), commit hooks, tasks | 1.3.0 |
| 3D | three.js, React Three Fiber, drei | 0.186 / 9.8 / 10.7 |
| State | Zustand | 5.0 |
| i18n | next-intl (locale prefix, domain routing, localized paths) | 4.14 |
| Styling | Tailwind CSS (zero runtime, works with Server Components) | 4.3 |
| Motion | Motion (`motion/react`), only in client islands | 14.4 |
| Validation | Zod (forms, content files) | 4.6 |
| Model pipeline | glTF-Transform (resize, WebP textures, meshopt) | 4.5 |
| E2E tests | Playwright | 1.64 |
| Runtime | Node 24 LTS, pnpm (provisioned by Vite+) | |

### 2.2 Vite+ and Next.js (decided: option A)

> [!warning] Conflict in the requirements
> Vite+ is a toolchain for **Vite-based** frameworks. Next.js builds with **Turbopack**, not Vite. `vp create next-app` only runs `create-next-app`; after that, `vp dev` and `vp build` do not run a Next.js app.

Options:

| | A. Next.js + Vite+ toolchain (**recommended**) | B. vinext (Next.js API on Vite) | C. Other Vite RSC framework |
|---|---|---|---|
| What | Next.js runs dev, build, and server. Vite+ runs everything else: `vp install`, `vp check`, `vp test`, `vp staged`, `vp run <task>` | Cloudflare's re-implementation of the Next.js API as a Vite plugin. Full `vp dev` / `vp build` | React Router RSC, Waku, TanStack Start |
| Server Components | Yes, reference implementation | Yes | Yes, different APIs |
| Maturity | Production standard | README: "not yet a drop-in replacement for every application or production workload" | Varies |
| `next/image` | Full, build-time optimization | Partial (no build-time optimization) | n/a |
| `next/font` | Self-hosted at build time | Loaded at runtime | n/a |
| Vite+ coverage | All except `vp dev` / `vp build` / `vp preview` | Full | Full |

Why A:

1. The client site goes to production. Option B has known gaps exactly in the features this site needs most: image optimization (gallery, before/after) and fonts.
2. Self-hosted fonts are a **privacy requirement** in Switzerland and the EU. A site that loads Google Fonts from Google's servers sends the visitor's IP address to Google. `next/font` self-hosts at build time. vinext loads fonts at runtime.
3. The application code is the same App Router code in A and B. If vinext becomes mature, a later switch costs little. To keep that path open: no Vercel-only APIs, no `"use cache"` / Partial Prerendering.

How A works in practice:

- `vite.config.ts` contains only Vite+ blocks (`lint`, `fmt`, `check`, `test`, `staged`, `run`) and `@vitejs/plugin-react` for the tests. Next.js ignores this file.
- `package.json` scripts: `dev` → `next dev`, `build` → `next build`, `start` → `next start`. Start them with `vp run dev`, `vp run build`.
- `vp check` is the one static-check command (format, lint, type-aware lint, type check through tsgolint).
- `vp test` runs Vitest 5 for unit and component tests.
- `vp config` installs the Git hook dispatcher; `staged` runs `vp check --fix` on staged files.

### 2.3 Server and client boundary

| Server Components (default) | Client Components (`'use client'`) |
|---|---|
| Layouts, header shell, footer | R3F `<Canvas>` and everything inside it |
| All marketing sections: hero text, testimonials, why, process, application areas, about, services grid, gallery grid | Configurator sidebar / bottom sheet (controls) |
| Metadata, JSON-LD, sitemap, Open Graph images | Before/after split card (pointer and keyboard) |
| Form shells, Server Actions for form submit | Form field state (`useActionState`), language switcher, mobile menu, gallery lightbox |
| Content loading (typed content files, translations) | Hero print-reveal animation (if it needs JS; CSS first) |

Rules:

- A client component is a small leaf ("island"). It gets data from its server parent as props.
- The R3F scene loads with `next/dynamic(..., { ssr: false })` from a client wrapper. three.js never enters a marketing page bundle.
- Server Actions handle the forms. No API routes unless a third party needs a URL.

### 2.4 State (Zustand)

One store for the configurator, shared by the canvas and the HTML overlay.

- Create the store per mount (`createStore` + React context provider), as the Zustand docs recommend for Next.js. A module-level store can leak state between server requests when client components render on the server.
- React Three Fiber 9 bridges React context into `<Canvas>` automatically, so the scene and the sidebar read the same store.
- **Transient updates:** dragging the print on the wall writes to the store, and `useFrame` reads `store.getState()`. The sidebar re-renders only through narrow selectors.
- **Derived values are not stored.** Price, limits, and warnings come from pure functions (`estimatePrice`, `clampPrint`, `printResolution`) with selectors. Each pure function has Vitest tests (TDD).
- **Share link:** the store syncs the configuration (not the uploaded image) to URL search params, so a visitor can send the link. `sessionStorage` keeps the state when the visitor goes to the quote form and back.

Draft state shape:

```ts
type Wall = 'north' | 'east' | 'south' | 'west'

interface ConfiguratorState {
  room: { width: number; length: number; height: number } // metres
  wall: Wall
  print: {
    source: { kind: 'preset'; id: PresetId } | { kind: 'upload'; url: string; px: { w: number; h: number } }
    width: number   // metres, ≤ wall width
    height: number  // metres, ≤ min(wall height, 3.80)
    x: number       // offset from wall centre, metres
    y: number
    fit: 'cover' | 'contain'
  }
  environment: 'interior' | 'exterior'
  ui: { panelOpen: boolean; view: 'before' | 'after'; quality: 'high' | 'low' }
}
```

### 2.5 3D performance (responsive WebGL)

| Rule | How |
|---|---|
| Device pixel ratio | `<Canvas dpr={[1, 2]}>`. drei `<PerformanceMonitor>` lowers DPR toward 1 when FPS drops; `<AdaptiveDpr>` during camera moves |
| Render only on change | `frameloop="demand"`. The scene is static, so it draws only after a store change or a camera move (`invalidate()`). This saves battery on phones |
| Quality tiers | `high` (desktop) and `low` (phones, `max-width: 768px`, low `hardwareConcurrency`, or a `PerformanceMonitor` decline). Low: 1K textures, no secondary maps, no real-time shadows (baked contact shadow), fewer props |
| Polygon budget | low ≤ 30 000 triangles, high ≤ 150 000. A test reads the optimized GLB files and fails when a file is over budget. A dev overlay shows `gl.info.render` |
| Textures | The real cost. The two source models have about 15 MB of PNG normal maps. The pipeline makes 2K (high) and 1K (low) WebP textures. KTX2 later only if GPU memory is still too high |
| Uploaded images | Decode with `createImageBitmap`, scale down to ≤ 4096 px (high) or ≤ 2048 px (low), dispose the old texture on change |
| Suspense and preload | `<Suspense>` around the scene, `useGLTF.preload` / `useTexture.preload` at module level, drei `<Preload all />` so textures upload to the GPU before the first frame |
| Intent prefetch | When the pointer enters or focus reaches a "Try your wall" button, start `import()` of the scene chunk and preload the room model |

### 2.6 Loading without UI flash (`no-ui-flash` skill)

- The configurator page renders its final layout on the server: header, panel with real controls, and the canvas area.
- The canvas area first shows a **poster frame**: a pre-rendered image of the default room at the same size. When the first WebGL frame is ready, the poster fades out. No spinner flash, no layout shift.
- A progress bar from `useProgress` shows only if loading takes longer than 300 ms.

---

## 3. Information architecture

| Page | Route (IT / DE / EN / BS) | Rendering |
|---|---|---|
| Home | `/it`, `/de`, `/en`, `/bs` | Static |
| About us | `/it/chi-siamo`, `/de/ueber-uns`, `/en/about`, `/bs/o-nama` | Static |
| Services | `/it/servizi`, `/de/leistungen`, `/en/services`, `/bs/usluge` | Static |
| Gallery | `/it/galleria`, `/de/galerie`, `/en/gallery`, `/bs/galerija` | Static, filter by search param |
| Contact | `/it/contatti`, `/de/kontakt`, `/en/contact`, `/bs/kontakt` | Static shell + Server Action |
| Try your wall | `/it/prova-la-tua-parete`, `/de/wand-testen`, `/en/try-your-wall`, `/bs/isprobaj-zid` | Static shell + client canvas |
| Legal | Imprint and privacy policy per locale | Static |

Localized paths come from next-intl `pathnames`. Each page has `hreflang` alternates and is in `sitemap.xml`.

**Domains (proposal P8):** one codebase and one deployment for both domains. `swisswallprinting.ch` serves `it`, `de`, `en`; `swisswallprinting.com` serves `it`, `de`, `en`, `bs`. Italian is the default because the company is in Ticino.

> [!warning] Finding in Phase 0
> next-intl domain routing needs **unique locales per domain**, so the same `it`, `de`, `en` cannot be on both domains. Phase 0 uses prefix routing only (`/it`, `/de`, `/en`, `/bs`), which is also what next-intl does on `localhost`. Decide in Phase 7, with the hosting:
> - **Option 1:** regional locales on `.ch` (`it-CH`, `de-CH`, `en-CH`, shown as `/it`, `/de`, `/en`) and `it`, `de`, `en`, `bs` on `.com`. Correct `hreflang` for Switzerland. The `-CH` locales can load the same message files.
> - **Option 2:** one canonical domain for `it`, `de`, `en` (for example `.ch`), and `.com` serves only `bs` and redirects the rest. No duplicate content for search engines.

---

## 4. Page specifications

### 4.1 Global

- **Header:** logo, links, language switcher, and a highlighted button **"Try your wall printing"** (magenta). Glass pill navigation (from the design reference). Mobile: menu button + the same highlighted button.
- **Footer:** contacts from [[Old Website#Contact data]], socials, legal links, small credits link (3D models, mock photos).
- **Floating WhatsApp button** to +41 79 350 08 85 with a prefilled message (decided: yes, Q9). The number comes from the content file, not the component.

### 4.2 Home

1. **Hero.** Background media, hook text, and two buttons: "Try it on your wall" (configurator) and "Free quote". See proposal P2 for the media.
   - **Built 2026-10-22: "print on scroll"** ([[2026-10-22 01 - Print on scroll hero]]). A 400vh section with a sticky card: the scroll plays the time-lapse frame by frame on a canvas (WebP frames from `vp run frames`), forwards and backwards, with smoothing. Headline at the start, the logo "signs" the mural over the last 8 %, then the two buttons. Phones pan with the printer; reduced motion shows the finished picture. The video is AI-generated (Dreamina AI watermark): mock until the client approves a clean one. **2026-10-22 ([[2026-10-22 02 - Commit, hero room, sliding reviews, glow cards]]):** the top fifth of the screen stays free for the header pill, the bottom fifth of the video (the floor) is cropped, no "example" badge (the author's choice), and a CSS scroll timeline sets the progress before hydration.
   - Hook draft: IT "Stampiamo direttamente sui muri." / EN "Any image. Any wall. Printed directly." Sub-line: "No film, no stickers. Up to 3.80 m high, unlimited width, 12+ years."
2. **Testimonials.** Pattern from faberwall.nl/reviews: a header with the aggregate rating ("Excellent, based on N Google reviews") and a link to the Google profile; review cards with avatar initial, name, stars, date, text, and an optional owner reply. Improvement: on the home page the cards move as a slow horizontal band (pauses on hover, static grid with reduced motion). All reviews are mock until the client sends real ones (see 6.3).
3. **Why Swiss Wall Printing.** Large numbers: 3.80 m height, unlimited width, 12+ years durability, certified eco inks, indoor and outdoor, no film or adhesive. Facts from [[Old Website#Facts to reuse]] only.
4. **Process.** Four steps: idea and wall photo → design and 3D preview → printing on site → finished wall. Steps are a draft until the client confirms them.
5. **Application areas.** Pattern from wall-wonderprint.art: icon cards with a title and one line. Areas from the old site: companies and offices, hotels and restaurants, schools and kindergartens, private homes, shops, facades and outdoor. Each card links to the configurator with a matching preset.
6. **Question form.** Name, e-mail, phone (optional), message, consent. Server Action, see 4.6.

### 4.3 About us

One photo (mock) and a short story. The text waits for the client (company story, people, region). Until then: a short neutral text from the old site.

### 4.4 Services

Pattern from muurprints.com/zakelijk ("choose your situation" grid of room cards), but better:

| muurprints.com | This site |
|---|---|
| Card shows a blank wall, then swaps to a printed one | **Before/after split under the pointer:** left of the pointer is the blank wall, right is the print. Reuses the tested `splitAt` / `splitByKey` logic from the author's Steakwise project |
| Only a title and dimensions per card | Title, dimensions, one value sentence, and "Try this wall" (opens the configurator with the same room preset) |
| Large images, no alt text on blank variants | `next/image` with `sizes`, blur placeholder, AVIF/WebP, alt text for both states; the "after" image loads when the card is near the viewport |

Touch: drag to move the split. Keyboard: the card is a slider (`role="slider"`), arrow keys move it, Escape resets.

### 4.5 Gallery

`next/image` masonry grid (CSS columns), category filters (application areas), a lightbox (client island), blur placeholders from the image manifests. Mock images first.

**Built in Phase 3:** the filter is component state, not a search param, so the page stays fully static (a shareable filter URL can come later). The lightbox is a native `<dialog>`: focus trap, Escape, arrow keys, backdrop click.

### 4.6 Contact

E-mail, phones, location (Camignolo) with a link to the map (no embedded Google Maps iframe: privacy), socials, and the contact form. **Built in Phase 3** with a text link only; a static map image needs a map tile licence, so it waits.

**Forms (home question form, contact form, quote request from the configurator):**

- Server Action + Zod validation on the server; the same schema gives field errors in the client.
- Spam: honeypot field + minimum fill time + rate limit per IP. No reCAPTCHA (privacy). Cloudflare Turnstile only if spam gets through.
- Recipient: during development and testing, all forms go to the author's own address. It is in the `CONTACT_TO` environment variable in `.env.local`, never in the repo. Before launch, change it to the client's mailbox (Q6).
- Transport: SMTP from the company mailbox (when `info@swisswallprinting.ch` exists) or Resend. **Both are built (Phase 3)**; `MAIL_TRANSPORT` selects one. Which one, and the credentials, are decided before launch. A production build stops while the transport is not set up.
- Quote request fields (from the offer letter): wall size, city, indoor/outdoor, wall photo (phase 2), and the configurator link plus a small screenshot.
- Error messages follow the `write-better-error-messages` skill: what happened, what was not lost, what to do next.

### 4.7 Try your wall printing (configurator)

The most important feature.

**Layout:**

- Desktop: full-width canvas, expandable panel from the right (as in [[README]]).
- Mobile: a **bottom sheet** with the same controls, collapsed to a price bar (decided, Q4). The README's side panel stays desktop only.

**Controls (panel):**

1. Room size: width, length, height (m, 0.01 precision). Limits: 2–30 m, height 2–8 m.
2. Wall: north / east / south / west (also by clicking a wall in 3D).
3. Wall print image: presets (mock catalog: abstract, nature, city, kids, typography, company logo) or **upload**.
4. Print size: width ≤ wall width; height ≤ min(wall height, **3.80 m machine limit**). The limit message says why.
5. Position: drag on the wall, or X/Y inputs; "centre" button.
6. Fit: cover / contain.
7. Before / after toggle.
8. **Price estimate** (always visible): area × rate + fixed costs, VAT 8.1 %, shown as "approx. CHF X". Rates are placeholders until the client sends prices (Q5).
9. "Request exact quote": opens the quote form with the configuration filled in.

**Room geometry (proposal P3):** the README asks for "a script that fixes the 3D model for the exact size". Scaling the GLB does not work well: non-uniform scale stretches the textures and the windows. The "Room Blank" model is a simple box (walls, floor, ceiling, two windows, about 3 100 triangles). So the room is **built in code** from the store dimensions: four wall planes, floor, ceiling. It uses the model's own PBR textures (beige plaster, laminate floor) with `texture.repeat = size / tileSize`, so the texture scale is always correct. Windows and the door from the two models are props, placed on a wall that is not the print wall. Exact size, no distortion, almost zero triangles.

**Print look (proposal P4):** the print is a plane 1 mm in front of the wall. Its material uses the wall's normal map, and the colour multiplies with the plaster colour. The print then looks printed into the wall texture, not like a sticker. This shows the selling point "no film, no adhesive".

**Print quality warning (proposal P5):** for uploads, the app calculates pixels per centimetre for the selected print size. Under the threshold it shows "This image may look soft at this size", with the largest size that looks sharp. The threshold comes from the client (Q11).

**Built in Phase 4** (read [[2026-10-21 01 - Phase 4 configurator MVP]] and [[2026-10-21 02 - Phase 4 browser check, build, docs]]):

- **Room:** built in code as planned (P3). The walls are one-sided, so for a wide wall the camera can stand behind the opposite wall (a "dollhouse" view). `vp run models` keeps only the relief of the model's plaster, on a warm white: the source colour is a dark beige, and prints go on light walls. No window or door props yet.
- **Print look (P4), changed:** the print is an unlit plane with multiply blending over the lit wall, 3 mm in front of it. The plaster relief and the light show through the ink, and white leaves the wall as it is. No second normal map is needed.
- **Walls** have names from the first view: front, right, back, left (north, east, south, west in the code). A click on a wall in 3D selects it; a drag turns the camera.
- **Position** inputs are distances from the left end of the wall and from the floor. The store keeps the offset of the print centre, so a print stays centred when the room gets higher.
- **The store keeps what the visitor asked for**; `placementOf` fits it to the current wall. When the room gets smaller and then larger again, the print comes back to its size.
- **Price:** example rates in `src/content/pricing.ts` (`mock: true`, marked "Esempio" on the page; the production build stops). The page shows the total with VAT, rounded to CHF 10. VAT 8.1 %: ask the client if the company charges VAT.
- **Upload:** decoded and scaled down in the browser (never sent); JPG, PNG, WebP up to 30 MB.
- **`?area=`** sets the first room, so the page renders per request (the server HTML has the right values). The configurator texts go to the browser only on this page.
- **Phones:** the panel is below the room until the bottom sheet (Phase 5).
- **Performance:** three.js is in one lazy chunk (about 1 MB, 269 KB compressed), loaded only on this page. Lighthouse desktop 87 / 100 / 100 / 92. Mobile performance is 42: running the 3D chunk takes 2.5 s on Lighthouse's slowed phone CPU. Phase 5 fixes this with the poster frame, loading the 3D after idle or on intent, and the low tier.

**Built in Phase 5** (read [[2026-10-21 03 - Phase 5 configurator complete]]):

- **Poster frame and loading (P11, changed):** the server HTML has a flat front view of the configured wall with the print (multiply blended), framed like the 3D camera. The panel updates it live, also for uploads. The 3D view does not load on a timer or on idle, as planned in Phase 4, because that still blocked the main thread for a phone visitor who did not ask for 3D. Desktops load it on the first mouse move, key, or scroll. Phones show an "Open the 3D view" button (a tap on the room works too). The header link prefetches it on mouse hover and keyboard focus. Lighthouse configurator: mobile 92 / 100 / 100 / 91, desktop 100 / 100 / 100 / 92.
- **Bottom sheet (P6, Q4):** closed, it is a price bar (price, quote button, copy link). Open, it takes 60 % of the screen, and the room shrinks to stay fully visible above it; the camera frames the wall in the new size. Escape closes it.
- **Share link (P7):** the address always holds the configuration (`history.replaceState`, no history entries); a copy button too. An uploaded image is not in the link. `sessionStorage` (section 2.4) is not needed: the quote form is a dialog on the same page.
- **Quote request (P7):** a dialog with the configuration, a JPEG screenshot (front view, at most 1200 px wide), and a short form. The Server Action reads the configuration like a share link, computes the area and price on the server, and sends an Italian e-mail with the link and the screenshot as an attachment. Phones that did not open the 3D view send no screenshot; the link is enough to open the configuration.
- **Resolution warning (P5):** for uploads, pixels per centimetre of the printed part. Under the threshold (20 px/cm, a mock value until Q11) it says why, gives the largest sharp size, and offers it with one click.
- **Drag on the wall:** the print follows the pointer on the wall plane; dragging elsewhere turns the camera.
- **Props:** the window frame from "Room Blank" (with a glowing daylight pane) on the wall left of the print, the door from "Walls Window Door" on the wall right of it; they are hidden when the camera is behind their wall. The model pipeline keeps only the nodes that are used: room-low 981 → 329 KB, props 1 MB → 63–75 KB.
- **Quality tiers:** phones get the low models and no multisampling. `PerformanceMonitor` (section 2.5) is not used: with `frameloop="demand"` there is no steady frame rate to measure. `AdaptiveDpr` lowers the pixel ratio while the camera moves.
- **Not measured:** the frame rate on a real phone (no device here). The scene has about 500 triangles and draws only after a change.

---

## 5. Design direction

> [!important] Replaced on 2026-10-21
> The site now follows **"Studio light"**: [[Specs/Studio light redesign]] (white frame, photo and mist cards, frosted header pill, Inter with one serif italic accent, black buttons), after the author's reference prompt. The text below is the first direction (Phases 1 to 5), kept for the record. A first redesign attempt, "The dark room" ([[Specs/Premium redesign]], [[ADR/0001-dark-room-design-direction]]), was not adopted.

- **Reference:** the Dribbble shot "AI Energy Technology Website" (Zajno): monochrome industrial look, a large macro 3D render as the hero, very large thin headings, glass pill navigation, tall rounded image cards with small text.
- **Brand colours** (from `Assets/SWP_Logo.svg`): magenta `#E51158`, lime `#C5D20D`.
- **Palette proposal:** graphite base `#0E0E10` for hero and configurator, warm "plaster" light sections `#F2F0EC`, magenta for primary buttons, lime for highlights on dark. A CMYK detail (cyan, magenta, yellow dots, like the ink ports on the printer in the client photo) as a small recurring motif.
- **Contrast (checked):** white on magenta 4.6:1 (AA). Magenta on graphite 4.3:1: large text and buttons only, not body text. Lime on graphite 11.8:1. Lime on white 1.7:1: never.
- **Type:** self-hosted with `next/font`. Display: a wide geometric sans that matches the rounded logo letters (candidates: Unbounded, Space Grotesk). Body: Inter. The font must cover Latin Extended-A (č, ć, đ, š, ž for Bosnian; ä, ö, ü for German).
- **Motion:** short scroll reveals and the print-reveal; everything respects `prefers-reduced-motion`. No scroll-jacking.

---

## 6. Content

### 6.1 Content model

Typed content files with Zod schemas in `src/content/` (services, application areas, testimonials, gallery items, presets, pricing). UI text in `messages/{it,de,en,bs}.json`. No business values in components.

### 6.2 Translation workflow

Italian is the source language. The agent writes DE, EN, and BS drafts and marks them `review: pending`. A native speaker or the client checks them before launch.

### 6.3 Mock content (proposal P9)

- Mock photos: **generated** (decided in Phase 3, no stock downloads): `scripts/mockups.ts` composites original SVG artworks onto the textures of the licensed 3D models, in `public/mock/`, listed in `public/mock/CREDITS.md`.
- Before/after pairs: the same script composites the print onto the blank wall with multiply blending, so the "after" image looks printed.
- Each mock item has `mock: true`. **The production build fails if mock content is still present.** Fake testimonials must never go live: that misleads customers and can violate the Swiss unfair-competition law (UWG).

---

## 7. Project structure

```
swiss-wallprinting/                 repo root
├─ CLAUDE.md                        agent rules
├─ .claude/                         settings, skills, launch.json
├─ Assets/                          client originals (not served)
├─ swiss-wallprinting/              Obsidian vault: requirements, plan, specs, prompt log
├─ messages/                        it.json, de.json, en.json, bs.json
├─ public/
│  ├─ models/                       room-high.glb, room-low.glb, props
│  ├─ mock/                         mock photos + CREDITS.md
│  └─ brand/                        logos
├─ scripts/                         optimize-models, images, check-mock, poster frame
├─ src/
│  ├─ app/[locale]/                 root layout, localized 404, [...rest] catch-all
│  ├─ app/[locale]/(pages)/         all pages (Server Components), only the 4 locales match
│  ├─ app/global-not-found.tsx      404 for URLs that match no route
│  ├─ components/                   server UI building blocks
│  ├─ islands/                      small client components (split card, lightbox, menu)
│  ├─ features/configurator/
│  │  ├─ model/                     pure TS: pricing, limits, geometry, url codec (+ tests)
│  │  ├─ store.ts                   Zustand store + provider
│  │  ├─ scene/                     R3F components ('use client')
│  │  └─ panel/                     HTML overlay ('use client')
│  ├─ content/                      typed data + Zod schemas
│  ├─ i18n/                         routing, request config
│  └─ lib/                          email, rate limit, seo
├─ vite.config.ts                   Vite+ blocks only
└─ next.config.ts
```

---

## 8. Phases

Each phase ends with `vp check` and `vp test` green, a prompt log entry, and a commit by the author.

| Phase | Content | Done when |
|---|---|---|
| **0. Setup** ✅ | `git init`, Next.js 16 + TypeScript strict, Vite+ toolchain, Tailwind 4, next-intl with 4 locales, CI (GitHub Actions `setup-vp`), `.claude/launch.json`, model and image pipeline scripts, mock guard | Empty localized pages build; CI green. **Done 2026-10-20** (CI not run yet: no GitHub repo) |
| **1. Design system and shell** ✅ | Tokens, fonts, buttons, header (with the configurator button), footer, language switcher, content schemas, IT text + DE/EN/BS drafts | Shell on all locales, Lighthouse ≥ 95 on an empty page. **Done 2026-10-20**: Lighthouse mobile 96 / 100 / 100 / 100 (IT); 92 on BS pages (late latin-ext fonts) |
| **2. Home page** ✅ | Hero (P2), testimonials, why, process, application areas, question form (Server Action, mock e-mail transport) | Home page complete with mock content. **Done 2026-10-20**: Lighthouse mobile (warm) 93–94 / 100 / 100 / 100 |
| **3. Inner pages** ✅ | Services with before/after split, About, Gallery + lightbox, Contact, legal pages, real e-mail transport | All pages complete. **Done 2026-10-21**: Lighthouse mobile services 93 / 100 / 100 / 92, gallery 91 / 100 / 100 / 92, contact 93–96 / 100 / 100 / 92 (SEO 92: the canonical URL points to the real domain). Legal facts and mail credentials still open |
| **4. Configurator MVP** ✅ | Store + pure model with tests, parametric room, wall selection, presets and upload, sizes with limits, price estimate, desktop panel | A visitor can configure and see a price on desktop. **Done 2026-10-21**: Lighthouse desktop 87 / 100 / 100 / 92; mobile performance 42 (the 3D chunk, see 4.7). Price rates are examples |
| **5. Configurator complete** ✅ | Mobile bottom sheet, quality tiers, poster frame, intent prefetch, load the 3D after idle on phones (mobile performance 42 in Phase 4), window and door props, drag on wall, share link, quote request with screenshot, resolution warning | 60 FPS on a mid-range phone; quote request arrives by e-mail. **Done 2026-10-21**: Lighthouse configurator mobile 92 / 100 / 100 / 91, desktop 100 / 100 / 100 / 92; the quote e-mail with screenshot arrives in the development outbox. Not measured on a real phone; real e-mail delivery waits for the SMTP or Resend settings |
| **6. Quality** | Performance budgets in CI (Lighthouse CI), accessibility audit, SEO (JSON-LD `LocalBusiness`, sitemap, hreflang, OG images), Playwright E2E | All targets in section 1 met |
| **7. Launch** | Hosting, both domains, cookieless analytics, replace mock content, translation review, hand-over notes | Live; no mock content |

Later ideas (not in scope now): **"Your wall photo" mode** (upload a photo of the real wall, drag four corners, see the print in perspective: simpler than AR and very convincing), facade scene for exterior prints, a CMS so the client can add gallery items, AR on phones.

---

## 9. Decisions and open questions

### 9.1 For the author (answered 2026-10-20)

| ID | Question | Answer |
|---|---|---|
| Q1 | Framework: Next.js + Vite+ toolchain (A), or vinext (B)? See 2.2 | **A.** Next.js runs dev, build, and server. Vite+ runs install, check, test, and hooks |
| Q2 | Hosting. Note: Vercel Hobby does not permit commercial use; a client site needs Vercel Pro, or Cloudflare / Netlify, or a Swiss host (Infomaniak) | **Decide in Phase 7.** Keep the code adapter-neutral. Use Vercel previews during development |
| Q3 | Package manager | **pnpm**, provisioned by Vite+ |
| Q4 | Mobile configurator | **Bottom sheet** (P6) |

### 9.2 For the client (can come during the build)

| ID | Question | Used in | Status |
|---|---|---|---|
| Q5 | Prices: CHF per m² indoor and outdoor, minimum order, travel costs | Configurator estimate | **Display decided by the author:** "approx. CHF X" and "Request exact quote". The rates are still open |
| Q6 | E-mail: will there be `info@swisswallprinting.ch`? Who receives the forms? | Forms | **For now:** the author's own address (`CONTACT_TO` in `.env.local`) for tests. The client mailbox is still open |
| Q7 | Real reviews (Google profile?), real photos and videos (a time-lapse of a print is the best hero), before/after pairs | Testimonials, hero, gallery | Open |
| Q8 | French as a 4th Swiss language? | i18n | **Not now.** Add it later; the i18n setup makes it a translation job only |
| Q9 | WhatsApp button (+41 79 350 08 85)? | Global | **Yes** |
| Q10 | Company story, team photos, service area (Ticino only or all of Switzerland), ink certificate name | About, Why | Open |
| Q11 | Minimum image resolution for print (pixels per cm) | Configurator warning | Open |

---

## 10. Proposals summary

| ID | Proposal | Reason |
|---|---|---|
| P1 | Next.js for runtime, Vite+ for the toolchain | Solves the Vite+/Next.js conflict without production risk (2.2) |
| P2 | **Hero "print reveal"** on the real client photo (the tiger mid-print): a print-head line with CMYK colours moves across and "prints" the image; the hook text appears after it. A video slot replaces it when the client sends a time-lapse. **Replaced 2026-10-22** by the scroll-driven time-lapse (4.2 item 1); the tiger photo stays on the about page and in the gallery | Uses the only real photo, shows how the product works, and loads much faster than a video (better LCP) |
| P3 | Parametric room built in code, not a scaled GLB | Exact size, no stretched textures (4.7) |
| P4 | Print material uses the wall's normal map and multiply blending | It looks printed, not stuck on |
| P5 | Print resolution warning for uploads | Prevents disappointed customers, shows expertise |
| P6 | Mobile bottom sheet for the configurator | Most visitors are on phones |
| P7 | Share link + quote request pre-filled from the configurator | Turns the "play" into a lead |
| P8 | One deployment for `.ch` and `.com` with domain-based locales | One codebase, correct languages per domain |
| P9 | Mock content flag and a build guard | Fake reviews can never go live |
| P10 | No tracking cookies (cookieless analytics), self-hosted fonts, no Google Maps iframe | No cookie banner needed; simpler privacy policy (Swiss nDSG) |
| P11 | Poster frame + intent prefetch for the configurator | No loading flash; it feels instant |

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Sketchfab Standard licence: the GLB files are downloadable from the site | Credit the authors; keep models inside the app bundle; re-check the licence terms before launch, or model a simple room ourselves (the room is procedural anyway, P3) |
| OneDrive syncs `node_modules` and `.next`, which is slow and can lock files on Windows (`EBUSY`) | Exclude these folders from OneDrive, or keep the repo outside OneDrive |
| Low-end phones: GPU memory from textures and uploads | Quality tiers, 1K textures, downscaled uploads, texture dispose |
| No real content from the client | Mock content with the guard (P9); the site structure does not depend on the final text length |
