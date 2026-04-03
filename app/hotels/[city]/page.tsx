import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoPageRail from "@/components/SeoPageRail";
import { getCityBySlug, getAllCities } from "@/lib/cities";
import { getCityGuide } from "@/lib/cityGuides";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllCities().map((city) => ({ city: city.slug }));
}

// ─── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = getCityBySlug(params.city);
  if (!city) return {};

  const headersList = headers();
  const locale = (headersList.get("x-locale") || "de") as Locale;
  const isDe = locale === "de";

  const title = isDe
    ? `Hotelpreise ${city.name} überwachen — SaveMyHoliday`
    : `Monitor Hotel Prices in ${city.name} — SaveMyHoliday`;

  const description = isDe ? city.description_de : city.description_en;
  const keywords = isDe
    ? city.keywords_de.join(", ")
    : city.keywords_en.join(", ");

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_URL}/hotels/${city.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [city.image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [city.image],
    },
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CityPage({ params }: { params: { city: string } }) {
  const city = getCityBySlug(params.city);
  if (!city) notFound();

  const headersList = headers();
  const locale = (headersList.get("x-locale") || "de") as Locale;
  const t = getTranslations(locale);
  const isDe = locale === "de";

  const pageTitle = isDe
    ? `Hotelpreise in ${city.name} überwachen — Nie wieder zu viel zahlen`
    : `Monitor Hotel Prices in ${city.name} — Never Overpay Again`;

  const introParagraph = isDe
    ? `${city.name} ist nicht nur ein beliebtes Reiseziel, sondern auch eine Stadt mit echter Preisdynamik. Zwischen Buchung und Anreise können Hotels hier spürbar günstiger werden. Genau deshalb lohnt sich Preisüberwachung in ${city.name}: Du lässt denselben Aufenthalt weiter prüfen und reagierst erst dann, wenn eine wirklich bessere Rate auftaucht.`
    : `${city.name} is not just a popular destination, it is also a city with real pricing volatility. Between booking and check-in, hotels here can become noticeably cheaper. That is exactly why tracking matters in ${city.name}: you keep checking the same stay and only react when a genuinely better rate appears.`;

  const keywords = isDe ? city.keywords_de : city.keywords_en;
  const secondaryImage = city.secondaryImage ?? city.image;
  const relatedCities = getAllCities().filter((entry) => entry.slug !== city.slug).slice(0, 3);
  const relatedPosts = getAllPosts().slice(0, 3);
  const cityGuide = getCityGuide(city.slug);
  const premiumIntro = cityGuide ? (isDe ? cityGuide.premiumIntroDe : cityGuide.premiumIntroEn) : null;
  const premiumMustSee = cityGuide ? (isDe ? cityGuide.mustSeeDe : cityGuide.mustSeeEn) : null;
  const premiumStayAreas = cityGuide ? (isDe ? cityGuide.stayAreasDe : cityGuide.stayAreasEn) : null;
  const premiumTiming = cityGuide ? (isDe ? cityGuide.timingDe : cityGuide.timingEn) : null;
  const highlightList = cityGuide ? (isDe ? cityGuide.highlightsDe : cityGuide.highlightsEn) : [];
  const stayTip = cityGuide ? (isDe ? cityGuide.stayTipDe : cityGuide.stayTipEn) : "";
  const savingTip = cityGuide ? (isDe ? cityGuide.savingTipDe : cityGuide.savingTipEn) : "";
  const travelNote = cityGuide ? (isDe ? cityGuide.travelNoteDe : cityGuide.travelNoteEn) : "";
  const sectionTone =
    city.slug === "paris" || city.slug === "rom"
      ? "editorial"
      : city.slug === "amsterdam" || city.slug === "london"
        ? "structured"
        : "explorer";
  const miniGuideTitle = isDe
    ? sectionTone === "editorial"
      ? `${city.name} als kleiner Reiseführer statt als SEO-Text`
      : sectionTone === "structured"
        ? `Ein praktischer Guide für ${city.name}`
        : `${city.name}: was sich lohnt, wo du gut wohnst und wie du Hotelgeld sparst`
    : sectionTone === "editorial"
      ? `${city.name} as a mini travel guide instead of generic SEO copy`
      : sectionTone === "structured"
        ? `A practical guide for ${city.name}`
        : `${city.name}: what is worth it, where to stay, and how to save on hotels`;
  const twoDayPlan = cityGuide
    ? isDe
      ? `Wenn du nur kurz in ${city.name} bist, plane lieber zwei starke Halbtage statt zu viel auf einmal: erst ${highlightList.slice(0, 2).join(" und ")}, danach bewusst Essen, Spaziergang und Abendatmosphäre statt nur Programmpunkte.`
      : `If you only have a short stay in ${city.name}, aim for two strong half-days instead of cramming in too much: start with ${highlightList.slice(0, 2).join(" and ")}, then leave room for food, walking and evening atmosphere.`
    : "";
  const hotelTimingSummary = premiumTiming
    ? premiumTiming
    : isDe
      ? `In ${city.name} lohnt sich Preisüberwachung besonders rund um Wochenenden, Ferien, Messen oder frühe Buchungen. Genau dann kippen Raten oft später noch einmal.`
      : `In ${city.name}, price tracking matters most around weekends, school holidays, fairs or early bookings. Those are the moments when rates often shift again.`;
  const railItems = [
    {
      href: "/hotel-price-alert-after-booking",
      title: isDe ? "Preisalarm nach Buchung" : "Price Alert After Booking",
      text: isDe
        ? "Hier wird erklärt, wann ein günstigerer Preis später wirklich relevant wird."
        : "This explains when a later cheaper price really matters.",
      image: "/Alarm.gif",
    },
    {
      href: "/blog",
      title: isDe ? "Blog & Hotel-Guides" : "Blog & Hotel Guides",
      text: isDe
        ? "Mehr Kontext zu Stornierung, Preisstürzen und cleveren Rebooking-Entscheidungen."
        : "More context on cancellation, price drops and smarter rebooking decisions.",
      image: "/Guides.gif",
    },
  ];
  const faqItems = isDe
    ? [
        {
          question: `Lohnt sich Preisüberwachung für Hotels in ${city.name}?`,
          answer: `Ja, besonders in ${city.name} schwanken Hotelpreise oft bis kurz vor dem Aufenthalt. Wenn du kostenlos stornieren kannst, lohnt sich tägliches Monitoring besonders.`,
        },
        {
          question: `Wie oft prüft SaveMyHoliday Preise für ${city.name}?`,
          answer: `Aktuell prüfen wir täglich und vergleichen dein gebuchtes Hotel mit aktuellen Angeboten für dieselben Reisedaten.`,
        },
        {
          question: `Brauche ich einen Account für ${city.name}-Hotelpreise?`,
          answer: `Nein. Du gibst nur deine Buchungsdaten und E-Mail an und verwaltest alles später über einen sicheren Link.`,
        },
      ]
    : [
        {
          question: `Is price tracking worth it for hotels in ${city.name}?`,
          answer: `Yes. Hotel prices in ${city.name} often move between booking and check-in. Daily monitoring is especially useful if your booking is free cancellation.`,
        },
        {
          question: `How often does SaveMyHoliday check prices in ${city.name}?`,
          answer: `We currently check daily and compare your booked hotel against current offers for the same travel dates.`,
        },
        {
          question: `Do I need an account to monitor hotels in ${city.name}?`,
          answer: `No. You only submit your booking details and email, then manage everything later via a secure link.`,
        },
      ];

  // Schema.org JSON-LD
  const schemaOrg = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: pageTitle,
      description: isDe ? city.description_de : city.description_en,
      url: `${SITE_URL}/hotels/${city.slug}`,
      publisher: {
        "@type": "Organization",
        name: "SaveMyHoliday",
        url: SITE_URL,
      },
      primaryImageOfPage: city.image,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Hotels",
          item: `${SITE_URL}/hotels`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: city.name,
          item: `${SITE_URL}/hotels/${city.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <>
      <Navbar t={t} />

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <main style={{ background: "#f8f9fb", minHeight: "100vh", paddingTop: 84 }}>

        {/* ── Hero ── */}
        <div style={{ background: "#0f2044", padding: "4.3rem 2rem 3.2rem" }}>
          <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}>
              {isDe
                ? `${city.name} · ${city.country}`
                : `${city.name} · ${city.country}`}
            </div>
            <h1 style={{
              fontFamily: "var(--font-head)",
              fontWeight: 900,
              fontSize: "clamp(1.75rem, 4vw, 2.85rem)",
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 1rem",
            }}>
              {pageTitle}
            </h1>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.75)",
              margin: "0 auto 1.6rem",
              maxWidth: 760,
              lineHeight: 1.6,
            }}>
              {introParagraph}
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 2rem 5rem" }}>
          <div
            className="city-top-grid"
            style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "1.5rem",
            marginBottom: "3rem",
            alignItems: "stretch",
          }}
          >
            <div style={{
              background: "#ffffff",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(15,32,68,0.07)",
              border: "1px solid #e8ecf2",
            }}>
              <img
                src={city.image}
                alt={isDe ? `${city.name} Skyline und Hotels` : `${city.name} skyline and hotels`}
                style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "1.4rem 1.5rem 1.6rem" }}>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#f97316",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "0.5rem",
                }}>
                  {isDe ? "Preislogik in dieser Stadt" : "Price dynamics in this city"}
                </div>
                <h2 style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  color: "#0f2044",
                  margin: "0 0 0.75rem",
                }}>
                  {isDe ? `Warum ${city.name} spannend für Preisüberwachung ist` : `Why ${city.name} is worth monitoring`}
                </h2>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  color: "#64748b",
                  lineHeight: 1.7,
                  margin: "0 0 1rem",
                }}>
                  {isDe
                    ? `In ${city.name} spielen Saison, Events, Wochenenden und Auslastung eine große Rolle. Genau dadurch entstehen nach der Buchung oft neue Chancen für günstigere Raten. Wenn du eine flexible Rate hast, kann ein Preisalarm hier besonders wertvoll sein.`
                    : `In ${city.name}, seasonality, events, weekends, and occupancy levels all influence pricing. That creates real opportunities for lower rates after booking. If your rate is flexible, price monitoring becomes especially valuable here.`}
                </p>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  color: "#64748b",
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {isDe
                    ? `Besonders relevant ist das bei Städtereisen rund um Feiertage, Messen, Events oder Wochenenden. Je früher du gebucht hast, desto größer ist oft die Chance, dass sich später noch ein besserer Preis ergibt.`
                    : `This matters especially for city trips around holidays, fairs, events or busy weekends. The earlier you booked, the more likely it often becomes that a better rate shows up later.`}
                </p>
              </div>
            </div>

            <div style={{
              background: "linear-gradient(160deg, #0f2044 0%, #17345f 100%)",
              borderRadius: 18,
              padding: "1.5rem",
              color: "#fff",
              display: "grid",
              gap: "1rem",
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#f97316",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "0.45rem",
                }}>
                  {isDe ? "Quick take" : "Quick take"}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  lineHeight: 1.25,
                  margin: 0,
                }}>
                  {isDe ? `${city.name}: gut für Preisalarme, wenn du früh gebucht hast` : `${city.name}: great for price alerts if you booked early`}
                </h3>
              </div>
              {[
                isDe ? "Früh gebucht? Dann ist Nachverfolgung besonders sinnvoll." : "Booked early? Monitoring usually matters more.",
                isDe ? "Flexible Tarife schlagen starre Tarife fast immer bei späteren Preissenkungen." : "Flexible rates usually beat rigid rates once prices move.",
                isDe ? "Die besten Chancen entstehen oft 1–6 Wochen vor Anreise." : "The best opportunities often appear 1–6 weeks before arrival.",
              ].map((item) => (
                <div key={item} style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: "0.9rem 1rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.82)",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className="city-two-col"
            style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.2rem",
            marginBottom: "3rem",
          }}
          >
            <div style={{ background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 18, padding: "1.4rem 1.5rem" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                {isDe ? "Wann es sich hier besonders lohnt" : "When it matters most here"}
              </div>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.25rem", color: "#0f2044", margin: "0 0 0.75rem" }}>
                {isDe ? `${city.name} ist vor allem für flexible Buchungen spannend` : `${city.name} is especially interesting for flexible bookings`}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.94rem", color: "#64748b", lineHeight: 1.7, margin: 0 }}>
                {isDe
                  ? `Wenn du kostenlos stornieren kannst, wird ein Preisalarm in ${city.name} deutlich wertvoller. Dann kannst du entspannt beobachten, ob zwischen heute und deiner Anreise eine bessere Rate auftaucht.`
                  : `If your hotel can be cancelled for free, price tracking in ${city.name} becomes much more valuable. You can simply watch whether a better rate appears between now and check-in.`}
              </p>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 18, padding: "1.4rem 1.5rem" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                {isDe ? "Worauf du achten solltest" : "What to watch out for"}
              </div>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.25rem", color: "#0f2044", margin: "0 0 0.75rem" }}>
                {isDe ? "Nicht jeder niedrigere Preis ist automatisch besser" : "Not every lower price is automatically better"}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.94rem", color: "#64748b", lineHeight: 1.7, margin: 0 }}>
                {isDe
                  ? `Wichtig sind dieselben Daten, ein vergleichbarer Tarif und die Frage, ob du deine alte Buchung ohne Risiko stornieren kannst. Genau deshalb hilft ein sauberer Vergleich mehr als irgendein billiger Deal.`
                  : `What matters are the same dates, a comparable rate and whether you can cancel your old booking safely. That is why a clean comparison helps more than any random cheap-looking deal.`}
              </p>
            </div>
          </div>

          {cityGuide && (
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 1.2rem" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                  {isDe ? `Mehrwert für ${city.name}` : `Useful context for ${city.name}`}
                </div>
                <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(1.45rem, 3vw, 2.1rem)", color: "#0f2044", lineHeight: 1.15, margin: 0 }}>
                  {miniGuideTitle}
                </h2>
              </div>

              <div className="city-guide-grid" style={{ display: "grid", gridTemplateColumns: "1.02fr 0.98fr", gap: "1.2rem" }}>
                <div style={{ background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 40px rgba(15,32,68,0.06)" }}>
                  <img src={secondaryImage} alt={`${city.name} travel guide`} style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "1.35rem 1.4rem 1.45rem" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                      {isDe ? "Was du wirklich machen solltest" : "What is genuinely worth doing"}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.22rem", color: "#0f2044", margin: "0 0 0.75rem" }}>
                      {isDe ? `${city.name} jenseits der reinen Hotelsuche` : `${city.name} beyond the hotel search`}
                    </h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "#64748b", lineHeight: 1.7, margin: "0 0 1rem" }}>
                      {travelNote}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
                      {highlightList.map((item) => (
                        <span key={item} style={{ background: "#f8fafc", border: "1px solid #e8ecf2", borderRadius: 999, padding: "0.45rem 0.8rem", fontFamily: "var(--font-body)", fontSize: "0.86rem", color: "#334155", fontWeight: 600 }}>
                          {item}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: "1rem", background: "#f8fafc", border: "1px solid #e8ecf2", borderRadius: 14, padding: "0.95rem 1rem" }}>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                        {isDe ? "Wenn du nur 48 Stunden hast" : "If you only have 48 hours"}
                      </div>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>
                        {twoDayPlan}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 20, padding: "1.35rem 1.4rem", boxShadow: "0 12px 40px rgba(15,32,68,0.06)" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                      {isDe ? "Wo du wohnen solltest" : "Where staying makes sense"}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.15rem", color: "#0f2044", margin: "0 0 0.65rem" }}>
                      {isDe ? `Viertel, die zu ${city.name} passen` : `Areas that fit a ${city.name} trip`}
                    </h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.94rem", color: "#64748b", lineHeight: 1.7, margin: 0 }}>
                      {stayTip}
                    </p>
                    {premiumStayAreas && (
                      <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.85rem" }}>
                        {premiumStayAreas.map((item) => (
                          <div key={item} style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#475569", lineHeight: 1.6, paddingLeft: "1rem", position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, color: "#f97316", fontWeight: 900 }}>•</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ background: "linear-gradient(160deg,#fff7ed,#ffffff)", border: "1px solid #fde7d7", borderRadius: 20, padding: "1.35rem 1.4rem", boxShadow: "0 12px 40px rgba(15,32,68,0.04)" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                      {isDe ? "Wie du beim Hotel Geld sparst" : "How to save on the hotel"}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.15rem", color: "#0f2044", margin: "0 0 0.65rem" }}>
                      {isDe ? `So nutzt du Preisüberwachung in ${city.name} besser` : `How to use price tracking better in ${city.name}`}
                    </h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.94rem", color: "#7c2d12", lineHeight: 1.7, margin: 0 }}>
                      {savingTip}
                    </p>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 20, padding: "1.35rem 1.4rem", boxShadow: "0 12px 40px rgba(15,32,68,0.05)" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                      {isDe ? "Wann Preise hier kippen können" : "When prices can move here"}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.15rem", color: "#0f2044", margin: "0 0 0.65rem" }}>
                      {isDe ? `Timing für ${city.name}` : `Timing for ${city.name}`}
                    </h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.94rem", color: "#64748b", lineHeight: 1.7, margin: 0 }}>
                      {hotelTimingSummary}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {premiumIntro && premiumMustSee && (
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 1.2rem" }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                  {isDe ? `Premium Guide für ${city.name}` : `Premium guide for ${city.name}`}
                </div>
                <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(1.45rem, 3vw, 2.1rem)", color: "#0f2044", lineHeight: 1.15, margin: "0 0 0.8rem" }}>
                  {isDe ? `${city.name} richtig erleben und gleichzeitig smarter buchen` : `Experience ${city.name} better and book smarter at the same time`}
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.98rem", color: "#64748b", lineHeight: 1.75, margin: 0 }}>
                  {premiumIntro}
                </p>
              </div>

              <div className="city-premium-grid" style={{ display: "grid", gridTemplateColumns: "0.98fr 1.02fr", gap: "1.2rem" }}>
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 20, padding: "1.35rem 1.4rem", boxShadow: "0 12px 40px rgba(15,32,68,0.06)" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                      {isDe ? "Warum diese Stadt hängen bleibt" : "Why this city sticks with you"}
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.96rem", color: "#64748b", lineHeight: 1.78, margin: 0 }}>
                      {premiumIntro}
                    </p>
                  </div>

                  <div style={{ background: "linear-gradient(160deg,#fff7ed,#ffffff)", border: "1px solid #fde7d7", borderRadius: 20, padding: "1.35rem 1.4rem", boxShadow: "0 12px 40px rgba(15,32,68,0.04)" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                      {isDe ? "Drei Empfehlungen, die nicht nach Standard klingen" : "Three recommendations that do not sound generic"}
                    </div>
                    <div style={{ display: "grid", gap: "0.65rem" }}>
                      {premiumMustSee.map((item) => (
                        <div key={item} style={{ background: "#ffffff", border: "1px solid #fde7d7", borderRadius: 14, padding: "0.85rem 0.95rem", fontFamily: "var(--font-body)", fontSize: "0.92rem", color: "#7c2d12", lineHeight: 1.6, fontWeight: 600 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 20, padding: "1.35rem 1.4rem", boxShadow: "0 12px 40px rgba(15,32,68,0.06)" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                      {isDe ? "Was du hier anders machen solltest" : "What to do differently here"}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.18rem", color: "#0f2044", margin: "0 0 0.7rem" }}>
                      {isDe ? `${city.name} lieber mit Rhythmus als mit Hektik` : `${city.name} works better with rhythm than rush`}
                    </h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.94rem", color: "#64748b", lineHeight: 1.72, margin: "0 0 1rem" }}>
                      {isDe
                        ? `Wenn du ${city.name} nicht nur abhaken, sondern wirklich erleben willst, helfen klare Tagesrhythmen mehr als zehn Sehenswürdigkeiten hintereinander. Genau daraus entsteht meistens auch die bessere Hotelentscheidung: Lage, Ruhe und Timing sind oft wichtiger als ein paar Euro Unterschied am Anfang.`
                        : `If you want to actually experience ${city.name} instead of just ticking it off, a clearer daily rhythm helps more than stacking ten sights in a row. That often leads to the better hotel decision as well: location, calm and timing matter more than a tiny difference at the very beginning.`}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
                      {highlightList.map((item) => (
                        <span key={item} style={{ background: "#f8fafc", border: "1px solid #e8ecf2", borderRadius: 999, padding: "0.45rem 0.8rem", fontFamily: "var(--font-body)", fontSize: "0.86rem", color: "#334155", fontWeight: 600 }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", border: "1px solid #e8ecf2", borderRadius: 20, padding: "1.35rem 1.4rem", boxShadow: "0 12px 40px rgba(15,32,68,0.05)" }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>
                      {isDe ? "Mini-Reiseführer" : "Mini travel guide"}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.15rem", color: "#0f2044", margin: "0 0 0.7rem" }}>
                      {isDe ? `So fühlt sich ${city.name} meist am besten an` : `How ${city.name} often feels best`}
                    </h3>
                    <div style={{ display: "grid", gap: "0.85rem" }}>
                      <div style={{ background: "#f8fafc", border: "1px solid #e8ecf2", borderRadius: 14, padding: "0.95rem 1rem" }}>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                          {isDe ? "Morgens" : "Morning"}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.91rem", color: "#475569", lineHeight: 1.65 }}>
                          {isDe
                            ? `Früh starten lohnt sich in ${city.name} fast immer: weniger Menschen, angenehmere Wege und oft der bessere Eindruck von Stadt und Vierteln.`
                            : `Starting early almost always pays off in ${city.name}: fewer crowds, easier walking and a better feel for the city and its neighborhoods.`}
                        </div>
                      </div>
                      <div style={{ background: "#f8fafc", border: "1px solid #e8ecf2", borderRadius: 14, padding: "0.95rem 1rem" }}>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                          {isDe ? "Nachmittags" : "Afternoon"}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.91rem", color: "#475569", lineHeight: 1.65 }}>
                          {isDe
                            ? `Lieber ein Viertel bewusst erleben, essen gehen und auch mal sitzen bleiben, statt nur weiterzumüssen. So merkst du schneller, welche Lage für deinen Trip wirklich passt.`
                            : `It is usually better to stay with one neighborhood, eat well and slow down a little instead of constantly moving on. That is when you notice which location truly fits your trip.`}
                        </div>
                      </div>
                      <div style={{ background: "#f8fafc", border: "1px solid #e8ecf2", borderRadius: 14, padding: "0.95rem 1rem" }}>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
                          {isDe ? "Abends" : "Evening"}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.91rem", color: "#475569", lineHeight: 1.65 }}>
                          {isDe
                            ? `Genau abends zeigt sich oft, ob ein Viertel nur praktisch oder wirklich gut ist. Für Hotels ist das wichtig: Atmosphäre und Rückweg prägen die Reisequalität mehr als reine Sterne.`
                            : `Evening is often when you notice whether a neighborhood is merely practical or actually good. For hotels that matters a lot: atmosphere and the way back often shape the trip more than stars alone.`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA box */}
          <div style={{
            background: "linear-gradient(135deg, #0f2044 0%, #1a3a6e 100%)",
            borderRadius: 20,
            padding: "2.5rem 2rem",
            textAlign: "center",
            marginBottom: "3rem",
          }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#f97316",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.75rem",
            }}>
              {isDe ? "Jetzt kostenlos starten" : "Start for free now"}
            </div>
            <h2 style={{
              fontFamily: "var(--font-head)",
              fontWeight: 900,
              fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: "0 0 1rem",
            }}>
              {isDe
                ? `Dein ${city.name}-Hotel könnte schon morgen günstiger sein.`
                : `Your ${city.name} hotel could already be cheaper tomorrow.`}
            </h2>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.98rem",
              color: "rgba(255,255,255,0.72)",
              margin: "0 auto 1.75rem",
              maxWidth: 480,
              lineHeight: 1.6,
            }}>
              {isDe
                ? "Kein Account. Keine App. Nur deine Buchungs-URL eingeben — wir überwachen kostenlos."
                : "No account. No app. Just enter your booking URL — we monitor it for free."}
            </p>
            <a
              href="/#buchen"
              style={{
                display: "inline-block",
                background: "#f97316",
                color: "#ffffff",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "0.85rem 2.25rem",
                borderRadius: 50,
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              {isDe
                ? `${city.name}-Hotel jetzt überwachen →`
                : `Monitor ${city.name} hotel now →`}
            </a>
          </div>

          {/* SEO keywords */}
          <div style={{ marginBottom: "3rem" }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.75rem",
            }}>
              {isDe ? "Verwandte Suchanfragen" : "Related searches"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {keywords.map((kw) => (
                <span
                  key={kw}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    background: "#ffffff",
                    border: "1px solid #e8ecf2",
                    borderRadius: 50,
                    padding: "0.3rem 0.85rem",
                    color: "#4a5568",
                    whiteSpace: "nowrap",
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "3rem" }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.85rem",
            }}>
              {isDe ? "Hilfreiche Guides" : "Helpful guides"}
            </div>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  style={{
                    textDecoration: "none",
                    background: "#ffffff",
                    border: "1px solid #e8ecf2",
                    borderRadius: 14,
                    padding: "1rem 1.1rem",
                    display: "block",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, color: "#0f2044", marginBottom: "0.35rem" }}>
                    {isDe ? post.title.de : post.title.en}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#64748b", lineHeight: 1.6 }}>
                    {isDe ? post.description.de : post.description.en}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "3rem" }}>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.85rem",
            }}>
              {isDe ? "Weitere Städte" : "More cities"}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}>
              {relatedCities.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/hotels/${entry.slug}`}
                  style={{
                    textDecoration: "none",
                    background: "#ffffff",
                    border: "1px solid #e8ecf2",
                    borderRadius: 16,
                    overflow: "hidden",
                    display: "block",
                  }}
                >
                  <img
                    src={entry.image}
                    alt={entry.name}
                    style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: "0.9rem 1rem 1rem" }}>
                    <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, color: "#0f2044", marginBottom: "0.35rem" }}>
                      {entry.name}
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.87rem", color: "#64748b", lineHeight: 1.55 }}>
                      {isDe ? entry.description_de : entry.description_en}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.85rem",
            }}>
              FAQ
            </div>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e8ecf2",
                    borderRadius: 14,
                    padding: "1rem 1.1rem",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, color: "#0f2044", marginBottom: "0.45rem" }}>
                    {item.question}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#64748b", lineHeight: 1.65 }}>
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "3rem" }}>
            <SeoPageRail
              eyebrow={isDe ? "Wichtige nächste Seiten" : "Important next pages"}
              title={isDe ? "Von dieser Stadtseite solltest du sinnvoll weiterkommen" : "From this city page, you should move on to the right next pages"}
              items={railItems}
            />
          </div>

        </div>
      </main>

      <style>{`
        @media (max-width: 820px) {
          .city-top-grid,
          .city-two-col,
          .city-premium-grid,
          .city-guide-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer t={t} />
    </>
  );
}
