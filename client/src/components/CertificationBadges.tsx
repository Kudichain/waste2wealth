import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle2, Award, FileCheck } from "lucide-react";

export function CertificationBadges() {
  const certifications = [
    {
      name: "ISO 14001",
      description: "Environmental Management",
      icon: Shield,
      color: "from-green-500 to-emerald-600",
      verified: true
    },
    {
      name: "NESREA",
      description: "Nigerian Environmental Compliance",
      icon: CheckCircle2,
      color: "from-blue-500 to-indigo-600",
      verified: true
    },
    {
      name: "UN SDG",
      description: "Sustainable Development Partner",
      icon: Award,
      color: "from-purple-500 to-pink-600",
      verified: true
    },
    {
      name: "CBN Certified",
      description: "Central Bank Digital Payment Licensed",
      icon: FileCheck,
      color: "from-orange-500 to-red-600",
      verified: true
    }
  ];

  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-bold text-3xl md:text-4xl mb-3">
            Certified & Trusted
          </h2>
          <p className="text-muted-foreground text-lg">
            Verified compliance with international standards and regulations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {certifications.map((cert, index) => (
            <Card 
              key={index}
              className="relative group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <cert.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">{cert.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                {cert.verified && (
                  <div className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            All certifications are independently audited and publicly verifiable.
            <a href="/compliance" className="ml-2 text-primary hover:underline font-medium">
              View full compliance documentation →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
