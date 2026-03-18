/** Servicio de métricas del panel (resumen diario) */

import { listTransactions } from "./transactionService.js";

export async function calcularMetricasDia() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { data: txs } = await listTransactions({
    state: "approved",
    from: hoy.toISOString(),
    pageSize: null,
  });

  if (!txs) {
    return {
      cantidad: 0,
      usd: 0,
      cup: 0,
    };
  }

  let usd = 0;
  let cup = 0;
  txs.forEach((tx) => {
    usd += parseFloat(tx.usd_amount) || 0;
    cup +=
      (parseFloat(tx.usd_amount) || 0) * (parseFloat(tx.exchange_rate) || 0);
  });

  return {
    cantidad: txs.length,
    usd,
    cup,
  };
}
