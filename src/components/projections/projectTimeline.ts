import { EventRecord } from "../eventTypes";

export type TimelineEvent = {
  id: string;
  timestamp: string;
  title: string;
  actor?: string;
};

export const projectTimeline = (
  events: EventRecord[]
): TimelineEvent[] =>
  events.map((e) => ({
    id: e.id,
    timestamp: new Date(e.created_at).toLocaleTimeString(),
    title: e.type.replace(".", " "),
    actor: e.actor_role,
  }));
