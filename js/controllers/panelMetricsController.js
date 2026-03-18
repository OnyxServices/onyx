/**
 * ORQUESTRADOR: Coordina las métricas del panel
 *
 * Responsabilidades:
 * - Llamar al servicio de cálculo
 * - Manejar errores
 * - Llamar a UI pasiva
 */

import { calcularMetricasDia } from "../services/panelMetricsService.js";
import {
  renderMetrics,
  showMetricsError,
} from "../ui/components/panel/panelMetrics.js";

/**
 * Orquesta la carga de métricas
 */
export async function orchestrateLoadMetrics() {
  try {
    const data = await calcularMetricasDia();
    renderMetrics(data);
  } catch (error) {
    console.error("❌ Error cargando métricas:", error);
    showMetricsError();
  }
}
