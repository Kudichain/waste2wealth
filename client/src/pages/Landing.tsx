import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustIndicators } from "@/components/TrustIndicators";
import { HowItWorks } from "@/components/HowItWorks";
import { DynamicTestimonials } from "@/components/DynamicTestimonials";
import { InteractiveImpactDashboard } from "@/components/InteractiveImpactDashboard";
import { UNSDGsSection } from "@/components/UNSDGsSection";
import { Footer } from "@/components/Footer";
import { VirtualAssistant } from "@/components/VirtualAssistant";
import { ImpactStats } from "@/components/ImpactStats";
import { TrustedPartners } from "@/components/TrustedPartners";
import { DashboardPreview } from "@/components/DashboardPreview";
import { ReferralBanner } from "@/components/ReferralBanner";
import { FloatingCTA } from "@/components/FloatingCTA";
import { LiveDataDashboard } from "@/components/LiveDataDashboard";
import { CertificationBadges } from "@/components/CertificationBadges";
import { SecurityFAQ } from "@/components/SecurityFAQ";
import { EnhancedGamification } from "@/components/EnhancedGamification";
import { CommunityHub } from "@/components/CommunityHub";
import { SkipToMain, LiveRegion } from "@/lib/accessibility";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Wallet, Coins, TrendingUp, Globe2, Scale, Users, Smartphone, Gift, Share2, Copy, Check, Leaf, Award, Target, Sparkles, Crown, ArrowRight, HandCoins, Recycle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

const spotlightStories = [
  {
    name: "Amina Yusuf",
    role: "Lead Collector · Kano",
    quote: "KudiChain turned our weekly cleanups into steady income. Every bag we recycle now keeps girls in school and puts food on the table.",
    image: "/testimonials/Collector_testimonial_portrait_female_74ae409a.png",
  },
  {
    name: "Ibrahim Dogo",
    role: "Vendor Partner · Abuja",
    quote: "Instead of importing raw materials, I now buy sorted plastics from local collectors. The supply is reliable and the impact is real.",
    image: "/testimonials/Collector_testimonial_portrait_male_e549f04e.png",
  },
  {
    name: "Ngozi Umeh",
    role: "Factory Liaison · Lagos",
    quote: "We offset 1,200 tons of waste every month. Seeing bottle piles convert to KOBO rewards keeps our teams inspired.",
    image: "/testimonials/Factory_owner_testimonial_portrait_87084a8c.png",
  },
];

const gamificationHighlights = [
  {
    title: "Eco Guardian",
    description: "Collect 250kg/month and unlock premium KOBO boosts.",
    points: "+250 KOBO",
    gradient: "from-emerald-500 to-lime-500",
    icon: Leaf,
  },
  {
    title: "Community Captain",
    description: "Lead a cleanup squad of 15 members for 6 weeks straight.",
    points: "+540 pts",
    gradient: "from-blue-500 to-indigo-600",
    icon: Crown,
  },
  {
    title: "Golden Scale",
    description: "Maintain 100% accurate weighing records for 30 days.",
    points: "Trust Tier +",
    gradient: "from-purple-500 to-pink-600",
    icon: Award,
  },
];

const leaderboardSample = [
  { team: "Green Ninjas", location: "Kano", score: 1280 },
  { team: "Waste2Gold", location: "Port Harcourt", score: 1095 },
  { team: "Eco Queens", location: "Abuja", score: 982 },
  { team: "Northern Guardians", location: "Kaduna", score: 940 },
];

