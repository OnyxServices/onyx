/**
 * ORQUESTRADOR: Coordina la configuración del panel
 *
 * Responsabilidades:
 * - Mantener estado local (configId)
 * - Llamar a servicios
 * - Manejar errores
 * - Llamar a UI pasiva
 */

import { loadConfig, updateConfig } from "../services/configService.js";
import { getPanelToast } from "../ui/utils/panelToast.js";
import { validateZelleUS } from "../validators/formValidators.js";
import {
  updateConfigUI,
  showErrorConfig,
  showSuccessConfig,
  highlightError,
  clearError,
} from "../ui/components/panel/panelConfig.js";

// ESTADO LOCAL
let configId = 2;

/**
 * Orquesta la carga de configuración
 */
export async function orchestrateLoadConfig() {
  try {
    const config = await loadConfig();
    updateConfigUI(config);

    // limpiar posibles errores visuales al recargar
    clearError("tasa_cambio");
    clearError("zelle_cuenta");
    clearError("zelle_owner");
  } catch (error) {
    console.error("❌ Error cargando configuración:", error);
    showErrorConfig("Error al cargar datos");
  }
}

/**
 * Orquesta la actualización de configuración
 */
export async function orchestrateUpdateConfig(refreshAll) {
  const tasa = parseFloat(document.getElementById("tasa_cambio")?.value);
  const zelle = (document.getElementById("zelle_cuenta")?.value ?? "").trim();
  const owner = (document.getElementById("zelle_owner")?.value ?? "").trim();

  // Validar campos obligatorios
  if (isNaN(tasa)) {
    showErrorConfig("La tasa de cambio es obligatoria");
    highlightError("tasa_cambio");
    return;
  }
  clearError("tasa_cambio");

  if (!owner) {
    showErrorConfig("El propietario de Zelle es obligatorio");
    highlightError("zelle_owner");
    return;
  }
  clearError("zelle_owner");

  // Validar Zelle
  const zelleValidation = validateZelleUS(zelle);
  if (!zelleValidation.valid) {
    showErrorConfig(zelleValidation.message);
    highlightError("zelle_cuenta");
    return;
  }

  // Limpiar error visual
  clearError("zelle_cuenta");

  try {
    await updateConfig(configId, {
      exchange_rate: tasa,
      zelle_cuenta: zelle,
      zelle_owner: owner,
    });

    showSuccessConfig("Configuración guardada");
    if (typeof refreshAll === "function") await refreshAll();
  } catch (error) {
    console.error("❌ Error al actualizar:", error);
    showErrorConfig(error.message || "Error al actualizar");
  }
}
