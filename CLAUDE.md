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
- **Fonts:** only the `latin` subset is preloaded; Bosnian letters load on demand. Add a font weight only if the design uses it (each weight is one more file).
- **Header and footer are dark** on every page: the colour logo needs a dark background.
- **three.js stays in `src/islands/configurator/Scene.tsx`.** Only `Scene.tsx` may import `three`, `@react-three/fiber`, or `@react-three/drei`; `Stage.tsx` loads it with `next/dynamic`, and `ConfiguratorIntent.tsx` (header) with a dynamic `import()`. An import of these packages anywhere else puts about 1 MB into the page bundle. Check it after a change: no chunk that a page loads first may contain `WebGLRenderer` (see the Phase 4 prompt log entry). Type-only imports from `Scene.tsx` are fine.
- **When the 3D view loads:** the poster (`Stage.tsx`) and the panel work without 3D. Desktops load the 3D code on the first mouse move, key, or scroll; phones when the visitor taps the room or "Open the 3D view"; the header link prefetches it on mouse hover or keyboard focus. Do not load it on a timer or on idle: it costs about 0.7 s of main thread on a desktop and more on a phone. The poster must keep the framing of `cameraFor` (`CAMERA_MARGIN`), so the 3D view fades in without a jump.
- **Share link:** `model/share.ts` writes and reads the configuration in the address (`?room=5x4x2.7&wall=n&image=lake&print=3.5x1.5&pos=0x0`). `ShareLinkSync` keeps the address up to date with `history.replaceState`. A new configurator setting that changes the result must go into the link (and its tests). An uploaded image never goes into the link.
- **R3F events and camera-controls:** both listen to the same canvas. `event.stopPropagation()` stops only R3F objects behind, not camera-controls. To stop the camera during a drag, set `controls.enabled` in the same event (see `lockCamera` in `Scene.tsx`), not through React state.
- **Configurator texts** (`Configurator` in `messages/*.json`) go to the browser only on the configurator page: the page wraps the configurator in its own `NextIntlClientProvider`. Do not add them to the layout's client messages.
- **Configurator store:** it keeps what the visitor asked for (room, print size, centre offset); `placementOf` and the model functions derive the fitted print, the limits, and the price. Do not store derived values. Store actions are function-typed properties (`setFit: (fit: Fit) => void`), so selecting them does not trip the `unbound-method` lint.

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
- **Mail transport** (`src/lib/mail.ts`): `MAIL_TRANSPORT` is `outbox` (default in development: writes to `.mail-outbox/`), `smtp`, or `resend`. The variables for each are in `.env.example`. A missing or wrong value throws `MailConfigError` with the variable name and the fix. With `SITE_ENV=production`, `scripts/check-mail.ts` stops the build if the transport is `outbox` or incomplete, or `CONTACT_TO` is empty. Never write credentials in the repo; the author sets them in `.env.local` and in the host settings. Test the real delivery with `vp run mail:test`.
- **Quote request** (`src/features/quote/`): the same rules as the question form (server validation, codes, spam checks, rate limit). The configurator fills hidden fields (share link parameters, upload name and proportions, a JPEG screenshot of at most `MAX_SCREENSHOT_CHARS`, because a Server Action accepts 1 MB). The server reads the configuration like a share link and computes the area and price again: never trust a number from the browser. A broken configuration is a bug, not the visitor's fault: the form shows "not sent" with phone and e-mail, and the server log says why.

## Commands

