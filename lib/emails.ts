// ─── Shared layout helpers ───────────────────────────────────────────────────

type EmailLocale = "de" | "en";

function formatDate(dateStr: string | undefined | null, locale: EmailLocale): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

function wrap(content: string, locale: EmailLocale = "en"): string {
  const siteUrl = "https://savemyholiday.com";
  const footerNote = locale === "de"
    ? "Du erhältst diese E-Mail, weil du eine Buchung bei SaveMyHoliday eingereicht hast."
    : "You receive this email because you submitted a booking to SaveMyHoliday.";
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>SaveMyHoliday</title>
  <style>
    :root { color-scheme: light only; }
    @media only screen and (max-width:600px){
      .email-body { padding: 0 16px !important; }
      .card       { padding: 20px !important; }
      .hide-mobile{ display:none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;-webkit-text-size-adjust:100%">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#f0f2f5;padding:32px 0">
    <tr><td align="center" style="padding:0 12px">

      <table role="presentation" cellpadding="0" cellspacing="0"
             style="width:100%;max-width:560px">

        <!-- LOGO BAR -->
        <tr>
          <td style="padding:0 0 20px;text-align:center">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto">
              <tr>
                <td style="vertical-align:middle;padding-right:8px">
                  <img src="https://savemyholiday.com/tripguard1.png" alt="SaveMyHoliday" height="32"
                       style="display:block;height:32px;width:auto;border:0" />
                </td>
                <td style="vertical-align:middle">
                  <span style="font-size:20px;font-weight:900;font-family:Arial,sans-serif;letter-spacing:-0.5px">
                    <span style="color:#f97316">Save</span><span style="color:#ffffff">My</span><span style="color:#f97316">Holiday</span>
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CARD -->
        <tr>
          <td style="background:#ffffff;border-radius:20px;overflow:hidden;
                     box-shadow:0 2px 20px rgba(15,32,68,0.08)">

            <!-- HEADER STRIPE -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#0f2044 0%,#1a3570 100%);
                           padding:28px 36px;text-align:center">
                  <span style="font-size:22px;font-weight:900;font-family:Arial,sans-serif;letter-spacing:-0.5px">
                    <span style="color:#f97316">Save</span><span style="color:#e2e8f4">My</span><span style="color:#f97316">Holiday</span>
                  </span>
                  <p style="margin:6px 0 0;color:#94a7c8;font-size:12px;font-family:Arial,sans-serif;
                             letter-spacing:2px;text-transform:uppercase">Preisüberwachung</p>
                </td>
              </tr>
            </table>

            <!-- CONTENT -->
            ${content}

            <!-- FOOTER -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e8edf5;
                           text-align:center">
                  <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;font-family:Arial,sans-serif">
                    <a href="${siteUrl}" style="color:#f97316;text-decoration:none;font-weight:600">savemyholiday.com</a>
                    &nbsp;·&nbsp; Berlin, Deutschland
                  </p>
                  <p style="margin:0;color:#cbd5e1;font-size:11px;font-family:Arial,sans-serif">
                    ${footerNote}
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f4f8;
                 color:#94a3b8;font-size:13px;font-family:Arial,sans-serif;
                 width:45%">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f4f8;
                 text-align:right;color:#0f2044;font-weight:600;
                 font-size:13px;font-family:Arial,sans-serif">${value}</td>
    </tr>`;
}

// ─── Customer confirmation email ─────────────────────────────────────────────

export function customerConfirmationEmail(data: {
  hotelName: string;
  city?: string;
  country?: string;
  checkin?: string;
  checkout?: string;
  parsedPrice: number | null;
  safeCurrency: string;
  locale?: EmailLocale;
}): string {
  const { hotelName, city, country, checkin, checkout, parsedPrice, safeCurrency, locale = "en" } = data;
  const location = [city, country].filter(Boolean).join(", ");

  const isDe = locale === "de";
  const heroTitle = isDe ? "Wir sind dran!" : "We're on it!";
  const heroBody = isDe
    ? `Deine Buchung im <strong style="color:#0f2044">${hotelName}</strong> wird jetzt rund um die Uhr überwacht.<br>Sobald wir einen günstigeren Preis für dasselbe Zimmer finden,<br>schreiben wir dir sofort — damit du sparst.`
    : `Your booking at <strong style="color:#0f2044">${hotelName}</strong> is now being monitored 24/7.<br>The moment we find a cheaper price for the same room,<br>we'll email you instantly — so you can save.`;
  const bookingLabel = isDe ? "Deine Buchung" : "Your Booking";
  const checkinLabel = isDe ? "Check-in" : "Check-in";
  const checkoutLabel = isDe ? "Check-out" : "Check-out";
  const priceLabel = isDe ? "Gebuchter Preis" : "Price you paid";
  const nextLabel = isDe ? "Was passiert als nächstes" : "What happens next";
  const step1 = isDe
    ? `Wir prüfen <strong>10+ Plattformen</strong> (Booking.com, Expedia, Hotels.com…) stündlich — für dein genaues Zimmer und deine Daten.`
    : `We scan <strong>10+ platforms</strong> (Booking.com, Expedia, Hotels.com…) every hour for your exact room and dates.`;
  const step2 = isDe
    ? `Sobald ein <strong>günstigerer Preis auftaucht</strong>, bekommst du eine E-Mail mit dem neuen Preis und einem direkten Umbuchungslink.`
    : `The moment a <strong>cheaper rate appears</strong>, you get an email with the new price and a direct rebook link.`;
  const step3 = isDe
    ? `Du <strong>stornierst &amp; buchst neu</strong> zum günstigeren Preis. Die Differenz gehört dir — fertig.`
    : `You <strong>cancel &amp; rebook</strong> at the lower price. Pocket the difference — done.`;
  const tipText = isDe
    ? `<strong>💡 Tipp:</strong> Stelle sicher, dass deine Buchung <strong>kostenlos stornierbar</strong> ist — so kannst du jederzeit neu buchen, wenn wir einen besseren Preis finden.`
    : `<strong>💡 Tip:</strong> Make sure your booking is <strong>free cancellation</strong> — that way you can always rebook without losing money if we find a better price.`;

  return wrap(`
    <!-- HERO -->
    <tr>
      <td class="card" style="padding:36px 36px 28px;text-align:center">
        <div style="width:64px;height:64px;background:#fff3e8;border-radius:16px;
                    margin:0 auto 20px;line-height:64px;font-size:32px">🛎️</div>
        <h1 style="margin:0 0 12px;color:#0f2044;font-size:26px;font-weight:900;
                   font-family:Arial,sans-serif;line-height:1.2;letter-spacing:-0.5px">
          ${heroTitle}
        </h1>
        <p style="margin:0;color:#64748b;font-size:15px;line-height:1.7;
                  font-family:Arial,sans-serif;max-width:400px;margin:0 auto">
          ${heroBody}
        </p>
      </td>
    </tr>

    <!-- BOOKING CARD -->
    <tr>
      <td class="email-body" style="padding:0 36px 28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="background:#f8fafc;border-radius:14px;border:1px solid #e8edf5">
          <tr><td class="card" style="padding:22px 24px">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#94a3b8;
                      text-transform:uppercase;letter-spacing:1.5px;
                      font-family:Arial,sans-serif">${bookingLabel}</p>
            <p style="margin:0 0 2px;font-size:19px;font-weight:800;color:#0f2044;
                      font-family:Arial,sans-serif;letter-spacing:-0.3px">${hotelName}</p>
            ${location ? `<p style="margin:0 0 16px;color:#94a3b8;font-size:13px;font-family:Arial,sans-serif">📍 ${location}</p>` : `<p style="margin:0 0 16px"></p>`}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row(checkinLabel, formatDate(checkin, locale))}
              ${row(checkoutLabel, formatDate(checkout, locale))}
              ${row(priceLabel, parsedPrice ? `<span style="color:#f97316;font-size:15px;font-weight:700">${parsedPrice} ${safeCurrency}</span>` : "—")}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- STEPS -->
    <tr>
      <td class="email-body" style="padding:0 36px 28px">
        <p style="margin:0 0 16px;font-size:10px;font-weight:700;color:#94a3b8;
                  text-transform:uppercase;letter-spacing:1.5px;
                  font-family:Arial,sans-serif">${nextLabel}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="vertical-align:top;width:36px;padding-top:1px">
              <div style="width:26px;height:26px;background:#f97316;border-radius:8px;
                          text-align:center;line-height:26px;color:#fff;
                          font-weight:800;font-size:13px;font-family:Arial,sans-serif">1</div>
            </td>
            <td style="padding:0 0 16px 10px;color:#374151;font-size:14px;line-height:1.65;
                       font-family:Arial,sans-serif">${step1}</td>
          </tr>
          <tr>
            <td style="vertical-align:top;width:36px;padding-top:1px">
              <div style="width:26px;height:26px;background:#f97316;border-radius:8px;
                          text-align:center;line-height:26px;color:#fff;
                          font-weight:800;font-size:13px;font-family:Arial,sans-serif">2</div>
            </td>
            <td style="padding:0 0 16px 10px;color:#374151;font-size:14px;line-height:1.65;
                       font-family:Arial,sans-serif">${step2}</td>
          </tr>
          <tr>
            <td style="vertical-align:top;width:36px;padding-top:1px">
              <div style="width:26px;height:26px;background:#f97316;border-radius:8px;
                          text-align:center;line-height:26px;color:#fff;
                          font-weight:800;font-size:13px;font-family:Arial,sans-serif">3</div>
            </td>
            <td style="padding:0 0 0 10px;color:#374151;font-size:14px;line-height:1.65;
                       font-family:Arial,sans-serif">${step3}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- TIP BOX -->
    <tr>
      <td class="email-body" style="padding:0 36px 36px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="background:#fff7ed;border-radius:12px;border:1px solid #fed7aa">
          <tr><td style="padding:16px 20px">
            <p style="margin:0;color:#92400e;font-size:13px;line-height:1.65;
                      font-family:Arial,sans-serif">
              ${tipText}
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  `, locale);
}

// ─── Founder notification email ──────────────────────────────────────────────

export function founderNotificationEmail(data: {
  hotelName: string;
  city?: string;
  country?: string;
  roomType?: string;
  checkin?: string;
  checkout?: string;
  parsedPrice: number | null;
  safeCurrency: string;
  parsedRooms: number;
  parsedAdults: number;
  parsedChildren: number;
  email: string;
  locale?: EmailLocale;
}): string {
  const {
    hotelName, city, country, roomType, checkin, checkout,
    parsedPrice, safeCurrency, parsedRooms, parsedAdults, parsedChildren, email, locale = "en",
  } = data;
  const location = [city, country].filter(Boolean).join(", ");

  return wrap(`
    <!-- ALERT BADGE -->
    <tr>
      <td class="card" style="padding:24px 32px 20px">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;padding-right:12px;font-size:28px">🏨</td>
            <td style="vertical-align:middle">
              <p style="margin:0 0 2px;font-size:18px;font-weight:800;color:#0f2044;
                        font-family:Arial,sans-serif">New booking tracked!</p>
              <p style="margin:0;font-size:13px;color:#8892a4;font-family:Arial,sans-serif">
                Submitted just now
              </p>
            </td>
            <td style="vertical-align:middle;text-align:right" class="hide-mobile">
              <span style="background:#f97316;color:#fff;font-size:11px;font-weight:700;
                           padding:4px 12px;border-radius:20px;font-family:Arial,sans-serif">
                NEW
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BOOKING DETAILS -->
    <tr>
      <td class="email-body" style="padding:0 32px 20px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="background:#f8f9fb;border-radius:10px">
          <tr><td class="card" style="padding:20px 24px">
            <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#0f2044;
                      font-family:Arial,sans-serif">${hotelName}</p>
            ${location ? `<p style="margin:0 0 14px;color:#8892a4;font-size:13px;font-family:Arial,sans-serif">📍 ${location}</p>` : `<p style="margin:0 0 14px"></p>`}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row("Check-in", checkin || "—")}
              ${row("Check-out", checkout || "—")}
              ${row("Room type", roomType || "—")}
              ${row("Rooms / Adults / Kids", `${parsedRooms} / ${parsedAdults} / ${parsedChildren}`)}
              ${row("Price paid", parsedPrice ? `<span style="color:#f97316;font-weight:700;font-size:15px">${parsedPrice} ${safeCurrency}</span>` : "—")}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- USER EMAIL -->
    <tr>
      <td class="email-body" style="padding:0 32px 28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="background:#fff3e8;border-radius:10px;border-left:4px solid #f97316">
          <tr><td style="padding:14px 20px">
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#9ba5b4;
                      text-transform:uppercase;letter-spacing:1px;
                      font-family:Arial,sans-serif">Customer Email</p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#0f2044;
                      font-family:Arial,sans-serif">${email}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  `, locale);
}

// ─── Price alert email ────────────────────────────────────────────────────────

export function priceAlertEmail(data: {
  hotelName: string;
  city?: string | null;
  country?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  originalPrice: number;
  newPrice: number;
  currency: string;
  source: string;
  bookingUrl: string;
  locale?: EmailLocale;
}): string {
  const { hotelName, city, country, checkin, checkout, originalPrice, newPrice, currency, source, bookingUrl, locale = "en" } = data;
  const location = [city, country].filter(Boolean).join(", ");
  const savings = (originalPrice - newPrice).toFixed(2);
  const pct = Math.round(((originalPrice - newPrice) / originalPrice) * 100);
  const isDe = locale === "de";

  return wrap(`
    <!-- SAVINGS BANNER -->
    <tr>
      <td style="background:linear-gradient(135deg,#059669 0%,#047857 100%);
                 padding:28px 36px;text-align:center">
        <p style="margin:0 0 4px;color:#a7f3d0;font-size:11px;font-weight:700;
                  letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">
          ${isDe ? "Preisalarm" : "Price Alert"}
        </p>
        <p style="margin:0 0 8px;color:#ffffff;font-size:28px;font-weight:900;
                  font-family:Arial,sans-serif;letter-spacing:-1px">
          ${isDe ? `Du sparst ${savings} ${currency}!` : `Save ${savings} ${currency}!`}
        </p>
        <p style="margin:0;color:#a7f3d0;font-size:14px;font-family:Arial,sans-serif">
          ${isDe ? `Günstiger Preis für ${hotelName} gefunden` : `Lower price found for ${hotelName}`}
        </p>
      </td>
    </tr>

    <!-- PRICE COMPARISON -->
    <tr>
      <td class="email-body" style="padding:28px 36px 24px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="background:#f8fafc;border-radius:14px;border:1px solid #e8edf5">
          <tr><td class="card" style="padding:22px 24px">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#94a3b8;
                      text-transform:uppercase;letter-spacing:1.5px;
                      font-family:Arial,sans-serif">${isDe ? "Preisvergleich" : "Price Comparison"}</p>
            <p style="margin:0 0 2px;font-size:19px;font-weight:800;color:#0f2044;
                      font-family:Arial,sans-serif;letter-spacing:-0.3px">${hotelName}</p>
            ${location ? `<p style="margin:0 0 16px;color:#94a3b8;font-size:13px;font-family:Arial,sans-serif">📍 ${location}</p>` : `<p style="margin:0 0 16px"></p>`}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row("Check-in", formatDate(checkin, locale))}
              ${row("Check-out", formatDate(checkout, locale))}
              ${row(isDe ? "Dein gebuchter Preis" : "Your booked price", `<span style="text-decoration:line-through;color:#94a3b8">${originalPrice} ${currency}</span>`)}
              ${row(isDe ? `Neuer Preis (${source})` : `New price (${source})`, `<span style="color:#059669;font-size:16px;font-weight:800">${newPrice} ${currency}</span>`)}
              ${row(isDe ? "Du sparst" : "You save", `<span style="color:#f97316;font-size:15px;font-weight:700">${savings} ${currency} &nbsp;(${pct}%)</span>`)}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td class="email-body" style="padding:0 36px 36px;text-align:center">
        <a href="${bookingUrl}"
           style="display:inline-block;background:#f97316;color:#ffffff;
                  text-decoration:none;padding:16px 36px;border-radius:12px;
                  font-family:Arial,sans-serif;font-size:16px;font-weight:800;
                  letter-spacing:-0.3px">
          ${isDe ? `Jetzt buchen — ${newPrice} ${currency} →` : `Book Now — ${newPrice} ${currency} →`}
        </a>
        <p style="margin:14px 0 0;color:#94a3b8;font-size:12px;font-family:Arial,sans-serif">
          ${isDe ? "Storniere zuerst deine aktuelle Buchung — am besten nur bei kostenloser Stornierung." : "Cancel your current booking first — only if it's free cancellation."}
        </p>
      </td>
    </tr>
  `, locale);
}
