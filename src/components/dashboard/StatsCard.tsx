import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change: string;
}

export const StatsCard = ({ label, value, icon: Icon, change }: StatsCardProps) => {
  const isPositiveChange = change.startsWith('+');

  return (
    <Card className="p-6 border-border/50 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8 text-accent" />
        <span 
          className={`text-sm font-medium ${
            isPositiveChange ? 'text-green-600' : 'text-blue-600'
          }`}
        >
          {change}
        </span>
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-1">
        {value}
      </h3>
      
      <p className="text-sm text-muted-foreground">
        {label}
      </p>
    </Card>
  );
};
