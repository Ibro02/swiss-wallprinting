---
tags: [spec, client, analysis]
date: 2026-10-22
source: the client's brief (Bosnian), received by the author on 2026-10-22
status: adapted on branch feat/client-brief; open questions for the client below
---
# Client brief (2026-10-22): analysis and adaptation

The client sent a long brief (in Bosnian) with facts, texts, the structure he wants, his projects, FAQ questions, and four reference sites. He has not seen the site yet; structurally it is what he wants, and the 3D configurator stays a surprise. **He wrote the brief with AI**, so every fact was checked against the old site ([[Old Website]]) and the manufacturer of his printer (wallPen) before it went into the site. The full message is private: `Poruka klijenta.md` (git ignores it; it names the previous developer, domain access, and costs). This page keeps only what the site uses.

Prompt log: [[2026-10-22 12 - Client brief, projects and FAQ]].

## 1. Facts from the brief, checked

| Fact | Brief | Check | On the site |
|---|---|---|---|
| Founded | 2025 | New; no conflict with the old site | `company.founded`, About, JSON-LD `foundingDate` |
| Seat | Camignolo, municipality of Monteceneri, Ticino | Camignolo is part of Monteceneri; the old site says 6803 Camignolo | `company.municipality`, About |
| Service area | Ticino, all of Switzerland, other European countries possible | New | About facts, Contact row |
| Phones | +41 76 411 55 06, +41 79 350 08 85 | Same as the old site | Unchanged |
| Hours | 08:00–18:00 | New; **no days given**, so none are stored and JSON-LD has no `openingHours` | Contact row, footer |
| E-mail | Proposal: `info@swisswallprinting.ch` | Does not exist yet | Gmail stays until the mailbox exists (Q6) |
| Print height | About 3.80 m, width practically unlimited | Old site: 3.80 m. wallPen: frame up to 4 m | Unchanged facts; "about" added in the new texts, as he wrote |
| Surfaces | Plaster, gypsum, concrete, wood, glass, metal, after a check | wallPen lists wallpaper, wood, metal, glass, stone, concrete; competitors list the same | Services "Surfaces", FAQ |
| Indoor and outdoor | Yes, with surface preparation | Old site: yes | Services, FAQ |
| Ink | UV technology, solvent-free | wallPen: UV-LED cured ink; Wanddruck Schader (same printer): vegan UV ink, no solvents. The old site: "certified eco-friendly inks" | Services fact; "Why" keeps the old wording |
| Durability | Not in the brief | Old site: more than 12 years, **also outdoors**. Schader (same printer): ink maker guarantees up to 12 years, **3 years outdoors** | Unchanged (the client's old claim), but flagged: **Q14** |
| Social | Instagram, Facebook, TikTok | TikTok has no link in the brief | `social.tiktok: null` until he sends it (**Q12**) |

## 2. The reference sites (agent-browser, 2026-10-22)

Read with the `agent-browser` skill (accessibility snapshots and page text), not copied.

| Site | Tabs | What it does well | Notes for us |
|---|---|---|---|
| **Dein Wanddrucker** (Landquart GR) | Start, Angebot, Branchen, Kontakt | Big claim, three stats, "how the motif gets onto the wall", 15 sectors each with its own SEO page, a short FAQ (6), "send a photo of your wall and get a free visualisation", WhatsApp, three steps on the offer page | No gallery or reviews on the home page. Its stats show "0 m", "0 dpi" until a script counts up: a no-ui-flash problem we do not have (our numbers are in the HTML). Our 3D configurator does more than its "send us a photo" |
| **Wanddruck Schader** (Tann ZH) | Team, Projekte, FAQ, Kontakt | Real Google reviews with "see on Google" links, a long FAQ (removal, white walls, colours on screen vs print, care, duration, durability), surfaces as tiles, partners, sustainability (vegan UV ink), TikTok | Projects page is a plain image grid without stories. Uses the same wallPen E2 as our client: a source for technical facts |
| **The Wallprinters** (NL) | Inspiratie, Expertise, Muurprint, Over ons, Veelgestelde vragen, Contact, Aanleveren | Free quote in the header, reviews, a "hall of prints" with titled cases, delivery guidelines for files | Dutch market; the titled cases are close to the client's project stories |
| **wallPen** (manufacturer, DE) | Technik, Preise & ROI, FAQ, Referenzen, Blogs | Technical facts: UV-LED curing, up to 4 m frame height, 300–1200 DPI, indoor and outdoor, scratch and water resistant, unprintable margins in corners (left 6, right 10, top and bottom 25 cm) | For checking facts only. The corner margins matter for the configurator later |

**What the client asked to compare,** and where the site stands now:

| Topic | Competitors | This site |
|---|---|---|
| Technology | Short stats and a "how it works" block | "Why" numbers, "Surfaces and technology", the scroll hero that shows the printer at work, the FAQ |
| Services | Sector lists (Dein Wanddrucker: 15 pages) | Rooms with before/after, eight kinds of print, business and private clients, application areas linked to the configurator |
| Projects and gallery | Image grids (Schader), titled cases (The Wallprinters) | **Project stories** with title, place, story, and closing line, then the filterable photo grid with a lightbox |
| Reviews | Google reviews with links (Schader) | Mock band until the client decides; the best source is a Google Business Profile (he wants one) |
| FAQ | 6 to 13 questions | 10 (his list) |
| Contact | Form, phone, WhatsApp, address | Form (works without JavaScript), phones, WhatsApp button and row, e-mail, map link, hours, service area, quote from the configurator with a screenshot |
| Our edge | None has a configurator | 3D configurator with price, share link, and quote request: the surprise |

## 3. The brief against the site

Branch `feat/client-brief` (not committed until the author asks).

| The client wants | Before | Now |
|---|---|---|
| Visitors understand in seconds what the company does; big visual of a project; headline "High resolution. No limits. Directly on your wall." | Scroll hero with our own headline | His headline and sub-text in the hero; his closing line "We don't just print pictures. We create spaces that tell stories." at the end of the print |
| Buttons: see our projects, request a quote, WhatsApp | Configurator and "free quote" | Configurator (the surprise) + "See our projects" + "Request a quote"; WhatsApp is the floating button on every page |
| About us: his story | Text from the old site | His story, closing line, and three facts |
| Services: eight possibilities, surfaces, technical facts | Four kinds of print | His eight kinds; new sections "For whom" and "Surfaces and technology" |
| Two client groups, emphasis on company history | Application areas only | "For whom": business (with the history and identity emphasis) and private |
| Process in four steps | Our four-step draft | His four steps; step one carries the configurator |
| Gallery of finished projects with stories | Gallery of mock photos | **Projects tab** with his seven stories (photos pending), then the grid |
| FAQ | None | **FAQ tab** with his ten questions; answers are drafts |
| Simple contact form | Done | Unchanged; hours and service area added |
| Reviews | Mock band | Unchanged (he has not decided) |
| Logo, colours, fonts | His SVG logo and colours already in use | Unchanged; the PDF logo adds nothing new |
| Languages: Bosnian first, then quality IT, EN, DE | IT source, agent drafts | His Bosnian texts used as the source for the new content; IT, DE, EN are agent drafts for review |

## 4. Proposals (not built)

- **Google Business Profile** first, then real Google reviews in the testimonial band with a link to the profile (like Schader). Our JSON-LD is ready for it.
- **Local search:** pages per sector or region later (Dein Wanddrucker has 15), e.g. "stampa murale Ticino", "Wanddruck Tessin".
- **More FAQ** after his review: can a print be removed, must the wall be white, will colours look like on my screen, how to care for it (the competitors answer these).
- **Configurator:** the wallPen corner margins (6–25 cm) as a limit, and a "send us a photo of your wall" option for visitors who prefer it.
- **Partners** (architects, photographers), as Schader shows, once there are real ones.

## 5. Open questions for the client

Also in [[Development Plan#9.2 For the client (can come during the build)]] (Q6, Q7, Q10, Q12–Q15).

1. The project photos and videos (Google Drive), and a clean time-lapse for the hero.
2. May Milly Torte, Barber House, and Caviezel be named? (Q13)
3. The TikTok link. (Q12)
4. Outdoor durability: "more than 12 years, also outdoors" or a more careful wording? (Q14)
5. Opening days for 08:00–18:00.
6. Reviews: screenshots now, or wait for a Google Business Profile?
7. Review of the FAQ answers and of the IT, DE, and EN translations.
8. `info@swisswallprinting.ch`, the domain access, hosting, and `.com` (Phase 7).

## 6. Texts and languages

- New UI texts: `messages/*.json` (Home.hero, Home.process, About, Services, Projects, Gallery, Faq, Contact, Footer). The project stories: `src/content/projects.ts` (`LocalizedText`).
- Bosnian is his own wording (lightly edited: "u mjestu Camignolo" instead of a declined place name). Italian, German (Swiss spelling, "Sie"), and English (British) are agent translations: drafts for review.
- No number is typed into the messages: height and years are ICU parameters from `company.ts`.
