/** API de transacciones - CRUD genérico para la tabla `transacciones` */

import { supabaseClient, ensureClient } from "./supabaseClient.js";

export async function getAll(filters = {}) {
  ensureClient();
  const {
    search = "",
    state = null,
    from = null,
    to = null,
    page = null,
    pageSize = null,
    orderBy = { column: "creation_date", ascending: false },
  } = filters || {};

  let query = supabaseClient.from("transacciones").select("*", {
    count: "exact",
  });

  if (search) {
    query = query.or(
      `sender_whatsapp.ilike.%${search}%,recipient_whatsapp.ilike.%${search}%`,
    );
  }
  if (state && state !== "todos") query = query.eq("state", state);
  if (from) query = query.gte("creation_date", from);
  if (to) query = query.lte("creation_date", to + "T23:59:59");

  query = query.order(orderBy.column, { ascending: orderBy.ascending });

  // Si pageSize es null/undefined no aplicar paginación (traer todos)
  if (page !== null && pageSize !== null) {
    const fromIdx = page * pageSize;
    const toIdx = fromIdx + pageSize - 1;
    const result = await query.range(fromIdx, toIdx);
    if (result.error) throw result.error;
    return { data: result.data ?? [], count: result.count ?? 0 };
  }

  const result = await query;
  if (result.error) throw result.error;
  return { data: result.data ?? [], count: result.count ?? 0 };
}

export async function getById(id) {
  ensureClient();
  const res = await supabaseClient
    .from("transacciones")
    .select("*")
    .eq("id", id)
    .single();
  if (res.error) throw res.error;
  return res.data;
}

export async function create(record) {
  ensureClient();
  const res = await supabaseClient
    .from("transacciones")
    .insert([record])
    .select()
    .single();
  if (res.error) throw res.error;
  return res.data;
}

export async function update(id, changes) {
  ensureClient();
  const res = await supabaseClient
    .from("transacciones")
    .update(changes)
    .eq("id", id)
    .select()
    .single();
  if (res.error) throw res.error;
  return res.data;
}

async function _delete(id) {
  ensureClient();
  const res = await supabaseClient
    .from("transacciones")
    .delete()
    .eq("id", id)
    .single();
  if (res.error) throw res.error;
  return res.data;
}

export { _delete as delete };
