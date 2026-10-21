// MOCK room cards for the services page: the photos come from scripts/mockups.ts and the
// wall sizes are examples. Replace with the client's real before/after pairs (Q7).

import type { ServiceRoom } from './schema.ts'

export const services: readonly ServiceRoom[] = [
  {
    id: 'office',
    mock: true,
    area: 'office',
    wall: { widthM: 5.2, heightM: 2.7 },
    before: 'services/office-before',
    after: 'services/office-after',
    preset: 'cmyk',
    alt: {
      before: {
        it: 'Parete vuota di un ufficio, intonaco bianco e pavimento in legno.',
        de: 'Leere Bürowand, weisser Verputz und Holzboden.',
        en: 'Empty office wall, white plaster and a wooden floor.',
        bs: 'Prazan zid kancelarije, bijela žbuka i drveni pod.',
      },
      after: {
        it: 'La stessa parete con grandi cerchi ciano, magenta e giallo stampati sopra.',
        de: 'Dieselbe Wand mit grossen Kreisen in Cyan, Magenta und Gelb darauf gedruckt.',
        en: 'The same wall with large cyan, magenta and yellow circles printed on it.',
        bs: 'Isti zid sa velikim cijan, magenta i žutim krugovima odštampanim na njemu.',
      },
    },
  },
  {
    id: 'hotel',
    mock: true,
    area: 'hotel',
    wall: { widthM: 6.4, heightM: 2.8 },
    before: 'services/hotel-before',
    after: 'services/hotel-after',
    preset: 'lake',
    alt: {
      before: {
        it: 'Parete vuota della hall di un hotel, intonaco chiaro.',
        de: 'Leere Wand in einer Hotellobby, heller Verputz.',
        en: 'Empty wall in a hotel lobby, light plaster.',
        bs: 'Prazan zid u hotelskom predvorju, svijetla žbuka.',
      },
      after: {
        it: 'La stessa parete con un lago tra le montagne nei colori del mattino.',
        de: 'Dieselbe Wand mit einem See zwischen Bergen in Morgenfarben.',
        en: 'The same wall with a lake between mountains in morning colours.',
        bs: 'Isti zid s jezerom između planina u jutarnjim bojama.',
      },
    },
  },
  {
    id: 'restaurant',
    mock: true,
    area: 'restaurant',
    wall: { widthM: 4.6, heightM: 2.6 },
    before: 'services/restaurant-before',
    after: 'services/restaurant-after',
    preset: 'lemons',
    alt: {
      before: {
        it: 'Parete vuota di un ristorante, intonaco color crema.',
        de: 'Leere Restaurantwand, cremefarbener Verputz.',
        en: 'Empty restaurant wall, cream plaster.',
        bs: 'Prazan zid restorana, žbuka boje krem.',
      },
      after: {
        it: 'La stessa parete con limoni e foglie stampati.',
        de: 'Dieselbe Wand mit gedruckten Zitronen und Blättern.',
        en: 'The same wall with printed lemons and leaves.',
        bs: 'Isti zid s odštampanim limunovima i listovima.',
      },
    },
  },
  {
    id: 'school',
    mock: true,
    area: 'school',
    wall: { widthM: 7.0, heightM: 3.0 },
    before: 'services/school-before',
    after: 'services/school-after',
    preset: 'space',
    alt: {
      before: {
        it: "Parete vuota di un'aula, intonaco verde chiaro.",
        de: 'Leere Wand in einem Klassenzimmer, hellgrüner Verputz.',
        en: 'Empty classroom wall, pale green plaster.',
        bs: 'Prazan zid učionice, svijetlozelena žbuka.',
      },
      after: {
        it: 'La stessa parete con pianeti e stelle su un pannello blu scuro.',
        de: 'Dieselbe Wand mit Planeten und Sternen auf dunkelblauem Grund.',
        en: 'The same wall with planets and stars on a dark blue panel.',
        bs: 'Isti zid s planetama i zvijezdama na tamnoplavoj podlozi.',
      },
    },
  },
  {
    id: 'home',
    mock: true,
    area: 'home',
    wall: { widthM: 3.6, heightM: 2.6 },
    before: 'services/home-before',
    after: 'services/home-after',
    preset: 'arches',
    alt: {
      before: {
        it: 'Parete vuota di una camera da letto, intonaco caldo.',
        de: 'Leere Schlafzimmerwand, warmer Verputz.',
        en: 'Empty bedroom wall, warm plaster.',
        bs: 'Prazan zid spavaće sobe, topla žbuka.',
      },
      after: {
        it: 'La stessa parete con archi color terracotta, senape e salvia.',
        de: 'Dieselbe Wand mit Bögen in Terrakotta, Senf und Salbei.',
        en: 'The same wall with arches in terracotta, mustard and sage.',
        bs: 'Isti zid s lukovima u bojama terakote, senfa i žalfije.',
      },
    },
  },
  {
    id: 'facade',
    mock: true,
    area: 'facade',
    wall: { widthM: 9.0, heightM: 3.8 },
    before: 'services/facade-before',
    after: 'services/facade-after',
    preset: 'peaks',
    alt: {
      before: {
        it: 'Facciata vuota di un edificio sotto il cielo azzurro.',
        de: 'Leere Fassade eines Gebäudes unter blauem Himmel.',
        en: 'Empty building facade under a blue sky.',
        bs: 'Prazna fasada zgrade pod plavim nebom.',
      },
      after: {
        it: 'La stessa facciata con montagne geometriche magenta, nere e ciano e un sole giallo.',
        de: 'Dieselbe Fassade mit geometrischen Bergen in Magenta, Schwarz und Cyan und einer gelben Sonne.',
        en: 'The same facade with geometric magenta, black and cyan mountains and a yellow sun.',
        bs: 'Ista fasada s geometrijskim planinama u magenti, crnoj i cijan boji i žutim suncem.',
      },
    },
  },
]
