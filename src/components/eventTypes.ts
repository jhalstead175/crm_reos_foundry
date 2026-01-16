export type EventType =
  | "task.created"
  | "task.assigned"
  | "task.completed"
  | "task.due_date_set";

export type EventRecord = {
  id: string;
  transaction_id: string;
  type: EventType;
  actor_role: string;
  actor_id: string;
  payload: any;
  created_at: string;
};
