import { headers } from "next/headers";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AgbPage() {
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
              {isDe ? "Allgemeine Geschäftsbedingungen" : "Terms and Conditions"}
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.95rem",
              color: "rgba(255,255,255,0.5)", marginTop: "0.75rem",
            }}>
              SaveMyHoliday · savemyholiday.com
            </p>
          </div>
        </div>

        {/* Content card */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 2rem 5rem" }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 20,
            boxShadow: "0 4px 24px rgba(15,32,68,0.08)",
            padding: "2.5rem 3rem",
          }}>

            {isDe ? (
              <>
                <Section title="1. Geltungsbereich">
                  <p style={bodyStyle}>
                    Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung des Online-Dienstes
                    „SaveMyHoliday", betrieben von:
                  </p>
                  <div style={{ ...bodyStyle, marginTop: "1rem", lineHeight: 2 }}>
                    Zünnun Ardal<br />
                    SaveMyHoliday<br />
                    Haydnstraße 26<br />
                    12167 Berlin<br />
                    Deutschland
                  </div>
                  <p style={{ ...bodyStyle, marginTop: "1rem" }}>
                    Die AGB gelten für alle Nutzer der Website sowie der angebotenen digitalen Dienstleistungen.
                  </p>
                </Section>

                <Divider />

                <Section title="2. Leistungsbeschreibung">
                  <p style={bodyStyle}>
                    SaveMyHoliday stellt einen digitalen Service zur Verfügung, mit dem Nutzer Hotelpreise
                    nach einer Buchung überwachen können. Der Service umfasst insbesondere:
                  </p>
                  <ul style={listStyle}>
                    <li>Erfassung von Reise- und Buchungsdaten</li>
                    <li>Analyse von Preisentwicklungen</li>
                    <li>Benachrichtigung über Preisänderungen</li>
                    <li>optionale Hinweise zu möglichen Einsparungen</li>
                    <li>ggf. Empfehlungen zu Drittanbietern (z. B. Buchungsplattformen oder Aktivitäten)</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    SaveMyHoliday ist kein Reiseveranstalter, Vermittler oder Anbieter von Unterkünften.
                  </p>
                </Section>

                <Divider />

                <Section title="3. Nutzung des Dienstes">
                  <p style={bodyStyle}>
                    Die Nutzung des Dienstes erfolgt freiwillig und auf eigene Verantwortung. Der Nutzer verpflichtet sich:
                  </p>
                  <ul style={listStyle}>
                    <li>ausschließlich wahrheitsgemäße Angaben zu machen</li>
                    <li>keine rechtswidrigen Inhalte zu übermitteln</li>
                    <li>keine personenbezogenen Daten Dritter ohne Berechtigung einzugeben</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="4. Kein Garantieversprechen">
                  <p style={bodyStyle}>
                    Die von SaveMyHoliday bereitgestellten Informationen erfolgen ohne Gewähr.
                    Insbesondere wird keine Garantie übernommen für:
                  </p>
                  <ul style={listStyle}>
                    <li>die Richtigkeit von Preisangaben</li>
                    <li>die Verfügbarkeit von Unterkünften</li>
                    <li>das Eintreten von Preisänderungen</li>
                    <li>das tatsächliche Einsparpotenzial</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="5. Haftung">
                  <p style={bodyStyle}>
                    SaveMyHoliday haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten
                    beruhen. Bei einfacher Fahrlässigkeit haftet SaveMyHoliday nur bei Verletzung wesentlicher
                    Vertragspflichten (Kardinalpflichten). Die Haftung ist auf den vorhersehbaren,
                    typischerweise eintretenden Schaden begrenzt.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Eine Haftung für folgende Schäden ist ausgeschlossen, soweit gesetzlich zulässig:
                  </p>
                  <ul style={listStyle}>
                    <li>entgangener Gewinn</li>
                    <li>mittelbare Schäden</li>
                    <li>Datenverlust</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="6. Haftungsausschluss bei Umbuchungen und Preisänderungen">
                  <p style={bodyStyle}>
                    Die durch SaveMyHoliday bereitgestellten Informationen, insbesondere zu Preisentwicklungen
                    und möglichen Einsparungen, dienen ausschließlich als unverbindliche Hinweise.
                    Die Entscheidung, eine bestehende Buchung zu stornieren, umzubuchen oder neu vorzunehmen,
                    liegt ausschließlich beim Nutzer.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    SaveMyHoliday übernimmt insbesondere keine Haftung für:
                  </p>
                  <ul style={listStyle}>
                    <li>nicht mehr verfügbare Unterkünfte nach einer Stornierung</li>
                    <li>Preisänderungen zwischen Anzeige und erneuter Buchung</li>
                    <li>abweichende Buchungsbedingungen von Drittanbietern</li>
                    <li>Verluste, Mehrkosten oder sonstige Nachteile, die durch Umbuchungen entstehen</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Dem Nutzer ist bewusst, dass Preise und Verfügbarkeiten von Drittanbietern jederzeit
                    variieren können und nicht von SaveMyHoliday beeinflusst werden.
                  </p>
                </Section>

                <Divider />

                <Section title="7. Verfügbarkeit des Dienstes">
                  <p style={bodyStyle}>
                    SaveMyHoliday bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit des Dienstes.
                    Ein Anspruch auf permanente Verfügbarkeit oder fehlerfreie Funktion besteht nicht.
                  </p>
                </Section>

                <Divider />

                <Section title="8. Änderungen des Dienstes">
                  <p style={bodyStyle}>SaveMyHoliday behält sich das Recht vor:</p>
                  <ul style={listStyle}>
                    <li>Funktionen zu ändern</li>
                    <li>den Service zu erweitern oder einzuschränken</li>
                    <li>den Dienst ganz oder teilweise einzustellen</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="9. E-Mail-Kommunikation">
                  <p style={bodyStyle}>
                    Durch die Nutzung des Dienstes erklärt sich der Nutzer damit einverstanden, E-Mails zu
                    erhalten, die für die Nutzung des Services erforderlich sind. Hierzu zählen insbesondere:
                  </p>
                  <ul style={listStyle}>
                    <li>Preisbenachrichtigungen</li>
                    <li>Service- und Systemnachrichten</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="10. Drittanbieter und externe Links">
                  <p style={bodyStyle}>
                    SaveMyHoliday kann Links zu externen Websites oder Diensten enthalten. Für Inhalte, Preise,
                    Verfügbarkeiten oder Bedingungen dieser Drittanbieter übernimmt SaveMyHoliday keine
                    Verantwortung.
                  </p>
                </Section>

                <Divider />

                <Section title="11. Kündigung und Sperrung">
                  <p style={bodyStyle}>
                    Nutzer können die Nutzung des Dienstes jederzeit beenden. SaveMyHoliday behält sich das
                    Recht vor, Nutzer bei Verstößen gegen diese AGB zu sperren oder den Zugang einzuschränken.
                  </p>
                </Section>

                <Divider />

                <Section title="12. Datenschutz">
                  <p style={bodyStyle}>
                    Die Verarbeitung personenbezogener Daten erfolgt gemäß der{" "}
                    <a href="/datenschutz" style={{ color: "#f97316", textDecoration: "none" }}>
                      Datenschutzerklärung
                    </a>{" "}
                    von SaveMyHoliday.
                  </p>
                </Section>

                <Divider />

                <Section title="13. Schlussbestimmungen">
                  <p style={bodyStyle}>
                    Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser AGB
                    ganz oder teilweise unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen
                    unberührt.
                  </p>
                </Section>
              </>
            ) : (
              <>
                <Section title="1. Scope">
                  <p style={bodyStyle}>
                    These Terms and Conditions govern the use of the online service "SaveMyHoliday", operated by:
                  </p>
                  <div style={{ ...bodyStyle, marginTop: "1rem", lineHeight: 2 }}>
                    Zünnun Ardal<br />
                    SaveMyHoliday<br />
                    Haydnstraße 26<br />
                    12167 Berlin<br />
                    Germany
                  </div>
                  <p style={{ ...bodyStyle, marginTop: "1rem" }}>
                    These Terms apply to all users of the website and the digital services offered.
                  </p>
                </Section>

                <Divider />

                <Section title="2. Service Description">
                  <p style={bodyStyle}>
                    SaveMyHoliday provides a digital service that allows users to monitor hotel prices after
                    a booking. The service includes in particular:
                  </p>
                  <ul style={listStyle}>
                    <li>Collection of travel and booking data</li>
                    <li>Analysis of price developments</li>
                    <li>Notification of price changes</li>
                    <li>Optional hints on potential savings</li>
                    <li>Recommendations for third-party providers (e.g. booking platforms or activities)</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    SaveMyHoliday is not a tour operator, intermediary, or accommodation provider.
                  </p>
                </Section>

                <Divider />

                <Section title="3. Use of the Service">
                  <p style={bodyStyle}>
                    Use of the service is voluntary and at the user's own responsibility. The user agrees to:
                  </p>
                  <ul style={listStyle}>
                    <li>provide only truthful information</li>
                    <li>not transmit any unlawful content</li>
                    <li>not enter personal data of third parties without authorisation</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="4. No Guarantee">
                  <p style={bodyStyle}>
                    The information provided by SaveMyHoliday is provided without warranty.
                    In particular, no guarantee is given for:
                  </p>
                  <ul style={listStyle}>
                    <li>the accuracy of price information</li>
                    <li>the availability of accommodation</li>
                    <li>the occurrence of price changes</li>
                    <li>the actual savings potential</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="5. Liability">
                  <p style={bodyStyle}>
                    SaveMyHoliday is only liable for damages resulting from intentional or grossly negligent
                    conduct. In cases of simple negligence, SaveMyHoliday is only liable for breaches of
                    material contractual obligations (cardinal obligations). Liability is limited to
                    foreseeable, typically occurring damage.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    Liability for the following is excluded to the extent permitted by law:
                  </p>
                  <ul style={listStyle}>
                    <li>loss of profit</li>
                    <li>indirect damages</li>
                    <li>data loss</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="6. Disclaimer for Rebookings and Price Changes">
                  <p style={bodyStyle}>
                    The information provided by SaveMyHoliday, in particular regarding price developments and
                    potential savings, serves exclusively as non-binding guidance. The decision to cancel,
                    rebook or make a new booking rests solely with the user.
                  </p>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    SaveMyHoliday accepts no liability in particular for:
                  </p>
                  <ul style={listStyle}>
                    <li>accommodation no longer available after cancellation</li>
                    <li>price changes between display and re-booking</li>
                    <li>differing booking conditions of third-party providers</li>
                    <li>losses, additional costs or other disadvantages arising from rebookings</li>
                  </ul>
                  <p style={{ ...bodyStyle, marginTop: "0.75rem" }}>
                    The user is aware that prices and availability from third-party providers may vary at
                    any time and are not influenced by SaveMyHoliday.
                  </p>
                </Section>

                <Divider />

                <Section title="7. Service Availability">
                  <p style={bodyStyle}>
                    SaveMyHoliday strives for the most uninterrupted availability of the service possible.
                    There is no entitlement to permanent availability or error-free operation.
                  </p>
                </Section>

                <Divider />

                <Section title="8. Changes to the Service">
                  <p style={bodyStyle}>SaveMyHoliday reserves the right to:</p>
                  <ul style={listStyle}>
                    <li>modify features</li>
                    <li>expand or restrict the service</li>
                    <li>discontinue the service in whole or in part</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="9. Email Communication">
                  <p style={bodyStyle}>
                    By using the service, the user agrees to receive emails necessary for the use of the
                    service. These include in particular:
                  </p>
                  <ul style={listStyle}>
                    <li>Price notifications</li>
                    <li>Service and system messages</li>
                  </ul>
                </Section>

                <Divider />

                <Section title="10. Third-Party Providers and External Links">
                  <p style={bodyStyle}>
                    SaveMyHoliday may contain links to external websites or services. SaveMyHoliday accepts
                    no responsibility for the content, prices, availability or conditions of these
                    third-party providers.
                  </p>
                </Section>

                <Divider />

                <Section title="11. Termination and Blocking">
                  <p style={bodyStyle}>
                    Users may stop using the service at any time. SaveMyHoliday reserves the right to block
                    users or restrict access in the event of violations of these Terms.
                  </p>
                </Section>

                <Divider />

                <Section title="12. Privacy">
                  <p style={bodyStyle}>
                    The processing of personal data is carried out in accordance with the{" "}
                    <a href="/datenschutz" style={{ color: "#f97316", textDecoration: "none" }}>
                      Privacy Policy
                    </a>{" "}
                    of SaveMyHoliday.
                  </p>
                </Section>

                <Divider />

                <Section title="13. Final Provisions">
                  <p style={bodyStyle}>
                    The law of the Federal Republic of Germany applies. Should individual provisions of these
                    Terms be wholly or partially invalid, the validity of the remaining provisions shall not
                    be affected.
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
        color: "#0f2044", lineHeight: 1.6,
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
