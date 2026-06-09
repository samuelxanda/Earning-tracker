"use client";

import { ArrowLeft, Calendar, Clock, DollarSign, FileText, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/insforge";

interface PlatformOption {
  id: string;
  name: string;
  color: string;
}

export default function NewEntryPage() {
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [platform, setPlatform] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [earnings, setEarnings] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlatforms = async () => {
      const client = createClient();
      const response = await client.database.from("platforms").select("*").order("name", { ascending: true });
      setPlatforms(response?.data || []);
    };
    fetchPlatforms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const client = createClient();
      await client.database.from("earnings_entries").insert([
        {
          platform,
          hours: parseFloat(hours),
          earnings: parseFloat(earnings),
          date,
          notes,
        },
      ]);
      window.location.href = "/earnings";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/earnings" className="p-2">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add Earnings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:ring-1 focus:ring-[#1D9E75] focus:border-[#1D9E75]"
          >
            <option value="">Select platform</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-gray-900 focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Hours Worked
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-600" />
            <input
              type="number"
              step="0.5"
              placeholder="0.0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-gray-900 focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Earnings ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-600" />
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={earnings}
              onChange={(e) => setEarnings(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-gray-900 focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Notes (optional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 w-5 h-5 text-gray-600" />
            <textarea
              placeholder="Add notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-3 py-2 text-gray-900 focus:ring-1 focus:ring-accent focus:border-accent"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1D9E75] text-[#1D9E75]-foreground rounded-md py-2 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving..." : "Save Entry"}
        </button>
      </form>
    </div>
  );
}