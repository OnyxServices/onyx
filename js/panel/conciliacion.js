/** Conciliación diaria */

import { supabaseClient } from "../api/client.js";
import { getPanelToast } from "./toast.js";

export async function cargarConciliacion() {
  if (!supabaseClient) return;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { data: txs } = await supabaseClient
    .from("transacciones")
    .select("usd_amount")
    .eq("state", "approved")
    .gte("creation_date", hoy.toISOString());
  const totalSistema = (txs || []).reduce(
    (acc, curr) => acc + (parseFloat(curr.usd_amount) || 0),
    0
  );
  const concConfirmado = document.getElementById("conc-confirmado");
  if (concConfirmado) concConfirmado.value = totalSistema.toFixed(2);

  const { data: registros } = await supabaseClient
    .from("conciliacion_diaria")
    .select("*")
    .order("fecha", { ascending: false });
  const tbody = document.getElementById("cuerpo-conciliacion");
  if (!tbody) return;
  tbody.innerHTML = (registros || [])
    .map(
      (r) => `
      <tr>
        <td>${r.fecha}</td>
        <td>$${r.total_confirmado}</td>
        <td>$${r.total_banco}</td>
        <td style="color:${r.diferencia < 0 ? "red" : "green"}">$${r.diferencia}</td>
        <td><small>${r.observaciones || "-"}</small></td>
      </tr>
    `
    )
    .join("");
}

export async function guardarConciliacion() {
  if (!supabaseClient) return;
  const payload = {
    fecha: new Date().toISOString().split("T")[0],
    total_confirmado: parseFloat(
      document.getElementById("conc-confirmado")?.value ?? 0
    ),
    total_banco: parseFloat(document.getElementById("conc-banco")?.value ?? 0),
    observaciones: document.getElementById("conc-obs")?.value ?? "",
  };
  payload.diferencia = payload.total_banco - payload.total_confirmado;
  await supabaseClient.from("conciliacion_diaria").upsert(payload);
  const Toast = getPanelToast();
  if (Toast) Toast.fire({ icon: "success", title: "Día cerrado" });
  cargarConciliacion();
}
