import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.9rem" }}>
              {isDe ? "Intent Page · Preisalarm nach Buchung" : "Intent page · price alert after booking"}
            </div>
            <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.6rem)", lineHeight: 1.07, letterSpacing: "-0.03em", color: "#0f2044", margin: "0 0 1rem" }}>
              {isDe ? "Hotel Price Alert nach der Buchung: So sparst du später statt früher" : "Hotel price alert after booking: save later, not just earlier"}
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "1.04rem", color: "#64748b", lineHeight: 1.75, maxWidth: 760, margin: 0 }}>
              {isDe
                ? "Viele Reisende vergleichen nur vor der Buchung. Der größere Hebel liegt oft danach. Genau dafür ist SaveMyHoliday gebaut: Preisalarm für dieselbe Reise, dieselben Daten und dieselbe Buchung."
                : "Most travellers only compare before booking. The bigger opportunity often comes afterwards. SaveMyHoliday is built for exactly that: a price alert for the same stay, the same dates, and the same booking."}
            </p>
          </div>
        </section>

        <section style={{ maxWidth: 1040, margin: "0 auto", padding: "3rem 2rem 4.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "1rem", marginBottom: "2.2rem" }}>
            {[
              {
                title: isDe ? "Nach der Buchung beobachten" : "Watch after booking",
                text: isDe ? "Nicht nur vorher vergleichen, sondern den Preis weiterlaufen lassen." : "Do not stop at booking; keep the rate under watch.",
              },
              {
                title: isDe ? "Nur gleiche Reise vergleichen" : "Compare the same stay only",
                text: isDe ? "Gleiche Daten, gleiches Hotel, gleiche Reise. Keine irrelevanten Angebote." : "Same dates, same hotel, same trip. No irrelevant offers.",
              },
              {
                title: isDe ? "Signal statt Rauschen" : "Signal over noise",
                text: isDe ? "Nur wenn eine Rate wirklich günstiger ist, wird sie interessant." : "Only when a rate is truly lower does it matter.",
              },
            ].map((card) => (
              <div key={card.title} style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 18, padding: "1.3rem 1.2rem" }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.05rem", color: "#0f2044", marginBottom: "0.45rem" }}>{card.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", color: "#64748b", lineHeight: 1.7 }}>{card.text}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "linear-gradient(160deg, #0f2044 0%, #17345f 100%)", borderRadius: 22, padding: "2rem", marginBottom: "2.4rem" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {isDe ? "Das eigentliche Problem" : "The real problem"}
            </div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: "clamp(1.35rem, 3vw, 2rem)", color: "#fff", lineHeight: 1.15, marginBottom: "0.8rem" }}>
              {isDe ? "Hotelpreise bewegen sich weiter, auch wenn du schon gebucht hast" : "Hotel prices keep moving even after you already booked"}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.98rem", color: "rgba(255,255,255,0.76)", lineHeight: 1.8, maxWidth: 780 }}>
              {isDe
                ? "Ein Hotel Price Alert nach der Buchung ist deshalb kein Nice-to-have, sondern ein echter Sparhebel. Gerade bei flexiblen Tarifen kannst du günstigere Raten später noch mitnehmen."
                : "That is why a hotel price alert after booking is not just a nice extra but a real savings lever. Especially with flexible rates, cheaper prices later still matter."}
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
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
