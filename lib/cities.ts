export interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  image: string; // Unsplash photo URL
  secondaryImage?: string;
  description_de: string;
  description_en: string;
  keywords_de: string[];
  keywords_en: string[];
}

export const cities: City[] = [
  {
    slug: "budapest",
    name: "Budapest",
    country: "Ungarn",
    countryCode: "HU",
    image: "https://images.unsplash.com/photo-1549893072-4bc678117f45?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Überwache Hotelpreise in Budapest automatisch und spare bis zu 25 % auf deine nächste Unterkunft in der ungarischen Hauptstadt.",
    description_en:
      "Monitor hotel prices in Budapest automatically and save up to 25% on your next stay in the Hungarian capital.",
    keywords_de: [
      "hotel budapest preis überwachen",
      "hotelpreise budapest vergleichen",
      "günstig hotel budapest buchen",
      "preisalarm hotel budapest",
    ],
    keywords_en: [
      "monitor hotel prices budapest",
      "hotel price alert budapest",
      "cheap hotels budapest booking",
      "budapest hotel price comparison",
    ],
  },
  {
    slug: "paris",
    name: "Paris",
    country: "Frankreich",
    countryCode: "FR",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Mit SaveMyHoliday behältst du die Hotelpreise in Paris im Blick und wirst sofort benachrichtigt, wenn dein Wunschhotel günstiger wird.",
    description_en:
      "With SaveMyHoliday you keep track of hotel prices in Paris and get notified instantly when your chosen hotel drops in price.",
    keywords_de: [
      "hotel paris preis überwachen",
      "hotelpreise paris günstig",
      "preisalarm paris hotel",
      "paris hotel preis senken",
    ],
    keywords_en: [
      "monitor hotel prices paris",
      "paris hotel price drop alert",
      "cheap hotel paris booking",
      "paris hotel price tracker",
    ],
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spanien",
    countryCode: "ES",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Lass Hotelpreise in Barcelona automatisch überwachen und spare bares Geld auf dein nächstes Städtetrip-Hotel.",
    description_en:
      "Have hotel prices in Barcelona monitored automatically and save real money on your next city break accommodation.",
    keywords_de: [
      "hotel barcelona preis überwachen",
      "hotelpreise barcelona vergleich",
      "günstig hotel barcelona buchen",
      "preisalarm hotel barcelona",
    ],
    keywords_en: [
      "hotel price monitor barcelona",
      "barcelona hotel price alert",
      "cheap hotels barcelona",
      "barcelona hotel price drop",
    ],
  },
  {
    slug: "london",
    name: "London",
    country: "Vereinigtes Königreich",
    countryCode: "GB",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Hotelpreise in London schwanken stark — SaveMyHoliday überwacht deinen Preis täglich und informiert dich bei Preissenkungen.",
    description_en:
      "Hotel prices in London fluctuate significantly — SaveMyHoliday monitors your price daily and alerts you to any drops.",
    keywords_de: [
      "hotel london preis überwachen",
      "hotelpreise london günstig",
      "preisalarm hotel london",
      "london hotel preis vergleich",
    ],
    keywords_en: [
      "monitor hotel prices london",
      "london hotel price alert",
      "cheap hotel london booking",
      "london hotel price tracker",
    ],
  },
  {
    slug: "amsterdam",
    name: "Amsterdam",
    country: "Niederlande",
    countryCode: "NL",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=600&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Nie wieder zu viel für dein Amsterdam-Hotel zahlen: SaveMyHoliday überwacht Hotelpreise in Amsterdam kostenlos und automatisch.",
    description_en:
      "Never overpay for your Amsterdam hotel again: SaveMyHoliday monitors hotel prices in Amsterdam for free, automatically.",
    keywords_de: [
      "hotel amsterdam preis überwachen",
      "hotelpreise amsterdam vergleichen",
      "günstig hotel amsterdam buchen",
      "preisalarm amsterdam hotel",
    ],
    keywords_en: [
      "hotel price monitor amsterdam",
      "amsterdam hotel price alert",
      "cheap hotels amsterdam booking",
      "amsterdam hotel price comparison",
    ],
  },
  {
    slug: "rom",
    name: "Rom",
    country: "Italien",
    countryCode: "IT",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "SaveMyHoliday überwacht Hotelpreise in Rom täglich und schickt dir eine E-Mail, sobald dein Traum-Hotel in der Ewigen Stadt günstiger wird.",
    description_en:
      "SaveMyHoliday monitors hotel prices in Rome daily and sends you an email as soon as your dream hotel in the Eternal City gets cheaper.",
    keywords_de: [
      "hotel rom preis überwachen",
      "hotelpreise rom günstig",
      "preisalarm hotel rom",
      "rom hotel preis senken",
    ],
    keywords_en: [
      "hotel price monitor rome",
      "rome hotel price alert",
      "cheap hotels rome booking",
      "rome hotel price drop",
    ],
  },
  {
    slug: "wien",
    name: "Wien",
    country: "Österreich",
    countryCode: "AT",
    image: "https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1663214957746-2da10a9f4b2b?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Hotelpreise in Wien automatisch überwachen lassen und bei jeder Preissenkung sofort per E-Mail benachrichtigt werden.",
    description_en:
      "Have hotel prices in Vienna monitored automatically and receive an instant email notification whenever the price drops.",
    keywords_de: [
      "hotel wien preis überwachen",
      "hotelpreise wien vergleich",
      "günstig hotel wien buchen",
      "preisalarm hotel wien",
    ],
    keywords_en: [
      "hotel price monitor vienna",
      "vienna hotel price alert",
      "cheap hotel vienna booking",
      "vienna hotel price tracker",
    ],
  },
  {
    slug: "prag",
    name: "Prag",
    country: "Tschechien",
    countryCode: "CZ",
    image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Für dein Prag-Urlaub Hotelpreise überwachen und sicherstellen, dass du nie mehr als nötig zahlst.",
    description_en:
      "Monitor hotel prices for your Prague holiday and make sure you never pay more than necessary.",
    keywords_de: [
      "hotel prag preis überwachen",
      "hotelpreise prag günstig",
      "preisalarm prag hotel",
      "prag hotel preis vergleich",
    ],
    keywords_en: [
      "hotel price monitor prague",
      "prague hotel price alert",
      "cheap hotels prague booking",
      "prague hotel price drop",
    ],
  },
  {
    slug: "lissabon",
    name: "Lissabon",
    country: "Portugal",
    countryCode: "PT",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Lissabon-Hotelpreise täglich überwachen lassen — SaveMyHoliday benachrichtigt dich kostenlos, wenn dein Hotel günstiger wird.",
    description_en:
      "Have Lisbon hotel prices monitored daily — SaveMyHoliday notifies you for free when your hotel gets cheaper.",
    keywords_de: [
      "hotel lissabon preis überwachen",
      "hotelpreise lissabon vergleichen",
      "günstig hotel lissabon buchen",
      "preisalarm hotel lissabon",
    ],
    keywords_en: [
      "hotel price monitor lisbon",
      "lisbon hotel price alert",
      "cheap hotels lisbon booking",
      "lisbon hotel price comparison",
    ],
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "Vereinigte Arabische Emirate",
    countryCode: "AE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Dubai-Hotels sind bekannt für starke Preisschwankungen — mit SaveMyHoliday verpasst du keine einzige Preissenkung.",
    description_en:
      "Dubai hotels are known for significant price fluctuations — with SaveMyHoliday you won't miss a single price drop.",
    keywords_de: [
      "hotel dubai preis überwachen",
      "hotelpreise dubai günstig",
      "preisalarm dubai hotel",
      "dubai hotel preis senken",
    ],
    keywords_en: [
      "monitor hotel prices dubai",
      "dubai hotel price alert",
      "cheap hotel dubai booking",
      "dubai hotel price tracker",
    ],
  },
  {
    slug: "new-york",
    name: "New York",
    country: "USA",
    countryCode: "US",
    image: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "New-York-Hotels automatisch auf Preissenkungen überwachen und mit SaveMyHoliday bis zu 25 % bei der nächsten Buchung sparen.",
    description_en:
      "Automatically monitor New York hotels for price drops and save up to 25% on your next booking with SaveMyHoliday.",
    keywords_de: [
      "hotel new york preis überwachen",
      "hotelpreise new york vergleich",
      "günstig hotel new york buchen",
      "preisalarm hotel new york",
    ],
    keywords_en: [
      "hotel price monitor new york",
      "new york hotel price alert",
      "cheap hotels new york booking",
      "new york hotel price drop",
    ],
  },
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesien",
    countryCode: "ID",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Bali-Hotelpreise kostenlos überwachen — SaveMyHoliday schickt dir eine E-Mail, sobald dein Traumresort auf der Insel der Götter günstiger wird.",
    description_en:
      "Monitor Bali hotel prices for free — SaveMyHoliday sends you an email as soon as your dream resort on the Island of the Gods gets cheaper.",
    keywords_de: [
      "hotel bali preis überwachen",
      "hotelpreise bali günstig",
      "preisalarm hotel bali",
      "bali resort preis vergleich",
    ],
    keywords_en: [
      "hotel price monitor bali",
      "bali hotel price alert",
      "cheap hotels bali booking",
      "bali resort price comparison",
    ],
  },
  {
    slug: "mallorca",
    name: "Mallorca",
    country: "Spanien",
    countryCode: "ES",
    image: "https://images.unsplash.com/photo-1566993850067-bb8df9c9807e?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1544559288-84fed207c569?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Mallorca-Hotelpreise täglich überwachen und bei Preissenkungen sofort reagieren — mit SaveMyHoliday komplett kostenlos.",
    description_en:
      "Monitor Mallorca hotel prices daily and react immediately to price drops — completely free with SaveMyHoliday.",
    keywords_de: [
      "hotel mallorca preis überwachen",
      "hotelpreise mallorca vergleichen",
      "günstig hotel mallorca buchen",
      "preisalarm mallorca hotel",
    ],
    keywords_en: [
      "hotel price monitor mallorca",
      "mallorca hotel price alert",
      "cheap hotels mallorca booking",
      "mallorca hotel price drop",
    ],
  },
  {
    slug: "teneriffa",
    name: "Teneriffa",
    country: "Spanien",
    countryCode: "ES",
    image: "https://images.unsplash.com/photo-1671918585231-989d97102c7a?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1661075246752-4fc14f8c2d60?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Teneriffa-Hotelpreise im Blick behalten und nie wieder zu viel für das Urlaubs-Hotel auf der Sonneninsel zahlen.",
    description_en:
      "Keep track of Tenerife hotel prices and never overpay for your holiday hotel on the sunshine island again.",
    keywords_de: [
      "hotel teneriffa preis überwachen",
      "hotelpreise teneriffa günstig",
      "preisalarm hotel teneriffa",
      "teneriffa hotel preis senken",
    ],
    keywords_en: [
      "hotel price monitor tenerife",
      "tenerife hotel price alert",
      "cheap hotels tenerife booking",
      "tenerife hotel price tracker",
    ],
  },
  {
    slug: "zuerich",
    name: "Zürich",
    country: "Schweiz",
    countryCode: "CH",
    image: "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Zürich gehört zu den teuersten Städten Europas — SaveMyHoliday überwacht Hotelpreise in Zürich und hilft dir, das Beste herauszuholen.",
    description_en:
      "Zurich is one of Europe's most expensive cities — SaveMyHoliday monitors hotel prices in Zurich and helps you get the best deal.",
    keywords_de: [
      "hotel zürich preis überwachen",
      "hotelpreise zürich vergleich",
      "günstig hotel zürich buchen",
      "preisalarm hotel zürich",
    ],
    keywords_en: [
      "hotel price monitor zurich",
      "zurich hotel price alert",
      "cheap hotels zurich booking",
      "zurich hotel price comparison",
    ],
  },
  {
    slug: "venedig",
    name: "Venedig",
    country: "Italien",
    countryCode: "IT",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Venedig-Hotels sind oft überraschend günstig buchbar — SaveMyHoliday überwacht die Preise und informiert dich, wenn Sparpotenzial entsteht.",
    description_en:
      "Venice hotels can often be booked at surprisingly good prices — SaveMyHoliday monitors the prices and informs you when savings become available.",
    keywords_de: [
      "hotel venedig preis überwachen",
      "hotelpreise venedig günstig",
      "preisalarm venedig hotel",
      "venedig hotel preis vergleich",
    ],
    keywords_en: [
      "hotel price monitor venice",
      "venice hotel price alert",
      "cheap hotels venice booking",
      "venice hotel price drop",
    ],
  },
  {
    slug: "florenz",
    name: "Florenz",
    country: "Italien",
    countryCode: "IT",
    image: "https://images.unsplash.com/photo-1541343672885-9be56236302a?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Florenz-Hotelpreise automatisch überwachen lassen und per E-Mail informiert werden, sobald dein Wunschhotel in der Toskanastadt günstiger wird.",
    description_en:
      "Have Florence hotel prices monitored automatically and receive an email as soon as your chosen hotel in the Tuscan city drops in price.",
    keywords_de: [
      "hotel florenz preis überwachen",
      "hotelpreise florenz vergleichen",
      "günstig hotel florenz buchen",
      "preisalarm florenz hotel",
    ],
    keywords_en: [
      "hotel price monitor florence",
      "florence hotel price alert",
      "cheap hotels florence booking",
      "florence hotel price comparison",
    ],
  },
  {
    slug: "madrid",
    name: "Madrid",
    country: "Spanien",
    countryCode: "ES",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Hotelpreise in Madrid überwachen und bei jeder Preissenkung sofort eine E-Mail-Benachrichtigung erhalten — kostenlos mit SaveMyHoliday.",
    description_en:
      "Monitor hotel prices in Madrid and receive an instant email notification for every price drop — free with SaveMyHoliday.",
    keywords_de: [
      "hotel madrid preis überwachen",
      "hotelpreise madrid günstig",
      "preisalarm hotel madrid",
      "madrid hotel preis senken",
    ],
    keywords_en: [
      "hotel price monitor madrid",
      "madrid hotel price alert",
      "cheap hotels madrid booking",
      "madrid hotel price tracker",
    ],
  },
  {
    slug: "athen",
    name: "Athen",
    country: "Griechenland",
    countryCode: "GR",
    image: "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Athen-Hotelpreise kostenlos und automatisch überwachen — SaveMyHoliday benachrichtigt dich, wenn du bei deiner Unterkunft sparen kannst.",
    description_en:
      "Monitor Athens hotel prices for free and automatically — SaveMyHoliday notifies you when you can save on your accommodation.",
    keywords_de: [
      "hotel athen preis überwachen",
      "hotelpreise athen vergleich",
      "günstig hotel athen buchen",
      "preisalarm hotel athen",
    ],
    keywords_en: [
      "hotel price monitor athens",
      "athens hotel price alert",
      "cheap hotels athens booking",
      "athens hotel price drop",
    ],
  },
  {
    slug: "istanbul",
    name: "Istanbul",
    country: "Türkei",
    countryCode: "TR",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&h=760&q=80",
    description_de:
      "Istanbul bietet faszinierende Hotels zu sehr variablen Preisen — SaveMyHoliday überwacht deinen Hotelpreis täglich und informiert dich bei Preissenkungen.",
    description_en:
      "Istanbul offers fascinating hotels at highly variable prices — SaveMyHoliday monitors your hotel price daily and informs you of any drops.",
    keywords_de: [
      "hotel istanbul preis überwachen",
      "hotelpreise istanbul günstig",
      "preisalarm istanbul hotel",
      "istanbul hotel preis vergleich",
    ],
    keywords_en: [
      "hotel price monitor istanbul",
      "istanbul hotel price alert",
      "cheap hotels istanbul booking",
      "istanbul hotel price comparison",
    ],
  },
];

function buildSecondaryImage(image: string): string {
  if (!image.includes("images.unsplash.com")) return image;
  return image.replace(
    "auto=format&fit=crop&w=600&q=80",
    "auto=format&fit=crop&crop=entropy&w=1200&h=760&q=80"
  );
}

function withSecondaryImage(city: City): City {
  return {
    ...city,
    secondaryImage: city.secondaryImage ?? buildSecondaryImage(city.image),
  };
}

export function getAllCities(): City[] {
  return cities.map(withSecondaryImage).sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export function getCityBySlug(slug: string): City | undefined {
  const city = cities.find((c) => c.slug === slug);
  return city ? withSecondaryImage(city) : undefined;
}
