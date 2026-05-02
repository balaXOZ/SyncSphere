"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task, TaskStatus } from "@/types";
import { SortableTaskCard, TaskCardOverlay } from "./SortableTaskCard";
import { TaskDialog } from "./TaskDialog";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useTasks } from "@/lib/hooks/useTasks";
import { Plus, Search } from "lucide-react";
import { TaskCardSkeleton } from "@/components/ui/skeleton";
import { useDroppable } from "@dnd-kit/core";
import { debounce } from "@/lib/utils";

const COLUMNS: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Review", "Done"];

/** Main Kanban board with drag-drop, search/filter, real-time Firestore sync */
export default function KanbanBoard() {
  const { activeWorkspace } = useWorkspaceContext();
  const { tasks, loading, updateTaskStatus, createTask, updateTask, deleteTask } = useTasks(activeWorkspace?.id);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q)) ||
      t.priority.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => filteredTasks.filter(t => t.status === status),
    [filteredTasks]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  }, [tasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (COLUMNS.includes(overId as TaskStatus)) {
      const currentTask = tasks.find(t => t.id === taskId);
      if (currentTask && currentTask.status !== overId) {
        updateTaskStatus(taskId, overId as TaskStatus, 0);
      }
      return;
    }

    // Dropped on another task
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      const currentTask = tasks.find(t => t.id === taskId);
      if (currentTask && currentTask.status !== overTask.status) {
        updateTaskStatus(taskId, overTask.status, overTask.order);
      }
    }
  }, [tasks, updateTaskStatus]);

  const debouncedSearch = useMemo(
    () => debounce((val: string) => setSearchQuery(val), 300),
    []
  );

  if (loading) {
    return (
      <div className="flex gap-6 h-full items-start overflow-x-auto p-6">
        {COLUMNS.map(col => (
          <div key={col} className="flex flex-col w-72 shrink-0 space-y-3">
            <div className="skeleton h-10 w-full rounded-lg" />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full items-start overflow-x-auto pb-4">
          {COLUMNS.map(column => (
            <BoardColumn
              key={column}
              title={column}
              tasks={getTasksByStatus(column)}
              onCreate={() => createTask({ status: column })}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}
    </>
  );
}

function BoardColumn({ title, tasks, onCreate, onTaskClick }: {
  title: TaskStatus;
  tasks: Task[];
  onCreate: () => void;
  onTaskClick: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
    data: { type: "Column" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 shrink-0 rounded-xl border transition-colors ${isOver ? "border-primary bg-primary/5" : "bg-muted/30"}`}
    >
      <div className="p-3 font-medium flex items-center justify-between border-b bg-muted/50 rounded-t-xl">
        <div className="flex items-center gap-2 text-sm">
          {title}
          <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCreate} aria-label={`Add task to ${title}`}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 p-2 flex flex-col gap-2 min-h-[120px]">
        <SortableContext items={tasks.map(t => t.id)}>
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex-1 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground text-xs py-8">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
