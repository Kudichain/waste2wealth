import { WalletCard } from "../WalletCard";

export default function WalletCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <WalletCard 
        balance={2450}
        weeklyEarnings={320}
        onRedeem={() => console.log('Redeem clicked')}
      />
    </div>
  );
}
