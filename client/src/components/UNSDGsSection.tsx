import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe2, Target, TrendingUp, Users, Leaf, Building2 } from "lucide-react";

export function UNSDGsSection() {
  const sdgs = [
    {
      number: 1,
      title: "No Poverty",
      description: "Creating income opportunities for 2,100+ individuals",
      color: "bg-red-500",
      icon: DollarSign
    },
    {
      number: 8,
      title: "Decent Work & Economic Growth",
      description: "₦9.8M disbursed in fair wages to collectors and vendors",
      color: "bg-red-800",
      icon: Users
    },
    {
      number: 11,
      title: "Sustainable Cities",
      description: "1,200 tons of waste diverted from landfills monthly",
      color: "bg-orange-500",
      icon: Building2
    },
    {
      number: 12,
      title: "Responsible Consumption",
      description: "Circular economy model transforming waste into resources",
      color: "bg-yellow-600",
      icon: Recycle
    },
    {
      number: 13,
      title: "Climate Action",
      description: "3,500 tons CO₂ offset equivalent to planting 58,000 trees",
      color: "bg-green-700",
      icon: Leaf
    },
    {
      number: 17,
      title: "Partnerships for Goals",
      description: "45 factory partners, government, and NGO collaborations",
      color: "bg-blue-900",
      icon: Globe2
    }
  ];

  const impactAreas = [
    {
      icon: Target,
      title: "Environmental Sustainability",
      metrics: ["3,500 tons CO₂ offset", "1,200 tons waste processed", "92% collection rate"],
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Users,
      title: "Social Empowerment",
      metrics: ["2,100 jobs created", "60% women participants", "500+ youth employed"],
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: TrendingUp,
      title: "Economic Development",
      metrics: ["₦9.8M disbursed", "₦12.5M revenue", "28.9% profit margin"],
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent)]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Globe2 className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Global Alignment</span>
          </div>
          <h2 className="font-outfit font-bold text-4xl md:text-5xl mb-6 tracking-tight">
            Contributing to UN Sustainable Development Goals
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            Our mission aligns with 6 key UN SDGs, driving measurable impact towards a sustainable future
          </p>
        </div>

        {/* SDG Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {sdgs.map((sdg, index) => (
            <Card 
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`${sdg.color} w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                    {sdg.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{sdg.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {sdg.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary font-semibold mt-4">
                  <TrendingUp className="h-3 w-3" />
                  <span>Active Impact</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Impact Areas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {impactAreas.map((area, index) => (
            <Card 
              key={index}
              className="bg-gradient-to-br from-background to-muted/50 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <area.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-4">{area.title}</h3>
                <div className="space-y-2">
                  {area.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{metric}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Climate Action Banner */}
        <Card className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-12 relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Leaf className="h-64 w-64 -mr-16 -mt-16" />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <Badge className="bg-white/20 text-white border-white/30 mb-6 text-sm px-4 py-1">
                COP28 Commitment
              </Badge>
              <h3 className="font-outfit font-bold text-4xl mb-4">
                Climate Action Through Circular Economy
              </h3>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Our waste-to-wealth model directly contributes to carbon reduction targets, 
                supporting Nigeria's commitment to the Paris Agreement and global climate goals.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">3,500</div>
                  <div className="text-sm text-white/90">Tons CO₂ Offset</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">58K</div>
                  <div className="text-sm text-white/90">Trees Equivalent</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">92%</div>
                  <div className="text-sm text-white/90">Waste Diverted</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partnership Logos */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">
            Recognized By
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="text-2xl font-bold">UN Environment Programme</div>
            <div className="text-2xl font-bold">·</div>
            <div className="text-2xl font-bold">World Bank</div>
            <div className="text-2xl font-bold">·</div>
            <div className="text-2xl font-bold">African Development Bank</div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { DollarSign, Recycle } from "lucide-react";
