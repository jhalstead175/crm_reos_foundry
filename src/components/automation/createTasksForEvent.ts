import { TASK_TRIGGERS } from "./taskTriggers";
import { addDays } from "@/lib/utils/date";

export function createTasksForEvent(event: {
  id: string;
  type: string;
  transaction_id: string;
  created_at: string;
}) {
  return TASK_TRIGGERS
    .filter(t => t.triggerEvent === event.type)
    .map(t => ({
      transaction_id: event.transaction_id,
      origin_event_id: event.id,
      title: t.task.title,
      description: t.task.description,
      assigned_role: t.task.assignedRole,
      due_at: t.task.dueInDays
        ? addDays(event.created_at, t.task.dueInDays)
        : null
    }));
}
