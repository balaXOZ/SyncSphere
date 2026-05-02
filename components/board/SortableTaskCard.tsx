"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { CalendarDays, CheckCircle2 } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  Urgent: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

/** Draggable task card within a Kanban column */
export function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="opacity-30 bg-muted border-2 border-dashed border-primary rounded-lg h-[100px]" role="listitem" aria-label={`Dragging ${task.title}`} />
    );
  }

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} role="listitem" aria-label={`Task: ${task.title}, Priority: ${task.priority}, Status: ${task.status}`}>
      <Card
        className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors bg-card shadow-sm"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      >
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium leading-tight">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-2 space-y-2">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-transparent", PRIORITY_COLORS[task.priority])}>
              {task.priority}
            </Badge>
            {task.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {formatDate(task.dueDate)}
              </span>
            )}
            {totalSubtasks > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Non-interactive overlay shown while dragging */
export function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <Card className="shadow-xl border-primary/50 bg-card w-72 rotate-3">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-transparent", PRIORITY_COLORS[task.priority])}>
          {task.priority}
        </Badge>
      </CardContent>
    </Card>
  );
}
