"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ListTodo, Calendar, FileText, ArrowUpDown, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useTasks } from "@/lib/hooks/useTasks";
import { AIAction } from "@/types";

interface AIResult {
  action: string;
  result: string;
  timestamp: number;
}

const AI_ACTIONS: { action: AIAction; label: string; icon: React.ReactNode; description: string }[] = [
  { action: "summarize_channel", label: "Summarize Channel", icon: <Sparkles className="h-4 w-4" />, description: "Condense last 50 messages into action items" },
  { action: "generate_tasks", label: "Tasks from Chat", icon: <ListTodo className="h-4 w-4" />, description: "Extract TODOs and create Kanban cards" },
  { action: "smart_standup", label: "Smart Standup", icon: <Calendar className="h-4 w-4" />, description: "Auto-generate daily standup report" },
  { action: "meeting_notes_to_tasks", label: "Notes → Tasks", icon: <FileText className="h-4 w-4" />, description: "Paste meeting notes, get structured tasks" },
  { action: "suggest_priority", label: "Suggest Priority", icon: <ArrowUpDown className="h-4 w-4" />, description: "AI recommends optimal task ordering" },
];

/** Right-rail AI Assistant panel — the showcase Gemini feature */
export function AIAssistant() {
  const { activeWorkspace } = useWorkspaceContext();
  const { tasks } = useTasks(activeWorkspace?.id);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIResult[]>([]);
  const [notesInput, setNotesInput] = useState("");

  const runAction = useCallback(async (action: AIAction) => {
    if (!activeWorkspace) return;
    setLoading(true);

    let context = "";
    if (action === "smart_standup" || action === "suggest_priority") {
      context = tasks.map(t => `[${t.status}] ${t.title} (${t.priority}) - ${t.description}`).join("\n");
    } else if (action === "meeting_notes_to_tasks") {
      context = notesInput;
      if (!context.trim()) {
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, context, workspaceId: activeWorkspace.id }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResults(prev => [{ action, result: data.result, timestamp: Date.now() }, ...prev]);
    } catch {
      setResults(prev => [{ action, result: "❌ Failed to get AI response. Please try again.", timestamp: Date.now() }, ...prev]);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace, tasks, notesInput]);

  if (!expanded) {
    return (
      <div className="w-10 border-l flex flex-col items-center py-4 bg-muted/10">
        <Button variant="ghost" size="icon" onClick={() => setExpanded(true)} aria-label="Expand AI Assistant">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="mt-4 [writing-mode:vertical-lr] text-xs text-muted-foreground font-medium">
          Sphere AI
        </div>
      </div>
    );
  }

  return (
    <aside className="w-80 border-l flex flex-col bg-muted/5 shrink-0" aria-label="AI Assistant">
      <div className="h-12 border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden="true" />
          <span className="font-semibold text-sm">Sphere AI</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(false)} aria-label="Collapse AI Assistant">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3">
        {/* Action Buttons */}
        <div className="space-y-1.5 mb-4">
          {AI_ACTIONS.map(({ action, label, icon, description }) => (
            <Button
              key={action}
              variant="ghost"
              className="w-full justify-start h-auto py-2 px-3 text-left"
              onClick={() => runAction(action)}
              disabled={loading}
            >
              <div className="flex items-start gap-3 w-full">
                <span className="text-indigo-500 shrink-0 mt-0.5">{icon}</span>
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-[10px] text-muted-foreground">{description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Meeting Notes Input */}
        <div className="mb-4">
          <textarea
            value={notesInput}
            onChange={e => setNotesInput(e.target.value)}
            placeholder="Paste meeting notes here for 'Notes → Tasks'..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Meeting notes input"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 mb-3">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            <span className="text-xs text-indigo-600 dark:text-indigo-400">Sphere AI is thinking...</span>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={i} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-0">
                  AI Generated
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="text-xs whitespace-pre-wrap leading-relaxed text-foreground">{r.result}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
