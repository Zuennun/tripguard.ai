import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip-Guard — Never Overpay for a Hotel Again",
  description:
    "Trip-Guard monitors your hotel price after booking and alerts you when it drops. Save money automatically — 100% free.",
  openGraph: {
    title: "Trip-Guard — Never Overpay for a Hotel Again",
    description: "Track your hotel price and save money after booking.",
    siteName: "Trip-Guard",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
