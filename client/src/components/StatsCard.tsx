import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  iconColor?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, iconColor = "text-primary" }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-2">{title}</div>
          <div className="font-inter font-bold text-3xl mb-1" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </div>
          {trend && (
            <div className="text-xs text-muted-foreground">{trend}</div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-primary/10 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
