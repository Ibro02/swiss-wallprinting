---
tags: [prompt-log]
date: 2026-10-23
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-23 01 - Client photos in projects and gallery

## Prompt

> I have some images from client in  C:\Users\IbrahimHodžić\OneDrive - Galeyo d.o.o\Desktop\My projects\swiss-wallprinting\public\photos\projects
>
> I have made a folder for every project at the website,
>
> use these images for gallery and projects

## Goal

Use the client's photos (one folder per project) on the Projects page and in the gallery (branch `feat/client-brief`).

## Result

- **Moved out of `public/`:** the folder had 74 files, 729 MB, with videos (MP4, MOV) and a Visual Studio cache (`Monteceneri/.vs/`). `public/` is served as it is and is in git (public repo), so the originals moved to `Assets/Projects/` (same folder names), which git now ignores. The site uses optimized copies.
- **Sorted:** 36 unique photos (the "(1)" files are byte-identical duplicates). Checked one by one (contact sheets, rotated by EXIF):
  - The six project folders are the client's own phone photos (Samsung). Used: Monteceneri 2, holiday cottage 1, Milly Torte 1, by the pool 3 (before, printing, after), Barber House 1, Caviezel 2. Not used: the photos with people's faces (the team setting up, a selfie), a salon photo without the print.
  - **"Private client, living room" is mixed and has no photo of that project** (palms, sea, sunset). Five photos are the client's own other walls (Samsung, 2025-11 to 2026-08): a collage of motifs, a forest through a broken wall, a lake at night, a racing car, an office logo; they are in the gallery as other work. **Not used, not the client's work:** `diewanddrucker_06/18` (a competitor), `WallPen1`, `dsc00207`, `dsc00243`, `dsc00215_16_9_s` (the printer maker's pictures), `Türkei ArtPen_2`, `SparkasseBM1`, `Tiger Kopf`, `Copia di We look deeper`, `praxis-1024x567`, `101226-1200-1000-Crop`, `IMG_20250802_194045_947`, `37873828-…`, and two `Screenshot_…` files. Publishing them as the client's portfolio would misrepresent the company and use other people's photos.
- **Pipeline:** `scripts/images.ts` lists the 15 photos (keys `projects/*`, `work/*`); `vp run images` wrote them to `public/photos/projects/` and `public/photos/work/` (longest side 2000 px, JPEG, 125–533 KB, 4.6 MB in total, rotated, without metadata) and to `src/content/images/photos.ts`. A `staticImport` flag keeps only the tiger in `src/assets/photos/`. The tiger, favicons, and OG image came out unchanged.
- **Projects:** six projects have their photos (the first is the card's cover) and are `mock: false`; "sea-view" stays mock with its placeholder. The page note now says "photos of some projects are coming soon".
- **Gallery:** the mock photos are gone; the grid is the 15 photos and the tiger, each with alt text and a caption in four languages (drafts) and an application area where it is clear (exteriors, restaurants, homes, offices), so the filter shows those four.
- **Contrast on the glass panes over real photos** (the open item of [[2026-10-22 14 - Project flip cards]]), measured with the text hidden: light 5.98, dark 3.99 at first (a white wall through the pane on the Caviezel card); the dark pane is now paper 90 % instead of 80 %: dark 5.01. (A first measurement said 1.56: the script read Tailwind's `oklab()` colours as RGB; fixed by converting them on a canvas.)
- **Checks:** `vp check` clean, `vp test` 243 passed, production build passed, `vp run e2e` 122 passed and 22 skipped by design (axe clean on every page, light and dark, desktop and phone); first-load JS of the projects page 159 KB gzip, unchanged (photos are images, not script). Screenshots of the Projects page (cards and gallery), desktop and phone.

## Changed files

- `.gitignore` (`Assets/Projects/`); originals moved from `public/photos/projects/` to `Assets/Projects/` (not in git)
- `scripts/images.ts`, `src/content/images/photos.ts` (generated), `public/photos/projects/*.jpg`, `public/photos/work/*.jpg` (generated)
- `src/content/projects.ts`, `src/content/gallery.ts`
- `src/features/projects/ProjectList.tsx` (dark pane 90 %)
- `messages/*.json` (`Projects.photosPending`)
- `CLAUDE.md` (the client's photos), `swiss-wallprinting/Development Plan.md` (Q7), `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- **Originals out of `public/` and out of git**, optimized copies in: the rule of `CLAUDE.md` ("do not serve files from Assets/ directly; the pipeline copies optimized versions to public/"), the size, the GPS data in phone photos, and a public repo.
- **Only the client's own work**, judged by camera data and content; the doubtful ones (screenshots, files without camera data) are left out rather than guessed.
- **No faces** of people who have not agreed to be on the site.
- **The gallery without mock photos:** the client's real walls now fill it.
- **Videos not used yet:** they are a good source for the hero time-lapse and the process; a separate step.

## Open items

- **Client:** a photo of the sea-view living room; which of the "Private client, living room" photos are really his (and whether the screenshots show his work); consent of the people in the team photos if he wants them; consent to name Milly Torte, Barber House, Caviezel (Q13).
- **Author:** the videos (hero time-lapse, process); the `.vs` cache in `Assets/Projects/Monteceneri/` can be deleted.
