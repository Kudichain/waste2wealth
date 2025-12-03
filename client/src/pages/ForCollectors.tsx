import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Smartphone, MapPin, Coins, TrendingUp, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function ForCollectors() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Start Earning as a Collector
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Turn waste into income. Join thousands of collectors making a difference in their communities while earning KOBO.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-10 py-6"
              onClick={() => setLocation("/login")}
            >
              Get Started Today
            </Button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl text-center mb-12">Why Join as a Collector?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Coins, title: "Instant Payments", desc: "Get paid immediately after each verified delivery" },
                { icon: Smartphone, title: "Easy to Use App", desc: "Simple interface designed for everyone" },
                { icon: MapPin, title: "Find Jobs Nearby", desc: "GPS-powered job matching in your area" },
                { icon: TrendingUp, title: "Grow Your Income", desc: "Build reputation and earn more over time" },
                { icon: Shield, title: "Safe & Secure", desc: "Verified factories and protected transactions" },
                { icon: CheckCircle2, title: "Flexible Schedule", desc: "Work whenever you want, however you want" }
              ].map((benefit, idx) => (
                <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                  <benefit.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-semibold text-xl mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How to Start */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl text-center mb-12">How to Get Started</h2>
            <div className="space-y-8">
              {[
                { step: 1, title: "Sign Up", desc: "Create your free collector account in minutes" },
                { step: 2, title: "Verify Identity", desc: "Complete simple verification for security" },
                { step: 3, title: "Start Collecting", desc: "Browse jobs and start earning immediately" }
              ].map((step) => (
                <div key={step.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-outfit font-bold text-4xl mb-6">Ready to Start Earning?</h2>
            <p className="text-xl mb-8">Join our community of collectors today</p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => setLocation("/login")}
            >
              Create Collector Account
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
