import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoPageRail from "@/components/SeoPageRail";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Hotel Price Alert After Booking — SaveMyHoliday",
  description:
    "Set a hotel price alert after booking and get notified when the same stay becomes cheaper. SaveMyHoliday helps you monitor hotel rates without an account.",
  keywords: [
    "hotel price alert after booking",
    "hotel price drop alert after booking",
    "booking.com price alert after booking",
    "hotel gets cheaper after booking",
  ].join(", "),
  alternates: {
    canonical: "https://savemyholiday.com/hotel-price-alert-after-booking",
  },
};

export default function HotelPriceAlertAfterBookingPage() {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;
  const t = getTranslations(locale);
  const isDe = locale === "de";
  const posts = getAllPosts().slice(0, 3);
  const railItems = [
    {
      href: "/hotel-price-tracker",
      title: isDe ? "Hotel Price Tracker" : "Hotel Price Tracker",
      text: isDe
        ? "Die Überblicksseite für das ganze Thema Preisüberwachung nach der Buchung."
        : "The overview page for the full post-booking hotel tracking topic.",
      image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
    },
    {
      href: "/hotels",
      title: isDe ? "Städte & Reiseziele" : "Cities & Destinations",
      text: isDe
        ? "Hier findest du ausführlichere Seiten zu Städten mit starken Preisbewegungen."
        : "Find richer pages for cities with meaningful hotel price movement.",
      image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      href: "/blog",
      title: isDe ? "Mehr Guides" : "More Guides",
      text: isDe
        ? "Mehr Kontext zu Preisstürzen, Stornierung und smarteren Buchungsentscheidungen."
        : "More context on price drops, cancellation and smarter booking decisions.",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Hotel Price Alert After Booking",
    description: "Set a hotel price alert after booking and get notified when a cheaper rate appears.",
    url: "https://savemyholiday.com/hotel-price-alert-after-booking",
  };

  return (
    <>
      <Navbar t={t} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main style={{ background: "#f7fafc", minHeight: "100vh", paddingTop: 84 }}>
        <section style={{ padding: "4.2rem 2rem 3.7rem", background: "linear-gradient(145deg, #fff7ed 0%, #fff 45%, #f7fafc 100%)" }}>
          <div style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "2rem", alignItems: "center" }} className="alert-hero-grid">
            <div className="alert-hero-copy">
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.9rem" }}>
              {isDe ? "Intent Page · Preisalarm nach Buchung" : "Intent page · price alert after booking"}
            </div>
            <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.6rem)", lineHeight: 1.07, letterSpacing: "-0.03em", color: "#0f2044", margin: "0 0 1rem" }}>
              {isDe ? "Hotel Price Alert nach der Buchung: So sparst du später statt früher" : "Hotel price alert after booking: save later, not just earlier"}
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "1.04rem", color: "#64748b", lineHeight: 1.75, maxWidth: 700, margin: "0 0 1.2rem" }}>
              {isDe
                ? "Viele Reisende vergleichen nur vor der Buchung. Der größere Hebel liegt oft danach. Genau dafür ist SaveMyHoliday gebaut: Preisalarm für dieselbe Reise, dieselben Daten und dieselbe Buchung."
                : "Most travellers only compare before booking. The bigger opportunity often comes afterwards. SaveMyHoliday is built for exactly that: a price alert for the same stay, the same dates, and the same booking."}
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.98rem", color: "#475569", lineHeight: 1.75, maxWidth: 700, margin: 0 }}>
              {isDe
                ? "Du musst also nicht jeden Tag selbst zurück auf Booking.com gehen. Stattdessen beobachtest du dieselbe Reise weiter und handelst nur dann, wenn ein späterer Preis wirklich besser ist."
                : "You do not need to revisit booking sites manually every day. Instead, you keep watching the same trip and only act when a later price is genuinely better."}
            </p>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
              alt={isDe ? "Hotel Price Alert nach der Buchung" : "Hotel price alert after booking"}
              style={{ width: "100%", height: 360, objectFit: "cover", display: "block", borderRadius: 26, boxShadow: "0 24px 60px rgba(15,32,68,0.14)" }}
            />
          </div>
          </div>
        </section>

        <section style={{ maxWidth: 1040, margin: "0 auto", padding: "3rem 2rem 4.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "2.4rem" }} className="alert-two-col">
            <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 20, padding: "1.45rem 1.5rem" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                {isDe ? "Das eigentliche Problem" : "The real problem"}
              </div>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "1.45rem", color: "#0f2044", lineHeight: 1.15, margin: "0 0 0.75rem" }}>
                {isDe ? "Hotelpreise bewegen sich weiter, auch wenn du schon gebucht hast" : "Hotel prices keep moving even after you already booked"}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.98rem", color: "#64748b", lineHeight: 1.8, margin: 0 }}>
                {isDe
                  ? "Ein Preisalarm nach der Buchung ist deshalb kein Nice-to-have, sondern ein echter Sparhebel. Vor allem bei flexiblen Tarifen kann eine spätere, bessere Rate noch einen echten Unterschied machen."
                  : "That is why a price alert after booking is not just a nice extra but a real savings lever. Especially with flexible rates, a later better price can still make a meaningful difference."}
              </p>
            </div>
            <div style={{ background: "linear-gradient(160deg,#fff7ed,#ffffff)", border: "1px solid #fde7d7", borderRadius: 20, padding: "1.45rem 1.5rem" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                {isDe ? "Wann es besonders sinnvoll ist" : "When it matters most"}
              </div>
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "1.45rem", color: "#0f2044", lineHeight: 1.15, margin: "0 0 0.75rem" }}>
                {isDe ? "Vor allem bei flexiblen oder frühen Buchungen" : "Especially for flexible or early bookings"}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.98rem", color: "#7c2d12", lineHeight: 1.8, margin: 0 }}>
                {isDe
                  ? "Wenn du früh gebucht hast oder kostenlos stornieren kannst, sind Preisalarme besonders wertvoll. Genau dann hast du die beste Chance, eine spätere Preissenkung noch mitzunehmen."
                  : "If you booked early or can cancel for free, price alerts become especially valuable. That is when you have the best chance to still benefit from a later price drop."}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "2.4rem" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>
              {isDe ? "Weiterführende Artikel" : "Further reading"}
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

          <div style={{ textAlign: "center" }}>
            <a href="/#track-hotels" style={{ display: "inline-block", background: "#f97316", color: "#fff", textDecoration: "none", padding: "0.95rem 1.6rem", borderRadius: 14, fontWeight: 800, fontFamily: "var(--font-body)" }}>
              {isDe ? "Jetzt Preisalarm starten" : "Start price alert now"}
            </a>
          </div>

          <div style={{ marginTop: "3rem" }}>
            <SeoPageRail
              eyebrow={isDe ? "Wichtige Anschlussseiten" : "Important follow-up pages"}
              title={isDe ? "Wenn du über Preisalarm liest, solltest du hier sinnvoll weiterkommen" : "If you are reading about alerts, you should move on to the right pages next"}
              items={railItems}
            />
          </div>
        </section>
      </main>
      <style>{`
        @media (max-width: 920px) {
          .alert-hero-grid, .alert-two-col { grid-template-columns: 1fr !important; }
          .alert-hero-copy { text-align: center; }
        }
      `}</style>
      <Footer t={t} />
    </>
  );
}
