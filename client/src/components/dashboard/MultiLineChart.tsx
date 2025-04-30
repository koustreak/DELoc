import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type MultiLineChartData = {
  name: string;
  cpu: number;
  memory: number;
  disk?: number;
};

interface MultiLineChartProps {
  title: string;
  data: MultiLineChartData[];
  timeRanges?: { label: string; value: string }[];
  className?: string;
}

export function MultiLineChart({
  title,
  data,
  timeRanges,
  className,
}: MultiLineChartProps) {
  const [timeRange, setTimeRange] = useState(timeRanges?.[0]?.value || "1h");

  // Filter data based on time range in a real application
  // Here we're just using the full dataset

  return (
    <Card className={cn("elevated-card", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-text-primary text-lg">{title}</h4>
          {timeRanges && (
            <div className="text-text-secondary text-sm">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Separator className="mb-4" />
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={{ stroke: "hsl(var(--border))" }} 
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={{ stroke: "hsl(var(--border))" }} 
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value} GB`}
                domain={[0, 'dataMax + 2']}
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={{ stroke: "hsl(var(--border))" }} 
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'cpu') return [`${value}%`, 'CPU Usage'];
                  if (name === 'memory') return [`${value} GB`, 'Memory Usage'];
                  if (name === 'disk') return [`${value}%`, 'Disk I/O'];
                  return [value, name];
                }}
                contentStyle={{ 
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                }}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                name="CPU Usage"
                type="monotone" 
                dataKey="cpu" 
                stroke="#2563eb" /* Blue color */
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "hsl(var(--background))", stroke: "#2563eb", strokeWidth: 2 }}
                connectNulls={true}
                yAxisId="left"
              />
              <Line 
                name="Memory Usage"
                type="monotone" 
                dataKey="memory" 
                stroke="#dc2626" /* Red color */
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "hsl(var(--background))", stroke: "#dc2626", strokeWidth: 2 }}
                connectNulls={true}
                yAxisId="right"
              />
              {data[0]?.disk !== undefined && (
                <Line 
                  name="Disk I/O"
                  type="monotone" 
                  dataKey="disk" 
                  stroke="#16a34a" /* Green color */
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(var(--background))", stroke: "#16a34a", strokeWidth: 2 }}
                  connectNulls={true}
                  yAxisId="left"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}