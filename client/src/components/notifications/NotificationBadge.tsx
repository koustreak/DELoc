import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  absolute?: boolean;
}

export function NotificationBadge({ absolute }: NotificationBadgeProps = {}) {
  // Hardcoded count for demo purposes  
  const unreadCount = 4;
  
  return (
    <Badge className={cn(
      "bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full",
      absolute ? "absolute -top-1 -right-1" : "ml-2"
    )}>
      {unreadCount}
    </Badge>
  );
}