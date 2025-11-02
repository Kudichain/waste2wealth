import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_image_youth_collecting_waste_27f93307.png";

export function HeroSection() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="font-outfit font-extrabold text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
          Clean Your Community. Earn GreenCoin.
        </h1>
        <p className="font-inter text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          Powered by Kano State Government & NITDA
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="text-lg px-8 bg-primary hover:bg-primary border-primary-border"
            data-testid="button-start-collecting"
            onClick={handleGetStarted}
          >
            Start Collecting
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            data-testid="button-register-factory"
            onClick={handleGetStarted}
          >
            Register Factory
          </Button>
        </div>
        
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by region or trash type..."
              className="pl-12 h-12 bg-white/95 backdrop-blur-sm border-white/30"
              data-testid="input-search"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
