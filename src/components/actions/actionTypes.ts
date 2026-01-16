import { EventType } from "@/lib/events/eventRegistry";

export interface UIAction {
  eventType: EventType;
  label: string;
  description?: string;
  primary?: boolean;
}
