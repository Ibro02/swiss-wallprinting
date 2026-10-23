---
tags: [prompt-log, index, handover]
---
# Prompt Log

This folder records each prompt that the author gives to an AI agent, and the result. Use it to give the project to a new agent (Claude Code, Codex, Cursor, Gemini CLI) or a new person.

## Rules

1. Make one entry for each prompt.
2. Name the file `YYYY-MM-DD NN - Short title.md`. `NN` is the number of the prompt on that day.
3. Copy the prompt exactly. Do not correct it.
4. Write the goal, the result, the changed files, the decisions, and the open items.
5. Add the entry to the table below. Put the newest entry at the top.
6. Use the template: [[Prompt Log Template]].

## Current state

> [!summary] For the next agent
> Read this section first. Update it after each prompt.
>
> - **Design:** the whole site was redesigned on 2026-10-21 ("Studio light", from the author's reference prompt, with Emil Kowalski's skills): read [[2026-10-21 05 - Studio light redesign]] and the author's first review [[2026-10-21 06 - Colour, area cards, compact sizes, no flash]] (magenta buttons, lime on dark, icon cards in "Where we print", compact fluid sizes, scroll effects in CSS without flashes) and [[2026-10-21 07 - Question card back in the Questions section]] (the form is at the end of the home page again, not in the hero), [[Specs/Studio light redesign]], and "Design rules" in `CLAUDE.md`. **Not committed yet**: the author reviews it first. A first attempt ("The dark room") is in git stash, not adopted.
> - **Phase 6 and dark mode are merged into `main`** (2026-10-22, [[2026-10-22 07 - Merge Phase 6 and dark mode]], pushed to `origin/main` on the author's request; the first CI run passed both jobs, `check` and `quality`: E2E and every Lighthouse floor): Playwright E2E (114 tests, desktop and phone; axe clean in the light and the dark theme), SEO (descriptions, sitemap, robots, OG image, LocalBusiness JSON-LD), CI job `quality` (E2E + Lighthouse CI), dark mode in Claude's warm colours with a switch in the pill and the phone menu. Not met yet: Lighthouse performance 0.9 on home (77–81) and services/gallery (88–90), JS 150 KB gzip (152–159). Every CI run now shows the Lighthouse scores on its summary page and keeps the HTML reports as the artefact `lighthouse` ([[2026-10-22 09 - Lighthouse reports on every CI run]]). Read [[2026-10-22 05 - Phase 6 plan and quality work]], [[2026-10-22 06 - Dark mode]], and [[Specs/Phase 6 Quality]].
> - **Client brief (2026-10-22, branch `feat/client-brief`, merged into main on 2026-10-23 as 138f729; not pushed):** the client's AI-written brief is checked and applied: read [[2026-10-22 12 - Client brief, projects and FAQ]] and [[Specs/Client brief]] (facts, competitor analysis with the `agent-browser` skill, gap table, open questions Q12–Q15). Gallery is now the **Projects** tab (his seven stories, photos pending, mock), **FAQ** is a new tab (his ten questions, draft answers), and his texts are in the hero, process, About, and Services (eight kinds, "For whom", "Surfaces and technology"); contact shows hours and service area. The full message is private (`Poruka klijenta.md`, git ignores it). Then ([[2026-10-22 13 - Services cards, material tiles, fact glow]]): the audiences use the area cards (`AreaCard`, `.lift-card`), the surfaces are material tiles, and the technical facts have the lift-card hover. The project cards are liquid-glass flip cards ([[2026-10-22 14 - Project flip cards]]: CSS, a hidden checkbox, `--ease-spring`). A language change is now a full page load ([[2026-10-22 16 - Script tag error on language change]]): the client-side switch re-rendered the root layout, which gave the "script tag" console error and dropped a dark theme choice. **The client's photos are in** ([[2026-10-23 01 - Client photos in projects and gallery]]): six projects and the gallery use his own photos (originals in `Assets/Projects/`, git ignores them; optimized copies by `vp run images`); the sea-view project has none yet, and other companies' pictures in his folder are not used. On phones ([[2026-10-23 02 - Dark pane and smooth project cards on phones]]) the flip cards have no `backdrop-filter` (it turned the pane light in dark mode), draw only the face in view, and use 4:3 cover crops; the gallery has two columns on phones. All project cards have one size ([[2026-10-23 03 - Project cards of one size, lightbox swipe]]): a long story fades out, and "Show more" (only then, from a CSS scroll timeline) opens it whole in a sheet; the lightbox changes photos with a swipe (CSS scroll snapping). The FAQ questions have the area cards' lift hover, and every process step has the mouse light: lime on the dark one, magenta on the others ([[2026-10-23 04 - FAQ lift hover, magenta process glow]]). The configurator stays the author's surprise for the client.
> - **Phone fixes (2026-10-22, [[2026-10-22 10 - Phone bugs, glow card, area cards]], committed on `main`, not pushed):** the author's phone bugs (hero vanishing, no theme switch, frozen 3D) had one cause: the dev server refused its HMR socket to the phone's LAN address, so the page never hydrated; `next.config.ts` now allows this computer's own addresses in development. The hero's camera follows the measured printer track (`focusTrack`), the poster stays under the canvas until the outro, the process step 2 glows on phones (`.premium-glow`), and the area cards have the "Programs" layout (`.area-card`), on the mist colour again since [[2026-10-22 11 - Area cards back to mist]] (committed, not pushed). Not checked on a real phone yet.
> - **Hero (2026-10-22):** the home hero is now "print on scroll": the scroll plays the time-lapse frame by frame on a canvas (`PrintOnScroll`, frames from `vp run frames`, ffmpeg installed with winget). Read [[2026-10-22 01 - Print on scroll hero]] and "Scroll hero" in `CLAUDE.md`. The video is AI-generated with a **Dreamina AI watermark**: `hero-video.ts` is mock (badge, production build stops) until the author or the client sends a clean, licensed video. The CSS print pass and `PrintPass` are gone.
> - **Git (2026-10-22, pushed to `origin/main` on the author's request):** `main` has the Studio light redesign and the scroll hero (`39d40e5`), the fixes of prompt 02 (`177c390`), the `responsive-design` skill (`571a6b0`), and the phone fixes of prompt 03 (`7af09ae`: why section two by two and one screen high, shorter area cards, tighter `CARD_Y` and intros on phones). The branches `fix/services-mobile` ("Cosa stampiamo" two by two on phones) and `feat/configurator-phone-tabs` (the configurator on phones as a tool panel with six tabs instead of the bottom sheet) are merged into `main` (`bbb1393`, `7da7cd5`; [[2026-10-22 04 - Merge the services and configurator branches]]). Read [[2026-10-22 03 - Responsive fixes and configurator tabs]].
> - **Prompt 02** ([[2026-10-22 02 - Commit, hero room, sliding reviews, glow cards]]): the hero keeps the top fifth free for the pill and crops the video's floor (no badge, the author's choice), a CSS scroll timeline sets the hero progress before hydration, the reviews slide again, `GlowCard` (lime light following the mouse, tilt, shine) on the process step and the area cards (a Framer component was checked and rejected: about 100 KB), and the question section has the e-mail row and the channel buttons on the left.
> - **Phase:** Phase 5 (configurator complete) is done and pushed. Phase 6 (quality: CI budgets, accessibility audit, SEO with JSON-LD and sitemap, Playwright E2E) is built, merged, and pushed, but stays in progress until Lighthouse performance 0.9 and JS 150 KB are met. Read [[2026-10-21 03 - Phase 5 configurator complete]], "Built in Phase 4" and "Built in Phase 5" in [[Development Plan#4.7 Try your wall printing (configurator)]], and the "Architecture rules", "Rules for forms", and "Code layout" sections in `CLAUDE.md`.
> - **Configurator:** complete: bottom sheet, poster frame, share link, quote request with screenshot, resolution warning, drag, window and door. Lighthouse mobile 92, desktop 100. The 3D code loads only on intent (desktop: first mouse move; phone: the 3D button): keep it that way (`CLAUDE.md`). Price rates and the sharpness threshold are mock values.
> - **E-mail:** SMTP and Resend are built (`MAIL_TRANSPORT`). The author must set the credentials in `.env.local` and run `vp run mail:test`; real delivery is not tested yet. A production build stops while the transport is not set up.
> - **Legal pages:** drafts with "[missing]" for each fact the client has not sent (`src/content/legal.ts`). Do not guess these facts.
> - **404 pages:** fixed in Phase 1. Unknown localized URLs go through the proxy to a prerendered 404 page (status 404, full HTML).
> - **Domains:** next-intl needs unique locales per domain; the `.ch` / `.com` split is open (two options in [[Development Plan#3. Information architecture]]).
> - **Decisions:** Next.js runs the app, Vite+ is the toolchain, pnpm, mobile bottom sheet, approximate price, WhatsApp button, no French for now, hosting decided in Phase 7. Read [[2026-10-20 02 - Answers to the plan questions]].
> - **Forms:** during tests they go to the author's own address (`CONTACT_TO` in `.env.local`, never in the repo).
> - **Waiting for the client:** price rates and VAT, final mailbox, real reviews, photos and videos, company story, print resolution threshold (Q5, Q6, Q7, Q10, Q11), real configurator presets, and the legal facts (legal name, responsible person, street, UID).
> - **Content source:** [[Old Website]] has every fact from the old site. Do not invent other facts.
> - **AI tools:** skills and plugins are set up. Read the "Skills and plugins" section in `CLAUDE.md`. No AI tool may appear as a contributor in git.
> - **Mock content:** six mock reviews (`src/content/testimonials.ts`), six mock service rooms, nine mock gallery photos, six configurator presets, the price rates, the sharpness threshold, and the legal drafts, each marked on the page (an "Esempio" badge, a note, or a draft banner). The home page area tiles use the mock service photos, each with "Esempio". The mock photos and presets are generated by `vp run mockups` (no stock photos). The production build stops until real content replaces them.
> - **Security and architecture audit (2026-10-22, committed on `main` and pushed):** read [[2026-10-22 08 - Security and architecture audit]], [[Specs/Security audit]], and [[Specs/Architecture review]]. Four medium security findings are fixed: the form send limit (`src/lib/rate-limit.ts`: per IP from the right of `X-Forwarded-For`, `src/lib/request.ts`, and a total ceiling), the `Origin` and `Referer` headers no longer write links into the e-mails, and `next.config.ts` sends a CSP and the other security headers. Open: a shared send limit or a spam challenge (decide with the host, Phase 7), SHA-pinned CI actions. The architecture review lists six candidates for easy content CRUD; the top one is a content catalogue module. **The author chose candidate 1, the content catalogue**: the `grilling` skill walks its decisions in [[2026-10-22 15 - Content catalogue grilling]] (no code until the author confirms the shared understanding).
> - **Next step:** the author reviews `feat/client-brief`, records the video for the client, and commits; then the client's photos (projects), answers (Q12–Q15), and the two Phase 6 targets. Also open: the author's choice of an architecture candidate; then the two open Phase 6 targets (home performance 0.9, JS 150 KB); the first CI run of `quality` passed (2026-10-22), see [[Development Plan#8. Phases]]. Phases 0 to 5 are committed and pushed to the public repo https://github.com/Ibro02/swiss-wallprinting (branch `main`); see [[2026-10-21 04 - First commit and push to GitHub]]. Git `user.name` and `user.email` are not set in the config.

## Entries

| Date | No. | Title | Status |
|---|---|---|---|
| 2026-10-23 | 04 | [[2026-10-23 04 - FAQ lift hover, magenta process glow]] | Done (branch `feat/client-brief`, merged into main) |
| 2026-10-23 | 03 | [[2026-10-23 03 - Project cards of one size, lightbox swipe]] | Done (branch `feat/client-brief`, merged into main) |
| 2026-10-23 | 02 | [[2026-10-23 02 - Dark pane and smooth project cards on phones]] | Done (branch `feat/client-brief`, merged into main) |
| 2026-10-23 | 01 | [[2026-10-23 01 - Client photos in projects and gallery]] | Done (branch `feat/client-brief`, merged into main) |
| 2026-10-22 | 16 | [[2026-10-22 16 - Script tag error on language change]] | Done (branch `feat/client-brief`, merged into main) |
| 2026-10-22 | 15 | [[2026-10-22 15 - Content catalogue grilling]] | In progress (grilling; no code) |
| 2026-10-22 | 14 | [[2026-10-22 14 - Project flip cards]] | Done (branch `feat/client-brief`, merged into main) |
| 2026-10-22 | 13 | [[2026-10-22 13 - Services cards, material tiles, fact glow]] | Done (branch `feat/client-brief`, merged into main) |
| 2026-10-22 | 12 | [[2026-10-22 12 - Client brief, projects and FAQ]] | Done (branch `feat/client-brief`, merged into main) |
| 2026-10-22 | 11 | [[2026-10-22 11 - Area cards back to mist]] | Done (committed, not pushed) |
| 2026-10-22 | 10 | [[2026-10-22 10 - Phone bugs, glow card, area cards]] | Done (committed, not pushed) |
| 2026-10-22 | 09 | [[2026-10-22 09 - Lighthouse reports on every CI run]] | Done (pushed) |
| 2026-10-22 | 08 | [[2026-10-22 08 - Security and architecture audit]] | Waiting for the author (architecture candidate; the fixes are committed on `main` and pushed) |
| 2026-10-22 | 07 | [[2026-10-22 07 - Merge Phase 6 and dark mode]] | Done (pushed) |
| 2026-10-22 | 06 | [[2026-10-22 06 - Dark mode]] | Done (merged into `main` in 07) |
| 2026-10-22 | 05 | [[2026-10-22 05 - Phase 6 plan and quality work]] | Done (merged into `main` in 07) |
| 2026-10-22 | 04 | [[2026-10-22 04 - Merge the services and configurator branches]] | Done (pushed) |
| 2026-10-22 | 03 | [[2026-10-22 03 - Responsive fixes and configurator tabs]] | Done (branches merged in 04) |
| 2026-10-22 | 02 | [[2026-10-22 02 - Commit, hero room, sliding reviews, glow cards]] | Done (committed in `177c390`) |
| 2026-10-22 | 01 | [[2026-10-22 01 - Print on scroll hero]] | Done (committed in `39d40e5`; video is mock) |
| 2026-10-21 | 07 | [[2026-10-21 07 - Question card back in the Questions section]] | Done (not committed) |
| 2026-10-21 | 06 | [[2026-10-21 06 - Colour, area cards, compact sizes, no flash]] | Done (not committed) |
| 2026-10-21 | 05 | [[2026-10-21 05 - Studio light redesign]] | Done (not committed) |
| 2026-10-21 | 04 | [[2026-10-21 04 - First commit and push to GitHub]] | Done |
| 2026-10-21 | 03 | [[2026-10-21 03 - Phase 5 configurator complete]] | Done |
| 2026-10-21 | 02 | [[2026-10-21 02 - Phase 4 browser check, build, docs]] | Done |
| 2026-10-21 | 01 | [[2026-10-21 01 - Phase 4 configurator MVP]] | Done |
| 2026-10-20 | 06 | [[2026-10-20 06 - Phase 3 inner pages and e-mail]] | Done |
| 2026-10-20 | 05 | [[2026-10-20 05 - Phase 2 home page]] | Done |
| 2026-10-20 | 04 | [[2026-10-20 04 - Phase 1 design system and shell]] | Done |
| 2026-10-20 | 03 | [[2026-10-20 03 - Phase 0 setup]] | Done |
| 2026-10-20 | 02 | [[2026-10-20 02 - Answers to the plan questions]] | Done |
| 2026-10-20 | 01 | [[2026-10-20 01 - Plan, CLAUDE.md, skills, old site]] | Done |
