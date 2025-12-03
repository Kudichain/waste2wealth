import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const knowledgeBase = {
  greetings: [
    "Hello! I'm KOBO Assistant 🌱, your intelligent waste-to-wealth copilot. I'm here to educate, guide, and help you maximize your environmental and financial impact. What would you like to learn today?",
    "Hi there! I'm KOBO, your personal sustainability coach. Ready to turn waste into wealth while learning best practices?",
    "Welcome! I'm KOBO Assistant - think of me as your mini-copilot for recycling, earning, and environmental education. How can I help?",
  ],
  
  // Educational Content - Recycling Deep Dive
  recycling: {
    plastic: "🔹 **PLASTIC RECYCLING GUIDE**\n\n**What to Collect:**\n• PET bottles (#1) - Water, soda bottles\n• HDPE (#2) - Milk jugs, detergent bottles\n• PVC (#3) - Pipes, packaging\n• LDPE (#4) - Plastic bags, wraps\n• PP (#5) - Yogurt containers, bottle caps\n\n**KOBO Earnings:** ₦5-8 per kg\n**Preparation:** Rinse, remove labels, flatten bottles\n**Environmental Impact:** Recycling 1 ton saves 5,774 kWh of energy!\n\n**Pro Tip:** Focus on clear PET bottles - they have the highest value and are always in demand.",
    
    metal: "🔹 **METAL RECYCLING GUIDE**\n\n**Ferrous Metals (Magnetic):**\n• Steel cans, appliances, car parts\n• Earnings: ₦8-12 per kg\n\n**Non-Ferrous Metals (Higher Value):**\n• Aluminum cans: ₦15-20 per kg\n• Copper wiring: ₦50-80 per kg\n• Brass fixtures: ₦40-60 per kg\n\n**Why Metal Matters:** Aluminum can be recycled infinitely without quality loss. Recycling aluminum saves 95% of the energy needed to make new aluminum!\n\n**Pro Tip:** Separate ferrous from non-ferrous using a magnet. Always strip plastic coatings for better rates.",
    
    organic: "🔹 **ORGANIC WASTE EDUCATION**\n\n**Compostable Items:**\n• Food scraps, vegetable peels\n• Coffee grounds, tea bags\n• Yard waste, leaves, grass\n• Eggshells, paper towels\n\n**KOBO Earnings:** ₦2-3 per kg (lower but crucial)\n**Processing Time:** 2-6 months for quality compost\n\n**Environmental Impact:**\n• Reduces methane emissions from landfills by 50%\n• Creates nutrient-rich soil amendment\n• Supports urban farming initiatives\n\n**Pro Tip:** Partner with urban farms - they often pay premium prices for quality compost material.",
    
    paper: "🔹 **PAPER & CARDBOARD GUIDE**\n\n**High-Value Paper:**\n• Office paper (white): ₦10-15 per kg\n• Magazines, catalogs: ₦6-8 per kg\n• Cardboard boxes: ₦5-7 per kg\n• Newspapers: ₦4-6 per kg\n\n**Preparation:**\n• Keep DRY - wet paper loses 80% of value\n• Remove staples, plastic windows\n• Flatten boxes to save space\n\n**Environmental Impact:** Recycling 1 ton of paper saves 17 trees, 7,000 gallons of water, and 4,100 kWh of energy!\n\n**Pro Tip:** Office buildings are goldmines for clean paper waste. Build relationships with offices for steady supply.",
    
    glass: "🔹 **GLASS RECYCLING GUIDE**\n\n**Glass Types:**\n• Clear glass (highest value): ₦3-5 per kg\n• Green/Brown glass: ₦2-4 per kg\n• Mixed glass: ₦1-2 per kg\n\n**Why Separate Colors?** Different colors melt at different temperatures and mixing reduces quality.\n\n**Environmental Impact:**\n• Glass is 100% recyclable forever\n• Recycling glass reduces air pollution by 20%\n• Uses 40% less energy than making new glass\n\n**Safety First:** Wear gloves! Package carefully in boxes or bags to prevent injury.",
  },
  
  // KOBO System Education
  koboSystem: {
    whatIsKobo: "💰 **WHAT IS KOBO?**\n\nKOBO is your digital reward currency for environmental action. Named after Nigeria's kobo coin, it represents real value for real impact.\n\n**Conversion Rate:** 1,000 KOBO = ₦1 (1 KOBO = 1 kobo)\n\n**How You Earn:**\n• Collect & deliver waste: Instant KOBO\n• Complete tasks: Bonus KOBO\n• Refer friends: 100 KOBO per signup\n• Achieve milestones: Up to 1,000 KOBO\n\n**How You Spend:**\n• Withdraw to bank (minimum 1,000 KOBO)\n• Shop discounts (1 KOBO = ₦1 off)\n• Invest in equipment/training\n• Transfer to other collectors",
    
    howToEarn: "📈 **MAXIMIZING YOUR KOBO EARNINGS**\n\n**Beginner Level (0-10,000 KOBO/month):**\n• Focus on high-volume plastics\n• Build vendor relationships\n• Complete daily tasks\n\n**Intermediate Level (10,000-50,000 KOBO/month):**\n• Diversify waste types\n• Invest in weighing scale\n• Join collection teams\n• Target high-value metals\n\n**Expert Level (50,000+ KOBO/month):**\n• Specialize in premium materials (copper, aluminum)\n• Establish collection routes\n• Partner with businesses for bulk contracts\n• Mentor other collectors (earn referral bonuses)\n\n**Pro Strategies:**\n• Morning collections get best pick of waste\n• Industrial areas = high-value metals\n• Residential estates = consistent plastic/paper\n• Restaurants = organic waste opportunities",
    
    withdrawal: "💳 **KOBO WITHDRAWAL GUIDE**\n\n**Requirements:**\n• Minimum: 1,000 KOBO (₦1)\n• Valid bank account linked\n• Verified identity (KYC completed)\n\n**Processing Time:**\n• Instant for amounts under 10,000 KOBO\n• 1-3 hours for 10,000-100,000 KOBO\n• Same day for amounts over 100,000 KOBO\n\n**No Hidden Fees:** What you earn is what you get!\n\n**Security Tips:**\n• Enable 2-factor authentication\n• Never share withdrawal PIN\n• Monitor transaction history regularly",
  },
  
  // Step-by-step guides
  howItWorks: "🚀 **GETTING STARTED WITH KudiChain**\n\n**Step 1: Sign Up** (5 minutes)\n• Choose your role (Collector recommended)\n• Complete basic profile\n• Add bank account for withdrawals\n\n**Step 2: Learn & Prepare** (1 day)\n• Study recycling guides (use this chat!)\n• Get basic equipment (bags, gloves, scale)\n• Find nearby collection points on map\n\n**Step 3: First Collection** (Your first KOBO!)\n• Start with plastic bottles (easiest)\n• Collect 5-10 kg for first delivery\n• Navigate to nearest verified vendor\n• Get weight verified, earn KOBO instantly!\n\n**Step 4: Build Your Business** (Ongoing)\n• Establish daily/weekly collection routes\n• Build relationships with vendors\n• Track earnings and optimize\n• Scale up with teams/equipment\n\n**Expected Timeline:**\n• Week 1: Learn + Earn first 1,000 KOBO\n• Month 1: Establish routine, 10,000+ KOBO\n• Month 3: Optimize routes, 30,000+ KOBO\n• Month 6+: Expert level, 50,000+ KOBO",
  
  opportunities: "🌟 **OPPORTUNITIES & GROWTH PATHS**\n\n**Immediate Income:**\n• Flexible hours - work when you want\n• Daily earnings - cash out anytime\n• No boss - be your own manager\n\n**Skill Development:**\n• Free recycling training & certification\n• Business management workshops\n• Environmental education programs\n• Digital literacy courses\n\n**Career Advancement:**\n• Team Leader: Manage 5-10 collectors (+20% bonus)\n• Zone Coordinator: Oversee entire areas (+50% bonus)\n• Quality Inspector: Verify collections (fixed salary)\n• Trainer: Teach new collectors (per-session pay)\n\n**Financial Services:**\n• Micro-loans for equipment (₦10,000-100,000)\n• Savings programs with 5% interest\n• Insurance coverage for tools/accidents\n\n**Community Impact:**\n• Join cleanup events (bonus KOBO + recognition)\n• Environmental ambassador program\n• School outreach opportunities",
  
  // Environmental Education
  environmentalImpact: {
    why: "🌍 **WHY RECYCLING MATTERS**\n\n**Climate Impact:**\n• Recycling reduces CO2 emissions by 700 million tons annually\n• Manufacturing from recycled materials uses 50-90% less energy\n• Prevents methane release from landfills\n\n**Resource Conservation:**\n• Saves raw materials (oil, trees, minerals)\n• Reduces water consumption by 40-70%\n• Preserves natural habitats\n\n**Economic Impact:**\n• Creates 4x more jobs than landfilling\n• Builds circular economy\n• Reduces import dependency for raw materials\n\n**Nigeria Specific:**\n• Lagos generates 13,000 tons of waste daily\n• Less than 15% currently recycled\n• YOUR WORK can change these statistics!",
    
    yourImpact: "📊 **TRACKING YOUR ENVIRONMENTAL IMPACT**\n\nWhen you recycle through KudiChain, you're making measurable impact:\n\n**For Every 100 kg You Collect:**\n• Trees Saved: ~3 trees (if paper/cardboard)\n• Energy Saved: ~200 kWh (enough to power a home for a week)\n• Water Saved: ~5,000 liters\n• CO2 Prevented: ~150 kg (equivalent to planting 7 trees)\n\n**Your Dashboard Shows:**\n• Total waste diverted from landfills\n• Carbon footprint reduction\n• Water & energy saved\n• Tree equivalents\n\nYou're not just earning KOBO - you're literally saving the planet! 🌱",
  },
  
  // Tips & Best Practices
  tips: {
    safety: "⚠️ **SAFETY FIRST**\n\n**Essential Equipment:**\n• Heavy-duty gloves (prevent cuts/infections)\n• Closed-toe shoes (preferably steel-toed)\n• Hi-visibility vest (for roadside collection)\n• Reusable face mask (dust protection)\n• Hand sanitizer & first-aid kit\n\n**Health Guidelines:**\n• Never handle medical waste\n• Avoid broken glass without proper gloves\n• Wash hands after every collection\n• Get tetanus vaccination (recommended)\n• Stay hydrated, especially in hot weather\n\n**Security Tips:**\n• Collect in pairs for safety\n• Inform family of your collection routes\n• Keep phone charged\n• Avoid late night collections in unfamiliar areas",
    
    efficiency: "⚡ **EFFICIENCY TIPS**\n\n**Route Optimization:**\n• Plan circular routes (start & end near home)\n• Group collections by waste type\n• Schedule based on vendor operating hours\n• Use KudiChain map to find nearby hotspots\n\n**Time Management:**\n• Morning (6-10am): Residential areas (fresh waste)\n• Afternoon (12-3pm): Commercial areas (lunch waste)\n• Evening (4-7pm): Process & deliver\n\n**Storage & Transport:**\n• Invest in sturdy bags (avoid multiple trips)\n• Compact waste to maximize space\n• Separate by type during collection (saves sorting time)\n• Partner with others to share transportation costs\n\n**Record Keeping:**\n• Track daily collections (optimize what works)\n• Note high-value locations\n• Monitor vendor rates (some pay more for volume)\n• Set weekly KOBO goals",
  },
  
  support: "🆘 **NEED HELP?**\n\n**In-App Support:**\n• Live Chat: Available 8am-8pm daily (tap 💬 icon)\n• Help Center: Comprehensive guides & FAQs\n• Report Issues: Track resolution in real-time\n\n**Contact Us:**\n• Hotline: +234-XXX-XXXX (8am-8pm)\n• WhatsApp: +234-XXX-XXXX (24/7 auto-replies)\n• Email: support@motech.com (24hr response)\n• Twitter: @KudiChain_Support\n\n**Emergency:**\n• Accident/Injury: Call hotline immediately\n• Dispute with Vendor: Use in-app mediation\n• App Issues: Report with screenshots\n\n**Community:**\n• Join our Telegram group: 5,000+ collectors\n• Facebook Community: Share tips & successes\n• Monthly meetups: Network & learn\n\n**Your Success = Our Success. We're here to help! 🤝**",
};

function getResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Greetings
  if (lowerMessage.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/)) {
    return knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)];
  }

  // KOBO System Questions
  if (lowerMessage.match(/\b(what is kobo|about kobo|kobo currency|kobo coin)\b/)) {
    return knowledgeBase.koboSystem.whatIsKobo;
  }
  if (lowerMessage.match(/\b(how to earn|maximize earning|make money|increase kobo|earn more)\b/)) {
    return knowledgeBase.koboSystem.howToEarn;
  }
  if (lowerMessage.match(/\b(withdraw|cash out|redeem|bank transfer|payment)\b/)) {
    return knowledgeBase.koboSystem.withdrawal;
  }

  // Recycling Types - Deep Dive
  if (lowerMessage.match(/\b(plastic|pet|hdpe|bottle|container)\b/)) {
    return knowledgeBase.recycling.plastic;
  }
  if (lowerMessage.match(/\b(metal|aluminum|copper|steel|brass|iron|scrap)\b/)) {
    return knowledgeBase.recycling.metal;
  }
  if (lowerMessage.match(/\b(organic|compost|food waste|garden|yard)\b/)) {
    return knowledgeBase.recycling.organic;
  }
  if (lowerMessage.match(/\b(paper|cardboard|newspaper|magazine|book)\b/)) {
    return knowledgeBase.recycling.paper;
  }
  if (lowerMessage.match(/\b(glass|bottle|jar)\b/)) {
    return knowledgeBase.recycling.glass;
  }

  // Environmental Impact Questions
  if (lowerMessage.match(/\b(why recycle|environmental|climate|impact|planet|save earth)\b/)) {
    return knowledgeBase.environmentalImpact.why;
  }
  if (lowerMessage.match(/\b(my impact|contribution|difference|track|statistics)\b/)) {
    return knowledgeBase.environmentalImpact.yourImpact;
  }

  // How it Works
  if (lowerMessage.match(/\b(how|work|start|begin|process|getting started|sign up)\b/) && !lowerMessage.includes("opportunity")) {
    return knowledgeBase.howItWorks;
  }

  // Opportunities & Career
  if (lowerMessage.match(/\b(opportunity|opportunities|career|grow|advancement|team leader)\b/)) {
    return knowledgeBase.opportunities;
  }

  // Safety & Tips
  if (lowerMessage.match(/\b(safety|safe|protection|equipment|gear|health)\b/)) {
    return knowledgeBase.tips.safety;
  }
  if (lowerMessage.match(/\b(tip|tips|efficient|optimize|best practice|advice|improve|route)\b/)) {
    return knowledgeBase.tips.efficiency;
  }

  // Support
  if (lowerMessage.match(/\b(support|help|contact|problem|issue|bug|error)\b/)) {
    return knowledgeBase.support;
  }

  // Contextual Questions
  if (lowerMessage.match(/\b(rate|price|pay|how much|worth)\b/)) {
    return "💰 **CURRENT KOBO RATES (Per Kg)**\n\n• Aluminum: ₦15-20 → 15,000-20,000 KOBO\n• Copper: ₦50-80 → 50,000-80,000 KOBO\n• Steel: ₦8-12 → 8,000-12,000 KOBO\n• Plastic (PET): ₦5-8 → 5,000-8,000 KOBO\n• Paper: ₦10-15 → 10,000-15,000 KOBO\n• Cardboard: ₦5-7 → 5,000-7,000 KOBO\n• Glass: ₦3-5 → 3,000-5,000 KOBO\n• Organic: ₦2-3 → 2,000-3,000 KOBO\n\nRates vary by vendor and material quality. Check vendor profiles for exact rates!";
  }

  if (lowerMessage.match(/\b(vendor|factory|where to deliver|collection point|drop off)\b/)) {
    return "📍 **FINDING VENDORS & FACTORIES**\n\n**Using the Map:**\n• Open KudiChain app → Tap Map icon\n• Green pins = Verified vendors\n• Blue pins = Collection points\n• Orange pins = Factory locations\n\n**Vendor Information Shows:**\n• Operating hours\n• Accepted waste types\n• Current rates per kg\n• Distance from you\n• Rating & reviews\n\n**Pro Tip:** Build relationships with 2-3 vendors. They often give better rates to regular collectors!\n\n**New Vendor Nearby?** Use in-app referral to onboard them and earn bonus KOBO!";
  }

  if (lowerMessage.match(/\b(equipment|tools|scale|bag|gloves|need)\b/)) {
    return "🛠️ **ESSENTIAL EQUIPMENT FOR COLLECTORS**\n\n**Starter Kit (₦5,000-10,000):**\n• Heavy-duty gloves: ₦1,500\n• Reusable collection bags (5): ₦3,000\n• Hi-vis vest: ₦2,000\n• Face masks (pack): ₦1,000\n• Hand sanitizer: ₦500\n\n**Growth Kit (₦20,000-30,000):**\n• Digital scale (50kg capacity): ₦15,000\n• Trolley/cart: ₦8,000\n• Storage bins: ₦5,000\n• Rain gear: ₦3,000\n\n**Professional Kit (₦50,000+):**\n• Industrial scale (100kg+): ₦25,000\n• Cargo bike/tricycle: Variable\n• Sorting trays: ₦5,000\n• Mobile shelter: ₦10,000\n\n**Financing Available:** Apply for micro-loans through KudiChain (5% interest, 6-month repayment).";
  }

  if (lowerMessage.match(/\b(refer|invite|friend|referral|bonus)\b/)) {
    return "🎁 **REFERRAL & REWARDS PROGRAM**\n\n**Invite Friends, Earn KOBO!**\n• Share your unique referral code\n• Friend signs up & completes first collection\n• You both earn 100 KOBO instantly!\n\n**Referral Milestones:**\n• 5 referrals: Extra 500 KOBO\n• 10 referrals: 1,500 KOBO + Bronze Badge\n• 25 referrals: 5,000 KOBO + Silver Badge\n• 50 referrals: 15,000 KOBO + Gold Badge + Team Leader eligibility\n\n**How to Share:**\n• WhatsApp, Facebook, Twitter\n• Download referral posters from app\n• Host community info sessions\n\n**Track Your Referrals:** Dashboard → Referrals tab shows who signed up and your earnings.";
  }

  // General Questions
  if (lowerMessage.includes("?") || lowerMessage.match(/\b(what|when|where|who|why|how)\b/)) {
    return "🤖 **I'm KOBO Assistant - Your Sustainability Copilot!**\n\nI can help you with:\n\n**💰 KOBO System**\n• What is KOBO?\n• How to earn & maximize income\n• Withdrawals & payments\n\n**♻️ Recycling Education**\n• Plastic, metal, paper, glass, organic\n• Rates & preparation tips\n• Environmental impact\n\n**🚀 Getting Started**\n• How KudiChain works\n• Step-by-step guides\n• Equipment needed\n\n**📈 Growth & Opportunities**\n• Career paths\n• Training programs\n• Referral bonuses\n\n**⚡ Tips & Efficiency**\n• Safety guidelines\n• Route optimization\n• Time management\n\n**🆘 Support & Help**\n• Contact information\n• Community resources\n\nJust ask me anything! I'm here to educate and guide you. 🌱";
  }

  // Default response with suggestions
  return "I'm here to help! Try asking me about:\n\n• **Recycling types** - \"Tell me about plastic recycling\"\n• **Earning KOBO** - \"How can I earn more KOBO?\"\n• **Getting started** - \"How does KudiChain work?\"\n• **Safety tips** - \"What safety equipment do I need?\"\n• **Vendors** - \"How do I find vendors near me?\"\n• **Referrals** - \"How does the referral program work?\"\n• **Environmental impact** - \"Why should I recycle?\"\n\nWhat would you like to learn? 🌱";
}

export function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm KOBO Assistant 🌱, your intelligent copilot for turning waste into wealth.\n\n**I can help you:**\n• Learn about recycling (plastic, metal, paper, glass)\n• Understand the KOBO system\n• Maximize your earnings\n• Navigate KudiChain platform\n• Answer environmental questions\n\n**Try asking:**\n\"How does the KOBO system work?\"\n\"What are the best materials to collect?\"\n\"How can I earn more?\"\n\nI'm here to educate, guide, and support your journey! What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform bg-primary"
          aria-label="Open virtual assistant"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] flex flex-col shadow-2xl border-2">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">KOBO Assistant</h3>
                <p className="text-xs opacity-90">Your sustainability copilot</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
