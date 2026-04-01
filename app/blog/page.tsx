import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog & Reisetipps — SaveMyHoliday",
  description: "Tipps rund ums Sparen bei Hotelbuchungen: Preisüberwachung, flexible Tarife, Rückerstattungen und mehr.",
  keywords: "hotel tipps sparen, hotelpreis überwachen, günstig hotel buchen, reise spartipps",
};

export default function BlogPage() {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "de") as Locale;
  const t = getTranslations(locale);
  const isDE = locale === "de";
  const posts = getAllPosts();

  return (
    <>
      <Navbar t={t} />
      <main style={{ background: "#f8f9fb", minHeight: "100vh", paddingTop: 84 }}>

        {/* Hero */}
        <div style={{ background: "#0f2044", padding: "4rem 2rem 3rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: "0.78rem",
              fontWeight: 700, color: "#f97316",
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}>
              {isDE ? "Wissen & Tipps" : "Knowledge & Tips"}
            </div>
            <h1 style={{
              fontFamily: "var(--font-head)", fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#ffffff", lineHeight: 1.1,
              letterSpacing: "-0.02em", margin: "0 0 1rem",
            }}>
              {isDE ? "Blog & Reisetipps" : "Blog & Travel Tips"}
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "1.05rem",
              color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 560,
            }}>
              {isDE
                ? "Alles rund ums Sparen bei Hotelbuchungen — von Preisüberwachung bis zur cleveren Stornierung."
                : "Everything about saving on hotel bookings — from price monitoring to smart cancellations."}
            </p>
          </div>
        </div>

        {/* Article grid */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 2rem 5rem" }}>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: "none" }}
              >
                <article style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  padding: "2rem",
                  boxShadow: "0 2px 12px rgba(15,32,68,0.07)",
                  border: "1px solid #e8ecf2",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  cursor: "pointer",
                  display: "flex",
                  gap: "2rem",
                  alignItems: "flex-start",
                }}>
                  {/* Category + meta */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <span style={{
                        background: "#fff3e8", color: "#f97316",
                        fontFamily: "var(--font-body)", fontSize: "0.72rem",
                        fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.08em", padding: "0.25rem 0.6rem",
                        borderRadius: 6,
                      }}>
                        {post.category}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-body)", fontSize: "0.8rem",
                        color: "#8fa3b8",
                      }}>
                        {new Date(post.date).toLocaleDateString(isDE ? "de-DE" : "en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                        {" · "}
                        {post.readTime} {isDE ? "Min. Lesezeit" : "min read"}
                      </span>
                    </div>
                    <h2 style={{
                      fontFamily: "var(--font-head)", fontWeight: 800,
                      fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                      color: "#0f2044", lineHeight: 1.25,
                      margin: "0 0 0.6rem",
                    }}>
                      {isDE ? post.title.de : post.title.en}
                    </h2>
                    <p style={{
                      fontFamily: "var(--font-body)", fontSize: "0.92rem",
                      color: "#4a5568", lineHeight: 1.6, margin: "0 0 1rem",
                    }}>
                      {isDE ? post.description.de : post.description.en}
                    </p>
                    <span style={{
                      fontFamily: "var(--font-body)", fontSize: "0.85rem",
                      fontWeight: 700, color: "#f97316",
                    }}>
                      {isDE ? "Weiterlesen →" : "Read more →"}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

      </main>
      <Footer t={t} />
    </>
  );
}
