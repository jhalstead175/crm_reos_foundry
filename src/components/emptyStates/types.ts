import { TransactionPhase } from "@/lib/transactions/phases";
import { Role } from "@/lib/events/permissions";

export interface PhaseEmptyState {
  phase: TransactionPhase;
  section: "timeline" | "tasks" | "documents";

  title: string;
  explanation: string;

  suggestions: {
    label: string;
    eventType?: string;
  }[];

  visibleToRoles: Role[];
}
