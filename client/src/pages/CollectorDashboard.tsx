import { Header } from "@/components/Header";
import { WalletCard } from "@/components/WalletCard";
import { StatsCard } from "@/components/StatsCard";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, Award, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

export default function CollectorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    select: (data) => data.filter((task: Task) => task.status === "available"),
  });

  const { data: stats } = useQuery<{ tasksCompleted: number; totalEarnings: number; balance: number }>({
    queryKey: ["/api/stats"],
  });

  const { data: wallet } = useQuery<{ balance: number }>({
    queryKey: ["/api/wallet/balance"],
  });

  const acceptTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("POST", `/api/tasks/${taskId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Task Accepted",
        description: "You've successfully accepted this task!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = (taskId: string) => {
    acceptTaskMutation.mutate(taskId);
  };

  const calculateDistance = (lat1: string, lon1: string) => {
    // Simple placeholder - would calculate actual distance in production
    return `${(Math.random() * 5).toFixed(1)} km`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header balance={wallet?.balance || 0} showWallet={true} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-inter font-bold text-3xl md:text-4xl mb-2">
            Welcome back, {user?.firstName || "Collector"}
          </h1>
          <p className="text-muted-foreground">
            Here's your impact overview
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <WalletCard 
              balance={wallet?.balance || 0}
              weeklyEarnings={stats?.totalEarnings || 0}
              onRedeem={() => window.location.href = "/wallet"}
            />
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard 
              title="Tasks Completed"
              value={stats?.tasksCompleted || 0}
              icon={CheckCircle}
              trend="Total completed"
            />
            <StatsCard 
              title="Total Earnings"
              value={stats?.totalEarnings || 0}
              icon={TrendingUp}
              trend="All time"
            />
            <StatsCard 
              title="Current Balance"
              value={wallet?.balance || 0}
              icon={Award}
              trend="GreenCoins"
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
          <Button data-testid="button-view-map" onClick={() => window.location.href = "/map"}>
            <Plus className="h-4 w-4 mr-2" />
            View on Map
          </Button>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No available tasks at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard 
                key={task.id}
                task={{
                  id: task.id,
                  type: task.type as "plastic" | "metal" | "organic",
                  weight: task.weight,
                  reward: task.reward,
                  location: task.location,
                  distance: calculateDistance(task.latitude, task.longitude),
                  verified: true,
                }}
                onAccept={handleAccept}
                onNavigate={(id) => console.log('Navigate to:', id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
