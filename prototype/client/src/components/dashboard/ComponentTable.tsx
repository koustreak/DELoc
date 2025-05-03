import { Component } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "./StatusBadge";
import { Icon } from "@/lib/icons";
import { useComponentToggle } from "@/hooks/useBigDataComponents";
import { useNotifications } from "@/hooks/useNotifications";

interface ComponentTableProps {
  components: Component[];
  onSelect: (component: Component) => void;
}

export function ComponentTable({ components, onSelect }: ComponentTableProps) {
  const toggleMutation = useComponentToggle();
  const { notifyComponentStatus } = useNotifications();

  const handleToggle = (component: Component, checked: boolean) => {
    toggleMutation.mutate({
      id: component.id,
      enabled: checked
    }, {
      onSuccess: (updatedComponent) => {
        const action = checked ? "Component Started" : "Component Stopped";
        notifyComponentStatus(updatedComponent, action);
      }
    });
  };

  return (
    <div className="overflow-x-auto bg-surface rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Component</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Container ID</TableHead>
            <TableHead>Uptime</TableHead>
            <TableHead>CPU Usage</TableHead>
            <TableHead>Memory Usage</TableHead>
            <TableHead className="text-right">Controls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component) => (
            <TableRow 
              key={component.id}
              className={`cursor-pointer hover:bg-muted/50 ${
                component.status === "stopped" ? "bg-orange-50 dark:bg-orange-900/10" : 
                component.status === "running" ? "bg-green-50 dark:bg-green-900/10" :
                component.status === "warning" ? "bg-yellow-50 dark:bg-yellow-900/10" :
                component.status === "error" ? "bg-red-50 dark:bg-red-900/10" : ""
              }`}
              onClick={() => onSelect(component)}
            >
              <TableCell>
                <div className="flex items-center">
                  <Icon name={component.icon} className="h-5 w-5 mr-2 text-primary" />
                  <span className={`font-medium ${
                    component.status === "stopped" ? "text-orange-600" : 
                    component.status === "running" ? "text-green-600" : 
                    component.status === "warning" ? "text-yellow-600" :
                    component.status === "error" ? "text-red-600" :
                    "text-text-primary"
                  }`}>{component.displayName}</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={component.status} />
              </TableCell>
              <TableCell className="font-mono text-sm text-text-secondary">
                {component.containerId 
                  ? `${component.containerId.substring(0, 7)}...${component.containerId.substring(component.containerId.length - 4)}` 
                  : "—"}
              </TableCell>
              <TableCell className="text-sm text-text-secondary">
                {component.uptime || "—"}
              </TableCell>
              <TableCell className="text-sm text-text-secondary">
                {component.cpuUsage ? `${component.cpuUsage}%` : "0%"}
              </TableCell>
              <TableCell className="text-sm text-text-secondary">
                {component.memoryUsage || "0 MB"}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={component.enabled}
                  onCheckedChange={(checked) => handleToggle(component, checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
