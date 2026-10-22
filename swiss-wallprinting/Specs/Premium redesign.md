---
tags: [spec, design]
date: 2026-10-21
status: not adopted (code in git stash, see the note)
---
# Premium redesign: "The dark room"

> [!note] Not adopted (2026-10-21)
> This was the first redesign attempt (another agent session, branch `design/premium-ui`, never committed). The author stashed it and asked for a new pass from `main`: [[Specs/Studio light redesign]]. The tracked changes are in `git stash` "WIP on design/premium-ui", the new files in "premium-ui attempt 1: untracked files". The prompt log entry it names was never written.

The art direction of the whole site since 2026-10-21. It replaces [[Development Plan#5. Design direction]] (glass pill navigation, Unbounded + Inter, plaster and graphite bands). The design system as built is in `DESIGN.md` (repo root, tokens in `src/app/globals.css`); the product record for the design skills is `PRODUCT.md`. Read [[2026-10-21 05 - Premium redesign with the design skills]] for how it was made.

## How the direction was chosen

- Skills: **taste-skill** (`design-taste-frontend`) as the art director, **impeccable** for the product record, the craft floor and its design hook, **Emil Kowalski's skills** (`emil-design-eng`, `animate`, …) for motion and component feel. All in `.claude/skills/` (sources and licences in `.claude/skills/README.md`).
- taste-skill dealt three directions for the brief (sector `architecture`): *The name as a monument*, *The dark room*, *The contact sheet*. The author chose **The dark room** (seed `287900261`). The author also chose: whole site in this pass, businesses as the first audience, and recomposing the README's card patterns (reviews, application areas) with the same content.
- **One redraw:** the type slot. The dealt face was Switzer (Fontshare). Its licence (ITF FFL 2.0, section 02) forbids making the files available through a public repository, and this repo is public. Archivo (SIL OFL, Google Fonts through `next/font`) is the closest face of the same class in taste-skill's library (`archivo-regular`, class grotesk-light). See [[ADR/0001-dark-room-design-direction]].
- **Palette mapped to the brand:** the dealt "Lunar and bronze" keeps its proportions (soft black ground, one step lighter panels, soft light ink, one accent on the action). The bronze accent became the logo's magenta; lime stays in the logo.
- impeccable's concept-seed roll was not run: the author named taste-skill as the designer, and the two skills would have rolled two competing directions. impeccable's subagents (finish reviewer, documenter) were not spawned; their work was done in the main session (`DESIGN.md` written from its `document.md` rules).

## Direction contract

- **THESIS:** the prints are exhibits in a dark gallery, and the page shows them being printed. It refuses the category default: a hero video with a centred headline, three feature cards, a review carousel, an icon grid.
- **OWN-WORLD:** near-black ground `#0e0e10`, tone steps for panels, soft ink `#f0efec`, magenta `#e51158` only on the action; Archivo light at five sizes; square corners; unframed pictures whose edges fall into the ground; a 3 px cyan-magenta-yellow print head.
- **IDEA:** on this page, the client's print head (its pass across the wall) becomes the way every exhibit appears in the dark room.
- **LIVE THING:** in *How it works*, the visitor picks a print and watches it printed on the lit wall, then opens it in the 3D configurator with that print (`?image=`).
- **FIRST VIEWPORT:** the client's photo of the printer mid-print, about half the screen wide, printed onto the page on load; a small second exhibit (a wall whose print changes every 6 s) top left; the headline modest at the bottom left with the lead and two text links; the magenta "Try your wall" button in the header.
- **FORM:** taste-skill direction *The dark room* (seed 287900261), hero *Two prints in darkness*, sections *Lead quote, corner quotes* → *One scene, stepping statements* → *Photographs down a diagonal* → *Line-up at one type size* (with a preview anchored to the row) → *Visit card on a photograph* → *A single quiet line*. Motion: *Slow crossfade*, built as the print pass.

## What each section became

| Section (README order) | Composition |
|---|---|
| Hero | Two exhibits in darkness: the tiger photo (print pass on load) and `PrintedWall` (cycle). Desktop only for the second exhibit |
| Reviews | On a panel one tone step up: the rating with the heading, one large quotation (≤ 36 px), two in the corners, the rest in three text columns. Every mock review says "Esempio" |
| Why | A sticky stage (`StatementScene`): the lit wall below, six statements stepping in the flat ground above (the first is the h2), two small pictures per statement |
| Process | Four steps down a diagonal; step two is the live wall (`PrintedWall`, pick); the order is in the words and the `<ol>` |
| Application areas | An index of rows at one size (`AreaIndex`); the right part shows the room, level with the row the mouse points at |
| Question form | The paper card with the form over Camignolo from the air (archive photo, credited on it) |
| Footer | Two quiet lines: name and place, pages, legal links; e-mail, phones, socials |

Inner pages follow the same system: `PageHeader` (h1 left at the head size, lead right), large exhibits with text beside them, `CtaBand` as a statement and two actions. The configurator keeps its logic; only its surfaces changed (dark panel, square segmented controls).

## Pictures

- The client's photo (tiger mid-print): hero, about, gallery, process.
- Archive photos (Wikimedia Commons, CC BY-SA 4.0, credited on the page and on the imprint page): "Camignolo" by Werner Friedli (ETH-Bibliothek Zürich), https://commons.wikimedia.org/w/index.php?curid=60218741; "Camignolo, Bironico" by Werner Friedli, cropped, https://commons.wikimedia.org/w/index.php?curid=59732155.
- MOCK photos, regenerated by `vp run mockups` with a gallery spot light (the edges fall into the ground colour), plus a new set `frames/<preset>`: one wall, one framing, each preset printed on it.
- No video: taste-skill's open-archive search found no openly licensed clip of a wall printer. The hero can take the client's time-lapse when it arrives (Development Plan P2).

## Checks (2026-10-21)

- taste-skill inspector, home (IT): before **11 FAIL, 7 WARN** → after **0 FAIL, 2 WARN** (no video; the hero headline is modest by the direction's choice). DE and EN home: 0 FAIL. About, Services, Gallery: 0 FAIL. Contact: 1 FAIL kept on purpose (`body-size`: the page's running text is the contact data at title size; the 14 px blocks are the consent line and the photo credits).
- taste-skill source lint: 0 FAIL, 0 WARN (the allowed exceptions carry `taste-skill-ignore` with the reason: field underlines, floating overlays, the print head's stripes, the hidden honeypot field).
- Playwright (`vp run e2e`): 36 tests on a desktop and a phone, all pass.

## Critique (taste-skill, last round)

```
ROUND 2
Seen in one second: a lit photo of a wall printer printing a tiger in a dark room; "La tua immagine, stampata direttamente sul muro."; one magenta button.
Idea (one sentence): the print head's pass across the wall becomes the way every exhibit appears in the dark room.
Live thing: pick a print in "How it works", watch it printed on the wall, open it in the 3D configurator.
Layout words by section: hero=two exhibits in darkness / reviews=lead quote, corner quotes on a panel / why=sticky scene, stepping statements / process=pictures down a diagonal / areas=line-up with anchored preview / question=visit card on an archive photo / footer=quiet lines
Scores: design 7.5 · usability 8 · creativity 7.5 · content 7 → overall 7.6
Caps applied: design ≤ 6.5 while fewer than four real photographs exist (one client photo and two archive photos; the rest are generated mock walls). With the cap: overall 7.2.
Top three problems:
1. Real photographs: the mock walls are clean renders; the client's own before/after photos will make the page credible (cap above).
2. The hero headline is modest by design; on tablets (768 px) it reads small (inspector WARN small-title).
3. No moving picture: a time-lapse of the printer would replace the still in the hero.
```
