// Task types for transaction context
export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "high" | "medium" | "low";

export interface TransactionTask {
  id: string;
  transactionId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

// Event types for timeline
export type TransactionEvent =
  | {
      type: "task.created";
      taskId: string;
      taskTitle: string;
      transactionId: string;
      timestamp: string;
    }
  | {
      type: "task.status_changed";
      taskId: string;
      taskTitle: string;
      from: TaskStatus;
      to: TaskStatus;
      timestamp: string;
    }
  | {
      type: "task.completed";
      taskId: string;
      taskTitle: string;
      timestamp: string;
    }
  | {
      type: "system";
      title: string;
      timestamp: string;
    }
  | {
      type: "milestone";
      title: string;
      timestamp: string;
    };
