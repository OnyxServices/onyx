/** Métricas del panel (resumen diario) */

import { listTransactions } from "../services/transactionService.js";

export async function cargarMetricas() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { data: txs } = await listTransactions({
    state: "approved",
    from: hoy.toISOString(),
    pageSize: null,
  });

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
