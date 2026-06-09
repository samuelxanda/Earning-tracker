"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/insforge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULTS = { estimated_tax_rate: 30, mileage_rate: 0.67 };

export default function TaxSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [taxRate, setTaxRate] = useState(DEFAULTS.estimated_tax_rate);
  const [mileageRate, setMileageRate] = useState(DEFAULTS.mileage_rate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) { setLoading(false); return; }
    const uid = user.id;
    async function loadSettings() {
      try {
        const client = createClient();
        const { data } = await client.database
          .from("tax_settings")
          .select("*")
          .eq("user_id", uid)
          .maybeSingle();
        if (data) {
          setTaxRate(Number(data.estimated_tax_rate));
          setMileageRate(Number(data.mileage_rate));
        }
      } catch (err) {
        console.error("Failed to load tax settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user, authLoading]);

  const handleSave = async () => {
    if (taxRate < 0 || taxRate > 100) {
      setMessage("Tax rate must be between 0 and 100");
      return;
    }
    if (mileageRate < 0) {
      setMessage("Mileage rate must be positive");
      return;
    }
    if (!user?.id) return;
    setSaving(true);
    setMessage("");
    try {
      const client = createClient();
      const payload = {
        user_id: user.id,
        estimated_tax_rate: taxRate,
        mileage_rate: mileageRate,
      };
      const { data: existing } = await client.database
        .from("tax_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await client.database
          .from("tax_settings")
          .update({ estimated_tax_rate: taxRate, mileage_rate: mileageRate, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      } else {
        await client.database.from("tax_settings").insert([payload]);
      }
      setMessage("Tax settings saved");
    } catch (err) {
      console.error("Failed to save tax settings:", err);
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTaxRate(DEFAULTS.estimated_tax_rate);
    setMileageRate(DEFAULTS.mileage_rate);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/earnings/settings">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <Skeleton className="h-6 w-28" />
        </div>
        <Card><CardContent className="p-4 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/earnings/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Tax Settings</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Estimated Tax Rate (%)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Percentage of earnings to set aside for taxes
            </p>
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              min={0}
              max={100}
              step={0.5}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Mileage Rate ($/mile)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Standard IRS mileage deduction rate
            </p>
            <Input
              type="number"
              value={mileageRate}
              onChange={(e) => setMileageRate(Number(e.target.value))}
              min={0}
              step={0.01}
            />
          </div>
          {message && (
            <p className={`text-sm ${message === "Tax settings saved" ? "text-primary" : "text-destructive"}`}>
              {message}
            </p>
          )}
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Tax Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
