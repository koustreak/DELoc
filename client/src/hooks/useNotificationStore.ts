import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  source: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
}

// Initial notifications
const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "System Alert: CPU",
    message: "CPU usage is at 82%, exceeding threshold of 80%",
    type: "warning",
    timestamp: "2025-04-30T20:50:48.293Z",
    isRead: false,
    source: "System"
  },
  {
    id: 2,
    title: "Component Started",
    message: "Apache Spark is now running",
    type: "success",
    timestamp: "2025-04-30T20:45:12.356Z",
    isRead: false,
    source: "Apache Spark"
  },
  {
    id: 3,
    title: "System Alert: Memory",
    message: "Memory usage is at 12.3 GB, exceeding threshold of 90%",
    type: "warning",
    timestamp: "2025-04-30T20:40:22.119Z",
    isRead: true,
    source: "System"
  },
  {
    id: 4,
    title: "Component Stopped",
    message: "Apache Hive has been stopped",
    type: "info",
    timestamp: "2025-04-30T20:35:07.532Z",
    isRead: true,
    source: "Apache Hive"
  },
  {
    id: 5,
    title: "Error Detected",
    message: "Apache HBase encountered an error during startup",
    type: "error",
    timestamp: "2025-04-30T20:30:18.947Z",
    isRead: false,
    source: "Apache HBase"
  },
  {
    id: 6,
    title: "Component Warning",
    message: "Apache Airflow is experiencing issues with task execution",
    type: "warning",
    timestamp: "2025-04-30T20:25:33.226Z",
    isRead: true,
    source: "Apache Airflow"
  },
  {
    id: 7,
    title: "System Alert: Disk",
    message: "Disk usage is at 87%, exceeding threshold of 85%",
    type: "warning",
    timestamp: "2025-04-30T20:20:14.592Z",
    isRead: false,
    source: "System"
  },
  {
    id: 8,
    title: "Component Restarted",
    message: "Apache Kafka has been restarted",
    type: "success",
    timestamp: "2025-04-30T20:15:09.371Z",
    isRead: true,
    source: "Apache Kafka"
  },
  {
    id: 9,
    title: "Network Issue Detected",
    message: "Network traffic spike detected on port 9092",
    type: "warning",
    timestamp: "2025-04-30T20:10:55.107Z",
    isRead: false,
    source: "System"
  },
  {
    id: 10,
    title: "Configuration Changed",
    message: "Apache Flink configuration has been updated",
    type: "info",
    timestamp: "2025-04-30T20:05:41.883Z",
    isRead: true,
    source: "Apache Flink"
  },
  {
    id: 11,
    title: "Job Completed",
    message: "Apache Spark job #42 completed successfully",
    type: "success",
    timestamp: "2025-04-30T20:00:27.649Z",
    isRead: true,
    source: "Apache Spark"
  },
  {
    id: 12,
    title: "System Alert: Memory",
    message: "Memory usage normalized at 8.2 GB",
    type: "success",
    timestamp: "2025-04-30T19:55:13.425Z",
    isRead: true,
    source: "System"
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: initialNotifications,
  
  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          isRead: false,
          ...notification,
        },
        ...state.notifications,
      ],
    }));
  },
  
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ),
    }));
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    }));
  },
  
  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
}));