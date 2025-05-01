import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/lib/icons";
import { Link } from "wouter";

// Simple notification type
type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Hard-coded notifications list
const demoNotifications = [
  {
    id: 1,
    title: "System Alert: CPU",
    message: "CPU usage is at 82%, exceeding threshold of 80%",
    type: "warning" as NotificationType,
    timestamp: "2025-04-30T20:50:48.293Z",
    isRead: false,
    source: "System"
  },
  {
    id: 2,
    title: "Component Started",
    message: "Apache Spark is now running",
    type: "success" as NotificationType,
    timestamp: "2025-04-30T20:45:12.356Z",
    isRead: false,
    source: "Apache Spark"
  },
  {
    id: 5,
    title: "Error Detected",
    message: "Apache HBase encountered an error during startup",
    type: "error" as NotificationType,
    timestamp: "2025-04-30T20:30:18.947Z",
    isRead: false,
    source: "Apache HBase"
  },
  {
    id: 9,
    title: "Network Issue Detected",
    message: "Network traffic spike detected on port 9092",
    type: "warning" as NotificationType,
    timestamp: "2025-04-30T20:10:55.107Z",
    isRead: false,
    source: "System"
  }
];

export function NotificationsPage() {
  // Helper functions
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'alert-triangle';
      case 'error': return 'alert-circle';
      case 'info': 
      default: return 'info';
    }
  };
  
  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-500 bg-opacity-10 text-green-500 border-green-500';
      case 'warning': return 'bg-yellow-500 bg-opacity-10 text-yellow-500 border-yellow-500';
      case 'error': return 'bg-red-500 bg-opacity-10 text-red-500 border-red-500';
      case 'info': 
      default: return 'bg-blue-500 bg-opacity-10 text-blue-500 border-blue-500';
    }
  };

  // Format date (simplified)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Notifications</h2>
          <p className="text-text-secondary mt-2">View and manage system and component alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Mark All as Read
          </Button>
          <Link href="/">
            <Button variant="default">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      <Card className="elevated-card mb-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Type</TableHead>
                <TableHead className="w-[200px]">Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[180px]">Time</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoNotifications.map((notification) => (
                <TableRow key={notification.id} className={!notification.isRead ? "bg-muted/30" : ""}>
                  <TableCell>
                    <div className={`p-2 rounded-full inline-flex ${getTypeColor(notification.type)} w-10 h-10 items-center justify-center`}>
                      <Icon name={getTypeIcon(notification.type)} className="h-5 w-5" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{notification.source}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-text-secondary">{notification.message}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-text-secondary">
                    {formatDate(notification.timestamp)}
                  </TableCell>
                  <TableCell>
                    {notification.isRead ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-500">Read</Badge>
                    ) : (
                      <Badge className="bg-primary-500 bg-opacity-10 text-primary">Unread</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                        >
                          <Icon name="check" className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-text-secondary hover:text-error"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}