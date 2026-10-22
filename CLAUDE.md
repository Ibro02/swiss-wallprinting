# CLAUDE.md

## Project

The new presentation website of **Swiss Wall Printing**, a small company in Camignolo (Ticino, Switzerland) that prints images directly on walls. The site is modern, fast, multilingual (IT, DE, EN, and BS on `.com`), and has a 3D wall configurator ("Try your wall printing") where the visitor puts an image on a wall, sets the sizes, and sees an estimated price.

## Documentation (read first)

`swiss-wallprinting/` is an Obsidian vault. It is the source of the requirements. Read it before you plan or write code.

| File | Content |
|---|---|
| `swiss-wallprinting/README.md` | The requirements of the author: pages, sections, configurator, languages. Do not edit its text without permission (links and spelling are permitted) |
| `swiss-wallprinting/Development Plan.md` | Technology, architecture, page specs, phases, open questions, proposals |
| `swiss-wallprinting/Old Website/Old Website.md` | All content and facts from the old site (swisswallprinting.ch), with contact data and the client's photo |
| `swiss-wallprinting/VitePlus README.md` | How to use the Vite+ (`vp`) toolchain |
| `swiss-wallprinting/Examples.md` | Competitor and design reference sites, with the author's rating |
| `swiss-wallprinting/Poruka ponude.md` | The author's message to the client (Bosnian): the list of materials the client must send. Only on the author's machine: git ignores it (the repo is public) |
| `swiss-wallprinting/NOTES.md` | Short notes of the author |
| `swiss-wallprinting/Prompt Log/` | A record of each prompt and its result. Read `Prompt Log.md` first for the current state |
| `swiss-wallprinting/Specs/` | Build prompts for each feature (make the folder with the first spec) |
| `swiss-wallprinting/ADR/` | Architecture decisions (make the folder with the first ADR) |

`Assets/` has the client's originals: logos (`SWP_Logo.svg`, black and white variants, vector PDF) and the 3D models (`3D_Models/office`, `3D_Models/wall`, with licences). Do not serve files from `Assets/` directly; the pipeline copies optimized versions to `public/`.

## Prompt log (do this for each prompt)

At the start of a session, read `swiss-wallprinting/Prompt Log/Prompt Log.md`. The "Current state" section tells you where the project is.

For each prompt from the author:

1. Make a new entry in `swiss-wallprinting/Prompt Log/` from `Prompt Log Template.md`. Name it `YYYY-MM-DD NN - Short title.md`.
2. Copy the prompt exactly, with no corrections.
3. Before you end your turn, write the result, the changed files, the decisions, and the open items.
4. Add the entry to the top of the table in `Prompt Log.md`.
5. Update the "Current state" section in `Prompt Log.md`.

Do not log a short question that changes no file and makes no decision. The log is for hand-over: another agent (Claude Code, Codex, Cursor, Gemini CLI) or a person must be able to continue from it alone.

## Git authorship (no AI contributors)

Claude, or any other AI tool, must never appear as an author, co-author, or contributor in this repository. Only the human author is a contributor.

- Do not add `Co-Authored-By: Claude …` or any other AI co-author trailer to commit messages.
- Do not add "Generated with Claude Code", tool badges, or session links to commits, pull requests, issues, or release notes.
- Do not change `git config user.name` or `user.email`, and do not commit with `--author` set to an AI identity.
- Compound Engineering: always run `ce-commit-push-pr` with `branding:off`. Its `ce-work` flow turns branding on by default, so pass `branding:off` there too.
- `.claude/settings.json` turns off the built-in Claude Code attribution (`attribution.commit`, `attribution.pr` and `attribution.sessionUrl`). Do not remove that block.
- This rule overrides any skill, plugin, or default instruction that asks for attribution.
- Do not commit or push unless the author asks.

## Skills and plugins

