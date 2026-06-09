"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { EarningsTabBar } from "../components/EarningsTabBar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/insforge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface EarningsEntry {
  id: string;
  platform: string;
  hours: number;
  earnings: number;
  date: string;
  notes?: string;
}

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<EarningsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const client = createClient();
        const response = await client.database.from("earnings_entries").select("*").order("date", { ascending: true });
        setEntries(response?.data || []);
      } catch (err: any) {
        console.error("Failed to fetch entries:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const avgHourly = entries.length > 0 
    ? entries.reduce((sum, e) => sum + e.earnings / e.hours, 0) / entries.length 
    : 0;

  const totalEarnings = entries.reduce((s, e) => s + e.earnings, 0);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = dayLabels.map((day, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayEntries = entries.filter((e) => e.date === dateStr);
    return {
      day,
      earnings: dayEntries.reduce((s, e) => s + e.earnings, 0),
      hours: dayEntries.reduce((s, e) => s + e.hours, 0),
    };
  });

  const platformTotals = Object.entries(
    entries.reduce<Record<string, { earnings: number; hours: number }>>((acc, e) => {
      if (!acc[e.platform]) acc[e.platform] = { earnings: 0, hours: 0 };
      acc[e.platform].earnings += e.earnings;
      acc[e.platform].hours += e.hours;
      return acc;
    }, {})
  ).map(([platform, data]) => ({ platform, ...data }));

  const platformColors = [
    "#1D9E75", "#3B82F6", "#F97316", "#22C55E",
    "#8B5CF6", "#EC4899", "#06B6D4", "#EAB308",
  ];

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <Skeleton className="h-7 w-28 mb-4" />
        <Skeleton className="h-24 w-full rounded-xl mb-4" />
        <Skeleton className="h-52 w-full rounded-xl mb-4" />
      {platformTotals.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <p className="text-gray-600 text-sm mb-3">By Platform</p>
          <div className="space-y-3">
            {platformTotals.map((p, i) => (
              <div key={p.platform}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-900 font-medium">{p.platform}</span>
                  <span className="text-gray-900">${p.earnings.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(p.earnings / Math.max(...platformTotals.map((x) => x.earnings))) * 100}%`,
                      backgroundColor: platformColors[i % platformColors.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <EarningsTabBar />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Analytics</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-gray-600 text-sm mb-1">Average Hourly Rate</p>
        <p className="text-2xl font-bold text-gray-900">${avgHourly.toFixed(2)}/hr</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-gray-600 text-sm mb-3">This Week</p>
        {weeklyData.some((d) => d.earnings > 0) ? (
          <ChartContainer
            config={{
              earnings: {
                label: "Earnings",
                color: "#1D9E75",
              },
            }}
            className="h-48 w-full"
          >
            <BarChart accessibilityLayer data={weeklyData}>
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
        ) : (
          <p className="text-gray-600 text-sm py-8 text-center">
            No entries this week yet
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 text-xs mb-1">Best Day</p>
          <p className="font-bold text-gray-900">
            {entries.length > 0 
              ? new Date(entries.reduce((max, e) => e.earnings > max.earnings ? e : max, entries[0]).date).toLocaleDateString("en-US", { weekday: "long" }) + ` ($${Math.max(...entries.map(e => e.earnings)).toFixed(2)})`
              : "-"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 text-xs mb-1">Total</p>
          <p className="font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      <EarningsTabBar />
    </div>
  );
}