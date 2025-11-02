import { Recycle, MapPin, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: Recycle,
    title: "Collect",
    description: "Find trash collection tasks in your area and accept jobs with one tap"
  },
  {
    icon: MapPin,
    title: "Deliver",
    description: "Use GPS navigation to deliver waste to verified recycling factories"
  },
  {
    icon: Coins,
    title: "Earn",
    description: "Get instant GreenCoin rewards deposited to your wallet upon verification"
  }
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-inter font-bold text-4xl md:text-5xl text-center mb-4">
          How It Works
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
          Three simple steps to start earning while making your community cleaner
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="p-8 text-center hover-elevate transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-inter font-semibold text-xl mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
