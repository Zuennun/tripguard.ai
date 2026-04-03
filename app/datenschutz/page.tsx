import { headers } from "next/headers";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DatenschutzPage() {
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
              {isDe ? "Datenschutzerklärung" : "Privacy Policy"}
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.95rem",
              color: "rgba(255,255,255,0.5)", marginTop: "0.75rem",
            }}>
              SaveMyHoliday · rebookandsave.com
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
                <Section title="1. Verantwortlicher">
                  <InfoRow label="Name" value="Zünnun Ardal" />
                  <InfoRow label="Unternehmen" value="SaveMyHoliday" />
                  <InfoRow label="Adresse" value={<>Haydnstraße 26<br />12167 Berlin<br />Deutschland</>} />
                  <InfoRow label="E-Mail" value={
                    <a href="mailto:hello@savemyholiday.com" style={{ color: "#f97316", textDecoration: "none" }}>
                      hello@savemyholiday.com
                    </a>
                  } />
                </Section>

                <Divider />

                <Section title="2. Allgemeine Hinweise zur Datenverarbeitung">
                  <p style={bodyStyle}>
                    Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Ihre personenbezogenen Daten werden
                    vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser
                    Datenschutzerklärung behandelt.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                  </p>
                </Section>

                <Divider />

                <Section title="3. Datenerfassung auf unserer Website">
                  <h3 style={subHeadStyle}>3.1 Server-Log-Dateien</h3>
                  <p style={bodyStyle}>
                    Beim Besuch unserer Website werden automatisch Informationen durch den Hosting-Provider erfasst:
                  </p>
                  <ul style={listStyle}>
                    <li>IP-Adresse</li>
                    <li>Browsertyp und Version</li>
                    <li>verwendetes Betriebssystem</li>
                    <li>Referrer URL</li>
                    <li>Uhrzeit der Serveranfrage</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Diese Daten werden nicht mit anderen Datenquellen zusammengeführt.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    <strong style={{ color: "#0f2044" }}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
                    (berechtigtes Interesse an technisch fehlerfreier Darstellung)
                  </p>
                </Section>

                <Divider />

                <Section title="4. Hosting über Vercel">
                  <p style={bodyStyle}>
                    Unsere Website wird bei Vercel gehostet. Vercel kann personenbezogene Daten verarbeiten, insbesondere:
                  </p>
                  <ul style={listStyle}>
                    <li>IP-Adresse</li>
                    <li>Log-Daten</li>
                    <li>technische Metadaten</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.5rem" }}>
                    Weitere Informationen:{" "}
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
                      style={{ color: "#f97316", textDecoration: "none" }}>
                      vercel.com/legal/privacy-policy
                    </a>
                  </p>
                </Section>

                <Divider />

                <Section title="5. Kontaktaufnahme">
                  <p style={bodyStyle}>
                    Wenn Sie uns per E-Mail oder Formular kontaktieren, werden Ihre Angaben gespeichert zur
                    Bearbeitung Ihrer Anfrage. Gespeicherte Daten:
                  </p>
                  <ul style={listStyle}>
                    <li>Name (optional)</li>
                    <li>E-Mail-Adresse</li>
                    <li>eingegebene Inhalte</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.5rem" }}>
                    <strong style={{ color: "#0f2044" }}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
                  </p>
                </Section>

                <Divider />

                <Section title="6. Nutzung unseres Dienstes (Preis-Tracking)">
                  <p style={bodyStyle}>Wenn Sie unseren Service nutzen, verarbeiten wir folgende Daten:</p>
                  <ul style={listStyle}>
                    <li>Hotelinformationen</li>
                    <li>Reisedaten</li>
                    <li>Preisangaben</li>
                    <li>ggf. eingegebene Buchungsdaten</li>
                    <li>E-Mail-Adresse</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    <strong style={{ color: "#0f2044" }}>Zweck der Verarbeitung:</strong> Preisüberwachung,
                    Benachrichtigung bei Preisänderungen, Verbesserung unseres Services.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.5rem" }}>
                    <strong style={{ color: "#0f2044" }}>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
                  </p>
                </Section>

                <Divider />

                <Section title="7. E-Mail-Benachrichtigungen">
                  <p style={bodyStyle}>
                    Wenn Sie sich für unseren Service registrieren, senden wir Ihnen Preisupdates und
                    Serviceinformationen. Sie können sich jederzeit abmelden.
                  </p>
                </Section>

                <Divider />

                <Section title="8. Cookies und Tracking">
                  <p style={bodyStyle}>
                    Unsere Website verwendet derzeit nur technisch notwendige Cookies. Sollten Analyse- oder
                    Marketing-Tools eingesetzt werden, erfolgt dies nur nach Einwilligung gemäß
                    Art. 6 Abs. 1 lit. a DSGVO.
                  </p>
                </Section>

                <Divider />

                <Section title="9. Datenweitergabe an Dritte">
                  <p style={bodyStyle}>Ihre Daten werden nur weitergegeben, wenn:</p>
                  <ul style={listStyle}>
                    <li>dies zur Vertragserfüllung notwendig ist</li>
                    <li>eine gesetzliche Verpflichtung besteht</li>
                    <li>Sie eingewilligt haben</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="10. Speicherdauer">
                  <p style={bodyStyle}>
                    Ihre personenbezogenen Daten werden nur so lange gespeichert, wie es für die jeweiligen
                    Zwecke erforderlich ist.
                  </p>
                </Section>

                <Divider />

                <Section title="11. Ihre Rechte">
                  <p style={bodyStyle}>Sie haben jederzeit das Recht auf:</p>
                  <ul style={listStyle}>
                    <li>Auskunft über Ihre Daten</li>
                    <li>Berichtigung</li>
                    <li>Löschung</li>
                    <li>Einschränkung der Verarbeitung</li>
                    <li>Widerspruch</li>
                    <li>Datenübertragbarkeit</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="12. Widerruf Ihrer Einwilligung">
                  <p style={bodyStyle}>
                    Sie können eine erteilte Einwilligung jederzeit widerrufen.
                  </p>
                </Section>

                <Divider />

                <Section title="13. Beschwerderecht">
                  <p style={bodyStyle}>
                    Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
                  </p>
                </Section>

                <Divider />

                <Section title="14. Datensicherheit">
                  <p style={bodyStyle}>
                    Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten vor unbefugtem
                    Zugriff, Verlust oder Missbrauch zu schützen.
                  </p>
                </Section>
              </>
            ) : (
              <>
                <Section title="1. Data Controller">
                  <InfoRow label="Name" value="Zünnun Ardal" />
                  <InfoRow label="Company" value="SaveMyHoliday" />
                  <InfoRow label="Address" value={<>Haydnstraße 26<br />12167 Berlin<br />Germany</>} />
                  <InfoRow label="Email" value={
                    <a href="mailto:hello@savemyholiday.com" style={{ color: "#f97316", textDecoration: "none" }}>
                      hello@savemyholiday.com
                    </a>
                  } />
                </Section>

                <Divider />

                <Section title="2. General Information on Data Processing">
                  <p style={bodyStyle}>
                    We take the protection of your personal data very seriously. Your personal data is treated
                    confidentially and in accordance with the statutory data protection regulations and this
                    privacy policy.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Personal data is any data by which you can be personally identified.
                  </p>
                </Section>

                <Divider />

                <Section title="3. Data Collection on Our Website">
                  <h3 style={subHeadStyle}>3.1 Server Log Files</h3>
                  <p style={bodyStyle}>
                    When you visit our website, the hosting provider automatically collects the following information:
                  </p>
                  <ul style={listStyle}>
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Operating system used</li>
                    <li>Referrer URL</li>
                    <li>Time of the server request</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    This data is not merged with other data sources.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    <strong style={{ color: "#0f2044" }}>Legal basis:</strong> Art. 6(1)(f) GDPR
                    (legitimate interest in technically error-free presentation)
                  </p>
                </Section>

                <Divider />

                <Section title="4. Hosting via Vercel">
                  <p style={bodyStyle}>
                    Our website is hosted by Vercel. Vercel may process personal data, in particular:
                  </p>
                  <ul style={listStyle}>
                    <li>IP address</li>
                    <li>Log data</li>
                    <li>Technical metadata</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Processing is based on Art. 6(1)(f) GDPR.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.5rem" }}>
                    Further information:{" "}
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
                      style={{ color: "#f97316", textDecoration: "none" }}>
                      vercel.com/legal/privacy-policy
                    </a>
                  </p>
                </Section>

                <Divider />

                <Section title="5. Contact">
                  <p style={bodyStyle}>
                    If you contact us by email or via a form, your details will be stored to process your request.
                    Data stored:
                  </p>
                  <ul style={listStyle}>
                    <li>Name (optional)</li>
                    <li>Email address</li>
                    <li>Message content</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    We will not pass on this data without your consent.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.5rem" }}>
                    <strong style={{ color: "#0f2044" }}>Legal basis:</strong> Art. 6(1)(b) GDPR
                  </p>
                </Section>

                <Divider />

                <Section title="6. Use of Our Service (Price Tracking)">
                  <p style={bodyStyle}>When you use our service, we process the following data:</p>
                  <ul style={listStyle}>
                    <li>Hotel information</li>
                    <li>Travel dates</li>
                    <li>Price details</li>
                    <li>Booking data entered (if applicable)</li>
                    <li>Email address</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    <strong style={{ color: "#0f2044" }}>Purpose:</strong> Price monitoring, notification of
                    price changes, improvement of our service.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.5rem" }}>
                    <strong style={{ color: "#0f2044" }}>Legal basis:</strong> Art. 6(1)(b) GDPR
                  </p>
                </Section>

                <Divider />

                <Section title="7. Email Notifications">
                  <p style={bodyStyle}>
                    When you register for our service, we will send you price updates and service information.
                    You can unsubscribe at any time.
                  </p>
                </Section>

                <Divider />

                <Section title="8. Cookies and Tracking">
                  <p style={bodyStyle}>
                    Our website currently uses only technically necessary cookies. Should analysis or marketing
                    tools be used, this will only be done with your consent pursuant to Art. 6(1)(a) GDPR.
                  </p>
                </Section>

                <Divider />

                <Section title="9. Disclosure to Third Parties">
                  <p style={bodyStyle}>Your data will only be passed on if:</p>
                  <ul style={listStyle}>
                    <li>it is necessary for the fulfilment of the contract</li>
                    <li>there is a legal obligation</li>
                    <li>you have given your consent</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="10. Retention Period">
                  <p style={bodyStyle}>
                    Your personal data will only be stored for as long as necessary for the respective purposes.
                  </p>
                </Section>

                <Divider />

                <Section title="11. Your Rights">
                  <p style={bodyStyle}>You have the right at any time to:</p>
                  <ul style={listStyle}>
                    <li>Request information about your data</li>
                    <li>Request correction</li>
                    <li>Request deletion</li>
                    <li>Request restriction of processing</li>
                    <li>Object to processing</li>
                    <li>Data portability</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="12. Withdrawal of Consent">
                  <p style={bodyStyle}>
                    You may withdraw any consent you have given at any time.
                  </p>
                </Section>

                <Divider />

                <Section title="13. Right to Lodge a Complaint">
                  <p style={bodyStyle}>
                    You have the right to lodge a complaint with a data protection supervisory authority.
                  </p>
                </Section>

                <Divider />

                <Section title="14. Data Security">
                  <p style={bodyStyle}>
                    We implement technical and organisational measures to protect your data against unauthorised
                    access, loss or misuse.
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

const subHeadStyle: React.CSSProperties = {
  fontFamily: "var(--font-head)",
  fontWeight: 700,
  fontSize: "0.95rem",
  color: "#0f2044",
  marginBottom: "0.75rem",
  marginTop: "1rem",
};

const listStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.925rem",
  color: "#6b7280",
  lineHeight: 1.75,
  paddingLeft: "1.25rem",
  marginTop: "0.5rem",
  marginBottom: 0,
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
