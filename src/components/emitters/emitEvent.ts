import { supabase } from "../supabase";
import { EventType } from "../eventTypes";

type EmitEventArgs = {
  transactionId: string;
  type: EventType;
  actorRole: string;
  actorId: string;
  payload: Record<string, any>;
};

export const emitEvent = async ({
  transactionId,
  type,
  actorRole,
  actorId,
  payload,
}: EmitEventArgs) => {
  const { error } = await supabase.from("events").insert({
    transaction_id: transactionId,
    type,
    actor_role: actorRole,
    actor_id: actorId,
    payload,
  });

  if (error) {
    console.error("Event emission failed", error);
    throw error;
  }
};
