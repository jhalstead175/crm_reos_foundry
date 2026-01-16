import { EventRegistry } from "@/lib/events/eventRegistry";
import { ActionRegistry } from "./actionRegistry";
import { Role } from "@/lib/events/permissions";
import { UIAction } from "./actionTypes";

export function deriveActions({
  role
}: {
  role: Role;
}): UIAction[] {
  return Object.values(EventRegistry)
    .filter((eventDef) => {
      if (eventDef.systemOnly) return false;
      return eventDef.allowedRoles.includes(role);
    })
    .map((eventDef) => ActionRegistry[eventDef.type])
    .filter(Boolean) as UIAction[];
}
