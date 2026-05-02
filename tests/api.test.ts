import { describe, it, expect } from "vitest";
import {
  aiRequestSchema,
  createTaskSchema,
  updateTaskSchema,
  sendMessageSchema,
} from "@/lib/validations";

describe("AI API Route - Input Validation", () => {
  it("should reject request with missing action", () => {
    const result = aiRequestSchema.safeParse({
      context: "some context",
      workspaceId: "ws-1",
    });
    expect(result.success).toBe(false);
  });

  it("should reject request with invalid action type", () => {
    const result = aiRequestSchema.safeParse({
      action: "invalid_action",
      context: "test",
      workspaceId: "ws-1",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid summarize_channel request", () => {
    const result = aiRequestSchema.safeParse({
      action: "summarize_channel",
      context: "User1: Hello\nUser2: Hi there",
      workspaceId: "ws-123",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid generate_tasks request", () => {
    const result = aiRequestSchema.safeParse({
      action: "generate_tasks",
      context: "We need to build the dashboard and add auth",
      workspaceId: "ws-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.action).toBe("generate_tasks");
    }
  });

  it("should accept valid smart_standup request", () => {
    const result = aiRequestSchema.safeParse({
      action: "smart_standup",
      context: "[Done] Setup CI\n[In Progress] Build dashboard",
      workspaceId: "ws-456",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid meeting_notes_to_tasks request", () => {
    const result = aiRequestSchema.safeParse({
      action: "meeting_notes_to_tasks",
      context: "Action items: 1. Fix auth bug 2. Update docs",
      workspaceId: "ws-789",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid suggest_priority request", () => {
    const result = aiRequestSchema.safeParse({
      action: "suggest_priority",
      context: "Task A (High): Due tomorrow\nTask B (Low): Due next week",
      workspaceId: "ws-101",
    });
    expect(result.success).toBe(true);
  });

  it("should reject context exceeding max length", () => {
    const result = aiRequestSchema.safeParse({
      action: "summarize_channel",
      context: "x".repeat(50001),
      workspaceId: "ws-1",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty workspaceId", () => {
    const result = aiRequestSchema.safeParse({
      action: "summarize_channel",
      context: "some text",
      workspaceId: "",
    });
    expect(result.success).toBe(false);
  });

  it("should default context to empty string when not provided", () => {
    const result = aiRequestSchema.safeParse({
      action: "smart_standup",
      workspaceId: "ws-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.context).toBe("");
    }
  });
});

describe("Tasks API Route - Input Validation", () => {
  it("should reject task with missing workspaceId", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid Title",
      priority: "High",
    });
    expect(result.success).toBe(false);
  });

  it("should validate task with all optional fields", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-123",
      title: "Full Task",
      description: "Detailed description here",
      status: "In Progress",
      priority: "Urgent",
      assigneeId: "user-1",
      assigneeName: "John Doe",
      dueDate: Date.now() + 86400000,
      tags: ["frontend", "urgent", "v2"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toHaveLength(3);
      expect(result.data.status).toBe("In Progress");
    }
  });

  it("should reject tags exceeding max count of 10", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-123",
      title: "Task",
      priority: "Medium",
      tags: Array.from({ length: 11 }, (_, i) => `tag-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("should reject tag strings exceeding max length of 30", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-123",
      title: "Task",
      priority: "Medium",
      tags: ["a".repeat(31)],
    });
    expect(result.success).toBe(false);
  });

  it("should accept update task with partial fields", () => {
    const result = updateTaskSchema.safeParse({
      title: "Updated Title",
      priority: "Low",
    });
    expect(result.success).toBe(true);
  });

  it("should accept update task with nullable fields", () => {
    const result = updateTaskSchema.safeParse({
      assigneeId: null,
      assigneeName: null,
      dueDate: null,
    });
    expect(result.success).toBe(true);
  });

  it("should reject update task with invalid status", () => {
    const result = updateTaskSchema.safeParse({
      status: "InvalidStatus",
    });
    expect(result.success).toBe(false);
  });
});

describe("Message Validation", () => {
  it("should reject message exceeding 4000 chars", () => {
    const result = sendMessageSchema.safeParse({
      channelId: "ch-1",
      workspaceId: "ws-1",
      text: "x".repeat(4001),
    });
    expect(result.success).toBe(false);
  });

  it("should accept a valid message at max length", () => {
    const result = sendMessageSchema.safeParse({
      channelId: "ch-1",
      workspaceId: "ws-1",
      text: "x".repeat(4000),
    });
    expect(result.success).toBe(true);
  });

  it("should reject message with missing channelId", () => {
    const result = sendMessageSchema.safeParse({
      workspaceId: "ws-1",
      text: "hello",
    });
    expect(result.success).toBe(false);
  });
});
