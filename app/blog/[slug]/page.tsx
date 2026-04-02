import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import ShareButtons from "@/components/ShareButtons";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title.de} — SaveMyHoliday`,
    description: post.description.de,
    keywords: post.keywords.join(", "),
    openGraph: {
      title: post.title.de,
      description: post.description.de,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const headersList = headers();
  const locale = (headersList.get("x-locale") || "de") as Locale;
  const t = getTranslations(locale);
  const isDE = locale === "de";

  const title = isDE ? post.title.de : post.title.en;
  const content = isDE ? post.content.de : post.content.en;
  const allPosts = getAllPosts().filter((p) => p.slug !== params.slug).slice(0, 3);

  return (
    <>
      <Navbar t={t} />
      <main style={{ background: "#f8f9fb", minHeight: "100vh", paddingTop: 84 }}>

        {/* Hero */}
        <div style={{ background: "#0f2044", padding: "4rem 2rem 3rem" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <Link href="/blog" style={{
                fontFamily: "var(--font-body)", fontSize: "0.8rem",
                color: "rgba(255,255,255,0.6)", textDecoration: "none",
              }}>
                ← {isDE ? "Alle Artikel" : "All articles"}
              </Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
              <span style={{
                background: "#fff3e8", color: "#f97316",
                fontFamily: "var(--font-body)", fontSize: "0.72rem",
                fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", padding: "0.25rem 0.6rem",
                borderRadius: 6,
              }}>
                {post.category}
              </span>
            </div>
            <h1 style={{
              fontFamily: "var(--font-head)", fontWeight: 900,
              fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
              color: "#ffffff", lineHeight: 1.15,
              letterSpacing: "-0.02em", margin: "0 0 1.25rem",
            }}>
              {title}
            </h1>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: "0.85rem",
              color: "rgba(255,255,255,0.55)",
            }}>
              {new Date(post.date).toLocaleDateString(isDE ? "de-DE" : "en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
              {" · "}
              {post.readTime} {isDE ? "Min. Lesezeit" : "min read"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 2rem 2rem" }}>
          <style>{`
            .article-body { font-family: var(--font-body); font-size: 1.05rem; line-height: 1.85; color: #1a2b4a; }
            .article-body p { margin: 0 0 1.4rem; }
            .article-body h2 {
              font-family: var(--font-head);
              font-size: clamp(1.25rem, 2.5vw, 1.55rem);
              font-weight: 800;
              color: #0f2044;
              margin: 2.5rem 0 1rem;
              padding-left: 1rem;
              border-left: 4px solid #f97316;
              line-height: 1.25;
            }
            .article-body h3 {
              font-family: var(--font-head);
              font-size: 1.15rem;
              font-weight: 700;
              color: #0f2044;
              margin: 2rem 0 0.75rem;
            }
            .article-body ul, .article-body ol {
              margin: 0 0 1.5rem 0;
              padding-left: 0;
              list-style: none;
            }
            .article-body ul li, .article-body ol li {
              position: relative;
              padding: 0.65rem 1rem 0.65rem 2.75rem;
              margin-bottom: 0.5rem;
              background: #f8f9fb;
              border-radius: 10px;
              border: 1px solid #e8ecf2;
              font-size: 0.97rem;
              line-height: 1.6;
            }
            .article-body ul li::before {
              content: "✓";
              position: absolute;
              left: 0.85rem;
              top: 0.65rem;
              color: #f97316;
              font-weight: 800;
              font-size: 0.9rem;
            }
            .article-body ol { counter-reset: list-counter; }
            .article-body ol li { counter-increment: list-counter; }
            .article-body ol li::before {
              content: counter(list-counter);
              position: absolute;
              left: 0.75rem;
              top: 0.6rem;
              background: #f97316;
              color: white;
              font-weight: 800;
              font-size: 0.75rem;
              width: 1.35rem;
              height: 1.35rem;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 1;
              text-align: center;
              padding-top: 0.05rem;
            }
            .article-body strong { color: #0f2044; font-weight: 700; }
            .article-body a { color: #f97316; text-decoration: underline; }
            .article-body blockquote {
              background: linear-gradient(135deg, #fff8f3, #fff3e8);
              border-left: 4px solid #f97316;
              border-radius: 0 12px 12px 0;
              padding: 1.25rem 1.5rem;
              margin: 1.5rem 0;
              font-size: 1.08rem;
              font-style: italic;
              color: #374151;
            }
            .article-body .stat-box {
              background: linear-gradient(135deg, #0f2044 0%, #1a3a6e 100%);
              border-radius: 14px;
              padding: 1.5rem 1.75rem;
              margin: 2rem 0;
              display: flex;
              align-items: center;
              gap: 1.25rem;
            }
            .article-body .stat-number {
              font-family: var(--font-head);
              font-size: 2.5rem;
              font-weight: 900;
              color: #f97316;
              line-height: 1;
              white-space: nowrap;
            }
            .article-body .stat-label {
              font-family: var(--font-body);
              font-size: 0.95rem;
              color: rgba(255,255,255,0.85);
              line-height: 1.5;
            }
          `}</style>
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="article-body"
          />

          <ShareButtons
            url={`https://savemyholiday.com/blog/${params.slug}`}
            title={title}
            isDE={isDE}
          />

          {/* CTA box */}
          <div style={{
            background: "linear-gradient(135deg, #0f2044 0%, #1a3a6e 100%)",
            borderRadius: 20,
            padding: "2.5rem",
            marginTop: "3rem",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: "0.78rem",
              fontWeight: 700, color: "#f97316",
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: "0.75rem",
            }}>
              {isDE ? "Jetzt kostenlos starten" : "Start for free now"}
            </div>
            <h3 style={{
              fontFamily: "var(--font-head)", fontWeight: 800,
              fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
              color: "#ffffff", lineHeight: 1.2,
              margin: "0 0 1rem",
            }}>
              {isDE
                ? "Lass SaveMyHoliday deinen Hotelpreis überwachen"
                : "Let SaveMyHoliday monitor your hotel price"}
            </h3>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.95rem",
              color: "rgba(255,255,255,0.75)", margin: "0 0 1.75rem",
            }}>
              {isDE
                ? "Kostenlos, kein Account nötig. Einfach Buchungsdaten eingeben — wir melden uns wenn der Preis sinkt."
                : "Free, no account needed. Just enter your booking details — we'll notify you when the price drops."}
            </p>
            <Link href="/#buchen" style={{
              display: "inline-block",
              background: "#f97316",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "1rem",
              padding: "0.9rem 2rem",
              borderRadius: 12,
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}>
              {isDE ? "Jetzt Preis überwachen →" : "Monitor price now →"}
            </Link>
          </div>

          {/* Keywords (for SEO) */}
          <div style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {post.keywords.map((kw) => (
              <span key={kw} style={{
                fontFamily: "var(--font-body)", fontSize: "0.75rem",
                background: "#eef1f7", color: "#4a5568",
                padding: "0.3rem 0.7rem", borderRadius: 20,
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* More articles */}
        {allPosts.length > 0 && (
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "1rem 2rem 5rem" }}>
            <h2 style={{
              fontFamily: "var(--font-head)", fontWeight: 800,
              fontSize: "1.3rem", color: "#0f2044",
              marginBottom: "1.25rem",
            }}>
              {isDE ? "Weitere Artikel" : "More articles"}
            </h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {allPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#ffffff", borderRadius: 12,
                    padding: "1.25rem 1.5rem",
                    border: "1px solid #e8ecf2",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{
                        fontFamily: "var(--font-head)", fontWeight: 700,
                        fontSize: "0.95rem", color: "#0f2044",
                        marginBottom: "0.25rem",
                      }}>
                        {isDE ? p.title.de : p.title.en}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-body)", fontSize: "0.78rem",
                        color: "#8fa3b8",
                      }}>
                        {p.readTime} {isDE ? "Min." : "min"} · {p.category}
                      </div>
                    </div>
                    <span style={{ color: "#f97316", fontSize: "1.1rem" }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>
      <Footer t={t} />

      {/* Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            datePublished: post.date,
            publisher: {
              "@type": "Organization",
              name: "SaveMyHoliday",
              url: "https://savemyholiday.com",
            },
            keywords: post.keywords.join(", "),
          }),
        }}
      />
    </>
  );
}
