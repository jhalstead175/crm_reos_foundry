// src/lib/fetchEvents.ts

import { supabase } from "./supabase"
import { ChronosEvent } from "@/domain/events"

export async function fetchTransactionEvents(
  transactionId: string
): Promise<ChronosEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("transaction_id", transactionId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data as ChronosEvent[]
}
