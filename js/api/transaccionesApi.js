/** API de transacciones */

import { supabaseClient } from "./client.js";

export async function getByWhatsApp(whatsapp, limit = 5) {
  if (!supabaseClient) {
    return { data: null, error: new Error("Cliente Supabase no disponible") };
  }
  const result = await supabaseClient
    .from("transacciones")
    .select("*")
    .eq("recipient_whatsapp", whatsapp)
    .limit(limit);
  return { data: result.data, error: result.error };
}

export async function create(transaccion) {
  if (!supabaseClient) {
    return { error: new Error("Cliente Supabase no disponible") };
  }
  return supabaseClient.from("transacciones").insert([transaccion]);
}

export async function updateState(id, state) {
  if (!supabaseClient) {
    return { error: new Error("Cliente Supabase no disponible") };
  }
  return supabaseClient.from("transacciones").update({ state }).eq("id", id);
}

export async function listTransacciones(filters = {}) {
  if (!supabaseClient) {
    return { data: [], count: 0, error: new Error("Cliente Supabase no disponible") };
  }
  const {
    search = "",
    state = "todos",
    from = "",
    to = "",
    page = 0,
    pageSize = 10,
  } = filters;

  let query = supabaseClient.from("transacciones").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `sender_name.ilike.%${search}%,recipient_name.ilike.%${search}%`
    );
  }
  if (state !== "todos") {
    query = query.eq("state", state);
  }
  if (from) query = query.gte("creation_date", from);
  if (to) query = query.lte("creation_date", to + "T23:59:59");

  const fromIdx = page * pageSize;
  const toIdx = fromIdx + pageSize - 1;
  const result = await query
    .order("creation_date", { ascending: false })
    .range(fromIdx, toIdx);

  return {
    data: result.data ?? [],
    count: result.count ?? 0,
    error: result.error,
  };
}

export async function deleteAll() {
  if (!supabaseClient) {
    return { error: new Error("Cliente Supabase no disponible") };
  }
  return supabaseClient.from("transacciones").delete().neq("id", 0);
}

export async function insertLog(log) {
  if (!supabaseClient) {
    return { error: new Error("Cliente Supabase no disponible") };
  }
  return supabaseClient.from("logs_operacion").insert([log]);
}
