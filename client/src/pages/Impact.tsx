import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Leaf, Users, Factory, TrendingUp, Heart, Globe } from "lucide-react";

export default function Impact() {
  const environmentalMetrics = [
    {
      icon: Leaf,
      value: "10,000+",
      label: "Tons of Waste Recycled",
      description: "Diverted from landfills and oceans"
    },
    {
      icon: Globe,
      value: "45,000",
      label: "CO2 Tons Reduced",
      description: "Equivalent to planting 2M trees"
    },
    {
      icon: Factory,
      value: "20+",
      label: "Partner Factories",
      description: "Processing waste into products"
    }
  ];

  const socialMetrics = [
    {
      icon: Users,
      value: "500+",
      label: "Jobs Created",
      description: "Empowering unemployed youth"
    },
    {
      icon: TrendingUp,
      value: "₦50M+",
      label: "Earnings Distributed",
      description: "Direct income to collectors"
    },
    {
      icon: Heart,
      value: "30+",
      label: "Communities Served",
      description: "Across Nigeria"
    }
  ];

  const stories = [
    {
      name: "Aisha Mohammed",
      location: "Kano",
      story: "From unemployed graduate to earning ₦120,000 monthly as a collector. GreenCoin changed my life.",
      earnings: "₦1.2M total earned",
      collections: "450+ deliveries"
    },
    {
      name: "Ibrahim Yusuf",
      location: "Lagos",
      story: "Started with plastic bottles, now leading a team of 5 collectors. Building a sustainable future.",
      earnings: "₦2.5M total earned",
      collections: "800+ deliveries"
    },
    {
      name: "Fatima Bello",
      location: "Abuja",
      story: "Single mother supporting 3 children through waste collection. Financial independence achieved.",
      earnings: "₦950K total earned",
      collections: "320+ deliveries"
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
              Our Impact
            </h1>
            <p className="text-xl text-gray-700">
              Creating positive change for people and planet
            </p>
          </div>
        </section>

        {/* Environmental Impact */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl text-center mb-12">Environmental Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {environmentalMetrics.map((metric) => (
                <Card key={metric.label} className="p-8 text-center">
                  <metric.icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <div className="font-outfit font-bold text-4xl mb-2">{metric.value}</div>
                  <div className="font-semibold text-lg mb-2">{metric.label}</div>
                  <p className="text-gray-600">{metric.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social Impact */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl text-center mb-12">Social Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {socialMetrics.map((metric) => (
                <Card key={metric.label} className="p-8 text-center">
                  <metric.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <div className="font-outfit font-bold text-4xl mb-2">{metric.value}</div>
                  <div className="font-semibold text-lg mb-2">{metric.label}</div>
                  <p className="text-gray-600">{metric.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl text-center mb-12">Collector Success Stories</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {stories.map((story) => (
                <Card key={story.name} className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-xl mb-1">{story.name}</h3>
                    <p className="text-sm text-gray-600">{story.location}</p>
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{story.story}"</p>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Earned:</span>
                      <span className="font-semibold text-green-600">{story.earnings}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Collections:</span>
                      <span className="font-semibold">{story.collections}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Future Goals */}
        <section className="py-16 px-6 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-outfit font-bold text-3xl mb-8">2026 Goals</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="font-outfit font-bold text-4xl mb-2">1,150,000</div>
                <div>Tons Recycled</div>
              </div>
              <div>
                <div className="font-outfit font-bold text-4xl mb-2">12,000</div>
                <div>Jobs Created</div>
              </div>
              <div>
                <div className="font-outfit font-bold text-4xl mb-2">500</div>
                <div>Partner Factories</div>
              </div>
              <div>
                <div className="font-outfit font-bold text-4xl mb-2">1,100</div>
                <div>Communities</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
