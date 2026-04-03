import { type Translations } from "@/lib/translations";

const cards = [
  {
    href: "/hotel-price-tracker",
    accent: "#0f2044",
    image:
      "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    href: "/hotel-price-alert-after-booking",
    accent: "#f97316",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    href: "/hotels",
    accent: "#0ea5a4",
    image:
      "https://images.unsplash.com/photo-1505765050516-f72dcac9c60f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    href: "/blog",
    accent: "#1d4ed8",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function SeoGateway({ t }: { t: Translations }) {
  const content = [
    {
      title: t.seoHome.card1Title,
      text: t.seoHome.card1Text,
      cta: t.seoHome.card1Cta,
    },
    {
      title: t.seoHome.card2Title,
      text: t.seoHome.card2Text,
      cta: t.seoHome.card2Cta,
    },
    {
      title: t.seoHome.card3Title,
      text: t.seoHome.card3Text,
      cta: t.seoHome.card3Cta,
    },
    {
      title: t.seoHome.card4Title,
      text: t.seoHome.card4Text,
      cta: t.seoHome.card4Cta,
    },
  ];

  return (
    <section
      style={{
        padding: "5.5rem 4% 4.5rem",
        background:
          "radial-gradient(circle at top left, rgba(249,115,22,0.08), transparent 28%), linear-gradient(180deg, #fffaf5 0%, #ffffff 100%)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ maxWidth: 720, marginBottom: "2.2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.45rem 0.8rem",
              borderRadius: 999,
              background: "rgba(249,115,22,0.1)",
              color: "#c2410c",
              fontWeight: 800,
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              marginBottom: "1rem",
            }}
          >
            {t.seoHome.eyebrow}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3.4rem)",
              lineHeight: 1.05,
              color: "#0f2044",
              marginBottom: "1rem",
              whiteSpace: "pre-line",
            }}
          >
            {t.seoHome.headline.replace("|", "\n")}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: "#475569",
              margin: 0,
            }}
          >
            {t.seoHome.sub}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {content.map((card, index) => (
            <a
              key={card.title}
              href={cards[index].href}
              style={{
                textDecoration: "none",
                color: "inherit",
                borderRadius: 24,
                overflow: "hidden",
                background: "#ffffff",
                border: "1px solid rgba(15,32,68,0.08)",
                boxShadow: "0 22px 60px rgba(15,32,68,0.08)",
                display: "block",
              }}
            >
              <div
                style={{
                  height: 170,
                  backgroundImage: `linear-gradient(180deg, rgba(15,32,68,0.06), rgba(15,32,68,0.22)), url(${cards[index].image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ padding: "1.35rem 1.3rem 1.4rem" }}>
                <div
                  style={{
                    width: 44,
                    height: 4,
                    borderRadius: 999,
                    background: cards[index].accent,
                    marginBottom: "1rem",
                  }}
                />
                <h3
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 800,
                    fontSize: "1.15rem",
                    lineHeight: 1.25,
                    color: "#0f2044",
                    marginBottom: "0.7rem",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.96rem",
                    lineHeight: 1.7,
                    color: "#64748b",
                    margin: "0 0 1rem",
                    minHeight: 82,
                  }}
                >
                  {card.text}
                </p>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    color: cards[index].accent,
                  }}
                >
                  {card.cta}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
