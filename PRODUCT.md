# Product

<!-- impeccable:product-schema 1 -->

The product record for the impeccable skill (it reads this file from the project root). The vault (`swiss-wallprinting/`) stays the source of the requirements: this file only condenses what the design work needs. Confirmed by the author on 2026-10-21 (audience: businesses first).

## Platform

web

## Users

- **First: businesses in Ticino and the rest of Switzerland** that want a wall with their brand or an image: offices and companies, hotels, restaurants, shops, schools. They compare a few providers, want to see the result before they pay, and want a price range early.
- **Second: private home owners** who want a photo, a mural or a sentence on a wall at home.
- The site is read in Italian first (Ticino), then German and English; Bosnian on the `.com` domain.

## Product Purpose

The presentation site of Swiss Wall Printing, a small company in Camignolo (Ticino) that prints images directly on walls with a vertical wall printer. Success: a visitor understands in seconds that the print goes on the wall itself (no film, no sticker), tries their own wall in the 3D configurator, and asks for a quote (form, phone, WhatsApp).

## Positioning

Direct printing on the wall, on site, by a local Ticino company: up to 3.80 m high, unlimited width, interior and exterior, colours that last more than 12 years, certified eco inks. The 3D configurator ("Try your wall printing") shows the print on the visitor's own wall size with an approximate price before any contact.

## Operating Context

- The client's machine prints the wall line by line; a print head with cyan, magenta, yellow and black ink ports passes across the wall (the client's own photo shows it printing a tiger on a black wall).
- The work happens on site: the visitor sends wall measurements and a photo, gets a preview, then the wall is printed.
- Contact: e-mail, two phones (IT; IT-DE-CH), WhatsApp, Instagram, Facebook. No physical shop to visit.

## Capabilities and Constraints

- Pages: Home, About, Services, Gallery, Contact, Try your wall (configurator), Imprint, Privacy. Section list of the home page is fixed by the author's README.
- Facts come only from the old site or the client (`swiss-wallprinting/Old Website/Old Website.md`). Prices, reviews, gallery photos, services rooms and presets are MOCK until the client sends real ones, and are marked "example" on the page.
- Privacy: self-hosted fonts, no tracking, no Google Maps embed, no reCAPTCHA.
- Next.js App Router, Tailwind CSS v4, Vite+ toolchain; three.js only on the configurator page.

## Brand Commitments

- The client's logo (`Assets/SWP_Logo.svg`): magenta `#E51158` and lime `#C5D20D` lettering. The colour version needs a dark ground (lime on a light ground is 1.7:1); on light grounds the site uses the client's black variant (`Assets/SWP_LogoBlack.svg`).
- Name: "Swiss Wall Printing".

## Evidence on Hand

- One real work photo: `src/assets/photos/tiger-mid-print.jpg` (the printer mid-print).
- No real reviews, no real project photos, no video, no team photos yet. Do not fabricate them.

## Product Principles

1. Show the wall, not the company: every screen leads with a printed wall.
2. Prove "on the wall, not a sticker" with pictures and the configurator, not adjectives.
3. A price range before a phone call: the configurator and the quote request are one step apart.
4. Honest content: every placeholder is marked as an example until the client replaces it.

## Accessibility & Inclusion

WCAG 2.2 AA: contrast checked for every text colour pair, visible focus, full keyboard use of the configurator panel, reduced-motion versions of every animation, four languages.
