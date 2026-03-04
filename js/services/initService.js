/** Orquestación de la carga inicial de la app pública */

import { ensureClient } from "../api/supabaseClient.js";
import { loadConfig } from "./configService.js";
import { appStore } from "../../js/store/appStore.js";

export async function iniciar() {
  try {
    // Verificar que el cliente Supabase esté disponible (lanzará si no lo está)
    ensureClient();
    const config = await loadConfig();

    return {
      success: true,
      config: config,
    };
  } catch (error) {
    throw new Error(`Error al inicializar: ${error.message}`);
  }
}
