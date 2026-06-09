"use client";

import { ArrowLeft, LogOut, Trash2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/insforge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EarningsTabBar } from "../../components/EarningsTabBar";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    async function loadProfile() {
      try {
        const client = createClient();
        const { data } = await client.database
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (data) {
          setDisplayName(data.display_name || "");
          setPhone(data.phone || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    if (!userId) return;
    try {
      const client = createClient();
      const payload = { user_id: userId, display_name: displayName, phone };
      const { data: existing } = await client.database
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await client.database
          .from("profiles")
          .update({ display_name: displayName, phone, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      } else {
        await client.database.from("profiles").insert([payload]);
      }
      setMessage("Profile saved");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/auth/sign-in");
  };

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/earnings/settings">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <Skeleton className="h-6 w-24" />
        </div>
        <Card><CardContent className="p-4 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
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
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
          {message && <p className={`text-sm ${message === "Profile saved" ? "text-primary" : "text-destructive"}`}>{message}</p>}
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push("/auth/reset-password")}>
          <CardContent className="flex items-center gap-4 p-4">
            <KeyRound className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground font-medium">Change Password</span>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleSignOut}>
          <CardContent className="flex items-center gap-4 p-4">
            <LogOut className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground font-medium">Sign Out</span>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-destructive/5 transition-colors border-destructive/20">
          <CardContent className="flex items-center gap-4 p-4">
            <Trash2 className="w-5 h-5 text-destructive" />
            <div>
              <span className="text-destructive font-medium">Delete Account</span>
              <p className="text-xs text-muted-foreground">Remove your account and all data</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <EarningsTabBar />
    </div>
  );
}
