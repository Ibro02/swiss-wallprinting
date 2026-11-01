---
tags: [prompt-log, hosting, vercel]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (advice only)
---
# 2026-11-01 17 - Vercel settings

## Prompt

> help me to host it to the vercel
>
> just tell me what I need to know
>
> I need to know what to set as a root directory?
>
> vercel is currenlty looking for Build and Output settings (build command, output directory and install command)
>
> I also need to add env varables if needed

## Goal

The Vercel project settings and environment variables for a first (not yet public) deployment.

## Result

Advice only; no project file changed.

**Project settings:**
- **Root directory:** the repo root (`./`). Not the `swiss-wallprinting/` folder: that is the Obsidian vault.
- **Framework:** Next.js, detected.
- **Build and Output:** leave the defaults. Build `pnpm run build` (the mock guard, the mail check, `next build`), the Next.js output, install `pnpm install`.
- **Node.js:** 24.x (`engines`: >= 24.11).

**Checked locally:** the install's `prepare` step (`vp config --no-agent`) without a `.git` folder only prints ".git can't be found" and exits with 0, so it does not stop an install.

**Environment variables:**
- `ENABLE_EXPERIMENTAL_COREPACK=1`: Vercel then uses pnpm 12.14.0 from `packageManager`.
- `SITE_URL`: the Vercel address.
- `FORM_SECRET`: without it, every function instance has its own secret, and tokens fail across instances.
- `MAIL_TRANSPORT` `resend` or `smtp`, with `MAIL_FROM`, the transport's settings, and `CONTACT_TO`. Without them, the forms say "not sent": the outbox cannot write on Vercel.
- Not set:
  - `SITE_ENV`: `production` stops the build while mock content exists, and keeps robots.txt closed until then.
  - `TRUSTED_PROXY_HOPS`: the default 1 is Vercel.

**Git:** `main` was 3 commits ahead of `origin/main` (f6b8313, d913ace, 5abd16b). Vercel builds from GitHub. The author said "Yes, push": pushed (`ed25c5e..5abd16b`). This entry was committed and pushed with [[2026-11-01 18 - Privacy page finished]].

## Changed files

- This entry, `Prompt Log.md`.

## Decisions

- The author hosts on Vercel (Phase 7 hosting question): a preview deployment first, without `SITE_ENV=production`.

## Open items

- Not verified on Vercel itself. If the install fails with a pnpm version error, check that `ENABLE_EXPERIMENTAL_COREPACK=1` is set, then redeploy.
- The form send limit lives in memory, per function instance (security audit, open item: a shared limit or a spam challenge, decided with the host).
- The custom domain and the `.ch` / `.com` split are still open; after a domain change, update `SITE_URL` and redeploy.
