import { ReactNode } from "react";
import { Icon } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  additionalInfo?: string;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  icon,
  color,
  trend,
  additionalInfo,
  className,
}: SummaryCardProps) {
  const colorClasses = {
    primary: "gradient-primary text-primary-foreground",
    secondary: "gradient-secondary text-secondary-foreground",
    success: "gradient-success text-primary-foreground",
    error: "bg-error text-error-foreground",
    warning: "bg-warning text-warning-foreground",
    info: "gradient-info text-primary-foreground",
  };

  let trendComponent: ReactNode = null;
  
  if (trend) {
    trendComponent = (
      <div
        className={cn(
          "text-xs flex items-center mt-1",
          trend.direction === "up" && "text-error",
          trend.direction === "down" && "text-success",
          trend.direction === "neutral" && "text-text-secondary"
        )}
      >
        {trend.direction !== "neutral" && (
          <Icon
            name={trend.direction === "up" ? "arrow_upward" : "arrow_downward"}
            className="text-xs mr-1"
          />
        )}
        <span>{trend.value}</span>
      </div>
    );
  }

  return (
    <Card className={cn("elevated-card", className)}>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className={cn("p-3 rounded-xl", colorClasses[color])}>
            <Icon name={icon} className="h-5 w-5" />
          </div>
          <div className="ml-4">
            <div className="text-sm text-text-secondary font-medium">{title}</div>
            <div className="text-2xl font-bold text-text-primary">{value}</div>
            {trendComponent}
            {additionalInfo && (
              <div className="text-xs text-text-secondary mt-1">{additionalInfo}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
