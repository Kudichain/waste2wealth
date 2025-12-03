import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Target, Eye, Heart, Users } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              About KudiChain
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Transforming waste management across Nigeria through technology, creating jobs, and building cleaner communities.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                KudiChain was founded in 2025 with a simple yet powerful vision: to turn waste into opportunity. 
                We recognized that Nigeria's waste management challenge could become a source of employment and economic 
                empowerment for thousands of young people.
              </p>
              <p className="text-gray-700 mb-4">
                Supported by the Federal Government and NITDA, we've built a platform that connects waste collectors 
                with recycling factories, creating a transparent and efficient ecosystem that benefits everyone involved.
              </p>
              <p className="text-gray-700">
                Today, we're proud to be making a measurable impact in communities across Nigeria, with thousands of 
                collectors earning sustainable incomes while helping to build a cleaner, greener future.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-outfit font-bold text-2xl mb-4">Our Mission</h3>
                <p className="text-gray-700">
                  To create sustainable employment opportunities through innovative waste management solutions, 
                  while promoting environmental sustainability and community development across Nigeria.
                </p>
              </Card>
              <Card className="p-8">
                <Eye className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-outfit font-bold text-2xl mb-4">Our Vision</h3>
                <p className="text-gray-700">
                  To become Africa's leading waste-to-wealth platform, empowering millions to earn sustainable 
                  incomes while building cleaner, healthier communities across the continent.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Heart, title: "Impact", desc: "Creating meaningful change in communities" },
                { icon: Users, title: "Empowerment", desc: "Enabling people to earn sustainable incomes" },
                { icon: Target, title: "Innovation", desc: "Using technology to solve real problems" }
              ].map((value, idx) => (
                <div key={idx} className="text-center">
                  <value.icon className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-xl mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Stats */}
        <section className="py-16 px-6 bg-primary text-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl mb-12 text-center">Our Impact</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { value: "10,000+", label: "KG Collected" },
                { value: "500+", label: "Active Collectors" },
                { value: "20+", label: "Partner Factories" },
                { value: "15+", label: "Communities Served" }
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="font-bold text-5xl mb-2">{stat.value}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
