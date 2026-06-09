"use client";

import { User, Plus, Edit, Trash2 } from "lucide-react";
import { EarningsTabBar } from "../components/EarningsTabBar";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/insforge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Platform {
  id: string;
  name: string;
  color: string;
}

const presetColors = [
  "#1D9E75", "#3B82F6", "#F97316", "#22C55E",
  "#8B5CF6", "#EC4899", "#06B6D4", "#EAB308",
];

export default function SettingsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(presetColors[0]);
  const [saving, setSaving] = useState(false);

  const fetchPlatforms = useCallback(async () => {
    try {
      const client = createClient();
      const response = await client.database.from("platforms").select("*").order("name", { ascending: true });
      setPlatforms(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch platforms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const openAdd = () => {
    setSelectedPlatform(null);
    setFormName("");
    setFormColor(presetColors[0]);
    setAddOpen(true);
  };

  const openEdit = (p: Platform) => {
    setSelectedPlatform(p);
    setFormName(p.name);
    setFormColor(p.color);
    setEditOpen(true);
  };

  const openDelete = (p: Platform) => {
    setSelectedPlatform(p);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const client = createClient();
      if (selectedPlatform) {
        await client.database.from("platforms").update({ name: formName.trim(), color: formColor }).eq("id", selectedPlatform.id);
      } else {
        await client.database.from("platforms").insert([{ name: formName.trim(), color: formColor }]);
      }
      await fetchPlatforms();
      setAddOpen(false);
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to save platform:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlatform) return;
    try {
      const client = createClient();
      await client.database.from("platforms").delete().eq("id", selectedPlatform.id);
      await fetchPlatforms();
      setDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete platform:", err);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          <span>Add Platform</span>
        </Button>
      </div>

      <Card>
        <CardContent>
          <p className="text-foreground font-medium mb-3">Platforms</p>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : platforms.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No platforms yet. Add your first one.
            </p>
          ) : (
            <div className="space-y-2">
              {platforms.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-foreground">{p.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => openEdit(p)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => openDelete(p)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Platform</DialogTitle>
            <DialogDescription>Add a new delivery platform to track.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Name</p>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Platform name" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Color</p>
              <div className="flex gap-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${formColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={!formName.trim() || saving}>
              {saving ? "Saving..." : "Add Platform"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Platform</DialogTitle>
            <DialogDescription>Update the platform name and color.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Name</p>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Platform name" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Color</p>
              <div className="flex gap-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${formColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={!formName.trim() || saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Platform</DialogTitle>
            <DialogDescription>
              {selectedPlatform && (
                <>Are you sure you want to delete <strong>{selectedPlatform.name}</strong>? This cannot be undone.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EarningsTabBar />
    </div>
  );
}
