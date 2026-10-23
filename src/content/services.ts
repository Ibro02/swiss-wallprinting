// The before/after cards of the services page: the client's own walls (his "… Before" and
// "… After" photos, 2026-10-23; `vp run images` cuts the same 4:5 part of both), in his two
// groups of clients. Business first, with his emphasis: a company's identity and history.
// The "before" photos match the "after" photos outside the print, so they are probably
// edited from them: the client should confirm that they show the real wall. Monteceneri
// is in the business group (a non-residential building; confirm). IT is the source; DE,
// EN, and BS are agent drafts for review.

import type { BeforeAfterPair } from './schema.ts'

export const services: readonly BeforeAfterPair[] = [
  {
    id: 'barber-house',
    mock: false,
    audience: 'business',
    project: 'barber-house',
    place: {
      it: 'Barber House, Bellinzona',
      de: 'Barber House, Bellinzona',
      en: 'Barber House, Bellinzona',
      bs: 'Barber House, Bellinzona',
    },
    tag: { it: 'Identità', de: 'Identität', en: 'Identity', bs: 'Identitet' },
    before: 'services/barber-house-before',
    after: 'services/barber-house-after',
    alt: {
      before: {
        it: 'Una parete bianca in un barbiere, con la stampante murale già montata accanto.',
        de: 'Eine weisse Wand in einem Barbershop, daneben der aufgebaute Wanddrucker.',
        en: 'A white wall in a barbershop, with the wall printer set up beside it.',
        bs: 'Bijeli zid u berbernici, pored njega već postavljen zidni printer.',
      },
      after: {
        it: 'La stessa parete con un quadro stampato: nel negozio, un uomo tiene aperto il giornale del barbiere.',
        de: 'Dieselbe Wand mit einem gedruckten Bild: Im Salon hält ein Mann die Zeitung des Barbershops hoch.',
        en: "The same wall with a printed picture: in the shop, a man holds up the barbershop's newspaper.",
        bs: 'Isti zid s odštampanom slikom: u berbernici čovjek drži novine berbernice.',
      },
    },
  },
  {
    id: 'milly-torte',
    mock: false,
    audience: 'business',
    project: 'milly-torte',
    place: { it: 'Milly Torte', de: 'Milly Torte', en: 'Milly Torte', bs: 'Milly Torte' },
    tag: { it: 'Identità', de: 'Identität', en: 'Identity', bs: 'Identitet' },
    before: 'services/milly-torte-before',
    after: 'services/milly-torte-after',
    alt: {
      before: {
        it: 'Una parete bianca nella pasticceria, sopra due sedie rosa e un tavolino.',
        de: 'Eine weisse Wand in der Konditorei, über zwei rosa Stühlen und einem kleinen Tisch.',
        en: 'A white wall in the pastry shop, above two pink chairs and a small table.',
        bs: 'Bijeli zid u slastičarnici, iznad dvije ružičaste stolice i stolića.',
      },
      after: {
        it: 'La stessa parete con una stampa rosa: torte, rose e il logo Milly Torte.',
        de: 'Dieselbe Wand mit einem rosa Druck: Torten, Rosen und das Logo von Milly Torte.',
        en: 'The same wall with a pink print: cakes, roses and the Milly Torte logo.',
        bs: 'Isti zid s ružičastom štampom: torte, ruže i logotip Milly Torte.',
      },
    },
  },
  {
    id: 'monteceneri',
    mock: false,
    audience: 'business',
    project: 'monteceneri',
    place: { it: 'Monteceneri', de: 'Monteceneri', en: 'Monteceneri', bs: 'Monteceneri' },
    tag: { it: 'Storia', de: 'Geschichte', en: 'History', bs: 'Historija' },
    before: 'services/monteceneri-before',
    after: 'services/monteceneri-after',
    alt: {
      before: {
        it: 'Una parete bianca vuota sopra un pavimento di piastrelle grigie.',
        de: 'Eine leere weisse Wand über einem grauen Fliesenboden.',
        en: 'An empty white wall above a grey tiled floor.',
        bs: 'Prazan bijeli zid iznad poda od sivih pločica.',
      },
      after: {
        it: 'La stessa parete con una grande foto storica in bianco e nero: un vicolo di pietra, un arco e una fontana.',
        de: 'Dieselbe Wand mit einem grossen historischen Schwarz-Weiss-Foto: eine Gasse aus Stein, ein Torbogen und ein Brunnen.',
        en: 'The same wall with a large historical black-and-white photo: a stone lane, an archway and a fountain.',
        bs: 'Isti zid s velikom historijskom crno-bijelom fotografijom: kamena uličica, luk i česma.',
      },
    },
  },
  {
    id: 'living-room',
    mock: false,
    audience: 'private',
    place: { it: 'Casa privata', de: 'Privathaus', en: 'Private home', bs: 'Privatna kuća' },
    tag: { it: 'Soggiorno', de: 'Wohnzimmer', en: 'Living room', bs: 'Dnevni boravak' },
    before: 'services/living-room-before',
    after: 'services/living-room-after',
    alt: {
      before: {
        it: 'Una parete chiara in una casa, con la testina della stampante murale sul bordo destro.',
        de: 'Eine helle Wand in einem Wohnhaus, am rechten Rand der Druckkopf des Wanddruckers.',
        en: "A light wall in a home, with the wall printer's print head at the right edge.",
        bs: 'Svijetao zid u kući, s glavom zidnog printera na desnoj ivici.',
      },
      after: {
        it: "La stessa parete con un motivo di automobilismo: un'auto da corsa nera, un pilota con il casco e due foto in pista.",
        de: 'Dieselbe Wand mit einem Motorsport-Motiv: ein schwarzer Rennwagen, ein Fahrer mit Helm und zwei Bilder von der Rennstrecke.',
        en: 'The same wall with a motorsport print: a black racing car, a driver in a helmet and two track photos.',
        bs: 'Isti zid s motivom iz automobilizma: crni trkaći automobil, vozač s kacigom i dvije fotografije sa staze.',
      },
    },
  },
  {
    id: 'pool',
    mock: false,
    audience: 'private',
    project: 'pool',
    place: { it: 'Accanto alla piscina', de: 'Am Pool', en: 'By the pool', bs: 'Pored bazena' },
    tag: { it: 'Esterno', de: 'Aussenbereich', en: 'Outdoors', bs: 'Vanjski prostor' },
    before: 'services/pool-before',
    after: 'services/pool-after',
    alt: {
      before: {
        it: 'Un lungo muro di cemento grigio accanto a un sentiero.',
        de: 'Eine lange graue Betonwand neben einem Weg.',
        en: 'A long grey concrete wall beside a path.',
        bs: 'Dug sivi betonski zid pored staze.',
      },
      after: {
        it: "Lo stesso muro con un paesaggio di lago: una collina verde, cipressi e ville dai tetti rossi riflesse nell'acqua.",
        de: 'Dieselbe Wand mit einer Seelandschaft: ein grüner Hügel, Zypressen und Villen mit roten Dächern, die sich im Wasser spiegeln.',
        en: 'The same wall with a lake landscape: a green hill, cypresses and red-roofed villas reflected in the water.',
        bs: 'Isti zid s pejzažom jezera: zeleno brdo, čempresi i vile s crvenim krovovima koje se ogledaju u vodi.',
      },
    },
  },
]
