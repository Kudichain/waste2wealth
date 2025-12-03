import { useEffect, useRef, useState } from "react";
import { Award, Building2, Users, Recycle } from "lucide-react";

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <div ref={countRef}>{count.toLocaleString()}</div>;
}


export function TrustIndicators() {
  const partnerLogos = [
    { src: "/partners/state logo 1.png", alt: "Federal Government of Nigeria" },
    { src: "/partners/state logo 2.jpg", alt: "The Presidency" },
    { src: "/partners/partners logo 3.webp", alt: "NITDA" },
    { src: "/partners/LAGOS-STATE-logo.webp", alt: "Lagos State" },
    { src: "/partners/partners logo 4.webp", alt: "Ministry of Environment" },
    { src: "/partners/partners logo 5.webp", alt: "Renewable Energy" },
    { src: "/partners/partners logo 7.jpg", alt: "Energy Commission" },
    { src: "/partners/partners logo 8.png", alt: "Waste to Energy" },
    { src: "/partners/partners logo 9.png", alt: "Clean Energy" },
    { src: "/partners/partners logo 10.webp", alt: "Environmental Partner" },
    { src: "/partners/partners logo 6.png", alt: "Green Technology" },
    { src: "/partners/partners logo 2.png", alt: "Partner Organization" },
    // Added partner logos 11 to 27
    { src: "/partners/partners logo 11.png", alt: "Federal Ministry of Communications, Innovation & Digital Economy" },
    { src: "/partners/partners logo 12.jpg", alt: "Federal Ministry of Innovation, Science & Technology" },
    { src: "/partners/partners logo 13.png", alt: "Federal Ministry of Information & Culture" },
    { src: "/partners/partners logo 14.png", alt: "Federal Ministry of Youth and Sports Development" },
    { src: "/partners/partners logo 15.webp", alt: "Federal Ministry of Women Affairs" },
    { src: "/partners/partners logo 16.png", alt: "Federal Ministry of Health" },
    { src: "/partners/partners logo 17.jpg", alt: "Environmental Protection Agency" },
    { src: "/partners/partners 18.png", alt: "Federal Ministry of Agriculture" },
    { src: "/partners/partners 19.png", alt: "Keystone Bank" },
    { src: "/partners/partners 20.webp", alt: "Bua" },
    { src: "/partners/partners logo 21.jpg", alt: "Dangote Group" },
    { src: "/partners/partners logo 22.png", alt: "moniepoint" },
    { src: "/partners/partners logo 23.webp", alt: "Palmpay" },
    { src: "/partners/partners logo 24.png", alt: "Smedan" },
    { src: "/partners/partners logo 25.webp", alt: "Access Bank" },
    { src: "/partners/partners logo 26.png", alt: "TajBank" },
    { src: "/partners/partners logo 27.webp", alt: "GTBank" },
  ];

  const highlightStats = [
    {
      label: "KG Collected",
      end: 10000,
      suffix: "+",
      icon: Recycle,
      gradient: "from-emerald-400 via-green-500 to-green-600",
      glow: "shadow-emerald-500/40",
      detail: "Every month",
    },
    {
      label: "Jobs Created",
      end: 500,
      suffix: "+",
      icon: Users,
      gradient: "from-sky-400 via-blue-500 to-indigo-600",
      glow: "shadow-sky-500/40",
      detail: "With fair wages",
    },
    {
      label: "Verified Factories",
      end: 20,
      suffix: "+",
      icon: Building2,
      gradient: "from-amber-400 via-orange-500 to-rose-500",
      glow: "shadow-amber-500/40",
      detail: "Audit-ready",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Partner Logos Section */}
        <div className="text-center mb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 items-center">
            {partnerLogos.map((logo, idx) => (
              <div
                key={idx}
                className="group p-6 bg-gradient-to-b from-white to-slate-50 rounded-2xl border border-slate-100 shadow-[0_15px_45px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300"
              >
                <div className="h-20 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 blur-2xl bg-emerald-200/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="relative h-16 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid - Cinematic cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {highlightStats.map((stat) => (
            <div
              key={stat.label}
              className="relative bg-slate-900 text-white rounded-[28px] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(15,23,42,0.35)]"
            >
              <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_-10%,rgba(52,211,153,0.35),transparent_55%)]" />
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_80%_120%,rgba(56,189,248,0.35),transparent_45%)]" />
              <div className="relative p-8 flex flex-col items-center text-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center ${stat.glow} shadow-2xl`}>
                  <stat.icon className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <div className="font-outfit font-black text-4xl sm:text-5xl">
                  <AnimatedCounter end={stat.end} />
                  <span>{stat.suffix}</span>
                </div>
                <p className="text-lg font-semibold text-white/90">{stat.label}</p>
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">{stat.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
