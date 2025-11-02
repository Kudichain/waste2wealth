import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Users, TrendingUp, Coins, CheckCircle2, Clock } from "lucide-react";

const recentDeliveries = [
  { id: "1", collector: "Ibrahim Musa", type: "Plastic", weight: 15, coins: 150, status: "verified", time: "10 mins ago" },
  { id: "2", collector: "Fatima Ahmed", type: "Metal", weight: 25, coins: 300, status: "pending", time: "25 mins ago" },
  { id: "3", collector: "Yusuf Ibrahim", type: "Organic", weight: 30, coins: 180, status: "verified", time: "1 hour ago" },
  { id: "4", collector: "Aisha Bello", type: "Plastic", weight: 20, coins: 200, status: "verified", time: "2 hours ago" }
];

export default function FactoryDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl mb-2">
            Factory Dashboard
          </h1>
          <p className="text-muted-foreground">
            Kano Recycling Hub - Operations Overview
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total Intake"
            value="1,240 kg"
            icon={Package}
            trend="This month"
          />
          <StatsCard 
            title="Active Collectors"
            value={156}
            icon={Users}
            trend="+23 new this week"
          />
          <StatsCard 
            title="Coins Paid Out"
            value="12,450"
            icon={Coins}
            trend="This month"
          />
          <StatsCard 
            title="Efficiency Rate"
            value="94%"
            icon={TrendingUp}
            trend="+2% from last month"
          />
        </div>
        
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-inter font-bold text-xl mb-1">
                Recent Deliveries
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage and verify incoming waste collections
              </p>
            </div>
            <Button variant="outline" data-testid="button-view-all">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentDeliveries.map(delivery => (
              <div 
                key={delivery.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border hover-elevate transition-all"
                data-testid={`delivery-${delivery.id}`}
              >
                <div className="flex-1">
                  <div className="font-inter font-semibold mb-1">{delivery.collector}</div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{delivery.type}</span>
                    <span>•</span>
                    <span>{delivery.weight} kg</span>
                    <span>•</span>
                    <span>{delivery.time}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-inter font-semibold text-primary">
                      {delivery.coins} GC
                    </span>
                  </div>
                  
                  {delivery.status === "verified" ? (
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  
                  {delivery.status === "pending" && (
                    <Button size="sm" data-testid={`button-verify-${delivery.id}`}>
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
