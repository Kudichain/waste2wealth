import { Building2, Leaf, MapPin, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";

export function Footer() {
  const [, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <footer className="bg-gradient-to-b from-background/50 to-background border-t border-white/10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="font-outfit font-bold text-2xl">KudiChain</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Empowering communities through sustainable waste management. Clean streets. Earn coins. Build futures.
            </p>
            <Button
              variant="outline"
              className="group"
              onClick={() => handleNavigation("/office-locations")}
            >
              <MapPin className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
              Find Our Offices
            </Button>
          </div>
          
          <div>
            <h3 className="font-inter font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => handleNavigation("/#how-it-works")} className="hover:text-primary transition-colors">
                  How it Works
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/for-collectors")} className="hover:text-primary transition-colors">
                  For Collectors
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/for-factories")} className="hover:text-primary transition-colors">
                  For Factories
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/pricing")} className="hover:text-primary transition-colors">
                  Pricing
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-inter font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => handleNavigation("/about")} className="hover:text-primary transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/partners")} className="hover:text-primary transition-colors">
                  Partners
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/impact")} className="hover:text-primary transition-colors">
                  Impact
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/event-gallery")} className="hover:text-primary transition-colors">
                  Event Gallery
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/contact")} className="hover:text-primary transition-colors">
                  Contact
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/office-locations")} className="hover:text-primary transition-colors">
                  Our Offices
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-inter font-semibold mb-4">Legal & Admin</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <button onClick={() => handleNavigation("/privacy")} className="hover:text-primary transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/terms")} className="hover:text-primary transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation("/cookies")} className="hover:text-primary transition-colors">
                  Cookie Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation("/admin/login")}
                  className="flex items-center gap-2 hover:text-primary transition-colors group"
                >
                  <Shield className="h-4 w-4 group-hover:text-primary" />
                  Admin Login
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 KudiChain. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Headquartered in Lagos, Nigeria
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Powered by 
              <span className="text-primary font-semibold">KudiChain</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
