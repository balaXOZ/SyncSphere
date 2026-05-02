import { describe, it, expect } from "vitest";
import { z } from "zod";

const taskSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional().default(""),
  status: z.enum(["Backlog", "To Do", "In Progress", "Review", "Done"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
});

describe("Task Schema Validation", () => {
  it("should validate a correct task", () => {
    const validTask = {
      workspaceId: "ws-123",
      title: "Implement feature X",
      description: "Do the things",
      status: "To Do",
      priority: "High",
    };

    const result = taskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("should reject an invalid task without title", () => {
    const invalidTask = {
      workspaceId: "ws-123",
      title: "",
      status: "To Do",
      priority: "High",
    };

    const result = taskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
  });
});
