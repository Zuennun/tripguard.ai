import { headers } from "next/headers";
import ResetButton from "@/components/CookieResetButton";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CookiesPage() {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;
  const t = getTranslations(locale);
  const isDe = locale === "de";

  return (
    <>
      <Navbar t={t} />
      <main style={{ background: "#f8f9fb", minHeight: "100vh", paddingTop: 84 }}>

        {/* Hero banner */}
        <div style={{ background: "#0f2044", padding: "4rem 2rem 3rem" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: "0.78rem",
              fontWeight: 700, color: "#f97316",
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}>
              {isDe ? "Rechtliches" : "Legal"}
            </div>
            <h1 style={{
              fontFamily: "var(--font-head)", fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#ffffff", lineHeight: 1.1,
              letterSpacing: "-0.02em", margin: 0,
            }}>
              {isDe ? "Cookie-Richtlinie" : "Cookie Policy"}
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.95rem",
              color: "rgba(255,255,255,0.5)", marginTop: "0.75rem",
            }}>
              SaveMyHoliday · savemyholiday.com
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 2rem 5rem" }}>
          <div style={{
            background: "#ffffff", borderRadius: 20,
            boxShadow: "0 4px 24px rgba(15,32,68,0.08)",
            padding: "2rem 1.5rem", 
          }}>

            {isDe ? (
              <>
                <Section title="1. Was sind Cookies?">
                  <p style={bodyStyle}>
                    Cookies sind kleine Textdateien, die beim Besuch einer Website auf deinem Endgerät gespeichert
                    werden. Sie ermöglichen es, dein Gerät bei einem erneuten Besuch wiederzuerkennen und
                    bestimmte Einstellungen zu speichern.
                  </p>
                </Section>

                <Divider />

                <Section title="2. Welche Cookies verwenden wir?">
                  <p style={bodyStyle}>Wir unterscheiden folgende Kategorien:</p>

                  <CookieCard
                    name="Technisch notwendige Cookies"
                    badge="Immer aktiv"
                    badgeColor="#0f2044"
                    desc="Diese Cookies sind für den Betrieb der Website zwingend erforderlich. Sie ermöglichen grundlegende Funktionen wie Navigation und Zugang zu sicheren Bereichen. Die Website kann ohne diese Cookies nicht korrekt funktionieren."
                    examples={[
                      { name: "rbs_cookie_consent", purpose: "Speichert deine Cookie-Einwilligung", duration: "1 Jahr" },
                    ]}
                  />

                  <CookieCard
                    name="Analyse-Cookies"
                    badge="Nur mit Zustimmung"
                    badgeColor="#f97316"
                    desc="Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren. Die gesammelten Informationen werden anonymisiert ausgewertet, um unseren Service zu verbessern."
                    examples={[
                      { name: "Vercel Analytics", purpose: "Anonyme Seitenaufrufe und Performance-Daten", duration: "Sitzung / 30 Tage" },
                    ]}
                  />
                </Section>

                <Divider />

                <Section title="3. Rechtsgrundlage">
                  <p style={bodyStyle}>
                    Technisch notwendige Cookies werden auf Grundlage von <strong style={{ color: "#0f2044" }}>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes Interesse) gesetzt.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Analyse-Cookies werden nur mit deiner ausdrücklichen Einwilligung gemäß <strong style={{ color: "#0f2044" }}>Art. 6 Abs. 1 lit. a DSGVO</strong> verwendet.
                  </p>
                </Section>

                <Divider />

                <Section title="4. Drittanbieter">
                  <p style={bodyStyle}>
                    Unsere Website wird über <strong style={{ color: "#0f2044" }}>Vercel</strong> gehostet. Vercel kann dabei technische Daten (z. B. IP-Adresse, Zugriffszeiten) im Rahmen des Betriebs verarbeiten.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Weitere Informationen:{" "}
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
                      style={{ color: "#f97316", textDecoration: "none" }}>
                      vercel.com/legal/privacy-policy
                    </a>
                  </p>
                </Section>

                <Divider />

                <Section title="5. Einwilligung verwalten">
                  <p style={bodyStyle}>
                    Du kannst deine Cookie-Einwilligung jederzeit widerrufen oder anpassen. Beim nächsten Besuch
                    unserer Website erscheint erneut unser Cookie-Banner, über den du deine Auswahl treffen kannst.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Um den gespeicherten Consent zurückzusetzen, kannst du in deinem Browser den
                    Local Storage für diese Domain löschen.
                  </p>
                  <ResetButton label="Cookie-Einstellungen zurücksetzen" />
                </Section>

                <Divider />

                <Section title="6. Cookies im Browser deaktivieren">
                  <p style={bodyStyle}>
                    Du kannst Cookies auch direkt in deinem Browser deaktivieren. Beachte, dass dies die
                    Funktionalität unserer Website einschränken kann.
                  </p>
                  <ul style={listStyle}>
                    <li><strong style={{ color: "#0f2044" }}>Chrome:</strong> Einstellungen → Datenschutz → Cookies</li>
                    <li><strong style={{ color: "#0f2044" }}>Firefox:</strong> Einstellungen → Datenschutz → Cookies</li>
                    <li><strong style={{ color: "#0f2044" }}>Safari:</strong> Einstellungen → Datenschutz → Cookies</li>
                    <li><strong style={{ color: "#0f2044" }}>Edge:</strong> Einstellungen → Datenschutz → Cookies</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="7. Weitere Informationen">
                  <p style={bodyStyle}>
                    Mehr zum Thema Datenschutz findest du in unserer{" "}
                    <a href="/datenschutz" style={{ color: "#f97316", textDecoration: "none" }}>Datenschutzerklärung</a>.
                    Bei Fragen erreichst du uns unter{" "}
                    <a href="mailto:hello@savemyholiday.com" style={{ color: "#f97316", textDecoration: "none" }}>
                      hello@savemyholiday.com
                    </a>.
                  </p>
                </Section>
              </>
            ) : (
              <>
                <Section title="1. What are cookies?">
                  <p style={bodyStyle}>
                    Cookies are small text files stored on your device when you visit a website. They allow
                    the website to recognise your device on return visits and remember certain preferences.
                  </p>
                </Section>

                <Divider />

                <Section title="2. Which cookies do we use?">
                  <p style={bodyStyle}>We distinguish the following categories:</p>

                  <CookieCard
                    name="Strictly Necessary Cookies"
                    badge="Always active"
                    badgeColor="#0f2044"
                    desc="These cookies are essential for the website to function. They enable basic features such as navigation and access to secure areas. The website cannot function properly without these cookies."
                    examples={[
                      { name: "rbs_cookie_consent", purpose: "Stores your cookie consent choice", duration: "1 year" },
                    ]}
                  />

                  <CookieCard
                    name="Analytics Cookies"
                    badge="Consent required"
                    badgeColor="#f97316"
                    desc="These cookies help us understand how visitors interact with our website. The information collected is analysed anonymously to help us improve our service."
                    examples={[
                      { name: "Vercel Analytics", purpose: "Anonymous page views and performance data", duration: "Session / 30 days" },
                    ]}
                  />
                </Section>

                <Divider />

                <Section title="3. Legal basis">
                  <p style={bodyStyle}>
                    Strictly necessary cookies are set on the basis of <strong style={{ color: "#0f2044" }}>Art. 6(1)(f) GDPR</strong> (legitimate interest).
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Analytics cookies are only used with your explicit consent pursuant to <strong style={{ color: "#0f2044" }}>Art. 6(1)(a) GDPR</strong>.
                  </p>
                </Section>

                <Divider />

                <Section title="4. Third-party providers">
                  <p style={bodyStyle}>
                    Our website is hosted by <strong style={{ color: "#0f2044" }}>Vercel</strong>, which may process technical data (e.g. IP address, access times) as part of its operations.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Further information:{" "}
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
                      style={{ color: "#f97316", textDecoration: "none" }}>
                      vercel.com/legal/privacy-policy
                    </a>
                  </p>
                </Section>

                <Divider />

                <Section title="5. Managing your consent">
                  <p style={bodyStyle}>
                    You can withdraw or change your cookie consent at any time. On your next visit, our cookie
                    banner will appear again and you can update your preferences.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    To reset your stored consent, you can clear the Local Storage for this domain in your browser.
                  </p>
                  <ResetButton label="Reset cookie settings" />
                </Section>

                <Divider />

                <Section title="6. Disabling cookies in your browser">
                  <p style={bodyStyle}>
                    You can also disable cookies directly in your browser. Please note that this may affect
                    the functionality of our website.
                  </p>
                  <ul style={listStyle}>
                    <li><strong style={{ color: "#0f2044" }}>Chrome:</strong> Settings → Privacy → Cookies</li>
                    <li><strong style={{ color: "#0f2044" }}>Firefox:</strong> Settings → Privacy → Cookies</li>
                    <li><strong style={{ color: "#0f2044" }}>Safari:</strong> Settings → Privacy → Cookies</li>
                    <li><strong style={{ color: "#0f2044" }}>Edge:</strong> Settings → Privacy → Cookies</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="7. Further information">
                  <p style={bodyStyle}>
                    For more on data protection, see our{" "}
                    <a href="/datenschutz" style={{ color: "#f97316", textDecoration: "none" }}>Privacy Policy</a>.
                    If you have questions, contact us at{" "}
                    <a href="mailto:hello@savemyholiday.com" style={{ color: "#f97316", textDecoration: "none" }}>
                      hello@savemyholiday.com
                    </a>.
                  </p>
                </Section>
              </>
            )}

          </div>
        </div>
      </main>
      <Footer t={t} />
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: "0.925rem",
  color: "#6b7280", lineHeight: 1.75, margin: 0,
};

const listStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontSize: "0.925rem",
  color: "#6b7280", lineHeight: 1.75,
  paddingLeft: "1.25rem", marginTop: "0.5rem", marginBottom: 0,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 0 }}>
      <h2 style={{
        fontFamily: "var(--font-head)", fontWeight: 800,
        fontSize: "1.05rem", color: "#0f2044",
        marginBottom: "1rem", marginTop: 0,
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #f0f0f0", margin: "2rem 0" }} />;
}

function CookieCard({ name, badge, badgeColor, desc, examples }: {
  name: string;
  badge: string;
  badgeColor: string;
  desc: string;
  examples: { name: string; purpose: string; duration: string }[];
}) {
  return (
    <div style={{
      background: "#f8f9fb", borderRadius: 14,
      padding: "1.25rem 1.5rem", marginTop: "1rem",
      border: "1px solid #e5e7eb",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <span style={{
          fontFamily: "var(--font-head)", fontWeight: 800,
          fontSize: "0.9rem", color: "#0f2044",
        }}>{name}</span>
        <span style={{
          background: badgeColor, color: "#ffffff",
          fontSize: "0.72rem", fontWeight: 700,
          fontFamily: "var(--font-body)",
          padding: "2px 10px", borderRadius: 20,
          letterSpacing: "0.03em",
        }}>{badge}</span>
      </div>
      <p style={{ ...bodyStyle, marginBottom: "1rem" }}>{desc}</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Name", "Zweck / Purpose", "Dauer / Duration"].map(h => (
              <th key={h} style={{
                fontFamily: "var(--font-body)", fontSize: "0.75rem",
                fontWeight: 700, color: "#9ca3af",
                textAlign: "left", padding: "4px 8px 8px",
                borderBottom: "1px solid #e5e7eb",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {examples.map(ex => (
            <tr key={ex.name}>
              <td style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#0f2044", fontWeight: 600, padding: "6px 8px" }}>{ex.name}</td>
              <td style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#6b7280", padding: "6px 8px" }}>{ex.purpose}</td>
              <td style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#6b7280", padding: "6px 8px", whiteSpace: "nowrap" }}>{ex.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

