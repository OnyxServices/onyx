/**
 * ORQUESTRADOR: Coordina los gráficos del panel
 *
 * Responsabilidades:
 * - Llamar al servicio de cálculo
 * - Manejar errores
 * - Llamar a UI pasiva
 */

import { calcularGraficosData } from "../services/panelChartsService.js";
import {
  renderCharts,
  showChartsError,
} from "../ui/components/panel/panelCharts.js";

/**
 * Orquesta la carga de gráficos
 */
export async function orchestrateLoadCharts() {
  try {
    const data = await calcularGraficosData();
    renderCharts(data);
  } catch (error) {
    console.error("❌ Error cargando gráficos:", error);
    showChartsError();
  }
}
