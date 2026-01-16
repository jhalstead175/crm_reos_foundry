import { EventRecord } from "../eventTypes";

export type Task = {
  id: string;
  title: string;
  assignee?: string;
  dueDate?: string;
  completed: boolean;
};

export const projectTasks = (events: EventRecord[]): Task[] => {
  const tasks: Record<string, Task> = {};

  for (const e of events) {
    switch (e.type) {
      case "task.created": {
        tasks[e.payload.taskId] = {
          id: e.payload.taskId,
          title: e.payload.title,
          completed: false,
        };
        break;
      }

      case "task.assigned": {
        const t = tasks[e.payload.taskId];
        if (t) t.assignee = e.payload.assignee;
        break;
      }

      case "task.due_date_set": {
        const t = tasks[e.payload.taskId];
        if (t) t.dueDate = e.payload.dueDate;
        break;
      }

      case "task.completed": {
        const t = tasks[e.payload.taskId];
        if (t) t.completed = true;
        break;
      }
    }
  }

  return Object.values(tasks);
};
