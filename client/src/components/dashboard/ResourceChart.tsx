import { useState } from "react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from "recharts";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export type ChartData = {
  name: string;
  value: number;
  [key: string]: any;
};

interface ResourceChartProps {
  title: string;
  data: ChartData[];
  type?: "line" | "area" | "bar" | "pie" | "radar" | "gauge";
  color?: string;
  timeRanges?: { label: string; value: string }[];
  yAxisFormatter?: (value: number) => string;
  className?: string;
  gaugeValue?: number;
  gaugeMax?: number;
}

export function ResourceChart({
  title,
  data,
  type = "line",
  color = "hsl(var(--primary))",
  timeRanges,
  yAxisFormatter = (value) => `${value}%`,
  className,
  gaugeValue = 0,
  gaugeMax = 100,
}: ResourceChartProps) {
  const [timeRange, setTimeRange] = useState(timeRanges?.[0]?.value || "1h");

  // Filter data based on time range in a real application
  // Here we're just using the full dataset
  
  const renderChart = () => {
    const COLORS = [
      color,
      "hsl(var(--secondary))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "hsl(var(--info))"
    ];

    switch (type) {
      case "gauge":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-[160px] h-[160px]">
              <svg style={{ height: 0, width: 0 }}>
                <defs>
                  <linearGradient id={`gauge-gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </linearGradient>
                </defs>
              </svg>
              <CircularProgressbar
                value={gaugeValue}
                maxValue={gaugeMax}
                text={yAxisFormatter(gaugeValue)}
                strokeWidth={10}
                styles={buildStyles({
                  rotation: 0.25,
                  strokeLinecap: 'round',
                  textSize: '16px',
                  pathTransitionDuration: 0.8,
                  pathColor: `url(#gauge-gradient-${title})`,
                  textColor: 'hsl(var(--text-primary))',
                  trailColor: 'hsl(var(--muted))',
                  // Material Dashboard style with rich visuals
                })}
              />
            </div>
            <div className="mt-3 text-center">
              <div className="text-sm text-text-secondary font-medium">
                {`${gaugeValue} of ${gaugeMax}${title.includes("Memory") ? " GB" : title.includes("CPU") ? "%" : ""}`}
              </div>
            </div>
          </div>
        );
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              tickLine={false} 
              axisLine={{ stroke: "hsl(var(--border))" }} 
            />
            <YAxis 
              tickFormatter={yAxisFormatter} 
              tick={{ fontSize: 12 }} 
              tickLine={false} 
              axisLine={{ stroke: "hsl(var(--border))" }} 
            />
            <Tooltip 
              formatter={(value: number) => [yAxisFormatter(value), title]}
              contentStyle={{ 
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#color-${title})`} 
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              tickLine={false} 
              axisLine={{ stroke: "hsl(var(--border))" }} 
            />
            <YAxis 
              tickFormatter={yAxisFormatter} 
              tick={{ fontSize: 12 }} 
              tickLine={false} 
              axisLine={{ stroke: "hsl(var(--border))" }} 
            />
            <Tooltip 
              formatter={(value: number) => [yAxisFormatter(value), title]}
              contentStyle={{ 
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 0, 0]} 
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case "pie":
        return (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            {/* Define multiple gradients for Material design look */}
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={`pie-gradient-${index}`} id={`pie-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </linearGradient>
              ))}
              {/* Add filter for shadow effect */}
              <filter id="drop-shadow" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="2" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <Tooltip
              formatter={(value: number) => [yAxisFormatter(value), title]}
              contentStyle={{ 
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={false}
              animationDuration={1500}
              filter="url(#drop-shadow)" // Apply shadow effect
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#pie-gradient-${index % COLORS.length})`} 
                />
              ))}
            </Pie>
            <Legend 
              layout="horizontal"
              verticalAlign="top"
              align="left"
              iconType="circle"
              wrapperStyle={{
                fontSize: '12px',
                paddingBottom: '10px'
              }}
            />
          </PieChart>
        );

      case "radar":
        return (
          <RadarChart outerRadius={90} width={730} height={250} data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--text-primary))" }} />
            <PolarRadiusAxis tick={{ fontSize: 12, fill: "hsl(var(--text-secondary))" }} />
            <Tooltip
              formatter={(value: number) => [yAxisFormatter(value), title]}
              contentStyle={{ 
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Radar name={title} dataKey="value" stroke={color} fill={color} fillOpacity={0.6} animationDuration={1500} />
          </RadarChart>
        );

      case "line":
      default:
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              tickLine={false} 
              axisLine={{ stroke: "hsl(var(--border))" }} 
            />
            <YAxis 
              tickFormatter={yAxisFormatter} 
              tick={{ fontSize: 12 }} 
              tickLine={false} 
              axisLine={{ stroke: "hsl(var(--border))" }} 
            />
            <Tooltip 
              formatter={(value: number) => [yAxisFormatter(value), title]}
              contentStyle={{ 
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
            />
            <defs>
              <linearGradient id={`line-gradient-${title}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor={color} stopOpacity={1} />
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={`url(#line-gradient-${title})`} 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "hsl(var(--background))", stroke: color, strokeWidth: 2 }}
              connectNulls={true}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </LineChart>
        );
    }
  };

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
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}