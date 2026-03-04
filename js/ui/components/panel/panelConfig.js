/**
 * COMPONENTE UI: Configuración del panel (tasa Zelle)
 *
 * SOLO funciones PASIVAS que:
 * - Reciben datos por parámetros
 * - Actualizan el DOM
 * - NO hacen llamadas a servicios
 * - NO manejan errores de red
 *
 * La orquestación (servicios + estado) va en panelConfigController.js
 */

import { getPanelToast } from "../../utils/panelToast.js";

/**
 * Función PASIVA: Actualiza los campos del formulario con configuración
 * @param {Object} config - Datos de configuración { tasaCambio, cuentaZelle, propietarioZelle }
 */
export function updateConfigUI(config) {
  if (!config) return;

  const tasaEl = document.getElementById("tasa_cambio");
  const zelleEl = document.getElementById("zelle_cuenta");
  const ownerEl = document.getElementById("zelle_owner");

  if (tasaEl) tasaEl.value = config.tasaCambio;
  if (zelleEl) zelleEl.value = config.cuentaZelle || "";
  if (ownerEl) ownerEl.value = config.propietarioZelle || "";
}

/**
 * Función PASIVA: Muestra error de configuración
 * @param {string} mensaje - Mensaje de error
 */
export function showErrorConfig(mensaje) {
  const Toast = getPanelToast();
  if (Toast) Toast.fire({ icon: "error", title: mensaje });
}

/**
 * Función PASIVA: Muestra éxito de configuración
 * @param {string} mensaje - Mensaje de éxito
 */
export function showSuccessConfig(mensaje) {
  const Toast = getPanelToast();
  if (Toast) Toast.fire({ icon: "success", title: mensaje });
}

/**
 * Función PASIVA: Resalta error en campo
 * @param {string} fieldId - ID del campo
 */
export function highlightError(fieldId) {
  const el = document.getElementById(fieldId);
  if (el) el.style.borderColor = "var(--error, #ef4444)";
}

/**
 * Función PASIVA: Limpia error visual en campo
 * @param {string} fieldId - ID del campo
 */
export function clearError(fieldId) {
  const el = document.getElementById(fieldId);
  if (el) el.style.borderColor = "";
}
