# swiss-wallprinting

## What this codebase does

The public marketing website of a small Swiss company that prints images on walls.
It is a Next.js 16 App Router app with next-intl (four locales). The pages are mostly static
Server Components. It has a 3D wall configurator (React Three Fiber, browser only) that
estimates a price and can send a quote request. The site has no user accounts, no database,
no API routes, and no payments. The visitors are anonymous members of the public, and the
only reader of the data they send is the company owner, by e-mail.

## Auth shape

There is no authentication, by design. The only server inputs are:

- Two **public Server Actions** that send an e-mail to the owner: `submitQuestion`
  (`src/features/contact/actions.ts`) and `submitQuote` (`src/features/quote/actions.ts`).
  Their flows are `handleQuestion` and `handleQuote`, with Zod validation on the server only.
- The spam controls on both: a honeypot field, a minimum fill time (`spamVerdict`), and the
  in-memory send limit `createRateLimiter` keyed by `clientIp()`, which counts
  `X-Forwarded-For` from the right (`TRUSTED_PROXY_HOPS`).
- `src/proxy.ts` (locale routing, the 404 rewrite), and the configurator page's query string
  (`?room=…`, `?area=`), parsed by `fromSearchParams` and `startConfiguration`.

## Threat model

Ranked by impact:

1. Abuse of the two forms to flood the owner's inbox or burn the mail provider's quota and
   sender reputation (a script that skips the browser, rotates headers, or replays requests).
2. Phishing or forged statements in the owner's e-mails: any value from the request that ends
   up as a link, a header, an attachment, or a "fact" the owner trusts (price, page, origin).
3. Script injection on the pages, or a way around the Content Security Policy in
   `next.config.ts` (scripts allow `'unsafe-inline'` because the pages are static).
4. The supply chain: dependencies and the GitHub Actions workflow.

## Project-specific patterns to flag

- A request header (`Origin`, `Host`, `Referer`, `X-Forwarded-*`) used in an e-mail, a link,
  or a log line. Links must come from `siteUrl()` and the page from `refererPath()`.
- A number the e-mail states that comes from the browser instead of being computed again on
  the server (the quote price and area come from the share-link fields via `placementOf`).
- Hidden form fields the browser fills (`QUOTE_HIDDEN`: the configuration, the upload name and
  aspect, a JPEG screenshot data URL checked by `parseScreenshot`).
- An e-mail recipient or credential written in code instead of `CONTACT_TO` / `MAIL_*`
  environment variables (`src/lib/mail.ts`).
- A `<script>` or `dangerouslySetInnerHTML` other than `THEME_SCRIPT` and `JsonLd`.

## Known false-positives

- The Server Actions are public and unauthenticated on purpose: they only send a message to
  the owner and read no data.
- `THEME_SCRIPT` (`src/lib/theme.ts`) is a constant inline script; `JsonLd` escapes `<`.
- The `outbox` mail transport writes files only in development; `scripts/check-mail.ts` stops
  a production build that uses it.
- Uploaded images never leave the browser (`prepare-upload.ts`); only a screenshot is posted.
- Content files in `src/content/` are trusted, author-written data, not user input.
