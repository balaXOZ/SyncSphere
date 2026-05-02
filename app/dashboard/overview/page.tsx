"use client";

import dynamic from "next/dynamic";
import { useTasks } from "@/lib/hooks/useTasks";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import Recharts for code splitting
const VelocityChart = dynamic(() => import("@/components/dashboard/VelocityChart"), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
  ssr: false,
});

/** Personal dashboard with my tasks, upcoming deadlines, and velocity chart */
export default function OverviewPage() {
  const { activeWorkspace } = useWorkspaceContext();
  const { tasks, loading } = useTasks(activeWorkspace?.id);
  const { user } = useAuth();

  const myTasks = useMemo(() => tasks.filter(t => t.assigneeId === user?.uid), [tasks, user]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === "Done"), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(t => t.status === "In Progress"), [tasks]);
  const upcomingDeadlines = useMemo(() =>
    tasks.filter(t => t.dueDate && t.status !== "Done")
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
      .slice(0, 5),
    [tasks]
  );

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="h-14 flex items-center px-6 border-b shrink-0">
        <h1 className="font-semibold text-lg">Dashboard</h1>
      </header>
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{completedTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <CalendarDays className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{myTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Velocity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <VelocityChart tasks={tasks} />
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map(task => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.status}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      {task.dueDate ? formatDate(task.dueDate) : "No date"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
