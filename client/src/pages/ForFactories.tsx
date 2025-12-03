import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Factory, Users, LineChart, Shield, CheckCircle2, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function ForFactories() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-green-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Register Your Recycling Factory
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Connect with reliable waste collectors and streamline your recycling operations with our verified platform.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-10 py-6"
              onClick={() => setLocation("/login")}
            >
              Register Your Factory
            </Button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl text-center mb-12">Why Partner With Us?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Verified Collectors", desc: "Access to pre-screened and verified waste collectors" },
                { icon: LineChart, title: "Scale Operations", desc: "Grow your recycling capacity with consistent supply" },
                { icon: Shield, title: "Quality Assurance", desc: "Photo verification and quality checks on all deliveries" },
                { icon: Clock, title: "Real-time Tracking", desc: "Monitor deliveries and manage operations efficiently" },
                { icon: CheckCircle2, title: "Digital Payments", desc: "Automated payment processing and invoicing" },
                { icon: Factory, title: "Factory Dashboard", desc: "Complete management tools for your operations" }
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

        {/* Requirements */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl text-center mb-12">Registration Requirements</h2>
            <div className="space-y-6">
              {[
                "Valid business registration certificate",
                "Environmental compliance permits",
                "Factory address and contact information",
                "Bank account details for payments",
                "Waste processing capacity details"
              ].map((req, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-white p-6 rounded-lg shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <p className="text-lg">{req}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-outfit font-bold text-4xl mb-6">Ready to Partner With Us?</h2>
            <p className="text-xl mb-8">Register your factory and start receiving verified waste today</p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => setLocation("/login")}
            >
              Start Registration Process
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
