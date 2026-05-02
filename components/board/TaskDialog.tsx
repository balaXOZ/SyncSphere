"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Task, TaskPriority, TaskStatus, Subtask } from "@/types";
import { Trash2, Plus, CheckCircle2, Circle } from "lucide-react";

const STATUSES: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Review", "Done"];
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

/** Task detail dialog for editing all fields: title, description, assignee, due date, priority, tags, subtasks, comments */
export function TaskDialog({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");

  const handleSave = async () => {
    await onUpdate(task.id, {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      tags,
      subtasks,
    });
    onClose();
  };

  const handleDelete = async () => {
    await onDelete(task.id);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtask.trim(), completed: false }]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-semibold" />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="task-desc">Description (Markdown)</Label>
            <textarea
              id="task-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
              placeholder="Describe the task..."
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="task-due">Due Date</Label>
            <Input id="task-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add a tag" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}} />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <Label>Subtasks</Label>
            <div className="space-y-2 mb-2">
              {subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2">
                  <button onClick={() => toggleSubtask(st.id)} className="shrink-0" aria-label={st.completed ? "Mark incomplete" : "Mark complete"}>
                    {st.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <span className={st.completed ? "line-through text-muted-foreground text-sm" : "text-sm"}>{st.title}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add subtask" value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSubtask(); }}} />
              <Button type="button" variant="outline" size="sm" onClick={addSubtask}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
