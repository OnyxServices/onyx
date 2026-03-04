/**
 * COMPONENTE UI: Métricas del panel (resumen diario)
 *
 * SOLO funciones PASIVAS que:
 * - Reciben datos por parámetros
 * - Actualizan el DOM
 * - NO hacen llamadas a servicios
 * - NO manejan errores de red
 *
 * La orquestación (servicios) va en panelMetricsController.js
 */

/**
 * Función PASIVA: Renderiza métricas con datos
 * @param {Object} data - Datos de métricas { cantidad, usd, cup }
 */
export function renderMetrics(data) {
  if (!data) return;

  const cantidadEl = document.getElementById("m-cantidad");
  const usdEl = document.getElementById("m-usd-recibido");
  const cupEl = document.getElementById("m-cup-entregado");

  if (cantidadEl) cantidadEl.innerText = data.cantidad;
  if (usdEl) usdEl.innerText = `$${data.usd.toFixed(2)}`;
  if (cupEl) cupEl.innerText = data.cup.toLocaleString("es-CU") + " CUP";
}

/**
 * Función PASIVA: Muestra error en métricas
 */
export function showMetricsError() {
  console.log("Error cargando métricas");
}
