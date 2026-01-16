// lib/events/templates/types.ts
import { EventType } from "@/lib/events/eventRegistry";
import { Role } from "@/lib/events/permissions";

export interface EventTemplate {
  id: string;
  eventType: EventType;
  label: string;
  description?: string;

  // UX context
  phases: TransactionPhase[];
  suggestedRoles: Role[];

  // Form acceleration
  defaults?: Record<string, any>;
}
