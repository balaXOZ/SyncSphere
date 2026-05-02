"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/** Error boundary for dashboard routes */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{error.message}</p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
