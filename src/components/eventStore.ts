import { supabase } from "./supabase";
import { EventRecord } from "./eventTypes";

type Listener = (events: EventRecord[]) => void;

let events: EventRecord[] = [];
let listeners: Listener[] = [];

export const subscribeToEvents = (listener: Listener) => {
  listeners.push(listener);
  listener(events);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

const notify = () => {
  for (const listener of listeners) {
    listener([...events]);
  }
};

export const loadEvents = async (transactionId: string) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("transaction_id", transactionId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  events = data as EventRecord[];
  notify();
};

export const startRealtime = (transactionId: string) => {
  supabase
    .channel(`events:${transactionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "events",
        filter: `transaction_id=eq.${transactionId}`,
      },
      (payload) => {
        events = [...events, payload.new as EventRecord];
        notify();
      }
    )
    .subscribe();
};
