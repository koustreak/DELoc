import { 
  users, 
  type User, 
  type InsertUser, 
  components,
  type Component,
  type InsertComponent,
  systemMetrics,
  type SystemMetrics,
  type InsertSystemMetrics,
  componentMetrics,
  type ComponentMetrics,
  type InsertComponentMetrics
} from "@shared/schema";

// Interface defining all storage operations
export interface IStorage {
  // User operations (carried over from original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Component operations
  getComponents(): Promise<Component[]>;
  getComponent(id: number): Promise<Component | undefined>;
  createComponent(component: InsertComponent): Promise<Component>;
  updateComponent(id: number, updates: Partial<Component>): Promise<Component | undefined>;
  deleteComponent(id: number): Promise<boolean>;
  
  // System metrics operations
  getLatestSystemMetrics(): Promise<SystemMetrics | undefined>;
  createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
  getSystemMetricsHistory(limit: number): Promise<SystemMetrics[]>;
  
  // Component metrics operations
  getComponentMetrics(componentId: number): Promise<ComponentMetrics[]>;
  createComponentMetrics(metrics: InsertComponentMetrics): Promise<ComponentMetrics>;
  getComponentMetricsHistory(componentId: number, limit: number): Promise<ComponentMetrics[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private componentsMap: Map<number, Component>;
  private systemMetricsArray: SystemMetrics[];
  private componentMetricsMap: Map<number, ComponentMetrics[]>;
  
  private currentUserId: number;
  private currentComponentId: number;
  private currentSystemMetricsId: number;
  private currentComponentMetricsId: number;

  constructor() {
    this.users = new Map();
    this.componentsMap = new Map();
    this.systemMetricsArray = [];
    this.componentMetricsMap = new Map();
    
    this.currentUserId = 1;
    this.currentComponentId = 1;
    this.currentSystemMetricsId = 1;
    this.currentComponentMetricsId = 1;
    
    // Initialize with default components
    this.initializeDefaultComponents();
  }

  // Initialize with default big data components
  private initializeDefaultComponents() {
    const defaultComponents: InsertComponent[] = [
      {
        name: "spark",
        displayName: "Apache Spark",
        description: "Unified analytics engine for large-scale data processing",
        icon: "zap",
        status: "running",
        containerId: "8a3dcb7fe49a5c21d8e47f92b13a45fd", 
        image: "apache/spark:3.3.0",
        ports: ["7077:7077", "8080:8080", "4040:4040"],
        volumes: ["/data/spark:/opt/spark/data"],
        networkName: "bigdata_network",
        createdAt: new Date("2023-05-15T09:42:00"),
        uptime: "2d 14h 32m",
        cpuUsage: 12,
        memoryUsage: "1.2 GB",
        enabled: true,
        order: 1,
        configuration: { workers: 3, executorMemory: "2g" }
      },
      {
        name: "minio",
        displayName: "Minio",
        description: "High performance object storage server",
        icon: "storage",
        status: "running",
        containerId: "7e5fd3c92b123eaf456b789cd01234ef",
        image: "minio/minio:latest",
        ports: ["9000:9000", "9001:9001"],
        volumes: ["/data/minio:/data"],
        networkName: "bigdata_network",
        createdAt: new Date("2023-05-10T15:18:00"),
        uptime: "5d 8h 14m",
        cpuUsage: 5,
        memoryUsage: "420 MB",
        enabled: true,
        order: 2,
        configuration: { accessKey: "minioadmin", secretKey: "minioadmin" }
      },
      {
        name: "hive",
        displayName: "Apache Hive",
        description: "Data warehouse software for reading, writing, and managing data",
        icon: "dns",
        status: "stopped",
        image: "apache/hive:3.1.2",
        ports: ["10000:10000", "10002:10002"],
        volumes: ["/data/hive:/opt/hive/data"],
        networkName: "bigdata_network",
        cpuUsage: 0,
        memoryUsage: "0 MB",
        enabled: false,
        order: 3,
        configuration: { metastoreUri: "thrift://hive-metastore:9083" }
      },
      {
        name: "hbase",
        displayName: "Apache HBase",
        description: "Distributed, scalable, big data store",
        icon: "view_column",
        status: "running",
        containerId: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7",
        image: "harisekhon/hbase:latest",
        ports: ["16000:16000", "16010:16010"],
        volumes: ["/data/hbase:/data"],
        networkName: "bigdata_network",
        createdAt: new Date("2023-05-12T10:20:00"),
        uptime: "3d 18h 12m",
        cpuUsage: 8,
        memoryUsage: "820 MB",
        enabled: true,
        order: 4,
        configuration: { zookeeperQuorum: "zookeeper:2181" }
      },
      {
        name: "airflow",
        displayName: "Apache Airflow",
        description: "Platform to programmatically author, schedule and monitor workflows",
        icon: "schedule",
        status: "running",
        containerId: "9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k",
        image: "apache/airflow:2.5.1",
        ports: ["8080:8080"],
        volumes: ["/data/airflow:/opt/airflow"],
        networkName: "bigdata_network",
        createdAt: new Date("2023-05-14T08:15:00"),
        uptime: "1d 16h 27m",
        cpuUsage: 10,
        memoryUsage: "1.5 GB",
        enabled: true,
        order: 5,
        configuration: { executor: "LocalExecutor" }
      },
      {
        name: "kafka",
        displayName: "Apache Kafka",
        description: "Distributed event streaming platform",
        icon: "swap_horiz",
        status: "running",
        containerId: "5a4s3d2f1g6h7j8k9l0z1x2c3v4b5n6m",
        image: "confluentinc/cp-kafka:7.3.0",
        ports: ["9092:9092"],
        volumes: ["/data/kafka:/var/lib/kafka/data"],
        networkName: "bigdata_network",
        createdAt: new Date("2023-05-11T12:30:00"),
        uptime: "4d 11h 52m",
        cpuUsage: 7,
        memoryUsage: "950 MB",
        enabled: true,
        order: 6,
        configuration: { brokers: 1, topics: 5 }
      },
      {
        name: "flink",
        displayName: "Apache Flink",
        description: "Stream processing framework for distributed, high-performance data streaming",
        icon: "git-branch",
        status: "warning",
        containerId: "9d7fe2a31c8b4d5e6f7g8h9i0j1k2l3m",
        image: "flink:latest",
        ports: ["8081:8081"],
        volumes: ["/data/flink:/opt/flink/data"],
        networkName: "bigdata_network",
        createdAt: new Date("2023-05-17T06:40:00"),
        uptime: "6h 42m",
        cpuUsage: 18,
        memoryUsage: "2.1 GB",
        enabled: true,
        order: 7,
        configuration: { taskManagers: 2, parallelism: 4 }
      },
      {
        name: "beam",
        displayName: "Apache Beam",
        description: "Unified programming model for batch and streaming data processing",
        icon: "layers",
        status: "running",
        containerId: "beam1a2b3c4d5e6f7g8h9i0j1k2l",
        image: "apache/beam:2.40.0",
        ports: ["8088:8088"],
        volumes: ["/data/beam:/beam-data"],
        networkName: "bigdata_network",
        createdAt: new Date("2023-05-16T10:30:00"),
        uptime: "1d 2h 12m",
        cpuUsage: 14,
        memoryUsage: "1.7 GB",
        enabled: true,
        order: 8,
        configuration: { runner: "DirectRunner" }
      },
      {
        name: "cassandra",
        displayName: "Apache Cassandra",
        description: "Highly-scalable, distributed NoSQL database",
        icon: "database",
        status: "running",
        containerId: "cassandra3e4d5f6g7h8i9j0k1l2m",
        image: "cassandra:4.0.5",
        ports: ["9042:9042", "7000:7000"],
        volumes: ["/data/cassandra:/var/lib/cassandra"],
        networkName: "bigdata_network",
        createdAt: new Date("2023-05-15T14:25:00"),
        uptime: "1d 22h 35m",
        cpuUsage: 22,
        memoryUsage: "3.2 GB",
        enabled: true,
        order: 9,
        configuration: { seeds: "cassandra-seed", clusterName: "BigDataCluster" }
      }
    ];
    
    defaultComponents.forEach(component => this.createComponent(component));
  }

  // User operations (carried over from original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Component operations
  async getComponents(): Promise<Component[]> {
    return Array.from(this.componentsMap.values())
      .sort((a, b) => a.order - b.order);
  }
  
  async getComponent(id: number): Promise<Component | undefined> {
    return this.componentsMap.get(id);
  }
  
  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const id = this.currentComponentId++;
    const component: Component = { ...insertComponent, id };
    this.componentsMap.set(id, component);
    return component;
  }
  
