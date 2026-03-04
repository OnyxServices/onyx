/** Componente UI: Métricas del panel (resumen diario) */

import { calcularMetricasDia } from "../../../services/panelMetricsService.js";

export async function cargarMetricas() {
  const data = await calcularMetricasDia();

  const cantidadEl = document.getElementById("m-cantidad");
  const usdEl = document.getElementById("m-usd-recibido");
  const cupEl = document.getElementById("m-cup-entregado");

  if (cantidadEl) cantidadEl.innerText = data.cantidad;
  if (usdEl) usdEl.innerText = `$${data.usd.toFixed(2)}`;
  if (cupEl) cupEl.innerText = data.cup.toLocaleString("es-CU") + " CUP";
}
