import { describe, it, expect } from "vitest";
import type { Task, Workspace, Channel, Message, Subtask, TaskComment, Activity, Notification, Attachment } from "@/types";

describe("Type Definitions - Task", () => {
  it("should create a valid Task object", () => {
    const task: Task = {
      id: "task-1",
      workspaceId: "ws-1",
      title: "Build dashboard",
      description: "Create the analytics dashboard with Recharts",
      status: "In Progress",
      priority: "High",
      assigneeId: "user-1",
      assigneeName: "Jane",
      dueDate: Date.now() + 86400000,
      tags: ["frontend", "analytics"],
      subtasks: [
        { id: "st-1", title: "Add velocity chart", completed: true },
        { id: "st-2", title: "Add stats cards", completed: false },
      ],
      comments: [
        { id: "c-1", userId: "user-2", userName: "Bob", text: "Looks great!", createdAt: Date.now() },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: 0,
    };

    expect(task.id).toBe("task-1");
    expect(task.status).toBe("In Progress");
    expect(task.subtasks).toHaveLength(2);
    expect(task.subtasks[0].completed).toBe(true);
    expect(task.comments).toHaveLength(1);
    expect(task.tags).toContain("frontend");
  });

  it("should create a minimal Task without optional fields", () => {
    const task: Task = {
      id: "task-2",
      workspaceId: "ws-1",
      title: "Fix bug",
      description: "",
      status: "Backlog",
      priority: "Medium",
      tags: [],
      subtasks: [],
      comments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: 1,
    };

    expect(task.assigneeId).toBeUndefined();
    expect(task.dueDate).toBeUndefined();
    expect(task.tags).toHaveLength(0);
  });
});

describe("Type Definitions - Workspace", () => {
  it("should create a valid Workspace object", () => {
    const workspace: Workspace = {
      id: "ws-1",
      name: "Engineering Team",
      ownerId: "user-1",
      members: {
        "user-1": "Owner",
        "user-2": "Admin",
        "user-3": "Member",
      },
      inviteCode: "ABC123",
      createdAt: Date.now(),
    };

    expect(workspace.members["user-1"]).toBe("Owner");
    expect(Object.keys(workspace.members)).toHaveLength(3);
    expect(workspace.inviteCode).toMatch(/^[A-Z0-9]+$/);
  });
});

describe("Type Definitions - Channel & Message", () => {
  it("should create a valid Channel", () => {
    const channel: Channel = {
      id: "ch-1",
      workspaceId: "ws-1",
      name: "general",
      description: "General discussion",
      createdAt: Date.now(),
    };

    expect(channel.name).toBe("general");
    expect(channel.isDM).toBeUndefined();
  });

  it("should create a DM Channel with participants", () => {
    const dm: Channel = {
      id: "ch-2",
      workspaceId: "ws-1",
      name: "dm-user1-user2",
      isDM: true,
      participants: ["user-1", "user-2"],
      createdAt: Date.now(),
    };

    expect(dm.isDM).toBe(true);
    expect(dm.participants).toHaveLength(2);
  });

  it("should create a valid Message with reactions and attachments", () => {
    const attachment: Attachment = {
      url: "https://storage.example.com/file.pdf",
      name: "report.pdf",
      type: "application/pdf",
      size: 1024000,
    };

    const message: Message = {
      id: "msg-1",
      channelId: "ch-1",
      workspaceId: "ws-1",
      senderId: "user-1",
      senderName: "Alice",
      senderPhoto: "https://example.com/photo.jpg",
      text: "Check out this report",
      isAI: false,
      attachments: [attachment],
      reactions: { "👍": ["user-2", "user-3"], "❤️": ["user-1"] },
      createdAt: Date.now(),
    };

    expect(message.attachments).toHaveLength(1);
    expect(message.reactions?.["👍"]).toHaveLength(2);
    expect(message.isAI).toBe(false);
  });

  it("should create a valid AI-generated message", () => {
    const aiMsg: Message = {
      id: "msg-2",
      channelId: "ch-1",
      workspaceId: "ws-1",
      senderId: "sphere-ai",
      senderName: "Sphere AI",
      text: "Here is the summary...",
      isAI: true,
      reactions: {},
      createdAt: Date.now(),
    };

    expect(aiMsg.isAI).toBe(true);
    expect(aiMsg.senderId).toBe("sphere-ai");
  });
});

describe("Type Definitions - Activity & Notification", () => {
  it("should create a valid Activity entry", () => {
    const activity: Activity = {
      id: "act-1",
      workspaceId: "ws-1",
      userId: "user-1",
      userName: "Alice",
      action: "created",
      targetId: "task-1",
      targetType: "task",
      targetName: "Build dashboard",
      createdAt: Date.now(),
    };

    expect(activity.targetType).toBe("task");
    expect(activity.action).toBe("created");
  });

  it("should create a valid Notification", () => {
    const notification: Notification = {
      id: "notif-1",
      workspaceId: "ws-1",
      userId: "user-1",
      title: "Task assigned",
      body: "You were assigned to 'Fix auth bug'",
      read: false,
      link: "/dashboard",
      createdAt: Date.now(),
    };

    expect(notification.read).toBe(false);
    expect(notification.link).toBe("/dashboard");
  });
});

describe("Type Definitions - Edge Cases", () => {
  it("should handle empty subtasks array", () => {
    const subtasks: Subtask[] = [];
    expect(subtasks).toHaveLength(0);
  });

  it("should handle empty comments array", () => {
    const comments: TaskComment[] = [];
    expect(comments).toHaveLength(0);
  });

  it("should handle empty reactions object", () => {
    const reactions: Record<string, string[]> = {};
    expect(Object.keys(reactions)).toHaveLength(0);
  });
});
