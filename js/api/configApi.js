/** API de configuración - CRUD genérico para la tabla `config` */

import { ensureClient, supabaseClient } from "./supabaseClient.js";

export async function getAll(filters = {}) {
  ensureClient();
  const { limit = null } = filters || {};
  const query = supabaseClient.from("config").select("*");
  let result;
  if (limit === 1) {
    result = await query.limit(1).single();
    if (result.error) throw result.error;
    return { data: result.data };
  }
  result = await query;
  if (result.error) throw result.error;
  return { data: result.data ?? [] };
}

export async function getById(id) {
  ensureClient();
  const res = await supabaseClient
    .from("config")
    .select("*")
    .eq("id", id)
    .single();
  if (res.error) throw res.error;
  return res.data;
}

export async function create(data) {
  ensureClient();
  const result = await supabaseClient.from("config").insert([data]).single();
  if (result.error) throw result.error;
  return result.data;
}

export async function update(id, data) {
  ensureClient();
  const result = await supabaseClient
    .from("config")
    .update(data)
    .eq("id", id)
    .single();
  if (result.error) throw result.error;
  return result.data;
}

async function _delete(id) {
  ensureClient();
  const result = await supabaseClient
    .from("config")
    .delete()
    .eq("id", id)
    .single();
  if (result.error) throw result.error;
  return result.data;
}

export { _delete as delete };
