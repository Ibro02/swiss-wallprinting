// The client's finished projects and their stories, from his brief of 2026-10-22
// (swiss-wallprinting/Specs/Client brief.md), in his order. The Bosnian texts are his own
// (lightly edited); IT, DE, and EN are agent drafts for review. The client names three
// businesses (Milly Torte, Barber House, Caviezel): confirm that they agree to be named.
// Photos: the client's own (2026-10-23, `vp run images`); the first is the card's cover, a
// 4:3 crop (`projects/*-cover`), so a phone decodes only what the card shows. A
// project without photos stays MOCK: the page shows "photo coming soon" in its place, and the
// production build stops. "sea-view" has none yet: the photos in its folder show other walls
// or are not the client's (see the prompt log of 2026-10-23).

import type { Project } from './schema.ts'

export const projects: readonly Project[] = [
  {
    id: 'monteceneri',
    mock: false,
    photos: [
      'projects/monteceneri-cover',
      'projects/monteceneri-wall',
      'projects/monteceneri-detail',
    ],
    place: { it: 'Monteceneri', de: 'Monteceneri', en: 'Monteceneri', bs: 'Monteceneri' },
    title: {
      it: 'Un pezzo della nostra storia, conservato sul muro',
      de: 'Ein Stück unserer Geschichte, bewahrt auf der Wand',
      en: 'A piece of our history, preserved on the wall',
      bs: 'Dio naše historije, sačuvan na zidu',
    },
    summary: {
      it: 'Per un progetto a Monteceneri abbiamo stampato una fotografia storica in bianco e nero direttamente sulla parete, riportando in vita una parte del passato di questa regione.',
      de: 'Für ein Projekt in Monteceneri haben wir eine historische Schwarz-Weiss-Fotografie direkt auf die Wand gedruckt und ein Stück Vergangenheit dieser Gegend wieder zum Leben erweckt.',
      en: "For a project in Monteceneri we printed a historical black-and-white photograph straight onto the wall, bringing part of the area's past back to life.",
      bs: 'Za projekat u Monteceneriju prenijeli smo historijsku crno-bijelu fotografiju direktno na zid, vraćajući u život dio prošlosti ovog kraja.',
    },
    story: [
      {
        it: 'Ci sono luoghi che custodiscono i ricordi di generazioni.',
        de: 'Es gibt Orte, die die Erinnerungen von Generationen bewahren.',
        en: 'Some places hold the memories of generations.',
        bs: 'Postoje mjesta koja u sebi čuvaju uspomene generacija.',
      },
      {
        it: 'Vecchie strade, edifici in pietra e scene della vita di un tempo sono diventati un ricordo visivo duraturo.',
        de: 'Alte Strassen, Steinhäuser und Szenen aus dem früheren Leben sind zu einer bleibenden Bilderinnerung geworden.',
        en: 'Old streets, stone buildings and scenes of life as it once was have become a lasting visual memory.',
        bs: 'Stare ulice, kamene građevine i prizori nekadašnjeg života postali su trajna vizuelna uspomena.',
      },
      {
        it: 'Per noi questo progetto ha anche un significato speciale: è legato al luogo in cui è cresciuto il fondatore di Swiss Wall Printing.',
        de: 'Für uns hat dieses Projekt auch eine besondere Bedeutung: Es ist mit dem Ort verbunden, an dem der Gründer von Swiss Wall Printing aufgewachsen ist.',
        en: 'This project also means a lot to us: it is linked to the place where the founder of Swiss Wall Printing grew up.',
        bs: 'Ovaj projekat za nas ima i posebno emocionalno značenje, jer je povezan s mjestom u kojem je osnivač Swiss Wall Printinga odrastao.',
      },
    ],
    tagline: {
      it: 'Monteceneri: quando il passato torna a vivere.',
      de: 'Monteceneri: wenn die Vergangenheit wieder lebendig wird.',
      en: 'Monteceneri: when the past comes back to life.',
      bs: 'Monteceneri: kada prošlost ponovo oživi.',
    },
  },
  {
    id: 'holiday-cottage',
    mock: false,
    photos: ['projects/holiday-cottage-cover', 'projects/holiday-cottage'],
    place: { it: 'Casa di vacanza', de: 'Ferienhaus', en: 'Holiday cottage', bs: 'Vikendica' },
    title: {
      it: 'Quando la parete si riempie di magia invernale',
      de: 'Wenn die Wand zum Winterzauber wird',
      en: 'When a wall comes alive with winter magic',
      bs: 'Kada zid oživi zimsku čaroliju',
    },
    summary: {
      it: 'Abbiamo trasformato una semplice parete bianca in un paesaggio invernale incantato.',
      de: 'Wir haben eine schlichte weisse Wand in eine verzauberte Winterlandschaft verwandelt.',
      en: 'We turned a plain white wall into an enchanted winter landscape.',
      bs: 'Za ovaj projekat pretvorili smo običan bijeli zid u čaroban zimski pejzaž.',
    },
    story: [
      {
        it: 'A volte basta uno sguardo per portarci in un mondo di fantasia.',
        de: 'Manchmal genügt ein Blick, um uns in eine Welt der Fantasie zu entführen.',
        en: 'Sometimes one look is enough to carry us into a world of imagination.',
        bs: 'Ponekad je dovoljan jedan pogled da nas odvede u svijet mašte.',
      },
      {
        it: "Una casetta di legno illuminata da una luce calda, un bosco coperto di neve e una cascata che scende da un'isola di natura sospesa creano un senso speciale di profondità e tridimensionalità.",
        de: 'Ein Holzhäuschen in warmem Licht, ein verschneiter Wald und ein Wasserfall, der über ein schwebendes Stück Natur fliesst, schaffen ein besonderes Gefühl von Tiefe und Dreidimensionalität.',
        en: 'A wooden cabin in warm light, a snow-covered forest and a waterfall spilling over a floating piece of nature create a special sense of depth and three dimensions.',
        bs: 'Drvena kućica obasjana toplom svjetlošću, snijegom prekrivena šuma i vodopad koji se prelijeva preko lebdećeg komada prirode stvaraju poseban osjećaj dubine i trodimenzionalnosti.',
      },
    ],
  },
  {
    id: 'milly-torte',
    mock: false,
    photos: ['projects/milly-torte-cover', 'projects/milly-torte'],
    place: { it: 'Milly Torte', de: 'Milly Torte', en: 'Milly Torte', bs: 'Milly Torte' },
    title: {
      it: 'Una parete che racconta una storia dolce',
      de: 'Eine Wand, die eine süsse Geschichte erzählt',
      en: 'A wall that tells a sweet story',
      bs: 'Zid koji priča slatku priču',
    },
    summary: {
      it: 'Con la stampa diretta abbiamo trasformato la parete di una pasticceria in un dettaglio elegante: torte, rose e il logo, in tenui toni di rosa.',
      de: 'Mit dem Wanddirektdruck haben wir die Wand einer Konditorei in ein elegantes Detail verwandelt: Torten, Rosen und das Logo in zarten Rosatönen.',
      en: "With direct wall printing we turned a pastry shop's wall into an elegant feature: cakes, roses and the logo in soft shades of pink.",
      bs: 'Direktnom zidnom štampom pretvorili smo običan zid slastičarnice u elegantan detalj s tortama, ružama i logotipom, u nježnim ružičastim tonovima.',
    },
    story: [
      {
        it: "Così lo spazio rispecchia l'identità della pasticceria e accoglie i clienti con calore.",
        de: 'So spiegelt der Raum die Identität der Konditorei wider und heisst die Kundschaft herzlich willkommen.',
        en: "The space now reflects the shop's identity and gives customers a warm welcome.",
        bs: 'Tako prostor odražava identitet slastičarnice i stvara toplu dobrodošlicu za klijente.',
      },
    ],
  },
  {
    id: 'pool',
    mock: false,
    photos: [
      'projects/pool-cover',
      'projects/pool-finished',
      'projects/pool-printing',
      'projects/pool-before',
    ],
    place: { it: 'Accanto alla piscina', de: 'Am Pool', en: 'By the pool', bs: 'Pored bazena' },
    title: {
      it: 'Da un muro di cemento grigio a un paesaggio tranquillo',
      de: 'Von der grauen Betonwand zur ruhigen Landschaft',
      en: 'From a grey concrete wall to a peaceful landscape',
      bs: 'Od sivog betonskog zida do mirnog pejzaža',
    },
    summary: {
      it: 'Una stampa diretta accanto alla piscina, che porta colore, profondità e un senso di calma.',
      de: 'Ein Wanddirektdruck am Pool, der Farbe, Tiefe und Ruhe bringt.',
      en: 'A direct wall print by the pool that brings colour, depth and a sense of calm.',
      bs: 'Direktna zidna štampa pored bazena, koja unosi boju, dubinu i osjećaj mira.',
    },
    story: [],
  },
  {
    id: 'barber-house',
    mock: false,
    photos: ['projects/barber-house-cover', 'projects/barber-house'],
    place: {
      it: 'Barber House, Bellinzona',
      de: 'Barber House, Bellinzona',
      en: 'Barber House, Bellinzona',
      bs: 'Barber House, Bellinzona',
    },
    title: {
      it: 'Una parete che racconta la storia di un mestiere',
      de: 'Eine Wand, die die Geschichte eines Handwerks erzählt',
      en: 'A wall that tells the story of a craft',
      bs: 'Zid koji priča priču jednog zanata',
    },
    summary: {
      it: 'Ogni salone ha il suo stile, ma quelli speciali hanno anche una storia.',
      de: 'Jeder Salon hat seinen Stil, die besonderen haben auch eine Geschichte.',
      en: 'Every salon has its style, but the special ones also have a story.',
      bs: 'Svaki salon ima svoj stil, ali oni posebni imaju i svoju priču.',
    },
    story: [
      {
        it: "Per Barber House a Bellinzona abbiamo trasformato una semplice parete bianca in un dettaglio d'impatto che unisce tradizione, eleganza e l'identità del salone.",
        de: 'Für Barber House in Bellinzona haben wir eine schlichte weisse Wand in ein markantes Detail verwandelt, das Tradition, Eleganz und die Identität des Salons verbindet.',
        en: "For Barber House in Bellinzona we turned a plain white wall into a striking feature that brings together tradition, elegance and the salon's identity.",
        bs: 'Za Barber House u Bellinzoni pretvorili smo jednostavan bijeli zid u upečatljiv vizuelni detalj koji spaja tradiciju, eleganciju i identitet salona.',
      },
      {
        it: "Il motivo di una barberia d'altri tempi, raccontato attraverso il giornale «Il Giornale del Barbiere», crea un'atmosfera in cui il passato incontra lo stile di oggi.",
        de: 'Das Motiv eines Barbiersalons von früher, erzählt durch die Zeitung «Il Giornale del Barbiere», schafft eine Atmosphäre, in der die Vergangenheit auf modernen Stil trifft.',
        en: 'The motif of an old-time barbershop, told through the newspaper “Il Giornale del Barbiere”, creates an atmosphere where the past meets modern style.',
        bs: 'Motiv starinske berbernice, predstavljen kroz novine „Il Giornale del Barbiere“, stvara atmosferu u kojoj se prošlost susreće sa savremenim stilom.',
      },
      {
        it: "Grazie alla stampa diretta su parete, lo spazio ha acquisito un carattere completamente nuovo. Perché un buon design non cambia solo l'aspetto di un luogo: crea un'atmosfera che resta nella memoria.",
        de: 'Dank des Wanddirektdrucks hat der Raum einen ganz neuen Charakter bekommen. Denn gutes Design verändert nicht nur das Aussehen eines Raums: Es schafft eine Atmosphäre, die in Erinnerung bleibt.',
        en: "Thanks to direct wall printing, the space has gained a completely new character. Because good design doesn't just change how a place looks: it creates an atmosphere people remember.",
        bs: 'Zahvaljujući direktnoj zidnoj štampi, prostor je dobio potpuno novi karakter. Jer dobar dizajn ne mijenja samo izgled prostora. On stvara atmosferu koja se pamti.',
      },
    ],
    tagline: {
      it: 'Barber House: dove la tradizione incontra lo stile.',
      de: 'Barber House: wo Tradition auf Stil trifft.',
      en: 'Barber House: where tradition meets style.',
      bs: 'Barber House: gdje tradicija susreće stil.',
    },
  },
  {
    id: 'caviezel',
    mock: false,
    photos: [
      'projects/caviezel-cover',
      'projects/caviezel-history',
      'projects/caviezel-headquarters',
    ],
    place: { it: 'Caviezel', de: 'Caviezel', en: 'Caviezel', bs: 'Caviezel' },
    title: {
      it: 'Due sedi, una storia',
      de: 'Zwei Standorte, eine Geschichte',
      en: 'Two locations, one story',
      bs: 'Dvije lokacije, jedna priča',
    },
    summary: {
      it: "Dai primi passi al successo di oggi: per l'azienda Caviezel abbiamo realizzato due stampe murali negli uffici di due sedi diverse.",
      de: 'Von den ersten Schritten bis zum heutigen Erfolg: Für die Firma Caviezel haben wir zwei Wanddrucke in den Büros zweier Standorte realisiert.',
      en: "From the first steps to today's success: for the Caviezel company we created two wall prints in the offices of two different locations.",
      bs: 'Od prvih koraka do današnjeg uspjeha: za firmu Caviezel realizovali smo dva projekta zidne štampe u njihovim kancelarijama na dvije različite lokacije.',
    },
    story: [
      {
        it: 'Ogni azienda di successo ha la sua storia. Dietro ci sono anni di lavoro, persone, sfide e ricordi che meritano un posto speciale.',
        de: 'Jedes erfolgreiche Unternehmen hat seine Geschichte. Dahinter stehen Jahre engagierter Arbeit, Menschen, Herausforderungen und Erinnerungen, die einen besonderen Platz verdienen.',
        en: 'Every successful company has its history. Behind it are years of dedicated work, people, challenges and memories that deserve a special place.',
        bs: 'Svaka uspješna firma ima svoju historiju. Iza nje stoje godine predanog rada, ljudi, izazovi i uspomene koje zaslužuju posebno mjesto.',
      },
      {
        it: "Nella prima sede, una composizione di sei fotografie storiche fa rivivere gli inizi dell'azienda: vecchi veicoli, attrezzature e le persone che con il loro lavoro ne hanno costruito le basi raccontano oggi la loro storia direttamente dalle pareti.",
        de: 'Am ersten Standort lässt eine Komposition aus sechs historischen Fotografien die Anfänge der Firma wieder aufleben: Alte Fahrzeuge, Geräte und die Menschen, die mit ihrer Arbeit das Fundament gelegt haben, erzählen ihre Geschichte heute direkt von den Wänden.',
        en: "At the first location, a composition of six historical photographs brings the company's beginnings back to life: old vehicles, equipment and the people whose work laid its foundations now tell their story straight from the walls.",
        bs: 'Na prvoj lokaciji, kroz kompoziciju šest historijskih fotografija, oživjeli smo uspomene na početke firme. Stara vozila, oprema i ljudi koji su svojim radom stvarali temelje kompanije danas pričaju svoju priču direktno sa zidova.',
      },
      {
        it: 'Nella seconda sede, una grande fotografia della sede attuale e del parco veicoli racconta la crescita e il successo raggiunti negli anni.',
        de: 'Am zweiten Standort zeigt eine grosse Fotografie des heutigen Hauptsitzes und der Fahrzeugflotte die Entwicklung und den Erfolg der Firma über die Jahre.',
        en: "At the second location, a large photograph of today's headquarters and vehicle fleet shows how the company has grown and succeeded over the years.",
        bs: 'Na drugoj lokaciji, velikom fotografijom današnjeg sjedišta i voznog parka, predstavili smo razvoj i uspjeh koji je firma ostvarila tokom godina.',
      },
      {
        it: "Grazie alla tecnologia moderna, semplici pareti d'ufficio sono diventate un racconto visivo che unisce passato e presente. Perché il successo di un'azienda non si misura solo da ciò che è oggi, ma anche dal cammino che ha percorso per arrivarci.",
        de: 'Dank moderner Technik sind gewöhnliche Bürowände zu einer Bildergeschichte geworden, die Vergangenheit und Gegenwart verbindet. Denn der Erfolg eines Unternehmens misst sich nicht nur an dem, was es heute ist, sondern auch an dem Weg, den es dafür gegangen ist.',
        en: "Thanks to modern technology, ordinary office walls have become a visual story that links past and present. Because a company's success is measured not only by what it is today, but also by the road it took to get there.",
        bs: 'Zahvaljujući savremenoj tehnologiji, obični kancelarijski zidovi pretvoreni su u vizuelnu priču koja povezuje prošlost i sadašnjost. Jer uspjeh jedne firme ne mjeri se samo onim što je danas, već i putem koji je prošla da bi tu stigla.',
      },
    ],
    tagline: {
      it: 'Caviezel: storia, tradizione e futuro sulle pareti.',
      de: 'Caviezel: Geschichte, Tradition und Zukunft an den Wänden.',
      en: 'Caviezel: history, tradition and the future on the walls.',
      bs: 'Caviezel: historija, tradicija i budućnost na zidovima.',
    },
  },
  {
    id: 'sea-view',
    mock: true,
    photos: [],
    place: {
      it: 'Cliente privato, soggiorno',
      de: 'Privatkunde, Wohnzimmer',
      en: 'Private client, living room',
      bs: 'Privatni klijent, dnevni boravak',
    },
    title: {
      it: 'Quando la parete diventa una vista sul mare',
      de: 'Wenn die Wand zum Meerblick wird',
      en: 'When a wall becomes a sea view',
      bs: 'Kad zid postane pogled na more',
    },
    summary: {
      it: 'Per un cliente privato abbiamo trasformato la parete di un soggiorno in uno splendido paesaggio tropicale: palme, mare e i colori caldi del tramonto.',
      de: 'Für einen Privatkunden haben wir eine Wohnzimmerwand in eine wunderschöne Tropenlandschaft verwandelt: Palmen, Meer und die warmen Farben des Sonnenuntergangs.',
      en: 'For a private client we turned a living-room wall into a beautiful tropical landscape: palm trees, the sea and the warm colours of sunset.',
      bs: 'Za privatnog klijenta pretvorili smo običan zid dnevnog boravka u prekrasan tropski pejzaž: palme, more i tople boje zalaska sunca.',
    },
    story: [
      {
        it: 'A volte basta una parete per portarci con la mente lontano dalla vita di tutti i giorni.',
        de: 'Manchmal genügt eine Wand, um uns in Gedanken weit weg vom Alltag zu bringen.',
        en: 'Sometimes one wall is enough to take our thoughts far from everyday life.',
        bs: 'Ponekad je dovoljan jedan zid da nas mislima odvede daleko od svakodnevice.',
      },
      {
        it: "Insieme a mobili eleganti e dettagli decorativi, la stampa è diventata l'elemento centrale dello spazio e porta pace, calore e relax.",
        de: 'Zusammen mit eleganten Möbeln und dekorativen Details ist der Wanddruck zum Mittelpunkt des Raums geworden und bringt Ruhe, Wärme und Entspannung.',
        en: 'Together with elegant furniture and decorative details, the print has become the centrepiece of the room, bringing calm, warmth and relaxation.',
        bs: 'Palme, more i tople boje unijeli su osjećaj mira, topline i opuštenosti. U kombinaciji s elegantnim namještajem i dekorativnim detaljima, zidna štampa postala je centralni element prostora.',
      },
      {
        it: 'Perché la casa non è solo il luogo in cui viviamo, ma lo spazio in cui nascono emozioni e ricordi.',
        de: 'Denn ein Zuhause ist nicht nur der Ort, an dem wir leben, sondern der Raum, in dem Gefühle und Erinnerungen entstehen.',
        en: 'Because a home is not just where we live, but the space where we create feelings and memories.',
        bs: 'Jer dom nije samo mjesto u kojem živimo, nego prostor u kojem stvaramo osjećaje i uspomene.',
      },
    ],
  },
]
