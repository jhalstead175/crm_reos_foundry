import { EventRegistry } from "./eventRegistry";
import { Role } from "./permissions";

export function validateEvent({
  type,
  payload,
  actorRole
}: {
  type: string;
  payload: unknown;
  actorRole: Role;
}) {
  const definition = EventRegistry[type as keyof typeof EventRegistry];

  if (!definition) {
    throw new Error(`Unknown event type: ${type}`);
  }

  if (!definition.allowedRoles.includes(actorRole)) {
    throw new Error(`Role ${actorRole} not allowed to create ${type}`);
  }

  const result = definition.schema.safeParse(payload);

  if (!result.success) {
    throw new Error(`Invalid payload for ${type}`);
  }

  return {
    type: definition.type,
    payload: result.data
  };
}
