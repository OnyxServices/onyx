/** Componente UI: Gráficos informativos del panel */

import { calcularGraficosData } from "../../services/panelChartsService.js";

export async function cargarGraficos() {
  const data = await calcularGraficosData();

  // Actualizar gráficos del día
  const chartDayQty = document.getElementById("chart-day-qty");
  const chartDayUsd = document.getElementById("chart-day-usd");
  const chartDayCup = document.getElementById("chart-day-cup");

  if (chartDayQty) chartDayQty.innerText = data.dia.cantidad;
  if (chartDayUsd) chartDayUsd.innerText = `$${data.dia.usd.toFixed(2)}`;
  if (chartDayCup)
    chartDayCup.innerText = `${data.dia.cup.toLocaleString("es-CU")} CUP`;

  // Actualizar gráficos del mes
  const chartMonthQty = document.getElementById("chart-month-qty");
  const chartMonthUsd = document.getElementById("chart-month-usd");
  const chartMonthCup = document.getElementById("chart-month-cup");

  if (chartMonthQty) chartMonthQty.innerText = data.mes.cantidad;
  if (chartMonthUsd) chartMonthUsd.innerText = `$${data.mes.usd.toFixed(2)}`;
  if (chartMonthCup)
    chartMonthCup.innerText = `${data.mes.cup.toLocaleString("es-CU")} CUP`;

  // Promedio diario
  const chartAvgDay = document.getElementById("chart-avg-day");
  if (chartAvgDay) chartAvgDay.innerText = `${data.mes.promedioDia} tx/día`;

  // Proyección de mes
  const chartProjection = document.getElementById("chart-projection");
  if (chartProjection)
    chartProjection.innerText = `$${data.mes.proyeccionMes.toFixed(2)}`;
}
