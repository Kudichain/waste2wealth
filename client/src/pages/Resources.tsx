import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { BookOpen, Video, FileText, Download } from "lucide-react";

export default function Resources() {
  const resources = [
    {
      category: "Guides",
      icon: BookOpen,
      items: [
        { title: "Collector's Handbook", type: "PDF", size: "2.5 MB" },
        { title: "Factory Registration Guide", type: "PDF", size: "1.8 MB" },
        { title: "Waste Sorting Best Practices", type: "PDF", size: "3.2 MB" },
        { title: "Safety Guidelines", type: "PDF", size: "1.5 MB" }
      ]
    },
    {
      category: "Training Videos",
      icon: Video,
      items: [
        { title: "Getting Started as a Collector", type: "Video", size: "12 min" },
        { title: "Using the KudiChain App", type: "Video", size: "8 min" },
        { title: "Quality Standards for Waste", type: "Video", size: "15 min" },
        { title: "Payment & Wallet Management", type: "Video", size: "10 min" }
      ]
    },
    {
      category: "Reports",
      icon: FileText,
      items: [
        { title: "2024 Impact Report", type: "PDF", size: "5.1 MB" },
        { title: "Sustainability Whitepaper", type: "PDF", size: "4.3 MB" },
        { title: "Market Analysis Report", type: "PDF", size: "3.7 MB" },
        { title: "Annual Review 2024", type: "PDF", size: "6.2 MB" }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Resources
            </h1>
            <p className="text-xl text-gray-700">
              Everything you need to succeed with KudiChain
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            {resources.map((section) => (
              <div key={section.category}>
                <div className="flex items-center gap-3 mb-6">
                  <section.icon className="h-8 w-8 text-primary" />
                  <h2 className="font-outfit font-bold text-3xl">{section.category}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {section.items.map((item) => (
                    <Card key={item.title} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                              {item.type}
                            </span>
                            <span>{item.size}</span>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Download className="h-5 w-5 text-primary" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-outfit font-bold text-3xl mb-6">Need More Help?</h2>
            <p className="text-xl text-gray-700 mb-8">
              Our support team is here to assist you
            </p>
            <div className="flex gap-4 justify-center">
              <a href="mailto:support@motech.com" className="text-primary hover:underline">
                support@motech.com
              </a>
              <span className="text-gray-400">|</span>
              <a href="tel:+2349153154401" className="text-primary hover:underline">
                +234 91 531 54401
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
