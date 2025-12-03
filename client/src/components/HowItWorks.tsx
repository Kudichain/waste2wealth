import { Recycle, MapPin, Coins } from "lucide-react";

const steps = [
  {
    icon: Recycle,
    title: "Collect",
    description: "Pick up plastic, metal, and organic waste",
    gradient: "from-green-500 to-emerald-600",
    glow: "group-hover:shadow-green-500/50"
  },
  {
    icon: MapPin,
    title: "Deliver",
    description: "Drop it off at a verified recycler near you",
    gradient: "from-blue-500 to-indigo-600",
    glow: "group-hover:shadow-blue-500/50"
  },
  {
    icon: Coins,
    title: "Earn",
    description: "Receive Green Coin for the trash weight",
    gradient: "from-purple-500 to-pink-600",
    glow: "group-hover:shadow-purple-500/50"
  }
];

export function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-outfit font-bold text-3xl sm:text-4xl md:text-5xl text-center mb-10 sm:mb-12 md:mb-16 text-gray-900 uppercase">
          HOW IT WORKS
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <div 
                key={index} 
                className="text-center group hover:scale-105 transition-all duration-300"
              >
                {/* Icon Circle with enhanced design */}
                <div className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-4 sm:mb-5 md:mb-6 bg-gradient-to-br ${step.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-500 shadow-2xl group-hover:rotate-6 group-hover:scale-110 ${step.glow}`}>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-white opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500"></div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-4 border-white/30 group-hover:border-white/60 transition-all duration-500"></div>
                  {/* Icon */}
                  <Icon className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-white relative z-10 drop-shadow-2xl" strokeWidth={2.5} />
                  {/* Number badge */}
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-125 transition-transform duration-300">
                    <span className="font-bold text-base sm:text-lg md:text-xl bg-gradient-to-br from-green-600 to-blue-600 bg-clip-text text-transparent">{index + 1}</span>
                  </div>
                </div>

                <h3 className="font-inter font-bold text-xl sm:text-2xl mb-2 sm:mb-3 text-gray-900 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
