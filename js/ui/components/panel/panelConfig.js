/** Componente UI: Configuración del panel (tasa Zelle) */

import { loadConfig, updateConfig } from "../../../services/configService.js";
import { getPanelToast } from "../../utils/panelToast.js";
import { validateZelleUS } from "../../../validators/formValidators.js";

let configId = 2; // TODO: Esto debería venir dinámicamente o ser una constante global

/**
 * Carga la configuración y actualiza los campos del formulario.
 */
export async function cargarTasa() {
  try {
    const config = await loadConfig();

    // Actualizar Inputs
    const tasaEl = document.getElementById("tasa_cambio");
    const zelleEl = document.getElementById("zelle_cuenta");
    const ownerEl = document.getElementById("zelle_owner");

    if (tasaEl) tasaEl.value = config.tasaCambio;
    if (zelleEl) zelleEl.value = config.cuentaZelle || "";
    if (ownerEl) ownerEl.value = config.propietarioZelle || "";
  } catch (err) {
    console.error("Error cargando configuración:", err);
    const Toast = getPanelToast();
    if (Toast) Toast.fire({ icon: "error", title: "Error cargando datos" });
  }
}

export async function actualizarConfig(refreshAll) {
  const tasa = parseFloat(document.getElementById("tasa_cambio")?.value);
  const zelle = (document.getElementById("zelle_cuenta")?.value ?? "").trim();
  const owner = (document.getElementById("zelle_owner")?.value ?? "").trim();
  const Toast = getPanelToast();

  const zelleValidation = validateZelleUS(zelle);
  if (!zelleValidation.valid) {
    if (Toast) Toast.fire({ icon: "error", title: zelleValidation.message });
    const zelleEl = document.getElementById("zelle_cuenta");
    if (zelleEl) zelleEl.style.borderColor = "var(--error, #ef4444)";
    return;
  }

  const zelleEl = document.getElementById("zelle_cuenta");
  if (zelleEl) zelleEl.style.borderColor = "";

  try {
    await updateConfig(configId, {
      exchange_rate: tasa,
      zelle_cuenta: zelle,
      zelle_owner: owner,
    });

    if (Toast) Toast.fire({ icon: "success", title: "Configuración guardada" });
    if (typeof refreshAll === "function") await refreshAll();
  } catch (err) {
    console.error(err);
    if (Toast)
      Toast.fire({
        icon: "error",
        title: err.message || "Error al actualizar",
      });
  }
}
