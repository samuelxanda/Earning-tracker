"use client";

import { Plus, Calendar, Bike, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/insforge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EarningsEntry {
  id: string;
  platform: string;
  hours: number;
  earnings: number;
  date: string;
  notes?: string;
}

export default function TodayPage() {
  const [entries, setEntries] = useState<EarningsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayHours, setTodayHours] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const client = createClient();
        const response = await client.database
          .from("earnings_entries")
          .select("*")
          .eq("date", today)
          .order("created_at", { ascending: false });
        const data = response?.data || [];
        setEntries(data);
        setTodayTotal(data.reduce((s: number, e: EarningsEntry) => s + e.earnings, 0));
        setTodayHours(data.reduce((s: number, e: EarningsEntry) => s + e.hours, 0));
      } catch {
        setError("Could not load data. Check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [today]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="p-4">
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Today</h1>
            <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <Link href="/earnings/entry/new">
            <Button size="icon">
              <Plus className="w-6 h-6" />
            </Button>
          </Link>
        </div>

        <Card className="mb-4">
          <CardContent>
            <p className="text-muted-foreground text-sm mb-1">Today's Earnings</p>
            <p className="text-3xl font-bold text-foreground">${todayTotal.toFixed(2)}</p>
            {todayTotal === 0 && (
              <p className="text-muted-foreground text-xs mt-1">Tap + to add your first entry</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card size="sm">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-muted-foreground text-xs">Hours</p>
              </div>
              <p className="text-lg font-semibold text-foreground">{todayHours.toFixed(1)}</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Bike className="w-4 h-4 text-primary" />
                <p className="text-muted-foreground text-xs">Platform</p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {entries.length > 0 ? entries[0].platform : "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <p className="text-foreground font-medium mb-3">Quick Actions</p>
            <div className="space-y-2">
              <Link href="/earnings/expenses" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span>Add expense</span>
                  <Plus className="w-4 h-4 text-primary" />
                </Button>
              </Link>
              <Link href="/earnings/history" className="block">
                <Button variant="outline" className="w-full justify-between">
                  <span>View history</span>
                  <Calendar className="w-4 h-4 text-primary" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}