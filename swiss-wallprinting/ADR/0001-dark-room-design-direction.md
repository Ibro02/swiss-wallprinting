---
status: superseded by ADR-0002
date: 2026-10-21
---
# The dark room, set in Archivo

> [!note] Not adopted (2026-10-21)
> The author chose a new pass from `main` instead: see [[ADR/0002-studio-light-and-the-form-in-the-hero]]. The code of this direction is in git stash (`premium-ui attempt 1`, two entries); nothing of it is in `main`.

The site uses one near-black ground with the prints as lit exhibits (taste-skill direction "The dark room", chosen by the author on 2026-10-21), and one typeface, Archivo, for everything. The dealt face was Switzer, but its licence (ITF Free Font License 2.0, section 02) forbids making the font files available through a public repository, and this repository is public; the Fontshare stylesheet is not an option either, because the site loads no fonts from third parties (privacy, Development Plan P10). Archivo (SIL OFL) is the nearest face of the same class in the taste-skill library and comes through `next/font` like the old fonts. The dark ground also settles an old constraint: the colour logo needs a dark background, so the whole site can now be the dark of the header.

## Consequences

- Unbounded and Inter are gone; any new text uses the five type steps in `src/app/globals.css`.
- To switch to Switzer later, buy or license it for the client's own hosting, keep the files out of this public repository, and change only `src/app/fonts.ts`.
