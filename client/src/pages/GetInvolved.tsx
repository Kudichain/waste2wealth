import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, HandHeart, Coins, MapPin } from "lucide-react";
import { useLocation } from "wouter";

export default function GetInvolved() {
  const [, setLocation] = useLocation();

  const opportunities = [
    {
      icon: Users,
      title: "Become a Collector",
      description: "Join our network of waste collectors and start earning immediately",
      action: "Sign Up as Collector",
      link: "/for-collectors"
    },
    {
      icon: HandHeart,
      title: "Partner Factory",
      description: "Register your recycling facility and access verified collectors",
      action: "Register Factory",
      link: "/for-factories"
    },
    {
      icon: Coins,
      title: "Sponsor a Community",
      description: "Support waste collection initiatives in underserved areas",
      action: "Learn More",
      link: "/contact"
    },
    {
      icon: MapPin,
      title: "Volunteer",
      description: "Help organize community cleanup events and awareness campaigns",
      action: "Get Started",
      link: "/contact"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Get Involved
            </h1>
            <p className="text-xl text-gray-700">
              Join the movement for a cleaner, greener Nigeria
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {opportunities.map((opp) => (
                <Card key={opp.title} className="p-8">
                  <opp.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-outfit font-bold text-2xl mb-3">{opp.title}</h3>
                  <p className="text-gray-700 mb-6">{opp.description}</p>
                  <Button onClick={() => setLocation(opp.link)} className="w-full">
                    {opp.action}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-outfit font-bold text-3xl mb-6">Make an Impact Today</h2>
            <p className="text-xl mb-8">
              Every action counts. Join thousands making a difference in their communities.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setLocation("/login")}
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
