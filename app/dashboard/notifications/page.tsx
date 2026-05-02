"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Sparkles, ListTodo, MessageSquare } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface MockNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type: "task" | "ai" | "chat";
  createdAt: number;
}

const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: "1", title: "Task assigned to you", body: '"Setup CI/CD" was assigned to you', read: false, type: "task", createdAt: Date.now() - 300000 },
  { id: "2", title: "Sphere AI generated tasks", body: "3 tasks were generated from #engineering chat", read: false, type: "ai", createdAt: Date.now() - 3600000 },
  { id: "3", title: "New message in #general", body: "Alice: Hey team, the standup is at 10am", read: true, type: "chat", createdAt: Date.now() - 7200000 },
];

const ICON_MAP = {
  task: <ListTodo className="h-4 w-4 text-blue-500" />,
  ai: <Sparkles className="h-4 w-4 text-indigo-500" />,
  chat: <MessageSquare className="h-4 w-4 text-emerald-500" />,
};

/** In-app notification center */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="h-14 flex items-center justify-between px-6 border-b shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-lg">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark all read
        </Button>
      </header>
      <div className="flex-1 overflow-auto p-6" role="log" aria-label="Notifications" aria-live="polite">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-lg mb-1">All caught up!</h2>
            <p className="text-sm text-muted-foreground">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {notifications.map(n => (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors ${n.read ? "opacity-60" : "border-primary/20 bg-primary/5"}`}
                onClick={() => markRead(n.id)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{ICON_MAP[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
