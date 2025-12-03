import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ReferralBanner() {
  const { toast } = useToast();
  const referralCode = "GREEN2024";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard.",
    });
  };

  // Floating tag style, positioned absolutely for use in Landing.tsx
  return (
    <div className="fixed left-8 bottom-40 z-40">
      <div className="flex items-center gap-3 bg-gradient-to-br from-purple-600 to-pink-500 shadow-xl rounded-full px-6 py-3 text-white border-2 border-white/30 backdrop-blur-md animate-bounce-in">
        <Gift className="h-7 w-7 mr-2 text-white/90" />
        <div>
          <span className="font-bold text-lg">Invite Friends, Earn Bonus KOBO!</span>
          <span className="block text-xs text-white/80">Share your referral code and get rewarded</span>
        </div>
        <div className="flex items-center ml-4">
          <span className="bg-white/20 px-4 py-1 rounded-lg font-mono text-base font-bold mr-2">{referralCode}</span>
          <Button 
            onClick={handleCopy}
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white/20 hover:bg-white/40 border-none"
          >
            <Copy className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
