import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { MapPin, TrendingUp, Users, Award } from "lucide-react";

export default function Projects() {
  const projects = [
    {
      title: "Kano Clean City Initiative",
      location: "Kano State",
      status: "Active",
      collected: "5,000 KG",
      collectors: 150,
      description: "Major waste collection drive across Kano metropolitan area"
    },
    {
      title: "Lagos Plastic Recovery",
      location: "Lagos State",
      status: "Active",
      collected: "3,200 KG",
      collectors: 98,
      description: "Focused plastic bottle and container collection program"
    },
    {
      title: "Abuja Green Streets",
      location: "FCT Abuja",
      status: "Active",
      collected: "2,800 KG",
      collectors: 75,
      description: "Community-based waste collection in residential areas"
    },
    {
      title: "Port Harcourt Shore Cleanup",
      location: "Rivers State",
      status: "Completed",
      collected: "1,500 KG",
      collectors: 45,
      description: "Coastal and waterway waste removal project"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Our Projects
            </h1>
            <p className="text-xl text-gray-700">
              Active waste collection initiatives across Nigeria
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <Card key={project.title} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-outfit font-bold text-2xl">{project.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      project.status === "Active" 
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>

                  <p className="text-gray-700 mb-6">{project.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-gray-600">Collected</div>
                        <div className="font-semibold">{project.collected}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-gray-600">Collectors</div>
                        <div className="font-semibold">{project.collectors}</div>
                      </div>
                    </div>
                  </div>
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
