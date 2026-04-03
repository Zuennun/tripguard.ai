import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoPageRail from "@/components/SeoPageRail";
import { getAllCities } from "@/lib/cities";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hotel Price Tracker After Booking — SaveMyHoliday",
    description:
      "Track hotel prices after booking and get alerted when rates drop. SaveMyHoliday helps you monitor your hotel daily, compare prices, and rebook cheaper.",
    keywords: [
      "hotel price tracker",
      "hotel price alert after booking",
      "track hotel price after booking",
      "hotel price drop alert",
      "booking.com price tracker",
    ].join(", "),
    alternates: {
      canonical: `${SITE_URL}/hotel-price-tracker`,
    },
    openGraph: {
      title: "Hotel Price Tracker After Booking — SaveMyHoliday",
      description:
        "Track hotel prices after booking and get alerted when a cheaper rate appears.",
      type: "website",
      url: `${SITE_URL}/hotel-price-tracker`,
      images: [`${SITE_URL}/tripguard1.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: "Hotel Price Tracker After Booking — SaveMyHoliday",
      description:
        "Track hotel prices after booking and get alerted when a cheaper rate appears.",
      images: [`${SITE_URL}/tripguard1.png`],
    },
  };
}

export default function HotelPriceTrackerPage() {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;
  const t = getTranslations(locale);
  const isDe = locale === "de";
  const cities = getAllCities().slice(0, 6);
  const posts = getAllPosts().slice(0, 3);

  const faqItems = isDe
    ? [
        {
          q: "Was macht ein Hotel Price Tracker?",
          a: "Ein Hotel Price Tracker beobachtet den Preis deines bereits gebuchten Hotels weiter und meldet dir, wenn ein günstigerer Preis auftaucht.",
        },
        {
          q: "Lohnt sich das nach der Buchung überhaupt noch?",
          a: "Ja, besonders bei flexiblen oder kostenlos stornierbaren Tarifen. Viele Hotels ändern ihre Preise bis kurz vor der Anreise.",
        },
        {
          q: "Brauche ich dafür einen Account?",
          a: "Nein. SaveMyHoliday arbeitet accountless. Du reichst deine Buchung ein und verwaltest sie später über einen sicheren Link.",
        },
      ]
    : [
        {
          q: "What does a hotel price tracker do?",
          a: "A hotel price tracker continues watching the rate of a hotel you already booked and tells you when a cheaper price appears.",
        },
        {
          q: "Is it still worth it after booking?",
          a: "Yes, especially with flexible or free-cancellation bookings. Many hotels change prices right up until arrival.",
        },
        {
          q: "Do I need an account?",
          a: "No. SaveMyHoliday is accountless. You submit your booking and manage it later via a secure link.",
        },
      ];

  const railItems = [
    {
      href: "/hotel-price-alert-after-booking",
      title: isDe ? "Preisalarm nach Buchung" : "Price Alert After Booking",
      text: isDe
        ? "Die passende Seite, wenn du verstehen willst, wie du später günstiger neu buchst."
        : "The right page if you want to understand how to rebook cheaper later.",
      image: "/Alarm.gif",
    },
    {
      href: "/hotels",
      title: isDe ? "Städte & Reiseziele" : "Cities & Destinations",
      text: isDe
        ? "Ausführlichere Seiten mit lokalen Preislogiken, Saison-Effekten und mehr Kontext."
        : "Richer pages with local price logic, seasonality and more context.",
      image: "/Reiseziel.gif",
    },
    {
      href: "/blog",
      title: isDe ? "Guides & Artikel" : "Guides & Articles",
      text: isDe
        ? "Mehr Hintergrund zu Preisstürzen, flexiblen Raten und smarterem Rebooking."
        : "More depth on price drops, flexible rates and smarter rebooking.",
      image: "/Guides.gif",
    },
  ];

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: isDe ? "Hotel Price Tracker" : "Hotel Price Tracker",
      description: isDe
        ? "Überwache Hotelpreise nach der Buchung und werde bei Preissenkungen informiert."
        : "Track hotel prices after booking and get alerted when rates drop.",
      url: `${SITE_URL}/hotel-price-tracker`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Hotel Price Tracker", item: `${SITE_URL}/hotel-price-tracker` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <>
      <Navbar t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <main style={{ background: "#f6f8fc", minHeight: "100vh", paddingTop: 84 }}>
        <section style={{ padding: "4.5rem 2rem 4rem", background: "linear-gradient(140deg, #0f2044 0%, #18366a 60%, #28508f 100%)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "2rem", alignItems: "center" }} className="tracker-hero-grid">
            <div className="tracker-hero-copy">
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1rem" }}>
                {isDe ? "Money Page · Hotel Price Tracker" : "Money page · Hotel price tracker"}
              </div>
              <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(2.1rem, 5vw, 4rem)", lineHeight: 1.05, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 1rem" }}>
                {isDe ? "Tracke deinen Hotelpreis auch nach der Buchung" : "Track your hotel price even after booking"}
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", color: "rgba(255,255,255,0.76)", lineHeight: 1.75, maxWidth: 640, margin: "0 0 1.6rem" }}>
                {isDe
                  ? "SaveMyHoliday ist dein Hotel Price Tracker nach der Buchung: täglich prüfen, Preissenkungen erkennen und nur dann handeln, wenn sich eine günstigere Rate wirklich lohnt."
                  : "SaveMyHoliday is your hotel price tracker after booking: daily checks, real price-drop detection, and a clear signal when rebooking is actually worth it."}
              </p>
              <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
                <a href="/#track-hotels" style={{ background: "#f97316", color: "#fff", textDecoration: "none", padding: "0.95rem 1.5rem", borderRadius: 14, fontWeight: 800, fontFamily: "var(--font-body)" }}>
                  {isDe ? "Jetzt Preis überwachen" : "Start tracking now"}
                </a>
                <Link href="/hotels" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", textDecoration: "none", padding: "0.95rem 1.5rem", borderRadius: 14, border: "1px solid rgba(255,255,255,0.14)", fontWeight: 700, fontFamily: "var(--font-body)" }}>
                  {isDe ? "Städte entdecken" : "Explore cities"}
                </Link>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: "0 18px 60px rgba(0,0,0,0.18)" }}>
                <img
                  src="/hero.gif"
                  alt={isDe ? "Hotelpreis-Tracking für Städtereisen" : "Hotel price tracking for city trips"}
                  style={{ width: "100%", height: 290, objectFit: "contain", display: "block", background: "linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)" }}
                />
                <div style={{ padding: "1.25rem 1.35rem 1.4rem" }}>
                  <div style={{ display: "grid", gap: "0.7rem" }}>
                    {[
                      isDe ? "Deine Buchung wird einmal angelegt und danach automatisch weiter geprüft." : "Your booking is added once and then checked automatically over time.",
                      isDe ? "Wir vergleichen denselben Aufenthalt statt irgendeinen ähnlichen Billig-Deal." : "We compare the same stay instead of some vaguely similar cheap deal.",
                      isDe ? "Ein Alert ist erst dann wichtig, wenn die neue Rate für dich wirklich besser ist." : "An alert only matters when the new rate is actually better for you.",
                    ].map((line, index) => (
                      <div key={line} style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                        <span style={{ width: 28, height: 28, borderRadius: 999, background: index === 2 ? "#fff7ed" : "#ecfdf5", color: index === 2 ? "#f97316" : "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                          {index + 1}
                        </span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "#0f2044", fontWeight: 700 }}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "3rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.3rem", marginBottom: "2.8rem" }}>
            <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 18, padding: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                {isDe ? "Warum diese Seite ranken kann" : "Why this page can rank"}
              </div>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.35rem", color: "#0f2044", margin: "0 0 0.7rem" }}>
                {isDe ? "Echte Suchintention statt generischer Reise-Content" : "Real search intent instead of generic travel fluff"}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.96rem", color: "#64748b", lineHeight: 1.75, margin: 0 }}>
                {isDe
                  ? "Menschen suchen nicht nur nach Hotels, sondern nach einer Lösung, wenn ein Hotel nach der Buchung günstiger wird. Genau darauf ist diese Seite gebaut: klares Problem, klarer Nutzen, direkte nächste Schritte."
                  : "People do not just search for hotels; they search for a solution when a hotel gets cheaper after booking. This page is built around that exact job-to-be-done."}
              </p>
            </div>
            <div style={{ background: "linear-gradient(160deg,#fff7ed,#ffffff)", border: "1px solid #fde7d7", borderRadius: 18, padding: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                {isDe ? "Wann es besonders Sinn macht" : "When it matters most"}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.7rem" }}>
                {(isDe
                  ? [
                      "bei flexiblen oder kostenlos stornierbaren Tarifen",
                      "wenn du früh gebucht hast",
                      "bei Städten mit Event- und Wochenenddynamik",
                    ]
                  : [
                      "for flexible or free-cancellation bookings",
                      "when you booked early",
                      "for cities with event and weekend demand spikes",
                    ]).map((item) => (
                  <li key={item} style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "#7c2d12", lineHeight: 1.65, paddingLeft: "1.4rem", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "#f97316", fontWeight: 900 }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: "2.8rem" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>
              {isDe ? "Top Städte" : "Top cities"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "1rem" }}>
              {cities.map((city) => (
                <Link key={city.slug} href={`/hotels/${city.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e8ecf2", borderRadius: 18, overflow: "hidden" }}>
                  <img src={city.image} alt={city.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "1rem 1rem 1.1rem" }}>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.05rem", color: "#0f2044", marginBottom: "0.35rem" }}>{city.name}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "#64748b", lineHeight: 1.6 }}>
                      {isDe ? city.description_de : city.description_en}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "2.8rem" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>
              {isDe ? "Hilfreiche Artikel" : "Helpful articles"}
            </div>
            <div style={{ display: "grid", gap: "0.9rem" }}>
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e8ecf2", borderRadius: 16, padding: "1rem 1.1rem" }}>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, color: "#0f2044", marginBottom: "0.35rem" }}>
                    {isDe ? post.title.de : post.title.en}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#64748b", lineHeight: 1.65 }}>
                    {isDe ? post.description.de : post.description.en}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: "0.9rem" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              FAQ
            </div>
            {faqItems.map((item) => (
              <div key={item.q} style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 16, padding: "1rem 1.1rem" }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, color: "#0f2044", marginBottom: "0.45rem" }}>{item.q}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", color: "#64748b", lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "3rem" }}>
            <SeoPageRail
              eyebrow={isDe ? "Direkt weiter zu den wichtigsten Seiten" : "Go straight to the most important pages"}
              title={isDe ? "Wenn du hier fertig bist, solltest du an die richtigen Stellen weiterkommen" : "Once you are done here, you should continue to the right places"}
              items={railItems}
            />
          </div>
        </section>
      </main>

      <style>{`
        @media (max-width: 920px) {
          .tracker-hero-grid { grid-template-columns: 1fr !important; }
          .tracker-hero-copy { text-align: center; }
        }
      `}</style>

      <Footer t={t} />
    </>
  );
}
