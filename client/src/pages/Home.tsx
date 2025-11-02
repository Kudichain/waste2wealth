import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustIndicators } from "@/components/TrustIndicators";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustIndicators />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
