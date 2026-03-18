/**
 * COMPONENTE UI: Gráficos informativos del panel
 *
 * SOLO funciones PASIVAS que:
 * - Reciben datos por parámetros
 * - Actualizan el DOM
 * - NO hacen llamadas a servicios
 * - NO manejan errores de red
 *
 * La orquestación (servicios) va en panelChartsController.js
 */

/**
 * Función PASIVA: Renderiza gráficos con datos
 * @param {Object} data - Datos de gráficos { day: {...}, month: {...} }
 */
export function renderCharts(data) {
  if (!data) return;

  // Actualizar gráficos del día
  const chartDayQty = document.getElementById("chart-day-qty");
  const chartDayUsd = document.getElementById("chart-day-usd");
  const chartDayCup = document.getElementById("chart-day-cup");

  if (chartDayQty) chartDayQty.innerText = data.day.numberOperations;
  if (chartDayUsd) chartDayUsd.innerText = `$${data.day.usd.toFixed(2)}`;
  if (chartDayCup)
    chartDayCup.innerText = `${data.day.cup.toLocaleString("es-CU")} CUP`;

  // Actualizar gráficos del mes
  const chartMonthQty = document.getElementById("chart-month-qty");
  const chartMonthUsd = document.getElementById("chart-month-usd");
  const chartMonthCup = document.getElementById("chart-month-cup");

  if (chartMonthQty) chartMonthQty.innerText = data.month.numberOperations;
  if (chartMonthUsd) chartMonthUsd.innerText = `$${data.month.usd.toFixed(2)}`;
  if (chartMonthCup)
    chartMonthCup.innerText = `${data.month.cup.toLocaleString("es-CU")} CUP`;

  // Promedio diario
  const chartAvgDay = document.getElementById("chart-avg-day");
  if (chartAvgDay) chartAvgDay.innerText = `${data.month.avg} tx/día`;

  // Proyección de mes
  const chartProjection = document.getElementById("chart-projection");
  if (chartProjection)
    chartProjection.innerText = `$${data.month.projection.toFixed(2)}`;
}

/**
 * Función PASIVA: Muestra error en gráficos
 */
export function showChartsError() {
  // Puedes mostrar un mensaje genérico o dejar los gráficos vacíos
  console.log("Error cargando gráficos");
}
