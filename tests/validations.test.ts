import { describe, it, expect } from "vitest";
import { createTaskSchema, sendMessageSchema, aiRequestSchema, loginSchema, registerSchema, createWorkspaceSchema, joinWorkspaceSchema } from "@/lib/validations";

describe("createTaskSchema", () => {
  it("should validate a correct task", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-123",
      title: "Implement feature X",
      description: "Build the thing",
      status: "To Do",
      priority: "High",
      tags: ["frontend"],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-123",
      title: "",
      status: "To Do",
      priority: "High",
    });
    expect(result.success).toBe(false);
  });

  it("should reject title over 200 chars", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-123",
      title: "x".repeat(201),
      status: "To Do",
      priority: "High",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid status", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-123",
      title: "Valid Title",
      status: "InvalidStatus",
      priority: "High",
    });
    expect(result.success).toBe(false);
  });

  it("should default status to Backlog", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-123",
      title: "Valid Title",
      priority: "Medium",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("Backlog");
    }
  });
});

describe("sendMessageSchema", () => {
  it("should validate a correct message", () => {
    const result = sendMessageSchema.safeParse({
      channelId: "ch-1",
      workspaceId: "ws-1",
      text: "Hello world!",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty text", () => {
    const result = sendMessageSchema.safeParse({
      channelId: "ch-1",
      workspaceId: "ws-1",
      text: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("aiRequestSchema", () => {
  it("should validate a summarize request", () => {
    const result = aiRequestSchema.safeParse({
      action: "summarize_channel",
      context: "Some chat messages...",
      workspaceId: "ws-1",
    });
    expect(result.success).toBe(true);
  });

  it("should reject unknown action", () => {
    const result = aiRequestSchema.safeParse({
      action: "unknown_action",
      workspaceId: "ws-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("should validate correct login", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("should validate correct registration", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      displayName: "Jane Doe",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing display name", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      displayName: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createWorkspaceSchema", () => {
  it("should validate a workspace name", () => {
    const result = createWorkspaceSchema.safeParse({ name: "My Team" });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = createWorkspaceSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("joinWorkspaceSchema", () => {
  it("should validate a valid invite code", () => {
    const result = joinWorkspaceSchema.safeParse({ inviteCode: "ABC123" });
    expect(result.success).toBe(true);
  });

  it("should reject too-short invite code", () => {
    const result = joinWorkspaceSchema.safeParse({ inviteCode: "AB" });
    expect(result.success).toBe(false);
  });
});
