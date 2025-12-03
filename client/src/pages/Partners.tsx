import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function Partners() {
  const partners = [
    {
      name: "Dangote Group",
      logo: "/partners/dangote.png",
      description: "Leading industrial conglomerate supporting sustainable waste management",
      impact: "Processing 2,000+ tons monthly"
    },
    {
      name: "BUA Group",
      logo: "/partners/bua.png",
      description: "Partnering in cement production from recycled materials",
      impact: "500+ jobs created"
    },
    {
      name: "Flour Mills Nigeria",
      logo: "/partners/flour-mills.png",
      description: "Sustainable packaging solutions partner",
      impact: "1,500 tons recycled"
    },
    {
      name: "Nigerian Breweries",
      logo: "/partners/nigerian-breweries.png",
      description: "Glass and plastic recycling partnership",
      impact: "80% waste reduction"
    },
    {
      name: "Unilever Nigeria",
      logo: "/partners/unilever.png",
      description: "Plastic waste recovery and recycling",
      impact: "1,000+ collectors engaged"
    },
    {
      name: "Nestle Nigeria",
      logo: "/partners/nestle.png",
      description: "Packaging waste management solutions",
      impact: "3,000 tons annually"
    },
    {
      name: "Coca-Cola HBC",
      logo: "/partners/coca-cola.png",
      description: "PET bottle recovery program",
      impact: "95% bottle recovery"
    },
    {
      name: "MTN Nigeria",
      logo: "/partners/mtn.png",
      description: "Technology and digital payment support",
      impact: "50,000+ transactions"
    },
    {
      name: "Access Bank",
      logo: "/partners/access-bank.png",
      description: "Financial services and payment processing",
      impact: "Seamless payments"
    },
    {
      name: "Lagos Waste Management",
      logo: "/partners/lawma.png",
      description: "Government partnership for waste collection",
      impact: "City-wide coverage"
    },
    {
      name: "Green Africa Foundation",
      logo: "/partners/green-africa.png",
      description: "Environmental advocacy and education",
      impact: "5,000+ trained"
    },
    {
      name: "UN Environment",
      logo: "/partners/un-environment.png",
      description: "International environmental standards support",
      impact: "Global recognition"
    }
  ];

  const benefits = [
    "Access to verified collector network",
    "Transparent supply chain management",
    "Real-time tracking and analytics",
    "Quality assurance standards",
    "Sustainable sourcing certification",
    "Brand reputation enhancement"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Our Partners
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Working together to build a sustainable future for Nigeria
            </p>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl text-center mb-12">Trusted by Industry Leaders</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {partners.map((partner) => (
                <Card key={partner.name} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="aspect-square flex items-center justify-center mb-4 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all p-4"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{partner.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{partner.description}</p>
                  <div className="text-xs font-semibold text-primary">{partner.impact}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Benefits */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl text-center mb-12">Partnership Benefits</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-outfit font-bold text-3xl mb-6">Become a Partner</h2>
            <p className="text-xl text-gray-700 mb-8">
              Join our network of forward-thinking organizations committed to sustainability
            </p>
            <Button size="lg">Contact Partnership Team</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
