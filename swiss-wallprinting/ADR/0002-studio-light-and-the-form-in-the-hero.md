---
status: accepted
date: 2026-10-21
---
# Studio light, with the question form in the hero

> [!note] Revised the same day (2026-10-21)
> The author did not want the form in the first screen: the question card is back at the end of the home page, in the Questions section (README item 6), and the hero has a "Free quote" button that scrolls to it. The rest of this decision stands. See [[2026-10-21 07 - Question card back in the Questions section]].

The site follows the author's reference prompt: a white frame of rounded cards, a frosted header pill, Inter with one Instrument Serif italic accent per headline, and the question form in a white card inside the hero ([[Specs/Studio light redesign]]). So the home page's last section (README item 6, "form for questions") is not a second form: it lists the phones, WhatsApp, and e-mail and links up to the form, because two copies of one form on a page would share ids and split the answers. The reference's background video is not used: it is another company's file on a third-party CDN with an unknown licence, and the site loads nothing from third parties (privacy, Development Plan P10).

## Consequences

- Done on the same day: `QuestionCard` renders in `QuestionSection`; the anchor `QUESTION_FORM_ID` moved with it.
- When the client sends a time-lapse, it goes into the hero as a muted, looping, inline video with the photo as its poster.
- taste-skill's rules forbid this look (serif accent, emoji, glass); its verdicts do not apply to this site.
