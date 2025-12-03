import { Button } from "@/components/ui/button";
import { Leaf, Menu, Coins, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { RegionSelector } from "./RegionSelector";
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PreloadLink } from "./PreloadLink";
import { preloadRoute } from "@/lib/preloadRoutes";

interface HeaderProps {
  balance?: number;
  showWallet?: boolean;
}

export function Header({ balance = 0, showWallet = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleNavigation = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/"); // Redirect to landing page immediately
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => handleNavigation("/")} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="font-outfit font-bold text-xl text-white drop-shadow-lg">KudiChain</span>
          </button>
          
          <nav className="hidden lg:flex items-center gap-6">
            <PreloadLink to="/about" className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors drop-shadow">
              About
            </PreloadLink>
            <PreloadLink to="/projects" className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors drop-shadow">
              Projects
            </PreloadLink>
            <PreloadLink to="/get-involved" className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors drop-shadow">
              Get Involved
            </PreloadLink>
            <PreloadLink to="/resources" className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors drop-shadow">
              Resources
            </PreloadLink>
            <PreloadLink to="/whats-new" className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors drop-shadow">
              What's New
            </PreloadLink>
            <PreloadLink to="/shop" className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors drop-shadow">
              Shop
            </PreloadLink>
            <PreloadLink to="/careers" className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors drop-shadow">
              Careers
            </PreloadLink>
            <PreloadLink to="/contact" className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors drop-shadow">
              Contact Us
            </PreloadLink>
          </nav>
          
          <div className="flex items-center gap-3">
            {showWallet && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg">
                <Coins className="h-4 w-4 text-white" />
                <span className="font-inter font-semibold text-white">{(balance / 1000).toFixed(3)} KOBO</span>
              </div>
            )}
            <ThemeToggle />
            <LanguageSwitcher />
            <RegionSelector />
            
            {isAuthenticated ? (
              <>
                <Avatar 
                  className="h-9 w-9 ring-2 ring-white/30 cursor-pointer hover:ring-white/50 transition-all"
                  onClick={() => handleNavigation("/profile")}
                >
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary text-white">
                    {user?.username?.[0]?.toUpperCase() || user?.firstName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  data-testid="button-logout"
                  title="Logout"
                  disabled={logoutMutation.isPending}
                  className="text-white hover:bg-white/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  className="hidden lg:inline-flex text-white hover:bg-white/20" 
                  onClick={handleLogin} 
                >
                  Sign In
                </Button>
                <Button 
                  className="hidden lg:inline-flex bg-white text-primary hover:bg-white/90 shadow-lg" 
                  onClick={handleLogin} 
                  data-testid="button-get-started"
                >
                  Get Started
                </Button>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden text-white hover:bg-white/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <nav className="lg:hidden flex flex-col gap-4 pt-4 pb-2 bg-white/10 backdrop-blur-sm rounded-lg mt-4 p-4">
            <button onClick={() => handleNavigation("/about")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left">
              About
            </button>
            <button onClick={() => handleNavigation("/projects")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left">
              Projects
            </button>
            <button onClick={() => handleNavigation("/get-involved")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left">
              Get Involved
            </button>
            <button onClick={() => handleNavigation("/resources")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left">
              Resources
            </button>
            <button onClick={() => handleNavigation("/whats-new")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left">
              What's New
            </button>
            <button onClick={() => handleNavigation("/shop")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left">
              Shop
            </button>
            <button onClick={() => handleNavigation("/careers")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left">
              Careers
            </button>
            <button onClick={() => handleNavigation("/contact")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left">
              Contact Us
            </button>
            {isAuthenticated && (
              <>
                <div className="pt-4 border-t border-white/20">
                  <button onClick={() => handleNavigation("/profile")} className="text-sm font-inter font-medium text-white/90 hover:text-white transition-colors text-left w-full">
                    Profile Settings
                  </button>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-white/20">
                <Button 
                  className="w-full bg-white text-primary hover:bg-white/90" 
                  onClick={handleLogin}
                >
                  Sign In / Get Started
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
