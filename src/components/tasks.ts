import { Event } from "./events";

/* =====================================================
   Task Model
   ===================================================== */

export type TaskStatus = "todo" | "doing" | "done";

export type DerivedTask = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  assignee?: string;
  sourceEventId: string;
};

/* =====================================================
   Task Derivation
   Events → Tasks (Pure Function)
   ===================================================== */

export function deriveTasksFromEvents(
  events: Event[]
): DerivedTask[] {
  const tasks: DerivedTask[] = [];

  for (const event of events) {
    switch (event.type) {
      case "offer.accepted": {
        tasks.push({
          id: `task-schedule-inspection-${event.id}`,
          title: "Schedule inspection",
          status: "todo",
          dueDate: "Within 7 days",
          assignee: "Buyer",
          sourceEventId: event.id,
        });
        break;
      }

      case "inspection.completed": {
        tasks.push({
          id: `task-review-inspection-${event.id}`,
          title: "Review inspection report",
          status: "doing",
          assignee: "You",
          sourceEventId: event.id,
        });
        break;
      }

      case "document.uploaded": {
        if (event.payload?.documentType === "addendum") {
          tasks.push({
            id: `task-review-addendum-${event.id}`,
            title: "Review uploaded addendum",
            status: "todo",
            assignee: "Attorney",
            sourceEventId: event.id,
          });
        }
        break;
      }

      case "task.completed": {
        const completedTaskId = event.payload?.taskId;
        if (completedTaskId) {
          const task = tasks.find(
            (t) => t.id === completedTaskId
          );
          if (task) {
            task.status = "done";
          }
        }
        break;
      }

      default:
        break;
    }
  }

  return tasks;
}
