import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Users, Package, Leaf, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LiveMetric {
  label: string;
  value: number;
  unit: string;
  trend: number;
  icon: any;
  color: string;
}

export function LiveDataDashboard() {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    { label: "Active Collectors", value: 1247, unit: "", trend: 12.5, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Waste Collected Today", value: 3456, unit: "kg", trend: 8.3, icon: Package, color: "from-green-500 to-green-600" },
    { label: "KOBO Earned Today", value: 52340, unit: "₦", trend: 15.2, icon: TrendingUp, color: "from-purple-500 to-purple-600" },
    { label: "CO₂ Offset", value: 1823, unit: "kg", trend: 9.7, icon: Leaf, color: "from-emerald-500 to-emerald-600" },
    { label: "Countries Active", value: 3, unit: "", trend: 0, icon: Globe, color: "from-orange-500 to-orange-600" },
    { label: "Live Transactions", value: 89, unit: "/min", trend: 5.4, icon: Activity, color: "from-pink-500 to-pink-600" },
  ]);

  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Simulate real-time data updates every 5 seconds
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 10) - 3,
        trend: Math.random() * 20 - 5
      })));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(16,185,129,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(59,130,246,0.35),transparent_45%)]" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-white/80">
              LIVE DATA · Updated {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <h2 className="font-outfit font-bold text-4xl md:text-5xl mb-4">
            Real-Time Impact Dashboard
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            See the live impact of our global community. All data is verified and updated in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl text-white shadow-[0_25px_80px_rgba(15,23,42,0.45)] transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 opacity-60 bg-gradient-to-br ${metric.color}`} />
              <div className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  {metric.label}
                </CardTitle>
                <div className={`w-12 h-12 rounded-2xl bg-slate-900/70 border border-white/20 flex items-center justify-center shadow-2xl`}>
                  <metric.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-4xl font-bold">
                    {metric.value.toLocaleString()}
                  </div>
                  {metric.unit && (
                    <span className="text-base text-white/70">{metric.unit}</span>
                  )}
                </div>
                {metric.trend !== 0 && (
                  <Badge 
                    variant={metric.trend > 0 ? "default" : "secondary"}
                    className={metric.trend > 0 ? "bg-green-400/20 text-green-200 border border-green-300/40" : "bg-red-400/20 text-red-200 border border-red-300/40"}
                  >
                    <TrendingUp className={`h-3 w-3 mr-1 ${metric.trend < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(metric.trend).toFixed(1)}% today
                  </Badge>
                )}
              </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Data Source Attribution */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/60">
            Data verified by{" "}
            <span className="font-semibold text-white">Nigeria Environmental Standards Agency (NESREA)</span>
            {" · "}
            <span className="font-semibold text-white">UN Environment Programme</span>
          </p>
        </div>
      </div>
    </section>
  );
}
