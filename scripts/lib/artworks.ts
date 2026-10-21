// Original SVG artworks for the MOCK "after" photos (scripts/mockups.ts). Shapes only,
// no text: the SVG renderer in sharp does not have the site fonts.

export type ArtworkName = 'cmyk' | 'lake' | 'lemons' | 'space' | 'arches' | 'peaks'

const svg = (viewBox: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice">${body}</svg>`

/** Company wall: the printer's ink colours as large overlapping circles. */
function cmyk() {
  return svg(
    '0 0 1200 700',
    `<circle cx="450" cy="300" r="240" fill="#00a6e0" opacity="0.88"/>
     <circle cx="680" cy="300" r="240" fill="#e51158" opacity="0.82"/>
     <circle cx="565" cy="500" r="190" fill="#ffd400" opacity="0.86"/>
     <rect x="960" y="130" width="26" height="440" rx="13" fill="#0e0e10"/>
     <rect x="1010" y="230" width="26" height="340" rx="13" fill="#c5d20d"/>
     <rect x="1060" y="330" width="26" height="240" rx="13" fill="#0e0e10"/>`,
  )
}

/** Hotel wall: a lake between mountains (Ticino), soft morning colours. */
function lake() {
  return svg(
    '0 0 1400 600',
    `<defs>
       <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4cdb7"/><stop offset="1" stop-color="#d4e6ec"/></linearGradient>
       <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb0c2"/><stop offset="1" stop-color="#2f6683"/></linearGradient>
     </defs>
     <rect width="1400" height="600" fill="url(#sky)"/>
     <circle cx="990" cy="190" r="72" fill="#fbe3a2"/>
     <path d="M0 350 L170 205 L320 300 L480 140 L650 320 L800 195 L970 330 L1130 175 L1290 300 L1400 225 V600 H0Z" fill="#a7bfcc"/>
     <path d="M0 395 L150 295 L300 375 L470 255 L630 385 L810 285 L990 395 L1160 275 L1400 375 V600 H0Z" fill="#7397ab"/>
     <path d="M0 440 L210 355 L430 430 L610 345 L830 440 L1050 355 L1270 430 L1400 400 V600 H0Z" fill="#3f6682"/>
     <rect y="450" width="1400" height="150" fill="url(#water)"/>
     <g stroke="#eaf3f6" stroke-width="5" stroke-linecap="round" opacity="0.55">
       <path d="M880 490 H1100"/><path d="M930 520 H1050"/><path d="M200 505 H360"/><path d="M520 545 H640"/>
     </g>`,
  )
}

/** Restaurant wall: Mediterranean lemons and leaves. */
function lemons() {
  const groups = [
    [180, 160, -20],
    [470, 120, 15],
    [780, 190, -35],
    [1010, 110, 25],
    [300, 410, 30],
    [620, 380, -10],
    [900, 450, 40],
    [140, 600, -40],
    [480, 620, 10],
    [780, 650, -25],
    [1050, 600, 20],
  ] as const
  const body = groups
    .map(
      ([x, y, angle]) => `<g transform="translate(${x} ${y}) rotate(${angle})">
         <ellipse cx="-58" cy="-38" rx="62" ry="20" fill="#3d6b3a" transform="rotate(-30 -58 -38)"/>
         <ellipse cx="52" cy="-44" rx="54" ry="18" fill="#58864a" transform="rotate(25 52 -44)"/>
         <ellipse cx="0" cy="0" rx="70" ry="52" fill="#f2c230"/>
         <ellipse cx="66" cy="0" rx="12" ry="9" fill="#f2c230"/>
         <ellipse cx="-22" cy="-16" rx="22" ry="12" fill="#fbe48a" opacity="0.8"/>
       </g>`,
    )
    .join('')
  return svg('0 0 1200 760', body)
}

/** School wall: planets and stars on a deep blue panel. */
function space() {
  const stars = [
    [90, 80],
    [260, 150],
    [410, 60],
    [640, 120],
    [820, 70],
    [1080, 140],
    [150, 520],
    [330, 610],
    [700, 600],
    [950, 560],
    [1120, 470],
    [560, 300],
    [1010, 330],
    [230, 330],
  ]
    .map(
      ([x, y], i) =>
        `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 5 : 3}" fill="#ffffff" opacity="0.9"/>`,
    )
    .join('')
  return svg(
    '0 0 1200 700',
    `<rect width="1200" height="700" fill="#1c2a55"/>
     ${stars}
     <circle cx="600" cy="360" r="300" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="3" stroke-dasharray="10 14"/>
     <circle cx="430" cy="330" r="120" fill="#ff8a3d"/>
     <ellipse cx="430" cy="330" rx="190" ry="40" fill="none" stroke="#ffd400" stroke-width="14" transform="rotate(-18 430 330)"/>
     <circle cx="820" cy="250" r="70" fill="#00a6e0"/>
     <circle cx="790" cy="230" r="18" fill="#7fd3f2" opacity="0.7"/>
     <circle cx="920" cy="500" r="42" fill="#e8e6e1"/>
     <circle cx="250" cy="540" r="34" fill="#c5d20d"/>`,
  )
}

/** Home wall: soft rainbow arches (a common bedroom mural). */
function arches() {
  const colours = ['#c8693f', '#e2a33b', '#9bae8c', '#e8b4a0']
  const arcs = colours
    .map((colour, i) => {
      const r = 330 - i * 78
      return `<path d="M${500 - r} 700 A${r} ${r} 0 0 1 ${500 + r} 700" fill="none" stroke="${colour}" stroke-width="66"/>`
    })
    .join('')
  return svg(
    '0 0 1000 700',
    `${arcs}<circle cx="820" cy="170" r="62" fill="#e2a33b"/>
     <circle cx="160" cy="210" r="10" fill="#c8693f"/><circle cx="210" cy="160" r="6" fill="#c8693f"/>
     <circle cx="880" cy="330" r="8" fill="#9bae8c"/>`,
  )
}

/** Facade: bold geometric peaks in the brand colours. */
function peaks() {
  return svg(
    '0 0 1400 700',
    `<circle cx="1050" cy="190" r="110" fill="#ffd400"/>
     <path d="M0 700 L330 230 L620 700Z" fill="#e51158"/>
     <path d="M380 700 L720 140 L1060 700Z" fill="#0e0e10"/>
     <path d="M820 700 L1110 320 L1400 700Z" fill="#00a6e0"/>
     <path d="M560 700 L720 140 L800 700Z" fill="#c5d20d" opacity="0.9"/>
     <path d="M200 700 L330 230 L380 700Z" fill="#ff5f8f" opacity="0.6"/>`,
  )
}

export const ARTWORKS: Record<ArtworkName, () => string> = {
  cmyk,
  lake,
  lemons,
  space,
  arches,
  peaks,
}
