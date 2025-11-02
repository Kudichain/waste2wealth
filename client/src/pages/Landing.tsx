import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustIndicators } from "@/components/TrustIndicators";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TrustIndicators />
        <HowItWorks />
        <Testimonials />
        <section className="py-16 px-6 bg-primary text-primary-foreground text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-outfit font-extrabold text-4xl md:text-5xl mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of collectors making a difference in their communities
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-12"
              onClick={handleGetStarted}
              data-testid="button-cta-bottom"
            >
              Get Started Now
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
