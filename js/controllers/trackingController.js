/**
 * ORQUESTRADOR: Coordina la lógica de rastreo de transacciones
 *
 * Responsabilidades:
 * - Capturar búsqueda del usuario
 * - Llamar al servicio de búsqueda
 * - Manejar errores de red
 * - Llamar a funciones UI pasivas
 */

import { searchTransactions } from "../services/transactionService.js";
import { appStore } from "../store/appStore.js";
import {
  renderTrackingResults,
  renderTrackingEmpty,
  showSearchWarning,
  showSearchLoading,
} from "../ui/components/modalTracking.js";

/**
 * Orquesta el flujo de búsqueda: obtener entrada → servicio → UI
 */
export async function orchestrateSearchTransactions() {
  const busqueda = document.getElementById("search-input")?.value?.trim() ?? "";

  if (!busqueda) {
    showSearchWarning("Atención", "Ingresa tu número de WhatsApp.");
    return;
  }

  // Mostrar estado de carga
  showSearchLoading();

  try {
    // 1. Llamar al servicio (puro)
    const data = await searchTransactions(busqueda);

    // 2. Renderizar resultados con UI pasiva
    if (!data || data.length === 0) {
      renderTrackingEmpty();
    } else {
      renderTrackingResults(data, appStore.tasaCambio);
    }
  } catch (error) {
    console.error("❌ Error al buscar transacciones:", error);
    renderTrackingEmpty(error.message);
  }
}
