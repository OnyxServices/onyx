/** Servicio de gráficos del panel: cálculos de día y mes */

import { listTransactions } from "./transactionService.js";
import { getAll as getConfigAll } from "../api/configApi.js";

export async function calcularGraficosData() {
  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const endDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );

  // Datos del día
  const todayData = await listTransactions({
    state: "approved",
    from: startDay.toISOString(),
    to: endDay.toISOString(),
    pageSize: null,
  });
  const txToday = todayData.data || [];

  // Datos del mes
  const respMes = await listTransactions({
    state: "approved",
    from: startMonth.toISOString(),
    to: endDay.toISOString(),
    pageSize: null,
  });
  const txMonth = respMes.data || [];

  const cfgResp = await getConfigAll({ limit: 1 });
  let exchangeRate = 24;
  if (cfgResp && cfgResp.data) {
    const cfg = cfgResp.data;
    exchangeRate = Array.isArray(cfg)
      ? cfg[0]?.exchange_rate || 24
      : cfg.exchange_rate || 24;
  }

  // Calcular totales del día
  const totalUsdToday = (txToday || []).reduce(
    (sum, tx) => sum + (tx.usd_amount || 0),
    0,
  );
  const totalCupToday = totalUsdToday * exchangeRate;
  const numberOperationsToday = (txToday || []).length;

  // Calcular totales del mes
  const totalUsdMonth = (txMonth || []).reduce(
    (sum, tx) => sum + (tx.usd_amount || 0),
    0,
  );
  const totalCupMonth = totalUsdMonth * exchangeRate;
  const numberOperationsMonth = (txMonth || []).length;

  // Calcular promedio diario
  const todayAVG =
    numberOperationsMonth > 0
      ? (numberOperationsMonth / today.getDate()).toFixed(1)
      : 0;

  // Proyección de mes
  const monthProjection = Math.round((totalUsdMonth / today.getDate()) * 30);

  return {
    day: {
      numberOperations: numberOperationsToday,
      usd: totalUsdToday,
      cup: totalCupToday,
    },
    month: {
      numberOperations: numberOperationsMonth,
      usd: totalUsdMonth,
      cup: totalCupMonth,
      avg: todayAVG,
      projection: monthProjection,
    },
  };
}