  async updateComponent(id: number, updates: Partial<Component>): Promise<Component | undefined> {
    const component = this.componentsMap.get(id);
    if (!component) return undefined;
    
    const updatedComponent = { ...component, ...updates };
    this.componentsMap.set(id, updatedComponent);
    return updatedComponent;
  }
  
  async deleteComponent(id: number): Promise<boolean> {
    return this.componentsMap.delete(id);
  }
  
  // System metrics operations
  async getLatestSystemMetrics(): Promise<SystemMetrics | undefined> {
    if (this.systemMetricsArray.length === 0) {
      // Create initial system metrics if none exist
      const initialMetrics: InsertSystemMetrics = {
        timestamp: new Date(),
        cpuUsage: 32,
        memoryUsage: "8.4 GB",
        memoryTotal: "16 GB",
        diskUsage: 42,
        diskTotal: "512 GB",
        networkIO: "24 MB/s"
      };
      return this.createSystemMetrics(initialMetrics);
    }
    
    return this.systemMetricsArray[this.systemMetricsArray.length - 1];
  }
  
  async createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const id = this.currentSystemMetricsId++;
    const systemMetrics: SystemMetrics = { ...metrics, id };
    this.systemMetricsArray.push(systemMetrics);
    
    // Keep only the last 100 entries
    if (this.systemMetricsArray.length > 100) {
      this.systemMetricsArray.shift();
    }
    
