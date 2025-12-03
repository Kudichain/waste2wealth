import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, Award, Newspaper } from "lucide-react";

export default function WhatsNew() {
  const updates = [
    {
      date: "November 1, 2025",
      category: "Feature",
      icon: TrendingUp,
      title: "New State-wide Location Search",
      description: "Search and select from all 36 Nigerian states and their local governments for precise waste collection opportunities."
    },
    {
      date: "October 28, 2025",
      category: "Achievement",
      icon: Award,
      title: "10,000 KG Milestone Reached",
      description: "KudiChain community has collectively recycled over 10,000 kilograms of waste, making a significant environmental impact."
    },
    {
      date: "October 15, 2025",
      category: "Partnership",
      icon: Newspaper,
      title: "New Factory Partners in Lagos",
      description: "5 new recycling facilities have joined the KudiChain network in Lagos State, creating more earning opportunities."
    },
    {
      date: "October 5, 2025",
      category: "Update",
      icon: Calendar,
      title: "Enhanced Mobile App Released",
      description: "Download the latest version with improved navigation, faster payments, and real-time job notifications."
    }
  ];

  const announcements = [
    {
      title: "Upcoming Community Event",
      content: "Join us for a major cleanup drive in Kano on November 15th. Prizes for top collectors!",
      date: "November 15, 2025"
    },
    {
      title: "Payment Processing Upgrade",
      content: "We're upgrading our payment system for faster transactions. Expect 50% faster payouts starting November 10th.",
      date: "November 10, 2025"
    },
    {
      title: "Holiday Collection Bonus",
      content: "Earn 20% bonus on all collections during the holiday season from December 1-31.",
      date: "December 1, 2025"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              What's New
            </h1>
            <p className="text-xl text-gray-700">
              Latest updates, features, and announcements
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl mb-8">Recent Updates</h2>
            <div className="space-y-6">
              {updates.map((update) => (
                <Card key={update.title} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <update.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-primary">{update.category}</span>
                        <span className="text-sm text-gray-500">{update.date}</span>
                      </div>
                      <h3 className="font-outfit font-bold text-xl mb-2">{update.title}</h3>
                      <p className="text-gray-700">{update.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl mb-8">Upcoming Announcements</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {announcements.map((announcement) => (
                <Card key={announcement.title} className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{announcement.date}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{announcement.title}</h3>
                  <p className="text-gray-700">{announcement.content}</p>
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
