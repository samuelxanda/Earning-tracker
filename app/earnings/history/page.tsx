"use client";

import { Calendar, Clock, DollarSign, ChevronRight } from "lucide-react";
import Link from "next/link";
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

export default function HistoryPage() {
  const [entries, setEntries] = useState<EarningsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const client = createClient();
        const response = await client.database.from("earnings_entries").select("*").order("created_at", { ascending: false });
        setEntries(response?.data || []);
      } catch (err: any) {
        console.error("Failed to fetch entries:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">History</h1>
        <Link href="/earnings/entry/new" className="p-2 bg-[#1D9E75] rounded-lg">
          <Calendar className="w-5 h-5 text-white" />
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/earnings/entry/${entry.id}` as any}
              className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{entry.platform}</p>
                  <p className="text-gray-600 text-sm">{entry.date}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">{entry.hours}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-[#1D9E75]" />
                  <span className="text-sm font-medium text-gray-900">${entry.earnings.toFixed(2)}</span>
                </div>
              </div>
            </Link>
          ))}
          {entries.length === 0 && (
            <p className="text-gray-600 text-center py-8">No entries yet. Add your first entry!</p>
          )}
        </div>
      )}

      <Link href="/earnings" className="fixed bottom-20 right-4 bg-[#1D9E75] p-3 rounded-full shadow-lg">
        <Calendar className="w-6 h-6 text-white" />
      </Link>
      <EarningsTabBar />
    </div>
  );
}