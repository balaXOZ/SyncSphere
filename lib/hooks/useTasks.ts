"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task, TaskStatus } from "@/types";
import { toast } from "sonner";

/** Hook for managing tasks in Firestore with real-time sync */
export function useTasks(workspaceId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "tasks"), where("workspaceId", "==", workspaceId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Task));
      taskData.sort((a, b) => a.order - b.order);
      setTasks(taskData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [workspaceId]);

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        status: newStatus,
        order: newOrder,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, data: Partial<Task>) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        ...data,
        updatedAt: Date.now(),
      });
      toast.success("Task updated");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  }, []);

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    if (!workspaceId) return;
    try {
      const newRef = doc(collection(db, "tasks"));
      const newTask: Task = {
        id: newRef.id,
        workspaceId,
        title: taskData.title || "New Task",
        description: taskData.description || "",
        status: taskData.status || "Backlog",
        priority: taskData.priority || "Medium",
        assigneeId: taskData.assigneeId,
        assigneeName: taskData.assigneeName,
        dueDate: taskData.dueDate,
        tags: taskData.tags || [],
        subtasks: taskData.subtasks || [],
        comments: taskData.comments || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        order: tasks.filter(t => t.status === (taskData.status || "Backlog")).length,
      };
      await setDoc(newRef, newTask);
      toast.success("Task created");
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  }, [workspaceId, tasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      toast.success("Task deleted");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  }, []);

  return { tasks, loading, updateTaskStatus, updateTask, createTask, deleteTask };
}
