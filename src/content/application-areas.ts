// Kinds of places from the old site ("aziende, hotel, ristoranti, scuole, uffici e
// abitazioni private", interior and exterior). Real categories; the one-line texts are
// agent drafts for the client to review. DE, EN, BS are drafts too.

import type { ApplicationArea } from './schema.ts'

export const applicationAreas: readonly ApplicationArea[] = [
  {
    id: 'office',
    mock: false,
    icon: 'office',
    environment: 'interior',
    title: {
      it: 'Aziende e uffici',
      de: 'Firmen und Büros',
      en: 'Companies and offices',
      bs: 'Firme i kancelarije',
    },
    line: {
      it: "Il logo e i colori dell'azienda sulla parete, per clienti e collaboratori.",
      de: 'Logo und Firmenfarben direkt auf der Wand, für Kundschaft und Team.',
      en: 'Your logo and brand colours on the wall, for clients and staff.',
      bs: 'Logo i boje firme na zidu, za klijente i saradnike.',
    },
  },
  {
    id: 'hotel',
    mock: false,
    icon: 'hotel',
    environment: 'interior',
    title: { it: 'Hotel', de: 'Hotels', en: 'Hotels', bs: 'Hoteli' },
    line: {
      it: "Camere, hall e corridoi con un'atmosfera che gli ospiti ricordano.",
      de: 'Zimmer, Lobbys und Gänge mit einer Atmosphäre, an die sich Gäste erinnern.',
      en: 'Rooms, lobbies and corridors with an atmosphere guests remember.',
      bs: 'Sobe, predvorja i hodnici s atmosferom koju gosti pamte.',
    },
  },
  {
    id: 'restaurant',
    mock: false,
    icon: 'restaurant',
    environment: 'interior',
    title: { it: 'Ristoranti', de: 'Restaurants', en: 'Restaurants', bs: 'Restorani' },
    line: {
      it: 'Una parete che racconta la tua cucina e il tuo locale.',
      de: 'Eine Wand, die von Ihrer Küche und Ihrem Lokal erzählt.',
      en: 'A wall that tells the story of your food and your place.',
      bs: 'Zid koji priča priču o vašoj kuhinji i vašem lokalu.',
    },
  },
  {
    id: 'school',
    mock: false,
    icon: 'school',
    environment: 'interior',
    title: { it: 'Scuole', de: 'Schulen', en: 'Schools', bs: 'Škole' },
    line: {
      it: 'Aule e corridoi più accoglienti, con immagini che ispirano.',
      de: 'Freundlichere Klassenzimmer und Gänge, mit Bildern, die inspirieren.',
      en: 'Friendlier classrooms and corridors, with images that inspire.',
      bs: 'Ugodnije učionice i hodnici, sa slikama koje inspirišu.',
    },
  },
  {
    id: 'home',
    mock: false,
    icon: 'home',
    environment: 'interior',
    title: { it: 'Case private', de: 'Privathäuser', en: 'Private homes', bs: 'Privatne kuće' },
    line: {
      it: "Una foto, un'opera d'arte o una frase: la tua storia sul tuo muro.",
      de: 'Ein Foto, ein Kunstwerk oder ein Satz: Ihre Geschichte auf Ihrer Wand.',
      en: 'A photo, a work of art or a phrase: your story on your wall.',
      bs: 'Fotografija, umjetničko djelo ili rečenica: vaša priča na vašem zidu.',
    },
  },
  {
    id: 'facade',
    mock: false,
    icon: 'facade',
    environment: 'exterior',
    title: {
      it: 'Facciate ed esterni',
      de: 'Fassaden und Aussenwände',
      en: 'Facades and outdoor walls',
      bs: 'Fasade i vanjski zidovi',
    },
    line: {
      it: 'Stampe sui muri esterni, con colori brillanti per oltre 12 anni.',
      de: 'Drucke auf Aussenwänden, mit leuchtenden Farben für über 12 Jahre.',
      en: 'Prints on outdoor walls, with bright colours for more than 12 years.',
      bs: 'Štampa na vanjskim zidovima, sa živim bojama više od 12 godina.',
    },
  },
]