const involvementPaths = [
  {
    title: "Collectors",
    description: "Earn KOBO daily with verified weighing points and same-day payouts.",
    action: "Join Now",
    route: "/collectors/register",
    accent: "from-green-500 to-emerald-500",
    icon: Target,
  },
  {
    title: "Vendors",
    description: "Source digitized, traceable waste streams for your facility.",
    action: "Earn KOBO Today",
    route: "/vendors/login",
    accent: "from-blue-500 to-indigo-600",
    icon: HandCoins,
  },
  {
    title: "Partners",
    description: "Fund waste-to-wealth accelerators and unlock ESG reporting.",
    action: "Partner With Us",
    route: "/contact",
    accent: "from-amber-500 to-orange-500",
    icon: Sparkles,
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [treeGrowth, setTreeGrowth] = useState(25);
  const referralCode = "MOTECH2025"; // This would come from user's account in real implementation

  const handleGetStarted = () => {
    setLocation("/collectors/register");
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`Join KudiChain with my code: ${referralCode} - Turn waste into wealth! https://motech.app/ref/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const growthTimer = setInterval(() => {
      setTreeGrowth((prev) => {
        if (prev >= 92) return 92;
        return prev + 2;
      });
    }, 120);

    return () => clearInterval(growthTimer);
  }, []);

  useEffect(() => {
    const storyTimer = setInterval(() => {
      setStoryIndex((prev) => (prev + 1) % spotlightStories.length);
    }, 6000);

    return () => clearInterval(storyTimer);
  }, []);

  const currentStory = spotlightStories[storyIndex];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/50 to-background">
      <SkipToMain />
      <LiveRegion />
      <Header />
      <main id="main-content" className="flex-1">
        <HeroSection />

        {/* Why it matters */}
        <section id="why-it-matters" className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-900/70 to-slate-900 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(250,250,250,0.2),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(34,197,94,0.25),transparent_50%)]" />
          <div className="max-w-6xl mx-auto relative z-10 grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="uppercase tracking-[0.3em] text-emerald-200 text-xs sm:text-sm mb-4">Why it matters</p>
              <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
                1,200 tons of waste saved monthly, powered by collectors with bold dreams.
              </h2>
              <p className="text-white/80 text-base sm:text-lg md:text-xl leading-relaxed mb-8">
                Each bag of plastic rescued from drains becomes instant KOBO, new jobs, and cleaner streets. We turn climate anxiety into measurable progress.
              </p>
              <ul className="space-y-3 text-white/85 text-sm sm:text-base">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.7)]" />
                  44 LGAs active across Nigeria with live compliance tracking.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-300" />
                  2,100 youth & women receiving predictable payouts every week.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-200" />
                  Verified carbon savings delivered to ESG dashboards automatically.
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 text-sm sm:text-base px-8 py-5 font-semibold shadow-white/30 shadow-2xl"
                  onClick={handleGetStarted}
                >
                  Join the Mission
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  onClick={() => setLocation("/contact")}
                >
                  Talk to Partnerships
                </Button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-emerald-500/20 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200 mb-4">CO₂ offset visual</p>
              <div className="flex flex-col items-center">
                <div className="relative h-52 w-28 bg-emerald-100/20 border border-emerald-300/40 rounded-full overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 via-lime-400 to-green-200 transition-all duration-700"
                    style={{ height: `${treeGrowth}%` }}
                  />
                  <Leaf className="absolute top-4 left-1/2 -translate-x-1/2 h-10 w-10 text-emerald-200 drop-shadow-lg" />
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">CO₂ offset</p>
                  <p className="text-4xl font-bold">{Math.round(treeGrowth * 13).toLocaleString()} kg</p>
                  <p className="text-white/70 text-sm">≈ {Math.round(treeGrowth * 35).toLocaleString()} trees thriving</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 w-full text-center text-sm">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl font-bold">+11%</p>
                    <p className="text-white/70">Impact growth</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-white/70">Live counters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <div className="animate-slide-up bg-gradient-to-r from-background via-muted/50 to-background" style={{ animationDelay: "200ms" }}>
          <TrustIndicators />
        </div>

        <ImpactStats />

        {/* Immersive waste-to-wealth transformation */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-6 overflow-hidden bg-fixed bg-cover" style={{ backgroundImage: "url('/backgrounds/clean%20your%20community%204.jpg')" }}>
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]" />
          <div className="max-w-5xl mx-auto relative z-10 text-center text-white">
            <p className="uppercase tracking-[0.4em] text-emerald-200 text-xs sm:text-sm">Waste → Wealth</p>
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl mt-4 mb-6">Watch plastic become purchasing power.</h2>
            <p className="text-white/80 max-w-3xl mx-auto text-base sm:text-lg mb-8">
              Every item you drop passes through a digital chain of custody. Tap into the journey below.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-white/90">
              <div className="w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shadow-2xl">
                <Recycle className="h-10 w-10 mb-2" />
                <span className="text-sm font-semibold">Discarded Bottle</span>
              </div>
              <ArrowRight className="h-10 w-10 text-emerald-200 animate-pulse" />
              <div className="w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shadow-2xl">
                <Target className="h-10 w-10 mb-2" />
                <span className="text-sm font-semibold">Smart Sorting</span>
              </div>
              <ArrowRight className="h-10 w-10 text-emerald-200 animate-pulse" />
              <div className="w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shadow-2xl">
                <Coins className="h-10 w-10 mb-2" />
                <span className="text-sm font-semibold">KOBO Rewards</span>
              </div>
            </div>
          </div>
        </section>

        {/* Global Impact Section */}
        <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.1),rgba(59,130,246,0.05))]" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="font-outfit font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 md:mb-6 tracking-tight px-4">Global Impact, Local Action</h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto px-4">Join our worldwide movement transforming waste management while creating sustainable economic opportunities.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[{ icon: Globe2, title: "International Standards", description: "Operating with global best practices in waste management and sustainability", delay: 0, gradient: "from-green-500 to-emerald-600", glow: "group-hover:shadow-green-500/50" }, { icon: Scale, title: "Fair Compensation", description: "Market-driven rates ensuring equitable earnings for all participants", delay: 100, gradient: "from-blue-500 to-indigo-600", glow: "group-hover:shadow-blue-500/50" }, { icon: Users, title: "Community First", description: "Building sustainable communities through environmental stewardship", delay: 200, gradient: "from-purple-500 to-pink-600", glow: "group-hover:shadow-purple-500/50" }].map((feature, index) => (
                <div key={index} className="group bg-gradient-to-b from-background to-muted/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1" style={{ animationDelay: `${feature.delay}ms` }}>
                  <div className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-4 sm:mb-5 md:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${feature.glow}`}>
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                    <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white relative z-10 drop-shadow-2xl" strokeWidth={2} />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Data Dashboard with Real-Time Metrics */}
        <LiveDataDashboard />

        {/* Interactive Impact Dashboard with Live Counters */}
        <InteractiveImpactDashboard />

        {/* UN SDGs & Climate Action Section */}
        <UNSDGsSection />

        {/* Certifications and Compliance */}
        <CertificationBadges />

        {/* Human-centered storytelling */}
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(16,185,129,0.2),transparent_50%)]" />
          <div className="max-w-6xl mx-auto relative z-10 grid gap-12 md:grid-cols-2 items-center">
            <div className="relative h-96 rounded-[36px] overflow-hidden shadow-3xl border border-white/20">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentStory.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 w-full p-8">
                <p className="text-lg text-white/90">“{currentStory.quote}”</p>
                <div className="mt-4">
                  <h3 className="text-2xl font-semibold">{currentStory.name}</h3>
                  <p className="text-sm text-white/70">{currentStory.role}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="uppercase tracking-[0.4em] text-emerald-200 text-xs sm:text-sm mb-4">Real stories</p>
              <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl mb-6">
                Faces of the movement.
              </h2>
              <p className="text-white/80 text-base sm:text-lg mb-8">
                Collectors, vendors, and partners share how Waste2Wealth changed their month-end reality. Each portrait is verified and refreshed automatically.
              </p>
              <div className="flex gap-4 mb-8">
                {spotlightStories.map((story, index) => (
                  <button
                    key={story.name}
                    className={`w-14 h-14 rounded-2xl overflow-hidden border transition-all duration-300 ${
                      storyIndex === index ? "border-white scale-105" : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                    onClick={() => setStoryIndex(index)}
                    aria-label={`Show story for ${story.name}`}
                  >
                    <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  onClick={() => setStoryIndex((prev) => (prev - 1 + spotlightStories.length) % spotlightStories.length)}
                >
                  Previous
                </Button>
                <Button
                  className="bg-white text-slate-900 hover:bg-emerald-50"
                  onClick={() => setStoryIndex((prev) => (prev + 1) % spotlightStories.length)}
                >
                  Next story
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* KOBO Showcase Section */}
        <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),rgba(59,130,246,0.1))]" />
          </div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-slide-up">
              <h2 className="font-outfit font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent px-4">Digital Currency for Environmental Change</h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4">Experience seamless transactions with KudiChain, fully integrated with Nigeria's KOBO digital infrastructure.</p>
            </div>
            <div className="animate-slide-up flex justify-center px-4" style={{ animationDelay: "100ms" }}>
              <img
                src="/kobo-banner.png"
                alt="KOBO Coin Banner"
                className="rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-3xl h-auto object-cover border-2 sm:border-4 border-green-200"
                style={{ aspectRatio: '3/1', maxHeight: 260 }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16">
              {[{ icon: Wallet, title: "Instant Payouts", description: "Receive KOBO tokens immediately after verification, directly to your digital wallet", gradient: "from-green-500 to-green-600", glow: "group-hover:shadow-green-500/50", delay: 0 }, { icon: Coins, title: "KOBO Integration", description: "Seamless conversion between KOBO and Naira with real-time rates (1 KOBO = ₦1,000)", gradient: "from-blue-500 to-blue-600", glow: "group-hover:shadow-blue-500/50", delay: 100 }, { icon: TrendingUp, title: "Growth Analytics", description: "Track your environmental and financial impact with detailed analytics", gradient: "from-purple-500 to-purple-600", glow: "group-hover:shadow-purple-500/50", delay: 200 }].map((feature, index) => (
                <div key={index} className="group backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-b from-background to-muted/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1" style={{ animationDelay: `${feature.delay}ms` }}>
                  <div className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 bg-gradient-to-br ${feature.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${feature.glow}`}>
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                    <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white relative z-10 drop-shadow-2xl" strokeWidth={2} />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-center">{feature.title}</h3>
                  <p className="text-muted-foreground text-center text-xs sm:text-sm md:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works simplified */}
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-white" id="how-it-works">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <p className="uppercase tracking-[0.4em] text-emerald-500 text-xs sm:text-sm mb-3">How it works</p>
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900">
              3 steps to converting waste into wealth.
            </h2>
          </div>
          <div className="grid gap-8 md:gap-10 md:grid-cols-3">
            {[{ title: "Collect", description: "Bag plastics, glass, or organics with geo-tagged photos.", icon: Recycle, accent: "from-emerald-500 to-emerald-600" }, { title: "Verify", description: "Drop at a hub, get AI weight checks & compliance receipts.", icon: Target, accent: "from-blue-500 to-indigo-600" }, { title: "Earn", description: "Receive KOBO tokens or cash-out instantly.", icon: HandCoins, accent: "from-amber-500 to-orange-500" }].map((step, index) => (
              <div key={step.title} className="relative bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-lg hover:-translate-y-2 transition-all">
                <div className="absolute -top-4 left-8 text-7xl font-black text-slate-100">0{index + 1}</div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center text-white mb-6 relative z-10`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3 relative z-10">{step.title}</h3>
                <p className="text-slate-600 relative z-10">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Security & Trust Section */}
        <SecurityFAQ />
        
        {/* Dynamic Testimonials with Video Support */}
        <DynamicTestimonials />
        
        <TrustedPartners />
        <DashboardPreview />
        
        {/* Gamification showcase */}
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-900 text-white">
          <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="uppercase tracking-[0.4em] text-emerald-200 text-xs sm:text-sm mb-4">Gamification</p>
              <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl mb-6">Earn badges. Climb the live leaderboard.</h2>
              <p className="text-white/80 text-base sm:text-lg mb-8">
                Every verified drop earns points, trust tiers, and KOBO boosts. Players see progress instantly, making sustainability addictive.
              </p>
              <div className="grid gap-5">
                {gamificationHighlights.map((badge) => (
                  <div key={badge.title} className="flex items-center gap-5 bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center text-white text-2xl shadow-2xl`}>
                      <badge.icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{badge.title}</h3>
                      <p className="text-white/70 text-sm">{badge.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{badge.points}</p>
                      <p className="text-xs uppercase tracking-widest text-white/60">Boost</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 rounded-3xl border border-white/10 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Live leaderboard</h3>
                <span className="text-emerald-200 text-sm">Updated 1 min ago</span>
              </div>
              <div className="space-y-4">
                {leaderboardSample.map((entry, index) => (
                  <div key={entry.team} className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-lg">{index + 1}</div>
                      <div>
                        <p className="font-semibold">{entry.team}</p>
                        <p className="text-white/70 text-sm">{entry.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{entry.score}</p>
                      <p className="text-xs uppercase tracking-widest text-white/60">pts</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-white text-slate-900 hover:bg-emerald-50" onClick={handleGetStarted}>
                Join leaderboard
              </Button>
            </div>
          </div>
        </section>
        
        {/* Community Forum & Live Chat */}
        <CommunityHub />

        {/* Get involved section */}
        <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-slate-950 text-white">
          <div className="max-w-6xl mx-auto text-center mb-12">
            <p className="uppercase tracking-[0.4em] text-emerald-200 text-xs sm:text-sm">Get involved</p>
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl mt-4 mb-3">Pick your path.</h2>
            <p className="text-white/70 text-base sm:text-lg max-w-3xl mx-auto">
              Whether you carry recyclables, buy materials, or fund community grids — there is one bold CTA for you.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {involvementPaths.map((path) => (
              <div key={path.title} className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col h-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.accent} flex items-center justify-center text-white text-2xl mb-6`}>
                  <path.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{path.title}</h3>
                <p className="text-white/70 flex-1">{path.description}</p>
                <Button
                  className="mt-6 bg-white text-slate-900 hover:bg-emerald-50"
                  onClick={() => setLocation(path.route)}
                >
                  {path.action}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Download App + Referral Section */}
        <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background" id="get-involved">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-stretch">
              
              {/* Download App Card */}
              <Card className="bg-gradient-to-br from-green-500 to-blue-600 text-white border-0 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6 sm:p-8 md:p-12">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0">
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white opacity-0 hover:opacity-30 blur-lg transition-opacity duration-500"></div>
                      <Smartphone className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 relative z-10 drop-shadow-lg" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-outfit font-bold text-xl sm:text-2xl md:text-3xl">Get the App</h3>
                      <p className="text-white/90 text-xs sm:text-sm">Turn waste into wealth on-the-go</p>
                    </div>
                  </div>
                  
                  <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed">
                    Download KudiChain mobile app for real-time tracking, instant KOBO earnings, and seamless waste collection management.
                  </p>

                  <div className="space-y-3 sm:space-y-4">
                    {/* iOS App Store Button */}
                    <a 
                      href="https://apps.apple.com/app/motech" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button 
                        size="lg" 
                        variant="secondary" 
                        className="w-full bg-white text-gray-900 hover:bg-gray-100 text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <span className="truncate">Download on App Store</span>
                      </Button>
                    </a>

                    {/* Google Play Button */}
                    <a 
                      href="https://play.google.com/store/apps/details?id=com.motech" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button 
                        size="lg" 
                        variant="secondary" 
                        className="w-full bg-white text-gray-900 hover:bg-gray-100 text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                        </svg>
                        <span className="truncate">Get it on Google Play</span>
                      </Button>
                    </a>
                  </div>

                  <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-center">
                    <div className="bg-white/10 backdrop-blur rounded-lg p-2 sm:p-3">
                      <div className="font-bold text-lg sm:text-xl md:text-2xl">4.8★</div>
                      <div className="text-[10px] sm:text-xs text-white/80">App Rating</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-2 sm:p-3">
                      <div className="font-bold text-lg sm:text-xl md:text-2xl">50K+</div>
                      <div className="text-[10px] sm:text-xs text-white/80">Downloads</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-2 sm:p-3">
                      <div className="font-bold text-lg sm:text-xl md:text-2xl">24/7</div>
                      <div className="text-[10px] sm:text-xs text-white/80">Support</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invite Friends Card */}
              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white border-0 shadow-2xl rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-outfit text-2xl">Mystery Gift</h3>
                      <p className="text-white/80 text-sm">Tap the gift box</p>
                    </div>
                  </div>
                  <button
                    className="w-full aspect-[5/2] rounded-[28px] bg-white/15 border-2 border-dashed border-white/40 flex flex-col items-center justify-center text-center hover:bg-white/25 transition-all"
                    onClick={handleCopyReferral}
                  >
                    <Gift className="h-12 w-12 mb-3" />
                    <p className="text-lg font-semibold">Invite Friends, Earn KOBO</p>
                    <p className="text-sm text-white/80">Tap to reveal referral code</p>
                  </button>
                </div>
                <div className="mt-6 bg-white/20 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest">Your code</p>
                    <p className="text-2xl font-bold">{referralCode}</p>
                  </div>
                  <Button variant="secondary" className="bg-white text-purple-600" onClick={handleCopyReferral}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-blue-600" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),rgba(255,255,255,0))]" />
          </div>
          <div className="max-w-4xl mx-auto relative z-10 text-center text-white px-4">
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-slide-up">Join the Waste Wave</h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 opacity-90 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
              Be part of a global movement transforming waste management while earning sustainable income
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-sm sm:text-base md:text-lg px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-white/30 font-semibold animate-slide-up bg-white text-green-600 hover:bg-white/90"
              style={{ animationDelay: "200ms" }}
              onClick={handleGetStarted}
              data-testid="button-cta-bottom"
            >
              Start Your Journey
              <span className="ml-2 text-xl sm:text-2xl">→</span>
            </Button>
          </div>
        </section>
      </main>
      <Footer />

      {/* Floating elements */}
      <VirtualAssistant />
      <FloatingCTA />
      {/* Referral tag (positioned fixed within component) */}
      <ReferralBanner />
    </div>
  );
}