    return systemMetrics;
  }
  
  async getSystemMetricsHistory(limit: number): Promise<SystemMetrics[]> {
    const metricsCount = this.systemMetricsArray.length;
    const start = Math.max(0, metricsCount - limit);
    return this.systemMetricsArray.slice(start);
  }
  
  // Component metrics operations
  async getComponentMetrics(componentId: number): Promise<ComponentMetrics[]> {
    return this.componentMetricsMap.get(componentId) || [];
  }
  
  async createComponentMetrics(metrics: InsertComponentMetrics): Promise<ComponentMetrics> {
    const id = this.currentComponentMetricsId++;
    const componentMetrics: ComponentMetrics = { ...metrics, id };
    
    const existingMetrics = this.componentMetricsMap.get(metrics.componentId) || [];
    const updatedMetrics = [...existingMetrics, componentMetrics];
    
    // Keep only the last 100 entries per component
    if (updatedMetrics.length > 100) {
      updatedMetrics.shift();
    }
    
    this.componentMetricsMap.set(metrics.componentId, updatedMetrics);
    return componentMetrics;
  }
  
  async getComponentMetricsHistory(componentId: number, limit: number): Promise<ComponentMetrics[]> {
    const metrics = this.componentMetricsMap.get(componentId) || [];
    const metricsCount = metrics.length;
    const start = Math.max(0, metricsCount - limit);
    return metrics.slice(start);
  }
}

export const storage = new MemStorage();
