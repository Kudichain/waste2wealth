import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Recycle, Users, Leaf, DollarSign, TrendingUp, Globe2 } from "lucide-react";

export function InteractiveImpactDashboard() {
  const [wasteCollected, setWasteCollected] = useState(0);
  const [jobsCreated, setJobsCreated] = useState(0);
  const [co2Offset, setCo2Offset] = useState(0);
  const [earnings, setEarnings] = useState(0);

  const targets = {
    waste: 1200, // tons
    jobs: 2100,
    co2: 3500, // tons
    earnings: 9.8 // million naira
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds animation
    const steps = 60;
    const interval = duration / steps;

    const wasteStep = targets.waste / steps;
    const jobsStep = targets.jobs / steps;
    const co2Step = targets.co2 / steps;
    const earningsStep = targets.earnings / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      
      if (currentStep <= steps) {
        setWasteCollected(Math.min(Math.round(wasteStep * currentStep), targets.waste));
        setJobsCreated(Math.min(Math.round(jobsStep * currentStep), targets.jobs));
        setCo2Offset(Math.min(Math.round(co2Step * currentStep), targets.co2));
        setEarnings(Math.min((earningsStep * currentStep), targets.earnings));
      } else {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const impactMetrics = [
    {
      icon: Recycle,
      value: wasteCollected.toLocaleString(),
      label: "Tons Waste Collected",
      suffix: "tons",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      detail: "This month"
    },
    {
      icon: Users,
      value: jobsCreated.toLocaleString(),
      label: "Jobs Created",
      suffix: "people",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      detail: "Active participants"
    },
    {
      icon: Leaf,
      value: co2Offset.toLocaleString(),
      label: "CO₂ Offset",
      suffix: "tons",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      detail: "≈ 58,000 trees planted"
    },
    {
      icon: DollarSign,
      value: `₦${earnings.toFixed(1)}M`,
      label: "Earnings Disbursed",
      suffix: "",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      detail: "To collectors & vendors"
    }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-10%,rgba(34,197,94,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_110%,rgba(59,130,246,0.25),transparent_45%)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/15">
            <TrendingUp className="h-5 w-5 text-emerald-200" />
            <span className="text-white font-semibold">Live Impact Dashboard</span>
          </div>
          <h2 className="font-outfit font-bold text-4xl md:text-5xl mb-6 tracking-tight">
            Real-Time Environmental Impact
          </h2>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto">
            Watch our collective impact grow every second. Together, we're building a sustainable future.
          </p>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {impactMetrics.map((metric, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl text-white shadow-[0_25px_80px_rgba(15,23,42,0.45)] transition-all duration-500 hover:-translate-y-2`}
            >
              <CardContent className="p-6 relative">
                {/* Background Icon */}
                <div className="absolute inset-0 opacity-10">
                  <metric.icon className="h-full w-full translate-x-12 -translate-y-6" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4 shadow-2xl`}>
                    <metric.icon className="h-8 w-8 text-white" />
                  </div>

                  <div className="space-y-2">
                    <div className={`text-5xl font-bold text-white font-mono`}>
                      {metric.value}
                    </div>
                    <div className="font-semibold text-lg text-white">
                      {metric.label}
                    </div>
                    <div className="text-sm text-white/70">
                      {metric.detail}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Reach Section */}
        <div className="mt-16">
          <Card className="bg-white/5 border border-white/10 text-white backdrop-blur-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Globe2 className="h-8 w-8 text-emerald-200" />
                <h3 className="font-outfit font-bold text-3xl">Growing Nationwide</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">44</div>
                  <div className="text-sm text-white/70">LGAs in Kano</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">92%</div>
                  <div className="text-sm text-white/70">Engagement Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">45</div>
                  <div className="text-sm text-white/70">Factory Partners</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-sm text-white/70">Platform Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Update Notice */}
        <div className="text-center mt-8 text-sm text-white/70">
          <div className="inline-flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Live data · Updates every 30 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}
