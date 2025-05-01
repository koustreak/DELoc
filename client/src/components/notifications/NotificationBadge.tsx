import { Badge } from "@/components/ui/badge";

export function NotificationBadge() {
  // Hardcoded count for demo purposes  
  const unreadCount = 4;
  
  return (
    <Badge className="ml-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
      {unreadCount}
    </Badge>
  );
}