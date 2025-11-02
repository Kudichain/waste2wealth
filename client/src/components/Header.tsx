import { Button } from "@/components/ui/button";
import { Leaf, Menu, Coins, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  balance?: number;
  showWallet?: boolean;
}

export function Header({ balance = 0, showWallet = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-outfit font-bold text-xl">GreenCoin Africa</span>
          </div>
          
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm font-inter font-medium hover:text-primary transition-colors">
                Home
              </a>
              <a href="/collector" className="text-sm font-inter font-medium hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-sm font-inter font-medium hover:text-primary transition-colors">
                Map
              </a>
              <a href="#" className="text-sm font-inter font-medium hover:text-primary transition-colors">
                Leaderboard
              </a>
            </nav>
          )}
          
          <div className="flex items-center gap-3">
            {showWallet && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Coins className="h-4 w-4 text-primary" />
                <span className="font-inter font-semibold text-primary">{balance} GC</span>
              </div>
            )}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  data-testid="button-logout"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button className="hidden md:inline-flex" onClick={handleLogin} data-testid="button-get-started">
                Get Started
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && isAuthenticated && (
          <nav className="md:hidden flex flex-col gap-4 pt-4 pb-2">
            <a href="/" className="text-sm font-inter font-medium hover:text-primary transition-colors">
              Home
            </a>
            <a href="/collector" className="text-sm font-inter font-medium hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-sm font-inter font-medium hover:text-primary transition-colors">
              Map
            </a>
            <a href="#" className="text-sm font-inter font-medium hover:text-primary transition-colors">
              Leaderboard
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
