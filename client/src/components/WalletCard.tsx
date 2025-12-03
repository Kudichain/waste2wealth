import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, ArrowUpRight } from "lucide-react";

interface WalletCardProps {
  balance: number;
  weeklyEarnings: number;
  onRedeem?: () => void;
  redeemLabel?: string;
  redeemDisabled?: boolean;
}

export function WalletCard({ balance, weeklyEarnings, onRedeem, redeemDisabled = false, redeemLabel }: WalletCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary-border">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-sm opacity-90 mb-1">Total Balance</div>
          <div className="font-outfit font-extrabold text-4xl flex items-baseline gap-2">
            {(balance / 1000).toFixed(3)}
            <span className="text-xl font-inter font-medium">KOBO</span>
          </div>
          <div className="text-sm opacity-80 mt-1">
            ≈ ₦{balance.toLocaleString()} Naira
          </div>
        </div>
        <Coins className="h-8 w-8 opacity-80" />
      </div>
      
      <div className="flex items-center gap-2 text-sm mb-6 opacity-90">
        <TrendingUp className="h-4 w-4" />
        <span>+{(weeklyEarnings / 1000).toFixed(3)} KOBO this week</span>
      </div>
      
      <Button
        variant="secondary"
        className="w-full"
        onClick={onRedeem}
        data-testid="button-redeem"
        disabled={!onRedeem || redeemDisabled}
      >
        {redeemLabel ?? "Convert KOBO"}
        <ArrowUpRight className="h-4 w-4 ml-2" />
      </Button>
    </Card>
  );
}
