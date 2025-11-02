import { StatsCard } from "../StatsCard";
import { CheckCircle } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <StatsCard 
        title="Tasks Completed"
        value={42}
        icon={CheckCircle}
        trend="+12% from last week"
      />
    </div>
  );
}
