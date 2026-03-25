import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { getTranslations, type Locale } from "@/lib/translations";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;
  const t = getTranslations(locale);

  const isDE = locale === "de";
  return {
    title: isDE
      ? "Urlaubswächter — Nie wieder zu viel für ein Hotel zahlen"
      : "RebookAndSave — Never Overpay for a Hotel Again",
    description: isDE
      ? "Urlaubswächter überwacht deinen Hotelpreis nach der Buchung und benachrichtigt dich, wenn er fällt. Automatisch Geld sparen — 100% kostenlos."
      : "RebookAndSave monitors your hotel price after booking and alerts you when it drops. Save money automatically — 100% free.",
    openGraph: {
      title: isDE
        ? "Urlaubswächter — Nie wieder zu viel für ein Hotel zahlen"
        : "RebookAndSave — Never Overpay for a Hotel Again",
      description: isDE
        ? "Hotelpreis tracken und nach der Buchung Geld sparen."
        : "Track your hotel price and save money after booking.",
      siteName: t.brand,
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
