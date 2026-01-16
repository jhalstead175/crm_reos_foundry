// Automation rules engine - deterministic event-driven task creation
// All rules are pure functions: given state → returns actions to perform

import type { TransactionTask, TransactionEvent } from "../types/task";
import { supabase } from "./supabase";

// Automation action types
export interface AutomationAction {
  type: "create_task" | "emit_event";
  payload: any;
}

// Rule: When transaction status changes to "Under Contract", create inspection task
export function checkOfferAcceptedRule(
  transactionStatus: string,
  previousStatus: string
): AutomationAction[] {
  if (previousStatus !== "Under Contract" && transactionStatus === "Under Contract") {
    const taskTitle = "Schedule home inspection";
    const reason = "Offer accepted - inspection period started";

    return [
      {
        type: "create_task",
        payload: {
          title: taskTitle,
          priority: "high",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          reason,
        },
      },
      {
        type: "emit_event",
        payload: {
          type: "milestone.reached",
          title: "Offer Accepted",
          description: "Transaction moved to Under Contract status",
        },
      },
    ];
  }

  return [];
}

// Rule: When all tasks are completed, emit milestone
export function checkAllTasksCompletedRule(
  tasks: TransactionTask[]
): AutomationAction[] {
  if (tasks.length === 0) return [];

  const allDone = tasks.every((t) => t.status === "done");
  if (allDone) {
    return [
      {
        type: "emit_event",
        payload: {
          type: "milestone.reached",
          title: "All Tasks Completed",
          description: "All tasks for this transaction have been completed",
        },
      },
    ];
  }

  return [];
}

// Rule: When transaction status changes to "Contingency Period", create contingency review tasks
export function checkContingencyPeriodRule(
  transactionStatus: string,
  previousStatus: string
): AutomationAction[] {
  if (previousStatus !== "Contingency Period" && transactionStatus === "Contingency Period") {
    return [
      {
        type: "create_task",
        payload: {
          title: "Review inspection report",
          priority: "high",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
          reason: "Contingency period started",
        },
      },
      {
        type: "create_task",
        payload: {
          title: "Negotiate repairs or credits",
          priority: "medium",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
          reason: "Contingency period started",
        },
      },
      {
        type: "emit_event",
        payload: {
          type: "deadline.created",
          title: "Contingency Period Deadline",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    ];
  }

  return [];
}

// Rule: When transaction status changes to "Clear to Close", create final tasks
export function checkClearToCloseRule(
  transactionStatus: string,
  previousStatus: string
): AutomationAction[] {
  if (previousStatus !== "Clear to Close" && transactionStatus === "Clear to Close") {
    return [
      {
        type: "create_task",
        payload: {
          title: "Final walkthrough",
          priority: "high",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
          reason: "Transaction cleared to close",
        },
      },
      {
        type: "create_task",
        payload: {
          title: "Wire transfer verification",
          priority: "high",
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day
          reason: "Transaction cleared to close",
        },
      },
      {
        type: "emit_event",
        payload: {
          type: "milestone.reached",
          title: "Clear to Close",
          description: "All contingencies satisfied - ready for closing",
        },
      },
    ];
  }

  return [];
}

// Execute automation rules based on state changes
export function executeAutomationRules(
  trigger: {
    type: "status_change" | "task_completed" | "document_uploaded";
    transactionStatus?: string;
    previousStatus?: string;
    transactionId: string;
    tasks?: TransactionTask[];
  }
): AutomationAction[] {
  const actions: AutomationAction[] = [];

  // Check status change rules
  if (trigger.type === "status_change" && trigger.transactionStatus && trigger.previousStatus) {
    actions.push(
      ...checkOfferAcceptedRule(trigger.transactionStatus, trigger.previousStatus)
    );
    actions.push(
      ...checkContingencyPeriodRule(trigger.transactionStatus, trigger.previousStatus)
    );
    actions.push(
      ...checkClearToCloseRule(trigger.transactionStatus, trigger.previousStatus)
    );
  }

  // Check task completion rules
  if (trigger.type === "task_completed" && trigger.tasks) {
    actions.push(...checkAllTasksCompletedRule(trigger.tasks));
  }

  return actions;
}

// Persist automation actions to Supabase
export async function persistAutomationActions(
  actions: AutomationAction[],
  transactionId: string
): Promise<{
  createdTasks: TransactionTask[];
  createdEvents: TransactionEvent[];
}> {
  const createdTasks: TransactionTask[] = [];
  const createdEvents: TransactionEvent[] = [];

  for (const action of actions) {
    if (action.type === "create_task") {
      const { title, priority, dueDate, reason } = action.payload;

      // Create task in DB
      const { data: taskData, error: taskError } = await supabase
        .from("transaction_tasks")
        .insert({
          transaction_id: transactionId,
          title,
          status: "todo",
          priority: priority || "medium",
          due_date: dueDate || null,
          assignee: null,
        })
        .select()
        .single();

      if (taskError) {
        console.error("Error creating auto task:", taskError);
        continue;
      }

      createdTasks.push({
        id: taskData.id,
        transactionId: taskData.transaction_id,
        title: taskData.title,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.due_date,
        assignee: taskData.assignee,
        createdAt: taskData.created_at,
      });

      // Emit task.auto_created event
      const autoCreatedEvent = {
        transaction_id: transactionId,
        type: "task.auto_created",
        payload: {
          taskId: taskData.id,
          taskTitle: title,
          reason,
          transactionId,
          timestamp: new Date().toISOString(),
        },
      };

      await supabase.from("transaction_events").insert(autoCreatedEvent);

      createdEvents.push({
        type: "task.auto_created",
        taskId: taskData.id,
        taskTitle: title,
        reason,
        transactionId,
        timestamp: autoCreatedEvent.payload.timestamp,
      });
    } else if (action.type === "emit_event") {
      const eventPayload = action.payload;

      // Insert event to DB
      await supabase.from("transaction_events").insert({
        transaction_id: transactionId,
        type: eventPayload.type,
        payload: eventPayload,
      });

      createdEvents.push({
        ...eventPayload,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return { createdTasks, createdEvents };
}
