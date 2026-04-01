export interface BlogPost {
  slug: string;
  date: string;
  readTime: number; // minutes
  category: string;
  image?: string;   // e.g. "/blog/hotel-preis.jpg" — add to /public/blog/
  title: { de: string; en: string };
  description: { de: string; en: string };
  keywords: string[];
  content: { de: string; en: string };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "hotelpreis-gesunken-geld-zurueck",
    date: "2026-03-28",
    readTime: 5,
    category: "Ratgeber",
    keywords: [
      "hotelpreis gesunken nach buchung",
      "hotel geld zurück preissenkung",
      "hotel stornieren günstiger",
      "hotelpreis überwachen",
      "preisalarm hotel",
    ],
    title: {
      de: "Hotelpreis nach der Buchung gesunken? So bekommst du dein Geld zurück",
      en: "Hotel Price Dropped After Booking? Here's How to Get Your Money Back",
    },
    description: {
      de: "Wenn der Hotelpreis nach deiner Buchung fällt, hast du oft Anspruch auf eine Rückerstattung. Wir zeigen dir Schritt für Schritt wie das geht — und wie ein Preisalarm dir dabei hilft.",
      en: "When hotel prices drop after booking, you may be entitled to a refund. We show you step by step how to claim it — and how a price alert helps.",
    },
    content: {
      de: `
<p>Du hast dein Hotel gebucht, freust dich auf den Urlaub — und plötzlich siehst du, dass das gleiche Zimmer jetzt <strong>200 Euro günstiger</strong> angeboten wird. Das passiert häufiger als du denkst. Hotels passen ihre Preise täglich an, manchmal sogar stündlich.</p>

<p>Die gute Nachricht: In vielen Fällen kannst du den Preisunterschied zurückfordern oder deine Buchung zu einem besseren Preis umbuchen.</p>

<h2>Wann hast du Anspruch auf Rückerstattung?</h2>

<p>Das hängt davon ab, welchen Tarif du gebucht hast:</p>

<ul>
  <li><strong>Flexibler Tarif (kostenlose Stornierung):</strong> Du kannst jederzeit stornieren, neu buchen und sparst die Differenz. Das ist die einfachste Methode.</li>
  <li><strong>Nicht erstattungsfähiger Tarif:</strong> Hier ist es schwieriger — aber nicht unmöglich. Viele Hotels erstatten auf direkte Anfrage die Differenz, besonders wenn du Stammkunde bist oder Treueprogramm-Mitglied.</li>
  <li><strong>Buchung über OTA (Booking.com, Expedia):</strong> Die Plattformen haben oft eigene "Bestpreis-Garantien". Booking.com garantiert den niedrigsten Preis — fällt der Preis auf ihrer eigenen Seite, kannst du die Differenz einfordern.</li>
</ul>

<h2>Schritt-für-Schritt: So forderst du die Differenz zurück</h2>

<ol>
  <li><strong>Preis dokumentieren:</strong> Screenshot des aktuellen Preises mit Datum und Uhrzeit machen.</li>
  <li><strong>Direkt das Hotel kontaktieren:</strong> Rufe die Rezeption an oder schreibe eine E-Mail. Erkläre freundlich, dass du den gleichen Zimmertyp zu einem niedrigeren Preis gesehen hast und fragst, ob eine Preisanpassung möglich ist.</li>
  <li><strong>Über die Buchungsplattform anfragen:</strong> Bei Booking.com, Expedia & Co. gibt es einen Kundenservice-Chat. Beschreibe das Problem, hänge den Screenshot an.</li>
  <li><strong>Kreditkartenrückbuchung als letztes Mittel:</strong> Wenn nichts hilft und du einen flexiblen Tarif hast: stornieren, neu buchen, Differenz einstreichen.</li>
</ol>

<h2>Wie viel kann ich sparen?</h2>

<p>Studien zeigen, dass Hotelpreise nach der Buchung im Durchschnitt um <strong>15–25%</strong> schwanken. Bei einem Hotel für 1.000 Euro sind das bis zu 250 Euro, die du einfach liegenlässt — wenn du keine Preisüberwachung hast.</p>

<h2>Automatisch sparen mit SaveMyHoliday</h2>

<p>Manuell jeden Tag den Preis zu checken ist nervig und zeitraubend. SaveMyHoliday überwacht deinen Hotelpreis <strong>automatisch täglich</strong> und benachrichtigt dich per E-Mail, sobald der Preis fällt. Du musst dann nur noch handeln.</p>

<p>Der Service ist <strong>komplett kostenlos</strong> und du brauchst keinen Account zu erstellen — einfach Buchungsdaten eingeben, fertig.</p>
      `,
      en: `
<p>You booked your hotel, you're looking forward to your holiday — and suddenly you see the same room is now <strong>€200 cheaper</strong>. This happens more often than you think. Hotels adjust their prices daily, sometimes even hourly.</p>

<p>The good news: in many cases you can claim the price difference back or rebook at a better rate.</p>

<h2>When are you entitled to a refund?</h2>

<p>This depends on the rate type you booked:</p>

<ul>
  <li><strong>Flexible rate (free cancellation):</strong> You can cancel anytime, rebook and pocket the difference. This is the simplest method.</li>
  <li><strong>Non-refundable rate:</strong> Harder — but not impossible. Many hotels refund the difference on direct request, especially for loyalty members.</li>
  <li><strong>OTA booking (Booking.com, Expedia):</strong> Platforms often have "best price guarantees". If the price drops on their own site, you can claim the difference.</li>
</ul>

<h2>Step-by-step: How to claim the difference</h2>

<ol>
  <li><strong>Document the price:</strong> Take a screenshot of the current price with date and time.</li>
  <li><strong>Contact the hotel directly:</strong> Call reception or send an email. Politely explain you've seen the same room type at a lower price and ask if a price adjustment is possible.</li>
  <li><strong>Request via the booking platform:</strong> Booking.com, Expedia etc. all have customer service chats. Describe the situation and attach your screenshot.</li>
  <li><strong>Credit card chargeback as last resort:</strong> If nothing works and you have a flexible rate: cancel, rebook, keep the difference.</li>
</ol>

<h2>How much can I save?</h2>

<p>Studies show hotel prices fluctuate by an average of <strong>15–25%</strong> after booking. On a €1,000 hotel stay that's up to €250 you're leaving on the table — without price monitoring.</p>

<h2>Save automatically with SaveMyHoliday</h2>

<p>Manually checking the price every day is tedious. SaveMyHoliday monitors your hotel price <strong>automatically every day</strong> and notifies you by email as soon as the price drops. You just need to act.</p>

<p>The service is <strong>completely free</strong> and you don't need to create an account — just enter your booking details and you're done.</p>
      `,
    },
  },
  {
    slug: "hotel-guenstiger-buchen-tipps",
    date: "2026-04-01",
    readTime: 7,
    category: "Spartipps",
    keywords: [
      "hotel günstiger buchen tipps",
      "hotel preis senken",
      "günstig hotel buchen tricks",
      "hotel sparen urlaub",
      "beste zeit hotel buchen",
    ],
    title: {
      de: "7 Tricks wie Reiseprofis ihr Hotel immer günstiger buchen",
      en: "7 Tricks Travel Pros Use to Always Book Hotels Cheaper",
    },
    description: {
      de: "Mit diesen 7 Methoden zahlst du deutlich weniger für dein Hotel — ohne auf Komfort zu verzichten. Von Preisalarm bis Direktbuchung: die besten Spartipps für Reisende.",
      en: "With these 7 methods you'll pay significantly less for your hotel — without sacrificing comfort. From price alerts to direct booking: the best savings tips for travellers.",
    },
    content: {
      de: `
<p>Wer klug reist, zahlt weniger — ohne auf Qualität zu verzichten. Diese 7 Methoden nutzen erfahrene Reisende, um bei Hotelbuchungen systematisch zu sparen.</p>

<h2>1. Preise vergleichen, bevor du buchst</h2>

<p>Das klingt offensichtlich, aber viele Reisende checken nur eine Plattform. Vergleiche mindestens <strong>Booking.com, die Hotelwebseite direkt und einen Aggregator</strong>. Oft ist das Hotel auf seiner eigenen Webseite günstiger, weil keine Provision anfällt.</p>

<h2>2. Flexiblen Tarif wählen — auch wenn er teurer erscheint</h2>

<p>Ein flexibler Tarif kostet manchmal 10–20 Euro mehr. Aber: Wenn der Preis später fällt, kannst du stornieren und günstiger neu buchen. <strong>Im Durchschnitt lohnt sich diese "Versicherung"</strong> — besonders bei langen Buchungsvorlaufzeiten.</p>

<h2>3. Preisüberwachung aktivieren</h2>

<p>Nach der Buchung sinken Hotelpreise häufig weiter — besonders wenn das Hotel noch Zimmer füllen muss. Mit einem Preisalarm wirst du automatisch informiert, wenn der Preis fällt. Tools wie SaveMyHoliday machen das kostenlos und automatisch.</p>

<h2>4. Direkt beim Hotel anfragen</h2>

<p>Ruf das Hotel an und frage nach dem besten verfügbaren Preis. Viele Hotels geben am Telefon <strong>5–10% Rabatt</strong>, weil sie die Provision der Buchungsplattform sparen. Erwähne, dass du auch auf Booking.com und Expedia geschaut hast.</p>

<h2>5. Check-in/Check-out flexibel halten</h2>

<p>Wochenendpreise sind oft 30–50% höher als Wochentagspreise. Wenn dein Reisedatum flexibel ist, prüfe ob eine Verschiebung um 1–2 Tage massiv spart. Kalenderansichten auf Buchungsportalen zeigen diese Schwankungen sehr deutlich.</p>

<h2>6. Frühbucher-Rabatte vs. Last-Minute</h2>

<p>Beide Strategien funktionieren — aber für verschiedene Situationen:</p>
<ul>
  <li><strong>Frühbucher:</strong> Sicherer, bessere Zimmerwahl, oft 15–25% günstiger bei Nicht-Erstattungstarifen</li>
  <li><strong>Last-Minute:</strong> Funktioniert gut in Nebensaison oder bei Städtereisen, riskant in Hochsaison und bei beliebten Zielen</li>
</ul>

<h2>7. Treueprogramme nutzen</h2>

<p>Marriott Bonvoy, Hilton Honors, IHG Rewards — die großen Hotelketten haben kostenlose Treueprogramme. Mitglieder bekommen oft exklusive Preise, die <strong>10–20% unter den öffentlichen Preisen</strong> liegen. Anmelden kostet nichts.</p>

<h2>Bonus: Preise nach der Buchung weiter beobachten</h2>

<p>Auch nach der Buchung lohnt sich die Preisbeobachtung. SaveMyHoliday überwacht deinen Hotelpreis automatisch und sendet dir eine E-Mail, wenn Sparpotenzial entsteht. Komplett kostenlos, kein Account erforderlich.</p>
      `,
      en: `
<p>Smart travellers pay less — without sacrificing quality. Here are 7 methods experienced travellers use to systematically save on hotel bookings.</p>

<h2>1. Compare prices before booking</h2>

<p>This sounds obvious, but many travellers only check one platform. Compare at least <strong>Booking.com, the hotel's own website and an aggregator</strong>. Often the hotel website is cheaper because there's no commission to pay.</p>

<h2>2. Choose flexible rates — even if they seem more expensive</h2>

<p>A flexible rate sometimes costs €10–20 more. But: if the price drops later, you can cancel and rebook cheaper. <strong>On average this "insurance" pays off</strong> — especially with long booking lead times.</p>

<h2>3. Activate price monitoring</h2>

<p>After booking, hotel prices often continue to fall — especially when the hotel needs to fill rooms. With a price alert you'll be automatically notified when the price drops. Tools like SaveMyHoliday do this for free, automatically.</p>

<h2>4. Ask the hotel directly</h2>

<p>Call the hotel and ask for their best available rate. Many hotels give <strong>5–10% discount</strong> over the phone because they save the booking platform commission. Mention you've also looked on Booking.com and Expedia.</p>

<h2>5. Keep check-in/check-out flexible</h2>

<p>Weekend prices are often 30–50% higher than weekday prices. If your travel dates are flexible, check whether shifting by 1–2 days saves significantly. Calendar views on booking portals show these fluctuations clearly.</p>

<h2>6. Early bird vs. last minute</h2>

<p>Both strategies work — but for different situations:</p>
<ul>
  <li><strong>Early bird:</strong> Safer, better room selection, often 15–25% cheaper on non-refundable rates</li>
  <li><strong>Last minute:</strong> Works well in low season or city breaks, risky in high season and popular destinations</li>
</ul>

<h2>7. Use loyalty programmes</h2>

<p>Marriott Bonvoy, Hilton Honors, IHG Rewards — the major chains have free loyalty programmes. Members often get exclusive rates that are <strong>10–20% below public prices</strong>. Signing up is free.</p>

<h2>Bonus: Keep watching prices after booking</h2>

<p>Price monitoring pays off even after booking. SaveMyHoliday watches your hotel price automatically and sends you an email when savings become available. Completely free, no account needed.</p>
      `,
    },
  },
  {
    slug: "flexible-buchung-vs-guenstigster-preis",
    date: "2026-04-04",
    readTime: 6,
    category: "Ratgeber",
    keywords: [
      "flexible hotelbuchung lohnt sich",
      "nicht erstattungsfähig vs kostenlose stornierung hotel",
      "hotel flexibel oder günstig buchen",
      "hotelstornierung kosten",
      "hotel tarif vergleich",
    ],
    title: {
      de: "Flexibel oder günstig buchen? Was sich beim Hotel wirklich lohnt",
      en: "Flexible or Cheap Booking? What Really Pays Off for Hotels",
    },
    description: {
      de: "Nicht erstattungsfähig oder kostenlose Stornierung? Wir rechnen durch wann sich welcher Tarif wirklich lohnt — mit konkreten Beispielen und dem entscheidenden Faktor den die meisten übersehen.",
      en: "Non-refundable or free cancellation? We calculate when each rate type really pays off — with concrete examples and the decisive factor most people overlook.",
    },
    content: {
      de: `
<p>Beim Hotelbuchung wirst du fast immer vor diese Wahl gestellt: der günstigere, nicht erstattungsfähige Tarif — oder der teurere, flexible Tarif mit kostenloser Stornierung. Viele wählen intuitiv das Günstigste. Aber ist das wirklich die klügere Entscheidung?</p>

<h2>Der Unterschied in Zahlen</h2>

<p>Ein Beispiel aus der Praxis: Du buchst ein Hotel in Barcelona für 5 Nächte.</p>

<ul>
  <li><strong>Nicht erstattungsfähiger Tarif:</strong> 680 € (gespart gegenüber flexibel: 70 €)</li>
  <li><strong>Flexibler Tarif:</strong> 750 € (kostenlose Stornierung bis 24h vor Anreise)</li>
</ul>

<p>Auf den ersten Blick: 70 Euro gespart. Aber was ist wenn der Preis nach der Buchung sinkt?</p>

<h2>Der Faktor den die meisten übersehen: Preisschwankungen nach der Buchung</h2>

<p>Hotelpreise sind keine festen Werte — sie ändern sich ständig. <strong>Studien zeigen: Bei 40–60% aller Buchungen sinkt der Preis nach der Buchung mindestens einmal.</strong> Die durchschnittliche Preissenkung beträgt dabei 18%.</p>

<p>Im Beispiel: 18% von 750 € sind 135 Euro mögliche Ersparnis. Der flexible Tarif kostet zwar 70 Euro mehr — aber wenn der Preis fällt, kannst du stornieren und neu buchen. Du sparst dann 135 Euro, zahlst 70 Euro Aufpreis, und machst <strong>netto 65 Euro Gewinn</strong>.</p>

<h2>Wann lohnt sich der günstige Tarif trotzdem?</h2>

<p>Es gibt Situationen, wo der nicht erstattungsfähige Tarif die bessere Wahl ist:</p>

<ul>
  <li><strong>Du buchst sehr kurzfristig</strong> (weniger als 2 Wochen vor Anreise): Der Preis wird kaum noch sinken</li>
  <li><strong>Hochsaison oder Event:</strong> Bei Messezeiten, Feiertagen oder Großveranstaltungen sind keine Preissenkungen zu erwarten</li>
  <li><strong>Der Preisunterschied ist sehr groß</strong> (mehr als 25–30%): Dann lohnt sich das Risiko meist nicht</li>
  <li><strong>Du bist 100% sicher, dass du reist:</strong> Keine Chance auf Stornierung von deiner Seite</li>
</ul>

<h2>Wann lohnt sich der flexible Tarif?</h2>

<ul>
  <li><strong>Buchungsvorlauf mehr als 4 Wochen:</strong> Viel Zeit für Preisschwankungen</li>
  <li><strong>Nebensaison:</strong> Hotels haben Anreiz, restliche Zimmer günstiger zu verkaufen</li>
  <li><strong>Unsichere Reisepläne:</strong> Job, Gesundheit, Familie — Flexibilität hat einen Wert</li>
  <li><strong>Der Aufpreis ist gering</strong> (weniger als 10%): Dann ist die Versicherung günstig</li>
</ul>

<h2>Die clevere Kombination: Flexibel buchen + Preisüberwachung</h2>

<p>Die beste Strategie: Flexiblen Tarif buchen, dann den Preis automatisch überwachen lassen. So hast du alle Vorteile:</p>

<ol>
  <li>Du hast dein Zimmer gesichert</li>
  <li>Du verpasst keine Preissenkung</li>
  <li>Du kannst bei Bedarf stornieren und günstiger neu buchen</li>
</ol>

<p>SaveMyHoliday überwacht deinen Hotelpreis täglich, kostenlos und ohne Account. Du bekommst eine E-Mail sobald der Preis sinkt — und kannst dann entscheiden ob du die Ersparnis nutzt.</p>
      `,
      en: `
<p>When booking a hotel you're almost always faced with this choice: the cheaper, non-refundable rate — or the more expensive, flexible rate with free cancellation. Many choose intuitively the cheapest option. But is that really the smarter decision?</p>

<h2>The difference in numbers</h2>

<p>A real-world example: You book a hotel in Barcelona for 5 nights.</p>

<ul>
  <li><strong>Non-refundable rate:</strong> €680 (saving vs flexible: €70)</li>
  <li><strong>Flexible rate:</strong> €750 (free cancellation until 24h before arrival)</li>
</ul>

<p>At first glance: €70 saved. But what if the price drops after booking?</p>

<h2>The factor most people overlook: price fluctuations after booking</h2>

<p>Hotel prices aren't fixed — they change constantly. <strong>Studies show: in 40–60% of all bookings, the price drops at least once after booking.</strong> The average price reduction is 18%.</p>

<p>In our example: 18% of €750 is €135 in potential savings. The flexible rate costs €70 more — but if the price drops, you can cancel and rebook. You save €135, paid €70 extra, making a <strong>net profit of €65</strong>.</p>

<h2>When does the cheap rate pay off anyway?</h2>

<ul>
  <li><strong>Very short booking lead time</strong> (less than 2 weeks): Price unlikely to drop further</li>
  <li><strong>High season or events:</strong> Trade fairs, holidays, major events mean no price drops expected</li>
  <li><strong>Large price difference</strong> (more than 25–30%): Risk usually not worth it</li>
  <li><strong>You're 100% certain you're travelling:</strong> No chance of cancellation from your side</li>
</ul>

<h2>When does the flexible rate pay off?</h2>

<ul>
  <li><strong>Booking lead time over 4 weeks:</strong> Plenty of time for price fluctuations</li>
  <li><strong>Low season:</strong> Hotels are incentivised to sell remaining rooms cheaper</li>
  <li><strong>Uncertain travel plans:</strong> Work, health, family — flexibility has value</li>
  <li><strong>Small premium</strong> (less than 10%): The "insurance" is cheap</li>
</ul>

<h2>The smart combination: book flexible + price monitoring</h2>

<p>The best strategy: book a flexible rate, then have the price monitored automatically. You get all the benefits:</p>

<ol>
  <li>Your room is secured</li>
  <li>You won't miss any price drop</li>
  <li>You can cancel and rebook cheaper if needed</li>
</ol>

<p>SaveMyHoliday monitors your hotel price daily, free of charge and without an account. You receive an email as soon as the price drops — and can then decide whether to take the saving.</p>
      `,
    },
  },
];

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
