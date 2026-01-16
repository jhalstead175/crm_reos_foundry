// lib/events/templates/deriveTemplates.ts
import { EventTemplates } from "./eventTemplates";
import { Role } from "@/lib/events/permissions";
import { TransactionPhase } from "@/lib/transactions/phases";

export function deriveEventTemplates({
  phase,
  role
}: {
  phase: TransactionPhase;
  role: Role;
}) {
  return EventTemplates.filter(
    (t) =>
      t.phases.includes(phase) &&
      t.suggestedRoles.includes(role)
  );
}
