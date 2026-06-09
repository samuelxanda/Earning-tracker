"use client";

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/insforge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EarningsTabBar } from "../../components/EarningsTabBar";

interface Platform {
  id: string;
  name: string;
}

export default function ExportPage() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    if (!user) return;
    async function loadPlatforms() {
      try {
        const client = createClient();
        const { data } = await client.database
          .from("platforms")
          .select("id, name")
          .order("name", { ascending: true });
        const list = data || [];
        setPlatforms(list);
        setSelectedPlatforms(new Set(list.map((p) => p.id)));
      } catch (err) {
        console.error("Failed to load platforms:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlatforms();
  }, [user]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError("");
    try {
      const client = createClient();
      let query = client.database
        .from("earnings_entries")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate);

      if (selectedPlatforms.size > 0) {
        query = query.in("platform", Array.from(selectedPlatforms));
      }

      const { data: entries, error: entriesError } = await query.order("date", { ascending: true });
      if (entriesError) throw entriesError;

      const { data: expenses } = await client.database
        .from("expenses")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (!entries || entries.length === 0) {
        setError("No data to export for selected period");
        setExporting(false);
        return;
      }

      const rows = entries.map((e) => ({
        Date: e.date,
        Platform: e.platform,
        Hours: e.hours,
        Earnings: e.earnings,
        Notes: e.notes || "",
      }));

      const totalEarnings = entries.reduce((sum, e) => sum + Number(e.earnings), 0);
      const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
      rows.push({ Date: "", Platform: "TOTAL", Hours: totalHours, Earnings: totalEarnings, Notes: "" });

      if (expenses && expenses.length > 0) {
        rows.push({ Date: "", Platform: "--- EXPENSES ---", Hours: 0, Earnings: 0, Notes: "" });
        for (const ex of expenses) {
          rows.push({ Date: ex.date, Platform: ex.category, Hours: 0, Earnings: -Number(ex.amount), Notes: ex.description || "" });
        }
        const totalExpenses = expenses.reduce((sum, ex) => sum + Number(ex.amount), 0);
        rows.push({ Date: "", Platform: "TOTAL EXPENSES", Hours: 0, Earnings: -totalExpenses, Notes: "" });
        rows.push({ Date: "", Platform: "NET", Hours: totalHours, Earnings: totalEarnings - totalExpenses, Notes: "" });
      }

      const header = Object.keys(rows[0]).join(",");
      const csv = [
        header,
        ...rows.map((r) =>
          Object.values(r)
            .map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v))
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `earnings-export-${startDate}-to-${endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export generation failed");
    } finally {
      setExporting(false);
    }
  }, [startDate, endDate, selectedPlatforms]);

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/earnings/settings">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <Skeleton className="h-6 w-28" />
        </div>
        <Card><CardContent className="p-4 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent></Card>
        <EarningsTabBar />
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/earnings/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Export Data</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm font-medium">Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Platforms</Label>
            {platforms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No platforms found</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => {
                  const selected = selectedPlatforms.has(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        selected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted-foreground border-border"
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            )}
            {platforms.length > 1 && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlatforms(new Set(platforms.map((p) => p.id)))}
                  className="text-xs text-primary hover:underline"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatforms(new Set())}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleExport}
            className="w-full"
            disabled={exporting || selectedPlatforms.size === 0}
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Exporting..." : "Export to CSV"}</span>
          </Button>
        </CardContent>
      </Card>

      <EarningsTabBar />
    </div>
  );
}
