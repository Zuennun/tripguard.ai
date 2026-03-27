import { headers } from "next/headers";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ImpressumPage() {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;
  const t = getTranslations(locale);
  const isDe = locale === "de";

  const brandName = "SaveMyHoliday";
  const siteUrl = "savemyholiday.com";

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
              {isDe ? "Impressum" : "Legal Notice"}
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.95rem",
              color: "rgba(255,255,255,0.5)", marginTop: "0.75rem",
            }}>
              {brandName} · {siteUrl}
            </p>
          </div>
        </div>

        {/* Content card */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 2rem 5rem" }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 20,
            boxShadow: "0 4px 24px rgba(15,32,68,0.08)",
            padding: "2rem 1.5rem", 
          }}>

            {isDe ? (
              <>
                <Section title="Angaben gemäß § 5 DDG">
                  <InfoRow label="Name" value="Zünnun Ardal" />
                  <InfoRow label="Unternehmen" value="SaveMyHoliday" />
                  <InfoRow label="Adresse" value={<>Haydnstraße 26<br />12167 Berlin<br />Deutschland</>} />
                </Section>

                <Divider />

                <Section title="Kontakt">
                  <InfoRow label="E-Mail" value={
                    <a href="mailto:hello@savemyholiday.com" style={{ color: "#f97316", textDecoration: "none" }}>
                      hello@savemyholiday.com
                    </a>
                  } />
                  <InfoRow label="Telefon" value={
                    <a href="tel:+4917127909000" style={{ color: "#f97316", textDecoration: "none" }}>
                      +49 171 2790900
                    </a>
                  } />
                </Section>

                <Divider />

                <Section title="Umsatzsteuer-ID">
                  <p style={bodyStyle}>
                    Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:
                  </p>
                  <p style={{ ...bodyStyle, fontWeight: 700, color: "#0f2044", marginTop: "0.25rem" }}>
                    DE459920745
                  </p>
                </Section>

                <Divider />

                <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
                  <p style={bodyStyle}>
                    Zünnun Ardal<br />
                    Haydnstraße 26<br />
                    12167 Berlin
                  </p>
                </Section>

                <Divider />

                <Section title="Haftungsausschluss">
                  <p style={bodyStyle}>
                    Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
                    und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir
                    gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                    verantwortlich.
                  </p>
                </Section>

                <Divider />

                <Section title="Streitschlichtung">
                  <p style={bodyStyle}>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                    <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"
                      style={{ color: "#f97316", textDecoration: "none" }}>
                      https://ec.europa.eu/consumers/odr
                    </a>
                    . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                    Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </Section>
              </>
            ) : (
              <>
                <Section title="Legal Notice (Impressum)">
                  <p style={{ ...bodyStyle, color: "#9ca3af", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
                    Information pursuant to § 5 DDG (German Digital Services Act)
                  </p>
                  <InfoRow label="Name" value="Zünnun Ardal" />
                  <InfoRow label="Company" value="SaveMyHoliday (savemyholiday.com)" />
                  <InfoRow label="Address" value={<>Haydnstraße 26<br />12167 Berlin<br />Germany</>} />
                </Section>

                <Divider />

                <Section title="Contact">
                  <InfoRow label="Email" value={
                    <a href="mailto:hello@savemyholiday.com" style={{ color: "#f97316", textDecoration: "none" }}>
                      hello@savemyholiday.com
                    </a>
                  } />
                  <InfoRow label="Phone" value={
                    <a href="tel:+4917127909000" style={{ color: "#f97316", textDecoration: "none" }}>
                      +49 171 2790900
                    </a>
                  } />
                </Section>

                <Divider />

                <Section title="VAT Identification Number">
                  <p style={bodyStyle}>
                    VAT ID pursuant to § 27a of the German Value Added Tax Act (UStG):
                  </p>
                  <p style={{ ...bodyStyle, fontWeight: 700, color: "#0f2044", marginTop: "0.25rem" }}>
                    DE459920745
                  </p>
                </Section>

                <Divider />

                <Section title="Responsible for Content (§ 18 Abs. 2 MStV)">
                  <p style={bodyStyle}>
                    Zünnun Ardal<br />
                    Haydnstraße 26<br />
                    12167 Berlin, Germany
                  </p>
                </Section>

                <Divider />

                <Section title="Disclaimer">
                  <p style={bodyStyle}>
                    The contents of this website have been created with the greatest care. However, we cannot
                    guarantee the accuracy, completeness, or timeliness of the content. As a service provider,
                    we are responsible for our own content on these pages in accordance with general law
                    pursuant to § 7 para. 1 of the German Telemedia Act (TMG).
                  </p>
                </Section>

                <Divider />

                <Section title="Dispute Resolution">
                  <p style={bodyStyle}>
                    The European Commission provides a platform for online dispute resolution (ODR):{" "}
                    <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"
                      style={{ color: "#f97316", textDecoration: "none" }}>
                      https://ec.europa.eu/consumers/odr
                    </a>
                    . We are not willing or obliged to participate in dispute resolution proceedings before a
                    consumer arbitration board.
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
  fontFamily: "var(--font-body)",
  fontSize: "0.925rem",
  color: "#6b7280",
  lineHeight: 1.75,
  margin: 0,
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "140px 1fr",
      gap: "0.5rem", marginBottom: "0.6rem",
    }}>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: "0.85rem",
        fontWeight: 600, color: "#9ca3af",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: "0.925rem",
        color: "#0f2044", lineHeight: 1.6, wordBreak: "break-all",
      }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      borderTop: "1px solid #f0f0f0",
      margin: "2rem 0",
    }} />
  );
}
