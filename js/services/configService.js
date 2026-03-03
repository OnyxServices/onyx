/** Servicio de configuración: usa la API genérica y aplica reglas de negocio */

import {
  getAll as configGetAll,
  update as configUpdate,
} from "../api/configApi.js";
import { appStore } from "../store/appStore.js";

export async function loadConfig() {
  const resp = await configGetAll({ limit: 1 });
  const data = resp?.data;
  const config = Array.isArray(data) ? data[0] : (data ?? {});
  appStore.tasaCambio = config.exchange_rate ?? 0;
  appStore.cuentaZelle = config.zelle_cuenta ?? "pago@fastcuba.com";
  appStore.propietarioZelle = config.zelle_owner ?? "";

  // Actualizar DOM si existe
  const zelleAcc = document.getElementById("zelle-account");
  const zelleOwner = document.getElementById("zelle-owner");
  const zelleOwnerContainer = document.getElementById("zelle-owner-container");
  const homeTasaVal = document.getElementById("home-value-rate");

  if (zelleAcc) zelleAcc.textContent = appStore.cuentaZelle;
  if (zelleOwner) zelleOwner.textContent = appStore.propietarioZelle;
  if (zelleOwnerContainer) {
    zelleOwnerContainer.style.display = appStore.propietarioZelle
      ? "flex"
      : "none";
  }
  if (homeTasaVal) homeTasaVal.textContent = `${appStore.tasaCambio} CUP`;

  return {
    tasaCambio: appStore.tasaCambio,
    cuentaZelle: appStore.cuentaZelle,
    propietarioZelle: appStore.propietarioZelle,
  };
}

export async function updateConfig(id, payload) {
  // Validaciones de negocio: asegurar tipos mínimos
  const body = {
    exchange_rate:
      typeof payload.exchange_rate === "number"
        ? payload.exchange_rate
        : parseFloat(payload.exchange_rate) || 0,
    zelle_cuenta: (payload.zelle_cuenta || "").trim(),
    zelle_owner: (payload.zelle_owner || "").trim(),
  };
  const updated = await configUpdate(id, body);
  // Refrescar store/DOM
  await loadConfig();
  return updated;
}
