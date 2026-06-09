"use client";

import { ArrowLeft, Bike, Calendar, Clock, DollarSign, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EarningsEntry {
  id: string;
  platform: string;
  hours: number;
  earnings: number;
  date: string;
  notes?: string;
}

export default function EntryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [entry, setEntry] = useState<EarningsEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const client = createClient();
        const response = await client.database.from("earnings_entries").select("*").eq("id", id).single();
        if (response?.data) {
          setEntry(response.data as EarningsEntry);
        } else {
          setError("Entry not found");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load entry");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEntry();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const client = createClient();
      await client.database.from("earnings_entries").delete().eq("id", id);
      window.location.href = "/earnings/history";
    } catch (err: any) {
      console.error("Delete failed:", err?.message || err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/earnings/history" className="p-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Entry Not Found</h1>
        </div>
        <p className="text-muted-foreground">{error || "This entry does not exist."}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/earnings/history" className="p-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Entry Details</h1>
        </div>
        <Dialog>
          <DialogTrigger render={<Button variant="destructive" size="icon" />}>
            <Trash2 className="w-4 h-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Entry</DialogTitle>
              <DialogDescription>
                Are you sure? This will permanently remove this earnings entry.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-4">
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Bike className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Platform</p>
              <p className="text-lg font-semibold text-foreground">{entry.platform}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-base text-foreground">{entry.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Hours Worked</p>
              <p className="text-base text-foreground">{entry.hours}h</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Earnings</p>
              <p className="text-2xl font-bold text-foreground">${entry.earnings.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {entry.notes && (
        <Card>
          <CardContent>
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{entry.notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
