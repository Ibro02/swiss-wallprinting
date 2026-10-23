---
tags: [prompt-log]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-22 16 - Script tag error on language change

## Prompt

> can you fix this issue
>
> ## Error Type
> Console Error
>
> ## Error Message
> Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client. Consider using template tag instead (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).
>
>
>     at script (unknown:0:0)
>     at LocaleLayout (src\app\[locale]\layout.tsx:67:9)
>
> ## Code Frame
>   65 |         {/* Before the first paint: the visitor's saved theme (no flash of the other one). */}
>   66 |         {/* oxlint-disable-next-line react/no-danger -- a fixed string from src/lib/theme.ts */}
> > 67 |         <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
>      |         ^
>   68 |       </head>
>   69 |       <body className="antialiased">
>   70 |         <NextIntlClientProvider messages={clientMessages}>
>
> Next.js version: 16.4.2 (Turbopack)

## Goal

Remove the console error about the theme `<script>` in the root layout, without a flash of the wrong theme.

## Result

- **Cause, reproduced in the browser:** the error appears only when the visitor changes the language. The language links were next-intl's `<Link locale>`, a client-side navigation. The locale is the root layout (`src/app/[locale]/layout.tsx`), so the navigation rendered `<html>` and `<head>` again in the browser, and React created the theme `<script>` there, which it never runs: the error.
- **A second bug with the same cause:** that re-render also removed `data-theme` from `<html>`. A visitor who chose dark on a light device saw the page turn light after a language change (until the next load). Checked: before the fix `data-theme` was gone and the page white; after it, dark.
- **Fix:** the language links are plain `<a>` with `getPathname({ href, locale })` (`LanguageSwitcher`), so a language change is a full page load: the server renders the new language, `THEME_SCRIPT` runs before the first paint, and React never creates the script in the browser. The links stay the same localized URLs (`/de/projekte`, …), so they still work before hydration and for search engines. The `<script>` in the layout stays: it is the only way to apply the saved theme before the first paint on a static page (no-ui-flash).
- **Regression test:** `e2e/theme.spec.ts` "a language change keeps the chosen theme" (dark, switch to German, still dark).
- **Checks:** the error no longer appears (navigation and language change in dev); `vp check` clean, `vp test` 243 passed, production build passed, `vp run e2e` 122 passed, 22 skipped by design (this run also covers the flip-card checkbox fix of [[2026-10-22 14 - Project flip cards]]).

## Changed files

- `src/islands/LanguageSwitcher.tsx`
- `e2e/theme.spec.ts`
- `CLAUDE.md` (the "No flash" rule: language links are plain `<a>`), `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- **Full page load for a language change**, not `next/script` or moving the script: `next/script` `beforeInteractive` runs from Next's client bootstrap, too late to prevent a flash of the other theme; and the root layout's re-render is the real fault (it also lost the theme). A change of language is a new page anyway.

## Open items

- None.
