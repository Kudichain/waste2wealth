import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Weight, Coins, CheckCircle2 } from "lucide-react";

export type TrashType = "plastic" | "metal" | "organic";

export interface Task {
  id: string;
  type: TrashType;
  weight: number;
  reward: number;
  location: string;
  distance: string;
  verified: boolean;
}

interface TaskCardProps {
  task: Task;
  onAccept?: (taskId: string) => void;
  onNavigate?: (taskId: string) => void;
}

const trashTypeColors: Record<TrashType, string> = {
  plastic: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  metal: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  organic: "bg-green-500/10 text-green-700 dark:text-green-400"
};

export function TaskCard({ task, onAccept, onNavigate }: TaskCardProps) {
  return (
    <Card className="p-6 hover-elevate transition-all duration-300" data-testid={`card-task-${task.id}`}>
      <div className="flex items-start justify-between mb-4">
        <Badge className={trashTypeColors[task.type]} data-testid={`badge-type-${task.type}`}>
          {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
        </Badge>
        {task.verified && (
          <CheckCircle2 className="h-5 w-5 text-primary" data-testid="icon-verified" />
        )}
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Weight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Est. Weight:</span>
          <span className="font-inter font-semibold">{task.weight} kg</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Coins className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Reward:</span>
          <span className="font-inter font-semibold text-primary">{task.reward} GC</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground truncate">{task.location}</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {task.distance} away
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={() => onAccept?.(task.id)}
          data-testid="button-accept"
        >
          Accept Task
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onNavigate?.(task.id)}
          data-testid="button-navigate"
        >
          Navigate
        </Button>
      </div>
    </Card>
  );
}
