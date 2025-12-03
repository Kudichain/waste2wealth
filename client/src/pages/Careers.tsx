import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp, Heart } from "lucide-react";

export default function Careers() {
  const positions = [
    {
      title: "Regional Coordinator",
      location: "Lagos, Nigeria",
      type: "Full-time",
      department: "Operations",
      description: "Lead waste collection operations and manage collector teams across Lagos region."
    },
    {
      title: "Software Engineer",
      location: "Remote",
      type: "Full-time",
      department: "Technology",
      description: "Build and maintain the KudiChain platform using React, Node.js, and PostgreSQL."
    },
    {
      title: "Partnership Manager",
      location: "Abuja, Nigeria",
      type: "Full-time",
      department: "Business Development",
      description: "Establish relationships with recycling facilities and government agencies."
    },
    {
      title: "Community Outreach Specialist",
      location: "Kano, Nigeria",
      type: "Contract",
      department: "Marketing",
      description: "Organize community events and awareness campaigns for waste collection."
    },
    {
      title: "Data Analyst",
      location: "Remote",
      type: "Full-time",
      department: "Analytics",
      description: "Analyze collection data and provide insights for platform optimization."
    },
    {
      title: "Customer Support Lead",
      location: "Lagos, Nigeria",
      type: "Full-time",
      department: "Customer Success",
      description: "Lead support team and ensure excellent user experience for collectors and factories."
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health Insurance",
      description: "Comprehensive medical coverage for you and your family"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Clear advancement paths and continuous learning opportunities"
    },
    {
      icon: Users,
      title: "Great Team",
      description: "Work with passionate people making real environmental impact"
    },
    {
      icon: Briefcase,
      title: "Work-Life Balance",
      description: "Flexible hours and remote work options available"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Careers at KudiChain
            </h1>
            <p className="text-xl text-gray-700">
              Join us in building a sustainable future for Africa
            </p>
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl text-center mb-12">Why Work With Us</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="p-6 text-center">
                  <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl mb-8">Open Positions</h2>
            <div className="space-y-4">
              {positions.map((position) => (
                <Card key={position.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-outfit font-bold text-xl mb-2">{position.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{position.location}</span>
                        <span>•</span>
                        <span>{position.type}</span>
                        <span>•</span>
                        <span className="text-primary font-semibold">{position.department}</span>
                      </div>
                      <p className="text-gray-700">{position.description}</p>
                    </div>
                    <button className="ml-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
                      Apply Now
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-outfit font-bold text-3xl mb-6">Don't See Your Role?</h2>
            <p className="text-xl mb-8">
              We're always looking for talented people. Send us your resume!
            </p>
            <a 
              href="mailto:careers@motech.com"
              className="inline-block px-8 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              careers@motech.com
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
