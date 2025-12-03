import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import { Briefcase, Trash2, Users } from "lucide-react";

export function ImpactStats() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [startCounting, setStartCounting] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  useEffect(() => {
    if (inView) {
      setStartCounting(true);
    }
  }, [inView]);

  const displayStats = [
    {
      icon: Trash2,
      value: stats?.kgCollected || 1500,
      suffix: "+",
      label: "Kilograms Collected",
      gradient: "from-emerald-400 to-green-500",
      glow: "shadow-emerald-500/40",
      sub: "Per month",
    },
    {
      icon: Briefcase,
      value: stats?.jobsCreated || 200,
      suffix: "+",
      label: "Jobs Created",
      gradient: "from-sky-400 to-blue-600",
      glow: "shadow-sky-500/40",
      sub: "New incomes",
    },
    {
      icon: Users,
      value: stats?.communityMembers || 5000,
      suffix: "+",
      label: "Community Members",
      gradient: "from-fuchsia-400 to-purple-600",
      glow: "shadow-fuchsia-500/40",
      sub: "Cities connected",
    },
  ];

  return (
    <section ref={ref} className="relative py-24 px-4 sm:px-6 overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(110,231,183,0.25),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.2),transparent_45%)]" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <p className="uppercase tracking-[0.5em] text-emerald-200 text-xs mb-4">
            Impact pulse
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
            Our collective impact grows every minute.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/70">
            These counters pull live numbers from the field. Watch the progress surge when collectors drop sorted waste.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {displayStats.map((stat, index) => (
            <div
              key={index}
              className="relative rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-[0_25px_80px_rgba(15,23,42,0.45)] overflow-hidden"
            >
              <div className="absolute inset-x-10 top-6 h-40 blur-[120px] bg-white/20" />
              <div className="relative flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center ${stat.glow} shadow-2xl mb-6`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-5xl font-black tracking-tight">
                  {startCounting ? (
                    <CountUp end={stat.value} duration={2.75} suffix={stat.suffix} />
                  ) : (
                    "0"
                  )}
                </div>
                <p className="mt-3 text-lg font-semibold text-white/90">{stat.label}</p>
                <p className="text-sm uppercase tracking-[0.4em] text-white/50 mt-1">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
