import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCityBySlug, getAllCities } from "@/lib/cities";

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
    openGraph: {
      title,
      description,
      type: "website",
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
    ? `${city.name} ist ein begehrtes Reiseziel — und genau deshalb schwanken die Hotelpreise hier besonders stark. Mit SaveMyHoliday überwachst du deinen Hotelpreis in ${city.name} automatisch und kostenlos. Du bekommst eine E-Mail, sobald der Preis sinkt — und kannst die Ersparnis sofort nutzen.`
    : `${city.name} is a sought-after destination — and that's exactly why hotel prices here fluctuate so significantly. With SaveMyHoliday you monitor your hotel price in ${city.name} automatically and for free. You receive an email as soon as the price drops — and can pocket the savings immediately.`;

  const steps = isDe
    ? [
        {
          icon: "🔗",
          title: "Buchung eintragen",
          text: `Gib deine Buchungs-URL und E-Mail-Adresse ein. Kein Account erforderlich.`,
        },
        {
          icon: "📊",
          title: "Wir überwachen täglich",
          text: `SaveMyHoliday prüft täglich den Hotelpreis in ${city.name} und vergleicht ihn mit deinem gebuchten Preis.`,
        },
        {
          icon: "💰",
          title: "Du sparst",
          text: `Sobald der Preis sinkt, bekommst du eine E-Mail. Du entscheidest, ob du stornierst und günstiger neu buchst.`,
        },
      ]
    : [
        {
          icon: "🔗",
          title: "Add your booking",
          text: `Enter your booking URL and email address. No account needed.`,
        },
        {
          icon: "📊",
          title: "We monitor daily",
          text: `SaveMyHoliday checks the hotel price in ${city.name} daily and compares it against your booked rate.`,
        },
        {
          icon: "💰",
          title: "You save",
          text: `As soon as the price drops, you get an email. You decide whether to cancel and rebook at the lower rate.`,
        },
      ];

  const keywords = isDe ? city.keywords_de : city.keywords_en;

  // Schema.org JSON-LD
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: isDe ? city.description_de : city.description_en,
    url: `https://savemyholiday.com/hotels/${city.slug}`,
    publisher: {
      "@type": "Organization",
      name: "SaveMyHoliday",
      url: "https://savemyholiday.com",
    },
  };

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
        <div style={{ background: "#0f2044", padding: "4rem 2rem 3rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
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
              margin: 0,
              maxWidth: 580,
              lineHeight: 1.6,
            }}>
              {introParagraph}
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 2rem 5rem" }}>

          {/* How it works */}
          <div style={{ marginBottom: "3rem" }}>
            <h2 style={{
              fontFamily: "var(--font-head)",
              fontWeight: 800,
              fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
              color: "#0f2044",
              margin: "0 0 0.5rem",
              letterSpacing: "-0.01em",
            }}>
              {isDe ? "Wie es funktioniert" : "How it works"}
            </h2>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "#6b7280",
              margin: "0 0 2rem",
              lineHeight: 1.6,
            }}>
              {isDe
                ? `In 3 einfachen Schritten Hotelpreise in ${city.name} überwachen.`
                : `Monitor hotel prices in ${city.name} in 3 simple steps.`}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
            }}>
              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    padding: "1.75rem 1.5rem",
                    boxShadow: "0 2px 12px rgba(15,32,68,0.07)",
                    border: "1px solid #e8ecf2",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                    {step.icon}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#f97316",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.4rem",
                  }}>
                    {isDe ? `Schritt ${i + 1}` : `Step ${i + 1}`}
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "#0f2044",
                    margin: "0 0 0.5rem",
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: "1.5rem 2rem",
            boxShadow: "0 2px 12px rgba(15,32,68,0.07)",
            border: "1px solid #e8ecf2",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
            textAlign: "center",
          }}>
            {[
              { value: "∅ 18 %", label: isDe ? "Preissenkung nach Buchung" : "average price drop after booking" },
              { value: "100 %", label: isDe ? "kostenlos" : "free to use" },
              { value: "täglich", label: isDe ? "automatische Preisprüfung" : "automatic price check" },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 900,
                  fontSize: "1.8rem",
                  color: "#f97316",
                  lineHeight: 1,
                  marginBottom: "0.35rem",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  color: "#8fa3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

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
          <div>
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

        </div>
      </main>

      <Footer t={t} />
    </>
  );
}
