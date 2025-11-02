import { Header } from "@/components/Header";
import { WalletCard } from "@/components/WalletCard";
import { StatsCard } from "@/components/StatsCard";
import { TaskCard, type Task } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Award, Plus } from "lucide-react";
import { useState } from "react";

const mockTasks: Task[] = [
  {
    id: "1",
    type: "plastic",
    weight: 15,
    reward: 150,
    location: "Kano Municipal Market",
    distance: "1.2 km",
    verified: true
  },
  {
    id: "2",
    type: "metal",
    weight: 25,
    reward: 300,
    location: "Sabon Gari Industrial Area",
    distance: "2.5 km",
    verified: true
  },
  {
    id: "3",
    type: "organic",
    weight: 30,
    reward: 180,
    location: "Kurmi Market",
    distance: "3.1 km",
    verified: true
  }
];

export default function CollectorDashboard() {
  const [tasks] = useState(mockTasks);

  return (
    <div className="min-h-screen bg-background">
      <Header balance={2450} showWallet={true} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl mb-2">
            Welcome back, Ibrahim
          </h1>
          <p className="text-muted-foreground">
            Here's your impact overview
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <WalletCard 
              balance={2450}
              weeklyEarnings={320}
              onRedeem={() => console.log('Redeem coins')}
            />
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard 
              title="Tasks Completed"
              value={42}
              icon={CheckCircle}
              trend="+12% from last week"
            />
            <StatsCard 
              title="Total Earnings"
              value="2,450"
              icon={TrendingUp}
              trend="+8% from last month"
            />
            <StatsCard 
              title="Impact Score"
              value={95}
              icon={Award}
              trend="Top 10% in your area"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-inter font-bold text-2xl mb-1">
              Available Tasks
            </h2>
            <p className="text-muted-foreground text-sm">
              {tasks.length} tasks near you
            </p>
          </div>
          <Button data-testid="button-view-map">
            <Plus className="h-4 w-4 mr-2" />
            View on Map
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <TaskCard 
              key={task.id}
              task={task}
              onAccept={(id) => console.log('Accept task:', id)}
              onNavigate={(id) => console.log('Navigate to:', id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
