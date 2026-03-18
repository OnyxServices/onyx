/** Realtime API wrapper: centraliza suscripciones vía Supabase */

import { supabaseClient, ensureClient } from "./supabaseClient.js";

export function subscribeToInserts(table, callback) {
  ensureClient();
  if (!supabaseClient) return null;
  return supabaseClient
    .channel(`realtime-${table}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table,
      },
      (payload) => {
        if (typeof callback === "function") callback(payload.new);
      },
    )
    .subscribe();
}

export function unsubscribe(channel) {
  if (!supabaseClient || !channel) return;
  try {
    channel.unsubscribe();
  } catch (e) {
    console.warn("Error unsubscribing realtime channel", e);
  }
}
