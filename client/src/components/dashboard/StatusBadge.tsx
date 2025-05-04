import { ComponentStatusType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ComponentStatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full",
        status === "running" && "bg-green-500 bg-opacity-10 text-green-600 font-semibold",
        status === "warning" && "bg-yellow-500 bg-opacity-10 text-yellow-600 font-semibold",
        status === "error" && "bg-red-500 bg-opacity-10 text-red-600 font-semibold",
        status === "stopped" && "bg-orange-500 bg-opacity-20 text-orange-600 font-semibold",
        className
      )}
    >
      {status === "running" && "Running"}
      {status === "warning" && "Warning"}
      {status === "error" && "Error"}
      {status === "stopped" && "Stopped"}
    </span>
  );
}