| Command | What it does |
|---|---|
| `vp install` | Installs the dependencies with pnpm (version from `packageManager`) |
| `vp run dev` | Next.js dev server at http://localhost:3000 (`.claude/launch.json`: `swp-dev`) |
| `vp check` | Format (Oxfmt), lint (Oxlint), and type check (tsgolint). `vp check --fix` formats. Run it before each commit; the pre-commit hook runs `vp staged` |
| `vp test` | Vitest tests once (`src/**/*.test.ts(x)`, `scripts/**/*.test.ts`) |
| `vp run build` | Mock guard, mail check, then `next build`. With `SITE_ENV=production` the build fails while mock content exists or the mail transport is not set up |
| `vp run start` | Serves the production build (`swp-build` in `launch.json`, port 3001) |
| `vp run models` | Optimizes the 3D models from `Assets/` into `public/models/<name>-<tier>.glb`: keeps only the nodes in `keep` (`scripts/lib/models.ts`), and makes the plaster a light, neutral colour (the configurator walls). Run it after a model changes, then `vp test` (triangle and texture budget) |
| `vp run images` | Copies the logos to `public/brand/`, makes the favicons, prepares client photos (`public/photos/`), and writes `src/content/images/photos.ts` |
| `vp run mockups` | Generates the mock photos (services before/after pairs, gallery) and the configurator preset images in `public/mock/`, with `CREDITS.md` and `src/content/images/mock.ts` |
| `vp run mail:test` | Sends one test e-mail to `CONTACT_TO` with the transport from `.env.local`. Run it after you set SMTP or Resend |

`vp check` and `vp test` are Vite+ built-ins; `vp run <name>` runs a `package.json` script. CI (`.github/workflows/ci.yml`) runs `vp check`, `vp test`, and `vp run build`.

`pnpm` reports an unmet peer: `vitest` wants `vite` 6 to 8, and finds `1.3.0`. This is expected: `pnpm-workspace.yaml` replaces `vite` with the Vite+ core (version 1.3.0). Ignore it.

## Code layout

