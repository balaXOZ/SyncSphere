/** Role types for workspace members */
export type Role = "Owner" | "Admin" | "Member";

/** User profile stored in Firestore */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
}

/** Workspace containing members and invite code */
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: Record<string, Role>;
  inviteCode: string;
  createdAt: number;
}

/** Task statuses for Kanban columns */
export type TaskStatus = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";

/** Task priority levels */
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

/** Subtask within a task */
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

/** Comment on a task */
export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}

/** Task card for the Kanban board */
export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: number;
  tags: string[];
  subtasks: Subtask[];
  comments: TaskComment[];
  createdAt: number;
  updatedAt: number;
  order: number;
}

/** Chat channel */
export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  isDM?: boolean;
  participants?: string[];
  createdAt: number;
}

/** Attachment on a message */
export interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

/** Chat message */
export interface Message {
  id: string;
  channelId: string;
  workspaceId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  isAI?: boolean;
  attachments?: Attachment[];
  reactions?: Record<string, string[]>;
  createdAt: number;
}

/** Activity log entry */
export interface Activity {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  targetId: string;
  targetType: "task" | "channel" | "workspace" | "message";
  targetName?: string;
  createdAt: number;
}

/** In-app notification */
export interface Notification {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: number;
}

/** AI action types for the Sphere AI assistant */
export type AIAction =
  | "summarize_channel"
  | "generate_tasks"
  | "smart_standup"
  | "meeting_notes_to_tasks"
  | "suggest_priority";
