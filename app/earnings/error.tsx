"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EarningsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
      <h2 className="text-lg font-bold text-foreground mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{error.message || "An unexpected error occurred."}</p>
      <Button onClick={reset}>
        <RefreshCw className="w-4 h-4" />
        Try again
      </Button>
    </div>
  );
}
