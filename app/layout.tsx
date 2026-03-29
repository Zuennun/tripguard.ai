import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { getTranslations, type Locale } from "@/lib/translations";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;
  const t = getTranslations(locale);

  const isDE = locale === "de";
  const siteUrl = "https://savemyholiday.com";

  const title = isDE
    ? "SaveMyHoliday — Nie wieder zu viel für ein Hotel zahlen"
    : "SaveMyHoliday — Never Overpay for a Hotel Again";

  const description = isDE
    ? "SaveMyHoliday überwacht deinen Hotelpreis nach der Buchung und benachrichtigt dich, wenn er fällt. Automatisch Geld sparen — 100% kostenlos."
    : "SaveMyHoliday monitors your hotel price after booking and alerts you when it drops. Save money automatically — 100% free.";

  const keywords = isDE
    ? "Hotelpreis überwachen, Hotelpreis Alarm, günstiger Hotel buchen, Hotelbuchung stornieren, Preisüberwachung Hotel, Geld sparen Urlaub"
    : "hotel price monitor, hotel price alert, rebook hotel cheaper, hotel price tracker, save money travel, hotel price drop";

  return {
    title,
    description,
    keywords,
    authors: [{ name: "SaveMyHoliday" }],
    creator: "SaveMyHoliday",
    publisher: "SaveMyHoliday",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: {
      canonical: siteUrl,
    },
    icons: {
      icon: "/tripguard1.png",
      apple: "/tripguard1.png",
      shortcut: "/tripguard1.png",
    },
    openGraph: {
      title,
      description,
      siteName: t.brand,
      type: "website",
      url: siteUrl,
      locale: isDE ? "de_DE" : "en_US",
      images: [
        {
          url: `${siteUrl}/tripguard1.png`,
          width: 512,
          height: 512,
          alt: "SaveMyHoliday",
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [`${siteUrl}/tripguard1.png`],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;

  return (
    <html lang={locale}>
      <body>
        {children}
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
