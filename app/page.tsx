import { headers } from "next/headers";
import { type Locale, getTranslations } from "@/lib/translations";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import GlobalCoverage from "@/components/GlobalCoverage";
import LiveScanning from "@/components/LiveScanning";
import Comparison from "@/components/Comparison";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import SeoGateway from "@/components/SeoGateway";

export default function Home() {
  const headersList = headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;
  const t = getTranslations(locale);

  return (
    <main>
      <ScrollToTop />
      <Navbar t={t} />
      <Hero t={t} />
      <Stats t={t} />
      <Features t={t} />
      <GlobalCoverage t={t} />
      <LiveScanning t={t} />
      <Comparison t={t} />
      <SeoGateway t={t} />
      <Testimonials t={t} />
      <FAQ t={t} />
      <Footer t={t} />
    </main>
  );
}
