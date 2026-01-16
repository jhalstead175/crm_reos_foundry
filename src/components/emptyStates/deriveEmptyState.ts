import { PHASE_EMPTY_STATES } from "./phaseEmptyStates";
import { Role } from "@/lib/events/permissions";
import { TransactionPhase } from "@/lib/transactions/phases";

export function deriveEmptyState({
  phase,
  section,
  role
}: {
  phase: TransactionPhase;
  section: "timeline" | "tasks" | "documents";
  role: Role;
}) {
  return PHASE_EMPTY_STATES.find(
    s =>
      s.phase === phase &&
      s.section === section &&
      s.visibleToRoles.includes(role)
  );
}
