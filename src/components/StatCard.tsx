import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  trend?: string;
}

export const StatCard = ({ title, value, icon: Icon, variant = 'default', trend }: StatCardProps) => {
  const variantClasses = {
    default: 'text-primary',
    success: 'text-success',
    danger: 'text-destructive',
    warning: 'text-warning',
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className={`rounded-full p-3 ${variantClasses[variant]} bg-${variant === 'default' ? 'primary' : variant}/10`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
