import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import GlobalCoverage from "@/components/GlobalCoverage";
import LiveScanning from "@/components/LiveScanning";
import Comparison from "@/components/Comparison";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <GlobalCoverage />
      <LiveScanning />
      <Comparison />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
