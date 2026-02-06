/** Configuración del panel: tasa y Zelle */

import { getConfig } from "../api/configApi.js";
import { updateConfig } from "../api/configApi.js";
import { getPanelToast } from "./toast.js";
import { validateZelleUS } from "../validators/formValidators.js";

let configId = 1;

export async function cargarTasa() {
  const { data } = await getConfig();
  if (data) {
    const tasaEl = document.getElementById("tasa_cambio");
    const zelleEl = document.getElementById("zelle_cuenta");
    const ownerEl = document.getElementById("zelle_owner");
    if (tasaEl) tasaEl.value = data.exchange_rate;
    if (zelleEl) zelleEl.value = data.zelle_cuenta || "";
    if (ownerEl) ownerEl.value = data.zelle_owner || "";
    configId = data.id;
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

  const { error } = await updateConfig(configId, {
    exchange_rate: tasa,
    zelle_cuenta: zelle,
    zelle_owner: owner,
  });

  if (error) {
    if (Toast) Toast.fire({ icon: "error", title: "Error al actualizar" });
  } else {
    if (Toast) Toast.fire({ icon: "success", title: "Configuración guardada" });
    if (typeof refreshAll === "function") await refreshAll();
  }
}
