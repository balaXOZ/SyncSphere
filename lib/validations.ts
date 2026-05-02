import { z } from "zod";

/** Schema for creating a new task */
export const createTaskSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(5000, "Description too long").optional().default(""),
  status: z.enum(["Backlog", "To Do", "In Progress", "Review", "Done"]).default("Backlog"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
  assigneeId: z.string().optional(),
  assigneeName: z.string().optional(),
  dueDate: z.number().optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

/** Schema for updating a task */
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(["Backlog", "To Do", "In Progress", "Review", "Done"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  assigneeId: z.string().optional().nullable(),
  assigneeName: z.string().optional().nullable(),
  dueDate: z.number().optional().nullable(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

/** Schema for sending a message */
export const sendMessageSchema = z.object({
  channelId: z.string().min(1),
  workspaceId: z.string().min(1),
  text: z.string().min(1, "Message cannot be empty").max(4000, "Message too long"),
});

/** Schema for creating a workspace */
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

/** Schema for joining a workspace */
export const joinWorkspaceSchema = z.object({
  inviteCode: z.string().min(4, "Invalid invite code").max(10, "Invalid invite code"),
});

/** Schema for AI assistant requests */
export const aiRequestSchema = z.object({
  action: z.enum([
    "summarize_channel",
    "generate_tasks",
    "smart_standup",
    "meeting_notes_to_tasks",
    "suggest_priority",
  ]),
  context: z.string().max(50000).optional().default(""),
  workspaceId: z.string().min(1),
});

/** Schema for login with email/password */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** Schema for registration */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1, "Display name is required").max(50),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type JoinWorkspaceInput = z.infer<typeof joinWorkspaceSchema>;
export type AIRequestInput = z.infer<typeof aiRequestSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
