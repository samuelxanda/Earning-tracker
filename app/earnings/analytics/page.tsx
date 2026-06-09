"use client";

import { EarningsTabBar } from "../components/EarningsTabBar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/insforge";

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
  
  const weeklyData = entries.slice(-7).map((e) => ({
    day: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
    earnings: e.earnings,
    hours: e.hours,
  }));

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Analytics</h1>
        <p className="text-gray-600">Loading...</p>
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
        <div className="h-40 flex items-end justify-between gap-2">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-[#1D9E75] rounded-t"
                style={{ height: `${(d.earnings / 120) * 100}%` }}
              />
              <span className="text-gray-600 text-xs mt-1">{d.day}</span>
            </div>
          ))}
          {weeklyData.length === 0 && (
            <p className="text-gray-600 text-sm">No entries this week yet</p>
          )}
        </div>
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