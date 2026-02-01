/** API de configuración (tasa, cuenta Zelle) */

import { supabaseClient } from "./client.js";

export async function getConfig() {
  if (!supabaseClient) {
    return { data: null, error: new Error("Cliente Supabase no disponible") };
  }
  const result = await supabaseClient
    .from("config")
    .select("*")
    .limit(1)
    .single();
  return { data: result.data, error: result.error };
}

export async function updateConfig(id, { exchange_rate, zelle_cuenta }) {
  if (!supabaseClient) {
    return { error: new Error("Cliente Supabase no disponible") };
  }
  return supabaseClient
    .from("config")
    .update({ exchange_rate, zelle_cuenta })
    .eq("id", id);
}
