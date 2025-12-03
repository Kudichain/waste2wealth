import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

export default function Pricing() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "Collectors",
      price: "Free",
      period: "forever",
      description: "Perfect for individual waste collectors",
      features: [
        "Unlimited job access",
        "Instant KOBO payments",
        "GPS navigation",
        "Mobile app access",
        "Performance tracking",
        "24/7 support"
      ],
      cta: "Start Collecting",
      highlighted: false
    },
    {
      name: "Small Factory",
      price: "₦50,000",
      period: "per month",
      description: "For small to medium recycling operations",
      features: [
        "Up to 50 deliveries/day",
        "Collector network access",
        "Basic analytics dashboard",
        "Payment processing",
        "Quality verification tools",
        "Email support"
      ],
      cta: "Get Started",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large-scale recycling operations",
      features: [
        "Unlimited deliveries",
        "Priority collector matching",
        "Advanced analytics & reporting",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 priority support"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Choose the plan that's right for you
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, idx) => (
                <Card 
                  key={idx} 
                  className={`p-8 ${plan.highlighted ? 'border-2 border-primary shadow-xl scale-105' : ''}`}
                >
                  {plan.highlighted && (
                    <div className="bg-primary text-white text-sm font-semibold px-4 py-1 rounded-full w-fit mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-outfit font-bold text-2xl mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="font-bold text-4xl">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => setLocation("/login")}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "How do collectors earn money?",
                  a: "Collectors earn KOBO for each verified waste delivery. The amount depends on the weight and type of waste collected."
                },
                {
                  q: "Are there any hidden fees?",
                  a: "No hidden fees! Collectors use the platform completely free. Factories pay a monthly subscription based on their usage."
                },
                {
                  q: "Can I change my plan later?",
                  a: "Yes, factories can upgrade or downgrade their plan at any time. Changes take effect in the next billing cycle."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept bank transfers, cards, and KOBO for factory subscriptions. Collectors receive payments via KOBO tokens."
                }
              ].map((faq, idx) => (
                <Card key={idx} className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