| Folder | Content |
|---|---|
| `src/app/[locale]/` | The root layout (`<html lang>`, fonts, header, footer, WhatsApp button), `not-found.tsx` for `notFound()` calls in pages, and the `[...rest]` fallback |
| `src/app/[locale]/(pages)/` | All real pages, plus the internal `page-not-found` route. The group layout sets `dynamicParams = false`, so only the four locales match |
| `src/app/global-not-found.tsx` | 404 for URLs that match no route (`/missing.txt`). Needs `experimental.globalNotFound` |
| `src/app/globals.css`, `src/app/fonts.ts` | Design tokens (Tailwind `@theme`, with the contrast ratios) and the two fonts (Unbounded 300, Inter) |
| `src/app/icon.svg` | Favicon source; `vp run images` makes `favicon.ico` and `apple-icon.png` from it |
| `src/i18n/` | next-intl routing (locales, localized pathnames), request config, navigation, message types; `pages.ts` (page keys, nav order), `metadata.ts` (`metadataFor(page)`: title, canonical, hreflang), `known-paths.ts` (which localized URLs have a page), `locale-names.ts` |
| `src/proxy.ts` | next-intl proxy (Next.js 16 name for middleware). Also rewrites unknown localized URLs to the prerendered 404 page with status 404 |
| `src/components/` | Server UI: `Logo`, `Button` (`ButtonLink`, `buttonClasses`), `Container`, `icons`, `CmykDots`, `SectionHeading`, `PageHeader` (top of an inner page, the `h1`), `CtaBand` (configurator and quote buttons at the end of a page), `site/` (header, footer, WhatsApp button) |
| `src/islands/` | Small client components: `NavLink` (marks the current page), `LanguageSwitcher`, `MobileMenu` (HTML popover), `QuestionForm`, `BeforeAfter` (before/after slider), `GalleryGrid` (filter, masonry, `<dialog>` lightbox) |
| `src/islands/configurator/` | The configurator (client): `Configurator` (provider, layout, phone sheet height, `ShareLinkSync`), `store-context.tsx` (store per mount, `useConfigurator`, `usePlacement`), `Panel` (desktop panel and phone bottom sheet: the five sections, resolution warning, price, copy link), `QuoteDialog` (quote request form with summary and screenshot), `ImagePicker` (presets, upload), `MetreField` (length input with limits), `prepare-upload.ts` (decodes and scales an upload in the browser), `Stage` (poster, when the 3D loads, loading text, error boundary, before/after), `Scene` (the only file with three.js: room, window and door, print with drag, camera, screenshot capture) |
| `src/islands/ConfiguratorIntent.tsx` | Wraps the header "Try your wall" link: prefetches the 3D code on mouse hover or keyboard focus |
| `src/features/quote/` | The quote request from the configurator: `fields.ts` (names, limits, error codes, hidden fields; no Zod), `quote.ts` (Zod validation, the configuration from the share link, the screenshot, the e-mail with the price computed on the server), `handle-quote.ts` (the flow), `actions.ts` (the Server Action) |
| `src/features/home/` | The home page sections (Server Components): `Hero` (print reveal), `Testimonials`, `WhySection`, `ProcessSection`, `ApplicationAreas`, `QuestionSection`; `rating.ts` (rating summary) |
| `src/features/services/` | `split.ts` (pure split logic of the before/after slider: pointer position and keys, with tests), `RoomCards` (one before/after card per room), `WhatWePrint` |
| `src/features/legal/parts.tsx` | Parts of the legal pages: `Missing` ("[missing]" mark), `DraftBanner`, `LegalSection` |
| `src/features/contact/` | The question form: `fields.ts` (names, limits, error codes; no Zod, it goes to the browser), `question.ts` (Zod validation, spam checks, rate limiter, the e-mail text), `handle-question.ts` (the flow, with injected dependencies), `actions.ts` (the Server Action) |
| `src/lib/mail.ts` | Mail transport: outbox (`.mail-outbox/`, git ignores it; attachments are files next to the JSON), SMTP (nodemailer), or Resend (HTTP API); attachments in all three; config from the environment, see "Rules for forms" |
| `src/content/` | Typed content (`company.ts`, `testimonials.ts`, `application-areas.ts`, `services.ts` (rooms, their before/after keys, and their configurator preset), `gallery.ts`, `legal.ts`, `credits.ts` (3D models and fonts), `presets.ts` (configurator images, mock), `pricing.ts` (price rates, mock until Q5), `print-quality.ts` (pixels per centimetre for a sharp print, mock until Q11)), Zod schemas (`schema.ts`), the collections list (`index.ts`), the mock guard |
| `src/content/images/` | Image manifests: `photos.ts` and `mock.ts` are generated (do not edit); `index.ts` joins them into `images` and the `ImageKey` type |
| `src/features/configurator/` | `model/` (pure functions with tests: `room.ts` sizes, walls, neighbours, camera; `print.ts` limits, fit, position; `price.ts`; `upload.ts`; `quality.ts`; `budget.ts`; `share.ts` share link; `resolution.ts` sharpness of uploads), `store.ts` (the Zustand store, `placementOf`, `sharedConfigOf`), `start.ts` (first configuration: share link, `?area=`, or defaults) |
| `messages/` | UI text per locale. `it.json` is the source; a test checks that all files have the same keys |
| `scripts/` | Pipelines (`optimize-models.ts`, `images.ts`, `mockups.ts`), build checks (`check-mock.ts`, `check-mail.ts`), and `send-test-mail.ts`. Node runs them directly (type stripping): use relative imports with `.ts`, and only erasable TypeScript syntax (no enums) |

## Environment

Windows 11, Node 24 (system), PowerShell and Git Bash. Vite+ 1.3.0 is installed for the user (`%LOCALAPPDATA%\vite-plus`); it manages pnpm only, not Node or npm. The project is inside OneDrive: exclude `node_modules/` and `.next/` from sync, because OneDrive can lock files during a build.

- The user name has non-ASCII characters (`ž`, `ć`). The Vite+ installer failed on them (Windows `tar` cannot open the temp path) and needed an ASCII temp folder. Expect the same with other tools that use the temp path.
- An agent shell that started before Vite+ was installed has no `vp` on `PATH`. Add `%LOCALAPPDATA%\vite-plus\bin` to `PATH` in that shell.
- Claude Code's sandbox redirects writes outside the project folder. Run installers and `vp install` (the pnpm store is in `%LOCALAPPDATA%`) in the real terminal, not in the sandbox.
- `prepare` runs `vp config --no-agent`. Keep `--no-agent`: without it, `vp config` edits agent instruction files such as this one.
