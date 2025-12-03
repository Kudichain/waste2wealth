import { Button } from "@/components/ui/button";
import { Recycle } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export function FloatingCTA() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 lg:hidden">
      <Button
        onClick={() => setLocation("/collectors/register")}
        size="lg"
        className="rounded-full shadow-2xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-6 py-6 animate-bounce"
      >
        <Recycle className="h-5 w-5 mr-2" />
        Start Collecting
      </Button>
    </div>
  );
}
