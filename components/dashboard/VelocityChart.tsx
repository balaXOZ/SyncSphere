"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Task } from "@/types";

interface VelocityChartProps {
  tasks: Task[];
}

/** Team velocity chart showing tasks completed per week using Recharts */
export default function VelocityChart({ tasks }: VelocityChartProps) {
  const data = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === "Done" && t.updatedAt);

    // Group by week
    const weeks: Record<string, number> = {};
    const now = Date.now();
    
    // Generate last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      weeks[label] = 0;
    }

    completedTasks.forEach(task => {
      const taskDate = new Date(task.updatedAt);
      const weeksSinceNow = Math.floor((now - task.updatedAt) / (7 * 24 * 60 * 60 * 1000));
      if (weeksSinceNow >= 0 && weeksSinceNow < 8) {
        const weekStart = new Date(now - weeksSinceNow * 7 * 24 * 60 * 60 * 1000);
        const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (weeks[label] !== undefined) {
          weeks[label]++;
        }
      }
    });

    return Object.entries(weeks).map(([week, count]) => ({ week, completed: count }));
  }, [tasks]);

  if (data.every(d => d.completed === 0)) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        Complete some tasks to see velocity data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="week" className="text-xs" tick={{ fontSize: 11 }} />
        <YAxis className="text-xs" tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="completed" fill="hsl(243, 75%, 59%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