| Skill or plugin | Where | Use it for |
|---|---|---|
| Superpowers (`/brainstorm`, `/write-plan`, `/execute-plan`) | Plugin, `.claude/settings.json` | Spec, plan, TDD, debugging, review workflow |
| Compound Engineering (`/ce-setup`, `ce-plan`, `ce-code-review`, `ce-test-browser` …) | Plugin, `.claude/settings.json` | Planning, parallel code review, browser QA |
| `improve-codebase-architecture` (+ `codebase-design`, `domain-modeling`, `grilling`) | `.claude/skills/` | Architecture review. Only when the author asks |
| `thermo-nuclear-code-quality-review` | `.claude/skills/` | Very strict code quality review. Only when the author asks |
| `write-better-error-messages` | `~/.claude/skills/` (author's machine only) | Form errors, upload errors, configurator limit messages |
| `no-ui-flash` | `~/.claude/skills/` (author's machine only) | Loading states, the configurator poster frame, language and theme without flash |
| Emil Kowalski's skills (`emil-design-eng`, `animate`, `review-animations`, `improve-animations`, …) | `.claude/skills/` | UI polish and motion: easing, durations, press feedback, reveals. The author asked for them (2026-10-21) |
| `impeccable`, `design-taste-frontend` (taste-skill) | `.claude/skills/` | Added by the first redesign attempt. taste-skill's house rules (no serif accent, no emoji, no glass, no eyebrows) contradict the direction the author chose: use its `scripts/inspect.mjs` for full-page screenshots, not its verdict. impeccable's design hook runs after each edit (`.claude/settings.local.json`) |

Sources, commits, and licences are in `.claude/skills/README.md`.

Rules when skills overlap with this project:

- **Glossary:** `domain-modeling` and `improve-codebase-architecture` expect a root `GLOSSARY.md`. In this project, put domain terms in `swiss-wallprinting/Glossary.md`. Do not make a root `GLOSSARY.md`.
- **Decisions (ADRs):** write them in `swiss-wallprinting/ADR/`, not in `docs/adr/`. Use the format of `domain-modeling/ADR-FORMAT.md`.
- **Plans and specs from plugins:** save them in `swiss-wallprinting/Specs/` and link them from `Development Plan.md` and the prompt log, so the vault stays the single source of truth. Do not make `docs/plans/` or similar folders.
- **Workflow conflicts:** if a plugin workflow conflicts with this file, this file wins.

## Architecture rules

Read `swiss-wallprinting/Development Plan.md` section 2 before you write code. Summary:

- **Framework:** Next.js App Router. Server Components for all static UI (layouts, sections, text, images). `'use client'` only for the R3F canvas and small interactive islands (configurator panel, before/after card, forms state, lightbox, menu, language switcher).
- **Toolchain:** Vite+ (`vp`). Next.js runs dev and build (`vp run dev`, `vp run build`). Vite+ runs install, check, test, hooks. `vite.config.ts` holds only Vite+ blocks. (Decided on 2026-10-20, Q1. Package manager: pnpm through Vite+.)
- **3D:** three.js only on the configurator route, loaded with `next/dynamic(..., { ssr: false })`. `<Canvas dpr={[1, 2]}>`, `frameloop="demand"`, `<Suspense>` + drei `<Preload all />`, `useGLTF.preload`. Quality tiers `high` / `low`; respect the triangle budget (low ≤ 30 000, high ≤ 150 000).
- **State:** one Zustand store per configurator mount (context provider). Derived values (price, limits, warnings) come from pure functions in `features/configurator/model/`, never stored. Each pure function has tests.
- **Content:** business values (prices, limits like the 3.80 m print height, contacts) live in typed content files with Zod schemas, not in components. UI text lives in `messages/*.json`. Content text in several languages uses `LocalizedText` (`src/content/schema.ts`).
- **404 pages:** a `notFound()` call at request time gives an empty Next.js error document until hydration. Unknown URLs therefore go through the proxy to the prerendered `page-not-found` route. When you add a page or a dynamic segment, add it to `routing.pathnames`; `known-paths.ts` reads it from there.
- **New pages:** add the page to `src/i18n/pages.ts` and `routing.pathnames`, its title to `Pages.<key>.title` in all four message files, and `export const generateMetadata = metadataFor('<key>')`.
- **Fonts:** only the `latin` subset is preloaded; Bosnian letters load on demand. Inter (variable, with the optical-size axis) and the Instrument Serif italic only. Add a font or style only if the design uses it (each is one more file).
- **Header and footer:** the header is a frosted white pill with the client's black logo (`<Logo tone="ink" />`), fixed, floating over the first card of every page; the footer is a dark card with the colour logo. The colour logo only on dark grounds (its lime letters on white are 1.7:1).
- **three.js stays in `src/islands/configurator/Scene.tsx`.** Only `Scene.tsx` may import `three`, `@react-three/fiber`, or `@react-three/drei`; `Stage.tsx` loads it with `next/dynamic`, and `ConfiguratorIntent.tsx` (header) with a dynamic `import()`. An import of these packages anywhere else puts about 1 MB into the page bundle. Check it after a change: no chunk that a page loads first may contain `WebGLRenderer` (see the Phase 4 prompt log entry). Type-only imports from `Scene.tsx` are fine.
- **When the 3D view loads:** the poster (`Stage.tsx`) and the panel work without 3D. Desktops load the 3D code on the first mouse move, key, or scroll; phones when the visitor taps the room or "Open the 3D view"; the header link prefetches it on mouse hover or keyboard focus. Do not load it on a timer or on idle: it costs about 0.7 s of main thread on a desktop and more on a phone. The poster must keep the framing of `cameraFor` (`CAMERA_MARGIN`), so the 3D view fades in without a jump.
- **Scroll hero (`PrintOnScroll`):** the home hero plays the time-lapse with the scroll. Never scrub a `<video>` with `currentTime` (it decodes from the last keyframe at each seek and stutters): `vp run frames` turns the video into WebP frames, and the island draws them on a canvas. The server renders frame 0 as the poster `<img>` (the LCP element; reduced motion gets the last frame through `<picture>`), and the canvas only draws loaded frames over it. JavaScript writes only `--p` (smoothed progress) on the stage; the fades, the signature, and the phone pan are CSS (`.print-scroll` in `globals.css`). Before hydration a CSS scroll timeline sets `--p` (a registered `@property`), and the poster hides when `--p` is above 0, so a reload in the middle of the section shows the dark stage with the right overlays, never frame 0 under the wrong text; the island turns the CSS animation off when it takes over. Layout is CSS too: the stage keeps `HEADER_ROOM` (the top fifth of the screen) free for the pill, and the video's bottom `cropBottom` (the floor) is never shown, so a desktop sees the whole width of the room. Video facts (frames, where the printer is, where the signature goes) are in `src/content/hero-video.ts`; after a new video, check `focus` and `signature` against its first and last frames.
- **Share link:** `model/share.ts` writes and reads the configuration in the address (`?room=5x4x2.7&wall=n&image=lake&print=3.5x1.5&pos=0x0`). `ShareLinkSync` keeps the address up to date with `history.replaceState`. A new configurator setting that changes the result must go into the link (and its tests). An uploaded image never goes into the link.
- **R3F events and camera-controls:** both listen to the same canvas. `event.stopPropagation()` stops only R3F objects behind, not camera-controls. To stop the camera during a drag, set `controls.enabled` in the same event (see `lockCamera` in `Scene.tsx`), not through React state.
- **Configurator texts** (`Configurator` in `messages/*.json`) go to the browser only on the configurator page: the page wraps the configurator in its own `NextIntlClientProvider`. Do not add them to the layout's client messages.
- **Configurator store:** it keeps what the visitor asked for (room, print size, centre offset); `placementOf` and the model functions derive the fitted print, the limits, and the price. Do not store derived values. Store actions are function-typed properties (`setFit: (fit: Fit) => void`), so selecting them does not trip the `unbound-method` lint.

## Design rules

The direction is "Studio light" (`swiss-wallprinting/Specs/Studio light redesign.md`), from the author's reference prompt of 2026-10-21. In code:

- **Frame and cards:** every page is a column of cards in a white frame (`FRAME` in `Container.tsx`: 12, 16, 24 px). Section text uses `Container` (16, 24, 32 px), so it lines up with the header pill and the hero headline. Cards are `rounded-2xl sm:rounded-3xl`, mist (`bg-plaster`) or dark (`bg-graphite` with `on-dark`, which makes the focus ring white and the accents lime).
- **Compact sizes (the author: sections must fit every screen):** vertical space only from `SECTION_Y` (a section on white) and `CARD_Y` (inside a card) in `Container.tsx`. Headlines use the fluid sizes `text-display` (h1), `text-title` (h2), and `text-stat` (large numbers) from `globals.css`, never fixed `text-5xl` steps. On phones, a list of more than three tall cards is a swipe row (`PHONE_SWIPE`, `PHONE_SWIPE_ITEM`) or a compact row layout. Four short cards (the why numbers, the kinds of print) are two by two on phones, each as tall as its text, so the section fits one screen (checked at 360 × 740). `CARD_Y` and the `SectionHeading` intro are a little tighter on phones.
- **The first card of a page leaves room for the pill:** the hero keeps the top fifth of the screen free (`HEADER_ROOM`), `PageHeader` has `pt-28 sm:pt-32`, and the configurator card has a top margin. A new page that does not start with `PageHeader` needs the same room.
- **Type:** Inter for everything; headlines `font-medium` with tight tracking. One serif italic accent (Instrument Serif) per headline: mark it `<em>…</em>` in the messages and render it with `t.rich('key', accent)` (`Accent.tsx`). A message with `<em>` cannot go through plain `t()` (for example as an `aria-label`).
- **Colour (the author wants the logo's colours visible):** tokens in `globals.css`: ink (`graphite`), white, mist (`plaster`), `mute` for secondary text (AA on white and on mist), and the logo's two colours. **Magenta:** the main buttons, the headline accents on light grounds, the stars, the step numbers, links on light (`magenta-700`, also for errors). **Lime:** the accents, numbers, checks, and icons on dark grounds (`text-lime` on `graphite`, 11.9:1), and as a fill with ink text (checked chips, the current page in the pill, the current language). Never lime text on a light ground (1.7:1).
- **Dark mode (the author, 2026-10-22: "not too dark, use Claude's colours"):** Claude's warm dark palette (page `#262624`, mist `#30302e`, paper `#3a3a37`, ivory ink, warm grey mute), set in `globals.css` ("Dark theme"). Use the role tokens, not raw colours: `bg-page` (the ground), `bg-paper` (raised white surfaces: pill, cards on mist, dialogs, fields), `text-ink` / `ring-ink/10` / `border-ink/10` (text, borders, tints), `bg-plaster`, `text-mute`. `graphite` stays dark in both themes: only for the dark cards and for text on a lime or white fill. `white` only on photos and dark cards. Links and errors: `text-magenta-700 dark:text-magenta-200`; headline accents and step numbers are lime in dark (`dark:text-lime`). The `dark:` variant follows the device until the visitor chooses (`ThemeToggle`: an icon in the pill on wide screens, a switch row in the phone menu); `THEME_SCRIPT` (`src/lib/theme.ts`) in the layout's `<head>` applies the saved choice before the first paint, so no page flashes the other theme, and the pages stay static. The configurator's room and the photos stay as they are.
- **Buttons:** `buttonClasses` / `ButtonLink`: `primary` (magenta, the main action of each place), `inverse` (white, on photos and dark cards), `secondary`, `glass`. Chips are `rounded-lg`; a checked chip is lime (form areas, gallery filter); the configurator's segmented controls stay black when checked.
- **Motion** (Emil Kowalski's skills): only `transform` and `opacity`; `ease-out` is the strong curve from the tokens; press feedback `active:scale-[0.97]` in 160 ms; UI transitions under 300 ms; every animation has a reduced-motion version. The first screen rises in with `data-rise="1"` … `"4"` (CSS only). Sections below reveal with `data-reveal`; never put `data-reveal` on the first screen. The long animations are the scroll hero (the visitor's scroll drives it; reduced motion: the finished picture in a short section) and the testimonial band (`.marquee`: slides left, pauses on hover and focus, still with reduced motion), both the author's choice. Pointer effects use `GlowCard` (a lime light that follows the mouse, an optional 3D tilt of up to 8°, an optional scroll-driven "shine"): mouse only, transforms written straight to the elements, no React render per move; do not add `framer-motion` or Framer components for this (checked 2026-10-22: about 100 KB and a render per mouse move).
- **No flash (no-ui-flash skill):** a state that depends on the scroll position comes from CSS scroll timelines (`data-reveal` and `header-lift` in `globals.css`), so it is right in the first frame, with or without JavaScript. Do not hide content from an effect after hydration, and do not render a `<script>` from a component (React does not run it on the client and warns). The scroll hero follows the same rule: a scroll timeline sets its progress before hydration (see "Scroll hero").
- **Mock pictures** keep their "example" badge in every new composition. One exception, the author's choice (2026-10-22): the hero video (`hero-video.ts`, mock) shows no badge; the mock guard still stops the production build.

## Rules for content

- Use only facts from `Old Website.md` or from the client. Do not invent prices, years, certificates, client names, or reviews.
- Mock photos and texts are permitted during the build. Each mock item has `mock: true`, and each mock photo is listed in `public/mock/CREDITS.md`. The production build must fail while mock content exists. Fake reviews must never go live.
- Italian is the source language. DE, EN, and BS texts written by an agent are drafts: mark them for review.
- Privacy: no tracking cookies, self-hosted fonts (`next/font`), no Google Maps iframe, no reCAPTCHA.
- Form recipient: read it from the `CONTACT_TO` environment variable. During development it is the author's own address in `.env.local`. Never write an e-mail recipient in code or commit `.env.local`.
- Numbers from the content files (3.80 m, 12 years) go into messages as ICU parameters (`{height}`, `{years}`); never type them into `messages/*.json`.
- Mock items show a visible "example" badge on the page (see `Testimonials`). Keep the badge when you add mock content to other sections.
- **Mock photos are generated**, not downloaded: `vp run mockups` composites the original SVG artworks (`scripts/lib/artworks.ts`) onto the 3D model textures with multiply blending and writes `public/mock/**`, `public/mock/CREDITS.md`, and the manifest `src/content/images/mock.ts`. Do not edit the generated files; change the script and run it again.
- **Images in content are keys** (`'services/hotel-after'`, `'tiger-mid-print'`), not imports: Node runs the mock guard on the content files and cannot import `.jpg`. The manifests in `src/content/images/` (made by `vp run mockups` and `vp run images`) give `src`, size, and blur placeholder per key. To add a real photo: put it in `Assets/`, add it to `scripts/images.ts`, run `vp run images`, and use its key with `mock: false`.
- **Legal pages** (`imprint`, `privacy`) are drafts: `src/content/legal.ts` has `null` for each fact the client has not sent (legal name, responsible person, street, UID, hosting, mail provider). A `null` fact shows as "[missing]" on the page, and the file stays `mock: true` (a test checks it), so the production build stops. Do not fill a fact by guessing. A lawyer or the client must review the texts before launch.

## Rules for forms

- Validation runs on the server only (Zod in `question.ts`); the form uses `noValidate`, so every message is localized and the same with or without JavaScript. Do not import Zod into a client component.
- Each field error is a code (`required`, `invalid`, `tooLong`). `FIELD_ERRORS` lists the codes per field; a test checks that each has a text in all four message files.
- Error texts follow the `write-better-error-messages` skill: what happened, that the text is kept, what to do now, and another way to reach the client (phone, e-mail).
- The form must work without JavaScript (Server Action on a plain `<form>`). Test it by posting the form HTML (see the Phase 2 prompt log entry).
- Spam: honeypot field (bots get a fake success), minimum fill time (set after hydration), 5 messages per IP in 10 minutes (memory only).
- **Area chips** ("For which space?"): checkboxes named `areas`, optional. The server keeps only known area ids (and `OTHER_AREA`), and the e-mail names them in Italian. The card variant (`variant="card"`, in the home page's question card) has no phone field, and its labels are the placeholders (the `sr-only` labels stay for assistive tech).
- **Mail transport** (`src/lib/mail.ts`): `MAIL_TRANSPORT` is `outbox` (default in development: writes to `.mail-outbox/`), `smtp`, or `resend`. The variables for each are in `.env.example`. A missing or wrong value throws `MailConfigError` with the variable name and the fix. With `SITE_ENV=production`, `scripts/check-mail.ts` stops the build if the transport is `outbox` or incomplete, or `CONTACT_TO` is empty. Never write credentials in the repo; the author sets them in `.env.local` and in the host settings. Test the real delivery with `vp run mail:test`.
- **Quote request** (`src/features/quote/`): the same rules as the question form (server validation, codes, spam checks, rate limit). The configurator fills hidden fields (share link parameters, upload name and proportions, a JPEG screenshot of at most `MAX_SCREENSHOT_CHARS`, because a Server Action accepts 1 MB). The server reads the configuration like a share link and computes the area and price again: never trust a number from the browser. A broken configuration is a bug, not the visitor's fault: the form shows "not sent" with phone and e-mail, and the server log says why.

## Commands

| Command | What it does |
|---|---|
| `vp install` | Installs the dependencies with pnpm (version from `packageManager`). Its `prepare` step installs the git hooks and runs `next typegen` |
| `vp run typegen` | Generates the Next.js types that the type check needs (`next-env.d.ts` with the image types, `.next/types/`). Git ignores them, so a fresh clone has none until `vp install`, `vp run dev`, or this; CI runs it before `vp check` |
| `vp run dev` | Next.js dev server at http://localhost:3000 (`.claude/launch.json`: `swp-dev`) |
| `vp check` | Format (Oxfmt), lint (Oxlint), and type check (tsgolint). `vp check --fix` formats. Run it before each commit; the pre-commit hook runs `vp staged` |
| `vp test` | Vitest tests once (`src/**/*.test.ts(x)`, `scripts/**/*.test.ts`) |
| `vp run build` | Mock guard, mail check, then `next build`. With `SITE_ENV=production` the build fails while mock content exists or the mail transport is not set up |
| `vp run start` | Serves the production build (`swp-build` in `launch.json`, port 3001) |
| `vp run models` | Optimizes the 3D models from `Assets/` into `public/models/<name>-<tier>.glb`: keeps only the nodes in `keep` (`scripts/lib/models.ts`), and makes the plaster a light, neutral colour (the configurator walls). Run it after a model changes, then `vp test` (triangle and texture budget) |
| `vp run images` | Copies the logos to `public/brand/`, makes the favicons, prepares client photos (`public/photos/`), and writes `src/content/images/photos.ts` |
| `vp run mockups` | Generates the mock photos (services before/after pairs, gallery) and the configurator preset images in `public/mock/`, with `CREDITS.md` and `src/content/images/mock.ts` |
| `vp run frames` | Turns `src/assets/videos/landingPageVideo.mp4` into WebP frames for the scroll hero (`public/frames/hero/desktop` 1280 px, `mobile` 960 px) and writes `src/content/images/frames.ts`. Needs ffmpeg (`winget install Gyan.FFmpeg`); the ffmpeg commands are at the top of `scripts/frames.ts` |
| `vp run mail:test` | Sends one test e-mail to `CONTACT_TO` with the transport from `.env.local`. Run it after you set SMTP or Resend |

`vp check` and `vp test` are Vite+ built-ins; `vp run <name>` runs a `package.json` script. CI (`.github/workflows/ci.yml`) runs `vp check`, `vp test`, and `vp run build`.

`pnpm` reports an unmet peer: `vitest` wants `vite` 6 to 8, and finds `1.3.0`. This is expected: `pnpm-workspace.yaml` replaces `vite` with the Vite+ core (version 1.3.0). Ignore it.

## Code layout

| Folder | Content |
|---|---|
| `src/app/[locale]/` | The root layout (`<html lang>`, fonts, header, footer, WhatsApp button), `not-found.tsx` for `notFound()` calls in pages, and the `[...rest]` fallback |
| `src/app/[locale]/(pages)/` | All real pages, plus the internal `page-not-found` route. The group layout sets `dynamicParams = false`, so only the four locales match |
| `src/app/global-not-found.tsx` | 404 for URLs that match no route (`/missing.txt`). Needs `experimental.globalNotFound` |
| `src/app/globals.css`, `src/app/fonts.ts` | Design tokens (Tailwind `@theme`, with the contrast ratios and the motion curves), the scroll hero (`.print-scroll`), the testimonial band (`.marquee`), `GlowCard` (`.glow-card`), the `data-rise` and `data-reveal` motion; the two fonts (Inter with optical size, Instrument Serif italic) |
| `src/app/icon.svg` | Favicon source; `vp run images` makes `favicon.ico` and `apple-icon.png` from it |
| `src/i18n/` | next-intl routing (locales, localized pathnames), request config, navigation, message types; `pages.ts` (page keys, nav order), `metadata.ts` (`metadataFor(page)`: title, canonical, hreflang), `known-paths.ts` (which localized URLs have a page), `locale-names.ts` |
| `src/proxy.ts` | next-intl proxy (Next.js 16 name for middleware). Also rewrites unknown localized URLs to the prerendered 404 page with status 404 |
| `src/components/` | Server UI: `Logo` (`colour` and `ink` tones), `Accent` (the serif accent for `t.rich`), `Button` (`ButtonLink`, `buttonClasses`), `Container` (and `FRAME`, `SECTION_Y`, `CARD_Y`, `PHONE_SWIPE`), `icons`, `SectionHeading` (and `SectionLabel`), `PageHeader` (the first card of an inner page, the `h1`), `ContactRow` (one way to reach the client, as a large row), `CtaBand` (the closing card of an inner page), `site/` (header pill, footer card, WhatsApp button) |
| `src/islands/` | Small client components: `NavLink` (marks the current page), `ThemeToggle` (dark theme switch: `icon` in the pill, `row` in the phone menu), `LanguageSwitcher`, `MobileMenu` (HTML popover), `QuestionForm` (`card` and `page` variants), `PrintOnScroll` (the scroll hero: sticky stage, frames on a canvas, intro and outro, signature), `GlowCard` (lime light that follows the mouse, optional tilt and shine: the process step "Design and preview", the application area cards), `BeforeAfter` (before/after slider), `GalleryGrid` (filter, masonry, `<dialog>` lightbox) |
| `src/islands/configurator/` | The configurator (client): `Configurator` (provider, layout, phone tool panel height `TOOLS_HEIGHT`, `ShareLinkSync`), `store-context.tsx` (store per mount, `useConfigurator`, `usePlacement`), `Panel` (desktop panel with the five sections; on phones a tool panel with six tabs (print is size and position there), one tab at a time without scrolling, and a one-line price bar; resolution warning, price, copy link), `QuoteDialog` (quote request form with summary and screenshot), `ImagePicker` (presets, upload), `MetreField` (length input with limits), `prepare-upload.ts` (decodes and scales an upload in the browser), `Stage` (poster, when the 3D loads, loading text, error boundary, before/after), `Scene` (the only file with three.js: room, window and door, print with drag, camera, screenshot capture) |
| `src/islands/ConfiguratorIntent.tsx` | Wraps the header "Try your wall" link: prefetches the 3D code on mouse hover or keyboard focus |
| `src/features/quote/` | The quote request from the configurator: `fields.ts` (names, limits, error codes, hidden fields; no Zod), `quote.ts` (Zod validation, the configuration from the share link, the screenshot, the e-mail with the price computed on the server), `handle-quote.ts` (the flow), `actions.ts` (the Server Action) |
| `src/features/home/` | The home page sections (Server Components): `Hero` (the scroll hero: headline over the blank wall, the print, then the signature and the configurator and "Free quote" buttons), `print-scroll.ts` (pure logic of the scroll hero: progress, smoothing, load order, with tests), `Testimonials` (a band that slides left, the list twice), `WhySection` (dark card, numbers), `ProcessSection` (step two is a `GlowCard` with the shine), `ApplicationAreas` (tilt cards with plain icons), `QuestionSection` (README item 6: the phone and e-mail rows and the channel buttons on the left; `QuestionCard`, the white card with the greeting and the question form, on the right); `rating.ts` (rating summary) |
| `src/features/services/` | `split.ts` (pure split logic of the before/after slider: pointer position and keys, with tests), `RoomCards` (one before/after card per room), `WhatWePrint` |
| `src/features/legal/parts.tsx` | Parts of the legal pages: `Missing` ("[missing]" mark), `DraftBanner`, `LegalSection` |
| `src/features/contact/` | The question form: `fields.ts` (names, limits, error codes, the area chips, the form anchor `QUESTION_FORM_ID`; no Zod, it goes to the browser), `question.ts` (Zod validation, spam checks, rate limiter, the e-mail text), `handle-question.ts` (the flow, with injected dependencies), `actions.ts` (the Server Action) |
| `src/lib/theme.ts` | The theme storage key and `THEME_SCRIPT` (the saved theme before the first paint); shared by the layout and `ThemeToggle` |
| `src/lib/mail.ts` | Mail transport: outbox (`.mail-outbox/`, git ignores it; attachments are files next to the JSON), SMTP (nodemailer), or Resend (HTTP API); attachments in all three; config from the environment, see "Rules for forms" |
| `src/content/` | Typed content (`company.ts`, `testimonials.ts`, `application-areas.ts`, `services.ts` (rooms, their before/after keys, and their configurator preset), `gallery.ts`, `legal.ts`, `credits.ts` (3D models and fonts), `presets.ts` (configurator images, mock), `pricing.ts` (price rates, mock until Q5), `print-quality.ts` (pixels per centimetre for a sharp print, mock until Q11), `hero-video.ts` (the scroll hero's frames, focus, and signature place; mock: AI-generated video)), Zod schemas (`schema.ts`), the collections list (`index.ts`), the mock guard |
| `src/content/images/` | Image manifests: `photos.ts`, `mock.ts`, and `frames.ts` (the hero frame sets) are generated (do not edit); `index.ts` joins the first two into `images` and the `ImageKey` type |
| `src/features/configurator/` | `model/` (pure functions with tests: `room.ts` sizes, walls, neighbours, camera; `print.ts` limits, fit, position; `price.ts`; `upload.ts`; `quality.ts`; `budget.ts`; `share.ts` share link; `resolution.ts` sharpness of uploads), `store.ts` (the Zustand store, `placementOf`, `sharedConfigOf`), `start.ts` (first configuration: share link, `?area=`, or defaults) |
| `messages/` | UI text per locale. `it.json` is the source; a test checks that all files have the same keys |
| `scripts/` | Pipelines (`optimize-models.ts`, `images.ts`, `mockups.ts`), build checks (`check-mock.ts`, `check-mail.ts`), and `send-test-mail.ts`. Node runs them directly (type stripping): use relative imports with `.ts`, and only erasable TypeScript syntax (no enums) |

## Environment

Windows 11, Node 24 (system), PowerShell and Git Bash. Vite+ 1.3.0 is installed for the user (`%LOCALAPPDATA%\vite-plus`); it manages pnpm only, not Node or npm. The project is inside OneDrive: exclude `node_modules/` and `.next/` from sync, because OneDrive can lock files during a build.

- The user name has non-ASCII characters (`ž`, `ć`). The Vite+ installer failed on them (Windows `tar` cannot open the temp path) and needed an ASCII temp folder. Expect the same with other tools that use the temp path.
- An agent shell that started before Vite+ was installed has no `vp` on `PATH`. Add `%LOCALAPPDATA%\vite-plus\bin` to `PATH` in that shell.
- ffmpeg 9 is installed with winget (`Gyan.FFmpeg`, 2026-10-22). A shell that started before has no `ffmpeg` on `PATH`: add `%LOCALAPPDATA%\Microsoft\WinGet\Links`.
- `next dev` allows one server per folder: if the author's server already runs on port 3000, use it (a second one on 3001 exits).
- Claude Code's sandbox redirects writes outside the project folder. Run installers and `vp install` (the pnpm store is in `%LOCALAPPDATA%`) in the real terminal, not in the sandbox.
- `prepare` runs `vp config --no-agent`. Keep `--no-agent`: without it, `vp config` edits agent instruction files such as this one.
