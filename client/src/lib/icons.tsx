import { FC } from "react";
import {
  ChartBar,
  Cpu,
  Database,
  HardDrive,
  LayoutDashboard,
  Loader,
  MonitorSmartphone,
  Network,
  User,
  Waves,
  Calendar,
  ArrowLeftRight,
  ArrowDownUp,
  Gauge,
  Activity,
  Clock,
  Power,
  RefreshCw,
  Play,
  Square,
  FileTerminal,
  Settings,
  BarChart4,
  HardDriveDownload,
  Layers
} from "lucide-react";

// Map of icon names to components
export const iconMap: Record<string, FC<{ className?: string }>> = {
  // System icons
  dashboard: LayoutDashboard,
  cpu: Cpu,
  memory: HardDrive,
  disk: Database,
  network: Network,
  chart: ChartBar,
  user: User,
  
  // Component icons
  bolt: Activity, // Spark
  storage: HardDrive, // Minio
  dns: Layers, // Hive
  view_column: Database, // HBase
  schedule: Calendar, // Airflow
  swap_horiz: ArrowLeftRight, // Kafka
  waves: Waves, // Flink
  
  // Action icons
  refresh: RefreshCw,
  restart: Power,
  play: Play,
  stop: Square,
  
  // Other icons
  logs: FileTerminal,
  settings: Settings,
  gauge: Gauge,
  monitor: MonitorSmartphone,
  loading: Loader,
  stats: BarChart4,
  download: HardDriveDownload,
  clock: Clock,
  "external-link": Square
};

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: FC<IconProps> = ({ name, className }) => {
  const IconComponent = iconMap[name] || iconMap.dashboard;
  return <IconComponent className={className} />;
};
