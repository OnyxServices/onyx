/** Servicio de configuración: carga config desde API y actualiza store + DOM */

import { getConfig } from "../api/configApi.js";
import { appStore } from "../store/appStore.js";

export async function loadConfig() {
  const { data, error } = await getConfig();
  if (error) throw error;

  const config = data ?? {};
  appStore.tasaCambio = config.exchange_rate ?? 0;
  appStore.cuentaZelle = config.zelle_cuenta ?? "pago@fastcuba.com";

  // Actualizar DOM si existe
  const zelleAcc = document.getElementById("zelle-account");
  const homeTasaVal = document.getElementById("home-value-rate");
  if (zelleAcc) zelleAcc.textContent = appStore.cuentaZelle;
  if (homeTasaVal) homeTasaVal.textContent = `${appStore.tasaCambio} CUP`;

  return { tasaCambio: appStore.tasaCambio, cuentaZelle: appStore.cuentaZelle };
}
