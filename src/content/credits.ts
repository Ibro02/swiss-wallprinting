// Third-party works on the site, for the credits on the imprint page.

export interface Credit {
  work: string
  author: string
  licence: string
  url: string
}

export const credits: readonly Credit[] = [
  {
    work: '3D model "Room Blank" (textures also used in the example photos)',
    author: 'Denkon',
    licence: 'Sketchfab Standard',
    url: 'https://sketchfab.com/3d-models/room-blank-4a3b97905f9549218525e14c49403e28',
  },
  {
    work: '3D model "Walls Window Door"',
    author: 'stylo0',
    licence: 'Sketchfab Standard',
    url: 'https://sketchfab.com/3d-models/walls-window-door-0ea43c83dfb6400998665f52e24a7081',
  },
  {
    work: 'Font Unbounded',
    author: 'NaN',
    licence: 'SIL Open Font License 1.1',
    url: 'https://fonts.google.com/specimen/Unbounded',
  },
  {
    work: 'Font Inter',
    author: 'Rasmus Andersson',
    licence: 'SIL Open Font License 1.1',
    url: 'https://rsms.me/inter/',
  },
]
