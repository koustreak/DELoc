// Simplified version that doesn't use the store
import { Component } from '@shared/schema';

// Simple notification type
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

type NotificationOptions = {
  title?: string;
  description?: string;
  type?: NotificationType;
  source?: string;
};

export function useNotifications() {
  // Create dummy functions that don't actually add notifications to avoid infinite loops
  const notify = ({
    title = 'Notification',
    description = '',
    type = 'info',
    source = 'System'
  }: NotificationOptions) => {
    console.log(`[NOTIFICATION] ${type} from ${source}: ${title} - ${description}`);
  };

  // Helper for component status notifications
  const notifyComponentStatus = (component: Component, action: string) => {
    let type: NotificationType = 'info';
    
    if (action === 'started') {
      type = 'success';
    } else if (action === 'error') {
      type = 'error';
    } else if (action === 'warning') {
      type = 'warning';
    }
    
    const title = `Component ${action.charAt(0).toUpperCase() + action.slice(1)}`;
    const message = `${component.displayName} has been ${action}`;
    
    console.log(`[COMPONENT ${type.toUpperCase()}] ${title}: ${message}`);
  };

  // Helper for system alerts
  const notifySystemAlert = (metric: string, value: string | number, threshold: number, type: NotificationType = 'warning') => {
    const title = `System Alert: ${metric}`;
    const message = `${metric} usage is at ${value}, exceeding threshold of ${threshold}%`;
    
    console.log(`[SYSTEM ${type.toUpperCase()}] ${title}: ${message}`);
  };

  return {
    notify,
    notifyComponentStatus,
    notifySystemAlert
  };
}