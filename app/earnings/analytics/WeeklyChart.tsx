"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface WeeklyData {
  day: string;
  earnings: number;
  hours: number;
}

export function WeeklyChart({ data }: { data: WeeklyData[] }) {
  return (
    <ChartContainer
      config={{
        earnings: {
          label: "Earnings",
          color: "#1D9E75",
        },
      }}
      className="h-48 w-full"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v) => `$${v}`}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="earnings"
          fill="var(--color-earnings)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ChartContainer>
  );
}
