import { Role } from "@/lib/events/permissions";

export interface TimelineItem {
  eventId: string;
  transactionId: string;
  occurredAt: string;

  // What the user sees
  title: string;
  description?: string;

  // Display metadata
  icon?: string;
  emphasis?: "normal" | "important" | "critical";

  // Governance
  visibleToRoles: Role[];
}
