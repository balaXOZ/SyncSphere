"use client";

import KanbanBoard from "@/components/board/KanbanBoard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { debounce } from "@/lib/utils";

/** Dashboard board page with search filter */
export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="h-14 flex items-center justify-between px-6 border-b shrink-0">
        <h1 className="font-semibold text-lg">Task Board</h1>
      </header>
      <div className="flex-1 overflow-auto p-4">
        <KanbanBoard />
      </div>
    </div>
  );
}
