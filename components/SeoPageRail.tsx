import Link from "next/link";

type RailItem = {
  href: string;
  title: string;
  text: string;
  image: string;
};

export default function SeoPageRail({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: RailItem[];
}) {
  return (
    <section style={{ marginBottom: "3rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto 1.4rem", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.76rem",
            fontWeight: 700,
            color: "#f97316",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.65rem",
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 900,
            fontSize: "clamp(1.45rem, 3vw, 2.1rem)",
            color: "#0f2044",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              textDecoration: "none",
              background: "#ffffff",
              border: "1px solid #e8ecf2",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(15,32,68,0.06)",
              display: "block",
            }}
          >
            <div
              style={{
                height: 170,
                backgroundImage: `linear-gradient(180deg, rgba(15,32,68,0.08), rgba(15,32,68,0.18)), url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div style={{ padding: "1.1rem 1.15rem 1.2rem", textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 800,
                  fontSize: "1.03rem",
                  color: "#0f2044",
                  marginBottom: "0.45rem",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.92rem",
                  color: "#64748b",
                  lineHeight: 1.65,
                }}
              >
                {item.text}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
