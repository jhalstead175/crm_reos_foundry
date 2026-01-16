export type EventType =
  | "transaction.created"
  | "offer.accepted"
  | "inspection.completed"
  | "document.uploaded"
  | "document.signed"
  | "task.completed";

export type Event = {
  id: string;
  type: EventType;
  timestamp: string;
  actor?: string;
  payload?: Record<string, any>;
};
