/** Servicio de gráficos del panel: cálculos de día y mes */

import { listTransactions } from "./transactionService.js";
import { getAll as getConfigAll } from "../api/configApi.js";

export async function calcularGraficosData() {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);

  // Datos del día
  const respHoy = await listTransactions({
    state: "approved",
    from: inicioHoy.toISOString(),
    to: finHoy.toISOString(),
    pageSize: null,
  });
  const txHoy = respHoy.data || [];

  // Datos del mes
  const respMes = await listTransactions({
    state: "approved",
    from: inicioMes.toISOString(),
    to: finHoy.toISOString(),
    pageSize: null,
  });
  const txMes = respMes.data || [];

  const cfgResp = await getConfigAll({ limit: 1 });
  let tasa = 24;
  if (cfgResp && cfgResp.data) {
    const cfg = cfgResp.data;
    tasa = Array.isArray(cfg)
      ? cfg[0]?.exchange_rate || 24
      : cfg.exchange_rate || 24;
  }

  // Calcular totales del día
  const totalUsdHoy = (txHoy || []).reduce(
    (sum, tx) => sum + (tx.usd_amount || 0),
    0,
  );
  const totalCupHoy = totalUsdHoy * tasa;
  const cantidadHoy = (txHoy || []).length;

  // Calcular totales del mes
  const totalUsdMes = (txMes || []).reduce(
    (sum, tx) => sum + (tx.usd_amount || 0),
    0,
  );
  const totalCupMes = totalUsdMes * tasa;
  const cantidadMes = (txMes || []).length;

  // Calcular promedio diario
  const promedioDia =
    cantidadMes > 0 ? (cantidadMes / hoy.getDate()).toFixed(1) : 0;

  // Proyección de mes
  const proyeccionMes = Math.round((totalUsdMes / hoy.getDate()) * 30);

  return {
    dia: {
      cantidad: cantidadHoy,
      usd: totalUsdHoy,
      cup: totalCupHoy,
    },
    mes: {
      cantidad: cantidadMes,
      usd: totalUsdMes,
      cup: totalCupMes,
      promedioDia,
      proyeccionMes,
    },
  };
}
