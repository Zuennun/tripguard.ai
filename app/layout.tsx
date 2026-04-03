import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { getTranslations, type Locale } from "@/lib/translations";
import CookieBanner from "@/components/CookieBanner";
import VisitTracker from "@/components/VisitTracker";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;
  const t = getTranslations(locale);

  const isDE = locale === "de";
  const siteUrl = SITE_URL;

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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SaveMyHoliday",
  url: "https://www.rebookandsave.com",
  logo: "https://www.rebookandsave.com/tripguard1.png",
  sameAs: [
    "https://x.com/zuennunardal",
    "https://www.tiktok.com/@savemyholiday.com",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@savemyholiday.com",
    contactType: "customer service",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SaveMyHoliday",
  url: "https://www.rebookandsave.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.rebookandsave.com/hotels/{search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;

  return (
    <html lang={locale}>
      <head>
        <link rel="alternate" hrefLang="de" href="https://www.rebookandsave.com" />
        <link rel="alternate" hrefLang="en" href="https://www.rebookandsave.com" />
        <link rel="alternate" hrefLang="x-default" href="https://www.rebookandsave.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        {children}
        <CookieBanner />
        <VisitTracker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
