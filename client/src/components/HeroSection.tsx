import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { nigeriaStates } from "@/data/nigeriaStates";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function HeroSection() {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [selectedState, setSelectedState] = useState("");
  const [selectedLGA, setSelectedLGA] = useState("");
  const [openStatePopover, setOpenStatePopover] = useState(false);
  const [openLGAPopover, setOpenLGAPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const backgroundImages = [
    "/backgrounds/clean%20your%20community%201.jpg",
    "/backgrounds/clean%20your%20community%202.jpg",
    "/backgrounds/clean%20your%20community%203.jpg",
    "/backgrounds/clean%20your%20community%204.jpg",
    "/backgrounds/clean%20your%20community%205.webp",
    "/backgrounds/clean%20your%20community%206.jpg",
  ];

  const slideCaptions = [
    { title: "Community Cleanup Events", subtitle: "500+ jobs created in Kano", icon: "🌍" },
    { title: "Women & Youth Collectors", subtitle: "Empowering 2,100+ participants", icon: "👥" },
    { title: "Factory Processing Centers", subtitle: "1,200 tons processed monthly", icon: "🏭" },
    { title: "University Conversion Centers", subtitle: "Innovation meets sustainability", icon: "🎓" },
    { title: "Sustainable Recycling", subtitle: "3,500 tons CO₂ offset achieved", icon: "♻️" },
    { title: "Digital Waste Management", subtitle: "₦9.8M disbursed to collectors", icon: "💰" },
  ];

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = backgroundImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error loading images:", error);
        setImagesLoaded(true); // Still set to true to show fallback
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || !imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length, isAutoPlay]);

  const nextImage = () => {
    setIsAutoPlay(false);
    setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
  };

  const prevImage = () => {
    setIsAutoPlay(false);
    setCurrentImageIndex((prev) => 
      prev === 0 ? backgroundImages.length - 1 : prev - 1
    );
  };

  const handleGetStarted = () => {
    setLocation("/collectors/register");
  };

  const getCurrentLGAs = () => {
    const state = nigeriaStates.find(s => s.name === selectedState);
    return state ? state.lgas : [];
  };

  const trashTypes = ["All Trash Types", "Plastic", "Metal", "Paper", "Glass", "Electronics", "Organic"];
  const [selectedTrashType, setSelectedTrashType] = useState("All Trash Types");

  return (
    <section className="relative min-h-[800px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-blue-600">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] animate-pulse" />
      </div>

      {/* Loading State */}
      {!imagesLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-600 via-green-500 to-blue-600">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-semibold text-lg">Loading Experience...</p>
          </div>
        </div>
      )}

      {/* Background Images with Enhanced Sliding Effect */}
      {imagesLoaded && backgroundImages.map((image, index) => (
        <div
          key={image}
          className={`
            absolute inset-0 bg-cover bg-center transition-all duration-\[1500ms\] ease-in-out
            ${index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"}
          `}
          style={{ 
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'transparent'
          }}
        >
          {/* Enhanced Multi-layer Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 via-transparent to-blue-900/30" />
          
          {/* Animated light rays effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.2),transparent_60%)] animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
      ))}

      {/* Navigation Buttons - Enhanced design with glow effect */}
      <button
        onClick={prevImage}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/40 transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-white/50 group border border-white/30"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-7 w-7 text-white drop-shadow-2xl group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/40 transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-white/50 group border border-white/30"
        aria-label="Next image"
      >
        <ChevronRight className="h-7 w-7 text-white drop-shadow-2xl group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
      </button>

      {/* Image Indicators - Enhanced with glow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlay(false);
              setCurrentImageIndex(index);
            }}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? "w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                : "w-2.5 bg-white/60 hover:bg-white/90 hover:w-4 hover:shadow-[0_0_6px_rgba(255,255,255,0.6)]"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Caption - Compact version */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-auto max-w-lg px-6">
        <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 shadow-lg animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-xl">{slideCaptions[currentImageIndex].icon}</span>
            <div>
              <h3 className="text-white font-semibold text-sm leading-tight">
                {slideCaptions[currentImageIndex].title}
              </h3>
              <p className="text-white/90 text-xs">
                {slideCaptions[currentImageIndex].subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        {/* Main Headline with enhanced styling */}
        <div className="mb-8 animate-slide-up">
          <div className="inline-block mb-4 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
            <span className="text-white font-semibold text-sm md:text-base tracking-wide">🌍 Transform Waste into Wealth</span>
          </div>
          <h1 className="font-outfit font-extrabold text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight uppercase tracking-tight drop-shadow-2xl">
            CLEAN YOUR<br/>
            <span className="bg-gradient-to-r from-green-300 via-blue-300 to-green-300 bg-clip-text text-transparent animate-gradient">
              COMMUNITY.
            </span><br/>
            <span className="text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.5)]">
              EARN KOBO.
            </span>
          </h1>
          <p className="font-inter text-xl md:text-2xl text-white/95 mb-2 drop-shadow-lg font-medium">
            Powered by KudiChain
          </p>
          <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
            <span className="flex items-center gap-1">
              ✓ <span className="font-semibold">2,100+</span> Active Collectors
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              ✓ <span className="font-semibold">₦9.8M</span> Disbursed
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              ✓ <span className="font-semibold">1,200</span> Tons/Month
            </span>
          </div>
        </div>
        
        {/* CTA Buttons with enhanced effects */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <Button 
            size="lg" 
            className="text-lg px-12 py-7 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-105 font-bold rounded-full border-2 border-white/20 hover:border-white/40"
            data-testid="button-start-collecting"
            onClick={handleGetStarted}
          >
            <span className="drop-shadow-lg">Start Collecting</span>
            <span className="ml-2 text-xl">→</span>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-12 py-7 bg-white/95 backdrop-blur-sm text-gray-800 hover:bg-white hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50 font-bold rounded-full border-2 border-white/50"
            data-testid="button-local-vendor"
            onClick={() => setLocation("/vendors/login")}
          >
            Local Vendor
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-12 py-7 bg-white/95 backdrop-blur-sm text-gray-800 hover:bg-white hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50 font-bold rounded-full border-2 border-white/50"
            data-testid="button-register-factory"
            onClick={() => setLocation("/register-factory")}
          >
            Register Factory
          </Button>
        </div>
        
        {/* Search Box with enhanced design */}
        <div className="max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="relative bg-white/98 backdrop-blur-md rounded-full shadow-2xl hover:shadow-green-500/30 overflow-hidden border-2 border-white/50 transition-all duration-300 hover:scale-[1.02]">
            {/* Gradient accent on top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500" />
            
            <div className="flex items-center">
              {/* State Selector */}
              <Popover open={openStatePopover} onOpenChange={setOpenStatePopover}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-6 py-5 border-r border-gray-200 hover:bg-green-50 transition-colors group">
                    <MapPin className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-700 group-hover:text-green-700 transition-colors">
                      {selectedState || "Select State"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-80" align="start">
                  <Command>
                    <CommandInput placeholder="Search states..." />
                    <CommandList>
                      <CommandEmpty>No state found.</CommandEmpty>
                      <CommandGroup>
                        {nigeriaStates.map((state) => (
                          <CommandItem
                            key={state.name}
                            value={state.name}
                            onSelect={(value) => {
                              setSelectedState(value);
                              setSelectedLGA("");
                              setOpenStatePopover(false);
                            }}
                          >
                            {state.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* LGA Selector */}
              <Popover open={openLGAPopover} onOpenChange={setOpenLGAPopover}>
                <PopoverTrigger asChild>
                  <button 
                    className="flex items-center gap-2 px-6 py-5 border-r border-gray-200 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    disabled={!selectedState}
                  >
                    <span className="font-semibold text-gray-700 group-hover:text-green-700 transition-colors">
                      {selectedLGA || "Select LGA"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-80" align="start">
                  <Command>
                    <CommandInput placeholder="Search LGAs..." />
                    <CommandList>
                      <CommandEmpty>No LGA found.</CommandEmpty>
                      <CommandGroup>
                        {getCurrentLGAs().map((lga) => (
                          <CommandItem
                            key={lga.name}
                            value={lga.name}
                            onSelect={(value) => {
                              setSelectedLGA(value);
                              setOpenLGAPopover(false);
                            }}
                          >
                            {lga.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Trash Type Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex-1 px-6 py-5 text-left hover:bg-green-50 transition-colors group">
                    <span className="text-gray-600 font-medium group-hover:text-green-700 transition-colors">{selectedTrashType}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-64" align="end">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {trashTypes.map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={(value) => {
                              setSelectedTrashType(value);
                            }}
                          >
                            {type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <button className="px-8 py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 group">
                <Search className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Helper text */}
          <p className="text-white/80 text-sm mt-4 drop-shadow-md">
            🔍 Find collectors and vendors near you • Available 24/7
          </p>
        </div>
      </div>
    </section>
  );
}
