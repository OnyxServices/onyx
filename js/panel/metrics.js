/** Métricas del panel (resumen diario) */

import { supabaseClient } from "../api/client.js";

export async function cargarMetricas() {
  if (!supabaseClient) return;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { data: txs } = await supabaseClient
    .from("transacciones")
    .select("usd_amount, exchange_rate")
    .eq("state", "approved")
    .gte("creation_date", hoy.toISOString());

  if (!txs) return;
  let usd = 0;
  let cup = 0;
  txs.forEach((tx) => {
    usd += parseFloat(tx.usd_amount) || 0;
    cup +=
      (parseFloat(tx.usd_amount) || 0) * (parseFloat(tx.exchange_rate) || 0);
  });

  const cantidadEl = document.getElementById("m-cantidad");
  const usdEl = document.getElementById("m-usd-recibido");
  const cupEl = document.getElementById("m-cup-entregado");
  if (cantidadEl) cantidadEl.innerText = txs.length;
  if (usdEl) usdEl.innerText = `$${usd.toFixed(2)}`;
  if (cupEl) cupEl.innerText = cup.toLocaleString("es-CU") + " CUP";
}
