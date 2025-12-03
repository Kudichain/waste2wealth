import { Globe, Zap, Shield } from "lucide-react";

const partners = [
  {
    name: "Global Recyclers",
    logo: "/src/assets/images/partner1.png",
    headline: "Global infrastructure for zero-waste cities",
    story:
      "Their transcontinental recycling parks plug directly into our KOBO payout rails, giving collectors instant visibility as each kilogram is sorted, baled, and exported.",
    badge: "Certified Global",
    badgeTone: "from-emerald-400/80 to-green-500/80",
    icon: Globe,
    highlights: [
      "18 countries using our traceability nodes",
      "42 smart depots meet ISO 14001 & 45001",
      "Funds safety training for 4K youth yearly",
    ],
  },
  {
    name: "KOBO",
    logo: "/src/assets/images/partner2.png",
    headline: "Instant payouts for every verified drop-off",
    story:
      "KOBO embeds our proof-of-collection API into their digital wallet stack, reconciling banked and unbanked transactions with sub-second settlement and fraud scoring.",
    badge: "Official Fintech Partner",
    badgeTone: "from-sky-400/80 to-indigo-500/80",
    icon: Zap,
    highlights: [
      "₦2.4B processed in transparent KOBO flows",
      "Biometrics + OTP secure every transfer",
      "API uptime at 99.98% for waste hubs",
    ],
  },
  {
    name: "EcoWarriors NG",
    logo: "/src/assets/images/partner3.png",
    headline: "Community-led climate action at scale",
    story:
      "EcoWarriors activates women and youth micro-cooperatives, matching our incentives with localized storytelling that keeps collection rates above 92% in the North West.",
    badge: "Community Choice",
    badgeTone: "from-purple-400/80 to-fuchsia-500/80",
    icon: Shield,
    highlights: [
      "52 grassroots cells reporting daily",
      "Community audits cut leakage by 37%",
      "12 innovation labs piloting reuse ideas",
    ],
  },
];

export function TrustedPartners() {
  return (
    <section className="relative py-24 bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(16,185,129,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(59,130,246,0.25),transparent_45%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.35em] text-white/60 mb-4">Strategic Alliances</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-3xl mx-auto">
            These partners co-design our infrastructure, compliance, and last-mile experiences so every collector can plug into a world-class circular economy.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_80px_rgba(15,23,42,0.45)] p-8 flex flex-col gap-6"
            >
              <div className={`absolute inset-0 opacity-40 bg-gradient-to-br ${partner.badgeTone}`} />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                    <img src={partner.logo} alt={partner.name} className="h-10 w-10 object-contain" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">{partner.headline}</p>
                    <h3 className="text-2xl font-semibold">{partner.name}</h3>
                  </div>
                </div>
                <span className="relative z-10 text-xs font-bold px-3 py-1 rounded-full bg-white/15 border border-white/20">
                  {partner.badge}
                </span>
              </div>

              <p className="relative text-white/80 leading-relaxed">
                {partner.story}
              </p>

              <div className="relative space-y-3">
                {partner.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-center gap-3 text-sm text-white/85">
                    <div className="h-6 w-6 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                      <partner.icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
