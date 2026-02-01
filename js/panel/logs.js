/** Logs de auditoría */

import { supabaseClient } from "../api/client.js";

export async function cargarLogs() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient
    .from("logs_operacion")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(30);
  const tbody = document.getElementById("cuerpo-logs");
  if (!tbody) return;
  tbody.innerHTML = (data || [])
    .map(
      (l) => `
      <tr>
        <td>${new Date(l.fecha).toLocaleString()}</td>
        <td>#${l.transaccion_id}</td>
        <td>${l.accion}</td>
        <td>${l.usuario_admin}</td>
        <td>${l.comentario}</td>
      </tr>
    `
    )
    .join("");
}
